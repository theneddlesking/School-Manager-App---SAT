

// HEIGHTS OF DIFFERENT PDF DATA TO DISPLAY QUESTION
//exact - (high degree of certainity)
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
const answerLine = 10; //height of answer text

//heights of graphically elements
const hybridFunc = 3;
const numberLine = 32;
const smallGraph = 92;
const medGraph = 106;
const largeGraph = 120;
const surd = 2;

const exerciseSpacing = 12; //spcae between exercises

//page dimensions
const pageHeight = 970;
const pageWidth = 735;

const pageOffset = 120; //exercise heading offset
const newPageOffset = 75; //no heading offset
const answersOffset = 150; //offset in answers textbook

const bottomOffset = 50; //offset to crop footer with useless information

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
var originalLength = 0; //original number of questions to calculate completed percentage later

function updateLoadingBar() {
        var progress = document.getElementById("progress-filled");
        var percentageDone = 100 * (originalLength-questionsToDo.length) / originalLength;
        progress.style.width = percentageDone + "%";
}

function generateFilter(questions, input) {
        var filterInput = document.getElementById("exercise-questions-input");

        if (input == undefined) {
              var filter = filterInput.value;
              if (filter == "" || filter == undefined) { //if no filter entered - display all questions
                      for (var i=0; i < questions.length; i++) {
                            questionsToDo.push(questions[i].questionNumber);
                      }
              } else {
                      questionsToDo = filter.split(', ');
              }
        } else { //if filter exists then do these questions
                questionsToDo = input.substring(17, input.length).split(',');
        }
}

function beginExercise(filter, input) {

      if (!selecting) { //avoiding double click on stacked onclick functions
            answer = false;
            exerciseData = cambridge.fetchData(currentSubjectData.name, "Exercise " + currentSubjectData.exerciseName, "Chapter " + currentSubjectData.chapter);

            if (exerciseData == undefined) { //failed to get data
                  return exerciseData;
            }

            if (filter) { //only show questions that user wants
                  generateFilter(exerciseData.questions);
            }  else {
                  generateFilter(exerciseData.questions, input);
            }

            document.getElementById("exercise-name").textContent = "Exercise " + currentSubjectData.exerciseName + " - " + currentSubjectData.name;

            currQuestion = 0;
            originalLength = questionsToDo.length; //initialise array length for percentage calculation
            console.log(questionsToDo);
            updateLoadingBar();
            displayQuestion(exerciseData.questions, questionsToDo[currQuestion]);

            loadPage("questions-page");

      } else {
            selecting = false;
      }
}

var answer = true;
function toggleAnswer() { //swaps between question view and answer view
        if (answer) {
              answer = false;
              displayQuestion(exerciseData.questions, questionsToDo[currQuestion]);
        } else {
              answer = true;
              displayAnswer(exerciseData.solutions, questionsToDo[currQuestion]);
        }
}

function addQuestionsToHomework() { //adds any questions that haven't bene completed for homework
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
        updateLoadingBar();
        if (currQuestion == questionsToDo.length) { //last question completed needs to go backwards as there is no new question
              changeQuestion(-1);
        }
        changeQuestion(0);
}

function changeQuestion(direction) { //direction 1 = next question, -1 = prev question, 0 = toggle answer / reload question if needed
        if (questionsToDo.length > currQuestion + direction && currQuestion + direction >= 0) {
              currQuestion += direction;
              answer = false;
              displayQuestion(exerciseData.questions, questionsToDo[currQuestion], false);
        }
}

function displayAnswer(exerciseData, questionNumber) {
        var index = questionNumber - 1;
        var aboveCrop = answersOffset; //displays question by cropping the top of the pdf iframe
        var currPage = exerciseData[0].pageNumber;
        for (var i=0; i < exerciseData.length; i++) { //loops through data to calculate top crop
                if (exerciseData[i].pageNumber > currPage) {
                        aboveCrop = 20;
                        currPage++;
                }

                if (i == index) { //adds height to the crop
                        var questionData = exerciseData[i];
                        var height = exerciseData[i].height * answerLine;
                        break;
                } else {
                      aboveCrop += exerciseData[i].height * answerLine;
                      aboveCrop += questionGap;
                }
        }

        //adds some room for error - sometimes displays other questions in addition but increases accuracy
        height += 15;

        if (questionNumber == exerciseData.length) { //if it is the last question then show the rest, height calculation bases off the next question so we have to load everything else
              height = 800 - aboveCrop;
        }

        //offsets for crop
        const left = 300;
        const right = 320;
        const width = 1200;

        //"magic factor" reduces error in width as it becomes inaccurate at larger widths
        var zoom = Math.max((width * MAGIC_FACTOR) / BOX_WIDTH, height / BOX_HEIGHT);
        //zoom makes the question fill the box the best it can

        //executes changes to CSS to crop
        makeCrop(350, 255 - 1/right - 1/left, aboveCrop, 300, zoom, "Answers", questionData.pageNumber);
}

function displayQuestion(exerciseData, questionNumber) { //similar idea with displayAnswer
        console.log(questionNumber);
        var index = questionNumber - 1;
        var aboveCrop = pageOffset;
        var currPage = exerciseData[0].pageNumber;
        for (var i=0; i < exerciseData.length; i++) {
                if (exerciseData[i].pageNumber > currPage) { //if questions overflow to the next page - account for that
                        aboveCrop = newPageOffset; //new page so
                        currPage++;
                }

                if (i == index) { //matched with questions
                        var questionData = exerciseData[i];
                        var height = exerciseData[i].height * line; //add the height
                        for (var j=0; j < exerciseData[i].parts.length; j++) { //loops through parts for extra height
                              height += questionPart;
                        }
                        break;
                } else {
                      aboveCrop += exerciseData[i].height * line;
                      aboveCrop += questionGap; //some gap between question to account for
                      for (var j=0; j < exerciseData[i].parts.length; j++) {
                            aboveCrop += questionPart;
                      }
                }
        }

        //adds buffer for error to improve accuracy
        aboveCrop -= 10;
        height += 15;

        if (questionNumber == exerciseData.length) { //final question loads rest of page
              height = 800 - aboveCrop;
        }

        //offsets for crop
        const left = 300;
        const right = 320;
        const width = 1200;

        //"magic factor" reduces error in width as it becomes inaccurate at larger widths
        var zoom = Math.max((width * MAGIC_FACTOR) / BOX_WIDTH, height / BOX_HEIGHT);

        var pdfName = "chapter" + currentSubjectData.chapter;

        //applies crop using CSS
        makeCrop(left, width - 1/right - 1/left, aboveCrop, height, zoom, pdfName, questionData.pageNumber);
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
      //re render to reset page number
      pdf.id = "pdf-iframe";
      pdf.style.width = "1200px";
      pdf.classList.add("no-scrolling");
      pdf.style.height = "1300px";
      pdf.src = "./PDFs/" + pdfName + ".pdf#toolbar=0&&zoom=" + zoom*100 + "&&page=" + pageNumber;

      //styling creates crop
      var pdfContainer = document.getElementById("pdf-container");
      pdf.style.left = 1/zoom * (-1 * left) +"px"; //inversely proportional to zoom
      pdf.style.top = zoom * (-1 * top) +"px";
      pdfContainer.style.width = zoom * right +"px";
      pdfContainer.style.height = zoom * bottom +"px";

      document.getElementById("pdf-container").appendChild(pdf);
      //document.getElementById("current-question").style.height = zoom * bottom + "px";
}
