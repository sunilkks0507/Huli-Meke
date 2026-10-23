# Huli Meke (ಹುಲಿ ಮೇಕೆ)

A free, offline-capable mobile web app (PWA) for the traditional Karnataka tiger and goat game (also known as Aadu Huli, Huli Gatta, or Aane Kuri).

## Features
- 11 selectable authentic and variant boards (Triangle, Square with Diagonals, Wheel, Twin Triangles, and more).
- Standard (3 tigers vs 15 goats), Mini (1 tiger vs 5 lambs), and Custom piece setups.
- Two-player local pass-and-play and 3-level computer opponent (Easy, Medium, Hard).
- In-game Undo, Hints, 5-step interactive tutorial, and local statistics tracking.
- Zero dependencies, pure HTML5/CSS3/ES modules with SVG board rendering.

## Running Locally
Since this is a static ES-module web application, serve the project root with any local web server:

```bash
# Using Node
npx serve src

# Using Python
python -m http.server 8000 --directory src
```

## Running Tests
Tests use the Node.js built-in test runner:

```bash
node --test tests/
```
