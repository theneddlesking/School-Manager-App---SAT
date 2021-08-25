function clearStickyNote(note) {
        var stickyNoteDiv = document.getElementById(note);
        var stickyRows = stickyNoteDiv.querySelectorAll(".sticky-note-row");

        for (var i=0; i < stickyRows.length; i++) {
                stickyRows[i].innerHTML = "";
        }

        var homeworkHeader = document.getElementById("homework-sticky-note-heading-text");
        if (note == "homework" && homeworkData.homework.length > 5) {
                var plural = "";
                if (homeworkData.homework.length > 6) { //view 1 more items is grammatically incorrect
                      plural = "s";
                }
                homeworkHeader.innerHTML = 'Homework <span class="small-font">View ' + (homeworkData.homework.length-5) + ' more item' + plural + '</span> <span class="sticky-note-add" id="add-homework" onclick="addHomework()">+</span>';
        } else {
                homeworkHeader.innerHTML = 'Homework <span class="sticky-note-add" id="add-homework" onclick="addHomework()">+</span>';
        }
}

function addNewItemToStickyNote(data, index, note) {
      if (index >= 5) { //will not fit on sticky note
            //update additional items display
            return;
      }

      var stickyNoteDiv = document.getElementById(note);

      var stickyRows = stickyNoteDiv.querySelectorAll(".sticky-note-row");

      stickyRows[index].innerHTML = "";

      var title = "";

      if (note == "notes") {
            title = data.title;
      }

      if (note == "homework") {
            var homeworkData = data;
            if (homeworkData.hasTitle) {
                  title = homeworkData.title;
            } else if (homeworkData.hasDescription && homeworkData.description.length <= 20) { //change the length to displaying the title up to 17 chars + ...
                  title = homeworkData.description;
                  homeworkData.description = "";
            } else {
                  title = homeworkData.subject.name + " Homework";
            }

            var dot = document.createElement("p");
            dot.className = "dot";
            dot.style.backgroundColor = homeworkData.subject.colour;
            stickyRows[index].appendChild(dot);
      }

      var text = document.createElement("p");
      text.textContent = title;

      stickyRows[index].appendChild(text);
}
