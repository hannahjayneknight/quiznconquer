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
        const index = H.getIndexOfK(5);
        const expected = [5, 0];
        if (!T.oneDArrEquals(index, expected)) {
            throw "getIndexOfK did not work as expected";
        }

    });
});


// do a test to check that server currentBoard is as expected?