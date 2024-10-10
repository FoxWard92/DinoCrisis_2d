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

  let isChangePause = false

  let isRunningWrongAnimation = false;

  let isRunningTrobleAnimation = false;

  let isRunningScribeAnimation = false;

  let playercommand = ['w','s','a','d','e',' ','i','escape','r'];

  let memscena = 0;

  
  const doors = ['leftdoor','centerdoor','rightdoor'];

  const loadbar = document.getElementById('loadbar')

  const leggenda = document.getElementById('leggenda');

  const player = document.getElementById('Player')

  let entita = leggenda.querySelectorAll('.entity');

  
window.onload = async function(){
    localdata = JSON.parse(localStorage.getItem('gamelocaldata'));
    if(localdata != null){
        console.log(localdata)
        await loadscena(localdata.startscena,true);
        await ReloadInventario()
        localdata.statsplayer.health = 100;
        SetLifebar(localdata.statsplayer.health,false)
        player.style.left = `${localdata.statsplayer.posx}%`;
        player.style.top = `${localdata.statsplayer.posy}%`;
        player.style.height = `${localdata.statsplayer.height}%`;
        player.style.width = `${localdata.statsplayer.width}%`;
        player.style.transform = `translateY(${localdata.statsplayer.rotation}%)`;
        return 2
    }

    history.replaceState(null, '','../index.html');
    location.reload()        
    return 0;
}

window.SetLifebar = function(value,animations){
    localdata.statsplayer.health = value;
    const lifebar = document.getElementById('healthbar');
    if(!isRunningTrobleAnimation && animations){
        isRunningTrobleAnimation = true;
        lifebar.classList.add('troble')
        setTimeout(function(){
            isRunningTrobleAnimation = false;
            lifebar.classList.remove('troble')
        },1000)
    }
    lifebar.style.background = `linear-gradient(90deg,darkred 0% ${value}%,transparent ${value}% 100%)`
}
window.openMenu = function(type){
    const menu = document.getElementsByClassName('gamemenu');
    if(menu[type].style.display == 'none'  || menu[type].style.display ==  ''){
        Array.from(menu).forEach(menu => menu.style.display = 'none');
        isChangePause = true;
        menu[type].style.display = 'flex'
        return 1
    }

    menu[type].style.display = 'none'
    isChangePause = false;

    return 0
}

window.AutoScribeText = async function(html,text){
    if(!isRunningScribeAnimation){
        html.classList.add('volker')
        const p = html.querySelector('p')
        isRunningScribeAnimation = true;
        for(let i = 0;i < text.length;i++){
            p.innerHTML += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        p.innerText = ''
        html.classList.remove('volker')
        isRunningScribeAnimation = false;
    }
}

window.wrong = function(wrong){
    if(!isRunningWrongAnimation){
        isRunningWrongAnimation = true
        wrong.classList.add('wrong');
        setTimeout(function(){
           wrong.classList.remove('wrong');
           isRunningWrongAnimation = false;
        },1000)
    }
}

window.exitgame = function(){
    localStorage.removeItem('localgame')
    history.replaceState(null, '','../index.html');
    location.reload()
}

window.savegame = async function(){
    loadbar.classList.add('atload');
    const data =  JSON.parse(localStorage.getItem('utente'));
    if(!data){
        loadbar.classList.remove('atload');
        wrong(document.getElementById('savebutton'));
        setTimeout(function(){
            openMenu(2)
            document.getElementById('cmdfeedback').innerHTML = `Errore Dati Account Non Trovati`;
        },1000)
        return 2
    }
    if(data.dati.password == await getDataForNode(`utenti/${data.dati.nome}/dati/password`)){
        await addElementToNode(`utenti/${data.dati.nome}/saves/${localStorage.getItem('idmondo')}/`,localdata)
        exitgame()
        return 1
    }
    loadbar.classList.remove('atload');
    wrong(document.getElementById('savebutton'));
    setTimeout(function(){
        openMenu(2)
        document.getElementById('cmdfeedback').innerHTML = `Errore Dati Account Passworld Errati`;
    },1000)
    return 0
}

window.loadscena = async function(scena,isreload){
    isChangeScena = true;
    const props = document.getElementsByClassName('props');
    for(var i = props.length-1; i >= 0 ;i--){
        props[i].remove();
    }

    document.getElementById('maindoors').style.backgroundImage = `url(${[localdata.scene[scena].backgroundheader]})`;
    document.getElementById('leggenda').style.backgroundImage = `url(${[localdata.scene[scena].backgroundarticle]})`;
    document.getElementById('gui').style.backgroundImage = `url(${[localdata.scene[scena].backgroundfooter]})`;

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
        if(propsload[chiave].health > 0){
            if(!isreload && propsload[chiave].type === 'entity'){
                propsload[chiave].posx = Math.random()*51+30
                propsload[chiave].posy = Math.random()*51+30
            }
            const div = document.createElement('div');
            div.className = `props ${propsload[chiave].nome} ${propsload[chiave].type}`;
            div.id = `${chiave}`;
            div.style.backgroundImage = `url(../img/props/${propsload[chiave].type}/${propsload[chiave].nome}.jpg)`;
            div.style.left = `${propsload[chiave].posx}%`;
            div.style.top = `${propsload[chiave].posy}%`;
            div.style.position = 'absolute';
            div.style.transform = `scaleX(${propsload[chiave].rotation*-1})`;
            div.style.height = `${propsload[chiave].height}%`
            div.style.width = `${propsload[chiave].width}%`
            leggenda.appendChild(div);
        }
    }

    entita = leggenda.querySelectorAll('.entity');

    localdata.startscena = scena;
    isChangeScena = false;
}

window.InventarioEquipitemInkitmedico = function(button){
    if (localdata.statsplayer.health >= 100) return wrong(button.parentElement);
    SetLifebar(Math.min(localdata.statsplayer.health + (50 - 10 * localdata.difficolta), 100),true);
    if (--localdata.inventario.item.kitmedico.quantity <= 0) {
        delete localdata.inventario.item.kitmedico;
    }
    ReloadInventario();
}

window.InventarioEquipweaponInglock = function(button){

 
    if(localdata.statsplayer.setgun){
        document.getElementById(`IdweaponSlot${localdata.statsplayer.setgun}`).style.border = `none`;
    }
    localdata.statsplayer.setgun = 'glock'
    document.getElementById(`IdweaponSlot${localdata.statsplayer.setgun}`).style.border = `0.2vw solid white`;
}

window.ReloadInventario = function(){
    const removeitems = document.getElementsByClassName('InInventario');

    for(let i = removeitems.length-1;i>= 0;i--){
        removeitems[i].remove()
    }

    for (let chiave = 0; chiave < 3; chiave++) {
        const type = Object.keys(localdata.inventario);
        const objectives = localdata.inventario[type[chiave]];
        const itemKeys = Object.keys(objectives);
    
        for (let i = itemKeys.length - 1; i >= 0; i--) {
            const lista = document.getElementById(`container-${type[chiave]}s`);
            
            const items = itemKeys[i];

            const div = document.createElement('div');
            div.id = `Id${type[chiave]}Slot${items}`
            div.classList.add(`InInventario`);

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('img')
            iconDiv.style.backgroundImage = `url(../img/props/${type[chiave]}/${items}.jpg)`;

            div.appendChild(iconDiv);
    
            const itemData = localdata.inventario[type[chiave]][items];

            let quantityText = null;

            if(type[chiave] == 'weapon'){
                quantityText = `${items} : ${itemData.ammons+itemData.chargers}`;
                if(items === localdata.statsplayer.setgun){
                    div.style.border = `0.2vw solid white`
                    document.getElementById('equpaggimento-text').innerHTML = `${itemData.chargers} / ${itemData.ammons}`;
                    document.getElementById('equpaggimento-img').style.backgroundImage = `url(../img/props/${type[chiave]}/${items}.jpg)`;
                }
            }else{
                quantityText = `${items}`;
            }
    
            const h3 = Object.assign(document.createElement('h3'), { innerText: quantityText });
            div.appendChild(h3);

            const buttonDiv = document.createElement('button');
            const buttonId = `button${type[chiave]}InventarioId${i})`
            buttonDiv.id =  buttonId
            buttonDiv.setAttribute('onclick', `InventarioEquip${type[chiave]}In${items}(document.getElementById('${buttonId}'))`);
            buttonDiv.innerHTML = `Usa Qut:${itemData.quantity}`;


            div.appendChild(buttonDiv)
    
            lista.appendChild(div);
            
        }
    }
}

window.addElementToNode = async function (nodeId, elementData) {
    const dbRef = ref(database, `/${nodeId}`);
    try {
        await set(dbRef, elementData);
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};

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

window.PlayerInteraction = async function(objectives){
    if(isChangeScena){return 0}

    const objCenterX = player.offsetLeft + (objectives.offsetWidth >> 1);
    const objCenterY = player.offsetTop + (objectives.offsetHeight >> 1);

    for(const chiave in doors){

        const door = document.getElementById(doors[chiave]);
        const doorCenterX = door.offsetLeft + (door.offsetWidth >> 1);
        const doorCenterY = door.offsetTop + (door.offsetHeight >> 1);

        const distX = Math.abs(doorCenterX - objCenterX);
        const distY = Math.abs(doorCenterY - objCenterY);
        if ((((distX / leggenda.offsetWidth)*100) + ((distY /leggenda.offsetHeight)*100)) < 3) {
            const data = localdata.scene[localdata.startscena][doors[chiave]];
            if(!data.key || localdata.inventario.key[data.key]){
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
                    addmotiondoor[0].addEventListener('transitionend', async function() {
                        objectives.style.opacity = 0;
                        for(var i = 0; i < addmotiondoor.length;i++){
                            addmotiondoor[i].style.transform = `translateX(${0}%) translateY(${0}%)`;
                        }
                        setTimeout( async function(){
                            await loadscena(data.scena,false);
                            objectives.style.opacity = 1;
                            isChangeScena = false;
                        },100)
                    }, { once: true });         
                }, { once: true });
            }else{
                AutoScribeText(document.getElementById('msgfeedback'),`Necessaria Chiave ${data.key} Per Aprire`)
            }
            return 1
        }
    }

    const props = document.querySelectorAll('.item, .weapon, .key');

    for (const prop of props) {
        const itemClass = prop.classList;
        const category = itemClass[2];
        const itemKey = itemClass[1];
        const id = prop.id;
        const health = localdata.scene[localdata.startscena].leggenda[id]?.health;
        if (health > 0) {
            const distX = Math.abs(prop.offsetLeft - objCenterX);
            const distY = Math.abs(prop.offsetTop - objCenterY);
            const distancePercentage = ((distX / leggenda.offsetWidth) * 100) + ((distY / leggenda.offsetHeight) * 100);
            if (distancePercentage < 10) {
            localdata.inventario[category] = localdata.inventario[category] || {};
            localdata.inventario[category][itemKey] = localdata.inventario[category][itemKey] || { quantity: 0 };
            localdata.inventario[category][itemKey].quantity++;

            localdata.scene[localdata.startscena].leggenda[id].health = 0;
            prop.remove();
            ReloadInventario();

            return 1;
        }
    }
}
return 0;
}



window.AiEntity = async function (entita){
        const dino = localdata.scene[localdata.startscena].leggenda[entita.id]
        if(dino.health < 0){entita.remove()}
        const playerX = localdata.statsplayer.posx
        const playerY = localdata.statsplayer.posy

        let dx = playerX - dino.posx;
        let dy = playerY - dino.posy;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                objectMove[2](entita, dino,dino.speed);
            } else if(dx > dino.speed) {
                objectMove[3](entita, dino,dino.speed);
            }
        } else {
            if (dy < 0) {
                objectMove[0](entita, dino,dino.speed);
            } else if (dy > dino.speed) {
                objectMove[1](entita, dino,dino.speed);
            }
        }
        const now = Date.now();

        const health = localdata.statsplayer.health
        
        if(Math.abs(dx) + Math.abs(dy) < 10 && now - dino.lastattacktime >= 1000){
            if(health > 0){
                SetLifebar(localdata.statsplayer.health -= dino.damage + (localdata.difficolta*5),true)
                dino.lastattacktime = now
            }else{
                isChangeScena = true
                openMenu(3)
            }
        }
}

setInterval(function(){
    if(!isChangePause && !isChangeScena){
        for(let i = entita.length-1; i >= 0;i--){
            AiEntity(entita[i])
        }
    }
},10)


window.RaycastBullutsDamage = async function(objectives,damage,type){
    localdata.inventario.weapon.glock.ammons = 300;

    const objectivesD = objectives.rotation;

    const objectivesF = (objectivesD + 1) / 2;

    const div = document.createElement('div');

    let bulletXY = {
        posx : objectives.posx,
        posy : objectives.posy + (objectives.height/3)
    }

    div.style.position ='absolute';
    div.style.left = `${bulletXY.posx}%`;
    div.style.top = `${bulletXY.posy}%`;
    div.style.height = "1%";
    div.style.width = "2%";
    div.style.backgroundColor = "red";
    div.backgroundImage = `url(../img/animations/bullets/${type}.jpg)`;
    leggenda.appendChild(div);

    const move = [ObjectivesMoveLeft,ObjectivesMoveRight]

    for (let chiave = (objectivesF ? (100 - bulletXY.posx):bulletXY.posx)/2;chiave >= 0;chiave--) {

        move[objectivesF](div,bulletXY,2);
        
        for(let i = entita.length-1 ;i >= 0;i--){
            const bersaglio = localdata.scene[localdata.startscena].leggenda[entita[i].id];
            if (Math.abs(bersaglio.posy + (bersaglio.height/2)  - bulletXY.posy) + Math.abs(bersaglio.posx + (bersaglio.width/2) - bulletXY.posx) < 20) {
                bersaglio.health -= damage 
                div.remove()
                return 1;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    div.remove()

    return 0

}

let isplayershooting = false;

let isplayerinreloading = false;

window.PlayerShoot = function(){
    const type = localdata.statsplayer.setgun;
    if(!isplayershooting){
        const weapon = localdata.inventario.weapon[type];
        if(weapon.chargers > 0){
            isplayershooting = true;
            weapon.chargers -= 1;
            player.style.backgroundImage = `url(../img/animations/player/shooting/${type}.jpg)`
            RaycastBullutsDamage(localdata.statsplayer,10,type);
            setTimeout(function(){
               isplayershooting = false;
            },weapon.shootdelay)
            document.getElementById('equpaggimento-text').innerHTML = `${weapon.chargers} / ${weapon.ammons}`
       }else{
           AutoScribeText(document.getElementById('msgfeedback'), weapon.ammons > 0 ? `Premi ${playercommand[8]} per Ricaricare` : `Munizioni ${localdata.statsplayer.setgun} Finite`);
       }
    }else{
        player.style.backgroundImage = `url(../img/animations/player/handgun/${type}.jpg)`
    }
}

window.PlayerShootReload = function(){
    
    if(!isplayerinreloading){
        const weapon = localdata.inventario.weapon[localdata.statsplayer.setgun];

    if(weapon.chargers < weapon.maxchargers){
        if(weapon.ammons > 0){
            isplayerinreloading = true;
            setTimeout(function(){
                const ammoToReload = Math.min(weapon.maxchargers-weapon.chargers, weapon.ammons);
                weapon.chargers += ammoToReload;
                weapon.ammons -= ammoToReload;
                document.getElementById('equpaggimento-text').innerHTML = `${weapon.chargers} / ${weapon.ammons}`
            },weapon.reloadtime/2)
            setTimeout(function(){
                isplayerinreloading = false;
            },weapon.reloadtime)
        }else{
            AutoScribeText(document.getElementById('msgfeedback'), `Munizioni ${localdata.statsplayer.setgun} Finite`);
        }
    }else{
        AutoScribeText(document.getElementById('msgfeedback'), `Munizioni ${localdata.statsplayer.setgun} Al Massimo`);
    }
    }
    
}

window.PlayerInventory = function(){
    openMenu(1)
}

window.PlayerMenuGame = function(){
    openMenu(0)
}

window.ObjectivesMoveUp = function(objectives,pos,movepx){
    const cordinates = pos.posy - movepx;
    if(cordinates > 20){
        pos.posy = cordinates;
        objectives.style.top = `${cordinates}%`
    }
}

window.ObjectivesMoveDown = function(objectives,pos,movepx){
    const cordinates = pos.posy + movepx;
    if(cordinates < 70){
        pos.posy = cordinates; 
        objectives.style.top = `${cordinates}%`
    }
}

window.ObjectivesMoveLeft = function(objectives,pos,movepx){
    const cordinates = pos.posx - movepx;
    if(cordinates >= 0){  
        pos.posx = cordinates;
        pos.rotation = -1;
        objectives.style.left = `${cordinates}%`
        objectives.style.transform = 'scaleX(1)'
    }
}

window.ObjectivesMoveRight = function(objectives,pos,movepx){
    const cordinates = pos.posx + movepx;
    if(cordinates < 100 - (objectives.offsetWidth / leggenda.offsetWidth * 100)){  
        pos.posx = cordinates;
        pos.rotation = +1;
        objectives.style.left = `${cordinates}%`;
        objectives.style.transform = 'scaleX(-1)'
    }
}

const playeraction = [PlayerInteraction, PlayerShoot, PlayerInventory, PlayerMenuGame,PlayerShootReload];
const objectMove = [ObjectivesMoveUp, ObjectivesMoveDown, ObjectivesMoveLeft, ObjectivesMoveRight];

const keysPressed = {};

let movementInterval;

document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    if (!isChangeScena) {
        const isMovementKey = playercommand.slice(0, 4).includes(key);
        const isActionKey = playercommand.slice(4, 9).includes(key);

        if (!isChangePause && isMovementKey) {
            const index = playercommand.indexOf(key);
            if (!keysPressed[key]) {
                keysPressed[key] = true;
                objectMove[index](player, localdata.statsplayer);
                startMovement();
            }
            return; 
        }

        if (isActionKey) {
            const actionIndex = playercommand.indexOf(key) - 4;
            playeraction[actionIndex](player, localdata.statsplayer);
        }
    }
});

document.addEventListener('keyup', function(event) {
    const key = event.key.toLowerCase();
    if (keysPressed[key]) {
        keysPressed[key] = false;
        if (Object.values(keysPressed).every(v => !v)) {
            stopMovement();
        }
    }

    isplayershooting = false;
});

function handleKeyAction() {
    if (!isChangeScena && !isChangePause) {
        for (let i = 0; i < 4; i++) {
            if (keysPressed[playercommand[i]]) {
                objectMove[i](player, localdata.statsplayer,0.5);
            }
        }
    }
}

function updateMovement() {
    handleKeyAction(); 
}

function startMovement() {
    if (!movementInterval) {
        movementInterval = setInterval(updateMovement, 10);
    }
}

function stopMovement() {
    clearInterval(movementInterval);
    movementInterval = null;
}