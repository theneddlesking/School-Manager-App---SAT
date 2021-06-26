//add array of accepted pages later if we needed more than 2 pages

function loadPage(page) {
        var main = document.getElementById("main");
        var questions = document.getElementById("questions-page");

        if (page == "main") {
              alert("funny")
              questions.classList.add("hide");
              main.classList.remove("hide");
        } else {
              main.classList.add("hide");
              questions.classList.remove("hide");
        }
}
