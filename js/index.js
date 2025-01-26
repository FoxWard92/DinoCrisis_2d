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
  
  const SchedaDiNavigazione = document.getElementById('contenitore-scheda');

  const SchedaDiLogin = document.getElementById('Accedi')
  
  const SchedaDiRegister = document.getElementById('Registrati')

  let localsound = null;

  let localdata = null;

  let isRunninglinearAnimation = false;

  let statoslidespreviwew = false;
   
window.onload = async function(){
    await ChangeLinearGradient(SchedaDiNavigazione,315,125)

    try{
        const gamelocalsound = JSON.parse(localStorage.getItem('gamelocalsound'));
        for(const button in gamelocalsound){
            if(gamelocalsound[button]){
                document.getElementById(`${button}-audio-button`).classList.toggle('button-audio-active')
            }
        }

        localsound = gamelocalsound || {musica:false,creature:false,effetti:false};
        
    }catch(error){   
        console.log(error)
    }

    try{
        const gamelocaldata = JSON.parse(localStorage.getItem('utente'));

        await LoginByAuto(gamelocaldata.dati.nome,gamelocaldata.dati.password);

        playMusic();
        await ReloadSalvataggi();
        await viewchange(2,false);

    }catch(error){
        await viewchange(0,false);
        console.error('Errore durante il caricamento:',error);
    }
    
    loadbar.classList.remove('atload');
}

window.viewchange = async function(numero,statoslides){
    if(isRunninglinearAnimation) return 0;
    isRunninglinearAnimation = true;
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
        ChangeLinearGradient(SchedaDiNavigazione,(statoslides ? 125:225),(statoslides ? 225:125));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isRunninglinearAnimation = false;
    return 1;
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

window.isStringContains = function(string,chars){
    if(string == '') {return true}
    for(var i = string.length-1;i >= 0;i--){
        for(var x = chars.length-1;x >= 0; x--){
            if(string.charAt(i) == chars[x]){
                return true
            }
        }
    }
    return false
}

window.AudioSetLoop = function(button){
    document.getElementById(`${button}-audio-button`).classList.toggle('button-audio-active')
    localsound[button] = !localsound[button]
    const audioElement = document.getElementsByClassName(button)
    if(!localsound[button]){
    for(let i = audioElement.length-1; i >= 0; i--){
        audioElement[i].pause()
    }
    }else if(button === 'musica' && localsound[button]){
        playMusic()
    }
    localStorage.setItem('gamelocalsound',JSON.stringify(localsound))
}

window.playMusic = async function (){
    if (localsound.musica) {
        let audioElement = document.createElement('audio');

        document.body.appendChild(audioElement)
        
        audioElement.classList.add('musica')

        audioElement.src = `../soundtruck/musica/index/${Math.floor(Math.random() * 3 + 1)}.mp3`;

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
        const container = document.getElementById('saves');
        const h3 = container.firstElementChild;
        h3.style.display = 'block'
        for (var i = container.childElementCount-1; i > 0; i--) {
            container.lastElementChild.remove();
        }

        if(localdata.saves && Object.keys(localdata.saves).length > 0){
            const numerosalvataggi = Object.keys(localdata.saves).length;
            const container = document.getElementById('saves');
            h3.style.display = 'none'
            for(let i = 0; i < numerosalvataggi;i++){
                addSavesSlot(container);
                const elementoContainer = container.lastElementChild;
                elementoContainer.children[0].innerText = localdata.saves[i].nome
                elementoContainer.children[1].onclick =  function(){
                    LoadGame(i);
                }
                elementoContainer.children[2].onclick =  function(){
                    RemoveGame(i);
                } 
            } 
        }
        
    return 1
}

window.addSavesSlot = function(container){
    const newSlot = document.createElement('div');
    newSlot.appendChild(document.createElement('h3'));
    newSlot.appendChild(Object.assign(document.createElement('button'), { innerText: 'Gioca' ,className:'button-loadgame'}));
    newSlot.appendChild(Object.assign(document.createElement('button'), { className:'button-removegame'}));

    container.appendChild(newSlot); 
}

window.wrong = async function(wrong){
    if(!wrong.classList.contains('wrong')){
        wrong.classList.add('wrong');
    
        setTimeout(function(){
            wrong.classList.remove('wrong');
        },1000);
    }
}

window.LoginByAuto = async function (Nome,Password) {
    loadbar.classList.add('atload');

    const localdatatemp = await getDataForNode(`utenti/${Nome}`)
    
    console.log(localdatatemp)

    if(localdatatemp && localdatatemp.dati && localdatatemp.dati.password == Password){
        localdata = localdatatemp
        localStorage.setItem('utente',JSON.stringify(localdatatemp));

        loadbar.classList.remove('atload');
        return 1
    }
    
    loadbar.classList.remove('atload');

    return 0
}

window.LoginByUser = async function () {
    loadbar.classList.add('atload');

    const Nome = SchedaDiLogin.children[0]

    const Password = SchedaDiLogin.children[1]

    try{
        if(isStringContains(Nome.value,[' ','=','^','?','#',']','[','.','$','*'])){
            wrong(Nome);
        }else{
            const localdatatemp = await getDataForNode(`utenti/${Nome.value}`)

            if(!localdatatemp){
                wrong(Nome)
            }else if (localdatatemp.dati.password != Password.value){
                wrong(Password)
            }else{
                localdata = localdatatemp
                localStorage.setItem('utente',JSON.stringify(localdatatemp));
                playMusic();
                await ReloadSalvataggi();
                await viewchange(2,false);
                
            }
        }

    }catch(error){
        wrong(Nome)
        wrong(Password)
        console.log(error)
    }

    loadbar.classList.remove('atload');

    return 0

}

window.RegisterByUser = async function () {
    
    loadbar.classList.add('atload');

    const Nome = SchedaDiRegister.children[0]

    const Password = SchedaDiRegister.children[1]

    const ConfermaPassword = SchedaDiRegister.children[2]

    if(Nome.value.length >20 || isStringContains(Nome.value,[' ','=','^','?','#',']','[','.','$','*']) || await getDataForNode(`utenti/${Nome.value}`)){
        wrong(Nome)
    }else if(Password.value.length < 5 || isStringContains(Password.value,[' ','è','ò','à'])){
        wrong(Password)
    }else if (Password.value != ConfermaPassword.value){
        wrong(ConfermaPassword)
    }else{
        const utente = {
            dati: {
                nome : Nome.value,
                password: Password.value
            },
            saves: 0
        };
        await addElementToNode(`utenti/${Nome.value}`,utente);
        await new Promise(resolve => setTimeout(resolve, 1000));

        loadbar.classList.remove('atload');

        await viewchange(0,false);
    }

    loadbar.classList.remove('atload');
}

window.NewGame = async function(){
    
    loadbar.classList.add('atload');
    const nome = document.getElementById('NomePartitaNuova');
    if(nome.value === ''){wrong(nome);loadbar.classList.remove('atload'); return 0}
    const difficolta =  document.querySelector('input[name="difficoltà"]:checked');
    let salvataggi = 0;
    if(localdata.saves){
        salvataggi = Object.keys(localdata.saves).length;
        for(let i = 0; i < salvataggi;i++){
            if(localdata.saves[i].nome == nome.value){
                    wrong(nome);
                    loadbar.classList.remove('atload');
                return 0
            }
        }
    }else{
        localdata.saves = {};
    }

    const idmondo = salvataggi;

    localdata.saves[idmondo] = {};
    localdata.saves[idmondo].scene = {};

    localdata.saves[idmondo].startscena = 1;
    localdata.saves[idmondo].statsplayer = {
        setgun : 'glock',
        width :  10,
        height :  20,
        health : 100,
        rotation : 1,
        posx: 50,
        posy : 50
    };

    localdata.saves[idmondo].difficolta = difficolta.value;
    localdata.saves[idmondo].nome = nome.value;
    const gamedata = (await getDataForNode('gamedata/scene'));
    for (let key in gamedata) {
        const { leggenda } = gamedata[key];
        localdata.saves[idmondo].scene[key] = { leggenda };
    }
    localdata.saves[idmondo].inventario = await getDataForNode('gamedata/inventario');
    await addElementToNode(`utenti/${localdata.dati.nome}/saves`,localdata.saves);
    await LoginByAuto(localdata.dati.nome,localdata.dati.password);
    await ReloadSalvataggi();
    viewchange(2,false);
    loadbar.classList.remove('atload');
    
    return 1

}

window.RemoveGame = async function (idmondo) {
    loadbar.classList.add('atload');

    if(localdata.saves){
        const salvataggi = Object.keys(localdata.saves).length;
        
        for(let i = idmondo; i < salvataggi;i++){
            localdata.saves[i] = localdata.saves[(i+1)];
        }

        delete localdata.saves[(salvataggi-1)];
        await addElementToNode(`utenti/${localdata.dati.nome}/saves`,localdata.saves);
        await LoginByAuto(localdata.dati.nome,localdata.dati.password);
        await ReloadSalvataggi();
        
        viewchange(2,false);
    }

    loadbar.classList.remove('atload');
}

window.LoadGame = async function (idmondo) {
    loadbar.classList.add('atload');
    const gamedata = (await getDataForNode('gamedata/scene'));
    const data = localdata.saves[idmondo];
    const localdatagame = {
        idmondo: idmondo,
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
        localdatagame.scene[scenaKey] = {
            centerdoor: scenaGamedata.centerdoor,
            leftdoor: scenaGamedata.leftdoor,
            rightdoor: scenaGamedata.rightdoor,
            background: scenaGamedata.background,
            leggenda: aggiornaOggettiNpcs(scenaData.leggenda, scenaGamedata.leggenda),
        };
    } else {
        console.warn(`La scena ${scenaKey} non contiene leggenda.`, scenaData);
        localdatagame.scene[scenaKey] = {
            background: scenaGamedata.background,
            centerdoor: scenaGamedata.centerdoor,
            leftdoor: scenaGamedata.leftdoor,
            rightdoor: scenaGamedata.rightdoor,
            leggenda: [],
        };
    }
}
    localStorage.setItem('gamelocaldata',JSON.stringify(localdatagame));
    
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

window.addElementToNode = async function (nodeId, elementData) {
    const dbRef = ref(database, `/${nodeId}`);
    try {
        await set(dbRef, elementData);
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};