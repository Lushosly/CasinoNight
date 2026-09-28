/*
  Casino Night V1.1 configuration
  -------------------------------
  You can safely change these values without touching the game code.
*/
window.CASINO_CONFIG = {
  title: "Casino Night",

  // "natural" = each reel independently chooses one of 4 symbols.
  // With 4 equally likely symbols, 3 identical = 1/16 (6.25%) jackpot odds.
  // "custom" = use jackpotOneIn below (for example 25 = 1 in 25).
  oddsMode: "natural",
  jackpotOneIn: 16,

  // Set to a number (for example 10) to stop jackpots after that many wins
  // on this iPad/browser. Leave null for no limit.
  maximumJackpots: null,

  resultDisplayMs: 4200,
  sounds: true,
  confetti: true,
  showOdds: false,

  // V1.1: deliberately slower reels so guests can actually see the values.
  // Each later reel stops a little after the previous one.
  spinDurationMs: [3300, 4000, 4700],
  spinCycles: [3, 4, 5],

  symbols: [
    { id: "red",       label: "Red value",        image: "assets/value-red.png" },
    { id: "yellow",    label: "Yellow value",     image: "assets/value-yellow.png" },
    { id: "blueLight", label: "Light blue value", image: "assets/value-blue-light.png" },
    { id: "blueDark",  label: "Blue value",       image: "assets/value-blue-dark.png" }
  ]
};
