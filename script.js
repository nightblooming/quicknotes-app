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

// Load notes from localStorage on page open
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
    noteCount.textContent = 'You have no notes yet.';
  } else if (count === 1) {
    noteCount.textContent = 'You have 1 note.';
  } else {
    noteCount.textContent = `You have ${count} notes.`;
  }
}

function setError(message = '') {
  errorMessage.textContent = message;
}

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

  // Case-insensitive filtering against note text
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(query)
  );

  // Update counter to reflect count of current visible results
  updateCount(filteredNotes.length);

  // If user searched for something and no notes matched
  if (filteredNotes.length === 0 && query !== '') {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-search-message';
    emptyLi.style.textAlign = 'center';
    emptyLi.style.padding = '1.5rem';
    emptyLi.style.color = 'var(--text-muted, #64748b)';
    emptyLi.style.fontStyle = 'italic';
    emptyLi.textContent = 'No notes match your search.';
    notesList.appendChild(emptyLi);
    return;
  }

  filteredNotes.forEach((note) => {
    const li = document.createElement('li');
    li.className = `note-card category-${note.category.toLowerCase()}`;

    // Note content wrapper
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
// 5. Actions: Add & Delete (Mutate + Save + Render)
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

  if (trimmedText === '') {
    setError('Please type a note first.');
    noteInput.focus();
    return;
  }

  if (trimmedText.length > MAX_NOTE_LENGTH) {
    setError('Notes must be 200 characters or fewer.');
    noteInput.focus();
    return;
  }

  setError('');
  addNote(trimmedText, noteCategory.value);

  noteInput.value = '';
  noteInput.focus();
});

// Clear error notice when user resumes typing
noteInput.addEventListener('input', () => {
  if (errorMessage.textContent) {
    setError('');
  }
});

// Real-time case-insensitive search
searchInput.addEventListener('input', () => {
  render();
});

// ==========================================================================
// 7. Initial Load
// ==========================================================================
render();