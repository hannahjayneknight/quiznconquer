
import F from "./usefulfunctions.js";
import dbH from "./dbHandler2.js";

// NB: this object is only used on the server side
const H = Object.create(null);

const playerclasses = [
    [1, 2],
    [3, 4]
];

/*
generates the starting board which looks like the following:
H.startBoard =
[
    1, 1, 1, 2, 2, 2,
    1, 1, 1, 2, 2, 2,
    1, 1, 1, 2, 2, 2,
    3, 3, 3, 4, 4, 4,
    3, 3, 3, 4, 4, 4,
    3, 3, 3, 4, 4, 4
]

*/
H.startBoard = function () {
    let arr = F.sequence(36);
    F.sequence(36).forEach(
        function (element) {
        let ourclass = playerclasses[ Math.floor(element / 18)][ Math.floor((element/3)%2)];
        arr.splice( element , 1, ourclass);
        });
    return arr;
};

// takes in the dictionary to be used and returns an array with the word
// as the first value and the translation as the second
H.generateWord = function (dictionary) {
    const randomNumber =
        F.getRandomInt(0, Object.keys(dictionary).length);
    return Object.entries(dictionary)[randomNumber];
};

H.countdown = function (ws, games) {
    const secs = 3;
    const now = Date.now();
    const deadline = secs * 1000 + now;
    let players = games[ws.myprivatedata.gameCode].players;

    let countdownID = setInterval(function () {
        let currentTime = Date.now();
        let distance = deadline - currentTime;
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (parseInt(seconds) === 0) {
            clearInterval(countdownID);

            players.forEach(function (thisws) {

                F.wsSend(thisws, {
                    "timer": "countdown ended",
                    "gameStatus": "go"
                });

            });

        } else {
            players.forEach( function (thisws) {

                F.wsSend(thisws, {
                    "timer": seconds,
                    "gameStatus": "countdown"
                });

            });
        }
    // rather than change html, the server will send
    // JSON.stringify({"timer": seconds})
    }, 500);
    players.forEach(function (thisws) {

        F.wsSend(thisws, {
            "timer": 3,
            "gameStatus": "countdown"
        });

    });
};

// THE TIMER
H.startTimer = function (ws, games, computers) {
    const mins = 0.5;
    const now = Date.now();
    const deadline = mins * 60 * 1000 + now;
    let players = games[ws.myprivatedata.gameCode].players;

    let timerID = setInterval(function () {
        let currentTime = Date.now();
        let distance = deadline - currentTime;
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (parseInt(seconds) === 0) {
            clearInterval(timerID);

            computers.forEach((element) => clearInterval(element));

            players.forEach(function (thisws) {

                F.wsSend(thisws, {
                    "timer": "Game ended",
                    "gameStatus": "gameOver",
                    "places": H.findWinner(ws.myprivatedata.currentBoard)
                });

                thisws.myprivatedata.gameStatus = "not playing";
            });

        } else {
            players.forEach( function (thisws) {

                F.wsSend(thisws, {
                    "timer": seconds,
                    "gameStatus": "playing"
                });

                thisws.myprivatedata.gameStatus = "playing";
            });
        }
    // rather than change html, the server will send
    // JSON.stringify({"timer": seconds})
    }, 500);
    players.forEach((thisws) => F.wsSend(thisws, {
        "timer": 30,
        "gameStatus": "playing"
    }));
};

// a function that finds a free tile to change the colour of
// ensures that the tile is not the winning player's own tile
// and that it is close to the tiles they currently own
H.freeTile = function (playerNumber, currentBoard) {
    // firstly finds all the tiles currently owned by the winning player
    const winnersTiles = [];
    currentBoard.forEach( function (element, index) {
        if (element === (playerNumber)) {
            winnersTiles.push(index);
        }
    } );
    // if the player owns no tiles
    if (!(Array.isArray(winnersTiles) && winnersTiles.length)) {
        return F.getRandomInt(0, 35);
    } else {
        // loops through all the tiles currently owned by the player
        // and adds all the surrounding tiles to surrounding
        let surrounding = [];
        winnersTiles.forEach(function (element) {
            surrounding.push.apply(
                surrounding,
                surroundingTiles(element)
                );
        });
        // removes tiles which belong to the winner and duplicates removing
        // duplicates ensures that all surrounding tiles have an equal chance
        // of being picked
        const freeTiles = F.uniq(F.diff(surrounding, winnersTiles));
        const randomNumber = F.getRandomInt(0, freeTiles.length - 1);
        // finds a random tile out of the ones that are free
        const randomTile = freeTiles[randomNumber];
        // NB: randomTile will be undefined when the board is full
        // ie a player has won. This is handled by the server
        return randomTile;
    }

};


/*
Div-numbers of the tileboard, laid out in a multidimensional array.
This is used for the surroundingTiles() function.

*/
H.divNums = () => [
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],
    [30, 31, 32, 33, 34, 35]
];

// surrounding tiles finds the surrounding tiles of an element within the
// constrains of the board, ie it will not return a tile on the other side
// of the board which would be considered a surrounding tile if the board were
// one dimensional
const surroundingTiles = function (element) {
    const directions = [
        // {x: -1, y:-1},
        {x:-1, y:0},
        // {x: -1, y:1},
        {x: 0, y:1},
        // {x:1, y:1},
        {x:1, y:0},
        // {x:1, y: -1},
        {x:0, y: -1}
    ];
    const res = [];
    const xy = H.getIndexOfK(element);
    // for each of the options of directions,
    // we add the x and y index that was parsed in
    // to find the change in x or y
    directions.forEach( function (element) {
        const cx = xy[0] + element.x;
        const cy = xy[1] + element.y;
        // if cx and cy are not negative or greater
        // than the length of the matrix, they are
        // pushed to the results array
        if (cy >=0 && cy < H.divNums().length) {
            if(cx >= 0 && cx < H.divNums()[cy].length) {
                res.push(H.divNums()[cy][cx]);
            }
        }
    });
    return res;
};

// this function takes the tile number of any tile and
// returns the index of it on divNums so that it can be
// used in the surroundingTiles() function
H.getIndexOfK = function (k) {
    const xy = [];
    // loops through each row of the array
    F.sequence(H.divNums().length).forEach( function (i) {
        // finds the index of k within that row
        // NB: index = -1 if it is not there
        let index = H.divNums()[i].indexOf(k);
        if (index > -1) {
            xy.push(index, i);
        }
    });
    return xy;
};

// changes a tile in the server's copy of the board
H.changeTile = function (tileStolen, currentBoard, playerwon) {
    currentBoard.splice(tileStolen, 1, playerwon);
};

// creates a game code
H.makeGameCode = function (length = 5) {
    let result           = "";
    let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(
            Math.floor( Math.random() * characters.length)
            );
    }
   return result;
};

// function to start a game
H.startGame = function (ws, games, computers) {
    // starts the coutndown
    H.countdown(ws, games);

    const playGame = function () {
        // if the last player leaves during the countdown,
        // games[ws.myprivatedata.gameCode].players will be undefined
        if (games[ws.myprivatedata.gameCode].players !== undefined) {
            // starts the timer
            H.startTimer(ws, games, computers);
            // sends the starting word
            games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {

                dbH.generateWordFromDB( games[ws.myprivatedata.gameCode].quiz.replace(/\s/g, "_"), function( obj ) {
                    thisws.myprivatedata.word = obj.word;
                    F.wsSend(thisws, {
                        "word": obj.word.question
                    });
                });
            });
        }

    }

    // plays the game when the countdown ends
    setTimeout(playGame, 3200);
};

H.findPublicGames = function (games) {
    let publicGames = [];
    // NB: element here will be each game code
    Object.keys(games).forEach( function (element) {
        // ensures the key is a game node and not the setter
        if (element !== "removeGame") {
            if (games[element].public === true) {
                publicGames.push(element);
                /* publicGames.push({
                    "gameCode": element,
                    "quizName": games[element].quizName
                })
                */
            }
        } else {
            return;
        }
    });
    return publicGames;
};

H.addComputerPlayers = function (ws, games, cb) {
    // adds the correct number of computer players to the games obj
    // games[ws.myprivatedata.gameCode].computerPlayers is an array with
    // the player number of each computer player
    const noPlayers = (4 - games[ws.myprivatedata.gameCode].players.length );
    games[ws.myprivatedata.gameCode].computerPlayers = [];
    F.sequence(noPlayers).forEach(function (element) {
        games[ws.myprivatedata.gameCode].computerPlayers.push( element + (5 - noPlayers) );
    });

    // callback will be to start the game
    // this ensures that the game starts only when the computer
    // players have been added
    cb();
};

// wins a tile for a single computer player
H.winComputerTile = function (playerNumber, ws, games, currentBoard) {
    const tileStolen = H.freeTile(
        playerNumber,
        currentBoard
    );

    // tileStolen === undefined when the board is full
    if (tileStolen !== undefined && games[ws.myprivatedata.gameCode] !== undefined) {
        games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {
            F.wsSend(thisws, {
                "tileStolen": {
                    "winner": playerNumber,
                    "tileNumber": tileStolen
                }
            });
        });
    }
    // and update the server's array of the current board
    H.changeTile(
        tileStolen,
        currentBoard,
        playerNumber
    );
    // update the player's copy of the board
    H.changeTile(
        tileStolen,
        ws.myprivatedata.currentBoard,
        playerNumber
    );
};

// starts the game for all the computer players
// 1st argument = array of computer players
H.startGameComputers = function (ws, games, currentBoard) {
    let computers = games[ws.myprivatedata.gameCode].computerPlayers;
    let currentComputers = [];
    let computer1;
    let computer2;
    let computer3;

    const playGameComputer = function () {

        // adds random tiles in random time intervals for each
        // computer player
        if (computers.length == 1) {
            computer1 = setInterval( function () {
                H.winComputerTile(4, ws, games, currentBoard);
            }, F.getRandomInt(1500, 6000));
            currentComputers.push(computer1);
        } else if (computers.length == 2) {
            computer1 = setInterval( function () {
                H.winComputerTile(4, ws, games, currentBoard);
            }, F.getRandomInt(1500, 6000));
            computer2 = setInterval( function () {
                H.winComputerTile(3, ws, games, currentBoard);
            }, F.getRandomInt(1500, 6000));
            currentComputers.push(computer1, computer2);
        } else if (computers.length == 3) {
            computer1 = setInterval( function () {
                H.winComputerTile(4, ws, games, currentBoard);
            }, F.getRandomInt(1500, 6000));
            computer2 = setInterval( function () {
                H.winComputerTile(3, ws, games, currentBoard);
            }, F.getRandomInt(1500, 6000));
            computer3 = setInterval( function () {
                H.winComputerTile(2, ws, games, currentBoard);
            }, F.getRandomInt(1500, 6000));
            currentComputers.push(computer1, computer2, computer3);
        }
    }

    // plays the game when the countdown ends
    setTimeout(playGameComputer, 3200);

    return currentComputers;
}

H.onclose = function (clients, games, ws, cb) {
    clients.splice( (clients[ws.myprivatedata.id - 1]) , 1);
    cb(clients, games, ws);
};

H.leaveGame = function (clients, games, ws) {

    // checks to see if a player was in a game
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
                // relists all the public games on the join page
                clients.forEach(function (thisws) {
                    F.wsSend(thisws, {
                        "listPublicGames": H.findPublicGames(games)
                        });
                });
            }

            // if the game hasn't begun and there are still players in the game, players
            // will be reassigned player numbers
            if (ws.myprivatedata.gameStatus === "not playing" && games[ws.myprivatedata.gameCode] !== undefined) {
                let tempNumWS = [];
                games[ws.myprivatedata.gameCode].players.forEach(function (thisws) {
                    thisws.myprivatedata.playerNumber = tempNumWS.length + 1;
                    tempNumWS.push(1);
                    F.wsSend(thisws, {
                        "playerNumber": thisws.myprivatedata.playerNumber
                    });
                });
            }
        }
    }
};

// returns an object containing the players that came 1st, 2nd, 3rd and 4th
H.findWinner = function (currentBoard) {

    let scores = [0, 0, 0, 0];
    currentBoard.forEach(function (element) {
        if (element === 1) {
            scores[0] += 1;
        } else if (element === 2) {
            scores[1] += 1;
        } else if (element === 3) {
            scores[2] += 1;
        } else if (element === 4) {
            scores[3] += 1;
        }
    });

    // orders the scores from lowest to highest
    let ordered = scores.concat().sort((a, b) => a - b);

    // places is an array containing the player numbers in ascending order
    // of placing. If there was a draw, it will be a nested array.
    // element 0 corresponds to fourth place, element 3 is 1st
    let places = [];

    F.sequence(4).forEach(function (element) {
        // gets the player number/ numbers of those who came that place
        // .map() is to convert the index to the player number
        places.push(F.getAllIndexes(scores, ordered[element]).map((x) => x + 1));
    });

    // removes any duplicates
    return F.uniq(places);

}

export default Object.freeze(H);