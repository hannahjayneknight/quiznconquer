import ui from "./uiGame.js";
import ws from "./ws.js";

window.addEventListener("load", function (event) {
    ui.init(ws);
});

