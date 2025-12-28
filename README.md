# salvador

> "Have no fear of perfection - you'll never reach it." — Salvador Dalí

**salvador** is an autonomous visualization agent for [Claude Code](https://code.claude.com/docs/en/overview).

It is not just about "writing code" but about sharing a **vision**. it implements a p5.js sketch, inspects it with a headless browser, critiques the aesthetics and UX, and iteratively refines the result until it matches the design principles.

## usage

Once `salvador` is in your `.claude/skills` path, start `claude` and visualize:

```bash
/visualize a double pendulum with chaotic motion trails
```

Or explain a concept:

```bash
/visualize the difference between bubble sort and quick sort
```

Salvador will enter an autonomous loop: `coding` -> `inspecting` -> `refining`.
When it is satisfied with the quality, it will launch the result in your browser.

## how it works

Salvador operates on a strict **Implement → Inspect → Refine** feedback loop.

### 1. the eyes (inspector)

Salvador validates its work visually. It spins up a [Vite](https://vitejs.dev/) server and uses [Playwright](https://playwright.dev/) to:

* Capture console errors (e.g., `p.setup is not a function`).
* Take a snapshot (`snapshot.png`) of the canvas.
* Verify that the visualization is not blank, off-center, or visually broken.

### 2. the brain (SKILL.md)

The agent is governed by a set of strict constraints defined in `SKILL.md`:

* **Granular Transitions**: Don't skip the "moment of change".
* **Trackability**: Color-code elements so viewers can follow them through transformations.
* **Data Cards**: Show the underlying math/logic alongside the visual.
* **Progressive Revelation**: Build understanding step-by-step.

### 3. the hand (p5.js)

It scaffolds a reactive environment using `p5.js` in instance mode, ensuring no global namespace pollution and full support for modern ES modules.

## prerequisites

* Node.js 18+
* Claude Code

## installation

clone the repository:

```bash
git clone [https://github.com/tolitius/salvador.git](https://github.com/tolitius/salvador.git)
cd salvador
```

start the agent:

```bash
claude
```

*The agent automatically detects the `.claude` configuration and loads the skill.*

## structure

The repository follows the **Agent Skills** architecture:

```text
.
├── .claude/
│   ├── commands/
│   │   └── visualize.md       # slash command definition
│   ├── skills/
│   │   └── salvador/
│   │       ├── SKILL.md       # the brain: logic & constraints
│   │       ├── scripts/       # tooling: setup.sh, inspect.js
│   │       └── templates/     # scaffolding: index.html, main.js
│   └── settings.json          # permissions (auto-allows bash/edit)
└── CLAUDE.md                  # root agent context

```

## license

Copyright © 2025 tolitius

Distributed under the Eclipse Public License either version 1.0 or (at your option) any later version.
