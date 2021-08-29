//exact
const colTopCrop = 75; //crop top of column
const colHeight = 765; //height of the entire column
const firstPageCrop = 280; //crop of first page (space above)

//mostly exact
const chapterHeight = 30; //height of chapter heading
const exerciseHeight = 18; //height of exercise heading
const exercisePageWidth = 250; //width of questions in an exercise

//mostly accurate

//heights of PDF elements
const line = 18; //height of regular text
const medLine = 18; //height of medium text (ie. small fractions, etc.)
const fraction = 26;
const questionPart = 7;
const questionGap = 10;

//largely different

const hybridFunc = 3;
const numberLine = 32;
const smallGraph = 92;
const medGraph = 106;
const largeGraph = 120;
const surd = 2;

const exerciseSpacing = 12;

const pageHeight = 970;
const pageWidth = 735;

const pageOffset = 120;
const pageOffset2 = 75;

const bottomOffset = 50;

//zooms the question to fill the box
const BOX_WIDTH = 750;
const BOX_HEIGHT = 250;

//not actually magic***
const MAGIC_FACTOR = 0.82; //as width increases the zoom calculations are less reliable so we reduce the width value to mitigate error

//cropColumn(1, firstPageCrop + chapterHeight + exerciseHeight + 0, lineHeight);
//cropColumn(2, 0, line*3 + medGraph*2 + fraction*1 + fraction*1 + line + hybridFunc + hybridFunc + fraction*2 + hybridFunc + line + fraction + line  + hybridFunc + surd + line*2 + surd + hybridFunc + line*2 + surd + largeGraph + hybridFunc + medLine*2 + line + line*2);


var pdfSrc = "Answers.pdf#toolbar=0&&zoom=100&&page=3";


var exerciseData;
function beginExercise() {
      if (!selecting) {
            exerciseData = cambridge.fetchData("Maths Methods", "Exercise 17D", "17");

            displayQuestion(exerciseData.questions, 1);
            loadPage("questions-page");

      } else {
            selecting = false;
      }
}

var currQuestion = 1;

function displayNextQuestion() {
        currQuestion++;
        displayQuestion(exerciseData.questions, currQuestion);
}

function displayQuestion(exerciseData, questionNumber) {
        var index = questionNumber - 1;
        var aboveCrop = pageOffset;
        var currPage = exerciseData[0].pageNumber;
        for (var i=0; i < exerciseData.length; i++) {
                if (exerciseData[i].pageNumber > currPage) {
                        aboveCrop = pageOffset2;
                        currPage++;
                }

                if (i == index) {
                        var questionData = exerciseData[i];
                        var height = exerciseData[i].height * line;
                        for (var j=0; j < exerciseData[i].parts.length; j++) {
                              height += questionPart;
                        }
                        break;
                } else {
                      aboveCrop += exerciseData[i].height * line;
                      aboveCrop += questionGap;
                      for (var j=0; j < exerciseData[i].parts.length; j++) {
                            aboveCrop += questionPart;
                      }
                }
        }

        aboveCrop -= 10;
        height += 15;

        if (questionNumber == exerciseData.length) {
              height = 800 - aboveCrop;
        }

        var zoom = Math.max((1200 * MAGIC_FACTOR) / BOX_WIDTH, height / BOX_HEIGHT);

        makeCrop(300, 1200 - 1/320 - 1/300, aboveCrop, height, zoom, "chapter17", questionData.pageNumber);

        console.log(zoom);
}

// var questionData = {
//       pageNumber : 5,
//       pdfName : 'chapter1',
//
//       height : 55, //height of the question
//       above : 670, //vertical space above the question
//       width : 1200, //width of the question
//
//       //these will mostly be constant as most questions take the full width of the page
//       left : 300,
//       right : 320,
// }
//
// var questionData = {
//       pageNumber : 5,
//       pdfName : 'chapter1',
//
//       height : 70, //height of the question
//       above : 725, //vertical space above the question
//       width : 1200, //width of the question
//
//       //these will mostly be constant as most questions take the full width of the page
//       left : 300,
//       right : 320,
// }



// makeCrop(40, 660, 0, 970, 1);
// makeCrop(0, 735, 670, 55, 1);




//100% left = 40
//100% right = 660

function cropColumn(col, top, height) { //crop for answers in columns
      var right = 255; //default width of column
      var left;
      if (col == 1) {
            left = 125; //crop for column 1
      } else {
            left = 400; //crop for column2
      }
      makeCrop(left, right, top+colTopCrop, height, 1);
}

function makeCrop(left, right, top, bottom, zoom, pdfName, pageNumber) {
      document.getElementById("pdf-container").innerHTML = "";
      var pdf = document.createElement("iframe");
      pdf.id = "pdf-iframe";
      pdf.style.width = "1200px";
      pdf.style.height = "1300px";
      console.log(pdfName + ".pdf#toolbar=0&&zoom=" + zoom*100 + "&&page=" + pageNumber);
      pdf.src = pdfName + ".pdf#toolbar=0&&zoom=" + zoom*100 + "&&page=" + pageNumber;
      var pdfContainer = document.getElementById("pdf-container");
      pdf.style.left = 1/zoom * (-1 * left) +"px"; //inversely proportional to zoom
      pdf.style.top = zoom * (-1 * top) +"px";
      pdfContainer.style.width = zoom * right +"px";
      pdfContainer.style.height = zoom * bottom +"px";

      document.getElementById("pdf-container").appendChild(pdf);
}
