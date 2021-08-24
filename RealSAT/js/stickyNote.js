function addNewItemToStickyNote(homeworkData, index, note) {
      if (index >= 5) { //will not fit on sticky note
            //update additional items display
            return;
      }

      console.log(homeworkData);

      var stickyNoteDiv = document.getElementById(note);

      var stickyRows = stickyNoteDiv.querySelectorAll(".sticky-note-row");

      var title = "";
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

      stickyRows[index].innerHTML = "";

      stickyRows[index].appendChild(dot);

      var text = document.createElement("p");
      text.textContent = title;

      stickyRows[index].appendChild(text);

}
