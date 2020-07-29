import F from "./usefulfunctions.js";

const Board = Object.create(null);

const el = (id) => document.getElementById(id);
const playerColours = ["#dad8db", "#97Bc62ff", "#2c5f2d", "#101820"];
const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];
const tileBoard = el("tileBoard");

// takes in the freetile and the winning player
// and changes the colour of the freetile to the colour of the winning player
// and its class to the class of the winning player
Board.changeTile = function (freetile, winningplayer) {
    el(freetile.toString()).style.backgroundColor =
    playerColours[winningplayer - 1];
    el(freetile.toString()).className = "player" + winningplayer + "tile";
};

Board.buildGamePage = function () {
    el("answer-pane").value = "";
    F.sequence(36).forEach(function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        const tile = document.createElement("div");
        tile.setAttribute("id", element);
        tile.setAttribute("class", ourclass + "tile");
        tileBoard.appendChild(tile);
    });
};

Board.joinPublicGame = function (clicked_id) {
    console.log(clicked_id);
};

export default Object.freeze(Board);

/*

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