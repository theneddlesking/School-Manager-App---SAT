var subjectNames = document.getElementsByClassName("subject-name");
var subjects;
var week;
var currentDay;
var actualDay = new Date();
var classRightNow;
var currentSubjectData;


var homework = [];
var notes = [];


var mySubjects = [];

function addModuleToSubject(moduleName) {
        for (var i=0; i < baseColumnModules.length; i++) {
                if (moduleName == baseColumnModules[i].name) {
                      return baseColumnModules[i];
                }
        }
        return "No module found.";
}

function addModulesToSubject(subject, modules) {
        for (var i=0; i < modules.length; i++) {
                var result = addModuleToSubject(modules[i]);
                if (result != "No module found.") {
                    subject.columnModules.push( result );
                }
        }
}


var periods = [
   {
     start : 9*60,
     finish : 10*60 + 15,
   },
   {
     start : 10*60 + 16,
     finish : 11*60 + 30,
   },
   {
     start : 12*60 + 15,
     finish : 13*60 + 30,
   },
   {
     start : 14*60,
     finish : 15*60 + 15,
   }
];

function getSubjectRightNow(today, getPeriod) { //if getPeriod then return the period index instead of the class
    var day = today.getDay();
    var time = today.getHours()*60 + today.getMinutes();
    if (day == 0 || day == 6) {
          return "Weekend";
    } else {
        if (time < periods[0].start) {
            return "Before School";
        } else if (time > periods[3].finish) {
            return "After School";
        }
        else {
              var currentClass = "";
              for (var i=0; i < periods.length; i++) {
                  if (getPeriod && i == 3) {
                      return 3;
                  }
                  if (getPeriod && time < periods[i+1].start) {
                      return i;
                  }
                  if (time >= periods[i].start && time <= periods[i].finish) {
                        currentClass = week[day-1][i];
                        return currentClass;
                  }
              }
              if (currentClass == "") {
                  return "On Break";
              }
        }
    }
    Debugger.log("Error: no match");
    return "Error: no match";
}

function getNextPeriod(day) {
    var currentPeriod = getSubjectRightNow(day, true);
    if (!isNaN(currentPeriod)) {
        if (currentPeriod == 3) { //last period
            return 0;
        } else {
            return currentPeriod + 1;
        }
    } else {
        Debugger.log("Failed to fetch period.");
        return 0;
    }
}

function getNextClass(today) {
    var nextPeriod;
    var day = today.getDay();
    var time = today.getHours() * 60 + today.getMinutes();
    var currentClass = getSubjectRightNow(today, false);

    if (currentClass == "Weekend") {
        return week[0][0];
    }
    else if (currentClass == "Before School") {
        return week[day-1][0];
    }
    else if (currentClass == "After School") {
        if (day == 5) { //if after school on a Friday then the next class is Monday Morning
              return week[0][0];
        }
        if (day == 4) { //first period on a Friday is a spare so skip it
              return week[day][1];
        }
        return week[day][0];
    }
    else if (currentClass == "On Break") {
        nextPeriod = getNextPeriod(today);
        if (nextPeriod == 0) {
            return week[day][0];
        } else {
            return week[day-1][nextPeriod];
        }
    }
    else if (currentClass == "Error: no match") {
        Debugger.log("Could not get next class.");
        return "Could not get next class.";
    }
    else { //you are in class
      nextPeriod = getNextPeriod(today);
      if (nextPeriod == 0) {
          return week[day][0];
      } else {
          return week[day-1][nextPeriod];
      }
    }
}

function getSchedule(today) {
    var subjects = document.getElementsByClassName("subject");
    var scheduleHeader = document.getElementById("schedule-header");
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var day = today.getDay();
    scheduleHeader.textContent = days[day] + " " + today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    if (day == 0 || day == 6) {
        //weekend
        for (var i = 0; i < subjects.length; i++) {
            subjectNames[i].textContent = "No class.";
        }
    } else {
        for (var i = 0; i < subjects.length; i++) {
            subjectNames[i].textContent = week[day-1][i];
        }
    }
    if (actualDay.getDate() == currentDay.getDate() && actualDay.getMonth() == currentDay.getMonth()  && actualDay.getFullYear() == currentDay.getFullYear()) {
        highlightCurrentPeriod(today);
    } else {
          unhighlightPeriod("all");
    }
}

function highlightPeriod(period) {
      var subjects = document.getElementsByClassName("subject");
      subjects[period].classList.add("highlighted-subject");
}

function unhighlightPeriod(period) {
      var subjects = document.getElementsByClassName("subject");
      if (period == "all") {
          for (var i = 0; i < subjects.length; i++) {
              subjects[i].classList.remove("highlighted-subject");
          }
      } else {
          subjects[period].classList.remove("highlighted-subject");
      }
}

function highlightCurrentPeriod(today) {
    unhighlightPeriod("all");
    var currentPeriod = getSubjectRightNow(today, false);
    if (currentPeriod == "Weekend" || currentPeriod == "After School") {
        return;
    }
    else if (currentPeriod == "Before School") {
        highlightPeriod(0);
    }
    else if (currentPeriod == "On Break") {
        highlightPeriod(getNextPeriod(today));
    }
    else {
        if (today.getHours() >= 14) {
            highlightPeriod(3);
        } else {
            highlightPeriod(getNextPeriod(today)-1);
        }
    }
}

function receiveTimetableData() {
      subjects = [].concat(mySubjects);
      week = [
         [subjects[0].name, subjects[1].name, subjects[2].name, subjects[3].name],
         [subjects[4].name, subjects[5].name, subjects[0].name, "Spare :)"],
         [subjects[1].name, subjects[2].name, subjects[3].name, subjects[4].name],
         [subjects[5].name, subjects[0].name, subjects[1].name, subjects[2].name],
         ["Spare :)", subjects[3].name, subjects[4].name, subjects[5].name]
     ];
     currentDay = new Date();
     getSchedule(currentDay);
}


function changeDay(num) {
      currentDay.setDate(currentDay.getDate()+num);
      getSchedule(currentDay);
}



var classRightNow;
