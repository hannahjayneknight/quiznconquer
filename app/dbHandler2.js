
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
    "Beginner_French" ORDER BY RANDOM() LIMIT 1;`;

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

// creating a quiz as a table in the database
dbH.createQuiz = function (tableName, ws, cb) {
    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    // replaces any spaces with _ since sqlite does not like spaces for
    // column titles
    const createTable = `CREATE TABLE ${tableName.replace(/\s/g, "_")} (
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL
    );`;

    // "SQLITE_ERROR: near \".\": syntax error"
    db.serialize(function () {
        db.run(createTable, [], function (err, row) {
            if (err) {
                let tableExists = `SQLITE_ERROR: table ${tableName.replace(/\s/g, "_")} already exists`;
                let invalidName = `SQLITE_ERROR: near "${tableName.replace(/\s/g, "_")}": syntax error`;
                if (err.message === tableExists) {
                    // tells client that quiz name already exists
                    F.wsSend(ws, {
                        "quizNameExists": true
                    });
                }
                if (err.message === invalidName) {
                    // tells client that table name is invalid
                    F.wsSend(ws, {
                        "quizNameInvalid": true
                    });
                }
                console.error(err.message);
            } else {
                F.wsSend(ws, {
                    "quizNameExists": false
                });
                // runs the callback which is to add elements to
                // the table that has just been created
                cb();
            }
        });
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
    });

};

// adding tableContents to the database
// please see board.js to see the format of tableContents
dbH.addToQuiz = function (tableName, tableContents, cb) {
    const db = new sqlite3.Database("./quiznconquerDB.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    // adds each qa pair to the table in the database
    tableContents.forEach(function (element) {
        let QA = [element.question, element.answer];
        let placeholders = QA.map((i) => "?").join(",");
        let insertQA = `INSERT INTO ${tableName.replace(/\s/g, "_")} (question, answer)
        VALUES (` + placeholders + `)`;
        db.run(insertQA, QA, function (err, row) {
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