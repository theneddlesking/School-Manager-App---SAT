var subjectIndex = 0;
class Subject {
      constructor(name, colour) {
            this.name = name;
            this.colour = colour;
            this.columnModules = [addModuleToSubject("Upload PDF")];
            this.exerciseName = "16E";
            this.exerciseQuestions = [];
            this.exerciseQuestionsText = "1all, 2all, 3all";
            this.subjectIndex = subjectIndex;
            subjectIndex++;
      }
}

var allSubjects = [
    new Subject("Specialist Math", "#F1796C"),
    new Subject("Physics", "#EBD070"),
    new Subject("Chemistry", "#EBD070"),
    new Subject("English", "#3C64B1"),
    new Subject("Math Methods", "#F1796C"),
    new Subject("Software Development", "#8DDDBE"),
];

var allowedSubjects = []; //array of subject names to test against for data validation

createDatalist();

function addSubjectMethods(subjects) {
        for (var i=0; i < subjects.length; i++) {
                subjects[i].updateExerciseData = function() {
                      //update the data
                }
        }
}

function validateSubjects(data) {
      var seenSubjects = [];
      for (var i=0; i < data.length; i++) {
              var subject = data[i].value;
              if (subject == "") {
                      alert("A field is empty. Please make sure to fill in all subjects.");
                      return false;
              }
              if (seenSubjects.includes(subject)) {
                      alert("You have multiple of the same subject. Please submit 6 unique subjects.");
                      return false;
              }
              if (!allowedSubjects.includes(subject)) {
                      alert( "Subject " + (i+1) + " isn't recognised. Please choose one from the menu.");
                      return false;
              }
              seenSubjects.push(subject);
      }
      return true; //passed validation
}

//PRE-FETCH - just has colour and subject, nothing user specific
function getSubjectFromName(subjectname) {
        console.log(subjectname);
        for (var i=0; i < allSubjects.length; i++) {
              if (subjectname == allSubjects[i].name) {
                    return allSubjects[i];
              }
        }
        return allSubjects[0]; //should never trigger but just returns some subject
}

//POST-FETCH - user specific
function getSubjectData(subject) {
        for (var i=0; i < mySubjects.length; i++) {
              if (mySubjects[i].name == subject) {
                    return mySubjects[i];
              }
        }
        return "Data not found.";
}

function createDatalist() {
      var datalist = document.getElementById("subject-list");
      for (var i=0; i < allSubjects.length; i++) {
            var option = document.createElement("option");
            option.textContent = allSubjects[i].name;
            allowedSubjects.push(allSubjects[i].name);
            datalist.appendChild(option);
      }
}
