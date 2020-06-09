
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
    console.log("middleware");
    req.testing = "testing";
    return next();
});

app.get("/", function (req, res, next) {
    ignorparam(next);
    console.log("get route", req.testing);
    res.end();
});



/////////////////////////////////////////////////////////





// this is the server that interacts with the user (ie the web socket)
app.ws("/", function (ws, req) {
    // generates a testing word and sends it to the client to be
    // displayed on the DOM
    let word = generateWord(dictionary.beginner);
    ws.send(JSON.stringify( { "word": word[0] } ) );
    // when receiving a message from the client...
    ws.on("message", function (msg) {
        let clientObj = JSON.parse(msg);
        console.log(msg); // CLEAN THIS UP LATER
        // if the message is a word, it will check if it is correct
        if (clientObj.answer === word[1]) {
            ws.send(JSON.stringify({
                "tileStolen": {"winner": 1, "tileNumber": 4}
            }));
        }

    });
    console.log("socket", req.testing);
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