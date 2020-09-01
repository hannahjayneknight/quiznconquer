const ui = require("./ui.js");

window.addEventListener("load", function (event) {
    history.pushState({id: "homePage"}, "Home", "./");
    ui.init();
});

