import F from "./usefulfunctions.js";

const Board = Object.create(null);

const el = (id) => document.getElementById(id);

Board.startBoard = () => [
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [2, 2, 2, 3, 3, 3],
    [2, 2, 2, 3, 3, 3],
    [2, 2, 2, 3, 3, 3]
];

const playerColours = {
    blue: 0,
    green: 1,
    yellow: 2,
    black: 3
};

const loopThroughPlayersTiles = function (player) {
    
}
/*
// Finds a tile close the ones currently owned by the player who won the point
// which will be the tile to change colour when they win the next point

// takes in the player's colour
const findTile = function (colour) {
// iterate through each div element that makes up the board, when it finds one
// that has a tile around it that is a different colour, it will change that
// colour
    const tiles = [];
    F.sequence(36).forEach(function (element) {
        tiles.push("tile" + element);
    });

    tiles.forEach(
        // finds if the colour of the tile matches the player's colour
        // if (colour === )
    )
};

// finds the colour of the player that won the point
const chooseColour = function (player) {
    if (player === "player1") {
        return "blue";
    } else if (player === "player2") {
        return "yellow";
    } else if (player === "player3") {
        return "green";
    } else {
        return "black";
    }
};

// Changes the tile colour to the colour of the player that just got a correct
// answer. Takes in the id of the tile to change the colour of and the colour
// to change it to
Board.changeTileColour = function (tile, colour) {
    el(tile).style.backgroundColor = colour;
};

// returns the start board
Board.setStartBoard = function () {

};
*/

// when a player gets a correct answer, a tile will change to their colour
// on the board

// 1. recognise that they got the answer correct
// 2. find a tile that is their colour at the moment
// 3. find a tile next to it that isn't their colour
// 4. change this tile's colour

export default Object.freeze(Board);