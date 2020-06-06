const findFreeTile = function(element) {
    // returns the value of the first element in surroundingTiles
    // that has a class that does not equal the class of the winner
    surroundingTiles(element).find(
        (element2) => element2.className !== classWinner
        );
    // otherwise returns undefined
};

// returns true if the at least one of the surrounding tiles is free
const areThereFreeTiles = function (array) {
    const result = array.some(
        (element2) => element2.className !== classWinner // need to change classWinner
    );
    return result;
};

// finds the first tile within an array of tiles that is free
// takes in the player's current tiles
const findTile = function (array) {
    return array.find( (element) => findFreeTile(element) );

};


// console.log(player1.namedItem("tile2")); // returns the div within the class
// player1tile that has the id "tile2"



// this loops through all the divs withint player1tile class
// next need to apply the function to this loop
// NB: I need the Array.from for this to work

const correctAnswer = function (playerNumber) {
    const playersTiles = Array.from(document.getElementsByClassName("player" + playerNumber + "tile"));
    // this changes ALL the elements of this person's to their colour
    // NB: need to change the colour of the tile and the ID!
    playersTiles.forEach(function(element) { // *****
        if () {
            // sets the tile to that winning player's colour
            element.style.backgroundColor = playerColours[playerNumber-1];
            // changes the id of the tile to the winning player's id
            element.id = "player" + playerNumber + "tile";
        }

    });
};


/*
// Finds a tile close the ones currently owned by the player who won the point
// which will be the tile to change colour when they win the next point

// takes in the player's colour

// iterate through each div element that belongs to the player on the board,
// when it finds one that has a tile around it that is a different colour, it
// will change that colour


    const tiles = [];
    F.sequence(36).forEach(function (element) {
        tiles.push("tile" + element);
    });

    tiles.forEach(
        // finds if the colour of the tile matches the player's colour
        // if (colour === )
    )
};

// Changes the tile colour to the colour of the player that just got a correct
// answer. Takes in the id of the tile to change the colour of and the colour
// to change it to
Board.changeTileColour = function (tile, colour) {
    el(tile).style.backgroundColor = colour;
};

// returns the start board
Board.setStartBoard = function () {

};
*/

// when a player gets a correct answer, a tile will change to their colour
// on the board

// 1. recognise that they got the answer correct
// 2. find a tile that is their colour at the moment
// 3. find a tile next to it that isn't their colour
// 4. change this tile's colour

    /*
    const playerColours = [ "blue", "green", "yellow", "black"];
    const correctAnswer = function (playerNumber) {
        const playersTiles = Array.from(document.getElementsByClassName("player" + playerNumber + "tile"));
        // this changes ALL the elements of this person's to their colour
        // NB: need to change the colour of the tile and the ID!
        playersTiles.forEach(function(element) { // *****
            // sets the tile to that player's colour
            element.style.backgroundColor = playerColours[playerNumber-1];
            // changes the id of the tile to the player that won the point
            element.className = "player" + playerNumber + "tile";
            console.log(element);
            console.log(parseInt(element.id) +1);
        });
    }; */