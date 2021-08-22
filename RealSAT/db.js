var db;
const updateSubjects = document.getElementById("subject-submit");
var updateHomework = document.getElementById("homework-submit");
var currentData;



function updateHomeworkData() { //add and update

      alert("yay");


      var transaction = db.transaction(['homework_os'], 'readwrite');
      var objectStore = transaction.objectStore('homework_os');
      var request = objectStore.clear();

      var data = {...homeworkData};

      console.log(data);

      for (var i=0; i < data.homework.length; i++) {
              data.homework[i].subject.columnModules = "";
      }
      data.homeworkBySubject = "";
      data.addHomework = "";

      var newItem = data;

      console.log("bruh");

      var transaction = db.transaction(['homework_os'], 'readwrite');
      var objectStore = transaction.objectStore('homework_os');
      var request = objectStore.add(newItem);

      transaction.oncomplete = function() {
          console.log('Transaction completed: database modification finished.');
      }

      transaction.onerror = function() {
          console.log('Transaction not opened due to error');
      };


}

window.onload = function() {
    var request = window.indexedDB.open('client_db', 1);

    request.onerror = function() {
      console.log('Database failed to open');
    };

    request.onsuccess = function() {
      console.log('Database opened successfully');

    db = request.result;

    retrieveData();
  };

  request.onupgradeneeded = function(e) {
    var db = e.target.result;
    var objectStore = db.createObjectStore('subjects_os', { keyPath: 'id', autoIncrement:true });
    objectStore.createIndex('subject', 'subject', { unique: false });

    var objectStore = db.createObjectStore('homework_os', { keyPath: 'id', autoIncrement:true });
    objectStore.createIndex('homework', 'homework', { unique: false });

    console.log('Database setup complete');
  };

  if (updateSubjects != null) {
      updateSubjects.onsubmit = updateSubjectData;
  }


  function updateSubjectData(e) { //add and update

      alert("pog")

      e.preventDefault();

      var transaction = db.transaction(['subjects_os'], 'readwrite');
      var objectStore = transaction.objectStore('subjects_os');
      var request = objectStore.clear();

      var data = mySubjects;

      for (var i = 0; i < data.length; i++) {
            var newItem = data[i];
            newItem.columnModules = []; //this data cannot be serialised

            var transaction = db.transaction(['subjects_os'], 'readwrite');
            var objectStore = transaction.objectStore('subjects_os');
            var request = objectStore.add(newItem);

            transaction.oncomplete = function() {
                console.log('Transaction completed: database modification finished.');
            }

            transaction.onerror = function() {
                console.log('Transaction not opened due to error');
            };
      }
  }

  function retrieveData() {
          console.log("POGGGGGGGG")
          var dataReturn = {

          };
          var objectStores = ['subjects_os', 'homework_os'];
          for (var j=0; j < objectStores.length; j++) {
                console.log("looped")
                var objectStore = db.transaction(objectStores[j]).objectStore(objectStores[j]);
                var storeData = [];
                dataReturn[objectStores[j]] = storeData;
                objectStore.openCursor().onsuccess = function(e) {
                    var cursor = e.target.result;

                    if (cursor) {
                      
                        //console.log(cursor.value.subject);
                        console.log(j)
                        console.log(objectStores[j])
                        console.log(cursor.value)
                        storeData.push(cursor.value);
                        //mySubjects.push(cursor.value.subject);
                        cursor.continue();
                    } else {

                    }
                };
          }
          console.log('Finished.');
          receiveData(dataReturn);
    }


};

function receiveData(data) {
      console.log("Data received.");
      console.log(data);
      currentData = data;
}
