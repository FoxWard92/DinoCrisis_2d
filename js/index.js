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

  let ScenaDefaultGame = {};

  let isRunninglinearAnimation = false;

  let isRunnigWrongAnimation = false;

  let statoslidespreviwew = false;
  
window.onload = async function(){
    if(localStorage.getItem('utente') != null){
        const data = JSON.parse(localStorage.getItem('utente'));
        await getDataForNodeByLogin(`utenti/${data.dati.nome}`,data.dati.password);
        await ReloadSalvataggi();
        await viewchange(2,false,true); 
    }else{
        await viewchange(0,false,true); 
    }
    loadbar.classList.remove('atload');
}

window.viewchange = async function(numero,statoslides,forzastato){
    if(isRunninglinearAnimation && forzastato) return 0;
        const elemento1 = document.getElementsByClassName('contenitore-scheda');
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 1
}

window.ChangeLinearGradient = function(background,degstart,degend){
    let degdiff = degstart - degend;
    const step = Math.abs(degdiff);
    const angle = degdiff < 0 ? 1:-1;
    for(let i = 0; i <= step;i++){
        setTimeout(function() {
            background.style.background = `linear-gradient(${degstart+(i*angle)}deg,transparent  0% ,rgb(20,20,20) 70%)`;
        }, i * 5);
    }
}

window.ReloadSalvataggi = async function(){
        const data = JSON.parse(localStorage.getItem('utente'));
        const numerosalvataggi = Object.keys(data.saves).length;
        
            const container = document.getElementById('saves');
            container.querySelector('h3').style.display = 'none'
            for(var i = 0; i < numerosalvataggi;i++){
                addSavesSlot(container);
                container.lastElementChild.querySelector('h3').innerText = data.saves['100' + i].nome
            }
        
    return 1
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
        newSlotButton.lastElementChild.appendChild(document.createElement('div'));
        newSlotButton.lastElementChild.appendChild(document.createElement('div'));
    }
    
    container.appendChild(newSlot); 
}

window.WrongClassList = function(wrong){
    isRunnigWrongAnimation = true;
    wrong.classList.add('wrong');

    setTimeout(function(){
        wrong.classList.remove('wrong');
        isRunnigWrongAnimation = false;
    },1000);
}

window.WrongNome = function (nome,password,confermapassworld){
    console.log(isRunnigWrongAnimation)
    if(!isRunnigWrongAnimation){WrongClassList(nome);}
}

window.WrongPassword = function (nome,password,confermapassworld){
    if(!isRunnigWrongAnimation){WrongClassList(password);}
}

window.WrongPasswordConferma = function (nome,password,confermapassworld){
    if(!isRunnigWrongAnimation){WrongClassList(confermapassworld);}

}

window.AccesoVerificato = async function (nome,password,confermapassworld){
    await ReloadSalvataggi();
    await viewchange(2,false,false);
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
            nome : nome.value,
            password: password.value
        },
        saves: 0
    };
    await addElementToNode(`utenti/${nome.value}`,utenteogggeto);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await viewchange(0,false,false);
    return 2
}

let arrayDiFunzioni = [WrongNome, WrongPassword, AccesoVerificato,WrongPasswordConferma,RegistroVerificato];

window.Login = async function () {
    isRunninglinearAnimation = true;
    loadbar.classList.add('atload');
    const schedaload = document.getElementsByClassName('schedaLoaded')[0];
    const nome = schedaload.querySelector('.nome');
    const password =  schedaload.querySelector('.password');
    await arrayDiFunzioni[(await getDataForNodeByLogin(`utenti/${nome.value}`,password.value))](nome,password,0);
    isRunninglinearAnimation = false;
    loadbar.classList.remove('atload');
}

window.Register = async function () {
    isRunninglinearAnimation = true;
    loadbar.classList.add('atload');
    const schedaload = document.getElementsByClassName('schedaLoaded')[0];
    const nome = schedaload.querySelector('.nome');
    const password =  schedaload.querySelector('.password');
    const confermapassworld = schedaload.querySelector('.conferma')
    await arrayDiFunzioni[(await getDataForNodeByRegister(`utenti/${nome.value}`))](nome,password,confermapassworld);
    isRunninglinearAnimation = false;
    loadbar.classList.remove('atload');
}

window.NewGame = async function(){
    
    loadbar.classList.add('atload');
    const nome = document.getElementById('NomePartitaNuova');
    const data = JSON.parse(localStorage.getItem('utente'));
    const salvataggi = Object.keys(data.saves).length;
    if(nome.value === ''){WrongNome(nome,0,0); return 0}
    if(salvataggi){
        for(let i = 0; i < salvataggi;i++){
            if(data.saves['100'+ i].nome == nome.value){
                    WrongNome(nome,0,0);
                return 0
            }
        }
    }

    const idmondo = '100' + salvataggi;
    
    if (!data.saves) {
        data.saves = {};
    }

    if (!data.saves[idmondo]) {
        data.saves[idmondo] = {};
    }

    data.saves[idmondo].nome = nome.value;
    data.saves[idmondo].scene = await getDataForNode('gamedata/scene');
    data.saves[idmondo].inventario = await getDataForNode('gamedata/inventario');
    await addElementToNode(`utenti/${data.dati.nome}/saves`,data.saves);
    await getDataForNodeByLogin(`utenti/${data.dati.nome}`,data.dati.password);
    loadbar.classList.remove('atload');
    
    return 1

}

window.getDataForNode = async function (NodeId) {
    const dbRef = ref(database, `${NodeId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error getting data:", error);
        return null
    }
};

window.getDataForNodeByLogin = async function (NodeId,ValueId) {
    const data =  await getDataForNode(NodeId);
    if (data === 0){
        return 0
    }
    if(ValueId == data.dati.password){
        localStorage.removeItem('utente');
        localStorage.setItem('utente',JSON.stringify(data));
        return 2
    }
    return 1
};

window.getDataForNodeByRegister = async function (NodeId) {
    const data =  await getDataForNode(NodeId);
    if(data === 0){
        return 4
    }
    return 0
};

window.addElementToNode = async function (nodeId, elementData) {
    const dbRef = ref(database, `/${nodeId}`);
    try {
        await set(dbRef, elementData);
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};