
import express from "express";
import expressWS from "express-ws";
import Board from "./boardNuttyTilez.js";
import dictionary from "./dictionary.js";
import F from "./usefulfunctions.js";

const port = 8080;

const app = express();
expressWS(app);

// THIS IS THE STATIC SERVER
app.use("/", express.static("app"));

function ignorparam() {}

// THESE ARE FOR THE DYNAMIC SERVER
app.use(function (req, res, next) {
    ignorparam(res);
    req.testing = "testing";
    return next();
});

app.get("/", function (req, res, next) {
    ignorparam(next); // better way of ignoring a parameter?
    res.end();
});



/////////////////////////////////////////////////////////



// let openWs = [];
// this is the server that interacts with the user (ie the web socket)
app.ws("/", function (ws, req) {
    /* THIS WILL BE USED TO ADD OTHER PLAYERS

    let player = openWs.length;
    // player1 = 0 etc
    ws.myprivatedata = {}
    openWs.push({ "ws": ws, "playerNumber": player, "players": openWs } );
    if( openWs.length === 4 )
    {
        openWs = [];
    } */

    // the timer
    const mins = 0.5;
    const now = Date.now();
    const deadline = mins * 60 * 1000 + now;

    // why use var here?
    var timerID = setInterval(function () {
        var currentTime = Date.now();
        var distance = deadline - currentTime;
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (parseInt(seconds) === 0) {
            clearInterval(timerID);
            ws.send(JSON.stringify({
                "timer": seconds,
                "gameStatus": "gameOver"
            }));
            // send message that timer has run out here
        } else {
            ws.send(JSON.stringify({
                "timer": seconds,
                "gameStatus": "playing"
            }));
        }
    }, 500);

    // generates a testing word and sends it to the client to be
    // displayed on the DOM
    let word = generateWord(dictionary.beginner);
    ws.send(JSON.stringify( { "word": word[0] } ) );

    // when receiving a message from the client...
    ws.on("message", function (msg) {
        // de-stringifies the message
        let clientObj = JSON.parse(msg);
        // this.myprivatedata

        // if the message is an answer...
        if (clientObj.answer !== undefined) {
            // it will check if it is correct
            // and send the player number that won
            if (clientObj.answer === word[1]) {
                ws.send(JSON.stringify({
                    "playerWon": 1
                }));
            }
            // it will generate a new word for questioning
            word = generateWord(dictionary.beginner);
            ws.send(JSON.stringify( { "word": word[0] } ) );


        // if the message is the tile number to be won, it will send
        // the tile number to be changed and the player that won it
        } else if (clientObj.winningTile !== undefined) {
            var tileStolen = {
                "tileStolen": {"winner": 1, "tileNumber": clientObj.winningTile}
            };
            ws.send(JSON.stringify(tileStolen));
        }

    });
});

// THIS IS FOR BOTH SERVERS
app.listen(port, function () {
    console.log("Listening on port " + port);
});
/*jsl:end*/


/////////////////////////////////////////////////////////



// takes in the dictionary to be used and returns an array with the word
// as the first value and the translation as the second
const generateWord = function (dictionary) {
    const randomNumber =
        F.getRandomInt(0, Object.keys(dictionary).length);
    return Object.entries(dictionary)[randomNumber];
};



/////////////////////////////////////////////////////////