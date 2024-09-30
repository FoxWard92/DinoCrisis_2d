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

  let isRunningAnimation = false; 

window.viewchange = async function(n){
    let statoslides = n%2 != 0 ? 1:0;
    if(isRunningAnimation) return 0;
        const elemento1 = document.getElementsByClassName('contenitore-scheda');
        const schede = document.getElementsByClassName('scheda');
        const loadbar = document.getElementById('loadbar');
        for( let i = 0; i < schede.length;i++){
           if(i == n){
             setTimeout(function() {
                schede[i].style.display = 'flex';
            },800);
            schede[i].style.transform = `translateX(${(110)*statoslides}%)`
        }else{
            schede[i].style.transform = `translateX(${(110)*statoslides}%)`
            setTimeout(function(){
                schede[i].style.display = 'none';
            },800)
        }
    }
    loadbar.style.left = `${(statoslides*-50)}%`;
    changelineareg(elemento1[0],(statoslides ? 125:225),(statoslides ? 225:125));
    return 1
}

window.changelineareg = async function(background,degstart,degend){
    isRunningAnimation = true;
    let degdiff = degstart - degend;
    const step = Math.abs(degdiff);
    const angle = degdiff < 0 ? 1:-1;
    for(let i = 0; i <= step;i++){
        setTimeout(function() {
            background.style.background = `linear-gradient(${degstart+(i*angle)}deg,transparent  0% ,rgb(20,20,20) 70%)`;
            if(i === step){
                setTimeout(function() {
                    isRunningAnimation = false;
                }, 100);
            }
        }, i * 5);
    }
}

window.addDiv = function(container){
    const newDiv = document.createElement('div');
    newDiv.appendChild(document.createElement('h3'));
    container.appendChild(newDiv); 
}


window.utenti = async function(types){
    let schedeConDisplayFlex = Array.from(document.querySelectorAll('.scheda'))
    .filter(scheda => getComputedStyle(scheda).display === 'flex');

    const utente = schedeConDisplayFlex[0].querySelector('.nome');
    const password = schedeConDisplayFlex[0].querySelector('.password');
    const confermapassworld =  schedeConDisplayFlex[0].querySelector('.conferma');

    const loadbar = document.getElementById('loadbar');
    password.classList.remove('wrong');
    utente.classList.remove('wrong');
    loadbar.classList.add('atload');
    let percorso = 'utenti';
    if(types){
       if(utente.value != '' && (await getDataForNode(percorso,utente.value)) == 1){
        const data = JSON.parse(localStorage.getItem(utente.value));
        if(data.dati.password == password.value){
            localStorage.setItem('utente',utente.value);
            const container = document.getElementById('saves');
            for(var i = 0; i < Object.keys(data.saves).length;i++){
                addDiv(container);
                container.lastElementChild.querySelector('h3').innerText = data.saves['100' + i].nome
            }

            viewchange(2)
        }else{
            password.classList.add('wrong');
        }    
       }else{
        utente.classList.add('wrong');
       }
    }else{

        confermapassworld.classList.remove('wrong');
        
        if((await getDataForNode(percorso,utente.value)) == null){
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
                viewchange(0);
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

window.getDataForNode = async function (noneIdpadre,nodeId) {
    const dbRef = ref(database, `${noneIdpadre}/${nodeId}`);
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