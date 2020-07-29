
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
        "currentBoard": currentBoard,
        "gameStatus": "hasn't started",
        "hosting": false
    };


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


    /*

    when a websocket has been closed...

    */


    ws.on("close", function () {
        console.log("Server websocket has closed");
        // removes the player that left the game from the array of players
        // to ensure the server stops sending messages to that websocket
        games[ws.myprivatedata.gameCode].players.some(function (thisws, ind) {
            // NB: ws.myprivatedata contains the data for the player that left
            // thisws allows us to loop through each player that WAS playing
            if (thisws.myprivatedata.playerNumber === ws.myprivatedata.playerNumber) {
                games[ws.myprivatedata.gameCode].players.splice(ind, 1);
                return true;
            }
            return false;
        });
        // if the game hasn't begun, players will be reassigned player numbers
        // otherwise, the game will continue
        if (ws.myprivatedata.gameStatus === "hasn't started") {
            let tempNumWS = [];
            games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {
                thisws.myprivatedata.playerNumber = tempNumWS.length + 1;
                tempNumWS.push(1);
                thisws.send(JSON.stringify({
                    "playerNumber": thisws.myprivatedata.playerNumber
                }));
            });
        }

    });


    /*

    when receiving a message from the client...

    */


    ws.on("message", function (msg) {
        // de-stringifies the message
        let clientObj = JSON.parse(msg);

        // hosting/ joining a game
        if (clientObj.hosting !== undefined) {
            ws.myprivatedata.hosting = clientObj.hosting;

            // when hosting a game...
            if (clientObj.hosting === true) {
                // makes a game code
                ws.myprivatedata.gameCode = H.makeGameCode();
                // adds this game to the games obj
                games[ws.myprivatedata.gameCode] = {};
                // creates an array of the players in this game
                games[ws.myprivatedata.gameCode].players = [];
                // pushes this player (ie the host) to the array
                games[ws.myprivatedata.gameCode].players.push(ws);
                // sets their player number
                ws.myprivatedata.playerNumber =
                    games[ws.myprivatedata.gameCode].players.length;
                // sets the game to private by default
                games[ws.myprivatedata.gameCode].public = false;
                // sends the game code and their player number
                ws.send(JSON.stringify({
                    "gameCode": ws.myprivatedata.gameCode,
                    "playerNumber": ws.myprivatedata.playerNumber
                }));
            }
        }

        // upon receiving a game code...
        if (clientObj.joinGameCode !== undefined) {
            // checks if the game code is valid
            if (games[clientObj.joinGameCode] !== undefined) {
                // adds the game code to their private data
                ws.myprivatedata.gameCode = clientObj.joinGameCode;
                // adds their web socket object to the games object
                games[ws.myprivatedata.gameCode].players.push(ws);
                // sets their player number
                ws.myprivatedata.playerNumber =
                    games[ws.myprivatedata.gameCode].players.length;
                // sends message to client to say they are joining game
                // with the game code and their player number
                ws.send(JSON.stringify({
                    "joinGameAccepted": true,
                    "gameCode": ws.myprivatedata.gameCode,
                    "playerNumber": ws.myprivatedata.playerNumber
                }));
                // if the game that the person has just joined has 4
                // players in it, it will begin
                if (games[ws.myprivatedata.gameCode].players.length === 4) {
                    H.startGame(ws, games);
                }
            } else {
                return;
            }
        }


        // this allows a player to manually start a game if there
        // are fewer than four players
        if (clientObj.startGame !== undefined) {
            if (clientObj.startGame === true) {
                H.startGame(ws, games);
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
                    games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {
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
