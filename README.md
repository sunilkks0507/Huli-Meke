# Huli Meke (ಹುಲಿ ಮೇಕೆ)

A free, offline-capable Progressive Web App (PWA) for the traditional Karnataka tiger and goat game (also known as *Aadu Huli*, *Huli Gatta*, or *Aane Kuri*).

Live URL: [https://sunilkks0507.github.io/Huli-Meke/](https://sunilkks0507.github.io/Huli-Meke/)

---

## 1. Game Overview & Rules

Huli Meke is an ancient asymmetric strategy game from Karnataka, India:

- **Standard Mode**: 3 tigers vs 15 goats on full-size boards.
  - **Goats' objective**: Trap all 3 tigers so they have no legal steps or jumps.
  - **Tigers' objective**: Capture 5 goats by jumping over a single adjacent goat into an empty node directly behind it along a marked line.
  - **Turn order**: Goats place first, one per turn. Tigers step or jump from turn 1. Once all 15 goats are placed, goats move one step per turn along marked lines.
  - **Draw rule**: 80 moves without a capture in the moving phase ends in a draw.
- **Mini Mode**: 1 tiger vs 5 lambs on compact boards. Tiger wins at 2 captures; lambs win by trapping the tiger.
- **Custom Mode**: Pick custom tiger, goat, and capture target counts within board capacity limits.

---

## 2. Technical Architecture

The project has **zero third-party dependencies**, runs natively in modern browsers, and works completely offline:

```
/ (project root)
  ├── .github/workflows/deploy.yml # Automated CI/CD deployment to GitHub Pages
  ├── src/                         # Production application root
  │   ├── index.html               # Semantic HTML5 app shell & PWA meta tags
  │   ├── privacy.html             # Privacy policy (zero data collection note)
  │   ├── manifest.webmanifest     # Web App Manifest for Android & desktop installation
  │   ├── sw.js                    # Service worker (versioned cache-first offline strategy)
  │   ├── css/
  │   │   └── styles.css           # Design tokens, stone aesthetic, responsive layout
  │   ├── data/
  │   │   └── boards.json          # Geometry definitions for all 11 boards
  │   ├── icons/
  │   │   ├── icon-192.png         # 192x192 PWA launcher icon
  │   │   ├── icon-512.png         # 512x512 PWA splash & maskable icon
  │   │   └── icon.svg             # Vector master icon
  │   └── js/
  │       ├── engine.js            # Pure rules engine (no DOM, Node & browser compatible)
  │       ├── ai.js                # Minimax & Alpha-Beta search algorithms (pure logic)
  │       ├── ai-worker.js         # Dedicated Web Worker background thread
  │       ├── ai-service.js        # Worker client with 1.5s watchdog fallback
  │       ├── board-view.js        # Responsive SVG stone-board renderer & keyboard a11y
  │       ├── game-view.js         # HUD and result screen presenter
  │       ├── game-controller.js   # Game state, turn transitions, undo & pause flows
  │       ├── setup-screens.js     # Mode, board picker, and custom piece steppers
  │       ├── tutorial.js          # 5-step interactive tutorial
  │       ├── sound.js             # Web Audio API procedural synthesizer
  │       ├── storage.js           # Browser local storage for settings and stats
  │       ├── dialog.js            # Accessible modal dialog and confirm sheets
  │       ├── settings-view.js     # Settings and stats views
  │       └── main.js              # Application entry point, router, and PWA installer
  ├── tests/                       # Automated test suites run via node --test
  └── server.js                    # Zero-dependency local development static server
```

---

## 3. Running Locally

You can serve the game using any static server:

```bash
# Option A: Built-in Node server
node server.js
# Then open http://localhost:8080

# Option B: Python HTTP server
python -m http.server 8080 --directory src
```

---

## 4. Running Tests

Automated unit, game simulation, and AI benchmark tests run using Node's built-in test runner:

```bash
node --test
```

Individual test files:
- `tests/boards.test.js`: Validates all 11 board geometries, capacities, and coordinate graphs.
- `tests/engine.test.js`: Validates piece placement, steps, jump captures, trap detection, and 80-ply draw.
- `tests/board-view.test.js`: Validates SVG rendering and coordinate hit testing.
- `tests/storage.test.js`: Validates settings persistence and win/loss aggregation.
- `tests/two-player-game.test.js`: Simulates complete games to tiger and goat victories.
- `tests/ai.test.js`: Verifies Easy, Medium, and Hard AI move generation across all boards.

---

## 5. Adding or Modifying Boards

Boards are defined strictly in `src/data/boards.json`. To add a new board:

1. Add an entry with:
   - `id`: unique lowercase string (e.g. `"hex-board"`).
   - `name`: English name (e.g. `"Hexagonal Board"`).
   - `kannadaName`: Kannada script name.
   - `category`: `"full"` or `"mini"`.
   - `description`: 1-line note explaining piece count or layout.
   - `viewBox`: `[width, height]` array defining the SVG coordinate space.
   - `nodes`: dictionary of `"{nodeId}": [x, y]`.
   - `lines`: list of collinear node chains where pieces can step or jump along (e.g. `[["A", "B", "C"]]`).
   - `tigerStart`: array of node IDs where tigers are placed at game start.
2. The rules engine will automatically build the graph, compute neighbour adjacency, collinear jumps, and piece capacities.

---

## 6. Settings & Data Schema

All data is stored purely in the user's browser `localStorage`:

- **Settings key**: `huli_meke_settings`
  ```json
  { "sound": true, "hints": true }
  ```
- **Stats key**: `huli_meke_stats`
  - Stores match counts and wins per mode and side:
  - Modes: `standard-tiger`, `standard-goat`, `mini-tiger`, `mini-goat`, `custom-tiger`, `custom-goat`.
  - Stored format: `{ "played": 0, "won": 0 }`.

---

## 7. Automated Deployment (GitHub Pages)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`):
- Triggers on every `push` to the `main` branch.
- Automatically executes `node --test` to prevent broken builds from deploying.
- Deploys the static `/src` directory to GitHub Pages.

---

## 8. License & Privacy

- **License**: MIT
- **Privacy**: Zero personal data collected. No cookies, trackers, accounts, or analytics. Full details in `src/privacy.html`.
