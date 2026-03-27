/**
 * The Boredom Button
 * A minimalist site for micro-adventures
 */

// ============================================================================
// STATE
// ============================================================================

let tasks = [];
let selectedLocation = null;
let selectedSocial = null;
let currentTask = null;
let timerInterval = null;
let secondsLeft = 0;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const selectionScreen = document.getElementById('selectionScreen');
const taskScreen = document.getElementById('taskScreen');
const infoModal = document.getElementById('infoModal');

const tiles = document.querySelectorAll('.tile');
const rollBtn = document.getElementById('rollBtn');
const doneBtn = document.getElementById('doneBtn');
const infoBtn = document.getElementById('infoBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const taskText = document.getElementById('taskText');
const taskSubtitle = document.getElementById('taskSubtitle');
const timer = document.getElementById('timer');

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadTasks();
  attachEventListeners();
});

async function loadTasks() {
  try {
    const response = await fetch('tasks.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    tasks = await response.json();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    // Fallback: create minimal task for demonstration
    tasks = [];
  }
}

function attachEventListeners() {
  // Tile selection
  tiles.forEach((tile) => {
    tile.addEventListener('click', handleTileClick);
  });

  // Buttons
  rollBtn.addEventListener('click', handleRoll);
  doneBtn.addEventListener('click', handleDone);
  infoBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);

  // Modal close on background click
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      closeModal();
    }
  });

  // Keyboard: Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ============================================================================
// TILE SELECTION
// ============================================================================

function handleTileClick(e) {
  const clickedTile = e.currentTarget;
  const group = clickedTile.closest('.tile-group');
  const groupType = group.dataset.group;
  const value = clickedTile.dataset.value;

  // Remove selected state from siblings
  group.querySelectorAll('.tile').forEach((tile) => {
    tile.classList.remove('selected');
  });

  // Add selected state to clicked tile
  clickedTile.classList.add('selected');

  // Update state
  if (groupType === 'location') {
    selectedLocation = value;
  } else if (groupType === 'social') {
    selectedSocial = value;
  }

  // Check if both selections are made
  updateRollBtnState();
}

function updateRollBtnState() {
  if (selectedLocation && selectedSocial) {
    rollBtn.disabled = false;
    rollBtn.classList.add('active');
  } else {
    rollBtn.disabled = true;
    rollBtn.classList.remove('active');
  }
}

// ============================================================================
// BUILD CONTEXT & GET RANDOM TASK
// ============================================================================

function buildContext() {
  return `${selectedLocation}_${selectedSocial}`;
}

function getRandomTask(context) {
  // Filter tasks by context
  const contextTasks = tasks.filter((task) => task.context === context);

  if (contextTasks.length === 0) {
    return null;
  }

  // Get seen IDs from localStorage
  const seenKey = `seen_${context}`;
  const seenStr = localStorage.getItem(seenKey);
  const seen = seenStr ? JSON.parse(seenStr) : [];

  // Filter available tasks (not yet seen)
  const availableTasks = contextTasks.filter((task) => !seen.includes(task.id));

  // If all tasks have been seen, reset the list
  if (availableTasks.length === 0) {
    localStorage.removeItem(seenKey);
    return contextTasks[Math.floor(Math.random() * contextTasks.length)];
  }

  // Return random available task
  return availableTasks[Math.floor(Math.random() * availableTasks.length)];
}

// ============================================================================
// ROLL THE DICE
// ============================================================================

function handleRoll() {
  const context = buildContext();
  const task = getRandomTask(context);

  if (!task) {
    console.error('No tasks available for context:', context);
    return;
  }

  currentTask = task;
  populateTaskScreen(task);
  switchToTaskScreen();
  startTimer(task.duration);
}

function populateTaskScreen(task) {
  // Render task text with highlight
  const renderedText = renderTaskWithHighlight(task.task, task.highlight);
  taskText.innerHTML = renderedText;

  // Set subtitle
  taskSubtitle.textContent = task.subtitle;

  // Reset timer display
  secondsLeft = task.duration * 60;
  updateTimerDisplay();
}

function renderTaskWithHighlight(text, highlight) {
  if (!highlight) {
    return text;
  }

  // Escape special regex characters
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.replace(regex, '<span class="highlight">$1</span>');
}

// ============================================================================
// TIMER
// ============================================================================

function startTimer(durationMinutes) {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  secondsLeft = durationMinutes * 60;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsLeft--;

    if (secondsLeft < 0) {
      secondsLeft = 0;
      clearInterval(timerInterval);
      timer.classList.add('timer--done');
      return;
    }

    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============================================================================
// DONE BUTTON
// ============================================================================

function handleDone() {
  // Clear timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Mark task as seen
  if (currentTask) {
    const context = buildContext();
    const seenKey = `seen_${context}`;
    const seenStr = localStorage.getItem(seenKey);
    const seen = seenStr ? JSON.parse(seenStr) : [];

    if (!seen.includes(currentTask.id)) {
      seen.push(currentTask.id);
      localStorage.setItem(seenKey, JSON.stringify(seen));
    }
  }

  // Reset state
  resetSelections();

  // Switch screens
  switchToSelectionScreen();
}

function resetSelections() {
  selectedLocation = null;
  selectedSocial = null;
  currentTask = null;

  // Deselect all tiles
  tiles.forEach((tile) => {
    tile.classList.remove('selected');
  });

  // Disable roll button
  rollBtn.disabled = true;
  rollBtn.classList.remove('active');

  // Clear timer visual state
  timer.classList.remove('timer--done');
}

// ============================================================================
// SCREEN SWITCHING
// ============================================================================

function switchToTaskScreen() {
  selectionScreen.classList.remove('screen--visible');
  taskScreen.classList.add('screen--visible');
}

function switchToSelectionScreen() {
  taskScreen.classList.remove('screen--visible');
  selectionScreen.classList.add('screen--visible');
}

// ============================================================================
// MODAL
// ============================================================================

function openModal() {
  infoModal.classList.add('active');
}

function closeModal() {
  infoModal.classList.remove('active');
}
