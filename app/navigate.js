import F from "./usefulfunctions.js";
import Board from "./board.js";

const nav = Object.create(null);

const ClaN = (classname) => document.getElementsByClassName(classname);
const el = (id) => document.getElementById(id);
const pages = Array.from(ClaN("pages"));
let navHistory = [];

/*
Note that when a user clicks a button or the browser's back button, we
have no idea which page they left. This is for security reasons because
otherwise every site you visit could see all the other sites you've been to.

We use an array to store the history of the user.

Note that we pushState to history when a button is clicked but replaceState to
history when the back button has been pressed. pushState adds that page to the
history array, whereas replaceState is simply used to change the url and what is
visible on the browser. This is because when the back button is pressed,
history.back is automatically called.
*/



nav.goToPage = function (page) {

    // blocking the previous page

    // blocking the home page
    if (navHistory.length === 0) {
        el("homePage").style.display = "none";
    // blocking other pages
    } else if (navHistory[navHistory.length - 1] !== undefined) {
        el(navHistory[navHistory.length - 1]).style.display = "none";
    }

    el(page).style.display = "block";
    if (page === "homePage") {
        el("home-button").style.display = "none";
    } else {
        el("home-button").style.display = "block";
    }

    // change history obj
    if (page === "gamePage") {
        Board.resetTileBoard();
    }
    history.pushState({id: page}, `${page}`);
    navHistory.push(page);
};




// when the back button is clicked...
nav.listen = function () {

    window.addEventListener("popstate", function (e) {

        // going back to the homepage
        if (e.state === null || e.state.id === "homePage") {

            // history.replaceSate does the following:
            // removes the last entry of the history array
            // replaces it with the new page
            history.replaceState({id: "homePage"}, "Home");

            // remove last page from our nav array and hides it
            el(navHistory.pop()).style.display = "none";
            el("home-button").style.display = "none";

            el("homePage").style.display = "block";

        } else {

            history.replaceState(
                {id: e.target.location.pathname.replace("/", "")},
                e.target.location.pathname.replace("/", "")
            );
            // remove last page from our nav array and hides it
            el(navHistory.pop()).style.display = "none";

            el(navHistory[navHistory.length - 1]).style.display = "block";

        }
    });

};

export default Object.freeze(nav);