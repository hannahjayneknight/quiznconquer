import F from "./usefulfunctions.js";
import Board from "./boardNuttyTilez.js";
import dictionary from "./dictionary.js";

/*
DIV NUMBERS FOR TILES ON THE TILEBOARD
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



const ui = Object.create(null);
const el = (id) => document.getElementById(id);
let board = Board.startBoard();
const tileBoard = el("tileBoard");
const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];



/////////////////////////////////////////////////////////



ui.init = function () {
    el("answer-pane").value = "";
    generateWord(dictionary.beginner);
    F.sequence(36).forEach(function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        const tile = document.createElement("div"); // makes a div element
        tile.setAttribute("id", element);
        tile.setAttribute("class", ourclass + "tile");
        tileBoard.appendChild(tile); // note the differences from .append()
    });

    // if key button is pressed, it will submit the answer
    document.addEventListener("keyup", function (event) {
        //Check if modal is visible and key code
        if (event.keyCode === 13) {
            submitAnswer(dictionary.beginner);
            generateWord(dictionary.beginner);
        }
    });

};



/////////////////////////////////////////////////////////


// takes in the dictionary to be used and returns an array with the word
// as the first value and the translation as the second
const generateWord = function (dictionary) {
    const randomNumber =
        F.getRandomInt(0, Object.keys(dictionary).length);
    el("testingWord").textContent = Object.entries(dictionary)[randomNumber][0];
};

const submitAnswer = function (dictionary) {
    /* A function that returns true if the answer is correct, otherwise false,
    and clears the text area */
    const correctAnswer = el("testingWord").textContent;
        if (el("answer-pane").value ===
            dictionary[correctAnswer]) {
            // NEED TO CHANGE THE NUMBER TO THE PLAYER PLAYING
            Board.correctAnswer(2);
            console.log(el("testingWord").textContent);
        } else {
            el("answer-pane").value = "";
            Board.correctAnswer(2);
            console.log(el("testingWord").textContent);
        }
};

export default Object.freeze(ui);
