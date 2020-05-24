const F = Object.create(null);

F.sequence = (n) => Array.from(new Array(n).keys());

export default Object.freeze(F);
