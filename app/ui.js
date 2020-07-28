import F from "./usefulfunctions.js";
import Board from "./boardGame.js";

const ui = Object.create(null);
const el = (id) => document.getElementById(id);
const ClaN = (classname) => document.getElementsByClassName(classname);
const tileBoard = el("tileBoard");
const playerclasses = [[ "player1", "player2"],
                        ["player3", "player4" ]];

ui.init = function () {


    /*

    Sending and receiving messages with the server.

    */


    // this is the client side of the server
    const ws = new WebSocket("ws://localhost:1711");

    ws.onclose = function (event) {
        console.log("Client notified socket has closed", event);
        ws.close();
    };

    // when it receives a message (e) from the server...
    ws.onmessage = function ( e ) {

        // parses the message received
        const requestObj = JSON.parse(e.data);

        // if the message contains the player nummber,
        // it will display their arrow
        if (requestObj.playerNumber !== undefined) {
            const arrows = Array.from(ClaN("playerArrows"));
            arrows.forEach(function (element) {
                element.style.display = "none";
            });
            el("player" +
            requestObj.playerNumber +
            "-arrow").style.display = "block";
        }

        // displaying the game code
        if (requestObj.gameCode !== undefined) {
            el("testingWord").textContent = requestObj.gameCode;
        }

        // making a list of all the quizes
        // WILL NEED TO MOVE THIS TO THE OTHER PAGE!
        if (requestObj.quizList !== undefined) {
            F.sequence(requestObj.quizList.length).forEach(function (element) {
                // makes a p element which will represent each quiz
                const publicQuiz = document.createElement("p");
                // CHANGE ELEMENT TO THE NAME OF THE QUIZ?
                publicQuiz.setAttribute("id", "Public quiz " + element);
                publicQuiz.setAttribute("class", "Public Quizzes");
                publicQuiz.innerHTML = requestObj.quizList[element].name;
                el("ListOfQuizzes").append(publicQuiz);
            });
        }

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
                el("everyone-has-joined-button").style.display = "none";
                el("make-this-game-public-button").style.display = "none";
            // otherwise the game is over
            } else {
                el("timer").innerHTML = "Game Over!";
                el("answer-pane").style.display = "none";
            }
        }
    };


    /*

    Buttons on the game page.

    */


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

    // if the help button is pressed, it will display a help
    // message with how the game works
    el("help-button").addEventListener("click", function () {
        el("help-response-box").style.display = "block";
    });

    // if the OK button is pressed, the help message is removed
    el("OK-button").addEventListener("click", function () {
        el("help-response-box").style.display = "none";
    });

    // if the "everyone-has-joined" button has pressed, it will
    // send a message to the server to start the game (it will do this by adding
    // computer players until it gets to 4)
    // ADD COMPUTER PLAYERS HERE
    el("everyone-has-joined-button").addEventListener("click", function () {
        ws.send(JSON.stringify(
            {"startGame": true}
        ));
    });

    // if the variable gamePublic is false, the game is
    // not public but it is private
    let gamePublic = false;

    // NB: need to add this feature, and for the game to be removed from the
    // currently available games when it starts

    // if the "make-this-game-public" button has pressed, it will
    // add the game code to the list of public games
    el("make-this-game-public-button").addEventListener("click", function () {
        if (gamePublic === false) {
            el("make-this-game-public-text").innerHTML = "This game is public";
            el("make-this-game-public-button").style.background = "var(--grey)";
            el("make-this-game-public-text").style.color = "var(--nearBlack)";
            gamePublic = true;
        } else {
            el("make-this-game-public-text").innerHTML = "This game is private";
            el("make-this-game-public-button").style.background = "var(--nearBlack)";
            el("make-this-game-public-text").style.color = "white";
            gamePublic = false;
        }
    });




    /*

    Moving around pages.

    */


    // when you are on the homepage

        // clicking on the join button
        // THIS PLAYER IS NOT THE HOST
        el("Join-button").addEventListener("click", function () {
            el("homePage").style.display = "none";
            el("joinWithCodePage").style.display = "block";
            ws.send(JSON.stringify(
                {"hosting": false}
            ));
        });
        // clicking on the host button
        // THIS PLAYER IS THE HOST
        // - this should be changed to when a game code is created
        el("Host-button").addEventListener("click", function () {
            el("homePage").style.display = "none";
            el("hostGamePage").style.display = "block";
            ws.send(JSON.stringify(
                {"hosting": true}
            ));
        });

    // when you are on the hosting page

        // clicking on the "create a game" button
        el("Create-button").addEventListener("click", function () {
            el("hostGamePage").style.display = "none";
            el("gamePage").style.display = "block";
            Board.buildGamePage();
        });
};

export default Object.freeze(ui);
