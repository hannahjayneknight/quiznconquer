import H from "../app/handler.js";
import T from "./testingusefulfunctions.js";
//import F from "./app/usefulfunctions.js";

const describe = window.describe;
const it = window.it;
//const fc = window.fastcheck;
//const chai = window.chai;

describe("Example Based Testing", function () {
    // "it" is the function that describes an individual test
    it("getIndexOfK function works as expected", function () {
        const divNums = [
            [0, 1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29],
            [30, 31, 32, 33, 34, 35]
        ];
        const index = H.getIndexOfK(divNums, 5);
        const expected = [5, 0];
        if (!T.oneDArrEquals(index, expected)) {
            throw "getIndexOfK did not work as expected";
        }

    });
});