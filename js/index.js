import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";

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
  
  let z = 0
  let deg = 0
  
window.onload = function(){
    viewchange(0)
}

window.viewchange = function(n){
    const arr = document.getElementsByClassName('sch');
    const step = [45,125,45];
    const elemento = document.getElementById('scheda');
    console.log(n)
    arr[z].style.display = 'none'
    arr[n].style.display = 'block '
    for (let i = deg; i < step[n]; i++) {
        setTimeout(function() {
            elemento.style.background = `linear-gradient(${i}deg, rgba(35, 35, 35, 0.900) 0% 20%, transparent 20% 80%, rgba(20, 20, 20, 0.900) 80% 100%)`;
        }, i * 5);
    }
    deg = step[n];
    z = n;
}

window.getDataForNode = async function (nodeId) {
    const dbRef = ref(database, `/${nodeId}`);
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
    const dbRef = ref(database, `/${nodeId}`); // Ottieni il riferimento alla sotto-cartella

    try {
        // Usa push() per aggiungere un nuovo elemento senza sovrascrivere
        const newElementRef = push(dbRef); // Crea un riferimento per un nuovo elemento
        await set(newElementRef, elementData); // Imposta i dati dell'elemento
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};