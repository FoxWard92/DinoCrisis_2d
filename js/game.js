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

  let localdata = null;

  let isChangeScena = false;

  let playercommand = ['w','s','a','d','e',' ','i','escape'];

  let memscena = 0;

  const leggenda = document.getElementById('leggenda');

  const player = document.getElementById('Player')

  const movepx = 1;

  
window.onload = async function(){
    
    localdata = JSON.parse(localStorage.getItem('gamelocaldata'));
    if(localdata != null){
        console.log(localdata)
        loadscena(localdata.startscena);
        player.style.left = `${localdata.startposplayer.posx}%`;
        player.style.top = `${localdata.startposplayer.posy}%`;
        if(!localStorage.getItem('loadgame')){
            loadscena(localdata.startscena);
            localStorage.setItem('loadgame',true);
            return 1
        }
        return 2
    }

    history.replaceState(null, '','../index.html');
    location.reload()        
    return 0;
}

window.GetPorpsPos = function(element) {
    const parentRect = element.parentElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      top: elementRect.top - parentRect.top,
      left: elementRect.left - parentRect.left
    };
}

window.loadscena = async function(scena){
    isChangeScena = true;
    const props = document.getElementsByClassName('props');
    for(var i = props.length-1; i >= 0 ;i--){
        console.log(i)
        props[i].remove();
    }

    document.getElementById('back-game').style.backgroundImage = `url(../img/props/scene/${[scena]}.jpg)`;
    
    
    const doors = ['leftdoor','centerdoor','rightdoor']

    for(const chiave in doors){
        const door = document.getElementById(doors[chiave]);
        while(door.firstChild){door.removeChild(door.firstChild)};
        const doorload = localdata.scene[scena][doors[chiave]];
        if(doorload.type){
            door.appendChild(Object.assign(document.createElement('div'), { className: `door ${doorload.scroll}`,style : `background-image: url(../img/props/doors/${[doorload.type]}.jpg)`}));
            if(doorload.large){
                door.appendChild(Object.assign(document.createElement('div'), { className: `door ${doorload.scroll}`,style : `background-image: url(../img/props/doors/${[doorload.type]}.jpg)`}));
                door.style.background = `linear-gradient(90deg,transparent 0%,black 5% 95%,transparent 100%)`;
            }else{
                door.style.background = `linear-gradient(90deg,transparent 0% 20%,black 30% 70%,transparent 80% 100%)`;
            }
        }
    }

    const propsload = localdata.scene[scena].leggenda;
    for(const chiave in propsload){
        const div = document.createElement('div');
        div.className = `props ${propsload[chiave].nome}`;
        div.id = `${chiave}`;
        div.style.backgroundImage = `url(../img/props/props/${propsload[chiave].nome}/step.jpg)`;
        div.style.left = `${propsload[chiave].posx}%`;
        div.style.top = `${propsload[chiave].posy}%`;
        div.style.position = 'absolute';
        leggenda.appendChild(div);
    }
    localdata.startscena = scena;
    isChangeScena = false;
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

window.addEventListener('beforeunload', function(event) {
    localStorage.setItem('gamelocaldata',JSON.stringify(localdata));
});

window.ObjectivesMoveUp = function(objectives,pos){
    const cordinates = pos.posy - movepx;
    if(cordinates > leggenda.offsetTop / window.innerHeight * 100){
        pos.posy = cordinates;
        objectives.style.top = `${cordinates}%`
    }
}

window.ObjectivesMoveDown = function(objectives,pos){
    const cordinates = pos.posy + movepx;
    if(cordinates < (leggenda.offsetHeight - leggenda.offsetTop) / window.innerHeight * 100){
        pos.posy = cordinates; 
        objectives.style.top = `${cordinates}%`
    }
}

window.ObjectivesMoveLeft = function(objectives,pos){
    const cordinates = pos.posx - movepx;
    if(cordinates >= 0){  
        pos.posx = cordinates;
        objectives.style.left = `${cordinates}%`
    }
}

window.ObjectivesMoveRight = function(objectives,pos){
    const cordinates = pos.posx + movepx;
    if(cordinates < 100 - (objectives.offsetWidth / leggenda.offsetWidth * 100)){  
        pos.posx = cordinates;
        objectives.style.left = `${cordinates}%`;
    }
}

window.PlayerInteraction = async function(objectives,pos){
    if(isChangeScena){return 0}
    const props = localdata.scene[localdata.startscena].leggenda;
    
    const doors = ['leftdoor','centerdoor','rightdoor'];
    
    const leggendaheight = leggenda.offsetHeight;

    const leggendawidth = leggenda.offsetWidth;

    const objCenterX = pos.posx + (objectives.offsetWidth >> 1)/ leggendawidth  * 100;
    const objCenterY = pos.posy + (objectives.offsetHeight >> 1) / leggendaheight * 100;

    for(const chiave in doors){
        
        const door = document.getElementById(doors[chiave]);
        const doorCenterX = door.offsetLeft / leggendawidth * 100 + (door.offsetWidth >> 1) / leggendawidth  * 100;
        const doorCenterY = (door.offsetTop + (door.offsetHeight/3)) / leggendaheight * 100;
        const distX = Math.abs(doorCenterX - objCenterX);
        const distY = Math.abs(doorCenterY - objCenterY);
        if ((distX + distY) < 3) {
            const data = localdata.scene[localdata.startscena][doors[chiave]];
            if(data.scena){
                isChangeScena = true;
                const scroll = [-1,1];
                const addmotiondoor = door.children;
                for(var i = 0; i < addmotiondoor.length;i++){
                    addmotiondoor[i].style.transform = `translateX(${data.scroll.left * 100 * scroll[i]}%) translateY(${data.scroll.top * 100 * scroll[i]}%)`;
                }
                
                addmotiondoor[0].addEventListener('transitionend', async function() {
                    objectives.style.opacity = 0;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    for(var i = 0; i < addmotiondoor.length;i++){
                        addmotiondoor[i].style.transform = `translateX(${0}%) translateY(${0}%)`;
                    }                
                    setTimeout( async function(){
                        await loadscena(data.scena);
                        objectives.style.opacity = 1;
                        isChangeScena = false;
                    },500)
                }, { once: true });
            }
            return 1
        }
    }

    for(const chiave in props){
        if(props[chiave].type === 'item'){
            const distX = Math.abs(props[chiave].posx - objCenterX);
            const distY = Math.abs(props[chiave].posy - objCenterY);
            if ((distX + distY) < 10) {
                console.log(props[chiave]);
                return 1
            }
            
        }
    }

    return 0
}

window.PlayerShoot = function(){
    player.style.top = `${parseInt(player.style.top) + movepx}px`
}

window.PlayerInventory = function(){
    player.style.top = `${parseInt(player.style.top) + movepx}px`
}

window.PlayerExitGame = function(){
    localStorage.removeItem('localgame')
    history.replaceState(null, '','../index.html');
    location.reload()  
}

const playeraction = [ObjectivesMoveUp,ObjectivesMoveDown,ObjectivesMoveLeft,ObjectivesMoveRight,PlayerInteraction,PlayerShoot,PlayerInventory,PlayerExitGame]

document.addEventListener('keydown', function(event) {
    if(!isChangeScena){
        const key = event.key.toLowerCase();
        for(const chiave in playercommand){
           if(key === playercommand[chiave]){
            playeraction[chiave](player,localdata.startposplayer);
            break;
        }
        }
    }
});