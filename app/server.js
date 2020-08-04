
/*jslint maxlen: 100 */
import express from "express";
import expressWS from "express-ws";
import H from "./handler.js";
import dbH from "./dbHandler.js";
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

// creates the object which will store all the games 
// currently being played
const games = {
    set removeGame(key) {
        delete games[key];
        return games;
    }
};
/*

games is an object that stores info about all the games
currently being played. Currently, it only has the players
in each game and whether the game is public or private, but
more information could be added if needed. NB: game set to
private by default.

One game would look like this:

games.WXYZ = {

    players: [
        { player web socket object goes here },
        { player web socket object goes here },
        { player web socket object goes here },
        { player web socket object goes here }
    ],
    public: false,
    quiz: "beginner_French"
}

The games object could look like this:

games = {

    HIAZY: { players: [websocket, websocket, websocket], public: false, quiz: "beginner_French"},
    WXYZ: { players: [websocket],  public: false, quiz: "beginner_French"
    removeGame: [Setter]

}

removeGame is a setter that allows a game code
to be removed when that game has ended. Removing
the game code "WXYZ" is achieved from the following:

obj4.removeGame = "WXYZ";

*/

// this is the server that interacts with the user (ie the web socket)
app.ws("/", function (ws, req) {
    ignorparam(req);


    /*

    Starting conditions

    */


    ws.myprivatedata = {
        "currentBoard": currentBoard, // updated as game goes on
        "gameStatus": "not playing", // "playing" or "not playing"
        "hosting": false // true if they are the host
        
        // the following are added when a player is in a game
        // "gameCode": CODE1,
        // "playerNumber": 1,
        // "word": "bonjour"
    };


    /*

    when a websocket has been closed...

    */


    ws.on("close", function () {
        console.log("Server websocket has closed");
        // checks to see if a player was in a game first
        if (ws.myprivatedata.gameCode !== undefined) {
            // checks to see if the game they were in hasn't ended
            if (games[ws.myprivatedata.gameCode] !== undefined) {
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

                // If there aren't any players left in the game, the game code is removed
                // from the games object.
                if (games[ws.myprivatedata.gameCode].players.length === 0) {
                    // removes game code from the games obj
                    games.removeGame = ws.myprivatedata.gameCode;
                }

                // if the game hasn't begun and there are still players in the game, players
                // will be reassigned player numbers otherwise, the game will continue
                if (ws.myprivatedata.gameStatus === "not playing" && games[ws.myprivatedata.gameCode] !== undefined) {
                    let tempNumWS = [];
                    games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {
                        thisws.myprivatedata.playerNumber = tempNumWS.length + 1;
                        tempNumWS.push(1);
                        thisws.send(JSON.stringify({
                            "playerNumber": thisws.myprivatedata.playerNumber
                        }));
                    });
                }
            }
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
                    // initializes the starting board
                    currentBoard = Array.from(H.startBoard());
                    // refreshes this web socket's starting board
                    ws.myprivatedata.currentBoard = Array.from(H.startBoard());
                }
            } else {
                return;
            }
        }

        // receiving a request to list all the quizzes...
        if (clientObj.listQuizzesPlease !== undefined) {
            dbH.getInfoTables( function( obj ) {
                ws.send(JSON.stringify({
                    "listAllQuizzes": obj
                }));
            });
        }

        // making a game public/ private...
        // NB: public = true means the game is public
        if (clientObj.makeGamePublic !== undefined) {
            games[clientObj.makeGamePublic].public = true;
        }
        if (clientObj.makeGamePrivate !== undefined) {
            games[clientObj.makeGamePrivate].public = false;
        }

        // sending a list of all the public games...
        if (clientObj.listPublicGames !== undefined) {
            ws.send(JSON.stringify({
                // this sends an array with all the public game codes
                // need to make this send the name of the quiz being played too
                // which will be achieved in the handler
                "listPublicGames": H.findPublicGames(games)
            }));
        }

        // receiving a request to host a quiz that has been found from browsing...
        if (clientObj.hostBrowsedQuiz !== undefined) {
            // sets the quiz name to the games object
            // this will be saved to the game code of the player that clicked on it
            games[ws.myprivatedata.gameCode].quiz = clientObj.hostBrowsedQuiz;
        }

        // this allows a player to manually start a game if there
        // are fewer than four players
        if (clientObj.startGame !== undefined) {
            if (clientObj.startGame === true) {
                H.startGame(ws, games);
                // initializes the starting board
                currentBoard = Array.from(H.startBoard());
                // refreshes this web socket's starting board
                ws.myprivatedata.currentBoard = Array.from(H.startBoard());
            }
        }

        // if the message is an answer...
        if (clientObj.answer !== undefined && ws.myprivatedata.word !== undefined && games[ws.myprivatedata.gameCode] !== undefined) {
            // it will check if it is correct
            if (clientObj.answer.trim().toLowerCase() === ws.myprivatedata.word.answer) {
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
            dbH.generateWordFromDB( games[ws.myprivatedata.gameCode].quiz, function( obj ) {
                ws.myprivatedata.word = obj.word;
                ws.send(JSON.stringify({
                    "word": obj.word.name
                }));
            });
        }

    });
});




    /*
    which quiz the player is playing:
    games[ws.myprivatedata.gameCode].quiz
    */

/////////////////////////////////////////////////////////



app.listen(port, function () {
    console.log("Listening on port " + port);
});
