const T = Object.create(null);

T.twoDArrEquals = (arr1, arr2) => arr1.every(
    (row1, i) => row1.every((tile, j) => tile === arr2[i][j])
);

T.oneDArrEquals = (arr1, arr2) => arr1.every(
    (tile, j) => tile === arr2[j]
);

T.sequence = (n) => Array.from(new Array(n).keys());

T.arrEmpty = function (arr) {
    if (!Array.isArray(arr) || !arr.length) {
        // returns true if array does not exist, is not an array, or is empty
        // ⇒ do not attempt to process array
        return true;
    } else {
        return false;
    }
};

export default Object.freeze(T);