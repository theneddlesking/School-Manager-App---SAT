if (classRightNow == "Weekend" || classRightNow == "After School" || classRightNow == "On Break" || classRightNow == "Before School") {
        //if not in class then display column with next class data
        updateSubjectColumn(getNextClass(actualDay), true);
} else {
        //if in class then display column with current class data
        updateSubjectColumn(classRightNow, true);
}

function updateSubjectColumn(subjectID, isSubject) {
        if (isSubject === undefined) {
              var subjectNames = document.getElementsByClassName("subject-name");
              subject = subjectNames[subjectID].textContent;
        } else {
              subject = subjectID;
        }

        if (subject == "Spare :)" || subject == "No class." || subject == "On Break" || subject == "Subject Not Loaded") {
              //if there is no class then do not update the column
              return;
        }


        var subjectData = getSubjectData(subject);

        console.log(subjectData);
        if (subjectData == "Data not found.") { //check to see if data exists
              Debugger.log("Could not retrieve subject data.");
              return;
        }

        //validate data


        //

        //DISPLAYING THE DATA
        document.getElementById("subject-column-dot").style.display = "inline";
        document.getElementById("subject-column-dot").style.backgroundColor = subjectData.colour;
        document.getElementById("column-heading").textContent = subjectData.name;

        document.getElementById("column-content").innerHTML = `<div class="container" id="column-top"></div>
        <div class="container" id="column-bottom"></div>`;

        var topIsEmpty = true; //if top of column is empty shift elements to the top
        for (var i=0; i < subjectData.columnModules.length; i++) {
                if (subjectData.columnModules[i].bottom === false) {
                        topIsEmpty = false;
                        break;
                }
        }

        for (var i=0; i < subjectData.columnModules.length; i++) { //display modules
                ColumnModules.loadModule(subjectData.columnModules[i], topIsEmpty, subjectData.name);
        }

        var beginText = document.getElementById("begin-exercise-name");
        var questionText = document.getElementById("input-exercise-name");

        if (beginText != null) {
              beginText.textContent = subjectData.exerciseName;
        }
        if (questionText != null) {
              questionText.textContent = subjectData.exerciseName + " Questions";
              var questionTextArea = document.getElementById("exercise-questions-input");
              questionTextArea.textContent = subjectData.exerciseQuestionsText;
        }

        currentSubjectData = subjectData;
}
