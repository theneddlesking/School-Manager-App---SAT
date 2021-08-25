class Note {
      constructor(title, description) {
            this.description = description;
            this.title = title;
      }
}

var noteData;

function initialiseNoteData(data) {
          var noteData = {
                  notes : [],

                  displayNotes : function(){
                        clearStickyNote("notes");
                        console.log(noteData)

                        if (noteData.notes.length != 0) {
                              for (var i=0; i < this.notes.length; i++) {
                                      addNewItemToStickyNote(this.notes[i], i, "notes");
                              }
                        }
                  }
          };

          noteData.notes = data.notes[0].notes; //stores data in array by default as it loops through all keys in object store

          return noteData;
}


function addNote() {
      replaceColumn = false;
      replaceColumnWithItem("note", "add");
}

function replaceColumnWithNotes() {
      if (!replaceColumn) { //removes double press on add button
            replaceColumn = true;
            return;
      }
      replaceColumn = true;

      document.getElementById("subject-column-dot").style.display = "none";
      document.getElementById("column-heading").textContent = "Notes / Reminders";

      document.getElementById("column-content").innerHTML = `<div class="container" id="column-top"></div>
      <div class="container" id="column-bottom"></div>`;

      var noteColumn = document.getElementById("column-top");

      for (var i=0; i < noteData.notes.length; i++) {
              var note = noteData.notes[i];
              var title = note.title;
              var description = note.description;


              //create html
              var noteElem = document.getElementById("note-column-module").content.cloneNode(true);

              noteElem.querySelector(".column-module").setAttribute("onclick", 'replaceColumnWithItem("notes",' + i + ')');
              noteElem.querySelector(".note-description").textContent = description;
              noteElem.querySelector(".module-text").textContent = title;

              noteColumn.appendChild(noteElem);
      }
}

function validateNotes(deleteIt) { //empty description is allowed
        var title = document.getElementById("item-name").value;
        var description = document.getElementById("item-description").value;

        if ((title == "" || title == null || title == undefined) && !deleteIt ) { //don't validate data if deleting
              alert("Please enter a title.");
              return false;
        }

        if (g_itemIndex != "add") {
              noteData.notes.splice(g_itemIndex, 1); //remove note to update data
              if (!deleteIt) { //delete doesn't add new note
                    noteData.notes.splice(g_itemIndex, 0 ,new Note(title, description));
              }
        } else {
              noteData.notes.push(new Note(title, description)); //add just pushes new note
        }

        return true; //passed validation
}
