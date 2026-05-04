const holes = document.querySelectorAll(".hole");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const levelEl = document.getElementById("level");
const comboEl = document.getElementById("combo");
const startBtn = document.getElementById("startBtn");

let score = 0;
let time = 30;
let level = 1;
let combo = 0;

let moleSpeed = 850;
let gameInterval;
let moleInterval;
let lastHole;

/* AUDIO (LOW LATENCY FEEL) */
const hitSound = new Audio("./sounds/hit.mp3");
const missSound = new Audio("./sounds/miss.mp3");
const gameOverSound = new Audio("./sounds/gameover.mp3");

/* MOBILE VIBRATION */
function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* RANDOM HOLE */
function randomHole() {
  const hole = holes[Math.floor(Math.random() * holes.length)];
  if (hole === lastHole) return randomHole();
  lastHole = hole;
  return hole;
}

/* MOLE SPAWN (SMOOTHER TIMING) */
function showMole() {
  const hole = randomHole();
  const mole = hole.querySelector(".mole");

  const isGolden = Math.random() < 0.12;

  mole.classList.toggle("gold", isGolden);

  hole.classList.add("up");

  setTimeout(() => {
    hole.classList.remove("up");
    mole.classList.remove("gold");
  }, moleSpeed);
}

/* LEVEL CURVE (SMOOTH DIFFICULTY) */
function updateLevel() {
  level = Math.floor(score / 8) + 1;
  moleSpeed = Math.max(220, 850 - level * 60);
  levelEl.textContent = level;
}

/* START */
function startGame() {
  score = 0;
  time = 30;
  level = 1;
  combo = 0;

  moleSpeed = 850;

  scoreEl.textContent = score;
  timeEl.textContent = time;
  levelEl.textContent = level;
  comboEl.textContent = "x0";

  startBtn.disabled = true;

  moleInterval = setInterval(showMole, moleSpeed);

  gameInterval = setInterval(() => {
    time--;
    timeEl.textContent = time;

    updateLevel();

    if (time <= 0) endGame();
  }, 1000);
}

/* END */
function endGame() {
  clearInterval(moleInterval);
  clearInterval(gameInterval);

  startBtn.disabled = false;

  gameOverSound.play().catch(()=>{});
  vibrate(200);

  alert("Game Over! Score: " + score);
}

/* CLICK (CORE FEEL SYSTEM) */
holes.forEach(hole => {
  const mole = hole.querySelector(".mole");

  mole.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!hole.classList.contains("up")) {
      missSound.currentTime = 0;
      missSound.play().catch(()=>{});
      combo = 0;
      comboEl.textContent = "x0";

      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 100);

      return;
    }

    hole.classList.remove("up");

    const isGold = mole.classList.contains("gold");

    score += isGold ? 5 : 1;
    combo += isGold ? 2 : 1;

    scoreEl.textContent = score;

    comboEl.textContent = "x" + combo;
    comboEl.classList.add("combo-pop");
    setTimeout(() => comboEl.classList.remove("combo-pop"), 120);

    hitSound.currentTime = 0;
    hitSound.play().catch(()=>{});

    vibrate(isGold ? 80 : 30);

    mole.classList.add("hit");
    setTimeout(() => mole.classList.remove("hit"), 80);

    updateLevel();

    document.body.classList.add("flash");
    setTimeout(() => document.body.classList.remove("flash"), 120);
  });
});

/* START BUTTON */
startBtn.addEventListener("click", startGame);