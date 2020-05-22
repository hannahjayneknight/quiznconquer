import List from "./list.js";
import Board from "./board2048.js";

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
const cellList = [];

ui.init = function () {
    List.sequence(6).forEach(function (element) {
        const tr = document.createElement("tr"); // makes a new table row
        tr.setAttribute("id", element);
        List.sequence(6).forEach(function (element) {
            const td = document.createElement("td"); // for each row makes a
            // new element
            td.setAttribute("id", element);
            cellList.push(td); // NB: push() is not pure
            tr.appendChild(td); // note the differences from .append()
        });
        tileBoard.appendChild(tr); // note the differences from .append()
    });
};