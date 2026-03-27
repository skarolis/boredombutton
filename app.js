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

// ── Keyword lists for UI detection ─────────────────────────────────────────

const WRITE_KEYWORDS  = ['WRITE', 'LIST', 'DESCRIBE', 'DRAFT', 'NOTE', 'RECORD',
                          'COMPOSE', 'JOURNAL', 'JOT', 'SKETCH'];
const CAMERA_KEYWORDS = ['PHOTOGRAPH', 'CAPTURE', 'SHOOT', 'FILM', 'DOCUMENT',
                          'TAKE A PHOTO', 'PICTURE', 'SNAP'];

// ── State ───────────────────────────────────────────────────────────────────

let tasks          = [];
let selectedLoc    = null;   // 'outside' | 'inside'
let selectedSocial = null;   // 'alone'   | 'friends'
let currentTask    = null;
let timerInterval  = null;
let secondsLeft    = 0;
let overlayShown   = false;  // prevent double-triggering
let capturedFile    = null;   // File object from camera / file picker
let capturedObjUrl  = null;   // object URL for preview (revoked on reset)
let pendingCardType = null;   // 'writing' | 'photo' | null — set when entering completion screen
let pendingTaskText = '';     // task text saved before currentTask is cleared

// Detect once: coarse pointer = touchscreen = mobile
const isMobileDevice = window.matchMedia('(pointer: coarse)').matches;

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
const writeField           = document.getElementById('writeField');
const notesArea            = document.getElementById('notesArea');
const cameraField          = document.getElementById('cameraField');
const cameraInput          = document.getElementById('cameraInput');
const cameraBtn            = document.getElementById('cameraBtn');
const photoPreview         = document.getElementById('photoPreview');
const capturedPhotoEl      = document.getElementById('capturedPhoto');
const createCardBtn        = document.getElementById('createCardBtn');
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
  initCamera();
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

// ── Camera / file picker setup ──────────────────────────────────────────────

function initCamera() {
  // On mobile: go straight to camera. On desktop: open file picker.
  if (isMobileDevice) {
    cameraInput.setAttribute('capture', 'environment');
  }

  cameraBtn.addEventListener('click', () => cameraInput.click());

  cameraInput.addEventListener('change', () => {
    const file = cameraInput.files[0];
    if (!file) return;

    // Release previous object URL to avoid memory leaks
    if (capturedObjUrl) URL.revokeObjectURL(capturedObjUrl);

    capturedFile   = file;
    capturedObjUrl = URL.createObjectURL(file);

    capturedPhotoEl.src = capturedObjUrl;
    photoPreview.classList.remove('hidden');
    cameraBtn.textContent = isMobileDevice ? 'RETAKE ›' : 'CHANGE PHOTO ›';
  });
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
  createCardBtn.addEventListener('click', onCreateCard);

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
  setupTaskFields(task.task);
}

function setupTaskFields(taskText) {
  const upper = taskText.toUpperCase();

  // Use word-boundary matching to avoid false positives
  // (e.g. 'LIST' should not match 'LISTEN', 'NOTE' should not match 'NOTABLE')
  const needsWrite  = WRITE_KEYWORDS.some(k  => matchesWord(upper, k));
  const needsCamera = CAMERA_KEYWORDS.some(k => matchesWord(upper, k));

  // Never show both — camera takes priority if a task somehow triggers both
  const showCamera = needsCamera;
  const showWrite  = needsWrite && !needsCamera;

  writeField.classList.toggle('visible', showWrite);
  notesArea.value = '';

  cameraField.classList.toggle('visible', showCamera);
  cameraBtn.textContent = isMobileDevice ? 'OPEN CAMERA' : 'ATTACH PHOTO';
  photoPreview.classList.add('hidden');
  capturedPhotoEl.src = '';
  cameraInput.value = '';
  if (capturedObjUrl) { URL.revokeObjectURL(capturedObjUrl); capturedObjUrl = null; }
  capturedFile = null;
}

// Match a keyword as a whole word (or exact phrase for multi-word keywords).
// \b prevents 'LIST' matching 'LISTEN', 'NOTE' matching 'NOTABLE', etc.
function matchesWord(text, keyword) {
  if (keyword.includes(' ')) {
    // Multi-word phrase — simple include is fine
    return text.includes(keyword);
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`).test(text);
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
  const { total, streak, isFirstToday } = recordCompletion();
  showCompletionScreen(total, streak, isFirstToday);
}

// NOT THIS TIME ── mark seen, quietly return to home
function onNotThisTime() {
  hideOverlay();
  markTaskSeen();
  resetAndGoHome(taskScreen);
}

// ── Completion screen ───────────────────────────────────────────────────────

function showCompletionScreen(total, streak, isFirstToday) {
  // Save what we need before currentTask gets cleared on navigation
  pendingTaskText = currentTask ? currentTask.task : '';
  const hasNote  = notesArea.value.trim().length > 0;
  const hasPhoto = !!capturedFile;
  pendingCardType = hasPhoto ? 'photo' : hasNote ? 'writing' : null;

  // Show CREATE CARD only if the user actually produced something
  createCardBtn.classList.toggle('hidden', !pendingCardType);

  const phrase = pickRandom(SUCCESS_PHRASES);
  completionPhraseEl.textContent  = phrase;
  completionCountEl.textContent   = `TASK #${total}`;
  completionRankEl.textContent    = getRank(total);

  if (isFirstToday && streak > 1) {
    completionStreakEl.textContent = `${streak}-DAY STREAK`;
    completionStreakEl.style.display = '';
  } else if (isFirstToday && streak === 1) {
    completionStreakEl.textContent = 'FIRST TASK OF THE DAY';
    completionStreakEl.style.display = '';
  } else {
    // Not the first task today — streak message already shown, hide it
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
  selectedLoc     = null;
  selectedSocial  = null;
  currentTask     = null;
  overlayShown    = false;
  pendingCardType = null;
  pendingTaskText = '';
  document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
  createCardBtn.classList.add('hidden');
  refreshRollBtn();
  showScreen(selectionScreen, outgoing);
}

function onCreateCard() {
  if (pendingCardType === 'photo')   generatePhotoCard();
  if (pendingCardType === 'writing') generateWritingCard();
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

  const isFirstToday = lastDate !== today;

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

  return { total, streak, isFirstToday };
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

// ── Card generation ───────────────────────────────────────────────────────────

const CARD_SIZE = 1080;  // square, works for all social platforms

// Called by the writing field's CREATE CARD button
async function generateWritingCard() {
  const note = notesArea.value.trim();
  if (!note) return;
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width  = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');

  drawWritingCard(ctx, CARD_SIZE, note, pendingTaskText);
  shareCanvas(canvas);
}

// Called by the photo field's CREATE CARD button
async function generatePhotoCard() {
  if (!capturedPhotoEl.src) return;
  await document.fonts.ready;

  // Make sure the image element is fully loaded before drawing
  await new Promise(resolve => {
    if (capturedPhotoEl.complete) { resolve(); return; }
    capturedPhotoEl.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width  = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');

  drawPhotoCard(ctx, CARD_SIZE, pendingTaskText);
  shareCanvas(canvas);
}

// ── Card renderers ────────────────────────────────────────────────────────────

function drawWritingCard(ctx, size, note, taskText) {
  const pad = 72;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Chunky black border (matches the app's aesthetic)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, size - 14, size - 14);

  // Branding
  ctx.fillStyle = '#888888';
  ctx.font = `700 28px "Inter", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText('THE BOREDOM BUTTON', pad, pad);

  // Red accent line under branding
  ctx.fillStyle = '#D91F26';
  ctx.fillRect(pad, pad + 44, 72, 8);

  // Task text — Bebas Neue, large, black
  ctx.fillStyle = '#000000';
  ctx.font = `88px "Bebas Neue", sans-serif`;
  ctx.textBaseline = 'top';
  let y = wrapText(ctx, taskText, pad, pad + 88, size - pad * 2, 92);

  // Separator
  y += 28;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(size - pad, y);
  ctx.stroke();
  y += 36;

  // User's note — Inter, smaller, dark grey
  ctx.fillStyle = '#222222';
  ctx.font = `400 40px "Inter", sans-serif`;
  ctx.textBaseline = 'top';
  wrapText(ctx, note, pad, y, size - pad * 2, 52, 8); // max 8 lines
}

function drawPhotoCard(ctx, size, taskText) {
  // Cover-crop the photo to fill the square canvas
  const img = capturedPhotoEl;
  const imgAR = img.naturalWidth / img.naturalHeight;

  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (imgAR > 1) {
    // Landscape — crop sides
    sw = sh;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    // Portrait — crop top/bottom
    sh = sw;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

  // Dark gradient over the bottom third
  const gradStart = size * 0.42;
  const grad = ctx.createLinearGradient(0, gradStart, 0, size);
  grad.addColorStop(0,   'rgba(0,0,0,0)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.80)');
  grad.addColorStop(1,   'rgba(0,0,0,0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, gradStart, size, size - gradStart);

  // Red accent bar — narrow strip just above task text
  const textAreaTop = size * 0.62;
  ctx.fillStyle = '#D91F26';
  ctx.fillRect(60, textAreaTop - 16, 72, 8);

  // Task text — white Bebas Neue
  ctx.fillStyle = '#ffffff';
  ctx.font = `96px "Bebas Neue", sans-serif`;
  ctx.textBaseline = 'top';
  wrapText(ctx, taskText, 60, textAreaTop, size - 120, 100);

  // Branding — bottom left, small
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `700 26px "Inter", sans-serif`;
  ctx.textBaseline = 'bottom';
  ctx.fillText('THE BOREDOM BUTTON', 60, size - 52);

  // Red dot — bottom right
  ctx.fillStyle = '#D91F26';
  ctx.beginPath();
  ctx.arc(size - 64, size - 64, 14, 0, Math.PI * 2);
  ctx.fill();
}

// ── Text wrap helper ──────────────────────────────────────────────────────────
// Returns the Y position after the last line drawn.
// maxLines: optional — truncates with '…' if exceeded.

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 0) {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      if (maxLines && lineCount === maxLines - 1) {
        // Last allowed line — add ellipsis if there are more words
        let truncated = line;
        while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1).trimEnd();
        }
        ctx.fillText(truncated + '…', x, y);
        return y + lineHeight;
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
      lineCount++;
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

// ── Share / download the canvas ───────────────────────────────────────────────

function shareCanvas(canvas) {
  canvas.toBlob(blob => {
    const file = new File([blob], 'boredom-card.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(() => downloadBlob(blob, 'boredom-card.png'));
    } else {
      downloadBlob(blob, 'boredom-card.png');
    }
  }, 'image/png');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Utility ─────────────────────────────────────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}