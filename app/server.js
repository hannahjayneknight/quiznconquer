
import express from "express";
import expressWS from "express-ws";
import Board from "./boardNuttyTilez.js";
import dictionary from "./dictionary.js";
import H from "./handler.js";
function ignorparam() {}

const port = 8080;

const app = express();
expressWS(app);

// THIS IS THE STATIC SERVER
app.use("/", express.static("app"));

// THESE ARE FOR THE DYNAMIC SERVER
app.use(function (req, res, next) {
    ignorparam(res);
    req.testing = "testing";
    return next();
});

app.get("/", function (req, res, next) {
    ignorparam(next);
    ignorparam(req); // better way of ignoring a parameter?
    res.end();
});



/////////////////////////////////////////////////////////



let numWS = [];
let board = H.startBoard;
// this is the server that interacts with the user (ie the web socket)
app.ws("/", function (ws, req) {
    ignorparam(req);

    // This ensure that it waits for 4 players to join
    // eg player1 = 0 etc
    // this is an object
    ws.myprivatedata = {"playerNumber": numWS.length, "players": numWS};
    // numWS contains all the ws socket objects
    numWS.push(ws);
    if (numWS.length === 4) {
        numWS = [];
        H.startTimer(ws.myprivatedata.players);

        // generates a testing word and sends it to the client to be
        // displayed on the DOM
        ws.myprivatedata.players.forEach(function (thisws) {
            thisws.myprivatedata.word = H.generateWord(dictionary.beginner);
            thisws.send(JSON.stringify({
                "word": thisws.myprivatedata.word[0]
            }));
        });
    }

    // when receiving a message from the client...
    ws.on("message", function (msg) {
        // de-stringifies the message
        let clientObj = JSON.parse(msg);
        // this.myprivatedata

        // if the message is an answer...
        if (clientObj.answer !== undefined) {
            // it will check if it is correct
            if (clientObj.answer === ws.myprivatedata.word[1]) {
                // and send the player number that won along with
                // the free tile to change
                ws.send(JSON.stringify({
                    "playerWon": 1,
                    "tileS": H.freeTile(1)
                }));
            }
            // it will generate a new word for questioning
            // ONLY for the player that won the tile
            ws.myprivatedata.word = H.generateWord(dictionary.beginner);
            ws.send(JSON.stringify({"word": ws.myprivatedata.word[0]}));


        // if the message is the tile number to be won, it will send
        // the tile number to be changed and the player that won it
        } else if (clientObj.winningTile !== undefined) {
            let tileStolen = {
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

/*
OLD VERSION OF CHANGING TILE
        // if the message is an answer...
        if (clientObj.answer !== undefined) {
            // it will check if it is correct
            // and send the player number that won
            if (clientObj.answer === ws.myprivatedata.word[1]) {
                ws.send(JSON.stringify({
                    "playerWon": 1
                }));
            }
            // it will generate a new word for questioning
            // ONLY for the player that won the tile
            ws.myprivatedata.word = H.generateWord(dictionary.beginner);
            ws.send(JSON.stringify({"word": ws.myprivatedata.word[0]}));


        // if the message is the tile number to be won, it will send
        // the tile number to be changed and the player that won it
        } else if (clientObj.winningTile !== undefined) {
            let tileStolen = {
                "tileStolen": {"winner": 1, "tileNumber": clientObj.winningTile}
            };
            ws.send(JSON.stringify(tileStolen));
        }
*/