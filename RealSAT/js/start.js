//MANAGES START UP ON THE PROGRAM

function startUp(data) { //triggers once data is fetched, otherwise webpage would have no data
        console.log(data);
        mySubjects = data.subjects;

        addSubjectMethods(data.subjects)

        if (data.subjects.length > 0) {
                loadPage("main"); //loads normally
        } else {
                loadPage("start-page"); //if there are no subjects then we need user to input their subjects
                return; //exits to avoid reset of start up
        }

        for (var i=0; i < mySubjects.length; i++) {
                addModulesToSubject(mySubjects[i], ["Begin Exercise", "Input Questions", "Exercise Box", "Upload PDF"]);
        }

        receiveTimetableData();

        classRightNow = getSubjectRightNow(actualDay);

        homeworkData = initialiseHomeworkData(data); //resets the unserialisable data

        homeworkData.displayHomework();

        noteData = initialiseNoteData(data); //resets the unserialisable data

        noteData.displayNotes();

        if (data.pdfs[0] == undefined) {
              cambridge.pdfs = [];
        } else {
              cambridge.pdfs = data.pdfs[0];
        }

        updateColumnWithSubject(); //fills side column with the next subject you have or your current subject

}

function updateColumnWithSubject() {
      if (classRightNow == "Weekend" || classRightNow == "After School" || classRightNow == "On Break" || classRightNow == "Before School") {
              //if not in class then display column with next class data
              updateSubjectColumn(getNextClass(actualDay), true);
      } else {
              //if in class then display column with current class data
              updateSubjectColumn(classRightNow, true);
      }
}
