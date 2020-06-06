const dictionary = Object.create(null);

// the keys are the english words
// the values are the french words
dictionary.beginner = {
    "accident": "accident",
    "adult": "adulte",
    "afraid": "effrayé",
    "salt": "sel",
    "afternoon": "après-midi"
};

dictionary.intermediate = {
    "to start out": "faire ses débuts",
    "le salon (not the living room)": "exhibition",
    "l'escrime": "fencing"
};

export default Object.freeze(dictionary);