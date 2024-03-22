const F = Object.create(null);

F.wsSend = function (ws, obj) {
    //NB: web socket states can be found here: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    // if open, send message immediately
    // else queue the message
    
    if (ws.readystate !== 3) {
        ws.send(JSON.stringify(obj));
    }
};

F.sequence = (n) => Array.from(new Array(n).keys());

F.getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
    //The maximum is exclusive and the minimum is inclusive
};

// if this function is applied to two arrays arr1 and arr2
// it will remove the elements that are common to both from
// arr1 and return the new arr1
F.diff = function (arr1, arr2) {
    var ret = [];
    // sorts the arrays to reindex their values
    arr1.sort((a,b) => a-b);
    arr2.sort((a,b) => a-b);
    // loops through the first array
    for (var i = 0; i < arr1.length; i += 1) {
        // NB: indexOf returns -1 if the element is not present
        // if there is an element in both arrays, it pushes it to ret

        // arr2.indexOf(this[i]) returns the first index at which this[i]
        // can be found in arr2
        if(arr2.indexOf(arr1[i]) === -1){
            ret.push(arr1[i]);
        }
    }
    return ret;
};

// takes an array and removes any duplicates  in the array using .filter()
F.uniq = function (a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

// checks if an object is empty
// returns true for {}
// returns false if the object contains an empty string,
// a string containing only whitespace or any null/ undefined values
F.objEmpty = function (obj) {
    for (var key in obj) {
        if (F.strEmpty(key) || F.strEmpty(obj[key])) {
            return false;
        }
    }
    return true;
}

// for checking if a string is empty, null or undefined
F.strEmpty = function (str) {
    // returns true if str === "", str === "  " if str === undefined/ null
    // /^\s*$/ is the regex for empty string or string with only spaces.
    return (!str || (/^\s*$/.test(str)) );
}

F.arrEmpty = function (arr) {
    if (!Array.isArray(arr) || !arr.length) {
        // returns true if array does not exist, is not an array, or is empty
        // ⇒ do not attempt to process array
        return true;
    } else {
        return false;
    }
}

// returns an array with all the indexes of a repeated element in an array
F.getAllIndexes = function (arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

F.twoDArrEquals = (arr1, arr2) => arr1.every(
    (row1, i) => row1.every((tile, j) => tile === arr2[i][j])
);

F.oneDArrEquals = (arr1, arr2) => arr1.every(
    (tile, j) => tile === arr2[j]
);


export default Object.freeze(F);
