
import sqlite3 from "sqlite3";
import F from "./usefulfunctions.js";

// NB: this object is only used on the server side
const dbH = Object.create(null);

// used to generate a testing word
// parameter quiz is the quizname
dbH.generateWordFromDB = function (quiz, cb) {
    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    // finds a random word from the ones being tested
    // THIS RETURNS NOTHING IF QUIZ DOES NOT EXIST - DO I NEED TO FIX THIS ERROR?
    const queryWord = `SELECT question, answer FROM quiz_data WHERE quiz_name =
    ? ORDER BY RANDOM() LIMIT 1;`;

    // adds the random word to the database object
    // eg dbObj.word = { word: { name: 'ham', langID:4,answer:'jambon'}}
    const dbObj = {};

    db.get(queryWord, [quiz], function (err, row) {
        if (err) {
            return console.error(err.message);
        }

        dbObj.word = row;
    });


    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
        cb(dbObj);
    });
};


// lists all the available quizzes
dbH.listQuizzes = function (cb) {

    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    const queryQuizzes = `SELECT DISTINCT quiz_name FROM quiz_data;`;

    const dbObj = {};
    db.all(queryQuizzes, [], function (err, rows) {
        if (err) {
            return console.error(err.message);
        }
        // pushes each quiz to the array and saves to dbObj
        let quizzes = [];
        rows.forEach((element) => {
            quizzes.push(element.quiz_name);
            });
        dbObj.quizzes = quizzes;
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }

        cb(dbObj.quizzes);
    });

};

/*
Uses API to check if any bad language is being used.
                F.wsSend(ws, {
                    "quizInvalid": true
                });
*/


/*

Finds out if a quiz name already exists

When a quiz exists, row looks like this:
    {
        quiz_name: "Beginner_French",
    }

Otherwise row is undefined

*/
dbH.checkQuizName = function (quizName, ws, cb) {
    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    const findQuizName = `SELECT DISTINCT quiz_name FROM quiz_data
     WHERE quiz_name = ?`;

    // "SQLITE_ERROR: near \".\": syntax error"
    db.get(findQuizName, [quizName.replace(/\s/g, "_")], function (err, row) {
        if (err) {
            return console.error(err.message);
        }

        // quiz name does exist
        if (row !== undefined) {

            F.wsSend(ws, {
                "createQuizError": "quizTitleExists"
            });


        } else {

            // quiz name doesn't already exist
            cb();

        }

    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
    });

};

/*
To add a quiz, an object of the following form is parsed as a parameter:
    {
        "quizName": Hannah's_Quiz,

        "quizContents":

        [
            { question: q1, answer: a1 },
            { question: q2, answer: a2 },
            { question: q3, answer: a3 },
            ...
        ]

    }

*/
dbH.addToDB = function (obj, cb) {
    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    // for each qa pair, adds a row to the database, sets the ID and
    // the quiz_name
    F.sequence(Object.keys(obj.quizContents).length).forEach(function (element) {
        let row = [
            obj.quizContents[element].question,
            obj.quizContents[element].answer,
            ( element + 1 ), // this is the ID
            obj.quizName.replace(/\s/g, "_")
        ];

        let placeholders = row.map((i) => "?").join(",");

        let insertQA = `INSERT INTO quiz_data(question, answer, ID, quiz_name)
        VALUES (` + placeholders + `)`;

        db.run(insertQA, row, function (err, row) {
            if (err) {
                return console.error(err.message);
            }
        });
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
        cb();
    });
};

/*

returns dbArr which is an array with all the questions
and answers in a quiz. It looks like this:

[
    { question: 'salt', answer: 'sel', ID: 1 },
    { question: 'bed', answer: 'lit' ID: 2 },
    { question: 'ham', answer: 'jambon' ID: 3 },
    ...
]
*/
dbH.getQA = function (quiz, cb) {

    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    const getQA = `SELECT question, answer, id FROM quiz_data
                    WHERE quiz_name = ?;`;

    const dbArr = [];
    db.all(getQA, [quiz], function (err, row) {
        if (err) {
            return console.error(err.message);
        }
        row.forEach((element) => dbArr.push(element));
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }

        cb(dbArr);
    });
};

export default Object.freeze(dbH);