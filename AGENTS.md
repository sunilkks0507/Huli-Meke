# AGENTS.md

## 0. MOST IMPORTANT RULES (read first, obey always)
1. Read `MASTER_SPEC.md` fully before doing anything. It is the single source of truth.
2. Build only what the spec's current phase lists. If something is missing or unclear, ask me. Do not guess.
3. Work in small steps. After each working step, run the app, then commit to Git (section 5).
4. Never put secrets (API keys, passwords, tokens) in code or commits (section 6).
5. Use only free tools and free tiers. Before adding anything that could cost money, stop and ask me.
6. Match the designs in `/design` and the tokens in `DESIGN_SYSTEM.md` exactly.
7. Do not delete files or run destructive commands without asking.
8. Before saying "done", prove it: run it and list what you checked.

## 1. Who I am
Beginner. Explain what you are doing in one or two plain sentences before each major action. Do not lecture on coding concepts. Ask before big decisions.

## 2. How to work, step by step
1. Read `MASTER_SPEC.md` and look at `/design`.
2. Write a short plan of the current phase (max 10 bullets) and show it to me. Wait for "go".
3. Decide the stack if the spec leaves it open. Write the decision and the reason in `DECISIONS.md` (3 lines max).
4. Set up the project and first commit.
5. Build one feature at a time in the order the spec lists.
6. After each feature: run it, fix errors, commit.
7. At the end of the phase: run the full checklist in the spec's "Done means" section, then summarise what works and what does not.

## 3. Stack preferences (decide per project; these are defaults)
- Web and browser games: plain HTML, CSS, JavaScript. Use Vite only if the project needs it.
- "Android" apps: build as a PWA first. Use Capacitor or a Trusted Web Activity only when a Play Store listing is required.
- Data: browser local storage by default. Firebase free tier only when logins or cloud sync are required by the spec.
- Browser extensions: Manifest V3. Scripts: Python or Node, single file where possible.
- Prefer few dependencies. No paid libraries. Do not add a library for something simple.

## 4. Folder and naming rules
```
/ (project root)
  AGENTS.md
  MASTER_SPEC.md
  DESIGN_SYSTEM.md
  DECISIONS.md
  README.md
  /design        mockups from Claude (read only)
  /src           source code
  /public        static files and images
  /tests         tests, if any
  .env.example   names of secrets, with empty values
  .gitignore
```
- File names: lowercase-with-dashes. Variables and functions: camelCase. CSS classes: kebab-case.
- One responsibility per file. Keep files under 300 lines. Add short comments for non-obvious logic.
- Keep the same layout in every project.

## 5. Git rules
- Initialise Git on day one. Connect to the GitHub repo I name.
- Commit after every working step. Message format: `type: short summary` (types: feat, fix, style, docs, chore).
- Branches: `main` always works. Do new work on a branch `feature/short-name`, merge when it works.
- Tag a version when a phase is done: `v0.1-mvp`, `v1.0-production`.
- If something breaks badly, revert to the last good commit rather than patching blindly.

## 6. Security rules
- `.gitignore` must exclude `.env`, key files, `node_modules`, build output.
- Secrets live in `.env` (local) or the host's secret settings. `.env.example` lists names only.
- Never log or display secrets or personal data.
- Validate and sanitise all user input. Escape output to prevent script injection.
- Firebase (if used): never leave rules open (`allow read, write: if true` is forbidden). Users may access only their own data.
- Collect the minimum personal data. If personal data is used, add a simple privacy note page.
- Payments: use a hosted provider's checkout only. Never handle card details yourself.
- Before publishing, complete the security checklist in `PUBLISH_AND_SECURITY.md`.

## 7. Quality rules
- MVP phase: working, simple, not fancy. Production phase: error handling, empty and loading states, accessibility, performance, responsive layout, basic tests for core logic.
- Every screen handles loading, empty, error. The app must work on a 360px wide phone screen.
- No console errors at the end of a phase.

## 8. Publishing and maintenance
- Follow `PUBLISH_AND_SECURITY.md` for the chosen target.
- Keep a short `README.md`: what it is, how to run, how to deploy, how to change the main settings. Write it so someone else could take over (client handover).

## 9. PROJECT-SPECIFIC
- Project name: Huli Meke (Karnataka tiger and goat game, also called Aadu Huli, Huli Gatta, Aane Kuri)
- One-line goal: A free, offline-capable mobile web app (PWA, English) where one or two players play Huli Meke on a choice of 11 boards with Standard, Mini or Custom piece counts, against a 3-level computer opponent, published on GitHub Pages and installable on Android.
- Target (web / PWA / Android / extension / script): PWA (web first, installable on Android)
- Current phase (MVP or Production): MVP
- Stack ideas (Gemini decides): plain HTML, CSS, JavaScript (ES modules), no build step; SVG boards; Web Worker for the computer opponent; service worker and manifest; `node --test` for tests; deploy `/src` to GitHub Pages with GitHub Actions.
- Extra rules for this project:
  1. Board points and lines come ONLY from `src/data/boards.json` (Appendix A of the spec, copied exactly). Never edit coordinates or lines.
  2. Game rules and piece limits per board come ONLY from spec section 7. The UI must make an invalid setup impossible.
  3. Keep `engine.js` and `ai.js` free of any DOM code so they can be tested in Node. Run `node --test tests/` before every commit that touches them.
  4. Look and feel must match `/design/huli-meke-mockups.html` (19 frames). The accent colour is `#8C3B1E`.
  5. No backend, no accounts, no external scripts or fonts. Local storage only for two settings and the stats.
