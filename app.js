/**
 * The Boredom Button — app.js
 * One micro-adventure. No options. Just go.
 */

// ── Copy libraries ──────────────────────────────────────────────────────────

const LOADING_PHRASES = [
  'TRIANGULATING YOUR REALITY...',
  'CONSULTING THE OFFLINE ORACLE...',
  'SCANNING NEARBY GRASS...',
  'CALCULATING OPTIMAL AWKWARDNESS...',
  'DETECTING SIGNS OF LIFE...',
  'OVERRIDING AUTOPILOT...',
  'LOADING THE REAL WORLD...',
  'SUMMONING YOUR INNER FIVE-YEAR-OLD...',
  'BYPASSING THE ALGORITHM...',
  'REROUTING AWAY FROM THE COUCH...',
  'INITIALIZING ADVENTURE PROTOCOL...',
  'ACCESSING THE ADVENTURE ARCHIVE...',
  'LOCATING SOMETHING WORTH DOING...',
  'CALIBRATING BOREDOM DETECTOR...',
  'COMPILING REASONS TO GET UP...',
  'DEPLOYING ANTI-SCROLL MEASURES...',
  'QUERYING THE REAL WORLD DATABASE...',
  'UNLOCKING HIDDEN HUMAN POTENTIAL...',
  'CROSS-REFERENCING YOUR SITUATION...',
  'SEARCHING FOR MEANING...',
];

const SUCCESS_PHRASES = [
  'THAT JUST HAPPENED.',
  'YOU ACTUALLY DID IT.',
  'EXISTENCE CONFIRMED.',
  'CERTIFICATE OF ALIVENESS ISSUED.',
  'TOUCH GRASS: ACHIEVED.',
  'YOU ARE NOT A ROBOT.',
  'THAT WAS REAL LIFE.',
  'IMPRESSIVE HUMANOID BEHAVIOR.',
  'YOUR PHONE IS JEALOUS.',
  'REALITY POINTS ADDED.',
  'OFFLINE MODE: ACTIVATED.',
  'HUMAN CONFIRMED.',
  'THE COUCH IS DISAPPOINTED IN YOU.',
  'YOU JUST LIVED A LITTLE.',
  'BATTERY NOT REQUIRED.',
  'NO WIFI NEEDED.',
  'THE ALGORITHM CANNOT TRACK THIS.',
  'YOU BEAT BOREDOM TODAY.',
  'WELL DONE, FLESH CREATURE.',
  'ANALOG ACHIEVEMENT UNLOCKED.',
  'SCREEN TIME: DEFEATED.',
  'YOU ARE DANGEROUSLY FUNCTIONAL.',
  'TASK ACCEPTED AND CONQUERED.',
  'THE OUTSIDE WORLD SURVIVED YOUR VISIT.',
  'ACHIEVEMENT UNLOCKED: DOING STUFF.',
  'GO AHEAD, TELL SOMEONE ABOUT IT.',
  'YOUR ANCESTORS ARE PROUD.',
  'CIVILIZATION INTACT.',
  'LOOK AT YOU, BEING A PERSON.',
  'SCROLLING CANNOT COMPETE WITH THIS.',
  'YOU SHOWED UP AND THAT COUNTS.',
  'MISSION STATUS: CRUSHED.',
  'THE UNIVERSE NOTICED.',
  'UNPLUG COMPLETE.',
  'BODY: 1. COUCH: 0.',
  'THIS IS WHAT MEMORIES ARE MADE OF.',
  'RARE ACHIEVEMENT UNLOCKED.',
  'YOUR FUTURE SELF THANKS YOU.',
  'GREAT SUCCESS.',
  'YOU DID THE THING.',
  'NOT HALF BAD, HUMAN.',
  'THE BOREDOM IS DEAD.',
  'YOU EXIST BEYOND THE SCREEN.',
  'REAL WORLD XP GAINED.',
  'ADVENTURE LOG UPDATED.',
  'MICRO-LEGEND STATUS LOADING.',
  'THE MOMENT HAS BEEN SEIZED.',
  'CARPE DIEM. YOU CARPED IT.',
  'FULL HUMANITY UNLOCKED.',
  'A MEMORY WAS JUST MADE.',
  'PROOF: YOU ARE NOT CONTENT.',
  'YOU JUST DID SOMETHING.',
  '20 MINUTES WELL SPENT.',
  'BOREDOM? WHAT BOREDOM?',
  'YOU CHOSE ACTION. RESPECT.',
  'SIGNAL RECEIVED AND EXECUTED.',
  'DIRECTIVE: COMPLETE.',
  'THE WIFI ROUTER WEEPS WITH ENVY.',
  'LIFE +1.',
  'CERTIFIED NOT BORING.',
  'SMALL MOMENT. BIG LIFE.',
  'YOU REMEMBERED HOW TO DO THINGS.',
  'PROGRESS REPORT: EXCELLENT.',
  'WORKING AS INTENDED.',
  'YOU WENT BEYOND THE SCREEN.',
  'OFFLINE VICTORY ACHIEVED.',
  'TASK FORCE: JUST YOU. RESULT: WIN.',
  'THIS IS YOUR PROTAGONIST ERA.',
  'HUMANITY: 1. BOREDOM: 0.',
  'AND JUST LIKE THAT, YOU LIVED.',
  'VALIDATED.',
  'SOMETHING HAPPENED TODAY.',
];

const RANKS = [
  { min: 0,   max: 0,   title: 'COUCH PHILOSOPHER' },
  { min: 1,   max: 3,   title: 'RELUCTANT MOVER' },
  { min: 4,   max: 10,  title: 'SUSPICIOUS OF OUTDOORS' },
  { min: 11,  max: 20,  title: 'MICRO-ADVENTURER' },
  { min: 21,  max: 40,  title: 'BOREDOM SLAYER' },
  { min: 41,  max: 60,  title: 'REALITY ENTHUSIAST' },
  { min: 61,  max: 80,  title: 'CERTIFIED HUMAN' },
  { min: 81,  max: 100, title: 'TOUCHED GRASS CHAMPION' },
  { min: 101, max: 150, title: 'ANALOG HERO' },
  { min: 151, max: 200, title: 'PROFESSIONAL NOT-BORED PERSON' },
  { min: 201, max: Infinity, title: 'LEGEND OF THE REAL WORLD' },
];

// ── State ───────────────────────────────────────────────────────────────────

let tasks          = [];
let selectedLoc    = null;   // 'outside' | 'inside'
let selectedSocial = null;   // 'alone'   | 'friends'
let currentTask    = null;
let timerInterval  = null;
let secondsLeft    = 0;
let overlayShown   = false;  // prevent double-triggering

// ── DOM refs ────────────────────────────────────────────────────────────────

const selectionScreen    = document.getElementById('selectionScreen');
const loadingScreen      = document.getElementById('loadingScreen');
const taskScreen         = document.getElementById('taskScreen');
const completionScreen   = document.getElementById('completionScreen');
const infoModal          = document.getElementById('infoModal');

const rollBtn              = document.getElementById('rollBtn');
const doneBtn              = document.getElementById('doneBtn');
const infoBtn              = document.getElementById('infoBtn');
const closeModalBtn        = document.getElementById('closeModalBtn');
const darkToggle           = document.getElementById('darkToggle');
const yesBtn               = document.getElementById('yesBtn');
const notThisTimeBtn       = document.getElementById('notThisTimeBtn');
const completionContinueBtn = document.getElementById('completionContinueBtn');

const taskTextEl           = document.getElementById('taskText');
const taskSubEl            = document.getElementById('taskSubtitle');
const timerEl              = document.getElementById('timer');
const timerDoneOverlay     = document.getElementById('timerDoneOverlay');
const overlayQuestionEl    = document.getElementById('overlayQuestion');
const loadingPhraseEl      = document.getElementById('loadingPhrase');
const completionContainer  = document.getElementById('completionContainer');
const completionPhraseEl   = document.getElementById('completionPhrase');
const completionCountEl    = document.getElementById('completionCount');
const completionRankEl     = document.getElementById('completionRank');
const completionStreakEl   = document.getElementById('completionStreak');

// ── Boot ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initDarkMode();
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

// ── Dark mode ───────────────────────────────────────────────────────────────

function initDarkMode() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
}

function onDarkToggle() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ── Events ──────────────────────────────────────────────────────────────────

function bindEvents() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', onTileClick);
  });

  rollBtn.addEventListener('click', onRoll);
  doneBtn.addEventListener('click', onDoneClick);
  darkToggle.addEventListener('click', onDarkToggle);

  yesBtn.addEventListener('click', onYes);
  notThisTimeBtn.addEventListener('click', onNotThisTime);
  completionContinueBtn.addEventListener('click', onCompletionContinue);

  infoBtn.addEventListener('click',       openModal);
  closeModalBtn.addEventListener('click', closeModal);
  infoModal.addEventListener('click', e => {
    if (e.target === infoModal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && infoModal.classList.contains('active')) closeModal();
  });
}

// ── Tile selection ──────────────────────────────────────────────────────────

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

// ── Context & random task ───────────────────────────────────────────────────

function buildContext() {
  return `${selectedLoc}_${selectedSocial}`;
}

function getRandomTask(context) {
  const pool = tasks.filter(t => t.context === context);
  if (!pool.length) return null;

  const seenKey  = `seen_${context}`;
  let   seen     = JSON.parse(localStorage.getItem(seenKey) || '[]');
  let   available = pool.filter(t => !seen.includes(t.id));

  if (!available.length) {
    localStorage.removeItem(seenKey);
    available = pool;
  }

  return available[Math.floor(Math.random() * available.length)];
}

// ── Roll → Loading → Task ───────────────────────────────────────────────────

function onRoll() {
  const context = buildContext();
  const task    = getRandomTask(context);
  if (!task) { console.warn('No tasks for context:', context); return; }

  currentTask = task;
  overlayShown = false;

  // Show loading screen with a random phrase
  const phrase = pickRandom(LOADING_PHRASES);
  loadingPhraseEl.textContent = phrase;
  showScreen(loadingScreen, selectionScreen);

  // After brief pause reveal the task
  setTimeout(() => {
    renderTask(task);
    showScreen(taskScreen, loadingScreen);
    startTimer(task.duration);
  }, 1700);
}

function renderTask(task) {
  taskTextEl.innerHTML  = highlightText(task.task, task.highlight);
  taskSubEl.textContent = task.subtitle || '';
  timerEl.classList.remove('timer--done');
  timerDoneOverlay.classList.remove('active');
  timerDoneOverlay.setAttribute('aria-hidden', 'true');
}

function highlightText(text, highlight) {
  if (!highlight) return text;
  const safe = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${safe})`), '<span class="highlight">$1</span>');
}

// ── Timer ───────────────────────────────────────────────────────────────────

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
      renderTimer();
      // Give the red colour a moment to land, then show the overlay
      setTimeout(() => showOverlay(true), 1400);
      return;
    }
    renderTimer();
  }, 1000);
}

function renderTimer() {
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');
  timerEl.textContent = `${m}:${s}`;
}

// ── Done button (manual, mid-task) ──────────────────────────────────────────

function onDoneClick() {
  clearInterval(timerInterval);
  showOverlay(false);
}

// ── Did You Do It overlay ───────────────────────────────────────────────────

function showOverlay(timerEnded) {
  if (overlayShown) return;
  overlayShown = true;

  overlayQuestionEl.textContent = timerEnded
    ? 'TIME\'S UP.\nDID YOU DO IT?'
    : 'DID YOU DO IT?';

  timerDoneOverlay.classList.add('active');
  timerDoneOverlay.setAttribute('aria-hidden', 'false');
}

function hideOverlay() {
  timerDoneOverlay.classList.remove('active');
  timerDoneOverlay.setAttribute('aria-hidden', 'true');
}

// YES ── mark seen, record completion, show celebration
function onYes() {
  hideOverlay();
  markTaskSeen();
  const { total, streak } = recordCompletion();
  showCompletionScreen(total, streak);
}

// NOT THIS TIME ── mark seen, quietly return to home
function onNotThisTime() {
  hideOverlay();
  markTaskSeen();
  resetAndGoHome(taskScreen);
}

// ── Completion screen ───────────────────────────────────────────────────────

function showCompletionScreen(total, streak) {
  const phrase = pickRandom(SUCCESS_PHRASES);
  completionPhraseEl.textContent  = phrase;
  completionCountEl.textContent   = `TASK #${total}`;
  completionRankEl.textContent    = getRank(total);

  if (streak > 1) {
    completionStreakEl.textContent = `${streak}-DAY STREAK`;
    completionStreakEl.style.display = '';
  } else if (streak === 1) {
    completionStreakEl.textContent = 'FIRST TASK OF THE DAY';
    completionStreakEl.style.display = '';
  } else {
    completionStreakEl.style.display = 'none';
  }

  // Reset animation state, then trigger after screen is visible
  completionContainer.classList.remove('is-animating');
  showScreen(completionScreen, taskScreen);
  setTimeout(() => completionContainer.classList.add('is-animating'), 30);
}

function onCompletionContinue() {
  resetAndGoHome(completionScreen);
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function markTaskSeen() {
  if (!currentTask) return;
  const seenKey = `seen_${buildContext()}`;
  const seen    = JSON.parse(localStorage.getItem(seenKey) || '[]');
  if (!seen.includes(currentTask.id)) {
    seen.push(currentTask.id);
    localStorage.setItem(seenKey, JSON.stringify(seen));
  }
}

function resetAndGoHome(outgoing) {
  selectedLoc    = null;
  selectedSocial = null;
  currentTask    = null;
  overlayShown   = false;
  document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
  refreshRollBtn();
  showScreen(selectionScreen, outgoing);
}

// ── Streak & stats ──────────────────────────────────────────────────────────

function getTodayString() {
  return new Date().toISOString().split('T')[0];  // 'YYYY-MM-DD'
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function recordCompletion() {
  const today    = getTodayString();
  const lastDate = localStorage.getItem('lastActivityDate') || '';
  let   streak   = parseInt(localStorage.getItem('currentStreak')  || '0', 10);
  let   total    = parseInt(localStorage.getItem('totalCompleted')  || '0', 10);

  if (lastDate === today) {
    // Already did something today — streak continues unchanged
  } else if (lastDate === getYesterdayString()) {
    streak++;  // consecutive day
  } else {
    streak = 1;  // gap or first time
  }

  total++;

  localStorage.setItem('lastActivityDate', today);
  localStorage.setItem('currentStreak',   String(streak));
  localStorage.setItem('totalCompleted',  String(total));

  return { total, streak };
}

// ── Rank ────────────────────────────────────────────────────────────────────

function getRank(count) {
  const rank = RANKS.find(r => count >= r.min && count <= r.max);
  return rank ? rank.title : 'COUCH PHILOSOPHER';
}

// ── Screen switching ────────────────────────────────────────────────────────

function showScreen(incoming, outgoing) {
  outgoing.classList.remove('screen--visible');
  incoming.classList.add('screen--visible');
}

// ── Modal ───────────────────────────────────────────────────────────────────

function openModal()  { infoModal.classList.add('active');    }
function closeModal() { infoModal.classList.remove('active'); }

// ── Utility ─────────────────────────────────────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}