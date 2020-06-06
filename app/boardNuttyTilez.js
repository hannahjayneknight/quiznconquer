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
// when the player has a correct answer, it will change the
// colour of another player's tile to their colour
Board.correctAnswer = function (playerNumber) {
    const classWinner = claN("player" + playerNumber + "tile");
    const winnersTiles = Array.from(classWinner);
    const freeTiles = [];
    winnersTiles.forEach(function (element) {
        // makes an array with all the free tiles surrounding
        // the element
        const a = surroundingTiles(element).filter(
            (el) => el.className !== classWinner
        );
        // adds all the elements in this array to freeTiles
        freeTiles.push.apply(freeTiles, a);
    });
    const freeTilesNew = freeTiles.filter((element) => element>0);
    const randomNumber = F.getRandomInt(0, freeTilesNew.length - 1);
    const randomTile = freeTilesNew[randomNumber];
    // changes the colour and id of random free tile
    changeTile(randomTile, playerNumber);
};

export default Object.freeze(Board);