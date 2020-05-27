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
const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];

ui.init = function () {
    el("answer-pane").value = "";
    F.sequence(36).forEach(function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        const tile = document.createElement("div"); // makes a div element
        tile.setAttribute("id", "tile" + element);
        tile.setAttribute("class", ourclass + "tile");
        tileBoard.appendChild(tile); // note the differences from .append()
    });

    const checkAnswer = function () {
    /* A function that returns true if the answer is correct, otherwise false,
    and clears the text area */
        el("answer-pane").value = "";
    };

    // if key button is pressed, it will submit the answer
    document.addEventListener("keyup", function (event) {
        //Check if modal is visible and key code
        if (event.keyCode === 13) {
            checkAnswer();
        }
    });

    pickRandomWord();
};

const pickRandomWord = function () {
    el("testingWord").textContent = "ham";
};

const pickLevel = function (level) {
    return dictionary.level;
};

export default Object.freeze(ui);
