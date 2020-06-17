
import express from "express";
import expressWS from "express-ws";
import dictionary from "./dictionary.js";
import H from "./handler.js";
function ignorparam() {}

const port = 8080;

const app = express();
expressWS(app);

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
// creates a shallow copy of the starting array
let currentBoard = Array.from(H.startBoard());

// this is the server that interacts with the user (ie the web socket)
app.ws("/", function (ws, req) {
    ignorparam(req);

    // This is used for ensuring all players on the same game
    // get the same timer and updated board
    ws.myprivatedata = {
        "playerNumber": numWS.length + 1,
        "players": numWS,
        "currentBoard": currentBoard,
        "gameStatus": "not playing"
    };

    // sends a message with what player number they are
    ws.send(JSON.stringify({
        "playerNumber": ws.myprivatedata.playerNumber
    }));

    // numWS contains all the ws socket objects
    // This ensure that it waits for 4 players to join
    numWS.push(ws);
    if (numWS.length === 4) {
        numWS = [];
        currentBoard = Array.from(H.startBoard());
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

    // when a websocket has been closed...
    ws.on("close", function () {
        console.log("Server websocket has closed");
        // removes the player that left the game from the array of players
        // to ensure the server stops sending messages to that websocket
        ws.myprivatedata.players.some(function (thisws, ind) {
            // NB: ws.myprivatedata contains the data for the player that left
            // ws.myprivatedata.players is an array of all the players
            // thisws allows us to loop through each player that WAS playing
            if (thisws.myprivatedata.playerNumber ===
                ws.myprivatedata.playerNumber) {
                ws.myprivatedata.players.splice(ind, 1);
                return true;
            }
            return false;
        });
        // if the game hasn't begun, players will be reassigned player numbers
        // otherwise, the game will continue
        if (ws.myprivatedata.gameStatus === "not playing") {
            let tempNumWS = [];
            ws.myprivatedata.players.forEach(function (thisws) {
                thisws.myprivatedata.playerNumber = tempNumWS.length + 1;
                tempNumWS.push(1);
                thisws.send(JSON.stringify({
                    "playerNumber": thisws.myprivatedata.playerNumber
                }));
            });
        }

    });

    // when receiving a message from the client...
    ws.on("message", function (msg) {
        // de-stringifies the message
        let clientObj = JSON.parse(msg);

        // if the message is an answer...
        if (clientObj.answer !== undefined) {
            // it will check if it is correct
            if (clientObj.answer === ws.myprivatedata.word[1]) {
                // and send the player number that won along with
                // the free tile to change
                const tileStolen = H.freeTile(
                    ws.myprivatedata.playerNumber,
                    currentBoard
                );
                // tileStolen === undefined when the board is full
                if (tileStolen !== undefined) {
                    ws.myprivatedata.players.forEach(function (thisws) {
                        thisws.send(JSON.stringify({
                            "tileStolen": {
                                "winner": ws.myprivatedata.playerNumber,
                                "tileNumber": tileStolen
                            }
                        }));
                    });
                }
                // and update the server's array of the current board
                H.changeTile(
                    tileStolen,
                    currentBoard,
                    ws.myprivatedata.playerNumber
                );
            }
            // it will generate a new word for questioning
            // ONLY for the player that won the tile
            ws.myprivatedata.word = H.generateWord(dictionary.beginner);
            ws.send(JSON.stringify({"word": ws.myprivatedata.word[0]}));

        }

    });
});



/////////////////////////////////////////////////////////



app.listen(port, function () {
    console.log("Listening on port " + port);
});
/*jsl:end*/


// if(thisws.readyState === WebSocket.OPEN){