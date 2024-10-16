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

  const sorgenti = ['musica','effetti','creature']

  let localsound = {musica:false,creature:false,effetti:false}

  let ScenaDefaultGame = {};

  let isRunninglinearAnimation = false;

  let statoslidespreviwew = false;
   
window.onload = async function(){
    const gamelocalsound = localStorage.getItem('gamelocalsound');
    const gamelocaldata = localStorage.getItem('utente');
    if(gamelocalsound != null){
        localsound = JSON.parse(gamelocalsound);
        for(let button = Object.keys(localsound).length-1;button >= 0;button--){
            if(localsound[sorgenti[button]]){
                document.getElementById(`${button}-audio-button`).classList.toggle('button-audio-active')
            }
        }
    }
    if(gamelocaldata != null){
        const data = JSON.parse(gamelocaldata);
        const elemento1 = document.getElementsByClassName('contenitore-scheda');
        playMusic();
        await ChangeLinearGradient(elemento1[0],315,125)
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

window.AudioSetLoop = function(button){
    const audioenable = document.getElementById(`${button}-audio-button`).classList.toggle('button-audio-active')
    localsound[sorgenti[button]] = !localsound[sorgenti[button]]
    const audioElement = document.getElementsByClassName(sorgenti[button])
    if(!localsound[sorgenti[button]]){
    for(let i = audioElement.length-1; i >= 0; i--){
        audioElement[i].pause()
    }
    }else if(localsound.musica){
        playMusic()
    }
    localStorage.setItem('gamelocalsound',JSON.stringify(localsound))
}

window.playMusic = async function (){
    if (localsound.musica) {
        let audioElement = document.createElement('audio');

        document.body.appendChild(audioElement)
        
        audioElement.classList.add('musica')

        audioElement.src = `../soudtruck/musica/index/${Math.floor(Math.random() * 3 + 1)}.mp3`;

        audioElement.autoplay = true;

        await new Promise(resolve => {
            audioElement.addEventListener('ended', resolve);
        });

        audioElement.remove()
        audioElement.pause();
        audioElement = null;

        await new Promise(resolve => setTimeout(resolve, 10000));

        playMusic();
    }
}

window.ReloadSalvataggi = async function(){
        const data = JSON.parse(localStorage.getItem('utente'));
        const container = document.getElementById('saves');
        container.querySelector('h3').style.display = 'block'
        for (var i = container.childElementCount-1; i > 0; i--) {
            container.lastElementChild.remove();
        }

        if(data.saves){
            const numerosalvataggi = Object.keys(data.saves).length;
            const container = document.getElementById('saves');
            container.querySelector('h3').style.display = 'none'
            for(var i = 0; i < numerosalvataggi;i++){
                addSavesSlot(container);
                let idmondo = '100' + i;
                container.lastElementChild.querySelector('h3').innerText = data.saves[idmondo].nome
                container .lastElementChild.querySelector('button').setAttribute('onclick',`LoadGame(${idmondo})`);
            } 
        }
        
    return 1
}

window.addSavesSlot = function(container){
    const newSlot = document.createElement('div');
    newSlot.appendChild(document.createElement('h3'));
    newSlot.appendChild(Object.assign(document.createElement('button'), { innerText: 'Gioca' }));
    container.appendChild(newSlot); 
}

window.Wrong = async function(wrong){
    if(!wrong.classList.contains('wrong')){
        wrong.classList.add('wrong');
    
        setTimeout(function(){
            wrong.classList.remove('wrong');
        },1000);
    }
}

window.WrongNome = function (nome,password,confermapassworld){Wrong(nome);}

window.WrongPassword = function (nome,password,confermapassworld){Wrong(password);}

window.WrongPasswordConferma = function (nome,password,confermapassworld){Wrong(confermapassworld);}

window.AccesoVerificato = async function (nome,password,confermapassworld){
    await ReloadSalvataggi();
    await viewchange(2,false,false);
    return 1
}

window.RegistroVerificato = async function (nome,password,confermapassworld){
    if(password.value == ''){
        Wrong(password)
        return 0
    }else if(password.value != confermapassworld.value){
        Wrong(confermapassworld)
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
    if(nome.value === ''){Wrong(nome);loadbar.classList.remove('atload');return 0;}
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
    if(nome.value === ''){Wrong(nome);loadbar.classList.remove('atload'); return 0}
    const difficolta =  document.querySelector('input[name="difficoltà"]:checked');
    const data = JSON.parse(localStorage.getItem('utente'));
    let salvataggi = 0;
    if(data.saves){
        salvataggi = Object.keys(data.saves).length;
        for(let i = 0; i < salvataggi;i++){
            if(data.saves['100'+ i].nome == nome.value){
                    WrongNome(nome,0,0);
                    loadbar.classList.remove('atload');
                return 0
            }
        }
    }else{
        data.saves = {};
    }

    const idmondo = '100' + salvataggi;

    data.saves[idmondo] = {};
    data.saves[idmondo].scene = {};

    data.saves[idmondo].startscena = 1;
    data.saves[idmondo].statsplayer = {
        setgun : 'glock',
        width :  10,
        height :  20,
        health : 100,
        rotation : 1,
        posx: 50,
        posy : 50
    };

    data.saves[idmondo].difficolta = difficolta.value;
    data.saves[idmondo].nome = nome.value;
    const gamedata = (await getDataForNode('gamedata/scene'));
    for (let key in gamedata) {
        const { leggenda } = gamedata[key];
        data.saves[idmondo].scene[key] = { leggenda };
    }
    data.saves[idmondo].inventario = await getDataForNode('gamedata/inventario');
    await addElementToNode(`utenti/${data.dati.nome}/saves`,data.saves);
    await getDataForNodeByLogin(`utenti/${data.dati.nome}`,data.dati.password);
    await getDataForNodeByLogin(`utenti/${data.dati.nome}`,data.dati.password);
    await ReloadSalvataggi();
    viewchange(2,false);
    loadbar.classList.remove('atload');
    
    return 1

}

window.RemoveGame = async function () {
    loadbar.classList.add('atload');
    const nome = document.getElementById('NomePartitaCancella');
    const data = JSON.parse(localStorage.getItem('utente'));
    if(data.saves){
        const salvataggi = Object.keys(data.saves).length;
        for(let i = 0; i < salvataggi;i++){
            if(data.saves['100'+ i].nome == nome.value){
                for(let x = i;x < salvataggi-1;x++){
                    data.saves['100'+ x] = data.saves['100'+ (x+1)];
                }
                delete data.saves['100' + (salvataggi-1)];
                await addElementToNode(`utenti/${data.dati.nome}/saves`,data.saves);
                await getDataForNodeByLogin(`utenti/${data.dati.nome}`,data.dati.password);
                await ReloadSalvataggi();
                viewchange(2,false);
                loadbar.classList.remove('atload');
                return 1
            }
        }
    }

    Wrong(nome);
    loadbar.classList.remove('atload');
    return 0
}

window.LoadGame = async function (idmondo) {
    loadbar.classList.add('atload');
    const gamedata = (await getDataForNode('gamedata/scene'));
    const data = (JSON.parse(localStorage.getItem('utente'))).saves[idmondo];
    const localdata = {
        startscena: data.startscena ? data.startscena:{},
        statsplayer: data.statsplayer ? data.statsplayer:{},
        difficolta : data.difficolta ? data.difficolta:{},
        inventario : data.inventario ? data.inventario:{},
        nome : data.nome,
        scene :{
        }
    }
    
    function aggiornaOggettiNpcs(dataObj, gamedataObj) {
        const oggettiAggiornati = {};

        for (let key in gamedataObj) {
            if (dataObj[key]) {
                oggettiAggiornati[key] = dataObj[key];
            }
        }

        return oggettiAggiornati; 
    }

    for (let scenaKey in gamedata) {
    const scenaGamedata = gamedata[scenaKey];
    data.scene[scenaKey] ||= {}; 
    const scenaData = data.scene[scenaKey]; 
    if (scenaData && scenaData.leggenda) {
        localdata.scene[scenaKey] = {
            centerdoor: scenaGamedata.centerdoor,
            leftdoor: scenaGamedata.leftdoor,
            rightdoor: scenaGamedata.rightdoor,
            background: scenaGamedata.background,
            leggenda: aggiornaOggettiNpcs(scenaData.leggenda, scenaGamedata.leggenda),
        };
    } else {
        console.warn(`La scena ${scenaKey} non contiene leggenda.`, scenaData);
        localdata.scene[scenaKey] = {
            background: scenaGamedata.background,
            centerdoor: scenaGamedata.centerdoor,
            leftdoor: scenaGamedata.leftdoor,
            rightdoor: scenaGamedata.rightdoor,
            leggenda: [],
        };
    }
}
    await localStorage.removeItem('loadgame');
    await localStorage.setItem('gamelocaldata',JSON.stringify(localdata));
    await localStorage.setItem('idmondo',idmondo);
    history.replaceState(null, '','html/game.html');
    location.reload();
    loadbar.classList.remove('atload');
    
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