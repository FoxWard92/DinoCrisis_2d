import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCHz94SZ-y1riPeFsh5RgoABVrDWqHNxC0",
    authDomain: "dino-crisis-57eef.firebaseapp.com",
    databaseURL: "https://dino-crisis-57eef-default-rtdb.firebaseio.com",
    projectId: "dino-crisis-57eef",
    storageBucket: "dino-crisis-57eef.appspot.com",
    messagingSenderId: "577840789616",
    appId: "1:577840789616:web:37d6fa0d70e1606a91dcb5",
    measurementId: "G-SHCZ9NRHH8"

  };

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);

  const database = getDatabase(app);
  
  let z = 1;

window.viewchange = function(){
        const elemento1 = document.getElementsByClassName('contenitore-scheda');
    const elemento2 = document.getElementsByClassName('scheda');
    elemento2[0].style.transform = `translateX(${100*z}%)`;
    for (let i = 0; i < 45 ;i++) {
        setTimeout(function() {
            elemento1[0].style.background = `linear-gradient(${i*(z ? 1:-1)}deg,transparent  0% ,rgb(20,20,20) 70%)`;
        }, i * 20);
    }
    document.getElementById('changepage').innerText = z ? "<- Accedi":" Registarti ->";
    document.getElementById('send').innerText = z ? "Registarti":" Accedi";
    document.getElementById('conferma').style.display = z ? 'block' : 'none'
    z = z ? 0:1;
}

window.utenti = async function(){

    const utente = document.getElementById('nome');
    const password = document.getElementById('password');

    password.classList.remove('wrong');
    utente.classList.remove('wrong');

    if(z){
       if((await getDataForNode(utente.value)) == 1){
        const data = JSON.parse(localStorage.getItem(utente.value));
        console.log(data.dati.password)
        if(data.dati.password == password.value){
            localStorage.setItem('utente',utente.value);
            //esegui apri game
        }else{
            password.classList.add('wrong');
        }    
       }else{
        utente.classList.add('wrong');
       }
    }else{
        const confermapassworld =  document.getElementById('conferma');

        confermapassworld.classList.remove('wrong');
        
        if((await getDataForNode(utente.value)) == null){
            if((password.value != '')){
                if(password.value == confermapassworld.value){
                    const utenteogggeto = {
                        dati: {
                            password: password.value
                        },
                        saves: {
                            inventario: "",
                            scena: "",
                        }
                };
                await addElementToNode(`utenti/${utente.value}`,utenteogggeto);
                viewchange();
                }else{
                    confermapassworld.classList.add('wrong');
                }
            }else{
                password.classList.add('wrong');
            }
        }else{
            utente.classList.add('wrong');
        }
    }
}

window.getDataForNode = async function (nodeId) {
    const dbRef = ref(database, `utenti/${nodeId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            localStorage.setItem(nodeId,JSON.stringify(data));
            return 1
        } else {
            console.log(`No data found for node ${nodeId}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting data:", error);
        return null
    }
};

window.addElementToNode = async function (nodeId, elementData) {
    const dbRef = ref(database, `/${nodeId}`); // Riferimento alla sotto-cartella con nome dell'utente

    try {
        // Usa set() per sovrascrivere o creare dati in una chiave specifica
        await set(dbRef, elementData); // Imposta i dati dell'elemento senza generare una nuova chiave
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};