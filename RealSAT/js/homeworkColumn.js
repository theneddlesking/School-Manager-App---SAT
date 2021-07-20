
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


function getHomeworkData() {
        var homeworkData = {
              homework : [],

              homeworkBySubject : [],

              addHomework : function(homeworkTask) { //makes sure that homework is added to both arrays for quick searching later
                    this.homework.push(homeworkTask);

                    if (this.homeworkBySubject[homeworkTask.subject.name] == undefined) { //may bug later if you change subjects by storing more than 6 subjects but this should be impossible with input control
                          this.homeworkBySubject[homeworkTask.subject.name] = [];
                    }

                    this.homeworkBySubject[homeworkTask.subject.name].push( homeworkTask );
              },

        };

        homeworkData.addHomework( new HomeworkTask(mySubjects[0], "12 / 06", "Cute Proof", "Prove that complex numbers are cute", false) );
        homeworkData.addHomework( new HomeworkTask(mySubjects[1], "12 / 07", "", "Split hydrogen atom", false) );

        return homeworkData;
}


function replaceColumnWithHomework() {
        var homeworkData = getHomeworkData();

        //validate data


        //

        //add column content

        document.getElementById("subject-column-dot").style.display = "none";
        document.getElementById("column-heading").textContent = "Homework";

        document.getElementById("column-content").innerHTML = `<div class="container" id="column-top"></div>
        <div class="container" id="column-bottom"></div>`;

        var homeworkColumn = document.getElementById("column-top");

        // var title = document.getElementById("basic-column-module").content.cloneNode(true);
        // if (homeworkData.homework.length > 0) { //exists
        //         title.querySelector(".module-text").textContent = "My tasks:";
        // } else {
        //         title.querySelector(".module-text").textContent = "You don't have any tasks."; //add option to add one?
        // }
        // homeworkColumn.appendChild(title);

        for (var i=0; i < homeworkData.homework.length; i++) {
                var homework = homeworkData.homework[i];
                var title = "";
                if (homework.hasTitle) {
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

                //length validation? - long titles / descriptions are weird


                //create html
                var homeworkElem = document.getElementById("homework-column-module").content.cloneNode(true);
                homeworkElem.querySelector(".module-text").textContent = title + " - " + homework.dueDate;
                homeworkElem.querySelector(".column-module").onclick = function() { replaceColumnWithItem("homework", i) };



                homeworkElem.querySelector(".homework-description").textContent = description;
                homeworkElem.querySelector(".dot").style.display = "block";
                homeworkElem.querySelector(".dot").style.backgroundColor = homework.subject.colour;

                homeworkColumn.appendChild(homeworkElem);
        }
}
