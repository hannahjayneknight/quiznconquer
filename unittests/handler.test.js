import H from "../app/handler.js";
import T from "./testingusefulfunctions.js";

const describe = window.describe;
const it = window.it;
const chai = window.chai;
const fc = window.fastcheck;

describe("Example Based Testing", function () {
    // "it" is the function that describes an individual test
    it("getIndexOfK function works as expected", function () {
        const index = H.getIndexOfK(5);
        const expected = [5, 0];
        if (!T.oneDArrEquals(index, expected)) {
            throw "getIndexOfK did not work as expected";
        }

        chai.expect(H.startBoard()).to.deep.equal([
            1, 1, 1, 2, 2, 2,
            1, 1, 1, 2, 2, 2,
            1, 1, 1, 2, 2, 2,
            3, 3, 3, 4, 4, 4,
            3, 3, 3, 4, 4, 4,
            3, 3, 3, 4, 4, 4
        ]);

    });
});


// get a random player number
const arbPlayer = fc.integer(1, 4);
// generates a random board with players in random places
const arbBoard = fc.array(arbPlayer, 36, 36);

describe("Winning a tile", function () {
    it(
        "Given any board; " +
        "After playerX wins a tile; " +
        "The new board will not be the same as the board before.",
        function () {
            fc.assert(fc.property(
                arbBoard,
                arbPlayer,

                // takes in a random board, and player then
                // adds a new tile for that player
                function (board, player) {
                    // makes a copy of the board. This board will have its tile
                    // changed to be compared with the original board
                    const copyBoard = board.slice();
                    H.changeTile(

                        H.freeTile(player, copyBoard),
                        copyBoard,
                        player

                    );
                    // returns true if it has changed a tile
                    return !(T.oneDArrEquals(board, copyBoard));
                }
            ), {"verbose": true});
        }
    );
});

describe("Calculating the score", function () {
    it(
        "Given any board; " +
        "After the game ends; " +
        "The score can be calculated.",
        function () {

            fc.assert(fc.property(
                arbBoard,
                // takes in a random board and calculates the placing of players
                function (board) {
                    let places = H.findWinner(board);
                    // returns true if a nonempty array has been returned
                    return !(T.arrEmpty(places));
                }
            ), {"verbose": true});
        }
    );
});