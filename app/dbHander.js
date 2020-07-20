
import sqlite3 from "sqlite3";

// NB: this object is only used on the server side
const dbH = Object.create(null);

dbH.generateWordFromDB = function (cb) {
    const db = new sqlite3.Database("./sample.db", function (err) {
        if (err) {
            console.error(err.message);
        }
        // console.log("Connected to the sample database.");
    });

    // finds a random word from the ones being tested
    // (depends on level - NEED TO CHANGE LEVEL FOR THIS)
    let level = 6;
    const queryWord = `SELECT * FROM (
        SELECT * FROM Beginner_French ORDER BY ID LIMIT ${level}
        ) ORDER BY RANDOM() LIMIT 1;`;

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

export default Object.freeze(dbH);