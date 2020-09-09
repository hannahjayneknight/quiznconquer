import F from "./usefulfunctions.js";
import Board from "./board.js";

const nav = Object.create(null);

const ClaN = (classname) => document.getElementsByClassName(classname);
const el = (id) => document.getElementById(id);
const pages = Array.from(ClaN("pages"));

/*
Note that when a user clicks a button or the browser's back button, we
have no idea which page they left. This is for security reasons because
otherwise every site you visit could see all the other sites you've been to.

Note that we pushState to history when a button is clicked but replaceState to
history when the back button has been pressed. pushState adds that page to the
history array, whereas replaceState is simply used to change the url and what is
visible on the browser. This is because when the back button is pressed,
history.back is automatically called.
*/



// WHAT IS THE POINT OF THIS FUNCTION?
nav.selectPage = function (id) {
    // id = the page you are going to
    pages.forEach(function (p) {
        // makes an array called p.classList that only contains the string "pages" which
        // is the name of the class
        p.classList.toggle("selected", p.id === id);
    });
};

nav.goToPage = function (page) {

    // if an empty string has been parsed in, sends to the home page
    if (F.strEmpty(page)) {
        page = "homePage";
    }

    // page = the page user wants to go to
    // window.location.pathname.replace("/", "") = page they were leaving

    // UI
    if (F.strEmpty(window.location.pathname.replace("/", ""))) {
        el("homePage").style.display = "none";
    } else {
        el(window.location.pathname.replace("/", "")).style.display = "none";
    }

    el(page).style.display = "block";
    if (page === "homePage") {
        el("home-button").style.display = "none";
    } else {
        el("home-button").style.display = "block";
    }

    // change URL pathname and history obj
    if (page === "gamePage") {
        Board.resetTileBoard();
        history.pushState({id: page}, `${page}`, `./${page}`);
    }
    history.pushState({id: page}, `${page}`, `./${page}`);
};


// when the back button is clicked...
nav.listen = function () {

    window.addEventListener("popstate", function (e) {
        // e.state is null if you are going back to the homepage
        if (e.state === null || e.state.id === "homePage") {
            //nav.selectPage("homePage");


            // history.replaceSate does the following:
            // adds id from history array
            history.replaceState({id: "homePage"}, "Home", "homePage");
            // nav to homepage here
            // 1. hides ALL visible elements
            pages.forEach(function (e) {
                el(e.id).style.display = "none";
            });
            // 2. reveals the one the user has clicked back to go to
            el("homePage").style.display = "block";
            // and the buttons
            el("home-button").style.display = "none";
            el("commonButtons").style.display = "block";
        } else {
            // page returning to = e.target.replace("http://localhost:1711/", "")
            //nav.selectPage(e.target.location.pathname.replace("/", ""));

            history.replaceState({id: e.target.location.pathname.replace("/", "")}, e.target.location.pathname.replace("/", ""), e.target.location.pathname.replace("/", ""));

            // nav to the page
            // 1. hides ALL visible elements
            pages.forEach(function (e) {
                el(e.id).style.display = "none";
            });
            // 2. reveals the one the user has clicked back to go to
            el(e.target.location.pathname.replace("/", "")).style.display = "block";
            // and the buttons
            el("commonButtons").style.display = "block";
        }
    });

};

export default Object.freeze(nav);