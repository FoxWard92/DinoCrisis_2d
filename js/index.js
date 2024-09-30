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
  
  let statoslides = 1;

window.viewchange = function(){
    console.log('ciao')
    const step = [[0,110],[0,-100],[45,125],[0,-10]];
    const schede = document.getElementsByClassName('scheda');

    for( var i = 0; i < schede.length;i++){
        if(i == n){
            schede[i].classList.add('schedaLoaded');

            schede[i].style.transform = `translateX(${step[0][statoslides]}%)`
        }else{
            schede[i].classList.remove('schedaLoaded');
        }

    }

    document.getElementById('loadbar') .style.transform = `translateX(${step[1][statoslides]}%)`
    document.getElementById('panellonero').style.left = `${step[3][statoslides]}%`;
    document.getElementById('panellonero').style.rotate = `${step[2][statoslides]}deg`;
    statoslides = statoslides? 0:1;
}

window.utenti = async function(){

    const utente = document.getElementById('nome');
    const password = document.getElementById('password');
    const loadbar = document.getElementById('loadbar');

    password.classList.remove('wrong');
    utente.classList.remove('wrong');

    loadbar.classList.add('atload');
    
    if(z){
       if((await getDataForNode(utente.value)) == 1){
        const data = JSON.parse(localStorage.getItem(utente.value));
        if(data.dati.password == password.value){
            localStorage.setItem('utente',utente.value);
            window.location.href = '../html/tool/interfaccia.html'
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
    loadbar.classList.remove('atload');
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