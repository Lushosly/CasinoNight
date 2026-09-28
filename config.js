/*
  Jackpot de los valores V1.3 configuration
  -------------------------------
  You can safely change these values without touching the game code.
*/
window.CASINO_CONFIG = {
  title: "Jackpot de los valores",

  // "natural" = each reel independently chooses one of 4 symbols.
  // With 4 equally likely symbols, 3 identical = 1/16 (6.25%) jackpot odds.
  // "custom" = use jackpotOneIn below (for example 25 = 1 in 25).
  oddsMode: "natural",
  jackpotOneIn: 16,

  // Set to a number (for example 10) to stop jackpots after that many wins
  // on this iPad/browser. Leave null for no limit.
  maximumJackpots: null,

  resultDisplayMs: 4600,
  sounds: true,
  confetti: true,
  showOdds: false,

  // V1.2: slower reels, more visible motion, better Safari rendering.
  // Each later reel stops a little after the previous one.
  spinDurationMs: [4200, 5100, 6000],
  spinCycles: [4, 5, 6],

  symbols: [
    { id: "red",       label: "Red value",        image: "assets/value-red.png" },
    { id: "yellow",    label: "Yellow value",     image: "assets/value-yellow.png" },
    { id: "blueLight", label: "Light blue value", image: "assets/value-blue-light.png" },
    { id: "blueDark",  label: "Blue value",       image: "assets/value-blue-dark.png" }
  ]
};
