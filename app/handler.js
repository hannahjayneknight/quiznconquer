
/*jslint maxlen: 100 */
import F from "./usefulfunctions.js";
import dbH from "./dbHandler.js";

// NB: this object is only used on the server side
const H = Object.create(null);

const playerclasses = [
    [1, 2],
    [3, 4]
];

/*
generates the starting board which looks like the following:
H.startBoard =
[
    1, 1, 1, 2, 2, 2,
    1, 1, 1, 2, 2, 2,
    1, 1, 1, 2, 2, 2,
    3, 3, 3, 4, 4, 4,
    3, 3, 3, 4, 4, 4,
    3, 3, 3, 4, 4, 4
]

*/
H.startBoard = function () {
    let arr = F.sequence(36);
    F.sequence(36).forEach(
        function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        arr.splice( element , 1, ourclass);
        });
    return arr;
};

// takes in the dictionary to be used and returns an array with the word
// as the first value and the translation as the second
H.generateWord = function (dictionary) {
    const randomNumber =
        F.getRandomInt(0, Object.keys(dictionary).length);
    return Object.entries(dictionary)[randomNumber];
};

// THE TIMER
H.startTimer = function (players, games) {
    const mins = 0.5;
    const now = Date.now();
    const deadline = mins * 60 * 1000 + now;

    let timerID = setInterval(function () {
        let currentTime = Date.now();
        let distance = deadline - currentTime;
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (parseInt(seconds) === 0) {
            clearInterval(timerID);
            // removes game code from the games obj
            if (players[0] !== undefined) {
                games.removeGame = players[0].myprivatedata.gameCode;
            }

            players.forEach(function (thisws) {

                thisws.send(JSON.stringify({
                "timer": seconds,
                "gameStatus": "gameOver"
                }));

                thisws.myprivatedata.gameStatus = "not playing";
            });
        } else {
            players.forEach( function (thisws) {

                thisws.send(JSON.stringify({
                                "timer": seconds,
                                "gameStatus": "playing"
                }));

                thisws.myprivatedata.gameStatus = "playing";
            });
        }
    // rather than change html, the server will send
    // JSON.stringify({"timer": seconds})
    }, 500);
    players.forEach((thisws) => thisws.send(JSON.stringify({
        "timer": 30,
        "gameStatus": "playing"
    })));
};

// a function that finds a free tile to change the colour of
// ensures that the tile is not the winning player's own tile
// and that it is close to the tiles they currently own
H.freeTile = function (playerNumber, currentBoard) {
    // firstly finds all the tiles currently owned by the winning player
    const winnersTiles = [];
    currentBoard.forEach( function (element, index) {
        if (element === (playerNumber)) {
            winnersTiles.push(index);
        }
    } );
    // if the player owns no tiles
    if (!(Array.isArray(winnersTiles) && winnersTiles.length)) {
        return F.getRandomInt(0, 35);
    } else {
        // loops through all the tiles currently owned by the player
        // and adds all the surrounding tiles to surrounding
        let surrounding = [];
        winnersTiles.forEach(function (element) {
            surrounding.push.apply(
                surrounding,
                surroundingTiles(element)
                );
        });
        // removes tiles which belong to the winner and duplicates removing
        // duplicates ensures that all surrounding tiles have an equal chance
        // of being picked
        const freeTiles = F.uniq(F.diff(surrounding, winnersTiles));
        const randomNumber = F.getRandomInt(0, freeTiles.length - 1);
        // finds a random tile out of the ones that are free
        const randomTile = freeTiles[randomNumber];
        // NB: randomTile will be undefined when the board is full
        // ie a player has won. This is handled by the server
        return randomTile;
    }

};


/*
Div-numbers of the tileboard, laid out in a multidimensional array.
This is used for the surroundingTiles() function.

*/
H.divNums = () => [
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],
    [30, 31, 32, 33, 34, 35]
];

// surrounding tiles finds the surrounding tiles of an element within the
// constrains of the board, ie it will not return a tile on the other side
// of the board which would be considered a surrounding tile if the board were
// one dimensional
const surroundingTiles = function (element) {
    const directions = [
        // {x: -1, y:-1},
        {x:-1, y:0},
        // {x: -1, y:1},
        {x: 0, y:1},
        // {x:1, y:1},
        {x:1, y:0},
        // {x:1, y: -1},
        {x:0, y: -1}
    ];
    const res = [];
    const xy = H.getIndexOfK(element);
    // for each of the options of directions,
    // we add the x and y index that was parsed in
    // to find the change in x or y
    directions.forEach( function (element) {
        const cx = xy[0] + element.x;
        const cy = xy[1] + element.y;
        // if cx and cy are not negative or greater
        // than the length of the matrix, they are
        // pushed to the results array
        if (cy >=0 && cy < H.divNums().length) {
            if(cx >= 0 && cx < H.divNums()[cy].length) {
                res.push(H.divNums()[cy][cx]);
            }
        }
    });
    return res;
};

// this function takes the tile number of any tile and
// returns the index of it on divNums so that it can be
// used in the surroundingTiles() function
H.getIndexOfK = function (k) {
    const xy = [];
    // loops through each row of the array
    F.sequence(H.divNums().length).forEach( function (i) {
        // finds the index of k within that row
        // NB: index = -1 if it is not there
        let index = H.divNums()[i].indexOf(k);
        if (index > -1) {
            xy.push(index, i);
        }
    });
    return xy;
};

// changes a tile in the server's copy of the board
H.changeTile = function (tileStolen, currentBoard, playerwon) {
    currentBoard.splice(tileStolen, 1, playerwon);
};

// creates a game code
H.makeGameCode = function (length = 5) {
    let result           = "";
    let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(
            Math.floor( Math.random() * characters.length)
            );
    }
   return result;
};

// function to start a game
H.startGame = function (ws, games) {
    // starts the timer
    H.startTimer(games[`${ws.myprivatedata.gameCode}`].players, games);
    // generates a testing word and sends it to the client to be
    // displayed on the DOM
    games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {

        dbH.generateWordFromDB( games[ws.myprivatedata.gameCode].quiz, function( obj ) {
            thisws.myprivatedata.word = obj.word;
            thisws.send(JSON.stringify({
                "word": obj.word.name
            }));
        });
    });
};

H.findPublicGames = function (games) {
    let publicGames = [];
    // NB: element here will be each game code
    Object.keys(games).forEach( function (element) {
        // ensures the key is a game node and not the setter
        if (element !== "removeGame") {
            if (games[element].public === true) {
                publicGames.push(element);
                /* publicGames.push({
                    "gameCode": element,
                    "quizName": games[element].quizName
                })
                */
            }
        } else {
            return;
        }
    });
    return publicGames;
}

export default Object.freeze(H);