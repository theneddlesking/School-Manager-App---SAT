//MANAGES DATABASE, OBJECTSTORES, AND DATA FETCH QUERIES

var db;
const updateSubjects = document.getElementById("subject-submit");
var updateHomework = document.getElementById("homework-submit");
var currentData = {};


function openDb(dbName) {
    return new Promise((resolve, reject) => {
        let dbReq = indexedDB.open(dbName, 1);

        dbReq.onsuccess = () => resolve(dbReq.result);
        dbReq.onerror = (event) => reject(new Error('Failed to open DB'));
    });
}

function queryObjectStore(objectStore) { //creates promise for query
    return new Promise((resolve, reject) => {
        let results = objectStore.openCursor();
        let data = [];

        results.onsuccess = function() { //loops and gets all data from object store
            let cursor = event.target.result;
            if (cursor) {
                data.push(cursor.value);
                cursor.continue();
            } else {
                resolve(data);
            }
        };
    });
}

async function retrieveData(fnCallback) {
    const db = await openDb('client_db');
    const transaction = db.transaction(["subjects_os"]);
    const objectStore = transaction.objectStore('subjects_os');

    var data = {};

    //queries to fetch data - probably a better way to do this without nesting
    queryObjectStore(objectStore).then(
            function(subjectData) {
                  data.subjects = subjectData;
                  const transaction = db.transaction(["homework_os"]);
                  const objectStore = transaction.objectStore('homework_os');
                  queryObjectStore(objectStore).then(
                          function(someHomeworkData) {
                                data.homework = someHomeworkData;
                                const transaction = db.transaction(["notes_os"]);
                                const objectStore = transaction.objectStore('notes_os');
                                queryObjectStore(objectStore).then(
                                        function(someNoteData) {
                                              data.notes = someNoteData;
                                              fnCallback(data);
                                        }
                                );
                          }
                  );
            }
    )
}

function updateNoteData(deleteIt) { //add and update
      var validation = validateNotes(deleteIt); //true means passed validation

      if (!validation) {
            return;
      }

      var transaction = db.transaction(['notes_os'], 'readwrite');
      var objectStore = transaction.objectStore('notes_os');
      var request = objectStore.clear();

      var data = {...noteData}; //spread operator makes shallow copy so that current data isn't overwritten

      data.displayNotes= "";

      var newItem = data;

      var transaction = db.transaction(['notes_os'], 'readwrite');
      var objectStore = transaction.objectStore('notes_os');
      var request = objectStore.add(newItem);

      transaction.oncomplete = function() {
          console.log('Transaction completed: database modification finished.');

      }

      transaction.onerror = function() {
          console.log('Transaction not opened due to error');
      };

      retrieveData(startUp);
}

function updateHomeworkData(deleteIt) { //add and update
      var validation = validateHomework(deleteIt); //true means passed validation

      if (!validation) {
            return;
      }

      var transaction = db.transaction(['homework_os'], 'readwrite');
      var objectStore = transaction.objectStore('homework_os');
      var request = objectStore.clear();

      var data = {...homeworkData}; //spread operator makes shallow copy so that current data isn't overwritten

      for (var i=0; i < data.homework.length; i++) {
              data.homework[i].subject.columnModules = []; //cannot be serialised
              data.homework[i].subject.updateExerciseData = ""; //cannot be serialised
      }


      data.homeworkBySubject = []; //cannot be serialised
      data.addHomework = ""; //cannot be serialised
      data.displayHomework = ""; //cannot be serialised
      data.removeHomework = "";

      var newItem = data;

      var transaction = db.transaction(['homework_os'], 'readwrite');
      var objectStore = transaction.objectStore('homework_os');
      var request = objectStore.add(newItem);

      transaction.oncomplete = function() {
          console.log('Transaction completed: database modification finished.');

      }

      transaction.onerror = function() {
          console.log('Transaction not opened due to error');
      };

      retrieveData(startUp);
}

function updateSubjectData() { //add and update

    var data = document.getElementsByClassName("subject-input");

    var validation = validateSubjects(data); //true means validation is passed

    if (validation !== true) { //failed validation (onscreen message through other function)
            return;
    }

    var transaction = db.transaction(['subjects_os'], 'readwrite');
    var objectStore = transaction.objectStore('subjects_os');
    var request = objectStore.clear();

    for (var i =0; i < data.length; i++) {
          var newItem = getSubjectFromName(data[i].value);

          newItem.columnModules = [];  //cannot be serialised
          newItem.updateExerciseData = "" //cannot be serialised


          var transaction = db.transaction(['subjects_os'], 'readwrite');
          var objectStore = transaction.objectStore('subjects_os');
          var request = objectStore.add(newItem);

          transaction.oncomplete = function() {
              console.log('Transaction completed: database modification finished.');
          }

          transaction.onerror = function() { //vague but never had this triggered before
              console.log('Transaction not opened due to error');
          };
    }

    retrieveData(startUp);
}

window.onload = function() {

    //needs seperate request within the onload function to test for upgrades

    var request = window.indexedDB.open('client_db', 1);

    request.onerror = function() {
      console.log('Database failed to open');
    };

    request.onsuccess = function() {
      console.log('Database opened successfully');

    db = request.result;

    retrieveData(startUp);

  };

  request.onupgradeneeded = function(e) {
      var db = e.target.result;
      var objectStore = db.createObjectStore('subjects_os', { keyPath: 'id', autoIncrement:true });
      objectStore.createIndex('subject', 'subject', { unique: false });

      var objectStore = db.createObjectStore('homework_os', { keyPath: 'id', autoIncrement:true });
      objectStore.createIndex('homework', 'homework', { unique: false });

      var objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement:true });
      objectStore.createIndex('notes', 'notes', { unique: false });

      console.log('Database setup complete');
  };

  if (updateSubjects != null) { //tests if exists - crashes badly if form doesn't exist
      updateSubjects.onsubmit = updateSubjectData;
  }

};
