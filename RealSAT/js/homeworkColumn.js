class HomeworkTask {
      constructor(subject, dueDate, title, description, isPDFWork) {
            this.subject = subject;
            this.dueDate = dueDate;
            this.description = description;
            this.title = title;

            this.hasTitle = true;
            this.hasDescription = true;
            if (this.description == "" || this.description == undefined || this.description == null) {
                  this.hasDescription = false;
            }
            if (this.title == "" || this.title == undefined || this.title == null) {
                  this.hasTitle = false;
            }

            this.isPDFWork = isPDFWork;

            this.pdfData = {
                  //holds homework data to be interepted by the PDF section of the program
            };
      }
}

function initialiseHomeworkData(data) {
        var homeworkData = {
              homework : [],

              homeworkBySubject : [],

              addHomework : function(homeworkTask) { //makes sure that homework is added to both arrays for quick searching later
                    console.log(homeworkTask);

                    this.homework.push(homeworkTask);

                    if (this.homeworkBySubject[homeworkTask.subject.name] == undefined) {
                          this.homeworkBySubject[homeworkTask.subject.name] = [];
                    }

                    this.homeworkBySubject[homeworkTask.subject.name].push( homeworkTask );
              },

              displayHomework : function() {
                      clearStickyNote("homework");

                      if (this.homework.length != 0) {
                            for (var i=0; i < this.homework.length; i++) {
                                    addNewItemToStickyNote(this.homework[i], i, "homework");
                            }
                      }


              },

              removeHomework : function(index) {
                    if (index == "add") {
                          return;
                    }

                    var task = this.homework[index];

                    console.log("task")
                    console.log(task)

                    for (var i=0; i < this.homeworkBySubject[task.subject.name].length; i++) {
                            if (this.homeworkBySubject[task.subject.name][i] == task) {

                                    this.homeworkBySubject[task.subject.name].splice(i, 1);
                            }
                    }


                    this.homework.splice(index, 1);
                    console.log("homework: " + this.homework)

              }
        };

        // homeworkData.addHomework( new HomeworkTask(mySubjects[0], "12 / 06", "Cute Proof", "Prove that complex numbers are cute", false) );
        // homeworkData.addHomework( new HomeworkTask(mySubjects[1], "12 / 07", "", "Split hydrogen atom", false) );

        if (data.homework.length == 1) {
              for (var i=0; i < data.homework[0].homework.length; i++) {
                      homeworkData.addHomework(data.homework[0].homework[i]);
              }
        }



        return homeworkData;
}

var homeworkData;

var replaceColumn = true; //makes sure buttons aren't double pressed

function addHomework() {
      replaceColumn = false;
      replaceColumnWithItem("homework", "add");
}

function replaceColumnWithHomework() {
        if (!replaceColumn) { //removes double press on add button
              replaceColumn = true;
              return;
        }
        replaceColumn = true;

        //add column content

        document.getElementById("subject-column-dot").style.display = "none";
        document.getElementById("column-heading").textContent = "Homework";

        document.getElementById("column-content").innerHTML = `<div class="container" id="column-top"></div>
        <div class="container" id="column-bottom"></div>`;

        var homeworkColumn = document.getElementById("column-top");

        for (var i=0; i < homeworkData.homework.length; i++) {
                var homework = homeworkData.homework[i];
                var title = "";
                if (homework.hasTitle) { //formats data so that title is always correctly displayed
                      title = homework.title;
                } else if (homework.hasDescription && homework.description.length <= 20) { //change the length to displaying the title up to 17 chars + ...
                      title = homework.description;
                      homework.description = "";
                } else {
                      title = homework.subject.name + " Homework";
                }

                var description = "";
                if (homework.hasDescription) {
                      description = homework.description;
                } else if (homework.hasTitle && homework.title.length <= 20) {
                      description = homework.title;
                }

                //create html
                var homeworkElem = document.getElementById("homework-column-module").content.cloneNode(true);
                homeworkElem.querySelector(".module-text").textContent = title + " - " + (homework.dueDate + "").substring(0, 10);

                homeworkElem.savedIndex = i;
                homeworkElem.querySelector(".column-module").setAttribute("onclick", 'replaceColumnWithItem("homework",' + i + ')');
                homeworkElem.querySelector(".homework-description").textContent = description;
                homeworkElem.querySelector(".dot").style.display = "block";
                homeworkElem.querySelector(".dot").style.backgroundColor = homework.subject.colour;

                

                homeworkColumn.appendChild(homeworkElem);
        }
}

function isDateBeforeToday(date) {
    return new Date(date.toDateString()) < new Date(new Date().toDateString()); //checks if day submitted is before today
}

function validateHomework(deleteIt, pdfHomework) {
        if (pdfHomework) { //cannot and don't need to validate dynamic homework
              return true;
        }

        //check if inputs are valid and then update data
        var title = document.getElementById("item-name").value;
        var description = document.getElementById("item-description").value;
        var colour = document.getElementById("item-dot").style.backgroundColor;
        var subject = getSubjectFromName(document.getElementById("item-subject").value);
        var dueDate = new Date(document.getElementById("item-date").value);

        if (!deleteIt) { //you want to be able to delete any task
              if (subject == undefined || subject == null || subject == "") {
                    alert("Please select a subject.");
                    return false;
              }

              if (isDateBeforeToday(dueDate)) { //can only set homework to a time in the future
                    alert("Please select a date in the future.");
                    return false;
              }
        }

        homeworkData.removeHomework(g_itemIndex);
        if (!deleteIt) {
              homeworkData.addHomework( new HomeworkTask(subject, dueDate, title, description, false) );
        }

        return true;
}
