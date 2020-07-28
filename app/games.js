const games = Object.create(null);

/*

games is an object that stores info about all the games
currently being played.

One game would look like this:

games.WXYZ = {

    players: {
        player1: { player web socket object goes here },
        player2: { player web socket object goes here },
        player3: { player web socket object goes here },
        player4: { player web socket object goes here }
    },
    public: true

}

*/

export default Object.freeze(games);