var cambridge = { //in object so that other textbooks can eventually be added in furture versions
      rawPDFs : [],

      pdfs : [],

      exception : {
          catchTarget : "Cambridge Senior Maths", //exception to skip for each page - counts pages and skips useless data
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

              var textbookName = currentSubjectData.name;

              cambridge.rawPDFs.push(cambridge.formatTextbook(pdf, textbookName));
              localStorage.setItem("uploadedFile", currentSubjectData.name);
              updatePDFData(cambridge.pdfs);

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
                      if (cambridge.pdfs[textbookName][i].chapter == pdf[0].substring(0, pdf[0].length-1)) {
                          console.log(pdf[0] + " PDF already loaded for this subject.");
                          return;
                      }
                }
                formattedPDF = this.formatChapterPDF(pdf);
                cambridge.pdfs[textbookName].push(cambridge.getAllChapterQuestions(formattedPDF, pdf));

            }
            return formattedPDF;
      },

      formatAnswersPDF : function(pdf) {
          var newPDF = [];
          var exercises = [];
          var exerciseContent = [];
          var first = true;
          var catchCount = 0;
          var chapters = [];
          var chapterPageNumbers = [];
          var pageNumbers = [];
          var pageNumber = 1;
          for (var line =  0; line < pdf.length; line++) {
                // catchCount--;
                if (pdf[line].includes(this.exception.catchTarget)) {
                      pageNumber++;
                      catchCount = this.exception.catchLength;
                }
                // if (catchCount > 0) {
                //       continue;
                // }
                if (pdf[line].includes("Answers")) { //"Answers" refers to the side bar strip on each page ----- potentially creates problems with solutions with the word "Answers" in it
                      //console.log("SKIPPED LINE: " + pdf[line]);
                      continue;
                }

                if (pdf[line].includes("Exercise") || pdf[line].includes("Technology-free questions") || pdf[line].includes("Multiple-choice questions") || pdf[line].includes("Extended-response questions")) {
                      pageNumbers.push(pageNumber);
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
                                          chapterPageNumbers.push(pageNumbers);

                                    } else {
                                        //chapter review with previous exercises

                                        for (var i=0; i < exercises.length; i++) { //3 parts of chapter review
                                              newPDF[newPDF.length-1].push(exercises[i]);
                                              chapterPageNumbers[chapterPageNumbers.length-1].push(pageNumbers[i]);
                                        }

                                    }
                              } else {
                                    newPDF.push(exercises);
                                    chapterPageNumbers.push(pageNumbers);
                              }
                              pageNumbers = [];
                              exercises = [];

                          }

                          var spaces = 0; //some exercise names have a double space but most have single space
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
                    if (pdf[line].includes("Chapter")) { //don't add line twice
                        //console.log("Chapter found!");
                    } else {
                        if (!first) {
                            exerciseContent.push(pdf[line]);
                        }
                    }
                }
          }
          newPDF.push(exercises);
          chapterPageNumbers.push(pageNumbers);
          var returnData = {
                  pdfData : newPDF,
                  pageNumbers : chapterPageNumbers
          }

          return returnData;
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
        var pageNumber = 1;
        var pageNumbers = [];
        for (var line = 0; line < pdf.length; line++) {
              // catchCount--;
              if (pdf[line].includes(this.exception.catchTarget)) {
                    catchCount = this.exception.catchLength;
                    pageNumber++;
              }
              // if (catchCount > 0) {
              //       continue;
              // }
              if (pdf[line].substring(0, 2) == nextChapter) {
                    isQns = false;
                    currChapter = nextChapter;
                    var letter =  String.fromCharCode(currChapter.charCodeAt(currChapter.length-1)+1);
                    nextChapter = pdf[0].substring(8, pdf[0].length-1) + letter;
              }

              //test for tech-free multiple choice and extended response (first of these is always beginning of chapter)

              if (pdf[line].includes("Exercise") || pdf[line].includes("Multiple-choice") || pdf[line].includes("Technology-free") || pdf[line].includes("Extended-response")) {
                    isQns = true;
                    pageNumbers.push(pageNumber);
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
        exercises.push(exerciseContent);
        newPDF.push(exercises);
        var returnData = {
              exercises : newPDF,
              pageNumbers : pageNumbers
        }
        return returnData;
      },

      formatSolutions : function(pdf, pageNumberDefault) {
            var qnsData = this.getQnsNums(pdf);

            qnsData = this.filterUnreasonableNums(pdf, qnsData);

            if (!pdf[0].includes("Multiple-choice")) { //multiple choice renders differently than all other solutions
                  qnsData = this.outliersQnsNums(pdf, qnsData);
            }

            //loop through question numbers ---- eliminate impossible qns numbers
            qnsData = this.formatQnsNums(pdf, qnsData);

            qnsData = this.formatQnsLetters(pdf, qnsData); //1 a,b,c

            //get raw answers (doesn't account for inline questions)
            qnsData = this.getRawTextAnswers(pdf, qnsData);

            //estimates line heights to display from pdf
            qnsData = this.getLineHeights(pdf, qnsData);

            qnsData = this.getPageNumbers(pdf, qnsData, pageNumberDefault);

            return qnsData;
      },

      formatQuestions : function(pdf, pageNumberDefault) {
            //filtering question numbers
            var qnsData = this.getQnsNums(pdf);
            qnsData = this.outliersQnsNums(pdf, qnsData);
            qnsData = this.formatQnsNums(pdf, qnsData);

            //getting parts of a question ie. 1 a, b, c
            qnsData = this.formatQnsLetters(pdf, qnsData);

            //grabs the raw text as well - not necessary as changed to display straight from PDF
            qnsData = this.getRawTextMultiQns(pdf, qnsData);

            //estimates line heights to display from PDF
            qnsData = this.getLineHeights(pdf, qnsData);

            qnsData = this.getPageNumbers(pdf, qnsData, pageNumberDefault);

            return qnsData;
      },

      getPageNumbers : function(pdf, qnsData, pageNumberDefault) {
              var pageNums = [];
              var qnsCounter = 0;
              var pageNumber = pageNumberDefault;

              for (var i=0; i < pdf.length; i++) {
                    if (pdf[i].includes(this.exception.catchTarget)) {
                            pageNumber++;
                    }
                    if (qnsCounter >= qnsData.length) {
                          return qnsData;
                    }
                    if (i == qnsData[qnsCounter].lineNumber) {
                            i--; //ensures that inline questions are found
                            qnsData[qnsCounter].pageNumber = pageNumber;
                            qnsCounter++;
                    }
              }
              return qnsData;
      },

      getLineHeights : function(pdf, qnsData) {
              for (var i=0; i < qnsData.length; i++) {
                      if (i+1 != qnsData.length && Math.abs(qnsData[i+1].lineNumber - qnsData[i].lineEnd) <= 2) { //height is likely accurate
                            qnsData[i].height = qnsData[i].lineEnd - qnsData[i].lineNumber + 1;
                            if (qnsData[i].lineNumber == 0) {
                                  qnsData[i].height--; //lineNumber is set to 0 for first question instead of 1
                            }
                            if (qnsData[i].parts.length == 1) {
                                  qnsData[i].height++; //fixes error trimming line / single part question requires an extra line than expected
                            }
                      } else if (i+1 != qnsData.length) {
                              qnsData[i].height = qnsData[i+1].lineEnd - qnsData[i].lineEnd;
                      } else { //last data
                            qnsData[i].height = 0;
                      }
              }
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

                  if (!isNaN(line[0]) || (line[0] == " " && !isNan(line[1]) )) { //questions all begin with first char of number

                        var standardNum = 0;
                        if (line[0] == " ") {
                              standardNum = 1; //sometimes question number has space before so shift everything one character
                        }

                        if (!isNaN(line[standardNum + 1]) && (line[standardNum + 2] == " " || line.length == (standardNum + 3))) { //double digit number
                              var qnsNum = new Qns(line, i, parseInt(line[standardNum + 0] + line[standardNum + 1]));
                              qnsData.push(qnsNum);
                        } else if (line[standardNum + 1] == " "  || line.length == (standardNum + 2)) { //single digit
                              var qnsNum = new Qns(line, i, parseInt(line[standardNum + 0]));
                              qnsData.push(qnsNum);
                        }
                  }
            }


            return qnsData;
      },

      filterUnreasonableNums : function(pdf, qnsData) { //filters question numbers way beyond reason to decrease length to search for outliers
              var breakpoint = 30; //30 lines per question seems reasonable
              var returnData = [];
              if (qnsData < 20) { //data is of reasonable length alread
                    return qnsData;
              }
              for (var i=0; i < qnsData.length; i++) {
                      if (qnsData[i].lineNumber < qnsData[i].questionNumber * breakpoint) {
                              returnData.push(qnsData[i])
                      }
              }
              return returnData;
      },

      formatQnsNums : function(pdf, qnsData) {
          var returnData = [];

          var expected = 1;
          for (var i=0; i < qnsData.length; i++) {
              if (i==0 && qnsData[0].questionNumber == 1) { //first question
                  var whileBreak = false;
                  var lineNum = 1;
                  if (!pdf[1].includes("1")) {
                        lineNum = 2;
                  }
                  var newQns = new Qns(pdf[lineNum], 0, 1);
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

      addMissingQuestionToData : function(prevQns, qnsData, newQuestion) {
                var returnData = [];
                for (var i=0; i < qnsData.length; i++) {
                        if (qnsData[i].questionNumber > newQuestion.questionNumber) {
                                returnData.push(newQuestion);
                        }
                        returnData.push(qnsData[i]);
                }
                return returnData;
      },

      findMissingQuestions : function(pdf, qnsData, questionsToFind) {

              for (var i=0; i < questionsToFind.length; i++) {
                      var found = false;
                      var newQuestion;
                      if (questionsToFind[0].prevQns == undefined || questionsToFind[0].nextQns == undefined) {
                            return false; //failed
                      }
                      for (var j=questionsToFind[i].prevQns.lineNumber; j < questionsToFind[i].nextQns.lineNumber; j++) {
                              if (questionsToFind[i].prevQns == undefined || questionsToFind[i].nextQns == undefined) {
                                    return false; //failed
                              }

                              if (pdf[j].includes(questionsToFind[i].qnsNumber)) {
                                    newQuestion = new Qns(pdf[j], j, questionsToFind[i].qnsNumber);
                                    found = true;
                                    break;
                              }
                      }
                      if (found) {
                            qnsData = this.addMissingQuestionToData(questionsToFind[i].prevQns, qnsData, newQuestion);
                            continue;
                      }
                      for (var j=questionsToFind[i].prevQns.lineNumber; j < questionsToFind[i].prevQns.lineNumber+50; j++) {
                              if (pdf[j] == undefined) {
                                    break;
                              }
                              if (pdf[j].includes(questionsToFind[i].qnsNumber)) {
                                    newQuestion = new Qns(pdf[j], j, questionsToFind[i].qnsNumber);
                                    found = true;
                                    break;
                              }
                      }
                      if (found) {
                            qnsData = this.addMissingQuestionToData(questionsToFind[i].prevQns, qnsData, newQuestion);
                      } else {
                            newQuestion = new Qns("No solution.", j, questionsToFind[i].qnsNumber)
                            qnsData = this.addMissingQuestionToData(questionsToFind[i].prevQns, qnsData, newQuestion);
                      }
              }
              return qnsData;
      },

      outliersQnsNums : function(pdf, qnsData) { //test to see if a question was incorrectly skipped
              if (qnsData.length > 20) { //too inaccuate with large amount of questions
                      return qnsData;
              }
              var returnData = [];
              var expected = 1;
              var correct = 0;
              var allQnsNumbers = [];

              for (var i=0; i < qnsData.length; i++) {
                        if (!isNaN(qnsData[i].questionNumber)) {
                                allQnsNumbers[qnsData[i].questionNumber] = qnsData[i];
                        }
              }

              var empties = -1; //FIRST INDEX IS ALWAYS EMPTY
              var lastQuestion = 0;
              for (var i=0; i < Math.min(allQnsNumbers.length, 20); i++) {
                      if (allQnsNumbers[i] == undefined) {
                            empties++;
                      } else {
                            lastQuestion = i;
                      }
              }


              if (empties < 5 && empties > 0) { //if there are few empty cells then its likely it simply missed a few questions

                    var questionsToFind = []; //stores questions to find with its previous and next question as guidance for where to look
                    var prevQns = 0; //question before missing question
                    var nextQns; //question after missing question
                    for (var i=1; i < lastQuestion; i++) {
                            if (allQnsNumbers[i] == undefined) {
                                  var question = {
                                        qnsNumber : i,
                                        prevQns : prevQns,
                                        nextQns : undefined
                                  }
                                  questionsToFind.push(question);
                            } else {
                                  prevQns = allQnsNumbers[i];
                            }
                            for (var j=0; j < questionsToFind.length; j++) {
                                    if (questionsToFind[j].nextQns == undefined) {
                                            if (prevQns.questionNumber > questionsToFind[j].prevQns.questionNumber) {
                                                    questionsToFind[j].nextQns = prevQns; //once question changes then that must be the next question
                                            }
                                    }
                            }
                    }

                    if (questionsToFind.length > 0 && questionsToFind[questionsToFind.length-1].nextQns == undefined) { //if still undefined then must be the last question
                            questionsToFind[questionsToFind.length-1].nextQns = allQnsNumbers[lastQuestion];
                    }

                    returnData = this.findMissingQuestions(pdf, qnsData, questionsToFind) || qnsData;

              } else {  //no outliers
                    return qnsData;
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

      getRawTextMultiQns : function(pdf, qnsData) { //function isn't neccessary as grabbing heights from individual question works well instead
          //keeping it for concept for later though - ideas applicable elsewhere
          var returnData = [];
          for (var i=0; i < qnsData.length; i++) {
                var newData = "";
                var qns = qnsData[i];
                for (var j=0; j < qns.parts.length; j++) { //misses the last range purposefully
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

                                            //this function turned out to be unnecessary but concept is useful to keep

                                    }
                              }
                        }
                }

                qns.rawText = newData;
                returnData.push(qns);
          }
          return returnData;
      },

      getAllTextbookSolutions : function(formattedPDF) {
            var pdf = formattedPDF.pdfData;
            var pageNumbers = formattedPDF.pageNumbers;

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
                      exerciseObj.questions = this.formatSolutions(pdf[i][j], pageNumbers[i][j]);
                      chapterObj.exercises.push(exerciseObj);
                }
                answerObj.chapters.push(chapterObj);
            }
            return answerObj;

      },

      getAllChapterQuestions : function(formattedPDF, rawPDF) {
            var pdf = formattedPDF.exercises;
            var pageNumbers = formattedPDF.pageNumbers;

            var chapterObj = {
                  chapter : rawPDF[0].substring(0, rawPDF[0].length-1),
                  select : rawPDF[0].substring(8, rawPDF[0].length),
                  exercises: []
            }

            for (var i=0; i < pdf.length; i++) {
                for (var j=0; j < pdf[i].length; j++) {
                      var exerciseObj = {
                            name : pdf[i][j][0].substring(0, pdf[i][j][0].length -1),
                            select : pdf[i][j][0].substring(9, pdf[i][j][0].length -1), //value to show on custom select
                            questions : []
                      }
                      if (exerciseObj.name.includes("Multiple")) { //multiple choice
                            exerciseObj.select = "MC";
                      }
                      if (exerciseObj.name.includes("Tech")) { //tech free
                            exerciseObj.select = "TF";
                      }
                      if (exerciseObj.name.includes("Extend")) { //extended response
                            exerciseObj.select = "ER";
                      }
                      exerciseObj.questions = this.formatQuestions(pdf[i][j], pageNumbers[j]);
                      chapterObj.exercises.push(exerciseObj);
                }
            }
            return chapterObj;
      },

      fetchData : function(textbookName, exercise, chapter) {
            var myExercise = undefined;
            var myChapter = undefined;
            var solutions = undefined;


            if (this.pdfs[textbookName] == undefined) {
                  return;
            }

            for (var i=0; i < this.pdfs[textbookName].length; i++) {
                  if (this.pdfs[textbookName][i].chapter.includes(chapter)) {
                        myChapter = this.pdfs[textbookName][i].chapter;
                        break;
                  }
            }

            if (myChapter === undefined) {
                  console.log("Error could not located chapter.");
                  return;
            }

            for (var j=0; j < this.pdfs[textbookName].length; j++) {
                    if (this.pdfs[textbookName][j].chapter == chapter) {
                          var chIndex = parseInt(chapter.substring(8, chapter.length))-1;
                          for (var i=0; i < this.pdfs[textbookName][j].exercises.length; i++) {
                                if (this.pdfs[textbookName][j].exercises[i].name == exercise) {
                                      var exIndex = i;
                                      myExercise = this.pdfs[textbookName][j].exercises[i].name;

                                      var questions = this.pdfs[textbookName][j].exercises[i].questions;
                                      break;
                                }
                          }
                          break;
                    }
            }

            if (myExercise === undefined) {
                  console.log("Error could not located exercise.");
                  return;
            }
            for (var i=0; i < this.pdfs[textbookName].length; i++) {
                  if (this.pdfs[textbookName][i].chapter == "Answers") {
                        console.log(chIndex);
                        solutions = this.pdfs[textbookName][i].chapters[chIndex].exercises[exIndex].questions;
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
