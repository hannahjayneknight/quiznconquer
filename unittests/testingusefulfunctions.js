const T = Object.create(null);

T.twoDArrEquals = (arr1, arr2) => arr1.every(
    (row1, i) => row1.every((tile, j) => tile === arr2[i][j])
);

T.oneDArrEquals = (arr1, arr2) => arr1.every(
    (tile, j) => tile === arr2[j]
);

T.sequence = (n) => Array.from(new Array(n).keys());

export default Object.freeze(T);