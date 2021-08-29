//exact
const colTopCrop = 75; //crop top of column
const colHeight = 765; //height of the entire column
const firstPageCrop = 280; //crop of first page (space above)

//mostly exact
const chapterHeight = 30; //height of chapter heading
const exerciseHeight = 18; //height of exercise heading
const exercisePageWidth = 250; //width of questions in an exercise

//heights of PDF elements
const line = 18; //height of regular text
const medLine = 18; //height of medium text (ie. small fractions, etc.)
const fraction = 26;
const questionPart = 7;
const questionGap = 10;


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

var currQuestion = 1;

var exerciseData;

var questionsToDo = [];

function generateFilter(questions, input) {
        var filterInput = document.getElementById("exercise-questions-input");

        if (input == undefined) {
              var filter = filterInput.value;
              if (filter == "" || filter == undefined) {
                      for (var i=0; i < questions.length; i++) {
                            questionsToDo.push(questions[i].questionNumber);
                      }
              } else {
                      questionsToDo = filter.split(', ');
              }
        } else {
                questionsToDo = input.substring(17, input.length).split(',');
        }




}

function beginExercise(filter, input) {
      if (!selecting) { //avoiding double click on stacked onclick functions
            exerciseData = cambridge.fetchData(currentSubjectData.name, "Exercise " + currentSubjectData.exerciseName, "Chapter " + currentSubjectData.chapter);
            if (filter) {
                  generateFilter(exerciseData.questions);
            }  else {
                  generateFilter(exerciseData.questions, input);
            }

            currQuestion = 0;
            console.log(questionsToDo);
            displayQuestion(exerciseData.questions, questionsToDo[currQuestion]);

            loadPage("questions-page");

      } else {
            selecting = false;
      }
}

function addQuestionsToHomework() {
        var homeworkTask = new HomeworkTask(currentSubjectData, new Date(), currentSubjectData.name + " " + currentSubjectData.exerciseName , "Questions to do: " + questionsToDo, true);
        homeworkData.addHomework(homeworkTask);
        updateHomeworkData(false, true);
}

function completedQuestion() {
        questionsToDo.splice(currQuestion, 1); //once question is completed - question is removed
        if (questionsToDo.length == 0) {
              alert("Exercise complete");
              loadPage("main");
        }
        changeQuestion(0);
}

function changeQuestion(direction) {
        if (questionsToDo.length >= currQuestion + direction && currQuestion + direction >= 0) {
              currQuestion += direction;
              displayQuestion(exerciseData.questions, questionsToDo[currQuestion]);
        }
}

function displayQuestion(exerciseData, questionNumber) {
        console.log(questionNumber);
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

        //offsets for crop
        const left = 300;
        const right = 320;
        const width = 1200;

        //"magic factor" reduces error in width as it becomes inaccurate at larger widths
        var zoom = Math.max((width * MAGIC_FACTOR) / BOX_WIDTH, height / BOX_HEIGHT);

        makeCrop(left, width - 1/right - 1/left, aboveCrop, height, zoom, "chapter" + currentSubjectData.chapter, questionData.pageNumber);
}


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
      //re render to reset page

      pdf.id = "pdf-iframe";
      pdf.style.width = "1200px";
      pdf.classList.add("no-scrolling");
      pdf.style.height = "1300px";
      console.log(pdfName + ".pdf#toolbar=0&&zoom=" + zoom*100 + "&&page=" + pageNumber);
      pdf.src = pdfName + ".pdf#toolbar=0&&zoom=" + zoom*100 + "&&page=" + pageNumber;
      var pdfContainer = document.getElementById("pdf-container");
      pdf.style.left = 1/zoom * (-1 * left) +"px"; //inversely proportional to zoom
      pdf.style.top = zoom * (-1 * top) +"px";
      pdfContainer.style.width = zoom * right +"px";
      pdfContainer.style.height = zoom * bottom +"px";

      document.getElementById("pdf-container").appendChild(pdf);
      //document.getElementById("current-question").style.height = zoom * bottom + "px";
}
