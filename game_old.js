const MAP_SIZE = 100;

function isCoord(x,y){
    if (x < MAP_SIZE && x >= 0)
        if (y < MAP_SIZE && y >= 0) return true;
    return false;
}


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

/*
    --- LEXICON DE BUILD TYPES AND SUCH ---

    --- MAP ---
        "c" = copper vein
        "i" = iron vein

    --- BUILDS ---
        ** conveyors **

        "<" = west-conveyor
        ">" = east-conveyor
        "^" = north-conveyor
        "v" = south-conveyor

        "=" = splitter
            - cycles through available directions based on outgoing conveyors

        ** launchers **
        ")" = east-launcher
        "(" = west-launcher
        "u" = south-launcher
        "n" = north-launcher


        "d" = depot
            - for stowage of processed items
            - only get 1

        ** drillers **
        "c" = copper driller
            - free, does not cost anything

        "i" = iron driller
            - costs 10 copper ingots


        ** fabrication **

        "s" = smelter
            - for smelting ore into ingots
            - free, does not cost anything

        "a" = alloyer
            - for combining two different metal ingots
            - costs 20 iron ingots and 30 copper ingots

        "S" = steel fabricator
            - combines iron and coal to make steel
            - costs 20 bronze ingots, 30 iron ingots, and 40 copper ingots 

    --- ITEMS ---
        ** tier 0 **
        "f" = fuel ie coal

        ** tier 1 **

        "c" = copper ore 
        "C" = copper ingot

        ** tier 2 **

        "i" = iron ore
        "I" = iron ingot

        ** tier 3 ** 
        "B" = bronze ingot
            - combining iron and copper together

        ** tier 4 **
        "S" = steel ingot
            - combining iron and coal together

    --- NOTES ---
    the only kind of item that can be deposited is
    an ingot, since that is used to make things
*/


function getSaveObject(){
    return{
        "map" : map,
        "builds" : builds,
        "buildData" : buildData,
        "items" : items,
        "currency" : currency
    }
}


function downloadGame(){
    let saveName = document.getElementById("saveFileName").value;
    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(getSaveObject())], {type: 'application/json'})
    a.href = URL.createObjectURL(file);
    a.download = saveName; 
    a.click();
}
