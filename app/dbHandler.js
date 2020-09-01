
const sqlite3 = require("sqlite3");
import F from "./usefulfunctions.js";

// NB: this object is only used on the server side
const dbH = Object.create(null);

// used to generate a testing word
dbH.generateWordFromDB = function (quiz, cb) {
    const db = new sqlite3.Database("./sample2.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    // finds a random word from the ones being tested
    // (depends on level - NEED TO CHANGE LEVEL FOR THIS)

    const queryWord = `SELECT * FROM (
        SELECT * FROM ${quiz} ORDER BY ROWID
        ) ORDER BY RANDOM() LIMIT 1;`;

    /*

    if you want to limit by level:

    let level = 6;
    const queryWord = `SELECT * FROM (
        SELECT * FROM ${quiz} ORDER BY ROWID LIMIT ${level}
        ) ORDER BY RANDOM() LIMIT 1;`;

    */

    const dbObj = {};
    db.serialize(function () {
        db.get(queryWord, [], function (err, row) {
            if (err) {
                return console.error(err.message);
            }
            // adds the random word to the database object
            // eg dbObj.word = { word: { name: 'ham', langID:4,answer:'jambon'}}
            // dbObj.word.name gives the word to be questioned
            // dbObj.word.answer gives the answer to that word
            dbObj.word = row;
        });
    });


    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
        cb(dbObj);
    });
};


// lists all the available quizzes
dbH.getInfoTables = function (cb) {

    const db = new sqlite3.Database("./sample2.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    const queryTables = `SELECT name FROM sqlite_master
    WHERE type='table'
    ORDER BY name;`;

    const dbObj = {};
    db.serialize(function () {
        db.all(queryTables, [], function (err, row) {
            if (err) {
                return console.error(err.message);
            }
            // saves the array of all the tables to dbObj.quizzes
            dbObj.quizzes = row;
        });
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
    const db = new sqlite3.Database("./sample2.db", function (err) {
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
    const db = new sqlite3.Database("./sample2.db", function (err) {
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
    {question: 'salt', answer: 'sel'},
    {question: 'bed', answer: 'lit'},
    {question: 'ham', answer: 'jambon'},
    ...
]
*/
dbH.getQA = function (quiz, cb) {

    const db = new sqlite3.Database("./sample2.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    const getQA = `SELECT question, answer
    FROM ${quiz};`;

    const dbArr = [];
    db.serialize(function () {
        db.all(getQA, [], function (err, row) {
            if (err) {
                return console.error(err.message);
            }
            row.forEach((element) => dbArr.push(element));
        });
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }

        cb(dbArr);
    });
};

export default Object.freeze(dbH);