import ui from "./uiGame.js";
import ws from "./websocket.js";

window.addEventListener("load", function (event) {
    ui.init(ws);
});

