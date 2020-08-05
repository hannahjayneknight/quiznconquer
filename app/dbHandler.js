
import sqlite3 from "sqlite3";

// NB: this object is only used on the server side
const dbH = Object.create(null);

// used to generate a testing word
// NEED TO MODIFY SO TAKES IN THE TABLE TO BE USED
dbH.generateWordFromDB = function (quiz, cb) {
    const db = new sqlite3.Database("./sample.db", function (err) {
        if (err) {
            console.error(err.message);
        }
        // console.log("Connected to the sample database.");
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
            // console.log(dbObj);
        });
    });


    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
        cb(dbObj);
        // console.log("Close the database connection.");
    });
};


// lists all the available quizzes
dbH.getInfoTables = function (cb) {

    const db = new sqlite3.Database("./sample.db", function (err) {
        if (err) {
            console.error(err.message);
        }
        // console.log("Connected to the sample database.");
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

        // console.log("Close the database connection.");
        cb(dbObj.quizzes);
    });

};

// creating a quiz as a table in the database
dbH.createQuiz = function (tableName, cb) {
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

    const dbObj = {};
    db.serialize(function () {
        db.run(createTable, [], function (err, row) {
            if (err) {
                return console.error(err.message);
            }
        });
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
        // runs the callback which is to add to the table that
        // has just been created
        cb();
    });

};

// adding tableContents to the database
// please see board.js to see the format of tableContents
dbH.addToQuiz = function (tableName, tableContents) {
    const db = new sqlite3.Database("./sample2.db", function (err) {
        if (err) {
            console.error(err.message);
        }
    });

    const insertQA = `INSERT INTO ${tableName} (question, answer)
    VALUES (?, ?)`;

    // adds each qa pair to the table in the database
    tableContents.forEach( function (element) {
        db.run(insertQA, [element.question, element.answer], function (err, row) {
            if (err) {
                return console.error(err.message);
            }
        });
    });

    db.close(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
};

export default Object.freeze(dbH);