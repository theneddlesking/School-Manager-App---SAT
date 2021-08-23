//MANAGES START UP ON THE PROGRAM

function startUp(data) { //triggers once data is fetched, otherwise webpage would have no data
        console.log(data);
        mySubjects = data.subjects;

        addSubjectMethods(data.subjects)

        if (data.subjects.length > 0) {
                loadPage("main");
        } else {
                loadPage("start-page");
                return;
        }

        addModulesToSubject(mySubjects[0], ["Begin Exercise", "Input Questions", "Exercise Box"]);
        addModulesToSubject(mySubjects[1], ["Begin Exercise", "Input Questions", "Exercise Box"]);

        mySubjects[1].exerciseName = "7A";

        receiveTimetableData();

        classRightNow = getSubjectRightNow(actualDay);

        homeworkData = getHomeworkData();

        addNewItemToStickyNote(homeworkData.homework[0], 0, "homework");
        addNewItemToStickyNote(homeworkData.homework[1], 1, "homework");

        if (classRightNow == "Weekend" || classRightNow == "After School" || classRightNow == "On Break" || classRightNow == "Before School") {
                //if not in class then display column with next class data
                updateSubjectColumn(getNextClass(actualDay), true);
        } else {
                //if in class then display column with current class data
                updateSubjectColumn(classRightNow, true);
        }

}
