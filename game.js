(() => {
  "use strict";

  const config = window.CASINO_CONFIG;
  if (!config || !Array.isArray(config.symbols) || config.symbols.length < 2) {
    throw new Error("Casino configuration is missing or invalid.");
  }

  const titleEl = document.getElementById("gameTitle");
  const spinButton = document.getElementById("spinButton");
  const spinLabel = document.getElementById("spinLabel");
  const statusText = document.getElementById("statusText");
  const oddsNote = document.getElementById("oddsNote");
  const strips = [...document.querySelectorAll(".reel-strip")];
  const overlay = document.getElementById("resultOverlay");
  const resultCard = document.getElementById("resultCard");
  const resultKicker = document.getElementById("resultKicker");
  const resultTitle = document.getElementById("resultTitle");
  const resultImage = document.getElementById("resultImage");
  const resultMessage = document.getElementById("resultMessage");
  const playAgainButton = document.getElementById("playAgainButton");
  const confettiLayer = document.getElementById("confettiLayer");

  titleEl.textContent = config.title || "Jackpot de los valores";
  document.title = config.title || "Jackpot de los valores";

  const STORAGE_WINS = "casinoNightV1_wins";
  const STORAGE_SPINS = "casinoNightV1_spins";
  const cycles = 14;
  let spinning = false;
  let ready = false;
  let currentIndexes = [0, 1, 2];
  let autoCloseTimer = null;
  let audioContext = null;

  const itemSize = () => {
    const probe = document.querySelector(".reel-item");
    return probe ? probe.getBoundingClientRect().height : 150;
  };

  function secureRandomInt(max) {
    if (!Number.isInteger(max) || max <= 0) throw new Error("max must be a positive integer");
    const range = 0x100000000;
    const limit = range - (range % max);
    const arr = new Uint32Array(1);
    do {
      crypto.getRandomValues(arr);
    } while (arr[0] >= limit);
    return arr[0] % max;
  }

  async function preloadImages() {
    const sources = [
      ...config.symbols.map((symbol) => symbol.image),
      "assets/celebrating-baby.png",
      "assets/crying-guy.png"
    ];

    await Promise.all(sources.map((src) => new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = async () => {
        try { if (img.decode) await img.decode(); } catch (_) {}
        resolve();
      };
      img.onerror = resolve;
      img.src = src;
    })));
  }

  function buildReels() {
    strips.forEach((strip, reelIndex) => {
      strip.innerHTML = "";
      for (let c = 0; c < cycles; c++) {
        config.symbols.forEach((symbol) => {
          const item = document.createElement("div");
          item.className = "reel-item";
          item.dataset.symbol = symbol.id;
          const img = document.createElement("img");
          img.src = symbol.image;
          img.alt = symbol.label;
          img.draggable = false;
          item.appendChild(img);
          strip.appendChild(item);
        });
      }
      normalizeReel(reelIndex, currentIndexes[reelIndex]);
    });
  }

  function normalizeReel(reelIndex, symbolIndex) {
    const strip = strips[reelIndex];
    const h = itemSize();
    const viewport = strip.parentElement.getBoundingClientRect().height;
    const centerOffset = (viewport - h) / 2;
    const targetItem = config.symbols.length + symbolIndex; // second cycle
    strip.style.transition = "none";
    strip.style.transform = `translateY(${centerOffset - targetItem * h}px)`;
    strip.getBoundingClientRect();
  }

  function jackpotLimitReached() {
    if (config.maximumJackpots == null) return false;
    const wins = Number(localStorage.getItem(STORAGE_WINS) || 0);
    return wins >= Number(config.maximumJackpots);
  }

  function generateNaturalResult() {
    return [0, 1, 2].map(() => secureRandomInt(config.symbols.length));
  }

  function generateNonJackpot() {
    let result;
    do {
      result = generateNaturalResult();
    } while (isJackpot(result));
    return result;
  }

  function generateResult() {
    const capped = jackpotLimitReached();

    if (config.oddsMode === "custom") {
      const oneIn = Math.max(2, Math.floor(Number(config.jackpotOneIn) || 16));
      const jackpot = !capped && secureRandomInt(oneIn) === 0;
      if (jackpot) {
        const winner = secureRandomInt(config.symbols.length);
        return [winner, winner, winner];
      }
      return generateNonJackpot();
    }

    const natural = generateNaturalResult();
    if (capped && isJackpot(natural)) return generateNonJackpot();
    return natural;
  }

  function isJackpot(result) {
    return result.every((value) => value === result[0]);
  }

  function incrementStorage(key) {
    const next = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(next));
    return next;
  }

  function animateReel(reelIndex, targetSymbolIndex) {
    return new Promise((resolve) => {
      const strip = strips[reelIndex];
      normalizeReel(reelIndex, currentIndexes[reelIndex]);
      const h = itemSize();
      const viewport = strip.parentElement.getBoundingClientRect().height;
      const centerOffset = (viewport - h) / 2;
      const configuredCycles = Array.isArray(config.spinCycles) ? Number(config.spinCycles[reelIndex]) : NaN;
      const extraCycles = Number.isFinite(configuredCycles) ? Math.max(2, Math.floor(configuredCycles)) : 3 + reelIndex;
      const startCycle = 1;
      const targetItem = (startCycle + extraCycles) * config.symbols.length + targetSymbolIndex;
      const configuredDuration = Array.isArray(config.spinDurationMs) ? Number(config.spinDurationMs[reelIndex]) : NaN;
      const duration = Number.isFinite(configuredDuration) ? Math.max(1800, configuredDuration) : 3300 + reelIndex * 700;

      requestAnimationFrame(() => {
        strip.classList.add("spinning");
        strip.style.transition = `transform ${duration}ms cubic-bezier(.12,.72,.18,1)`;
        strip.style.transform = `translateY(${centerOffset - targetItem * h}px)`;
      });

      window.setTimeout(() => {
        strip.classList.remove("spinning");
        currentIndexes[reelIndex] = targetSymbolIndex;
        normalizeReel(reelIndex, targetSymbolIndex);
        playStopSound(reelIndex);
        resolve();
      }, duration + 30);
    });
  }

  async function spin() {
    if (!ready || spinning || overlay.classList.contains("open")) return;
    spinning = true;
    spinButton.disabled = true;
    spinLabel.textContent = "SPINNING";
    statusText.textContent = "¡buena suerte!";
    playSpinSound();

    const result = generateResult();
    incrementStorage(STORAGE_SPINS);

    await Promise.all(result.map((target, index) => animateReel(index, target)));

    const won = isJackpot(result);
    if (won) incrementStorage(STORAGE_WINS);

    window.setTimeout(() => showResult(won), 260);
  }

  function showResult(won) {
    spinning = false;
    resultCard.classList.toggle("win", won);
    resultCard.classList.toggle("lose", !won);

    if (won) {
      resultKicker.textContent = "¡3 Valores Conseguidos!";
      resultTitle.textContent = "¡Jackpot!";
      resultImage.src = "assets/celebrating-baby.png";
      resultImage.alt = "Celebrating baby";
      resultMessage.textContent = "¡Lo Lograste, Felicidades!";
      if (config.confetti) launchConfetti();
      playWinSound();
    } else {
      resultKicker.textContent = "";
      resultTitle.textContent = "Mejor suerte para la próxima!";
      resultImage.src = "assets/crying-guy.png";
      resultImage.alt = "Crying character";
      resultMessage.textContent = "Toca PLAY para intentarlo otra vez.";
      confettiLayer.innerHTML = "";
      playLoseSound();
    }

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    playAgainButton.focus({ preventScroll: true });

    window.clearTimeout(autoCloseTimer);
    const displayMs = won
      ? Math.max(2200, Number(config.resultDisplayWinMs) || 5200)
      : Math.max(2600, Number(config.resultDisplayLoseMs) || 6800);
    autoCloseTimer = window.setTimeout(closeResult, displayMs);
  }

  function closeResult() {
    window.clearTimeout(autoCloseTimer);
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    confettiLayer.innerHTML = "";
    spinButton.disabled = false;
    spinLabel.textContent = "SPIN";
    statusText.textContent = "Toca SPIN para jugar";
    spinButton.focus({ preventScroll: true });
  }

  function launchConfetti() {
    confettiLayer.innerHTML = "";
    const colors = ["#ffc908", "#ff6371", "#00a9e0", "#a4d7f4", "#ffffff", "#00aa8e", "#005596"];
    for (let i = 0; i < 110; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.setProperty("--x", `${secureRandomInt(10000) / 100}%`);
      piece.style.setProperty("--w", `${6 + secureRandomInt(9)}px`);
      piece.style.setProperty("--c", colors[secureRandomInt(colors.length)]);
      piece.style.setProperty("--r", `${secureRandomInt(360)}deg`);
      piece.style.setProperty("--d", `${2.4 + secureRandomInt(220) / 100}s`);
      piece.style.setProperty("--delay", `${secureRandomInt(80) / 100}s`);
      piece.style.setProperty("--drift", `${-120 + secureRandomInt(241)}px`);
      confettiLayer.appendChild(piece);
    }
  }

  function getAudioContext() {
    if (!config.sounds) return null;
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function tone(freq, duration, volume = .05, type = "sine", delay = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + .04);
  }

  function playSpinSound() {
    tone(160, .18, .03, "sawtooth");
    tone(210, .18, .02, "sawtooth", .08);
  }
  function playStopSound(reelIndex) { tone(340 + reelIndex * 55, .09, .06, "square"); }
  function playWinSound() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, .34, .055, "triangle", i * .11));
  }
  function playLoseSound() {
    tone(260, .23, .045, "triangle");
    tone(196, .38, .04, "triangle", .18);
  }

  function updateOddsNote() {
    if (!config.showOdds) {
      oddsNote.textContent = "";
      oddsNote.style.display = "none";
      return;
    }
    if (config.oddsMode === "custom") {
      const n = Math.max(2, Math.floor(Number(config.jackpotOneIn) || 16));
      oddsNote.textContent = `Random jackpot odds: 1 in ${n} per spin`;
    } else {
      const n = config.symbols.length ** 2;
      const pct = (100 / n).toFixed(2).replace(/\.00$/, "");
      oddsNote.textContent = `Natural random odds: 1 in ${n} (${pct}%) per spin`;
    }
  }

  spinButton.addEventListener("click", spin);
  playAgainButton.addEventListener("click", closeResult);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeResult();
  });
  window.addEventListener("resize", () => {
    if (!spinning) currentIndexes.forEach((index, reelIndex) => normalizeReel(reelIndex, index));
  });

  // Optional maintenance shortcut: add ?reset=1 to the URL once to clear local counters.
  const params = new URLSearchParams(location.search);
  if (params.get("reset") === "1") {
    localStorage.removeItem(STORAGE_WINS);
    localStorage.removeItem(STORAGE_SPINS);
    history.replaceState({}, "", location.pathname);
  }

  async function initializeGame() {
    spinButton.disabled = true;
    spinLabel.textContent = "LOADING";
    statusText.textContent = "Loading values…";

    await preloadImages();
    buildReels();
    updateOddsNote();

    // Give Safari one paint after image decoding before enabling the first spin.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    ready = true;
    spinButton.disabled = false;
    spinLabel.textContent = "SPIN";
    statusText.textContent = "Toca SPIN para jugar";
  }

  initializeGame().catch(() => {
    // If decoding fails for any reason, still let the game run with normal browser loading.
    buildReels();
    updateOddsNote();
    ready = true;
    spinButton.disabled = false;
    spinLabel.textContent = "SPIN";
    statusText.textContent = "Toca SPIN para jugar";
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js?v=1.1.0").catch(() => {});
  }
})();
