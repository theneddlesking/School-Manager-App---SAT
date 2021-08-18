var myPDFs = [];
var qnsCount = 0;
var totalErrors = 0;

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
        console.log(pdf);
        //console.log("Succesfully read PDF.");
        myPDFs.push(formatTextbook(pdf));
        //first pdf, chapter 1, exercise A

        formatQuestions(myPDFs[0][0][0]);

    };
    reader.readAsText(file);
};


function formatTextbook(pdf) {
      var newPDF = [];
      var exercises = [];
      var exerciseContent = [];
      var isQns = true;

      var currChapter = pdf[0].substring(8, pdf[0].length-1) + "A";
      var nextChapter = pdf[0].substring(8, pdf[0].length-1) + "B";

      var exception = { //only allows for one exception --- a better system would allow for multiple
          catchTarget : "Cambridge Senior Maths", //string exception not caught by other tests
          catchLength : 5 //length in lines
      }
      var catchCount = 0;
      var first = true;

      //break when hit next chapter (ie. 1A breaks when 1B is reached)

      for (var line = 0; line < pdf.length; line++) {
            catchCount--;
            if (pdf[line].includes(exception.catchTarget)) {
                  catchCount = exception.catchLength;
            }
            if (catchCount > 0) {
                  continue;
            }

            if (pdf[line].substring(0, 2) == nextChapter) {
                  isQns = false;
                  currChapter = nextChapter;
                  var letter =  String.fromCharCode(currChapter.charCodeAt(currChapter.length-1)+1);
                  nextChapter = pdf[0].substring(8, pdf[0].length-1) + letter;
            }

            //test for tech-free multiple choice and extended response (first of these is always beginning of chapter)

            if (pdf[line].includes("Exercise")) {
                  isQns = true;
                  if (first) {
                        first = false;
                  } else {
                        exercises.push(exerciseContent);
                  }

                  exerciseContent = [];
            }

            var linePush = pdf[line];

            var whileBreak = true;
            if (pdf[line].substring(0, 7) == "Example") {
                var index = 8;
                //console.log(pdf[line][index]);

                while (pdf[line][index] != " " && whileBreak) {
                      index++;
                      if (index > pdf[line].length) {
                          //console.log("Error. Index overflow!");
                          whileBreak = false;
                      }
                }
                linePush = pdf[line].substring(index, pdf[line].length);

            }

            linePush = linePush.replace("Skillsheet", "");

            if (!pdf[line].includes("Chapter") && isQns && (!pdf[line].includes(currChapter) || pdf[line].includes("Exercise"))) {
                if (whileBreak) {
                    exerciseContent.push(linePush);
                }
            }
      }
      newPDF.push(exercises)
      console.log(newPDF);
      console.log("Finished formating.");
      return newPDF;
}

function formatQuestions(pdf) {
      console.log(pdf);

      var qnsData = getQnsNums(pdf);


      qnsData.qns = formatQnsNums(pdf, qnsData);


      qnsData.qns = formatQnsLetters(pdf, qnsData);

      console.log(qnsData);
}

function getQnsNums(pdf) {
    var qnsData = {
        qns : [],
        exercise : pdf[0].split('Exercise ')[1] //100% will break for certain exercises
    };
    for (var i=1; i < pdf.length; i++) {
          var line = pdf[i];
          if (!isNaN(line[0])) { //questions all begin with first char of number
                if (!isNaN(line[1]) && (line[2] == " " || line.length == 3)) { //double digit number
                      var qnsNum = new Qns(line, i, parseInt(line[0] + line[1]));
                      qnsData.qns.push(qnsNum);
                } else if (line[1] == " "  || line.length == 2) { //single digit
                      var qnsNum = new Qns(line, i, parseInt(line[0]));
                      qnsData.qns.push(qnsNum);
                }
          }
    }
    return qnsData;
}

function formatQnsNums(pdf, qnsData) {
      var returnData = [];
      var expected = 1;
      console.log(qnsData.qns);
      for (var i=0; i < qnsData.qns.length; i++) {
          if (i==0 && qnsData.qns[0].questionNumber != 1) {
              //console.log("ERROR. First number should be question 1!");
              //totalErrors++;
              //return false;
              var newQns = new Qns(pdf[0], 0, 1);
              returnData.push(newQns);
              expected++;
          } else {
              if (qnsData.qns[i].questionNumber == expected) {
                  if (i+1 < qnsData.qns.length && qnsData.qns[i+1].questionNumber == expected) {
                      //console.log("REPEAT NUM: " + expected);
                      var newQns = new Qns(undefined, undefined, expected);
                      returnData.push(newQns);
                      totalErrors++;
                  } else {
                      returnData.push(qnsData.qns[i]);
                  }
                  expected++;
              }
          }
      }
      return returnData;
}

function formatQnsLetters(pdf, qnsData) {
      var returnData = [];
      for (var i=0; i < qnsData.qns.length; i++) {
            var letter = "a";
            var qnsObj = qnsData.qns[i];
            if (qnsData.qns[i].line != undefined) { //if qns exists (not created for later search)
                  if (i == qnsData.qns.length-1) { //on last question
                      var lineEnd = pdf.length-1;
                  } else {
                      var lineEnd = qnsData.qns[i+1].lineNumber;
                  }
                  var lineStart = qnsData.qns[i].lineNumber;
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

class Qns {
      constructor(line, lineNumber, questionNumber) {
            this.line = line,
            this.lineNumber = lineNumber,
            this.lineEnd = undefined,
            this.questionNumber = questionNumber,
            this.parts = [],
            this.rawTextQuestion = ""
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
