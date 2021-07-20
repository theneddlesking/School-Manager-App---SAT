function getHomeworkTask(itemIndex) {
        //replace with some fetch later;
        var homeworkData = getHomeworkData();


        var data = homeworkData.homework[itemIndex];

        return data;
}



function loadOptions() {
        var select = document.getElementById("item-subject");
        select.innerHTML = "";
        for (var i=0; i < mySubjects.length; i++) {
                select.innerHTML += "<option>" + mySubjects[i].name + "</option>";
        }
}


function replaceColumnWithItem(itemType, itemIndex) {
        //index the item later

        alert(itemIndex)

        if (itemType == "homework") {

        }



        var itemData = getHomeworkTask(itemIndex);

        if (itemData == undefined || itemData == null) {
              return;
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

        homeworkColumnTop.querySelector("#item-dot").style.backgroundColor = itemData.subject.colour;
        homeworkColumnTop.querySelector("#item-subject").selectedIndex = itemData.subject.subjectIndex;

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
