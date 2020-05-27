import ui from "./uiNuttyTilez.js";
//import Board from "./boardNuttyTilez.js";

window.addEventListener("DOMContentLoaded", function () {
    ui.init();
    const player1 = Array.from(document.getElementsByClassName("player1tile"));
    // console.log(player1.namedItem("tile2")); // returns the div within the class
    // player1tile that has the id "tile2"

    // this loops through all the divs withint player1tile class
    // next need to apply the function to this loop
    // NB: I need the Array.from for this to work
    player1.forEach(function(element) {
        console.log(element);
    });
});
