/////////////////////
//  Element Selectors
/////////////////////
const mainAppContainer = document.querySelector('.app');
const createNoteButton = document.querySelector('.app__controls__icon');
const clearAllNotesButton = document.querySelector('.app__controls__icon-bin');
const createNotePopup = document.querySelector('.note__create');
const closeCreateNotePopup = document.querySelector('.note__create-close');
const deleteAllNotesPopup = document.querySelector('.notes__delete');
const deleteAllNotesConfirm = document.querySelector('.notes__delete__button');
const closeDeleteAllNotesPopup = document.querySelector('.notes__delete-close');
const form = document.querySelector('#form');
const notesContainer = document.querySelector('.app__notes');
const shortcut = document.querySelector('.shortcut');
const shortcutButton = document.querySelector('.shortcut__button');

let notes = [];

populateNoteList(getNotes());


function createNote() {
    // Grab text input data
    let textData = document.querySelector('.note__create__input').value;
    if (textData === '') return;
    
    // Clear text input
    document.querySelector('.note__create__input').value = '';
    
    let date = getDate();
    let note = {
      id: randomId(), 
      text: textData,
      date: date
    }

    notes = getNotes();
    notes.unshift(note); 
    storeNotes();
    exitCreateNote();
    populateNoteList(getNotes());
}

function populateNoteList(items) {
  if (localStorage.getItem('notes') === null || items === null) return;
  let notesList = items;
  notesContainer.innerHTML = notesList.map((note) => {
    return `
    <div class="note__content">
    <div class="note__content-date">${note.date}</div>
    <div class="note__content-note">
      <p>${note.text}</p>
    </div>
    <div data-edit="${note.id}" class="note__content-edit">
              <svg class="note__content-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <title>Edit Note</title>
<path d="M12 20l4-2 14-14-2-2-14 14-2 4zM9.041 27.097c-0.989-2.085-2.052-3.149-4.137-4.137l3.097-8.525 4-2.435 12-12h-6l-12 12-6 20 20-6 12-12v-6l-12 12-2.435 4z"></path>
              </svg>
    </div>
    <div data-id="${note.id}" class="note__content-delete">
             <svg class="note__content-icon-bin" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <title>Delete Note</title>
<path d="M4 10v20c0 1.1 0.9 2 2 2h18c1.1 0 2-0.9 2-2v-20h-22zM10 28h-2v-14h2v14zM14 28h-2v-14h2v14zM18 28h-2v-14h2v14zM22 28h-2v-14h2v14z"></path>
<path d="M26.5 4h-6.5v-2.5c0-0.825-0.675-1.5-1.5-1.5h-7c-0.825 0-1.5 0.675-1.5 1.5v2.5h-6.5c-0.825 0-1.5 0.675-1.5 1.5v2.5h26v-2.5c0-0.825-0.675-1.5-1.5-1.5zM18 4h-6v-1.975h6v1.975z"></path>
              </svg>
    </div>
  </div>
  `;
  }).join('');
  addListeners();
}


/////////////////////
// Helper functions
/////////////////////
function getDate() {
  return new Date().toJSON().slice(0,10).replace(/-/g,'/'); // get current date
}

function getNotes() {
  if (localStorage.getItem('notes') !== null) {
    let jsonNotes = localStorage.getItem('notes');
    return JSON.parse(jsonNotes);
  } else {
    return [];
  }
}

function storeNotes() {
  let jsonNotes = JSON.stringify(notes);
  localStorage.setItem('notes', jsonNotes);
}

function exitCreateNote() {
  // Hide create note popup
  createNotePopup.style.display = 'none';
  createNotePopup.style.visibility = 'hidden';
  // Clear text input
  let textData = document.querySelector('.note__create__input').value = '';
}

function exitDeleteAllNotes() {
  deleteAllNotesPopup.style.display = 'none';
  deleteAllNotesPopup.style.visibility = 'hidden';
}

function randomId() {
  return Math.random().toString(36).substr(2, 16);
};

function clearAllNotes() {
  localStorage.clear();
  while (notesContainer.firstChild) {
    notesContainer.removeChild(notesContainer.firstChild);
  }
}

function addListeners() {
  let deleteButtons = Array.from(document.querySelectorAll('[data-id]'));
  let editButtons = Array.from(document.querySelectorAll('[data-edit]'));

  deleteButtons.forEach(function(e, i) {
      e.addEventListener('click', function(e) {
        let id = deleteButtons[i].dataset.id;
        let newNotes = getNotes().filter(note => note.id !== id);

        notes = newNotes;
        storeNotes();

        if (notes.length <= 0) {
          clearAllNotes();
        } else {
          populateNoteList(getNotes());
        }
      });
  });

  editButtons.forEach(function(e, i) {
    e.addEventListener('click', function(e) {
      let id = editButtons[i].dataset.edit;
      let newNote = getNotes().filter(note => note.id == id);
      let editPopup = `
        <div class="editNote">
          <form class="editForm" action="#">
            <input class="editNote__input" maxlength="48" type="text" value="${newNote[0].text}" required>
            <button class="editNote__button">Update note</button>
          </form>
          <span class="editNote-close">&#10006;</span>
        </div>
      `;

      // Prevent popup duplication
      if (document.querySelector('.editNote') == null) {
        // Insert update note popup into the DOM
        mainAppContainer.insertAdjacentHTML('afterbegin', editPopup);
      }
      
      document.querySelector('.editNote-close').addEventListener('click', () => {
        exitUpdateNote();
      });


      document.querySelector('.editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Prevent updating error if popup doesn't exist
        if (document.querySelector('.editNote') !== null) {
          // Grab text input data
          let textData = document.querySelector('.editNote__input').value;
          if (textData === '') return;

          updateNote(id, textData);
          exitUpdateNote();
        }
      });
    });
  });
}

function exitUpdateNote() {
  let popup = document.querySelector('.editNote');
  if (popup) {
    popup.parentNode.removeChild(popup);
  }
}

function updateNote(id, text) {
  let newText = text;
  let newDate = getDate();
  let newNotes = getNotes();
  let updatedNotes = newNotes.map(function(e) {
    if (e.id == id) {
      return  {
        id: e.id,
        text: newText,
        date: newDate
      }
    } else {
      return e;
    }
  });

  notes = updatedNotes;
  storeNotes();
  populateNoteList(getNotes());
}

function makeCreateNotePopupVisible() {
    createNotePopup.style.display = 'block';
    createNotePopup.style.visibility = 'visible';
}


/////////////////////
// Event Listeners
/////////////////////
createNoteButton.addEventListener('click', () => {
  makeCreateNotePopupVisible();
});

closeCreateNotePopup.addEventListener('click', () => {
  exitCreateNote();
});

form.addEventListener('submit', (e) => {
  e.preventDefault(); // preventing forms default actions
    createNote();
});

clearAllNotesButton.addEventListener('click', () => {
  if (localStorage.getItem('notes') !== null) {
    deleteAllNotesPopup.style.display = 'block';
    deleteAllNotesPopup.style.visibility = 'visible';
  }
});

closeDeleteAllNotesPopup.addEventListener('click', () => exitDeleteAllNotes());

deleteAllNotesConfirm.addEventListener('click', () => {
    exitDeleteAllNotes();
    clearAllNotes();
});

shortcutButton.addEventListener('click', () => {
  shortcut.style.display = 'none';
  shortcut.style.visibility = 'hidden';
});

////////////////////////
// Create Note shortcut (konami code)
///////////////////////
let sequenceCount = [];

window.addEventListener('keydown', (e) => {
  sequenceCount.push(e.keyCode);
  if (sequenceCount[0] !== 17) {
    sequenceCount = [];
  }

  if (sequenceCount.length === 3) {
    if (sequenceCount[0] === 17 && sequenceCount[1] === 16 && sequenceCount[2] === 107) {
      makeCreateNotePopupVisible();
      sequenceCount = [];
    } else {
      sequenceCount = [];
    }
  }
});
