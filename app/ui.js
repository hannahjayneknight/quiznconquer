
/*jslint maxlen: 100 */
import F from "./usefulfunctions.js";
import Board from "./board.js";

const ui = Object.create(null);
const el = (id) => document.getElementById(id);
const ClaN = (classname) => document.getElementsByClassName(classname);

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

        // if the message says the player has joined a game
        // it will display the game page for them
        if (requestObj.joinGameAccepted === true) {
            el("joinPage").style.display = "none";
            el("gamePage").style.display = "block";
            Board.buildGamePage();
        }

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
            el("gameCode").textContent = requestObj.gameCode;
        }

        // making a list of all the quizzes on the browsing page
        if (requestObj.listAllQuizzes !== undefined) {
            let quizzessArr = requestObj.listAllQuizzes;
            // requestObj.listAllQuizzes
            Board.listAllQuizzes(requestObj.listAllQuizzes);
        }

        // when a receiving a list of the public games...
        if (requestObj.listPublicGames !== undefined) {
            // creates a list of all the public games on the join page
            Board.listPublicGames(requestObj.listPublicGames); 
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
                el("timer").innerHTML = "";
                el("testingWord").innerHTML = "Game Over!";
                el("answer-pane").style.display = "none";
                el("gameCodeBox").style.display = "none";
            }
        }
    };


    /*

    Buttons on the game page.

    */


    // document.addEventListener("keyup", Board.submitAnswer(event, ws) );
    // if key button is pressed, it will submit the answer
    // and send it to the server
    document.addEventListener("keyup", function (event) {
        // Check if modal is visible and key code
        if (event.keyCode === 13) {
            Board.submitAnswer(ws);
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
    // if the "make-this-game-public" button has pressed, it will send a message
    // to the server asking to add the game code to the list of public games
    el("make-this-game-public-button").addEventListener("click", function () {
        if (gamePublic === false) {
            el("make-this-game-public-text").innerHTML = "Make this game private";
            el("make-this-game-public-button").style.background = "var(--grey)";
            el("make-this-game-public-text").style.color = "var(--nearBlack)";
            gamePublic = true;
            ws.send(JSON.stringify(
                {"makeGamePublic": el("gameCode").textContent}
            ));
        } else {
            el("make-this-game-public-text").innerHTML = "Make this game public";
            el("make-this-game-public-button").style.background = "var(--nearBlack)";
            el("make-this-game-public-text").style.color = "white";
            gamePublic = false;
            ws.send(JSON.stringify(
                {"makeGamePrivate": el("gameCode").textContent}
            ));
        }
    });


    /*

    Buttons on the page where you join a game.

    */


    // button to join a game with a code
    el("joinGameCodeButton").addEventListener("click", function () {
        ws.send(JSON.stringify(
            {"joinGameCode": el("gameCodeInput").value}
        ));
    });

    // buttons to join a public game
    // checks to see if the parent element has event listeners
    if (el("listPublicGames").addEventListener) {
        el("listPublicGames").addEventListener("click", joinPublicGame, false);
    } else if (el("listPublicGames").attachEvent) {
        el("listPublicGames").attachEvent("onclick", joinPublicGame);
    }

    // when player joins a game a message will be sent to the server and
    // the game page will be displayed
    function joinPublicGame (e) {
        // e.target.id gets the id of what triggered the event
        // in this case it is the code id of the game
        ws.send(JSON.stringify(
            {"joinGameCode": e.target.id}
        ));
    }


    /*

    Buttons on the homepage.

    */


    // clicking on the join button
    // (this player is set to not be a host)
    el("Join-button").addEventListener("click", function () {
        el("homePage").style.display = "none";
        el("joinPage").style.display = "block";
        // hides the “make this hame public” and “everyone has joined” buttons
        el("everyone-has-joined-button").style.display = "none";
        el("make-this-game-public-button").style.display = "none";
        ws.send(JSON.stringify({
            "hosting": false,
            "listPublicGames": true
        }));
    });
    // clicking on the host button
    // (this player is set to be the host)
    el("Host-button").addEventListener("click", function () {
        el("homePage").style.display = "none";
        el("hostGamePage").style.display = "block";
        // reveals the “make this hame public” and “everyone has joined” buttons
        el("everyone-has-joined-button").style.display = "block";
        el("make-this-game-public-button").style.display = "block";
        ws.send(JSON.stringify(
            {"hosting": true}
        ));
    });


    /*

    Buttons on the hosting page.

    */


    // clicking on the "Create" button
    el("Create-button").addEventListener("click", function () {
        el("hostGamePage").style.display = "none";
        el("createQuizPage").style.display = "block";
        F.sequence(6).forEach( function (element) {
            Board.createQA(element + 1);
        })
    });

    // clicking on the "Browse" button
    el("Browse-button").addEventListener("click", function () {
        el("hostGamePage").style.display = "none";
        el("browseQuizzesPage").style.display = "block";
        // send request to server for all the quizzes
        ws.send(JSON.stringify(
            {"listQuizzesPlease": true}
        ));
    });


    /*

    Buttons on the creating a game page.

    */


    el("create-and-play-button").addEventListener("click", function () {
        el("createQuizPage").style.display = "none";
        el("gamePage").style.display = "block";
        Board.buildGamePage();
    });


    /*

    Buttons on the browsing quizzes page.

    */


    // buttons to join a public game
    // checks to see if the parent element has event listeners
    if (el("listOfQuizzes").addEventListener) {
        el("listOfQuizzes").addEventListener("click", hostBrowsedQuiz, false);
    } else if (el("listOfQuizzes").attachEvent) {
        el("listOfQuizzes").attachEvent("onclick", hostBrowsedQuiz);
    }

    // when player joins a game a message will be sent to the server and
    // the game page will be displayed
    function hostBrowsedQuiz (e) {
        el("browseQuizzesPage").style.display = "none";
        el("gamePage").style.display = "block";
        Board.buildGamePage();
        ws.send(JSON.stringify(
            {"hostBrowsedQuiz": e.target.id}
        ));
        // e.target.id gets the id of what triggered the event
        // in this case it is the name of the quiz
    }

};
/*

Code to open and build game playing page.

el("hostGamePage").style.display = "none"; // page you want to block goes here
el("gamePage").style.display = "block";
Board.buildGamePage();

*/

export default Object.freeze(ui);
