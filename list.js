const List = Object.create(null);

List.sequence = (n) => Array.from(new Array(n).keys());

export default Object.freeze(List);