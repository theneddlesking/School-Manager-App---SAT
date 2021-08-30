var recognisedColumnModules = [];

class ColumnModule { //template elements that appear in the columns
      constructor(name, onload, template, bottom) {
            this.name = name;
            this.onload = onload;

            if (template === undefined) {
                  template = document.getElementById("basic-column-module");
            }

            if (bottom === undefined) {
                  this.bottom = false;
            } else {
                  this.bottom = bottom;
            }
            this.template = template;
            recognisedColumnModules.push(name);
      }

      displayModule(topIsEmpty, subject) {
              if (this.bottom && !topIsEmpty) {
                    var column = document.getElementById("column-bottom");
              } else {
                    var column = document.getElementById("column-top");
              }

              column.appendChild( this.template.content.cloneNode(true) );
      }
}

var ColumnModules = {
          loadModule : function(module, topIsEmpty, subject) {
                  if (recognisedColumnModules.includes(module.name)) {
                        module.displayModule(topIsEmpty, subject);
                        module.onload();
                  } else {
                        Debugger.log("Column module not recognised: " + module.name, "column-module");
                  }
          }
}


function getAvailableExercises() {
        for (var i=0; i < cambridge.pdfs[currentSubjectData.name].length; i++) {
                if (cambridge.pdfs[currentSubjectData.name][i].chapter == "Chapter " + currentSubjectData.chapter) {
                        return cambridge.pdfs[currentSubjectData.name][i].exercises;
                }
        }
}

function getAvailableChapters() {
      return cambridge.pdfs[currentSubjectData.name];
}

//selecting stops multipress
var selecting = false;

function chapterSelect() {
      selecting = true;
      var selectOptions = getAvailableChapters(); //replace with actual later
      console.log(selectOptions);

      var container = document.getElementById("exercise-container");
      container.innerHTML = "";
      document.getElementById("input-questions").style.display = "none";
      container.style.display = "grid";
      for (var i=0; i < selectOptions.length; i++) {
              if (selectOptions[i].chapter != "Answers") {
                    var exerciseBox = document.getElementById("temp-chapter-box").content.cloneNode(true);
                    exerciseBox.getElementById("chapter-box-name").textContent = selectOptions[i].select;
                    container.appendChild(exerciseBox);
              }
      }
}

function exerciseSelect(chapterElem) {

        currentSubjectData.chapter = parseInt(chapterElem.textContent);
        Debugger.log("Select exercise");

        var selectOptions = getAvailableExercises(); //fetches data
        console.log(selectOptions);

        var container = document.getElementById("exercise-container");
        container.innerHTML = "";
        document.getElementById("input-questions").style.display = "none";
        container.style.display = "grid";
        for (var i=0; i < selectOptions.length; i++) {
                var exerciseBox = document.getElementById("temp-exercise-box").content.cloneNode(true);
                exerciseBox.getElementById("exercise-box-name").textContent = selectOptions[i].select;
                container.appendChild(exerciseBox);
        }

}


function selectExercise(element) {
        currentSubjectData.exerciseName = element.childNodes[1].textContent;
        currentSubjectData.updateExerciseData();
        updateSubjectColumn(currentSubjectData.name, true);
}

function uploadPDF() {
      Debugger.log("Upload PDF?");
}

var onloadExample = function() {
        Debugger.log("Loaded module.", "columnModule");
}

var baseColumnModules = [
      new ColumnModule("Begin Exercise", onloadExample, document.getElementById("begin-exercise-module")),
      new ColumnModule("Input Questions", onloadExample, document.getElementById("input-questions-module")),
      new ColumnModule("Upload PDF", onloadExample, document.getElementById("upload-pdf-module"), true),
      new ColumnModule("View PDFs", onloadExample),
      new ColumnModule("Exercise Box", onloadExample, document.getElementById("exercise-container-module")),
];
