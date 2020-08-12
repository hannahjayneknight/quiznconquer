
/*

Acts as a handler for ui.js

*/

import F from "./usefulfunctions.js";

const Board = Object.create(null);

const el = (id) => document.getElementById(id);
const ClaN = (className) => document.getElementsByClassName(className);
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

Board.resetTileBoard = function () {
    el("answer-pane").value = "";
    el("winnersBox").style.display = "none";
    F.sequence(36).forEach(function (element) {
        if (el(element) !== null) {
           el(element).remove();
        }
    });
    // rebuilds the board
    Board.buildGamePage();
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

Board.submitAnswer = function (ws) {
        // if key button is pressed, it will submit the answer
        // and send it to the server
        const answer = JSON.stringify(
            { "answer": el("answer-pane").value.trim().toLowerCase() });
        ws.send(answer);
        el("answer-pane").value = "";
};

Board.RElistPublicGames = function (pubGameArr) {
    Array.from(ClaN("publicGame")).forEach(function (element) {
        if (el(element.id) !== null) {
            el(element.id).remove();
         }
    });
    Board.listPublicGames(pubGameArr);
};

Board.listPublicGames = function (pubGameArr) {
    F.sequence(pubGameArr.length).forEach( function (element) {
        // makes a button element for each public game
        const publicGame = document.createElement("button");
        // game code for public game = requestObj.listPublicGames[element]
        publicGame.setAttribute("id", pubGameArr[element]);
        publicGame.setAttribute("tabindex", 0);
        publicGame.setAttribute("aria-label", "Click here to join the game");
        publicGame.setAttribute("class", "publicGame");
        // sets inner HTML to game code
        // CHANGE THIS TO THE QUIZ NAME EG BEGINNER FRENCH
        publicGame.innerHTML = pubGameArr[element];
        //publicGame.onload = () => callback(publicGame);
        el("listPublicGames").appendChild(publicGame);
    });
};

Board.listAllQuizzes = function (listAllQuizzesArr) {
    F.sequence(listAllQuizzesArr.length).forEach(function (element) {
        // makes a p element which will represent each quiz
        const quiz = document.createElement("button");
        quiz.setAttribute("id", listAllQuizzesArr[element].name);
        quiz.setAttribute("class", "quiz");
        quiz.setAttribute("tabindex", 0);
        quiz.setAttribute("aria-label", "Click here to play this quiz");
        quiz.innerHTML = listAllQuizzesArr[element].name.replace(/_/g, " ");
        el("listOfQuizzes").append(quiz);
    });

};

Board.createQA = function (number) {
    // creates the question
    const Q = document.createElement("textarea");
    Q.setAttribute("id", ("q" + number));
    Q.setAttribute("class", "qa");
    Q.setAttribute("tabindex", 0);
    Q.setAttribute("aria-label", "Type your question here");
    Q.setAttribute("placeholder", ("Question " + number));
    Q.setAttribute("onfocus", ("this.placeholder = '' "));
    Q.setAttribute("onblur", ("this.placeholder = 'Question "  + number + "' "));
    el("new-questions-list").appendChild(Q);

    // creates the answer
    const A = document.createElement("textarea");
    A.setAttribute("id", ("a" + number));
    A.setAttribute("class", "qa");
    A.setAttribute("tabindex", 0);
    A.setAttribute("aria-label", "Type your answer here");
    A.setAttribute("placeholder", ("Answer " + number));
    A.setAttribute("onfocus", ("this.placeholder = '' "));
    A.setAttribute("onblur", ("this.placeholder = 'Answer "  + number + "' "));
    el("new-answers-list").appendChild(A);
};

/*

Board.getQA returns an array with the qa pairs the user has created.

The array is called tableContents and looks like this:

[
    { question: q1, answer: a1 },
    { question: q2, answer: a2 },
    { question: q3, answer: a3 },
    ...
]

*/
Board.getQA = function () {
    const allQA = Array.from(ClaN("qa"));
    let tableContents = [];
    F.sequence( allQA.length / 2 ).forEach( function (element) {
        let qaObj = {};
        qaObj.question = el("q" + (element + 1)).value;
        qaObj.answer = el("a" + (element + 1)).value;
        if (F.objEmpty(qaObj) === true) {
            // only pushes to qaObj when a qa has been inputted
            tableContents.push(qaObj);
        }
    });
    return tableContents;
};

Board.findWinners = function (winnersarr) {
    el("1st").style.display = "block";
    el("2nd").style.display = "block";
    el("3rd").style.display = "block";
    el("draw").style.display = "none";
    const names = ["Grey", "Light Green", "Dark Green", "Black"];
    let player1st = [];
    let player2nd = [];
    let player3rd = [];
    let player4th = [];

    // adds the colours of the players that won to the arrays
    if (winnersarr[0] !== undefined) {
        winnersarr[0].forEach(function (element) {
            player4th.push(names[element - 1]);
        });
    }

    if (winnersarr[1] !== undefined) {
        winnersarr[1].forEach(function (element) {
            player3rd.push(names[element - 1]);
        });
    }

    if (winnersarr[2] !== undefined) {
        winnersarr[2].forEach(function (element) {
            player2nd.push(names[element - 1]);
        });
    }

    if (winnersarr[3] !== undefined) {
        winnersarr[3].forEach(function (element) {
            player1st.push(names[element - 1]);
        });
    }
    if (winnersarr.length === 2) {
        el("player2nd").textContent = player4th.join(", ");
        el("player1st").textContent = player3rd.join(", ");
    } else if (winnersarr.length === 3) {
        el("player3rd").textContent = names[winnersarr[0].map((x) => x - 1)];
        el("player2nd").textContent = player3rd.join(", ");
        el("player1st").textContent = player2nd.join(", ");
    } else if (winnersarr.length === 4) {
        el("player3rd").textContent = player3rd.join(", ");
        el("player2nd").textContent = player2nd.join(", ");
        el("player1st").textContent = player1st.join(", ");
    } else {
        el("1st").style.display = "none";
        el("2nd").style.display = "none";
        el("3rd").style.display = "none";
        el("draw").style.display = "inline";
    }

    el("winnersBox").style.display = "inline-block";
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