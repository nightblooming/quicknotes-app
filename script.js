// ==========================================================================
// 1. Element Selectors & State
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

// Central notes array initialized from storage
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
// 3. UI Helpers
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

/**
 * Returns a clean, human-readable date and time string.
 */
function getReadableTimestamp() {
  const now = new Date();
  return now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// ==========================================================================
// 4. Render Function
// ==========================================================================
function render() {
  notesList.replaceChildren();

  const query = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(query)
  );

  updateCount(filteredNotes.length);

  filteredNotes.forEach((note) => {
    const li = document.createElement('li');
    li.className = `note-card category-${note.category.toLowerCase()}`;

    // Wrapper for note content
    const contentWrap = document.createElement('div');
    contentWrap.className = 'note-content-wrap';

    // Note body text
    const p = document.createElement('p');
    p.className = 'note-text';
    p.textContent = note.text;

    // Metadata bar: category badge + human-readable timestamp
    const metaWrap = document.createElement('div');
    metaWrap.className = 'note-meta';
    metaWrap.style.display = 'flex';
    metaWrap.style.gap = '0.75rem';
    metaWrap.style.alignItems = 'center';

    const categoryTag = document.createElement('span');
    categoryTag.className = 'note-tag';
    categoryTag.textContent = note.category;

    const dateDisplay = document.createElement('time');
    dateDisplay.className = 'note-date';
    dateDisplay.style.fontSize = '0.75rem';
    dateDisplay.style.color = 'var(--text-muted, #64748b)';
    dateDisplay.textContent = note.createdAt;

    metaWrap.append(categoryTag, dateDisplay);
    contentWrap.append(p, metaWrap);

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
    text: text,
    category: category,
    createdAt: getReadableTimestamp()
  };

  notes.unshift(newNote);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

// ==========================================================================
// 6. Event Listeners
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

  // Clear validation error if any
  setError('');

  // Add note object, persist & re-render
  addNote(trimmedText, noteCategory.value);

  // Clear input and return focus
  noteInput.value = '';
  noteInput.focus();
});

noteInput.addEventListener('input', () => {
  if (errorMessage.textContent) {
    setError('');
  }
});

searchInput.addEventListener('input', () => {
  render();
});

// ==========================================================================
// 7. Initial Run
// ==========================================================================
render();