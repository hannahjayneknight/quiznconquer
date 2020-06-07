import F from "./usefulfunctions.js";

const Board = Object.create(null);

const el = (id) => document.getElementById(id);
const claN = (className) => document.getElementsByClassName(className);
const playerColours = ["blue", "green", "yellow", "black"];

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
const surroundingTiles = function (element) {
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
const changeTile = function (freetile, winningplayer) {
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
// when the player has a correct answer, it will change the
// colour of another player's tile to their colour
Board.correctAnswer = function (playerNumber) {
    const winnersTiles = playersTiles(playerNumber);
    let surrounding = [];
    // loops through all the tiles currently owned by the player
    winnersTiles.forEach(function (element) {
        // adds all the surrounding tiles to surrounding
        surrounding.push.apply(surrounding, surroundingTiles(element));
    });
    // removes negative tiles which do not exist
    const ofDifferentClass = (element) =>
        el(element).className !== ("player" + playerNumber + "tile");
    const outOfRange = (element) =>
        (0<parseInt(element) && parseInt(element) < 36);
    const freeTiles = surrounding.filter(outOfRange).filter(ofDifferentClass);
    const randomNumber = F.getRandomInt(0, freeTiles.length - 1);
    const randomTile = freeTiles[randomNumber];
    if (randomTile === undefined) {
        console.log("This has worked");
        // *** put a function that creates a pop-up when someone has won ***
    } else {
        // changes the colour and id of random free tile
        changeTile(randomTile, playerNumber);
    }
};



////////////////////////////////////////////////////////////////////////////////



Board.countScore = function (playerNumber) {
    const score = playersTiles(playerNumber).length;
};



////////////////////////////////////////////////////////////////////////////////


Board.computerPlayer = function (playerNumber) {

};



export default Object.freeze(Board);