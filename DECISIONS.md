# Architecture & Stack Decisions

- Stack: Plain HTML5, CSS3, and modern JavaScript (ES modules) with no frameworks, SVG board rendering, and a Web Worker for AI.
- Testing & Target: Node.js built-in test runner (`node --test`) for rules/engine tests; zero-build PWA deployable to GitHub Pages.
- Reason: Zero external dependencies, 100% free hosting, fastest mobile load times, and simple long-term maintenance.
