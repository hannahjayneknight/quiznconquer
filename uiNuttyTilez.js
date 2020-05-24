import F from "./usefulfunctions.js";
import Board from "./boardNuttyTilez.js";
import dictionary from "./dictionary.js";

/*
LABELS FOR TILES ON THE TILEBOARD
[
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],
    [30, 31, 32, 33, 34, 35],
]
*/


const ui = Object.create(null);
const el = (id) => document.getElementById(id);
let board = Board.startBoard();
const tileBoard = el("tileBoard");

ui.init = function () {
    F.sequence(36).forEach(function (element) {
        const tile = document.createElement("div"); // makes a div element
        tile.setAttribute("id", "tile" + element);
        tile.setAttribute("class", "tile");
        tileBoard.appendChild(tile); // note the differences from .append()
    });

    const submitAnswer = function () {

    };

    // if key button is pressed, it will submit the answer
    document.addEventListener("keyup", function (event) {
        //Check if modal is visible and key code
        if (event.keyCode === 13) {
            submitAnswer();
        }
    });
};

const pickRandomWord = function () {
};

const pickLevel = function (level) {
    return dictionary.level;
};

export default Object.freeze(ui);
