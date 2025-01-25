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

  let localsound = null;

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

    try {
        const gamelocalsound = JSON.parse(localStorage.getItem('gamelocalsound'));
        for(const button in gamelocalsound){
            if(gamelocalsound[button]){
                document.getElementById(`${button}-audio-button`).classList.add('button-audio-active')
            }
        }
        localsound = gamelocalsound || {musica:false,creature:false,effetti:false};

    } catch (error) {
        console.log(error)
    }

    try {
        const gamelocaldata = localStorage.getItem('gamelocaldata');
        localdata = JSON.parse(gamelocaldata)
        console.log(localdata)
        playMusic()
        await loadscena(localdata.startscena,true);
        await ReloadInventario()
        SetLifebar(localdata.statsplayer.health,false)
        player.style.left = `${localdata.statsplayer.posx}%`;
        player.style.top = `${localdata.statsplayer.posy}%`;
        player.style.height = `${localdata.statsplayer.height}%`;
        player.style.width = `${localdata.statsplayer.width}%`;
        player.style.transform = `ScaleX(${localdata.statsplayer.rotation*-1})`;
        
    } catch (error) {
        console.log(error)
        history.replaceState(null, '','../index.html');
        location.reload()
    }

    loadbar.classList.remove('atload');
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

window.wrong = async function(wrong){
    if(!wrong.classList.contains('wrong')){
        wrong.classList.add('wrong');
    
        setTimeout(function(){
            wrong.classList.remove('wrong');
        },1000);
    }
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

        audioElement.src = `../soundtruck/musica/game/${Math.floor(Math.random() * 3 + 1)}.mp3`;

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

window.audio = async function(type,src,classList,time,Object){
    if(localsound[type] && !Object.classList.contains(classList)){
        Object.classList.add(classList)

        setTimeout(function(){
            Object.classList.remove(classList)
        },time)
        
        let audioElement = document.createElement('audio');

        document.body.appendChild(audioElement)

        audioElement.src = `../soundtruck/${type}/${src}`;
    
        audioElement.autoplay = true;
    
        await new Promise(resolve => setTimeout(resolve, 5000));
    
        audioElement.remove()

        audioElement.pause();

        audioElement = null;
    }
}

window.exitgame = function(){
    localStorage.removeItem('localgame')
    history.replaceState(null, '','../index.html');
    location.reload()
}

window.savegame = async function(){
    loadbar.classList.add('atload');

    try {
        const data =  JSON.parse(localStorage.getItem('utente'));
        if(data.dati && data.dati.password == await getDataForNode(`utenti/${data.dati.nome}/dati/password`)){
            const idmondo = localdata.idmondo
            delete localdata.idmondo;
            await addElementToNode(`utenti/${data.dati.nome}/saves/${idmondo}/`,localdata)
            exitgame()
        }

    }catch(error){
        loadbar.classList.remove('atload');
        wrong(document.getElementById('savebutton'));
        setTimeout(function(){
            openMenu(2)
            document.getElementById('cmdfeedback').innerHTML = `Errore Dati Account Non Trovati`;
        },1000)
    }
}

window.loadscena = async function(scena,isreload){
    isChangeScena = true;
    const props = document.getElementsByClassName('props');
    for(var i = props.length-1; i >= 0 ;i--){
        props[i].remove();
    }

    document.getElementById('maindoors').style.backgroundImage = `url(../img/props/sfondi/header/${localdata.scene[scena].background}.jpg)`;
    document.getElementById('leggenda').style.backgroundImage = `url(../img/props/sfondi/article/${localdata.scene[scena].background}.jpg)`;
    document.getElementById('gui').style.backgroundImage = `url(../img/props/sfondi/footer/${localdata.scene[scena].background}.jpg)`;

    await new Promise(resolve => setTimeout(resolve, 400));

    for(const chiave in doors){
        const door = document.getElementById(doors[chiave]);
        while(door.firstChild){door.removeChild(door.firstChild)};
        const doorload = localdata.scene[scena][doors[chiave]];
        if(doorload.type){
            door.appendChild(Object.assign(document.createElement('div'), { className: `door ${doorload.scroll}`,style : `background-image: url(../img/props/doors/${[doorload.type]}.jpg)`}));
            if(doorload.large){
                door.appendChild(Object.assign(document.createElement('div'), { className: `door ${doorload.scroll}`,style : `background-image: url(../img/props/doors/${[doorload.type]}.jpg)`}));
                door.lastElementChild.style.transform = 
                door.style.background = `linear-gradient(90deg,transparent 0%,black 5% 95%,transparent 100%)`;
            }else{
                door.style.background = `linear-gradient(90deg,transparent 0% 20%,black 30% 70%,transparent 80% 100%)`;
            }
        }else{
            door.style.background = `transparent`;
        }
    }

    const propsload = localdata.scene[scena].leggenda;
    for(const chiave in propsload){
        if(propsload[chiave].health > 0){
            const div = document.createElement('div');
            if(propsload[chiave].type === 'entity'){
                if(!isreload){
                    propsload[chiave].posx = Math.random()*51
                    propsload[chiave].posy = Math.random()*51+20
                }
            }else{
                div.style.backgroundImage = `url(../img/props/${[propsload[chiave].type]}/${[propsload[chiave].nome]}.jpg)`  
            }
            div.className = `props ${propsload[chiave].nome} ${propsload[chiave].type}`;
            div.id = `${chiave}`;
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

window.removeItem = function(item,type){
    if (--localdata.inventario[type][item].quantity <= 0) {
        delete localdata.inventario[type][item];
    }
    ReloadInventario();
}

window.InventarioEquipitemInanestetico = function(button){
    if (localdata.statsplayer.health >= 100) return wrong(button.parentElement);
    for(let i = 0; i < 8;i++){
        setTimeout(function(){
            SetLifebar(Math.min(localdata.statsplayer.health + (20 - 5 * localdata.difficolta), 100),true);
        },3000*i)
    }
    removeItem('anestetico','item')
}

window.InventarioEquipitemInbende = function(button){
    if (localdata.statsplayer.health >= 100) return wrong(button.parentElement);
    SetLifebar(Math.min(localdata.statsplayer.health + (30 - 5 * localdata.difficolta), 100),true);
    removeItem('bende','item')
}

window.InventarioEquipitemInkitmedico = function(button){
    if (localdata.statsplayer.health >= 100) return wrong(button.parentElement);
    SetLifebar(Math.min(localdata.statsplayer.health + (50 - 5 * localdata.difficolta), 100),true);
    removeItem('kitmedico','item')
}

window.InventarioEquipammonInnovemm = function(button){
    if (!localdata.inventario.weapon.glock) return wrong(button.parentElement);
    localdata.inventario.weapon.glock.ammons += localdata.inventario.ammon.novemm.ammons
    removeItem('novemm','ammon')
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

    
    const type = Object.keys(localdata.inventario);

    for (let chiave = 0; chiave < 4; chiave++) {
        
        const objectives = localdata.inventario[type[chiave]];
        const itemKeys = Object.keys(objectives ? objectives:0);
    
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

            let quantityText = `${items}`;

            if(type[chiave] == 'weapon'){
                quantityText = `${items} : ${itemData.ammons+itemData.chargers}`;
                if(items === localdata.statsplayer.setgun){
                    div.style.border = `0.2vw solid white`
                    document.getElementById('equpaggimento-text').innerHTML = `${itemData.chargers} / ${itemData.ammons}`;
                    document.getElementById('equpaggimento-img').style.backgroundImage = `url(../img/props/${type[chiave]}/${items}.jpg)`;
                }
            }
    
            if(type[chiave] != 'ammon'){
                div.appendChild(Object.assign(document.createElement('h3'), { innerText: quantityText }));
            }

            if(type[chiave] == 'item' || type[chiave]== 'ammon'){
                const buttonDiv = document.createElement('button');
                const buttonId = `button${type[chiave]}InventarioId${i})`
                buttonDiv.id =  buttonId
                buttonDiv.setAttribute('onclick', `InventarioEquip${type[chiave]}In${items}(document.getElementById('${buttonId}'))`);
                buttonDiv.innerHTML = `Usa Qut:${itemData.quantity}`;   div.appendChild(buttonDiv)
            }


            
    
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
    console.log(localdata.statsplayer.health)
    localStorage.setItem('gamelocaldata',JSON.stringify(localdata));
});

window.PlayerInteraction = async function(objectives){
    if(isChangeScena){return 0}

    const objCenterX = localdata.statsplayer.posx + localdata.statsplayer.width/2;
    const objCenterY = localdata.statsplayer.posy + localdata.statsplayer.height/2;

    for(const chiave in doors){
        const data = localdata.scene[localdata.startscena][doors[chiave]];
        if(data.scena){

        const door = document.getElementById(doors[chiave]);
        const doorCenterX = (door.offsetLeft + (door.offsetWidth >> 1)) / window.innerWidth * 100;
        const doorCenterY = (door.offsetTop + (door.offsetHeight >> 1)) / window.innerHeight * 100;

        const distX = Math.abs(doorCenterX - objCenterX);
        const distY = Math.abs(doorCenterY - objCenterY);
        
        if (distX < 3 && distY < 3) {
            if(!data.key || localdata.inventario.key && localdata.inventario.key[data.key]){
                isChangeScena = true;
                const scroll = [-1,1];
                const addmotiondoor = door.children;
                for(var i = 0; i < addmotiondoor.length;i++){
                    addmotiondoor[i].style.transform = `translateX(${data.scroll.left * 100 * scroll[i]}%) translateY(${data.scroll.top * 100 * -1}%)`;
                }
                audio('effetti',`porte/${data.type}.mp3`,'open',0,door)
                addmotiondoor[0].addEventListener('transitionend', async function() {
                    objectives.style.opacity = 0;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    for(var i = 0; i < addmotiondoor.length;i++){
                        addmotiondoor[i].style.transform = `translateX(${0}%) translateY(${0}%)`;
                    }
                    audio('effetti',`porte/${data.type}.mp3`,'close',0,door)
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
    }

    const props = document.querySelectorAll('.item, .weapon, .key ,.ammon');

    for (const prop of props) {
        const itemClass = prop.classList;
        const category = itemClass[2];
        const itemKey = itemClass[1];
        const itemData = localdata.scene[localdata.startscena].leggenda[prop.id];
    
        if (itemData?.health > 0) {
            const distX = Math.abs((itemData.posx + itemData.width/2) - objCenterX);
            const distY = Math.abs((itemData.posy + itemData.height/2) - objCenterY);
            if (distX + distY < 8) {
                localdata.inventario[category] = localdata.inventario[category] || {};
                localdata.inventario[category][itemKey] = localdata.inventario[category][itemKey] || { quantity: 0 };
    
                localdata.inventario[category][itemKey].quantity += 1;
    
                localdata.inventario[category][itemKey] = { ...itemData, quantity: localdata.inventario[category][itemKey].quantity };
    
                itemData.health = 0;
                prop.remove();
    
                ReloadInventario();
    
                return 1;
            }
        }
    }
    
return 0;
}



window.AiEntity = async function (entitaElem,dino){
        const playerX = localdata.statsplayer.posx
        const playerY = localdata.statsplayer.posy

        const difficolta = (localdata.difficolta)

        let dx = (localdata.statsplayer.posx+localdata.statsplayer.width/2) - (dino.posx+dino.width/2);
        let dy = (localdata.statsplayer.posy+localdata.statsplayer.height/2) - (dino.posy+dino.height/2);

        const now = Date.now();

        const health = localdata.statsplayer.health

        if(Math.abs(dx) + Math.abs(dy) < 10){
            if(!entitaElem.classList.contains('lastattacktime')){
                entitaElem.classList.add('lastattacktime')
                entitaElem.style.backgroundImage = `url(../img/animations/velociraptor/attack.gif)`
                SetLifebar(health - (dino.damage + (difficolta*5)),true)
                audio('creature',`${dino.nome}/attack.mp3`,'attack',0,entitaElem)
                if(health <= 0){
                   isChangeScena = true
                   localdata = null
                   localStorage.removeItem('gamelocaldata');
                   openMenu(3)
                }
                setTimeout(function(){
                    entitaElem.classList.remove('lastattacktime')
                },1000);
            }
        }else{

            if (Math.abs(dx) > Math.abs(dy)) {
                objectMove[dx < 0 ? 2:3](entitaElem, dino,dino.speed+(difficolta/50));
            } else {
                objectMove[dy < 5 ? 0:1](entitaElem, dino,dino.speed+(difficolta/50));
            }
                audio('creature',`${dino.nome}/${Math.abs(dx) + Math.abs(dy) > 50 ? 'run':'walk'}.mp3`,'walk',250,entitaElem)
            entitaElem.style.backgroundImage = `url(../img/animations/velociraptor/walk.gif)`
        }

}

setInterval(function() {
    if(entita){
        if (!isChangePause && !isChangeScena) {
            const scena = localdata.scene[localdata.startscena];
            const playerPosX = localdata.statsplayer.posx + (localdata.statsplayer.width/2);
            for (let i = entita.length - 1; i >= 0; i--) {
                const entitaElem = entita[i];
                const dino = localdata.scene[localdata.startscena].leggenda[entitaElem.id]
    
                if (!entitaElem.classList.contains('angryAt')) {
                    const data = scena.leggenda[entitaElem.id];
                    const distX = (data.posx+data.width/2) - playerPosX;
    
                    if (distX * data.rotation < 0) {
                        entitaElem.classList.add('angryAt');
                    }
                    audio('creature',`${dino.nome}/natural.mp3`,'natural',3000,entitaElem)
                } else {
                    AiEntity(entitaElem,dino);
                }
            }
            
        } else {
            for (let i = entita.length - 1; i >= 0; i--) {
                const entitaElem = entita[i];
                entitaElem.style.backgroundImage = `url(../img/animations/velociraptor/natural.gif)`;
            }
        }
    }
}, 10);



window.RaycastBullutsDamage = async function(objectives,damage,type){

    const objectivesD = objectives.rotation;

    const objectivesF = (objectivesD + 1) / 2;

    const div = document.createElement('div');

    let bulletXY = {
        posx : objectives.posx + objectives.width/2,
        posy : objectives.posy + (objectives.height/3.3)
    }

    div.style.position ='absolute';
    div.style.left = `${bulletXY.posx}%`;
    div.style.top = `${bulletXY.posy}%`;
    div.style.height = "0.5%";
    div.style.width = "1.5%";
    div.style.backgroundColor = "red";
    div.backgroundImage = `url(../img/props/bullets/${type}.jpg)`;
    leggenda.appendChild(div);

    const move = [ObjectivesMoveLeft,ObjectivesMoveRight]

    for (let chiave = (objectivesF ? (100 - bulletXY.posx):bulletXY.posx)/2;chiave >= 0;chiave--) {

        move[objectivesF](div,bulletXY,2);
        if(entita){
            for(let i = entita.length-1 ;i >= 0;i--){
                const bersaglio = localdata.scene[localdata.startscena].leggenda[entita[i].id];
                if (Math.abs(bersaglio.posy + (bersaglio.height/2)  - bulletXY.posy) + Math.abs(bersaglio.posx + (bersaglio.width/2) - bulletXY.posx) < 20) {
                    bersaglio.health -= damage
                    if(bersaglio.health > 0){
                        entita[i].classList.add('angryAt')
                            audio('creature',`${bersaglio.nome}/damage.mp3`,'hurt',200,entita[i])
                    }else{
                        entita[i].remove();
                        entita = document.querySelector('.entity')
                    }
                    div.remove()
                    return 1;
                }
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
            RaycastBullutsDamage(localdata.statsplayer,weapon.damage,type);
            audio('effetti',`${type}/shoot.mp3`,'shoot',0,player)
            if(movementInterval == null){
                if(weapon.shootdelay){
                    setTimeout(function(){
                        isplayershooting = false;
                    },weapon.shootdelay)
                }
                setTimeout(function(){player.style.backgroundImage = `url(../img/animations/player/handgun/${type}.jpg)`},100)
            }
            document.getElementById('equpaggimento-text').innerHTML = `${weapon.chargers} / ${weapon.ammons}`
       }else{
           AutoScribeText(document.getElementById('msgfeedback'), weapon.ammons > 0 ? `Premi ${playercommand[8]} per Ricaricare` : `Munizioni ${localdata.statsplayer.setgun} Finite`);
       }
    }
}

window.PlayerShootReload = function(){
    
    if(!isplayerinreloading){
        const weapon = localdata.inventario.weapon[localdata.statsplayer.setgun];

    if(weapon.chargers < weapon.maxchargers){
        if(weapon.ammons > 0){
            isplayerinreloading = true;
            audio('effetti',`${localdata.statsplayer.setgun}/reload.mp3`,'reload',0,player)
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
    if(cordinates > 22){
        pos.posy = cordinates;
        objectives.style.top = `${cordinates}%`
        return 1
    }
    return 0
}

window.ObjectivesMoveDown = function(objectives,pos,movepx){
    const cordinates = pos.posy + movepx;
    if(cordinates < 70){
        pos.posy = cordinates; 
        objectives.style.top = `${cordinates}%`
        return 1
    }
    return 0
}

window.ObjectivesMoveLeft = function(objectives,pos,movepx){
    const cordinates = pos.posx - movepx;
    if(cordinates >= 0){  
        pos.posx = cordinates;
        pos.rotation = -1;
        objectives.style.left = `${cordinates}%`
        objectives.style.transform = 'scaleX(1)'
        return 1
    }
    return 0
}

window.ObjectivesMoveRight = function(objectives,pos,movepx){
    const cordinates = pos.posx + movepx;
    if(cordinates < 100 - (objectives.offsetWidth / leggenda.offsetWidth * 100)){  
        pos.posx = cordinates;
        pos.rotation = +1;
        objectives.style.left = `${cordinates}%`;
        objectives.style.transform = 'scaleX(-1)'
        return 1
    }
    return 0
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
                objectMove[index](player, localdata.statsplayer)
                startMovement();
            }
            return 1;
        }

        if (isActionKey && movementInterval == null) {
            const actionIndex = playercommand.indexOf(key) - 4;
            playeraction[actionIndex](player, localdata.statsplayer);
        }
    }
    return 1
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

function handleKeyAction(speed) {
    for (let i = 0; i < 4; i++) {
        if (keysPressed[playercommand[i]]) {
            objectMove[i](player, localdata.statsplayer, speed);
        }
    }
}



let lastTime = performance.now();

function updateMovement(time) {
    const deltaTime = time - lastTime;
    lastTime = time;

    const speed = 0.4 * (deltaTime / 16.67);

    handleKeyAction(speed);
    audio('creature', 'player/walk.mp3','walk',250,player);
    player.style.backgroundImage = `url(../img/animations/player/walk.gif)`;
    movementInterval = requestAnimationFrame(updateMovement);
}

function startMovement() {
    if (!movementInterval) {
        lastTime = performance.now();
        movementInterval = requestAnimationFrame(updateMovement);
    }
}


function stopMovement() {
    player.style.backgroundImage = `url(../img/animations/player/natural.gif)`;
    if (movementInterval) {
        cancelAnimationFrame(movementInterval);
        movementInterval = null;
    }
}