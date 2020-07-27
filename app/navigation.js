
const el = (id) => document.getElementById(id);
const nav = Object.create(null);

// sends a message to the server telling it whether
// the player is hosting or joining a game
nav.hosting = function (ws) {
    el("join-anchor").addEventListener("click", function () {
        ws.send(JSON.stringify(
            {"hosting": false}
        ));
    });

    el("host-anchor").addEventListener("click", function () {
        ws.send(JSON.stringify(
            {"hosting": true}
        ));
    });
};


export default Object.freeze(nav);