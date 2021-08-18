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

//cropColumn(1, firstPageCrop + chapterHeight + exerciseHeight + 0, lineHeight);
cropColumn(2, 0, line*3 + medGraph*2 + fraction*1 + fraction*1 + line + hybridFunc + hybridFunc + fraction*2 + hybridFunc + line + fraction + line  + hybridFunc + surd + line*2 + surd + hybridFunc + line*2 + surd + largeGraph + hybridFunc + medLine*2 + line + line*2);

function cropColumn(col, top, height) {
      var right = 255;
      var left;
      if (col == 1) {
            left = 125;
      } else {
            left = 400;
      }
      makeCrop(left, right, top+colTopCrop, height);
}

function makeCrop(left, right, top, bottom) {
      var pdf = document.getElementById("pdf-iframe");
      var pdfContainer = document.getElementById("pdf-container");
      pdf.style.left = -1 * left +"px";
      pdf.style.top = -1 * top +"px";
      pdfContainer.style.width = right+"px";
      pdfContainer.style.height = bottom+"px";
}
