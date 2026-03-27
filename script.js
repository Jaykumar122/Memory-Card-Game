// ─── Card Data ────────────────────────────────────────────────────
const EMOJI_PAIRS = [
  '🐉', '🦊', '🌊', '🔥',
  '⚡', '🌙', '💎', '🍄'
];

// ─── State ────────────────────────────────────────────────────────
let firstCard    = null;
let secondCard   = null;
let lockBoard    = false;
let moveCount    = 0;
let pairCount    = 0;
let timerInterval= null;
let secondsElapsed = 0;

// ─── DOM Refs ─────────────────────────────────────────────────────
const board       = document.getElementById('board');
const moveEl      = document.getElementById('move-count');
const pairEl      = document.getElementById('pair-count');
const timerEl     = document.getElementById('timer');
const winScreen   = document.getElementById('win-screen');
const winStats    = document.getElementById('win-stats');
const restartBtn  = document.getElementById('restart-btn');
const restartWin  = document.getElementById('restart-win');

// ─── Utilities ────────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${pad(m)}:${pad(s)}`;
}

function flashStat(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  el.addEventListener('animationend', () => el.classList.remove('flash'), { once: true });
}

// ─── Timer ────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerEl.textContent = '00:00';
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ─── Build Board ──────────────────────────────────────────────────
function buildBoard() {
  board.innerHTML = '';
  firstCard = secondCard = null;
  lockBoard = false;
  moveCount = pairCount = 0;
  moveEl.textContent = pad(moveCount);
  pairEl.textContent = pad(pairCount);

  const values = shuffle([...EMOJI_PAIRS, ...EMOJI_PAIRS]);

  values.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-value', emoji);
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Memory card');
    card.style.animationDelay = `${index * 40}ms`;

    // Card inner (3D flip container)
    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    // Back face
    const back = document.createElement('div');
    back.classList.add('card-face', 'card-back');

    // Front face
    const front = document.createElement('div');
    front.classList.add('card-face', 'card-front');
    front.textContent = emoji;

    inner.appendChild(back);
    inner.appendChild(front);
    card.appendChild(inner);

    card.addEventListener('click', handleFlip);
    board.appendChild(card);
  });

  startTimer();
}

// ─── Flip Logic ───────────────────────────────────────────────────
function handleFlip() {
  if (lockBoard) return;
  if (this === firstCard) return;
  if (this.classList.contains('matched')) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard  = true;

  moveCount++;
  moveEl.textContent = pad(moveCount);
  flashStat(moveEl);

  checkMatch();
}

// ─── Match Check ──────────────────────────────────────────────────
function checkMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  firstCard.classList.add('matched', 'no-click');
  secondCard.classList.add('matched', 'no-click');

  pairCount++;
  pairEl.textContent = pad(pairCount);
  flashStat(pairEl);

  resetTurn();

  if (pairCount === EMOJI_PAIRS.length) {
    setTimeout(showWinScreen, 500);
  }
}

function handleMismatch() {
  const c1 = firstCard;
  const c2 = secondCard;

  // Brief red flash
  setTimeout(() => {
    c1.classList.add('wrong');
    c2.classList.add('wrong');
  }, 200);

  setTimeout(() => {
    c1.classList.remove('flipped', 'wrong');
    c2.classList.remove('flipped', 'wrong');
    resetTurn();
  }, 900);
}

function resetTurn() {
  firstCard = secondCard = null;
  lockBoard = false;
}

// ─── Win Screen ───────────────────────────────────────────────────
function showWinScreen() {
  stopTimer();
  winScreen.setAttribute('aria-hidden', 'false');
  winScreen.classList.add('show');
  winStats.innerHTML =
    `Completed in <strong>${formatTime(secondsElapsed)}</strong><br>` +
    `with <strong>${moveCount}</strong> moves`;
}

function hideWinScreen() {
  winScreen.classList.remove('show');
  winScreen.setAttribute('aria-hidden', 'true');
}

// ─── Restart ──────────────────────────────────────────────────────
function restart() {
  hideWinScreen();
  buildBoard();
}

restartBtn.addEventListener('click', restart);
restartWin.addEventListener('click', restart);

// ─── Init ─────────────────────────────────────────────────────────
buildBoard();
