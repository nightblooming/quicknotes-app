// ==========================================================================
// 1. DOM Elements & State
// ==========================================================================
const noteForm = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const noteCategory = document.querySelector('#note-category');
const errorMessage = document.querySelector('#error-message');
const searchInput = document.querySelector('#search-input');
const notesList = document.querySelector('#notes-list');
const noteCount = document.querySelector('#note-count');

const STORAGE_KEY = 'quick_notes_data';
const MAX_NOTE_LENGTH = 200;

// Central notes array
let notes = loadNotes();

// ==========================================================================
// 2. Storage Helpers
// ==========================================================================
function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Error loading notes from localStorage:', err);
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Error saving notes to localStorage:', err);
  }
}

// ==========================================================================
// 3. UI Helpers: Counter & Error Messages
// ==========================================================================
function updateCount(count) {
  if (count === 0) {
    noteCount.textContent = 'No notes';
  } else if (count === 1) {
    noteCount.textContent = '1 note';
  } else {
    noteCount.textContent = `${count} notes`;
  }
}

function setError(message = '') {
  errorMessage.textContent = message;
}

// ==========================================================================
// 4. Render Function
// ==========================================================================
function render() {
  // Clear existing items
  notesList.replaceChildren();

  const query = searchInput.value.trim().toLowerCase();

  // Filter notes matching search query
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(query)
  );

  // Update dynamic count indicator
  updateCount(filteredNotes.length);

  // Rebuild list using createElement & textContent (XSS-safe)
  filteredNotes.forEach((note) => {
    const li = document.createElement('li');
    li.className = `note-card category-${note.category.toLowerCase()}`;

    // Content container
    const contentWrap = document.createElement('div');
    contentWrap.className = 'note-content-wrap';

    const p = document.createElement('p');
    p.className = 'note-text';
    p.textContent = note.text; // Safe text insertion

    const tag = document.createElement('span');
    tag.className = 'note-tag';
    tag.textContent = note.category;

    contentWrap.append(p, tag);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-note-btn';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete note: ${note.text.slice(0, 20)}...`);

    deleteBtn.addEventListener('click', () => {
      deleteNote(note.id);
    });

    li.append(contentWrap, deleteBtn);
    notesList.appendChild(li);
  });
}

// ==========================================================================
// 5. Actions: Add & Delete
// ==========================================================================
function addNote(text, category) {
  const newNote = {
    id: Date.now().toString(),
    text,
    category,
    createdAt: new Date().toISOString()
  };

  notes.unshift(newNote); // Prepend so latest notes show first
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

// ==========================================================================
// 6. Event Handlers
// ==========================================================================
noteForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const trimmedText = noteInput.value.trim();

  // Validation
  if (trimmedText === '') {
    setError('Note cannot be empty.');
    noteInput.focus();
    return;
  }

  if (trimmedText.length > MAX_NOTE_LENGTH) {
    setError(`Note cannot exceed ${MAX_NOTE_LENGTH} characters (currently ${trimmedText.length}).`);
    noteInput.focus();
    return;
  }

  // Clear previous errors and add note
  setError('');
  addNote(trimmedText, noteCategory.value);

  // Reset input field
  noteInput.value = '';
  noteInput.focus();
});

// Clear error state while the user types
noteInput.addEventListener('input', () => {
  if (errorMessage.textContent) {
    setError('');
  }
});

// Search input listener
searchInput.addEventListener('input', () => {
  render();
});

// ==========================================================================
// 7. Initial Page Load
// ==========================================================================
render();