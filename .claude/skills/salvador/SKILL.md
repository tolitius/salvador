---
name: salvador
description: Autonomous p5.js visualization agent. It implements, inspects, critiques design/UX, fixes, and launches the result.
---

# Salvador Agent
Use this skill to visualize concepts using p5.js with a focus on **high-quality UX, aesthetics, and continuous motion**.

## Workflow
Follow this **strict loop** when asked to visualize a concept:

### Phase 1: Bootstrap
1.  **Check Context**: If `package.json` is missing, run `bash .claude/skills/salvador/scripts/setup.sh`.
2.  **Scaffold**: Ensure `index.html` and `src/main.js` exist.
3.  **Read p5.js Reference**: Read `resources/p5-missing-knowledge.md` for p5.js 2.x API changes before writing any code.
4.  **Read Responsive Design**: Read `resources/responsive-design.md` for the scale factor pattern.
5.  **Read Visual Quality Rules**: Read `resources/visual-quality.md` for layout, typography, and color rules.
6.  **Read Design Defaults**: Read `resources/design-defaults.md` for spacing values and code patterns.

### Phase 1.5: Concept Analysis (Before Coding!)

Before writing any code, decompose the concept:

1. **Decide the visualization type**:
   - **Staged**: concept needs step-by-step explanation (how a qubit works, how sorting algorithms compare, how photosynthesis works). Has multiple stages with ← → navigation.
   - **Standalone**: single living scene (starfield, fractal, lava lamp, particle system, a physics sandbox). No stages — one continuous experience with interactivity.
   - **Hybrid**: mostly one scene but with modes or layers the user can toggle (solar system with clickable planets, waveform explorer with parameter sliders).

   This decision shapes everything below. Don't force stages on a concept that doesn't need them.

2. **Research the Domain**: Look up the actual facts (angles, counts, formulas, rules)
   - Don't guess scientific/mathematical details
   - Get the real values (e.g., H2O bond angle is 104.5°, not "about 109°")

3. **If staged**: Read `resources/storytelling.md` for narrative structure, then plan the arc:
   - **Setup**: introduce the actors and the world
   - **Tension**: what's the question or unknown? create curiosity
   - **Revelation**: the moment of insight (this is where learning happens)
   - **Understanding**: show the mechanism, the "why"
   - **Mastery**: let the user interact or explore variations

4. **If staged — STOP — Write the Bridge Chain** (do NOT proceed to coding without it):

   Write out this exact structure for every stage:
   ```
   stage 1: [what it shows] | analogy: [everyday thing that works like this]
     → "[question that creates pull to stage 2]"
   stage 2: [what it shows — answers the question above] | analogy: [...]
     → "[question that creates pull to stage 3]"
   stage 3: ...
   ```
   Rules:
   - if you can't write a bridge question between two stages, they are disconnected — rethink the order or merge them
   - each bridge question MUST appear visually in the rendered stage (info card text, bottom prompt, or animated text)
   - each analogy MUST appear visually in the rendered stage alongside the real concept
   - **prefer one scene**: for each pair of stages, ask "can I show stage N+1 by adding/modifying elements on stage N's canvas?" If yes, do that instead of switching to a new screen. See Phase 1.6, principle 9.
   - this chain is your contract — the code must implement it

5. **If standalone/hybrid**: Plan the scene and interactions:
   - what is the visual core? (the main thing the viewer sees and interacts with)
   - what parameters can the user control? (sliders, mouse, click, keyboard)
   - what makes it alive? (physics, particles, procedural generation, response to input)

6. **Identify Dynamic Elements**: What moves in this system?
   - Do NOT make a static snapshot — everything moves in the Universe
   - be DETAILED: which specific elements animate, how, and why

7. **Identify What Needs Explanation** (if educational):
   - Key terms to define
   - Quantities to show
   - Relationships to highlight

### Phase 1.6: Design Principles

8. **Living Systems**: The system must breathe.
   - **Idle Animation**: Even when waiting for user input, nothing should be perfectly frozen.
   - **Continuous Time**: Use `draw()` to animate physics/logic continuously. `noLoop()` is forbidden.

9. **(Staged only) One Scene, Progressive Enhancement**: Prefer building on ONE canvas over switching to different screens.
   - Ask for each stage: "can I show this by adding/modifying elements on the current canvas?"
   - YES → add elements, show labels, open edit boxes, extend the diagram. the viewer sees the scene grow.
   - NO (genuinely different physical system) → new scene is OK, but look harder — often zooming in/out or rearranging the same elements works.
   - Example: trigonometry — one canvas that progressively adds angle → ratio → unit circle → editable inputs. NOT 5 separate screens.
   - Example: sorting — one canvas, the array transforms in place. NOT "before" on one screen and "after" on another.
   - When stages DO share a scene, the transition rules (lerp positions, no fade-cuts) apply naturally — elements slide to new spots.

10. **(Staged only) Granular Transitions**: Never skip the "moment of change"
    - BAD: "state A" → "state B" (viewer misses the transformation)
    - GOOD: "state A" → "approaching change" → "moment of change" → "state B"
    - Rule: if two stages feel like a big jump, add an intermediate stage

11. **Trackability**: When elements transform or move, viewers must follow them
    - Assign distinct colors to individual components at the start
    - Maintain those colors throughout the visualization
    - Make it obvious which element went where, became what, or combined with whom

12. **(Educational) Data Cards**: Show the underlying facts, not just the visual
    - Include domain notation (formulas, equations, configurations, pseudocode)
    - Display quantities, measurements, and labels using proper terminology

### Phase 2: Autonomous Loop (The "Work")
Repeat this cycle until the visualization is **High Quality**:

1.  **Implement/Refine**: Write `src/main.js`.
    * *Always*:
      - Use a modern color palette (avoid default pure RGB)
      - **Continuous Motion**: `draw()` runs continuously. Show micro-movements even in idle states.
      - Ensure text is readable and has high contrast
      - **Font hierarchy**: size reflects importance (see `resources/visual-quality.md`)
      - **Fractions**: NEVER use forward-slash for math fractions. Use the visual fraction renderer from `resources/design-defaults.md`.
      - **Canvas sizing**: Use 850x540 base coordinates
      - **Keyboard handling**: Use `window.addEventListener('keydown')`. Map 'G' to `saveGif`.
      - Support interactions (mouse, click, keyboard)
    * *Staged only*:
      - Build an interactive stepper (← →) through stages
      - Show info panels/cards explaining each stage
      - **Expose stage count**: Set `window.stageCount = stages.length` so the inspector can navigate all stages.
      - **Transitions — NO FADE-CUTS**: Elements present in consecutive stages must lerp to their new positions/sizes. New elements can fade in, removed elements can fade out, but shared elements move continuously. Use the transition pattern from `resources/design-defaults.md`.
      - Color-code components that transform and maintain those colors throughout all stages.
      - Use **domain-accurate** values, not approximations
    * *Standalone/hybrid*:
      - Focus on interactivity and responsiveness
      - Make controls discoverable (visual hints, glow, cursor changes)

2.  **Inspect**: Run `node inspect.js`
    * For staged: the inspector captures ALL stages (navigates via ArrowRight, saves `snapshots/stage_N.png` for each).
    * For standalone: the inspector captures a single `snapshots/stage_1.png`. If the visualization has no stages, `window.stageCount` is not needed.

3.  **Critique**: Open **every** snapshot and check against `resources/visual-quality.md`:

    **Layout check** (all types):
    - no overlapping text or elements
    - nothing outside canvas bounds
    - elements use available space (not tiny in a corner)
    - cards have proper padding (16px minimum)

    **Typography check** (all types):
    - font hierarchy: primary content prominent, headings larger than body, secondary info can be small
    - no forward-slash fractions — must be stacked
    - consistent font sizes within same view

    **Transition check** (staged only — compare consecutive stages):
    - are shared elements lerping to new positions? (no fade-cuts for elements that persist)
    - does stage N+1 start where stage N ends? (no position jumps)
    - are transitions slow enough to observe?

    **Narrative check** (staged only):
    - does each stage end with a visible bridge question that the next stage answers? (no "museum mode")
    - can a newcomer follow why stage N leads to stage N+1?
    - is there at least one analogy grounding the abstract concept in something familiar?

    **Aesthetics & motion check** (all types):
    - does it look designed, not engineered?
    - is something always alive / moving? (reject if it looks like a static image)
    - are interactive elements visually discoverable?
    - are colors consistent throughout?

    **Educational quality check** (if educational):
    - does each stage/view explain WHY, not just WHAT?

    **Verification rule**: if you claim a fix, re-run `node inspect.js` and verify the specific area in the new screenshot before proceeding.

4.  **Decide**:
    * *Errors?* -> Fix code -> **Repeat**.
    * *Static/Boring?* -> **Add Micro-Movement (vibration, orbits)** -> **Repeat**.
    * *Physics/Logic Broken?* -> **Fix Simulation Logic** -> **Repeat**.
    * *Layout/Typography/Transition issues?* -> **Fix the specific issue** -> **Repeat**.
    * *Amazing, Dynamic & Polished?* -> **Proceed to Phase 3**.

### Phase 3: Presentation (The "Reveal")
Once the loop is complete and the visualization is polished:
1.  **Launch**: Run `npx vite --open`.
2.  **Notify**: Tell the user "Visualization is ready. Controls: [List controls here]."
