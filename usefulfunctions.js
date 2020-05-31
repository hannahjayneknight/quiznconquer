const F = Object.create(null);

F.sequence = (n) => Array.from(new Array(n).keys());

F.getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
    //The maximum is exclusive and the minimum is inclusive
};

export default Object.freeze(F);
