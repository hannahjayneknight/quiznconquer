import nav from "./navigation.js";
import ws from "./ws.js";

window.addEventListener("load", function (event) {
    nav.hosting(ws);
});