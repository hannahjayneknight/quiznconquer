const Board = Object.create(null);

Board.startBoard = () => [
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [2, 2, 2, 3, 3, 3],
    [2, 2, 2, 3, 3, 3],
    [2, 2, 2, 3, 3, 3]
];

export default Object.freeze(Board);