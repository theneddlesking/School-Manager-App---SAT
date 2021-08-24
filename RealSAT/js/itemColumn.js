function getHomeworkTask(itemIndex) {
        var data = homeworkData.homework[itemIndex];
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

function loadOptions() {
        var select = document.getElementById("item-subject");
        select.innerHTML = "";
        for (var i=0; i < mySubjects.length; i++) {
                select.innerHTML += "<option>" + mySubjects[i].name + "</option>";
        }
}

var g_itemIndex;

function replaceColumnWithItem(itemType, itemIndex) {
        //index the item later

        if (itemType == "homework") {

        }

        if (itemIndex == "add") { //add mode creates a blank version
          g_itemIndex = "add";
              var itemData = emptyHomework;
        } else { //editting a previous homework task
              g_itemIndex = itemIndex;
              var itemData = getHomeworkTask(itemIndex);

              if (itemData == undefined || itemData == null) { //existence check
                    return;
              }
        }

        console.log(itemData);

        //reset column

        document.getElementById("subject-column-dot").style.display = "none";
        document.getElementById("column-heading").textContent = "Homework";

        document.getElementById("column-content").innerHTML = `<div class="container" id="column-top"></div>
        <div class="container" id="column-bottom"></div>`;

        var homeworkColumnTop = document.getElementById("column-top");
        var itemElem = document.getElementById("edit-homework").content.cloneNode(true);

        homeworkColumnTop.appendChild(itemElem);

        loadOptions();

        //insert data into column

        homeworkColumnTop.querySelector("#item-dot").style.backgroundColor = itemData.subject.colour;

        if (itemIndex == "add") {
              homeworkColumnTop.querySelector("#item-subject").value = mySubjects[0].name;
              homeworkColumnTop.querySelector("#item-dot").style.backgroundColor = mySubjects[0].colour;
              document.getElementById("item-date").valueAsDate = new Date();
        } else {
              homeworkColumnTop.querySelector("#item-subject").value = itemData.subject.name;
              document.getElementById("item-date").valueAsDate = itemData.dueDate;
        }

        homeworkColumnTop.querySelector("#item-name").value = itemData.title;
        homeworkColumnTop.querySelector("#item-description").value = itemData.description;

        var submitElem = document.getElementById("edit-homework-bottom").content.cloneNode(true);
        document.getElementById("column-bottom").appendChild(submitElem);

}

function updateDot(subject) {
        var data = getSubjectData(subject);
        var dot = document.getElementById("item-dot");
        dot.style.backgroundColor = data.colour;
}
