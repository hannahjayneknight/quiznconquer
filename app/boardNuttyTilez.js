const Board = Object.create(null);

const el = (id) => document.getElementById(id);
const playerColours = ["#dad8db", "#97Bc62ff", "#2c5f2d", "#101820"];

// takes in the freetile and the winning player
// and changes the colour of the freetile to the colour of the winning player
// and its class to the class of the winning player
Board.changeTile = function (freetile, winningplayer) {
    el(freetile.toString()).style.backgroundColor =
    playerColours[winningplayer - 1];
    el(freetile.toString()).className = "player" + winningplayer + "tile";
};

export default Object.freeze(Board);

/*
DIV NUMBERS FOR TILES ON THE TILEBOARD IN A MULTIDIMENSIONAL ARRAY
[
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],
    [30, 31, 32, 33, 34, 35],
]

STARTING POSITION FOR PLAYERS ON THE BOARD

[
    [1, 1, 1, 2, 2, 2],
    [1, 1, 1, 2, 2, 2],
    [1, 1, 1, 2, 2, 2],
    [3, 3, 3, 4, 4, 4],
    [3, 3, 3, 4, 4, 4],
    [3, 3, 3, 4, 4, 4]
]

*/