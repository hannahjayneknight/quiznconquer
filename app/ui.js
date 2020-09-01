import F from "./usefulfunctions.js";
import Board from "./board.js";
import nav from "./navigate.js";

const ui = Object.create(null);
const el = (id) => document.getElementById(id);
const ClaN = (classname) => document.getElementsByClassName(classname);
const displayLives = Array.from(ClaN("allLives"));
// if the variable gamePublic is false, the game is
// not public but it is private
let gamePublic = false;
let thisPlayerNumber = 0;
let lives = 5;
// automatically sets the current and previous pages to be the homepage
let currentPage = "homePage";
let previousPage = "homePage";

ui.init = function () {


    /*

    Switching between pages.

    */

    nav.listen();


    /*

    Sending and receiving messages with the server.

    */


    // this is the client side of the server
    const ws = new WebSocket("ws://localhost:1711");

    ws.onclose = function (event) {
        ws.close();
    };

    // when it receives a message (e) from the server...
    ws.onmessage = function ( e ) {

        // parses the message received
        const requestObj = JSON.parse(e.data);

        // if the message says the player is requesting to join a game...
        if (requestObj.joinGameAccepted !== undefined) {
            if (requestObj.joinGameAccepted === true) {
                // if the game code is valid
                el("joinPage").style.display = "none";
                el("gamePage").style.display = "block";
                Board.resetTileBoard();
                gamePublic = false;
                if (requestObj.public === true) {
                    el("make-this-game-public-text").textContent = "Make this game private";
                    el("make-this-game-public-button").style.background = "var(--grey)";
                    el("make-this-game-public-text").style.color = "var(--nearBlack)";
                    gamePublic = true;
                    F.wsSend(ws, {"makeGamePublic": true});
                }
            // restarting a game
            } else if (requestObj.joinGameAccepted === "restart") {
                el("restart-game-button").style.display = "none";
                el("homepage-button").style.display = "none";
                el("testingWord").textContent = "Quiz & Conquer!";
                el("gamePage").style.display = "block";
                el("everyone-has-joined-button").style.display = "block";
                el("make-this-game-public-button").style.display = "block";
                el("make-this-game-public-text").textContent = "Make this game public";
                el("make-this-game-public-button").style.background = "var(--nearBlack)";
                el("make-this-game-public-text").style.color = "white";
                gamePublic = false;
                Board.resetTileBoard();
            } else {
                el("joinGameError").style.display = "block";
                el("gameCodeInput").value = "";
            }
        }

        // if the message contains the player nummber,
        // it will display their arrow
        if (requestObj.playerNumber !== undefined) {
            thisPlayerNumber = requestObj.playerNumber;
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

        // displaying how many players are waiting to join
        if (requestObj.players2join !== undefined) {
            if (requestObj.players2join > 1) {
                el("timer").textContent = "Waiting for " + requestObj.players2join + " more players to join...";
            } else {
                el("timer").textContent = "Waiting for " + requestObj.players2join + " more player to join...";
            }
        }

        // making a list of all the quizzes on the browsing page
        if (requestObj.listAllQuizzes !== undefined) {
            let quizzessArr = requestObj.listAllQuizzes;
            // requestObj.listAllQuizzes
            Board.listAllQuizzes(requestObj.listAllQuizzes);
        }

        // making a list of all the QA in a quiz
        if (requestObj.listAllQA !== undefined) {
            Board.viewQuiz(requestObj.listAllQA);
        }

        // when a receiving a list of the public games...
        if (requestObj.listPublicGames !== undefined) {
            // creates a list of all the public games on the join page
            if (F.arrEmpty(requestObj.listPublicGames)) {
                // if there are no public games...
                el("publicGameError").style.display = "block";
                Board.RElistPublicGames(requestObj.listPublicGames);
            } else {
                el("publicGameError").style.display = "none";
                Board.RElistPublicGames(requestObj.listPublicGames);
            }
        }

        // a game is being made public/ private by another player
        if (requestObj.makeGamePublic !== undefined) {
            el("make-this-game-public-text").textContent = "Make this game private";
            el("make-this-game-public-button").style.background = "var(--grey)";
            el("make-this-game-public-text").style.color = "var(--nearBlack)";
            gamePublic = true;
        }
        if (requestObj.makeGamePrivate !== undefined) {
            el("make-this-game-public-text").textContent = "Make this game public";
            el("make-this-game-public-button").style.background = "var(--nearBlack)";
            el("make-this-game-public-text").style.color = "white";
            gamePublic = false;
        }

        // being told a quiz name already exists...
        if (requestObj.quizNameExists !== undefined) {
            if (requestObj.quizNameExists === true) {
                // display error message here
                el("createQuizError").style.display = "none";
                el("createQuizError").textContent = "This quiz title already exists";
                el("createQuizError").style.display = "block";
                el("setQuizTitle").value = "";
            } else {
                el("createQuizPage").style.display = "none";
                el("gamePage").style.display = "block";
                Board.buildGamePage();
            }
        }
        // being told a quiz name is invalid...
        if (requestObj.quizNameInvalid !== undefined) {
            if (requestObj.quizNameInvalid === true) {
                // display error message here
                el("createQuizError").style.display = "none";
                el("createQuizError").textContent = "The quiz title must be valid for a SQLite table";
                el("createQuizError").style.display = "block";
                el("setQuizTitle").value = "";
            } else {
                el("createQuizPage").style.display = "none";
                el("gamePage").style.display = "block";
                Board.buildGamePage();
            }
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
            // it will update the timer if the game is being played
            if (requestObj.gameStatus === "playing") {
                el("timer").textContent = requestObj.timer;
                if (lives !== 0) {
                    el("answer-pane").style.display = "block";
                }
                el("everyone-has-joined-button").style.display = "none";
                el("make-this-game-public-button").style.display = "none";
                displayLives.forEach(function (element) {
                    element.style.display = "block";
                });
                el("player" +
                thisPlayerNumber +
                "lives").style.display = "none";
            // it will update the timer during the countdown
            } else if (requestObj.gameStatus === "countdown") {
                el("timer").textContent = requestObj.timer;
                el("everyone-has-joined-button").style.display = "none";
                el("make-this-game-public-button").style.display = "none";
            // countdown has ended
            } else if (requestObj.gameStatus === "go") {
                el("timer").textContent = "Go!";
            // otherwise the game is over
            } else {
                displayLives.forEach(function (element) {
                    element.style.display = "none";
                });
                el("timer").textContent = "";
                el("testingWord").textContent = "Game Over!";
                el("answer-pane").style.display = "none";
                el("correctAnswer").textContent = "";
                el("restart-game-button").style.display = "block";
                el("homepage-button").style.display = "block";
                Board.findWinners(requestObj.places);
            }
        }

        // if the player has lost all their lives
        if (requestObj.lostAllLives === true) {
            lives = 0;
            el("answer-pane").style.display = "none";
            el("testingWord").textContent = "You've died!";
        }

        // receiving the correct answer...
        if (requestObj.correctAnswer !== undefined) {
            el("correctAnswer").textContent = requestObj.correctAnswer;
        }

        // a player has lost a life...
        if (requestObj.lives !== undefined) {
            Board.removeLife(requestObj.playernumber, requestObj.lives);
            Board.removeLife(5, requestObj.lives);
            // stuff here
            // requestObj.lives is the number of lives the player has left
            // requestObj.playernumber is the player that lost a life
        }
    };


    /*

    Buttons on the game page.

    */


    // document.addEventListener("keyup", Board.submitAnswer(event, ws) );
    // if key button is pressed, it will submit the answer
    // and send it to the server
    if (el("gamePage").addEventListener) {
        el("gamePage").addEventListener("keyup", function (event) {
            // Check if modal is visible and key code
            if (event.keyCode === 13) {
                Board.submitAnswer(ws);
            }
        }, false);
    }

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
    el("everyone-has-joined-button").addEventListener("click", function () {
        F.wsSend(ws, {"startGame": true});
    });

    // if the "support us" button has been pressed it will show the support page
    el("support-us-button").addEventListener("click", function () {
        el("supportUsPage").style.display = "block";
        el(currentPage).style.display = "none";
        previousPage = currentPage;
        currentPage = "supportUsPage";
        if (el("home-button").style.display === "none" ) {
            el("home-button").style.display = "block";
        }
    });

    // if the back button is pressed it will go to the previous page
    el("home-button").addEventListener("click", function () {
        el("homePage").style.display = "block";
        el(currentPage).style.display = "none";
        let tempVar = currentPage;
        currentPage = previousPage;
        previousPage = tempVar;
        if (currentPage === "homePage") {
            el("home-button").style.display = "none";
        }
    });

    // if the "make-this-game-public" button has pressed, it will send a message
    // to the server asking to add the game code to the list of public games
    el("make-this-game-public-button").addEventListener("click", function () {
        if (gamePublic === false) {
            el("make-this-game-public-text").textContent = "Make this game private";
            el("make-this-game-public-button").style.background = "var(--grey)";
            el("make-this-game-public-text").style.color = "var(--nearBlack)";
            gamePublic = true;
            F.wsSend(ws, {"makeGamePublic": true});

        } else {
            el("make-this-game-public-text").textContent = "Make this game public";
            el("make-this-game-public-button").style.background = "var(--nearBlack)";
            el("make-this-game-public-text").style.color = "white";
            gamePublic = false;
            F.wsSend(ws, {"makeGamePrivate": true});
        }
    });

    el("restart-game-button").addEventListener("click", function () {
        F.wsSend(ws, {"restart": el("gameCode").textContent});
        el("restart-game-button").style.display = "none";
        el("homepage-button").style.display = "none";
        el("testingWord").textContent = "Quiz & Conquer!";
        el("gamePage").style.display = "block";
        Board.resetTileBoard();
    });

    el("homepage-button").addEventListener("click", function () {
        el("homePage").style.display = "block";
        el("gamePage").style.display = "none";
        F.wsSend(ws, {"leftGame": true});
    });


    /*

    Buttons on the page where you join a game.

    */


    // button to join a game with a code
    el("joinGameCodeButton").addEventListener("click", function () {
        F.wsSend(ws, {"joinGameCode": el("gameCodeInput").value});
    });

    // when player joins a game a message will be sent to the server and
    // the game page will be displayed
    function joinPublicGame (e) {
        // e.target.id gets the id of what triggered the event
        // in this case it is the code id of the game
        F.wsSend(ws, {"joinGameCode": e.target.id});
    }

    // buttons to join a public game
    // checks to see if the parent element has event listeners
    if (el("listPublicGames").addEventListener) {
        el("listPublicGames").addEventListener("click", joinPublicGame, false);
    } else if (el("listPublicGames").attachEvent) {
        el("listPublicGames").attachEvent("onclick", joinPublicGame);
    }


    /*

    Buttons on the homepage.

    */


    // clicking on the join button
    // (this player is set to not be a host)
    el("Join-button").addEventListener("click", function () {
        el("homePage").style.display = "none";
        el("joinPage").style.display = "block";
        el("gameCodeInput").value = "";
        // hides the “make this game public” and “everyone has joined” buttons
        /*
        el("everyone-has-joined-button").style.display = "none";
        el("make-this-game-public-button").style.display = "none";
        */
        F.wsSend(ws, {
        "hosting": false,
        "listPublicGames": true
        });
        previousPage = currentPage;
        currentPage = "joinPage";
        el("home-button").style.display = "block";
    });
    // clicking on the host button
    // (this player is set to be the host)
    el("Host-button").addEventListener("click", function () {
        el("homePage").style.display = "none";
        el("hostGamePage").style.display = "block";
        // reveals the “make this hame public” and “everyone has joined” buttons
        /*
        el("everyone-has-joined-button").style.display = "block";
        el("make-this-game-public-button").style.display = "block";
        */
       F.wsSend(ws, {"hosting": true});
        previousPage = currentPage;
        currentPage = "hostGamePage";
        el("home-button").style.display = "block";
    });


    /*

    Buttons on the hosting page.

    */


    // clicking on the "Create" button
    el("Create-button").addEventListener("click", function () {
        el("hostGamePage").style.display = "none";
        el("createQuizPage").style.display = "block";
        el("setQuizTitle").value = "";
        F.sequence(6).forEach( function (element) {
            Board.createQA(element + 1);
        });
    });

    // clicking on the "Browse" button
    el("Browse-button").addEventListener("click", function () {
        el("hostGamePage").style.display = "none";
        el("browseQuizzesPage").style.display = "block";
        // send request to server for all the quizzes
        F.wsSend(ws, {"listQuizzesPlease": true});
    });


    /*

    Buttons on the creating a game page.

    */


    el("create-and-play-button").addEventListener("click", function () {
        // doesn't let you to create a quiz with no title
        if (F.strEmpty(el("setQuizTitle").value) === false) {
            // if user has entered a title
            // doesn't let you create a quiz with no questions and answers
            let tableContents = Board.getQA();
            if (F.arrEmpty(tableContents)) {
                // returns true if user has not submitted any qa pairs
                el("createQuizError").textContent = "Please enter at least one valid question and answer";
                el("createQuizError").style.display = "block";
                Array.from(ClaN("qa")).forEach(function (element) {
                    el(element.id).value = "";
                });
            } else {
                // sends the details of the quiz to the server
                F.wsSend(ws, {
                    "createTable": {
                        "tableName": el("setQuizTitle").value.replace(/\s/g, "_"),
                        "tableContents": Board.getQA()
                    }
                });
            }
        } else {
            // if user hasn't entered a valid title
            el("createQuizError").textContent = "Please enter a title";
            el("createQuizError").style.display = "block";
            el("setQuizTitle").value = "";
        }
    });

    el("add-new-qa-button").addEventListener("click", function () {
        let qaNum = (Array.from(ClaN("qa")).length / 2) + 1;
        Board.createQA(qaNum);
        let currTop = window.getComputedStyle(document.querySelector("#add-new-qa-button")).getPropertyValue("top");
        let newTop = parseFloat(currTop, 10) + parseFloat("38px", 10) + "px";
        el("add-new-qa-button").style.top = newTop;
    });


    /*

    Buttons on the browsing quizzes and viewing a quiz pages.

    */

    // when player clicks a browsed game a message will be sent
    // to the server and the view game page will be displayed
    function hostBrowsedQuiz (e) {
        el("browseQuizzesPage").style.display = "none";
        el("viewQuizPage").style.display = "block";
        // sends the name of the quiz they want to host
        F.wsSend(ws, {"hostBrowsedQuiz": e.target.id});
    }

    // buttons to host a browsed quiz
    // checks to see if the parent element has event listeners
    if (el("listOfQuizzes").addEventListener) {
        el("listOfQuizzes").addEventListener("click", hostBrowsedQuiz, false);
    } else if (el("listOfQuizzes").attachEvent) {
        el("listOfQuizzes").attachEvent("onclick", hostBrowsedQuiz);
    }

    // clicking the "play" button which is on display when viewing a quiz
    el("play-button").addEventListener("click", function (quizName) {
        el("viewQuizPage").style.display = "none";
        el("gamePage").style.display = "block";
        Board.buildGamePage();
    });

};
/*

Code to open and build game playing page.

el("hostGamePage").style.display = "none"; // page you want to block goes here
el("gamePage").style.display = "block";
Board.buildGamePage();

*/

export default Object.freeze(ui);
