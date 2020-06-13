import F from "./usefulfunctions.js";

// NB: this object is only used on the client side
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



// takes in the freetile and the winning player
Board.changeTile = function (freetile, winningplayer) {
    // sets the free tile to that player's colour
    el(freetile.toString()).style.backgroundColor =
        playerColours[winningplayer - 1];
    // changes the id of the free tile to the player that won the point
    el(freetile.toString()).className = "player" + winningplayer + "tile";
};

const playersTiles = function (playerNumber) {
        // finds all the tiles that belong to the winner
        const classPlayer = claN("player" + playerNumber + "tile");
        // makes an array from this
        return Array.from(classPlayer);
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