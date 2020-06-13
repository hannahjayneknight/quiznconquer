import F from "./usefulfunctions.js";

const Board = Object.create(null);

const el = (id) => document.getElementById(id);
const claN = (className) => document.getElementsByClassName(className);
// change this to an object with key as the player number, value as the colour
const playerColours = ["#dad8db", "#97Bc62ff", "#2c5f2d", "#101820"];

Board.startBoard = () => [
    [1, 1, 1, 2, 2, 2],
    [1, 1, 1, 2, 2, 2],
    [1, 1, 1, 2, 2, 2],
    [3, 3, 3, 4, 4, 4],
    [3, 3, 3, 4, 4, 4],
    [3, 3, 3, 4, 4, 4]
];



////////////////////////////////////////////////////////////////////////////////



// function that finds all the surrounding tiles of a tile
// takes in the id of the tile you are considering
Board.surroundingTiles = function (element) {
    const surroundingTilesArray = [
        parseInt(element.id) + 5,
        parseInt(element.id) - 5,
        parseInt(element.id) + 7,
        parseInt(element.id) - 7,
        parseInt(element.id) + 6,
        parseInt(element.id) - 6,
        parseInt(element.id) + 1,
        parseInt(element.id) - 1
    ];
    return surroundingTilesArray;
};
// takes in the freetile and the winning player
Board.changeTile = function (freetile, winningplayer) {
    // sets the free tile to that player's colour
    el(freetile.toString()).style.backgroundColor = playerColours[winningplayer - 1];
    // changes the id of the free tile to the player that won the point
    el(freetile.toString()).className = "player" + winningplayer + "tile";
};

const playersTiles = function (playerNumber) {
        // finds all the tiles that belong to the winner
        const classPlayer = claN("player" + playerNumber + "tile");
        // makes an array from this
        return Array.from(classPlayer);
};
// finds a free tile to change the colour of
Board.findTile = function (playerNumber) {
    const winnersTiles = playersTiles(playerNumber);
    let surrounding = [];
    // loops through all the tiles currently owned by the player
    winnersTiles.forEach(function (element) {
        // adds all the surrounding tiles to surrounding
        surrounding.push.apply(surrounding, Board.surroundingTiles(element));
    });
    const ofDifferentClass = (element) =>
        el(element).className !== ("player" + playerNumber + "tile");
    const outOfRange = (element) =>
        (0<parseInt(element) && parseInt(element) < 36);
    // removes negative tiles which do not exist and
    // tiles that belong to the winner
    const freeTiles = surrounding.filter(outOfRange).filter(ofDifferentClass);
    const randomNumber = F.getRandomInt(0, freeTiles.length - 1);
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

const divNumberArray = F.sequence(36);
/*

divNumberArray =
[
   0,  1,  2,  3,  4,  5,  6,  7,  8,
   9, 10, 11, 12, 13, 14, 15, 16, 17,
  18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35
]

*/
const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];

const startBoard = function () {
    let arr = F.sequence(36);
    F.sequence(36).forEach(
        function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        arr.splice( element , 1, ourclass);
        });
    return arr;
};



////////////////////////////////////////////////////////////////////////////////



Board.countScore = function (playerNumber) {
    const score = playersTiles(playerNumber).length;
};



////////////////////////////////////////////////////////////////////////////////


Board.computerPlayer = function (playerNumber) {

};



export default Object.freeze(Board);