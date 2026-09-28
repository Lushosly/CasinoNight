# Casino Night V1

A touch-friendly, animated 3-reel slot machine for iPad / GitHub Pages.

## Current game rules

- 4 equally likely value symbols.
- Jackpot = all 3 reels land on the same value.
- Default mode is **natural random**: each reel is chosen independently with `crypto.getRandomValues()`.
- Natural jackpot odds are therefore **1 in 16 (6.25%) per spin**.
- A loss displays the crying character and “Better luck next time.”
- A win displays “Jackpot!”, the celebrating baby, confetti, and a win sound.

## Upload to GitHub Pages

1. Create a new repository, for example `casino-night`.
2. Upload **all files and the `assets` folder** from this package to the repository root.
3. Commit the files to the `main` branch.
4. In GitHub: **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`, then save.
7. GitHub will show the public Pages URL when deployment finishes.
8. Open that URL in Safari on the iPad. For a kiosk-like experience, use **Share → Add to Home Screen**.

## Easy customization

Open `config.js`.

### Change title

```js
title: "Casino Night",
```

### Keep natural 1-in-16 odds

```js
oddsMode: "natural",
```

### Use custom random odds, e.g. 1 in 25

```js
oddsMode: "custom",
jackpotOneIn: 25,
```

The winning spin is still randomly selected. It is not assigned to a predetermined player/spin.

### Optional prize cap on the event iPad

```js
maximumJackpots: 10,
```

This uses `localStorage` on that browser/device. Leave as `null` for unlimited jackpots.

To clear the local win/spin counters, open the site once with `?reset=1` at the end of the URL.

Example:

`https://YOURNAME.github.io/casino-night/?reset=1`

The page automatically removes the query string after resetting.

## Important note for real prizes

This V1 is a **client-side GitHub Pages game**. It is suitable when guests only interact with the event iPad and the prize risk is modest. Anyone with technical access to the browser/source code can inspect or modify client-side logic.

For high-value prizes, strict inventory control, multiple iPads, or audit requirements, move the result generation and prize count to a small server/API. The animation/UI can stay exactly the same.

## Files

- `index.html` — page structure
- `styles.css` — machine, reel, result, iPad styling
- `config.js` — title, odds, prize cap, symbols
- `game.js` — secure random result generation and animation
- `manifest.webmanifest` — Add-to-Home-Screen metadata
- `service-worker.js` — offline cache after first successful load
- `assets/` — supplied artwork and value images
