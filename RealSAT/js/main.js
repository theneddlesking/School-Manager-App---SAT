//LOAD DIFFERENT PAGES - USEFUL FOR QUICKLY DEBUGGING

function loadPage(page) {
        var pages = [
                document.getElementById("main"),
                document.getElementById("questions-page"),
                document.getElementById("start-page"),
        ];
        for (var i=0; i < pages.length; i++) {
              pages[i].classList.add("hide");
        }
        document.getElementById(page).classList.remove("hide");


        if (page == "questions-page") {
              document.getElementById("questions-page").classList.add("questions-page-grid");
        } else {
              document.getElementById("questions-page").classList.remove("questions-page-grid");
        }
}

function loadMain(page) {
      loadPage("main");
}
