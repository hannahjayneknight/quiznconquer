
import express from "express";
import expressWS from "express-ws";
import H from "./handler.js";
import dbH from "./dbHander.js";
function ignorparam() {}

const port = 1711;

const app = express();
expressWS(app);

app.disable("x-powered-by");

app.use("/", express.static("app"));

// THESE ARE FOR THE DYNAMIC SERVER
app.use(function (req, res, next) {
    ignorparam(res);
    req.testing = "testing";
    return next();
});

app.get("/", function (req, res, next) {
    ignorparam(next);
    ignorparam(req);
    res.end();
});



/////////////////////////////////////////////////////////

// an array containing the players in a game
let numWS = [];
// creates a shallow copy of the starting array
let currentBoard = Array.from(H.startBoard());
const games = {};
/*

games is an object that stores info about all the games
currently being played.

One game would look like this:

games.WXYZ = {

    players: [
        { player web socket object goes here },
        { player web socket object goes here },
        { player web socket object goes here },
        { player web socket object goes here }
    ],
    public: true

}

*/

// this is the server that interacts with the user (ie the web socket)
app.ws("/", function (ws, req) {
    ignorparam(req);

    // This is used for ensuring all players on the same game
    // get the same timer and updated board
    ws.myprivatedata = {
        "playerNumber": numWS.length + 1,
        "players": numWS,
        "currentBoard": currentBoard,
        "gameStatus": "not playing",
        "hosting": false,
        "gameID": undefined
    };

    // sends a message with what player number they are
    // REMOVE THE QUIZ-LIST HERE!
    ws.send(JSON.stringify({
        "playerNumber": ws.myprivatedata.playerNumber
    }));

    // sends a list of all the quizzes
    // NEED TO DECIDE HOW TO USE THIS
    /*
    dbH.getInfoTables( function( obj ) {
        ws.myprivatedata.word = obj.word;
        ws.send(JSON.stringify({
            "quizList": obj.tables
        }));
    });
    */

    const startGame = function () {
        // sets the number of web sockets being counted to 0
        numWS = [];
        // initializes the starting board
        currentBoard = Array.from(H.startBoard());
        // starts the timer
        H.startTimer(ws.myprivatedata.players);
        // generates a testing word and sends it to the client to be
        // displayed on the DOM
        ws.myprivatedata.players.forEach(function (thisws) {

            dbH.generateWordFromDB( function( obj ) {
                thisws.myprivatedata.word = obj.word;
                thisws.send(JSON.stringify({
                    "word": obj.word.name
                }));
            });
        });
    };

    // numWS contains all the ws socket objects
    // This ensure that no more than 4 players can join
    numWS.push(ws);
    if (numWS.length === 4) {
        startGame();
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
            if (thisws.myprivatedata.playerNumber === ws.myprivatedata.playerNumber) {
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

        // telling the server whether the player is a host or not
        if (clientObj.hosting !== undefined) {
            ws.myprivatedata.hosting = clientObj.hosting;
            // when hosting...
            if (clientObj.hosting === true) {
                // makes a game id
                ws.myprivatedata.gameID = H.makeID();
                // adds this game to the games obj
                games[ws.myprivatedata.gameID] = {};
                // creates an array of the players in this game
                games[ws.myprivatedata.gameID].players = [];
                // pushes this player (ie the host) to the array
                games[ws.myprivatedata.gameID].players.push(ws);
                // sets the game to private by default
                games[ws.myprivatedata.gameID].public = false;
                // this prints all the info about the game being played
                console.log(games[ws.myprivatedata.gameID]);
                ws.send(JSON.stringify({
                    "gameID": ws.myprivatedata.gameID
                }));
            } else {

            }
        }

        // this allows a player to manually start a game if there
        // are fewer than four players
        if (clientObj.startGame !== undefined) {
            if (clientObj.startGame === true) {
                startGame();
            }
        }

        // if the message is an answer...
        if (clientObj.answer !== undefined) {
            // it will check if it is correct
            if (clientObj.answer === ws.myprivatedata.word.answer) {
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
            dbH.generateWordFromDB( function( obj ) {
                ws.myprivatedata.word = obj.word;
                ws.send(JSON.stringify({
                    "word": obj.word.name
                }));
            });
        }

    });
});



/////////////////////////////////////////////////////////



app.listen(port, function () {
    console.log("Listening on port " + port);
});
/*jsl:end*/