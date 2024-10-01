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

  const loadbar = document.getElementById('loadbar');
  
  const schede = document.getElementsByClassName('scheda');

  let isRunningAnimation = false;

  let statoslidespreviwew = false;

window.viewchange = async function(numero,statoslides,forzastato){
    if(isRunningAnimation && forzastato) return 0;
        const elemento1 = document.getElementsByClassName('contenitore-scheda');
        const loadbar = document.getElementById('loadbar');
        for( let i = 0; i < schede.length;i++){
           if(i == numero){
                schede[i].style.transform = `translateX(${(80)*statoslides}%)`
                setTimeout(function() {
                   schede[i].classList.add('schedaLoaded');
                },800);
        }else{
            schede[i].style.transform = `translateX(${(80)*statoslides}%)`
            setTimeout(function(){
                schede[i].classList.remove('schedaLoaded');
            },800);
        }
    }
    loadbar.style.left = `${(statoslides*-50)}%`;
    if(statoslides != statoslidespreviwew){
        statoslidespreviwew = statoslides;
        ChangeLinearGradient(elemento1[0],(statoslides ? 125:225),(statoslides ? 225:125));
    }
    return 1
}

window.ChangeLinearGradient = function(background,degstart,degend){
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

window.addSavesSlot = function(container){
    const newSlot = document.createElement('div');
    newSlot.appendChild(document.createElement('h3'));
    newSlot.appendChild(document.createElement('div'));
    const newSlotButton = newSlot.querySelector('div');
    newSlotButton.classList.add('space-coloum');
    
    for(var buttons = 0; buttons < 2;buttons++){
        newSlotButton.appendChild(document.createElement('button'));
        newSlotButton.lastElementChild.classList.add(buttons ? 'cancella-mondo':'carica-mondo');
    }
    
    container.appendChild(newSlot); 
}

window.WrongNome = function (nome,password,confermapassworld){
    
    nome.classList.add('wrong');

    setTimeout(function(){
        nome.classList.remove('wrong');
    },1000);

}

window.WrongPassword = function (nome,password,confermapassworld){

    password.classList.add('wrong');

    setTimeout(function(){
        password.classList.remove('wrong');
    },1000);

}

window.WrongPasswordConferma = function (nome,password,confermapassworld){

    confermapassworld.classList.add('wrong');

    setTimeout(function(){
        confermapassworld.classList.remove('wrong');
    },1000);

}

window.AccesoVerificato = async function (nome,password,confermapassworld){
    const container = document.getElementById('saves');
        const data = JSON.parse(localStorage.getItem(nome.value));
        localStorage.setItem('utente',nome.value);
        const numerosalvataggi = data.saves.mondi;
        if(numerosalvataggi){
            for(var i = 0; i < numerosalvataggi;i++){
                addSavesSlot(container);
                container.lastElementChild.querySelector('h3').innerText = data.saves['100' + i].nome
            }
        }else{
            document.getElementById('DivNuovaPartita').querySelector('h3').innerText = 'Dati Non Trovati';
        }
    viewchange(2,false,false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 1
}

window.RegistroVerificato = async function (nome,password,confermapassworld){
    if(password.value == ''){
        arrayDiFunzioni[1](nome,password,confermapassworld);
        return 0
    }else if(password.value != confermapassworld.value){
        arrayDiFunzioni[3](nome,password,confermapassworld);
        return 1
    }
    const utenteogggeto = {
        dati: {
            password: password.value
        },
        saves: {
            mondi: 0,
        }
    };
    viewchange(0,false,false);
    await addElementToNode(`utenti/${nome.value}`,utenteogggeto);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 2
}

let arrayDiFunzioni = [WrongNome, WrongPassword, AccesoVerificato,WrongPasswordConferma,RegistroVerificato];

window.Login = async function () {
    isRunningAnimation = true;
    loadbar.classList.add('atload');
    const schedaload = document.getElementsByClassName('schedaLoaded')[0];
    const nome = schedaload.querySelector('.nome');
    const password =  schedaload.querySelector('.password');
    await arrayDiFunzioni[(await getDataForNodeByLogin('utenti',nome.value,password.value))](nome,password,0);
    isRunningAnimation = false;
    loadbar.classList.remove('atload');
}

window.Register = async function () {
    isRunningAnimation = true;
    loadbar.classList.add('atload');
    const schedaload = document.getElementsByClassName('schedaLoaded')[0];
    const nome = schedaload.querySelector('.nome');
    const password =  schedaload.querySelector('.password');
    const confermapassworld = schedaload.querySelector('.conferma')
    await arrayDiFunzioni[(await getDataForNodeByRegister('utenti',nome.value))](nome,password,confermapassworld);
    isRunningAnimation = false;
    loadbar.classList.remove('atload');
}

window.getDataForNodeByLogin = async function (NodeId,KeyId,ValueId) {
    const dbRef = ref(database, `${NodeId}/${KeyId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            if(ValueId == snapshot.val().dati.password){
                const data = snapshot.val();
                localStorage.setItem(KeyId,JSON.stringify(data));
                return 2
            }
            return 1
        } else {
            console.log(`No data found for node ${KeyId}`);
            return 0;
        }
    } catch (error) {
        console.error("Error getting data:", error);
        return null
    }
};

window.getDataForNodeByRegister = async function (NodeId,KeyId) {
    const dbRef = ref(database, `${NodeId}/${KeyId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return 0
        } else {
            console.log(`No data found for node ${KeyId}`);
            return 4;
        }
    } catch (error) {
        console.error("Error getting data:", error);
        return null
    }
};

window.addElementToNode = async function (nodeId, elementData) {
    const dbRef = ref(database, `/${nodeId}`);
    try {
        await set(dbRef, elementData);
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};