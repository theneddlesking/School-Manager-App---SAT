//add array of accepted pages later if we needed more than 2 pages

loadPage("main")

function loadPage(page) {
        var main = document.getElementById("main");
        var questions = document.getElementById("questions-page");
        if (page == "main") {
              questions.classList.add("hide");
              questions.classList.remove("questions-page-grid");
              main.classList.remove("hide");
        } else {
              main.classList.add("hide");
              questions.classList.remove("hide");
              questions.classList.add("questions-page-grid");
        }
}
