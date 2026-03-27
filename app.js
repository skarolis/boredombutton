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

// ── DOM refs ───────────────────────────────────────────────────────────────

const selectionScreen = document.getElementById('selectionScreen');
const taskScreen      = document.getElementById('taskScreen');
const infoModal       = document.getElementById('infoModal');

const rollBtn       = document.getElementById('rollBtn');
const doneBtn       = document.getElementById('doneBtn');
const infoBtn       = document.getElementById('infoBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const taskTextEl    = document.getElementById('taskText');
const taskSubEl     = document.getElementById('taskSubtitle');
const timerEl       = document.getElementById('timer');

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
  // Tile clicks
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', onTileClick);
  });

  // Action buttons
  rollBtn.addEventListener('click', onRoll);
  doneBtn.addEventListener('click', onDone);

  // Modal
  infoBtn.addEventListener('click',       openModal);
  closeModalBtn.addEventListener('click', closeModal);
  infoModal.addEventListener('click', e => {
    if (e.target === infoModal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && infoModal.classList.contains('active')) closeModal();
  });
}

// ── Tile selection ─────────────────────────────────────────────────────────

function onTileClick(e) {
  const tile      = e.currentTarget;
  const group     = tile.closest('.tile-group');
  const groupType = group.dataset.group;   // 'location' | 'social'
  const value     = tile.dataset.value;    // 'outside' | 'inside' | 'alone' | 'friends'

  // Deselect siblings
  group.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
  // Select this one
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
  // Produces: 'outside_alone' | 'outside_friends' | 'inside_alone' | 'inside_friends'
}

function getRandomTask(context) {
  const pool = tasks.filter(t => t.context === context);
  if (!pool.length) return null;

  const seenKey = `seen_${context}`;
  let seen = JSON.parse(localStorage.getItem(seenKey) || '[]');

  let available = pool.filter(t => !seen.includes(t.id));

  // Cycled through entire pool — reset and start fresh
  if (!available.length) {
    localStorage.removeItem(seenKey);
    available = pool;
  }

  return available[Math.floor(Math.random() * available.length)];
}

// ── Roll ───────────────────────────────────────────────────────────────────

function onRoll() {
  const context = buildContext();
  const task    = getRandomTask(context);
  if (!task) { console.warn('No tasks for context:', context); return; }

  currentTask = task;
  renderTask(task);
  showScreen(taskScreen, selectionScreen);
  startTimer(task.duration);
}

function renderTask(task) {
  taskTextEl.innerHTML = highlightText(task.task, task.highlight);
  taskSubEl.textContent = task.subtitle;
  timerEl.classList.remove('timer--done');
}

function highlightText(text, highlight) {
  if (!highlight) return text;
  const safe  = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  // Mark task as seen
  if (currentTask) {
    const seenKey = `seen_${buildContext()}`;
    const seen    = JSON.parse(localStorage.getItem(seenKey) || '[]');
    if (!seen.includes(currentTask.id)) {
      seen.push(currentTask.id);
      localStorage.setItem(seenKey, JSON.stringify(seen));
    }
  }

  // Reset selection state
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