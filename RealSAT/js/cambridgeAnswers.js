var myPDFs = [];
var qnsCount = 0;
var totalErrors = 0;

//BUG: chapter review not split into multiple sections (which screws up qns numbers)
//BUG: chapter reviews as lone chapters do not contain exercises which screws things up
//EXCEPTION: confirmed! question numbers can be inline --- see Exercise 16!
//TODO: add graph, diagrams
//TODO: add multi part multi part question support (ie. i, ii, iii)
//TODO: question parts don't hold an answer!! only the line they begin on
//BUG / EXCEPTION: code assumes that a question is guaranteed to be a question if not immediately followed by the same question
//eg. 1 a = 3 +
//l2    2 - x +
//l3    3
//l4    2 a x = 5 b x = 3
//Current code returns l2 as qns 2 when l4 is qns 2
//instead you can loop through until you hit the next number (loop until you hit 3, doesn't account for all cases but much more accurate)

document.getElementById('file').onchange = function(){ //upload of actual PDF
    var file = this.files[0];
    var entirePDF;
    var pdf = [];

    var reader = new FileReader();
    reader.onload = function(progressEvent){
        entirePDF = this.result;

      // By lines
      var lines = this.result.split('\n');
      for(var line = 0; line < lines.length; line++){
        pdf.push(lines[line]);
        //console.log(lines[line]);
      }
        //console.log(pdf);
        //console.log("Succesfully read PDF.");
        myPDFs.push(formatTextbook(pdf));
         //first pdf, chapter 1, exercise A

         //formatQuestionsFromAll();

         console.log(totalErrors + " errors from " + qnsCount + " questions.");

         var exercise1A = formatQuestions(myPDFs[0][0][0]);
         //console.log(exercise1A);

    };
    reader.readAsText(file);
};

function formatQuestionsFromAll() {
  var pdf = [];
  for (var i=0; i < myPDFs[0].length; i++) {
      pdf.push([]);
      for (var j=0; j < myPDFs[0][i].length; j++) {
            var exercise = formatQuestions(myPDFs[0][i][j]);
            pdf[i].push(exercise);
      }
  }
  //console.log("PDF: ");
  //console.log(pdf);
  return pdf;
}

function formatTextbook(pdf) {
      var newPDF = [];
      var exercises = [];
      var exerciseContent = [];
      var exception = { //only allows for one exception --- a better system would allow for multiple
          catchTarget : "Cambridge Senior Maths", //string exception not caught by other tests
          catchLength : 5 //length in lines
      }
      var first = true;
      var catchCount = 0;
      for (var line =  0; line < pdf.length; line++) {
            catchCount--;
            if (pdf[line].includes(exception.catchTarget)) {
                  catchCount = exception.catchLength;
            }
            if (catchCount > 0 || pdf[line].includes("Answers")) { //"Answers" refers to the side bar strip on each page ----- potentially creates problems with solutions with the word "Answers" in it
                  continue;
            }

            if (pdf[line].includes("Exercise")) {
                  //console.log(pdf[line]);
                  if (first) {
                      exerciseContent.push(pdf[line]);
                      first = false;
                  } else {
                      exercises.push(exerciseContent);
                      exerciseContent = [];
                      if (pdf[line-1].includes("Chapter")) {
                          newPDF.push(exercises);
                          exercises = [];
                      }
                      var spaces = 0;
                      var exerciseName;
                      var excess = "";
                      for (var char = 0; char < pdf[line].length; char++) {
                            if (pdf[line][char] == " ") {
                                spaces++;
                            }
                            if (spaces == 2) {
                                  exerciseName = pdf[line].substring(0, char);
                            }
                      }
                     // console.log(exerciseName);
                      if (spaces == 1) {
                          exerciseName = pdf[line];
                      } else {
                          excess = pdf[line].substring(exerciseName.length, pdf[line].length-1);
                          //console.log(excess);
                      }
                      exerciseContent.push(pdf[line]);
                  }
            } else {
                if (pdf[line].includes("Chapter")) {
                    //console.log("Chapter found!");
                } else {
                    if (!first) {
                        exerciseContent.push(pdf[line]);
                    }
                }
            }
      }
      newPDF.push(exercises);
      console.log("Finished formating.");
      console.log(newPDF);
      return newPDF;
}

function formatQuestions(pdf) {
    //console.log("Begin formatting questions from PDF...");
    console.log(pdf);
    //loop through lines ---- find all possible qns numbers
    var qnsData = getQnsNums(pdf);

    console.log(qnsData);
    qnsCount += qnsData.qnsSolutions.length;
    //loop through question numbers ---- eliminate impossible qns numbers
    qnsData.qnsSolutions = formatQnsNums(pdf, qnsData);

    qnsData.qnsSolutions = formatQnsLetters(pdf, qnsData);

    //edge cases: may be extra questions at the end of the pdf / doubled up questions edge cases though unlikely
    //lines can be incorrectly flagged as questions - see top for line eg.
    //multiple questions inline --- very unlikely - see top

    //validate last questions (good test if to see if it has multiple parts or not)

    //get raw answers (doesn't account for inline questions)
    qnsData.qnsSolutions = getRawTextAnswers(pdf, qnsData);

}

function getQnsNums(pdf) {
    var qnsData = {
        qnsSolutions : [],
        exercise : pdf[0].split('Exercise ')[1] //100% will break for certain exercises
    };
    for (var i=1; i < pdf.length; i++) {
          var line = pdf[i];
          if (!isNaN(line[0])) { //questions all begin with first char of number
                if (!isNaN(line[1]) && (line[2] == " " || line.length == 3)) { //double digit number
                      var qnsNum = new QnsSolution(line, i, parseInt(line[0] + line[1]));
                      qnsData.qnsSolutions.push(qnsNum);
                } else if (line[1] == " "  || line.length == 2) { //single digit
                      var qnsNum = new QnsSolution(line, i, parseInt(line[0]));
                      qnsData.qnsSolutions.push(qnsNum);
                }
          }
    }
    return qnsData;
}

function formatQnsNums(pdf, qnsData) {
      var returnData = [];
      var expected = 1;
      console.log(qnsData.qnsSolutions);
      for (var i=0; i < qnsData.qnsSolutions.length; i++) {
          if (i==0 && qnsData.qnsSolutions[0].questionNumber != 1) {
              //console.log("ERROR. First number should be question 1!");
              //totalErrors++;
              //return false;
              var newQns = new QnsSolution(pdf[0], 0, 1);
              returnData.push(newQns);
              expected++;
          } else {
              if (qnsData.qnsSolutions[i].questionNumber == expected) {
                  if (i+1 < qnsData.qnsSolutions.length && qnsData.qnsSolutions[i+1].questionNumber == expected) {
                      //console.log("REPEAT NUM: " + expected);
                      var newQns = new QnsSolution(undefined, undefined, expected);
                      returnData.push(newQns);
                      totalErrors++;
                  } else {
                      returnData.push(qnsData.qnsSolutions[i]);
                  }
                  expected++;
              }
          }
      }
      return returnData;
}

function formatQnsLetters(pdf, qnsData) {
      var returnData = [];
      for (var i=0; i < qnsData.qnsSolutions.length; i++) {
            var letter = "a";
            var qnsObj = qnsData.qnsSolutions[i];
            if (qnsData.qnsSolutions[i].line != undefined) { //if qns exists (not created for later search)
                  if (i == qnsData.qnsSolutions.length-1) { //on last question
                      var lineEnd = pdf.length-1;
                  } else {
                      var lineEnd = qnsData.qnsSolutions[i+1].lineNumber;
                  }
                  var lineStart = qnsData.qnsSolutions[i].lineNumber;
                  for (var j=lineStart; j < lineEnd; j++) {
                        while (containsPotentialQnsLetter(pdf, pdf[j], letter, j)) {
                            var newQnsPart =  new QnsPart(pdf[j], j, letter);
                            qnsObj.parts.push(newQnsPart);
                            letter = String.fromCharCode(letter.charCodeAt(0)+1); //increment letter by one
                        }
                        if (letter > "z") {
                            console.log("Error. Letter overflow. Something went wrong!!");
                        }
                  }
            }
            if (qnsObj.parts.length > 0) {
                  qnsObj.lineEnd = qnsObj.parts[qnsObj.parts.length-1].lineNumber;
            } else {
                  qnsObj.lineEnd = qnsObj.lineNumber;
            }
            returnData.push(qnsObj);
      }
      return returnData;
}

function containsPotentialQnsLetter(pdf, line, letter, lineNum) {
      if (line.includes(" "+letter+" ")) {
            return true;
      }
      if (line[0] == letter && line[1] == " " && line.length > 2 && line[2] != "=" && line[2] != "≈") { //could add other tests if needed
            return true;
      }
      if (line[line.length-2] == letter && (lineNum == pdf.length-1 || simpleEqCheck(pdf[lineNum+1]))) {
            return true;
      }
      return false;
}

function simpleEqCheck(nextLine) { //test if letter is part of equation
      var checkChars = "=≈";
      if (checkChars.includes(nextLine[0])) {
              return false; //test failed
      }
      return true; //test passed
}

function getRawTextAnswers(pdf, qnsData) {
      var returnData = [];
      for (var i=0; i < qnsData.qnsSolutions.length; i++) {
            var newData = "";
            var qns = qnsData.qnsSolutions[i];
            if (qns.lineEnd == qns.lineNumber) {
                  newData += qns.line;
            } else {
                for (var j=qns.lineNumber; j < qns.lineEnd; j++) {
                      newData += pdf[j];
                      if (newData[newData.length-1] != " " && j != qns.lineEnd-1) {
                            newData += " ";
                      }
                }
            }
            qns.rawTextAnswer = newData;
            returnData.push(qns);
      }
      return returnData;
}


function checkEdgeCases(pdf, qnsData) {
      if (qnsData.qnsSolutions === false) {
          return;
      }
      var lastQnsNum = qnsData.qnsSolutions[qnsData.qnsSolutions.length-1].questionNumber;
      var lineNum = qnsData.qnsSolutions[qnsData.qnsSolutions.length-1].lineNumber;
      console.log("Guess: " + lastQnsNum);
      console.log("Actual: " + pdf[lineNum]);
      console.log("From: " + pdf[0]);
}

class QnsSolution {
      constructor(line, lineNumber, questionNumber) {
            this.line = line,
            this.lineNumber = lineNumber,
            this.lineEnd = undefined,
            this.questionNumber = questionNumber,
            this.parts = [],
            this.rawTextAnswer = ""
      }
}

class QnsPart {
      constructor(line, lineNumber, questionLetter) {
        this.line = line,
        this.lineNumber = lineNumber,
        this.questionLetter = questionLetter,
        this.parts = []
      }
}
