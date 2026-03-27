/**
 * The Boredom Button — app.js
 * One micro-adventure. No options. Just go.
 */

// ── State ──────────────────────────────────────────────────────────────────

let tasks          = [];
let selectedLoc    = null;   // 'outside' | 'inside'
let selectedSocial = null;   // 'alone'   | 'friends'
let currentTask    = null;
let timerInterval  = null;
let secondsLeft    = 0;

// ── Keyword lists for UI detection ─────────────────────────────────────────

const WRITE_KEYWORDS = [
  'WRITE', 'LIST', 'DESCRIBE', 'DRAFT', 'NOTE', 'NOTES',
  'RECORD', 'JOT', 'COMPOSE', 'NAME EVERY', 'NAME ALL',
  'MAKE A LIST', 'WRITE DOWN', 'WRITE OUT'
];

const CAMERA_KEYWORDS = [
  'PHOTOGRAPH', 'PHOTO', 'CAPTURE', 'SHOOT', 'FILM',
  'TAKE A PICTURE', 'TAKE A PHOTO', 'DOCUMENT'
];

// ── DOM refs ───────────────────────────────────────────────────────────────

const selectionScreen = document.getElementById('selectionScreen');
const taskScreen      = document.getElementById('taskScreen');
const infoModal       = document.getElementById('infoModal');

const rollBtn       = document.getElementById('rollBtn');
const doneBtn       = document.getElementById('doneBtn');
const infoBtn       = document.getElementById('infoBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const taskTextEl = document.getElementById('taskText');
const taskSubEl  = document.getElementById('taskSubtitle');
const timerEl    = document.getElementById('timer');

// Write field
const writeArea  = document.getElementById('writeArea');
const writeField = document.getElementById('writeField');

// Camera
const cameraArea     = document.getElementById('cameraArea');
const cameraInput    = document.getElementById('cameraInput');
const cameraBtn      = document.getElementById('cameraBtn');
const photoPreview   = document.getElementById('photoPreview');
const photoImg       = document.getElementById('photoImg');
const removePhotoBtn = document.getElementById('removePhotoBtn');

// ── Boot ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadTasks();
  bindEvents();
});

async function loadTasks() {
  try {
    const res = await fetch('tasks.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tasks = await res.json();
  } catch (err) {
    console.error('Could not load tasks.json:', err);
    tasks = [];
  }
}

// ── Events ─────────────────────────────────────────────────────────────────

function bindEvents() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', onTileClick);
  });

  rollBtn.addEventListener('click', onRoll);
  doneBtn.addEventListener('click', onDone);

  infoBtn.addEventListener('click',       openModal);
  closeModalBtn.addEventListener('click', closeModal);
  infoModal.addEventListener('click', e => {
    if (e.target === infoModal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && infoModal.classList.contains('active')) closeModal();
  });

  // Camera button triggers the hidden file input
  cameraBtn.addEventListener('click', () => cameraInput.click());

  // When a photo is selected, show the preview
  cameraInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    photoImg.src = url;
    photoPreview.classList.remove('extra-area--hidden');
  });

  // Remove photo
  removePhotoBtn.addEventListener('click', () => {
    if (photoImg.src) URL.revokeObjectURL(photoImg.src);
    photoImg.src    = '';
    cameraInput.value = '';
    photoPreview.classList.add('extra-area--hidden');
  });
}

// ── Tile selection ─────────────────────────────────────────────────────────

function onTileClick(e) {
  const tile      = e.currentTarget;
  const group     = tile.closest('.tile-group');
  const groupType = group.dataset.group;
  const value     = tile.dataset.value;

  group.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
  tile.classList.add('selected');

  if (groupType === 'location') selectedLoc    = value;
  else                          selectedSocial = value;

  refreshRollBtn();
}

function refreshRollBtn() {
  const ready = selectedLoc && selectedSocial;
  rollBtn.disabled = !ready;
  rollBtn.setAttribute('aria-disabled', String(!ready));
  rollBtn.classList.toggle('active', !!ready);
}

// ── Context & random task ──────────────────────────────────────────────────

function buildContext() {
  return `${selectedLoc}_${selectedSocial}`;
}

function getRandomTask(context) {
  const pool = tasks.filter(t => t.context === context);
  if (!pool.length) return null;

  const seenKey = `seen_${context}`;
  let seen      = JSON.parse(localStorage.getItem(seenKey) || '[]');
  let available = pool.filter(t => !seen.includes(t.id));

  if (!available.length) {
    localStorage.removeItem(seenKey);
    available = pool;
  }

  return available[Math.floor(Math.random() * available.length)];
}

// ── Keyword detection ──────────────────────────────────────────────────────

function detectTaskUI(taskText) {
  const text = taskText.toUpperCase();
  return {
    needsWrite:  WRITE_KEYWORDS.some(kw  => text.includes(kw)),
    needsCamera: CAMERA_KEYWORDS.some(kw => text.includes(kw))
  };
}

// Returns true if this is a touch-only device (phone/tablet)
function isTouchDevice() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

// ── Extra UI (write / camera) ──────────────────────────────────────────────

function setupExtras(task) {
  const { needsWrite, needsCamera } = detectTaskUI(task.task);

  // Write field
  writeField.value = '';
  writeArea.classList.toggle('extra-area--hidden', !needsWrite);

  // Camera
  if (photoImg.src) URL.revokeObjectURL(photoImg.src);
  photoImg.src      = '';
  cameraInput.value = '';
  photoPreview.classList.add('extra-area--hidden');
  cameraArea.classList.toggle('extra-area--hidden', !needsCamera);

  // Label the camera button based on device type
  if (needsCamera) {
    if (isTouchDevice()) {
      cameraInput.setAttribute('capture', 'environment');
      cameraBtn.textContent = 'OPEN CAMERA';
    } else {
      cameraInput.removeAttribute('capture');
      cameraBtn.textContent = 'ATTACH PHOTO';
    }
  }
}

function clearExtras() {
  writeField.value = '';
  writeArea.classList.add('extra-area--hidden');

  if (photoImg.src) URL.revokeObjectURL(photoImg.src);
  photoImg.src      = '';
  cameraInput.value = '';
  photoPreview.classList.add('extra-area--hidden');
  cameraArea.classList.add('extra-area--hidden');
}

// ── Roll ───────────────────────────────────────────────────────────────────

function onRoll() {
  const context = buildContext();
  const task    = getRandomTask(context);
  if (!task) { console.warn('No tasks for context:', context); return; }

  currentTask = task;
  renderTask(task);
  setupExtras(task);
  showScreen(taskScreen, selectionScreen);
  startTimer(task.duration);
}

function renderTask(task) {
  taskTextEl.innerHTML  = highlightText(task.task, task.highlight);
  taskSubEl.textContent = task.subtitle;
  timerEl.classList.remove('timer--done');
}

function highlightText(text, highlight) {
  if (!highlight) return text;
  const safe = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${safe})`), '<span class="highlight">$1</span>');
}

// ── Timer ──────────────────────────────────────────────────────────────────

function startTimer(minutes) {
  clearInterval(timerInterval);
  secondsLeft = minutes * 60;
  renderTimer();

  timerInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      secondsLeft = 0;
      clearInterval(timerInterval);
      timerEl.classList.add('timer--done');
    }
    renderTimer();
  }, 1000);
}

function renderTimer() {
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');
  timerEl.textContent = `${m}:${s}`;
}

// ── Done ───────────────────────────────────────────────────────────────────

function onDone() {
  clearInterval(timerInterval);

  if (currentTask) {
    const seenKey = `seen_${buildContext()}`;
    const seen    = JSON.parse(localStorage.getItem(seenKey) || '[]');
    if (!seen.includes(currentTask.id)) {
      seen.push(currentTask.id);
      localStorage.setItem(seenKey, JSON.stringify(seen));
    }
  }

  clearExtras();

  selectedLoc    = null;
  selectedSocial = null;
  currentTask    = null;
  document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
  refreshRollBtn();

  showScreen(selectionScreen, taskScreen);
}

// ── Screen switching ───────────────────────────────────────────────────────

function showScreen(incoming, outgoing) {
  outgoing.classList.remove('screen--visible');
  incoming.classList.add('screen--visible');
}

// ── Modal ──────────────────────────────────────────────────────────────────

function openModal()  { infoModal.classList.add('active');    }
function closeModal() { infoModal.classList.remove('active'); }