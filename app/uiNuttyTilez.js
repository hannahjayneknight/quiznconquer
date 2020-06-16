import F from "./usefulfunctions.js";
import Board from "./boardNuttyTilez.js";

const ui = Object.create(null);
const el = (id) => document.getElementById(id);
const tileBoard = el("tileBoard");
const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];

ui.init = function () {
    el("answer-pane").value = "";
    F.sequence(36).forEach(function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        const tile = document.createElement("div"); // makes a div element
        tile.setAttribute("id", element);
        tile.setAttribute("class", ourclass + "tile");
        tileBoard.appendChild(tile); // note the differences from .append()
    });

    // this is the client side of the server
    const ws = new WebSocket("ws://localhost:8080");

    /*
    ws.onclose = function (event) {
        console.log("Client notified socket has closed", event);
        ws.close();
    };
    */

    // when it receives a message (e) from the server...
    ws.onmessage = function ( e ) {

        // parses the message received
        const requestObj = JSON.parse(e.data);

        // if the message contains the word to be testing on,
        // it will change this in the DOM
        if (requestObj.word !== undefined) {
            el("testingWord").textContent = requestObj.word;

        // if the message says that a tile has been stolen...
        } else if (requestObj.tileStolen !== undefined) {
                // it will change the tile to the colour of the player
                // that won
            Board.changeTile(
                requestObj.tileStolen.tileNumber, requestObj.tileStolen.winner
                );

        // if the message contains the status of the timer...
        } else if (requestObj.timer !== undefined) {
            // it will update the timer if the game is still playing
            if (requestObj.gameStatus === "playing") {
                el("timer").innerHTML = requestObj.timer;
                el("answer-pane").style.display = "block";
            // otherwise the game is over
            } else {
                el("timer").innerHTML = "Game Over!";
                el("answer-pane").style.display = "none";
            }
        }
    };

    // if key button is pressed, it will submit the answer
    // and send it to the server
    document.addEventListener("keyup", function (event) {
        //Check if modal is visible and key code
        if (event.keyCode === 13) {
            const answer = JSON.stringify(
                { "answer": el("answer-pane").value.trim().toLowerCase() });
            ws.send(answer);
            el("answer-pane").value = "";
        }
    });

};

export default Object.freeze(ui);
