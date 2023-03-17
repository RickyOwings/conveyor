// #region 2D Arrays

const MAP_SIZE = 100;

/** Takes in (x ,y) coord and returns
 * if it is on the map
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
function isCoord(x,y){
    if (x < MAP_SIZE && x >= 0)
        if (y < MAP_SIZE && y >= 0) return true;
    return false;
}



/** takes in object with x, y and char values to init a 2DArray   
 * @param  {Object} args 
 * @returns 
 */
function create2DArray(...args){
    let temp = [];
    for(let i = 0; i < MAP_SIZE; i++)
        temp.push(new Array(MAP_SIZE));

    for(let i in args){
        let arg = args[i];
        if (typeof arg.x != 'number') throw 'arg.x is not number';
        if (typeof arg.y != 'number') throw 'arg.y is not number';
        if (!isCoord(arg.x, arg.y)) throw 'is not valid coord';
        if (arg.char.length != 1) throw 'char is not char';
        temp[arg.x][arg.y] = arg.char;
    } 
    return temp;
}

let randomLocations = [];
/**
 * takes in a char, and returns an object with random x, y position with char
 * value of inputted char
 * @param {String} char 
 * @returns 
 */
function randomLocationObject(char){
    while (true){
        let x = Math.floor(Math.random() * 100);
        let y = Math.floor(Math.random() * 100);
        let isOriginal = true;
        for (let i in randomLocations){
            let loc = randomLocations[i];
            if (loc.x == x && loc.y == y) isOriginal = false; break;
        }
        if (isOriginal) {

            randomLocations.push({x:x, y:y});

            return {
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100),
            char: char
            }
        }

    }
}


let map = create2DArray(
    randomLocationObject('i'),
    randomLocationObject('c'), 
    randomLocationObject('f'),
);
let builds = create2DArray();
let buildData = create2DArray();
let items = create2DArray();


/**
 * Function that gets the map, builds, buildData, items, and currency
 * stored in an object to simplify jsonify process 
 * @returns 
 */
function getSaveObject(){
    return {
        "map" : map,
        "builds" : builds,
        "buildData" : buildData,
        "items" : items,
        "currency" : currency
    }
}

/**
 * Downloads the game state to a json file
 */
function downloadGame(){
    let saveName = document.getElementById("saveFileName").value;
    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(getSaveObject())], {type: 'application/json'})
    a.href = URL.createObjectURL(file);
    a.download = saveName; 
    a.click();
}

//#endregion



/**
 * Div that all of the game elements are stored within
 */
const game = document.getElementById("game");
/**
 * A div that acts as a way for the user to visually see where they are
 * placing a tile
 */
const selector = document.getElementById("selector");
/**
 * An img element within the selector that changes it's image based on what 
 * building is selected
 */
const selectorPrev = document.getElementById("selectorPrev");
/**
 * A 'p' element within the selector that displays the name and price of the selected build
 */
const label = document.getElementById("selectorLabel");

/**
 * Represents which place mode the user is on. Can be either
 * "place" or "remove"
 */
let selectMode = "place";
/**
 * What image the user has selected to place. It is initialized
 * as "./images/blank.png"
 */
let selectorSRC = './images/blank.png';
/**
 * Boolean for determining if a depot has been placed.
 * It hard caps the amout of depots to 1
 */
let isDepot = false;



/**
 * An object that stores all of the
 * item image urls, grouped by their respective symbol 
 */
const itemURLDict = {
    'c' : './images/copper_ore.png',
    'C' : './images/copper_ingot.png',
    'i' : './images/iron_ore.png',
    'I' : './images/iron_ingot.png',
    'f' : './images/coal_ore.png',
    'B' : './images/bronze_ingot.png',
}
/**
 * An object that stores all of the drill speeds. 
 * Sorted by their respective symbol
 */
const drillerSpeeds = {
    'b' : 2, // bronze drill speed
    'c' : 8, // copper drill speed
    'i' : 8, // iron drill speed
    'f' : 4, // fuel/coal drill speed
}
/**
 * An object that stores the respective drill
 * building symbols grouped by their img url. A special
 * object is used due to the logic that allows them to only
 * be placed on their respective ore
 */
const drillsDict = {
    './images/copper_drill.gif' : 'c',
    './images/iron_drill.gif' : 'i',
    './images/coal_drill.gif' : 'f',
    './images/bronze_drill.gif' : 'b'
}
/**
 * An object that stores all of the currencies that the 
 * user has.
 */
let currency = {
    'f' : 0, // coal
    'C' : 0, // copper ingots
    'I' : 0, // iron ingots
    'B' : 0 // bronze ingots
}

/**
 * An object who stores all of the prices (logically) 
 * for any inputted building. Can mutate to change the prices
 * on different items dynamically
 */
const prices = {
    '<' : {'f': 5},
    '>' : {'f': 5},
    '^' : {'f': 5},
    'v' : {'f': 5},
    'b' : {'B': 600},
    'i' : {'C': 200},
    'c' : {'f': 100},
    's' : {'f': 50},
    '(' : {'I': 10},
    ')' : {'I': 10},
    'n' : {'I': 10},
    'u' : {'I': 10},
    '=' : {'C': 10},
    'a' : {'I': 400}
}
/**
 * An object that stores all of the html for the resepective currencies
 */
const currencyHTML = {}

/**
 * Depending on the currencies in the "currency" object, we add the html dynamically
 * for the resepective currencies. This shows up in the top right corner
 */
for(let key in currency){
    let td = document.createElement("td");
    let img = document.createElement("img");
    let div = document.createElement("div");
    div.innerHTML = currency[key];
    img.src = itemURLDict[key];
    img.width = 50;
    img.style = "image-rendering:pixelated"
    td.appendChild(div);
    td.appendChild(img);
    td.style=`
        display: flex; 
    `
    currencyHTML[key] = div;
    document.getElementById('currencyTable').appendChild(td);
}

/**
 * Function which updates the prices within the HTML to match
 * that in the "currency" object
 */
function reloadCurrencyHTML(){
    for(let k in currencyHTML){
        currencyHTML[k].innerHTML = currency[k];
    }
}


/**
 * Determines if the user can affort a certain building
 * based on the amount of currency and price of input build
 * item
 * @param {String} buildSymbol 
 * @returns {Boolean}
 */
function canAfford(buildSymbol){
    let price = prices[buildSymbol];
    if(price == undefined) return true;
    for(let type in price){
        if (currency[type] < price[type]) return false;
    }
    return true;
}
/**
 * Converts url to its respective building symbol. The function is 
 * kind of redundant, because of the urlBuildingDict object but prevents
 * potential mutation of the urlBuildingDict
 * @param {String} url 
 * @returns {String}
 */
function urlToBuildingName(url){
    return urlBuildingDict[url];
}

/**
 * Object that stores the respective buildings symbols
 * keyed with the input image url
 */
const urlBuildingDict = {
    './images/copper_drill.gif': 'c',
    './images/iron_drill.gif': 'i',
    './images/coal_drill.gif': 'f',
    './images/bronze_drill.gif': 'b',
    './images/smelter.gif': 's',
    './images/depot.png': 'd',
    './images/conveyor_east.gif': '>',
    './images/conveyor_west.gif': '<',
    './images/conveyor_north.gif': '^',
    './images/conveyor_south.gif': 'v',
    './images/launcher_east.gif': ')',
    './images/launcher_west.gif': '(',
    './images/launcher_north.gif': 'n',
    './images/launcher_south.gif': 'u',
    './images/splitter.png': '=',
    './images/alloyer.gif': 'a',
    './images/blank.png': undefined,
}
/**
 * The inverse version of the above object that gets generated by the for loop
 */
const inverseBuildingDict = {
}


// generating the inverse key value pairs based on the buildingDict
for(let k in urlBuildingDict){
    inverseBuildingDict[urlBuildingDict[k]] = k;
}

/**
 * Function that does all that is required to set the players
 * build mode to remove
 */
function removeMode(){
    label.innerHTML = "";
    selectorPrev.src = "./images/blank.png"
    selectMode = "remover";
    selector.dataset.mode = "remover";
}




/**
 * Function who changes which building
 * the user has selected. 
 * @param {String} imgSrc 
 */
function placeMode(imgSrc = "./images/blank.png"){
    // generate the text displayed in the selector label
    let labelText = imgSrc
                    .replace("./images/", "")
                    .replace(".gif", "")
                    .replace(".png", "")
                    .replace("blank", "")
                    .replace("_"," ");

    // determine building symbol of the imgSrc
    let asBuild = urlToBuildingName(imgSrc);
    // determine the price of said bulding
    let price = prices[asBuild];
    // if the price exists, then display the price in the label
    if (price!=undefined){
        labelText+=`<br>`
        for(let type in price){
            let typeText = itemURLDict[type];
            typeText = typeText
                .replace("./images/", "")
                .replace(".png", "");
            labelText+=`${price[type]} ${typeText}(s)`
        }
    }
    // setting the label's html to the labelText string
    label.innerHTML = labelText;
    selectMode = "place"
    selectorPrev.src = imgSrc;
    selectorSRC = imgSrc;
    selector.dataset.mode = "place";
}


// an interval that repeatedly places if the user is pressing left mouse
setInterval(()=>{
    if(INPUT.mouse0) place();
},10)

/**
 * Function for handling user placement
 */
function place(){
    // getting the building symbol that the usr is placing
    let buildingName = urlToBuildingName(selectorSRC);
    if (selectMode == "place"){
        // place mode
        if (buildingName == undefined) return;
        placeTile(INPUT.xTile, INPUT.yTile, buildingName)

    }else{
        // remove mode
        removeTile(INPUT.xTile, INPUT.yTile);
    }
}

/** Function who tries to place a given building at a given coordinate
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} symbol 
 */
function placeTile(x, y, symbol){


    // ----------------- CANT PLACE CHECKS ----------------- 
    // If coord is not on map
    if (!isCoord(x,y)){
        selectorPrev.src = './images/out_of_range.png';
        return;
    }
    // If can't place building at coordinate
    if (!canPlace(x,y,symbol)){
        selectorPrev.src = './images/cant_place.png'
        return;
    }
    // If can't afford given building
    if (!canAfford(symbol)){
        selectorPrev.src = './images/poor.png';
        return;
    }

    if (depotLimit(symbol)) return;

    // ----------------- CANT PLACE CHECKS ----------------- 


    // if there is already a tile built, then don't place
    if (builds[x][y] != undefined) return;
    let tile = document.getElementById(`bx${x}y${y}`);
    if (tile == undefined){
        tile = createBuildIMG(x,y,selectorSRC)
    }
    // updating the array
    builds[x][y] = symbol;
    // updating visual representation
    tile.className = "tile buildTile"
    tile.src = selectorSRC;
    if(!Object.keys(prices).includes(symbol)) return;
    let price = prices[symbol];
    for(let type in price){
        currency[type] -= price[type];
        currencyHTML[type].innerHTML = currency[type];
    }
}
/** Function which, if the symbol is a depot, will return
 * depending if there is a depot or not
 * @param {String} symbol 
 * @returns {Boolean}
 */
function depotLimit(symbol){
    if(symbol != 'd') return false;
    if(isDepot) return true;
    isDepot = true;
    return false;
}

function removeDepot(symbol){
    if(symbol != 'd') return;
    isDepot = false;
}

/** Determines if the given building can be built at a given location
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} symbol 
 * @returns 
 */
function canPlace(x,y,symbol){
    let mapTile = map[x][y];     
    if (mapTile == undefined){
        return !Object.values(drillsDict).includes(symbol);
    }
    if (symbol == 'b') return true;
    if (symbol == mapTile) return true;
    return false;
}

/** Function who tries to remove a tile at a given location
 * @param {Number} x 
 * @param {Number} y 
 */
function removeTile(x, y){
    // checks if nothing exists at given tile
    if (builds[x][y] == undefined) return;
    let symbol = builds[x][y];
    removeDepot(symbol);
    builds[x][y] = undefined;
    let tile = document.getElementById(`bx${x}y${y}`);
    tile.remove();
    buildData[x][y] = undefined;
    if(Object.keys(prices).includes(symbol)){
        for(let type in prices[symbol]){
            currency[type] += prices[symbol][type];
            currencyHTML[type].innerHTML = currency[type];
        }
    }
}


const TILE_SIZE = 16;
const GAME_SIZE = TILE_SIZE * MAP_SIZE;
game.style.width = `${GAME_SIZE}px`;
game.style.height = `${GAME_SIZE}px`;

let cameraZoom = 0.5;
let MAX_ZOOM = 15;
let MIN_ZOOM = 0.4;
let cameraPosition = [0,0];
let MAX_DIST = TILE_SIZE * MAP_SIZE/2;

// camera movement
const INPUT = {
    "mouse0" : false,
    "mouse1" : false,
    "mouse2" : false,
    "xTile" : undefined,
    "yTile" : undefined,
}

document.addEventListener('contextmenu', event => event.preventDefault());
game.addEventListener('mousedown',(event)=>{
    switch(event.button){
        case 0: INPUT.mouse0 = true; break; 
        case 1: INPUT.mouse1 = true; break; 
        case 2: INPUT.mouse2 = true; break; 
    }
    if (INPUT.mouse2) placeMode();
});
window.addEventListener('mouseup',(event)=>{
    switch(event.button){
        case 0: INPUT.mouse0 = false; break; 
        case 1: INPUT.mouse1 = false; break; 
        case 2: INPUT.mouse2 = false; break; 
    }
});
game.addEventListener('wheel',(event)=>{
    cameraZoom *= 1.2 ** (-event.deltaY / 100)
    if (cameraZoom > MAX_ZOOM) cameraZoom = MAX_ZOOM;
    if (cameraZoom < MIN_ZOOM) cameraZoom = MIN_ZOOM;
    cameraScale();
})

window.addEventListener('mousemove',(event)=>{
    updateSelectorPos(event);
    if(INPUT.mouse1){ 
    cameraPosition = [
        cameraPosition[0] - event.movementX / cameraZoom,
        cameraPosition[1] - event.movementY / cameraZoom
    ];
    limitCamPos();
    }
    cameraMove();
    cameraScale();
})
cameraMove();
cameraScale();

function limitCamPos(){
    if (cameraPosition[0] > MAX_DIST) cameraPosition[0] = MAX_DIST;
    if (cameraPosition[0] < -MAX_DIST) cameraPosition[0] = -MAX_DIST;
    if (cameraPosition[1] > MAX_DIST) cameraPosition[1] = MAX_DIST;
    if (cameraPosition[1] < -MAX_DIST) cameraPosition[1] = -MAX_DIST;
}

function limitCamZoom(){
    if (cameraZoom > MAX_ZOOM) cameraZoom = MAX_ZOOM;
    if (cameraZoom < MIN_ZOOM) cameraZoom = MIN_ZOOM;
}


function updateSelectorPos(event){
    let x = event.x - window.innerWidth / 2;
    let y = event.y - window.innerHeight / 2;
    if (!x | !y){
        x = 0;
        y = 0;
    }
    let zx = x / cameraZoom;
    let zy = y / cameraZoom;
    let dx = zx + cameraPosition[0];
    let dy = zy + cameraPosition[1];
    let tx = Math.floor(dx/16 + MAP_SIZE/2);
    let ty = Math.floor(dy/16 + MAP_SIZE/2);
    INPUT["xTile"] = tx;
    INPUT["yTile"] = ty;
    selector.style.transform = `translate(${tx * TILE_SIZE}px, ${ty * TILE_SIZE}px)`;
    label.style.transform = `translate(${((tx - 2) * TILE_SIZE) * 5}px, ${((ty - 2)  * TILE_SIZE) * 5}px)`
}




// KEYBINDS
window.addEventListener('keydown', (event)=>{
    let camMoved = false;
    switch(event.key){
        case 'a': placeMode('./images/conveyor_west.gif'); break;
        case 'd': placeMode('./images/conveyor_east.gif'); break;
        case 'w': placeMode('./images/conveyor_north.gif'); break;
        case 's': placeMode('./images/conveyor_south.gif'); break;
        case 'c': placeMode('./images/copper_drill.gif'); break;
        case 'z': placeMode('./images/iron_drill.gif'); break;
        case 'h': placeMode('./images/depot.png'); break;
        case 'f': placeMode('./images/smelter.gif'); break;
        case 'i': placeMode('./images/launcher_north.gif'); break;
        case 'j': placeMode('./images/launcher_west.gif'); break;
        case 'k': placeMode('./images/launcher_south.gif'); break;
        case 'l': placeMode('./images/launcher_east.gif'); break;
        case 'x': placeMode('./images/coal_drill.gif'); break;
        case 'e': placeMode('./images/splitter.png'); break;
        case 'q': placeMode('./images/depot.png'); break;
        case 'Shift': INPUT.mouse1 = true; break;
        case '1':
        case '=':
            cameraZoom *= 1.2; 
            camMoved = true;
        break;

        case '-':
        case '2':
            cameraZoom /= 1.2; 
            camMoved = true;
            break;
        case 'r': removeMode(); break;

        case 'ArrowLeft':
            instantSelectorMove();
            camMoved = true;
            cameraPosition[0]-=16; 
        break;
        case 'ArrowRight':
            instantSelectorMove();
            camMoved = true;
            cameraPosition[0]+=16; 
        break;
        case 'ArrowUp':
            instantSelectorMove();
            camMoved = true;
            cameraPosition[1]-=16; 
        break;
        case 'ArrowDown':
            instantSelectorMove();
            camMoved = true;
            cameraPosition[1]+=16; 
        break;
        case 'Enter':
        case ' ':
            INPUT.mouse0 = true;
        break;

    }
    if (camMoved){
        updateSelectorPos(event);
        limitCamPos();
        limitCamZoom();
        cameraMove();
        cameraScale();   
    }
})

window.addEventListener('keyup', (event)=>{
    switch(event.key){
        case 'Shift': INPUT.mouse1 = false; break;
        case ' ':
        case 'Enter': 
        INPUT.mouse0 = false
    }
})

function instantSelectorMove(){
    let temp = selector.style.transition;
    selector.style.transition = "transform 0s";
    label.style.transition = "transform 0s";
    setTimeout(()=>{
        selector.style.transition = temp;
        label.style.transition = temp;
    },20)
}
function cameraMove(){
    // update game styles
    game.style.transform = `translate(${Math.round(-cameraPosition[0] * cameraZoom)/cameraZoom+0.5}px, ${Math.round(-cameraPosition[1] * cameraZoom)/cameraZoom+0.5}px)`

}
function cameraScale(){
    game.style.scale = cameraZoom;
}


function initMapTiles(){
    for(let x = 0; x < MAP_SIZE; x++){
        for(let y = 0; y < MAP_SIZE; y++){
            if (map[x][y] == undefined) continue;
            let src;
            switch(map[x][y]){
                case "c":
                    src = "./images/copper.png"
                break;
                case "i":
                    src = "./images/iron.png"
                break;
                case "f":
                    src = "./images/coal.png"
                break;

            }
            if (src == undefined) continue;
            let img = document.createElement("img");
            img.classList.add("mapTile");
            img.classList.add("tile");
            img.src = src;
            img.style.left = `${x * 16}px`
            img.style.top = `${y * 16}px`
            game.appendChild(img);
        }
    }
}

function initBuildTiles(){
    for(let x = 0; x < MAP_SIZE; x++){
        for(let y = 0; y < MAP_SIZE; y++){
            let src = inverseBuildingDict[builds[x][y]];
            if (!src) continue;
            createBuildIMG(x,y,src);
            if (buildData[x][y] == 'smelting') buildData[x][y] = [];
        }
    }
}

function initItems(){
    for(let x = 0; x < MAP_SIZE; x++){
        for(let y = 0; y < MAP_SIZE; y++){
            if (!items[x][y]) continue;
            new itemGraphic(x,y,items[x][y]);
        }
    }
}



function createBuildIMG(x,y,src){
    let img = document.createElement("img");
    img.classList.add("buildTile");
    img.classList.add("tile");
    img.id = `bx${x}y${y}`
    img.src = src;
    img.style.left = `${x * 16}px`
    img.style.top = `${y * 16}px`
    game.appendChild(img);
    return img;
}

initMapTiles();

let TICK_MS = 1000/32;

let runningItemLoop = false;
function itemLoop(){
    runningItemLoop = true;
    for(let x = 0; x < MAP_SIZE; x++){
        for(let y = 0; y < MAP_SIZE; y++){
            let building = builds[x][y];
            if (building == undefined) continue;
            switch (building){
                case '>':

                break;
                case '<':
                    
                break;
                case '^':
                    
                break;
                case 'v':
                    
                break;
                case 'c':
                    drillerLogic(x,y,'c');
                break;
                case 'i':
                    drillerLogic(x,y,'i');
                break;
                case 'f':
                    drillerLogic(x,y,'f');
                break;
                case 'b':
                    drillerLogic(x,y, 'b')
                break;
                case 's':
                    smelterLogic(x,y);
                break;
                case 'd':
                    
                break;
                case 'a':
                    alloyerLogic(x,y)
                break;
            }
        }
    }
    garbageCollection();
    for(let i in itemGList){
        let item = itemGList[i];
        item.move();
    }
    runningItemLoop = false;
    setTimeout(itemLoop, TICK_MS);
}
setTimeout(itemLoop, TICK_MS);



function drillerLogic(x,y,buildingSymbol){
    let symbol;
    if (buildingSymbol == 'b'){
        symbol = map[x][y];
    } else {
        symbol = buildingSymbol;
    } 
    let outputs = availableOutputs(x,y, symbol);
    if (buildData[x][y] == undefined) buildData[x][y] = 0;
    if (!outputs) return;
    buildData[x][y]++;
    // randomise between ouputs
    if (buildData[x][y] > drillerSpeeds[buildingSymbol]){
        buildData[x][y] = 0
    } else return;

    let output = outputs[Math.floor(Math.random() * outputs.length)];
    let [ox, oy] = output;
    items[ox][oy] = symbol;
    new itemGraphic(ox, oy, symbol);
}


let SMELT_TIME = ()=> TICK_MS * 32;
function smelterLogic(x,y){
    if(buildData[x][y] == "smelting") return;
    if (buildData[x][y] == undefined) buildData[x][y] = [];
    let items = buildData[x][y];
    if (items.length != 2) return;
    let ore = items.filter(item => item != 'f');
    let ingot = ore[0].toUpperCase();
    buildData[x][y] = "smelting";
    setTimeout(()=>{
        let checkOutputs = setInterval(()=>{
            if (builds[x][y] != 's') clearInterval(checkOutputs);
            let outputs = availableOutputs(x,y, ingot);
            if (outputs){
                let output = outputs[Math.floor(outputs.length * Math.random())]
                new itemGraphic(output[0], output[1], ingot)
                buildData[x][y] = [];
                clearInterval(checkOutputs);
            }
        }, TICK_MS)
    }, SMELT_TIME())
}

function alloyerLogic(x,y){
    if(buildData[x][y] == "smelting") return;
    if (buildData[x][y] == undefined) buildData[x][y] = [];
    let items = buildData[x][y];
    if (items.length != 3) return;
    if (!(items.includes('I') && items.includes('C') && items.includes('f'))) return;
    let ingot = 'B'
    buildData[x][y] = "smelting";
    setTimeout(()=>{
        let checkOutputs = setInterval(()=>{
            if (builds[x][y] != 'a') clearInterval(checkOutputs);
            let outputs = availableOutputs(x,y, ingot);
            if (outputs){
                let output = outputs[Math.floor(outputs.length * Math.random())]
                new itemGraphic(output[0], output[1], ingot)
                buildData[x][y] = [];
                clearInterval(checkOutputs);
            }
        }, TICK_MS)
    }, SMELT_TIME())
}


let itemGList = [];

function garbageCollection(){
    itemGList = itemGList.filter((item)=>{
        return !item.garbage
    });
}

class itemGraphic{
    garbage = false;
    constructor(x, y, symbol){
        this.timer = 0;
        this.x = x;
        this.y = y;
        items[x][y] = symbol;
        this.symbol = symbol;
        let deadItems = document.getElementsByClassName("invisible deadItem");
        if(deadItems.length > 0){
            for(let i = 0; i < deadItems.length; i++){
                let testIMG = new Image();
                testIMG.src = itemURLDict[symbol];
                if (deadItems[i].src == testIMG.src){
                    this.html = deadItems[i];
                    break;
                }
            }
        }
        if(this.html == undefined){
            this.html = document.createElement('img');
            this.html.src = itemURLDict[symbol];
        }
        this.html.className = "tile itemTile"
        this.html.style.transform = `translate(${this.x * TILE_SIZE}px, ${this.y * TILE_SIZE}px)`
        game.appendChild(this.html);
        itemGList.push(this);
    }
    move(){
        this.timer++;
        if (this.timer < 3) return;
        this.timer = 0;
        let onTopOf = builds[this.x][this.y];
        switch(onTopOf){
            // ----------- CONVEYORS -----------
            case '<':
                this.trymove([-1,0]);
            break;
            case '>':
                this.trymove([1,0]);
            break;
            case '^':
                this.trymove([0,-1]);
            break;
            case 'v':
                this.trymove([0,1]);
            break;

            // ----------- LAUNCHERS -----------
            case '(':
                this.trymove([-2, 0]);
            break;
            case ')':
                this.trymove([2, 0]);
            break;
            case 'n':
                this.trymove([0, -2]);
            break;
            case 'u':
                this.trymove([0, 2]);
            break;
            // ----------- SPLITTERS -----------
            case '=':
                let options = availableOutputs(this.x, this.y, this.symbol);
                if(!options) return;
                let option = options[Math.floor(Math.random() * options.length)];
                this.updateItemArray(...option);
                this.x = option[0];
                this.y = option[1];
                this.updateTransforms();
            break;
            // ------------ SMELTER ------------
            case 'a':
            case 's':
                this.deposit();
            break;

            // ------------- DEPOT -------------
            case 'd':
                this.stash();
            break;

            case 'c':
            case 'f':
            case 'i':
            default:
                this.die();
            break;
        }
    }
    deposit(){
        if (this.symbol == 'B') return;
        if (buildData[this.x][this.y] == undefined) buildData[this.x][this.y] = [];
        if (buildData[this.x][this.y].includes(this.symbol)) return;
        buildData[this.x][this.y].push(this.symbol);
        this.die();
    }
    updateItemArray(x,y){
        items[this.x][this.y] = undefined;
        items[x][y] = this.symbol;
    }
    updateTransforms(){
        this.html.style.transform = `translate(${this.x * TILE_SIZE}px, ${this.y * TILE_SIZE}px)`
    }
    die(){
        this.garbage = true;
        this.html.className = "invisible deadItem tile";
        items[this.x][this.y] = undefined;
    }
    trymove(delta){
        let target = [
            this.x + delta[0],
            this.y + delta[1]
        ]
        // if coord inputed is not on the board
        if(!isCoord(...target)) return;
        // if the place it is trying to go has an item
        if (items[target[0]][target[1]] != undefined) return;
        // if the place it is trying to go is full
        if (checkIfFull(...target, this.symbol)) return;
       
        // it can move!!!
        this.updateItemArray(...target)
        this.x = target[0]; 
        this.y = target[1];
        this.updateTransforms();
    }
    stash(){
        if(!Object.keys(currency).includes(this.symbol)){
            this.die()
            return;
        } 
        currency[this.symbol]++;
        currencyHTML[this.symbol].innerHTML = currency[this.symbol];
        this.die();
    }
}


function checkIfFull(x,y,symbol){
    // if the tile is not a smelter
    if(!['a','s'].includes(builds[x][y])) return false;

    // if the symbol passed in is an ingot
    if(symbol.toUpperCase() == symbol && builds[x][y] == 's') return true;

    // check if input to alloyer is an ore
    if(['c','i', 'B'].includes(symbol) && builds[x][y] == 'a') return true;
    // if the build data is smelting
    if(buildData[x][y] == 'smelting') return true;

    // if the build data indicates that it is not an array
    if(typeof buildData[x][y] != 'object') return false;

    // if the build data contains the input already
    if(buildData[x][y].includes(symbol)) return true;

    // if the smelter has reached max capacity
    if (buildData[x][y].length == 2 && builds[x][y] == 's') return true;
    // fi the alloyer has reached max capacity
    if (buildData[x][y].length == 3 && builds[x][y] == 'a') return true;

    // if the item in question is a metallic ore, and there is not already
    // a mettalic ore in the list, return true, else return false
    if (['c', 'i'].includes(symbol) && builds[x][y] == 's'){
        let withoutCoal = buildData[x][y].filter(item => item != 'f');
        if (withoutCoal.includes('c') || withoutCoal.includes('i')){
            return true;
        }
        return false;
    }

    if (['I', 'C'].includes(symbol) && builds[x][y] == 'a'){
        let withoutCoal = buildData[x][y].filter(item => item != 'f');
        if (withoutCoal.includes(symbol)){
            return true;
        }
    }

    return false;
}


function availableOutputs(x,y, symbol){
    let outputs = [];
    // check west
    if (isCoord(x - 1, y))
        if (['<', '^', 'v','=','s','(', 'n','u','d'].includes(builds[x - 1][y])){
            if (!(builds[x - 1][y] == 's' && checkIfFull(x - 1, y,symbol)))
                if (items[x - 1][y] == undefined) outputs.push([x - 1, y]);
        }
    // check east
    if (isCoord(x + 1, y))
        if (['>', '^', 'v','=','s', 'n', 'u',')','d'].includes(builds[x + 1][y])){
            if (!(builds[x + 1][y] == 's' && checkIfFull(x + 1, y,symbol)))
                if (items[x + 1][y] == undefined) outputs.push([x + 1, y]);
        }
    // check south 
    if (isCoord(x, y + 1))
        if (['>', 'v', '<','=','s', ')', 'u', '(','d'].includes(builds[x][y + 1])){
            if (!(builds[x][y + 1] == 's' && checkIfFull(x, y + 1,symbol)))
                if (items[x][y + 1] == undefined) outputs.push([x, y + 1]);
        }
    // check north
    if (isCoord(x, y - 1))
        if (['>', '^', '<','=','s', ')', 'n', '(', 'd'].includes(builds[x][y - 1])){
            if (!(builds[x][y - 1] == 's' && checkIfFull(x, y - 1,symbol)))
                if (items[x][y - 1] == undefined) outputs.push([x, y - 1]);
        }
    if (outputs.length == 0) return false;
    return outputs;
}
function loadGame(){
    let saveFile = document.getElementById("saveFileInput");
    if (saveFile.files.length){
        let reader = new FileReader();

        reader.onload = (e) =>{
            console.log(e)
            updateGameFromLoad(e.currentTarget.result);
        }
        reader.readAsBinaryString(saveFile.files[0]);
    }
}
function updateGameFromLoad(data){
    let dataJSON = JSON.parse(data);
    console.log(dataJSON);
    deleteAllThings();
    addNewThings(dataJSON);
}


function deleteAllThings(){
    let tiles = game.getElementsByClassName("tile");
    while (tiles.length) {
        tiles[0].remove();
        tiles = game.getElementsByClassName("tile");
    }
    itemGList = [];
}

function addNewThings(dataJSON){
    let newMap = dataJSON["map"];
    let newBuilds = dataJSON["builds"];
    let newBuildData = dataJSON["buildData"];
    let newItems = dataJSON["items"];
    if (
        checkArray2d(newMap) &&
        checkArray2d(newBuilds) &&
        checkArray2d(newBuildData) &&
        checkArray2d(newItems) 
    ){
        console.log("save is good");
    } else {
        console.log("save is not good");
        return;
    }
    map = newMap;
    builds = newBuilds;
    buildData = newBuildData;
    items = newItems;
    currency = dataJSON["currency"];
    initMapTiles();
    initBuildTiles();
    initItems();
    reloadCurrencyHTML();
}


function checkArray2d(array2d){
    for(let x in array2d){
        if (array2d[x].length != MAP_SIZE) return false;
    }
    return true;
}
