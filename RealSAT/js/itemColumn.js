function getHomeworkTask(itemIndex) {
        var data = homeworkData.homework[itemIndex];
        return data;
}

function getNote(itemIndex) {
        var data = noteData.notes[itemIndex];
        return data;
}

var emptyHomework = {
    "subject": {},
    "dueDate": "",
    "description": "",
    "title": "",
    "hasTitle": false,
    "hasDescription": false,
    "isPDFWork": false,
    "pdfData": {}
}

var emptyNote = {
    description : "",
    title: "",
}

function loadOptions() {
        var select = document.getElementById("item-subject");
        select.innerHTML = "";
        for (var i=0; i < mySubjects.length; i++) {
                select.innerHTML += "<option>" + mySubjects[i].name + "</option>";
        }
}

var g_itemIndex; //global for reference in other functions

function replaceColumnWithItem(itemType, itemIndex) { //could be cleaner with proper abstraction but it's not tooooo bad
        //index the item later
        console.log(itemIndex);

        if (itemIndex == "add") { //add mode creates a blank version
              g_itemIndex = "add";
              var itemData = emptyNote;
              if (itemType == "homework") {
                      itemData = emptyHomework;
              }
        } else { //editting a previous homework task
              g_itemIndex = itemIndex;
              var itemData;
              if (itemType == "homework") {
                      itemData = getHomeworkTask(itemIndex);
              } else {
                      itemData = getNote(itemIndex);
              }

              if (itemData == undefined || itemData == null) { //existence check
                    return;
              }
        }

        console.log(itemData);

        //reset column

        document.getElementById("subject-column-dot").style.display = "none";
        if (itemType == "homework") {
              document.getElementById("column-heading").textContent = "Homework";
        } else {
              document.getElementById("column-heading").textContent = "Notes / Reminders";
        }

        document.getElementById("column-content").innerHTML = `<div class="container" id="column-top"></div>
        <div class="container" id="column-bottom"></div>`;

        var homeworkColumnTop = document.getElementById("column-top");

        if (itemType == "homework") {
              var itemElem = document.getElementById("edit-homework").content.cloneNode(true);
        } else {
              var itemElem = document.getElementById("edit-note").content.cloneNode(true);
        }


        homeworkColumnTop.appendChild(itemElem);

        if (itemType == "homework") {
                loadOptions(); //fills select with subjects
                homeworkColumnTop.querySelector("#item-dot").style.backgroundColor = itemData.subject.colour;
                if (itemIndex == "add") {
                      homeworkColumnTop.querySelector("#item-subject").value = mySubjects[0].name;
                      homeworkColumnTop.querySelector("#item-dot").style.backgroundColor = mySubjects[0].colour;
                      document.getElementById("item-date").valueAsDate = new Date();
                } else {
                      homeworkColumnTop.querySelector("#item-subject").value = itemData.subject.name;
                      document.getElementById("item-date").valueAsDate = itemData.dueDate;
                      var deleteBtn = document.createElement("div");
                      var deleteText = document.createElement("p");
                      deleteText.textContent = "Completed Task";
                      deleteBtn.appendChild(deleteText);
                      deleteBtn.classList.add("green-button");
                      deleteBtn.classList.add("clickable");
                      deleteBtn.onclick = function() {
                            updateHomeworkData(true);
                      }
                      homeworkColumnTop.appendChild(deleteBtn);
                }
        } else { //notes
                if (itemIndex != "add") {
                        var deleteBtn = document.createElement("div");
                        var deleteText = document.createElement("p");
                        deleteText.textContent = "Discard Note";
                        deleteBtn.appendChild(deleteText);
                        deleteBtn.classList.add("red-button");
                        deleteBtn.classList.add("clickable");
                        deleteBtn.onclick = function() {
                              updateNoteData(true);
                        }
                        console.log(homework.isPDFWork);


                        homeworkColumnTop.appendChild(deleteBtn);
                }
        }

        if (itemData.isPDFWork) {
                var startWorkBtn = document.createElement("button");
                startWorkBtn.textContent = "Start Questions";
                startWorkBtn.onclick = function() {
                        currentSubjectData = itemData.subject;
                        console.log(currentSubjectData)
                        beginExercise(false, itemData.description);
                }
                homeworkColumnTop.appendChild(startWorkBtn);
        }

        //insert data into column

        homeworkColumnTop.querySelector("#item-name").value = itemData.title;
        homeworkColumnTop.querySelector("#item-description").value = itemData.description;

        if (itemType == "homework") {
              var submitElem = document.getElementById("edit-homework-bottom").content.cloneNode(true);
        } else {
              var submitElem = document.getElementById("edit-note-bottom").content.cloneNode(true);
        }

        document.getElementById("column-bottom").appendChild(submitElem);

}

function updateDot(subject) {
        var data = getSubjectData(subject);
        var dot = document.getElementById("item-dot");
        dot.style.backgroundColor = data.colour;
}
