//BUG: chapter review multiple choice broken ----- simply create new func

//BUG: reviews appear in chapter answers but not chapter questions

//BUG: some chapters missing in question chapters (ie. exercise 1H!!)

//TODO: add code to test for missing elements

//EXCEPTION: confirmed! question numbers can be inline --- see Exercise 16C!

//TODO: add graph, diagrams

//TODO: add multi part multi part question support (ie. i, ii, iii) --- relatively fringe for the most part

//TODO: question and question parts don't hold an answer!! only the line they begin on

//BUG / EXCEPTION: code assumes that a question is guaranteed to be a question if not immediately followed by the same question
//eg. 1 a = 3 +
//l2    2 - x +
//l3    3
//l4    2 a x = 5 b x = 3
//Current code returns l2 as qns 2 when l4 is qns 2
//instead you can loop through until you hit the next number (loop until you hit 3, doesn't account for all cases but much more accurate)
//will sadly override many true false positives (qns judged as qns accurately but on unjust grounds)
//potentially could have stages to fall back on true false positives?
//last stage could be guess?

var cambridge = {
      rawPDFs : [],

      pdfs : [],

      exception : {
          catchTarget : "Cambridge Senior Maths", //exception to skip for each page
          catchLength : 5 //length in lines
      },

      pdfFromFile : function (fileInput) {
          var file = fileInput.files[0];
          var pdf = [];
          var reader = new FileReader();
          reader.onload = function(progressEvent){
              var lines = this.result.split('\n');
              for (var line = 0; line < lines.length; line++){
                  pdf.push(lines[line]);
              }

              var textbookName = document.getElementById("textbook").value;

              cambridge.rawPDFs.push(cambridge.formatTextbook(pdf, textbookName));

          };
          reader.readAsText(file);
      },

      formatTextbook : function(pdf, textbookName) {
            var formattedPDF = [];
            if (cambridge.pdfs[textbookName] === undefined) {
                 cambridge.pdfs[textbookName] = [];
            }

            if (pdf[0].includes("Answers")) {
                for (var i=0; i < cambridge.pdfs[textbookName].length; i++) {
                      if (cambridge.pdfs[textbookName][i].chapter == "Answers") {
                          console.log("Answers PDF already loaded for this subject.");
                          return;
                      }
                }
                formattedPDF = this.formatAnswersPDF(pdf);
                cambridge.pdfs[textbookName].push(cambridge.getAllTextbookSolutions(formattedPDF));
            } else {
                for (var i=0; i < cambridge.pdfs[textbookName].length; i++) {
                      if (cambridge.pdfs[textbookName][i].chapter == pdf[0]) {
                          console.log(pdf[0] + " PDF already loaded for this subject.");
                          return;
                      }
                }
                formattedPDF = this.formatChapterPDF(pdf);
                cambridge.pdfs[textbookName].push(cambridge.getAllChapterQuestions(formattedPDF, pdf));

                console.log(this.fetchData("Math Methods 3&4", "Exercise 1A", "Chapter 1"));

            }
            return formattedPDF;
      },

      formatAnswersPDF : function(pdf) {
          var newPDF = [];
          var exercises = [];
          var exerciseContent = [];
          var first = true;
          var catchCount = 0;
          for (var line =  0; line < pdf.length; line++) {
                catchCount--;
                if (pdf[line].includes(this.exception.catchTarget)) {
                      catchCount = this.exception.catchLength;
                }
                if (catchCount > 0 || pdf[line].includes("Answers")) { //"Answers" refers to the side bar strip on each page ----- potentially creates problems with solutions with the word "Answers" in it
                      //console.log("SKIPPED LINE: " + pdf[line]);
                      continue;
                }

                if (pdf[line].includes("Exercise") || pdf[line].includes("Technology-free questions") || pdf[line].includes("Multiple-choice questions") || pdf[line].includes("Extended-response questions")) {
                      if (first) {
                          exerciseContent.push(pdf[line]);
                          first = false;
                      } else {
                          exercises.push(exerciseContent);
                          exerciseContent = [];
                          if (pdf[line-1].includes("Chapter")) {
                              if (exercises[0][0].substring(0, 15) == "Technology-free") { //add chapter reviews inside previous exercise
                                    if (newPDF[newPDF.length-1][newPDF[newPDF.length-1].length-1][0].substring(0, 17) == "Extended-response") {
                                          //stand alone chapter review

                                          var chapter = newPDF.length +1;
                                          var reviewChapter = [];
                                          for (var i=0; i < exercises.length; i++) { //3 parts of chapter review
                                                reviewChapter.push(exercises[i]);
                                          }
                                          newPDF.push(reviewChapter);
                                    } else {
                                        //chapter review with previous exercises

                                        for (var i=0; i < exercises.length; i++) { //3 parts of chapter review
                                              newPDF[newPDF.length-1].push(exercises[i]);
                                        }
                                    }
                              } else {
                                    newPDF.push(exercises);
                              }
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
                          if (spaces == 1) {
                              exerciseName = pdf[line];
                          } else {
                              excess = pdf[line].substring(exerciseName.length, pdf[line].length-1);
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
          return newPDF;
      },

      formatChapterPDF : function(pdf) {
        var newPDF = [];
        var exercises = [];
        var exerciseContent = [];
        var isQns = true;
        var currChapter = pdf[0].substring(8, pdf[0].length-1) + "A";
        var nextChapter = pdf[0].substring(8, pdf[0].length-1) + "B";
        var catchCount = 0;
        var first = true;
        for (var line = 0; line < pdf.length; line++) {
              catchCount--;
              if (pdf[line].includes(this.exception.catchTarget)) {
                    catchCount = this.exception.catchLength;
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
                  while (pdf[line][index] != " " && whileBreak) {
                        index++;
                        if (index > pdf[line].length) {
                            whileBreak = false; //index overflow
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
        return newPDF;
      },

      formatSolutions : function(pdf) {
            var qnsData = this.getQnsNums(pdf);

            //loop through question numbers ---- eliminate impossible qns numbers
            qnsData = this.formatQnsNums(pdf, qnsData);

            qnsData = this.formatQnsLetters(pdf, qnsData); //1 a,b,c

            //edge cases: may be extra questions at the end of the pdf / doubled up questions edge cases though unlikely
            //if this happens something else most likely already went wrong anyways

            //lines can be incorrectly flagged as questions - see top for line eg.
            //multiple questions inline --- very unlikely - see top

            //validate last questions (good test if to see if it has multiple parts or not)

            //get raw answers (doesn't account for inline questions)
            qnsData = this.getRawTextAnswers(pdf, qnsData);

            return qnsData;
      },

      formatQuestions : function(pdf) {
            var qnsData = this.getQnsNums(pdf);

            qnsData = this.formatQnsNums(pdf, qnsData);

            qnsData = this.formatQnsLetters(pdf, qnsData);

            //get raw text for inline multipart formatQuestions

            qnsData = this.getRawTextMultiQns(pdf, qnsData);

            return qnsData;

      },

      simpleEqCheck : function(nextLine) { //test if letter is part of equation
            var checkChars = "=≈";
            if (checkChars.includes(nextLine[0])) {
                    return false; //test failed
            }
            return true; //test passed
      },

      containsPotentialQnsLetter : function(pdf, line, letter, lineNum) {
            if (line.includes(" "+letter+" ")) {
                  return true;
            }
            if (line[0] == letter && line[1] == " " && line.length > 2 && line[2] != "=" && line[2] != "≈") { //could add other tests if needed
                  return true;
            }
            if (line[line.length-2] == letter && (lineNum == pdf.length-1 || this.simpleEqCheck(pdf[lineNum+1]))) {
                  return true;
            }
            return false;
      },

      getQnsNums : function(pdf) {
            var qnsData = [];
            for (var i=1; i < pdf.length; i++) {
                  var line = pdf[i];
                  if (!isNaN(line[0])) { //questions all begin with first char of number
                        if (!isNaN(line[1]) && (line[2] == " " || line.length == 3)) { //double digit number
                              var qnsNum = new Qns(line, i, parseInt(line[0] + line[1]));
                              qnsData.push(qnsNum);
                        } else if (line[1] == " "  || line.length == 2) { //single digit
                              var qnsNum = new Qns(line, i, parseInt(line[0]));
                              qnsData.push(qnsNum);
                        }
                  }
            }
            return qnsData;
      },

      formatQnsNums : function(pdf, qnsData) {
          var returnData = [];
          var expected = 1;
          for (var i=0; i < qnsData.length; i++) {
              if (i==0 && qnsData[0].questionNumber != 1) { //first question
                  var newQns = new Qns(pdf[0], 0, 1);
                  returnData.push(newQns);
                  expected++;
              } else { //every other question (don't know where it is)
                  if (qnsData[i].questionNumber == expected) {
                      if (i+1 < qnsData.length && qnsData[i+1].questionNumber == expected) {
                          var newQns = new Qns(undefined, undefined, expected);
                          returnData.push(newQns);
                      } else {
                          returnData.push(qnsData[i]);
                      }
                      expected++;
                  }
              }
          }
          return returnData;
      },

      formatQnsLetters : function(pdf, qnsData) {
          var returnData = [];
          for (var i=0; i < qnsData.length; i++) {
                var letter = "a";
                var qnsObj = qnsData[i];
                if (qnsData[i].line != undefined) { //if qns exists (not created for later search)
                      if (i == qnsData.length-1) { //on last question
                          var lineEnd = pdf.length-1;
                      } else {
                          var lineEnd = qnsData[i+1].lineNumber;
                      }
                      var lineStart = qnsData[i].lineNumber;
                      for (var j=lineStart; j < lineEnd; j++) {
                            while (this.containsPotentialQnsLetter(pdf, pdf[j], letter, j)) {
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
      },

      getRawTextAnswers : function(pdf, qnsData) {
          var returnData = [];
          for (var i=0; i < qnsData.length; i++) {
                var newData = "";
                var qns = qnsData[i];
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
                qns.rawText = newData;
                returnData.push(qns);
          }
          return returnData;
      },

      getRawTextMultiQns : function(pdf, qnsData) {
          console.log(qnsData);
          var returnData = [];
          for (var i=0; i < qnsData.length; i++) {
                var newData = "";
                var qns = qnsData[i];
                for (var j=0; j < qns.parts.length; j++) { //misses the last range but that one is funky anyways
                        var part = qns.parts[j];
                        var lineStart = part.lineNumber;

                        if (j == qns.parts.length - 1) {
                              var lineEnd = qnsData.lineEnd;

                        } else {
                              var lineEnd = qns.parts[j+1].lineNumber;
                        }

                        for (var k=lineStart; k <= lineEnd; k++) {

                              var nextLetter = String.fromCharCode(part.questionLetter.charCodeAt(0)+1);

                              var line = pdf[k];
                              if (line.includes(nextLetter)) { //part b reached
                                    if (k == lineStart) { //if part b reached on inital line
                                            var splitIt = line.split(nextLetter);


                                            //console.log(splitIt);
                                            //console.log(part.questionLetter);

                                            //didn't I figure out a better way to do this without split?

                                    }
                              }
                        }
                }

                qns.rawText = newData;
                returnData.push(qns);
          }
          return returnData;
      },

      getAllTextbookSolutions : function(pdf) {
            var answerObj = {
                  chapter : "Answers",
                  chapters : []
            }
            for (var i=0; i < pdf.length; i++) {
                var chapterObj = {
                      chapter : "Chapter " + (i+1),
                      exercises : []
                }
                for (var j=0; j < pdf[i].length; j++) {
                      var exerciseObj = {
                            name : pdf[i][j][0],
                            questions : []
                      }
                      exerciseObj.questions = this.formatSolutions(pdf[i][j]);
                      chapterObj.exercises.push(exerciseObj);
                }
                answerObj.chapters.push(chapterObj);
            }
            return answerObj;

      },

      getAllChapterQuestions : function(pdf, rawPDF) {
            var chapterObj = {
                  chapter : rawPDF[0],
                  exercises: []
            }
            for (var i=0; i < pdf.length; i++) {
                for (var j=0; j < pdf[i].length; j++) {
                      var exerciseObj = {
                            name : pdf[i][j][0],
                            questions : []
                      }
                      exerciseObj.questions = this.formatQuestions(pdf[i][j])
                      chapterObj.exercises.push(exerciseObj);
                }
            }
            return chapterObj;
      },

      fetchData : function(textbookName, exercise, chapter) {
            var myExercise = undefined;
            var myChapter = undefined;
            var solutions = undefined;

            for (var i=0; i < this.pdfs[textbookName].length; i++) {
                  if (this.pdfs[textbookName][i].chapter.substring(0, chapter.length) == chapter) {
                        myChapter = this.pdfs[textbookName][i].chapter;
                        var chIndex = i;
                        console.log(chIndex);
                        break;
                  }
            }
            if (myChapter === undefined) {
                  console.log("Error could not located chapter.");
                  return;
            }
            for (var i=0; i < this.pdfs[textbookName][chIndex].exercises.length; i++) {
                  if (this.pdfs[textbookName][chIndex].exercises[i].name.substring(0, exercise.length) == exercise) {
                        var exIndex = i;
                        myExercise = this.pdfs[textbookName][chIndex].exercises[i].name;
                        var questions = this.pdfs[textbookName][chIndex].exercises[i].questions;
                        break;
                  }
            }
            if (myExercise === undefined) {
                  console.log("Error could not located exercise.");
                  return;
            }
            for (var i=0; i < this.pdfs[textbookName].length; i++) {
                  if (this.pdfs[textbookName][i].chapter.substring(0, 7) == "Answers") {
                        solutions = this.pdfs[textbookName][i].chapters[chIndex-1].exercises[exIndex].questions;
                        break;
                  }
            }
            if (solutions === undefined) {
                  console.log("Error could not located solutions.");
                  return;
            }
            var pdfData = {
                  textbook : textbookName,
                  exercise : exercise,
                  questions : questions,
                  solutions : solutions,
                  chapter : chapter
            };
            return pdfData;
      },

      viewPDFs : function() {
            console.log(this.pdfs);
      },
}

class Qns {
      constructor(line, lineNumber, questionNumber) {
            this.line = line,
            this.lineNumber = lineNumber,
            this.lineEnd = undefined,
            this.questionNumber = questionNumber,
            this.parts = [],
            this.rawText = ""
      }
}

class QnsPart {
      constructor(line, lineNumber, questionLetter) {
        this.line = line,
        this.lineNumber = lineNumber,
        this.questionLetter = questionLetter,
        this.rawText = ""
        this.parts = []
      }
}
