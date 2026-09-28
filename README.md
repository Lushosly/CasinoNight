# Casino Night V1.1

This update addresses the two iPad issues found in V1:

- **Slower spins:** reels now stop at about 3.3s, 4.0s, and 4.7s.
- **Visible symbols while spinning:** value images are preloaded/decoded before SPIN is enabled, the motion blur is much lighter, and each reel cycles slowly enough to visibly pass through all four values (including red).
- **Less stale caching on iPad:** V1.1 uses versioned JS/CSS URLs and a new network-first service worker cache.

## Upload to GitHub Pages

Replace the files in the repository root with the contents of this folder, commit, and wait for GitHub Pages to redeploy.

On the iPad, after GitHub finishes deploying:

1. Reload the page once.
2. If the old version still appears, close the tab and reopen the GitHub Pages URL. The new cache version should then take over.

## Easy spin-speed adjustment

Open `config.js` and edit:

```js
spinDurationMs: [3300, 4000, 4700],
spinCycles: [3, 4, 5],
```

Higher duration numbers make the reels slower. The three numbers correspond to reel 1, reel 2, and reel 3.

## Jackpot rule

Default remains natural random odds with four equally likely values. Three identical symbols = jackpot, which is naturally **1 in 16 (6.25%) per spin**.
