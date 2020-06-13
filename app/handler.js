import F from "./usefulfunctions.js";

// NB: this object is only used on the server side
const H = Object.create(null);

const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];

/*
generates the starting board which looks like the following:
H.startBoard =
[
  'player1', 'player1', 'player1', 'player2', 'player2', 'player2',
  'player1', 'player1', 'player1', 'player2', 'player2', 'player2',
  'player1', 'player1', 'player1', 'player2', 'player2', 'player2',
  'player3', 'player3', 'player3', 'player4', 'player4', 'player4',
  'player3', 'player3', 'player3', 'player4', 'player4', 'player4',
  'player3', 'player3', 'player3', 'player4', 'player4', 'player4'
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

/*
The is an array that shows the labels for each div which represents a tile
H.divNumbers =
[
   0, 1, 2, 3, 4, 5,
   6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17,
  18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35
]
*/
H.divNumbers = F.sequence(36);

// takes in the dictionary to be used and returns an array with the word
// as the first value and the translation as the second
H.generateWord = function (dictionary) {
    const randomNumber =
        F.getRandomInt(0, Object.keys(dictionary).length);
    return Object.entries(dictionary)[randomNumber];
};

// THE TIMER
H.startTimer = function (wsarr) {
    const mins = 0.5;
    const now = Date.now();
    const deadline = mins * 60 * 1000 + now;

    let timerID = setInterval(function () {
        let currentTime = Date.now();
        let distance = deadline - currentTime;
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (parseInt(seconds) === 0) {
            clearInterval(timerID);
            wsarr.forEach((thisws) => thisws.send(JSON.stringify({
                "timer": seconds,
                "gameStatus": "gameOver"
            })));
        } else {
            wsarr.forEach((thisws) => thisws.send(JSON.stringify({
                "timer": seconds,
                "gameStatus": "playing"
            })));
        }
    // rather than change html, the server will send
    // JSON.stringify({"timer": seconds})
    }, 500);
    wsarr.forEach((thisws) => thisws.send(JSON.stringify({
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
        // CHANGE THIS TO JUST NUMBERS?
        if (element === ("player" + playerNumber)) {
            winnersTiles.push(index);
        }
    } );
    // loops through all the tiles currently owned by the player
    // and adds all the surrounding tiles to surrounding
    let surrounding = [];
    winnersTiles.forEach(function (element) {
        surrounding.push.apply(surrounding, surroundingTiles(element));
    });
    // removes negative tiles which do not exist and
    // tiles that belong to the winner
    const outOfRange = (element) =>
        (0<parseInt(element) && parseInt(element) < 36);
    const freeTiles = F.diff(surrounding, winnersTiles).filter(outOfRange);
    const randomNumber = F.getRandomInt(0, freeTiles.length - 1);
    // finds a random tile out of the ones that are free
    const randomTile = freeTiles[randomNumber];
    // NB: randomTile will be undefined when the board is full
    // ie a player has won
    if (randomTile === undefined) {
        console.log("Board is full");
        // *** put a function that creates a pop-up when someone has won ***
    } else {
        // returns the tile to be changed.
        return randomTile;
    }
};


const surroundingTiles = function (element) {
    const surroundingTilesArray = [
        element + 5,
        element - 5,
        element + 7,
        element - 7,
        element + 6,
        element - 6,
        element + 1,
        element - 1
    ];
    return surroundingTilesArray;
};

H.changeTile = function (tileStolen, currentBoard, playerwon) {
    currentBoard.splice(tileStolen, 1, "player" + playerwon);
};

export default Object.freeze(H);