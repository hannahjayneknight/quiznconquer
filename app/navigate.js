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



// when a button is clicked which causes the page to change...
pages.forEach(function (b) {
    // id is the page the user left
    let id = b.id;
    b.addEventListener("click", function (e) {
        // finds the class name of the button that was clicked. The
        // class name will be the id of the page that the user is now
        // currently on
        let clickedPage = e.target.className;
        // history.pushState does the following:
        // id is the page that was left
        // clicked page is the page that was joined
        if (id === "commonButtons") {
            if (e.target.className === "homePage") {
                history.pushState({id: "homePage"}, `${clickedPage}`, `./${clickedPage}`);
            }
        } else {
            history.pushState({id: e.target.className}, `${clickedPage}`, `./${clickedPage}`);
        }
        //history.pushState({id: id}, `Selected: ${clickedPage}`, `./${clickedPage}`);
        // this would add it to the url
        // history.pushState({id}, `Selected: ${id}`, `./selected=${id}`);
        // when a page has been clicked, it selects that page


        //nav.selectPage(clickedPage);
    });
});



// when the back button is clicked...
nav.listen = function () {
    window.addEventListener("popstate", function (e) {
        // e.state is null if you are going back to the homepage
        if (e.state === null || e.state.id === "homePage") {
            //nav.selectPage("homePage");


            // history.replaceSate does the following:
            // adds id from history array
            history.replaceState({id: "homePage"}, "Home", "");
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