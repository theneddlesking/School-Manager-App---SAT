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
const line = 14; //height of regular text
const medLine = 18; //height of medium text (ie. small fractions, etc.)
const fraction = 26;

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


//cropColumn(1, firstPageCrop + chapterHeight + exerciseHeight + 0, lineHeight);
//cropColumn(2, 0, line*3 + medGraph*2 + fraction*1 + fraction*1 + line + hybridFunc + hybridFunc + fraction*2 + hybridFunc + line + fraction + line  + hybridFunc + surd + line*2 + surd + hybridFunc + line*2 + surd + largeGraph + hybridFunc + medLine*2 + line + line*2);


var pdfSrc = "Answers.pdf#toolbar=0&&zoom=100&&page=3";

var exerciseData = cambridge.fetchData("Maths Methods", "Exercise 17D", "Chapter 17");

//
var questionData = {
      pageNumber : 5,
      pdfName : 'chapter1',

      height : 55, //height of the question
      above : 670, //vertical space above the question
      width : 1200, //width of the question

      //these will mostly be constant as most questions take the full width of the page
      left : 300,
      right : 320,
}

var questionData = {
      pageNumber : 5,
      pdfName : 'chapter1',

      height : 70, //height of the question
      above : 725, //vertical space above the question
      width : 1200, //width of the question

      //these will mostly be constant as most questions take the full width of the page
      left : 300,
      right : 320,
}

//zooms the question to fill the box
const BOX_WIDTH = 750;
const BOX_HEIGHT = 250;

//not actually magic***
const MAGIC_FACTOR = 0.82; //as width increases the zoom calculations are less reliable so we reduce the width value to mitigate error

var zoom = Math.max((questionData.width * MAGIC_FACTOR) / BOX_WIDTH, questionData.height / BOX_HEIGHT);

console.log("zoom: " + zoom);
//makeCrop(40, 660, 0, 970, 1);
//makeCrop(0, 735, 670, 55, 1);

makeCrop(questionData.left, questionData.width - 1/questionData.right - 1/questionData.left, questionData.above, questionData.height, zoom)


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

function makeCrop(left, right, top, bottom, zoom) {
      var pdf = document.getElementById("pdf-iframe");
      pdf.src = questionData.pdfName + ".pdf#toolbar=0&&zoom=" + zoom*100 + "&&page=" + questionData.pageNumber;
      var pdfContainer = document.getElementById("pdf-container");
      pdf.style.left = 1/zoom * (-1 * left) +"px"; //inversely proportional to zoom
      pdf.style.top = zoom * (-1 * top) +"px";
      pdfContainer.style.width = zoom * right +"px";
      pdfContainer.style.height = zoom * bottom +"px";
}
