const F = Object.create(null);

F.sequence = (n) => Array.from(new Array(n).keys());

F.getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
    //The maximum is exclusive and the minimum is inclusive
};

// if this function is applied to two arrays arr1 and arr2
// like so: arr1.diff(arr2) it will remove the elements that
// are common to both from arr1 and return the new arr1
F.Array.prototype.diff = function(arr2) {
    var ret = [];
    // sorts the arrays to reindex their values
    this.sort((a,b) => a-b);
    arr2.sort((a,b) => a-b);
    // loops through the first array
    for (var i = 0; i < this.length; i += 1) {
        // NB: indexOf returns -1 if the element is not present
        // if there is an element in both arrays, it pushes it to ret

        // arr2.indexOf(this[i]) returns the first index at which this[i]
        // can be found in arr2
        if(arr2.indexOf(this[i]) === -1){
            ret.push(this[i]);
        }
    }
    return ret;
};

export default Object.freeze(F);
