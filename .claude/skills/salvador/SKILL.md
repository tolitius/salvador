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
5.  **Read Visual Quality Rules**: Read `resources/visual-quality.md` for layout, typography, transition, and color rules.
6.  **Read Design Defaults**: Read `resources/design-defaults.md` for font sizes, spacing values, and code patterns.

### Phase 1.5: Concept Analysis (Before Coding!)

This visualization needs to teach and reflect the concept that I was asked to visualize.
Therefore, make sure to include details so the user (who can be a child, adult, expert, or novice) can understand the concept well.

Before writing any code, decompose the concept:

1. **Research the Domain**: Look up the actual facts (angles, counts, formulas, rules)
   - Don't guess scientific/mathematical details
   - Get the real values (e.g., H2O bond angle is 104.5°, not "about 109°")

2. **Read Storytelling Guide**: Read `resources/storytelling.md` for narrative structure.

3. **Plan the Narrative Arc**: Don't just "break into stages" — design a story:
   - **Setup**: introduce the actors and the world
   - **Tension**: what's the question or unknown? create curiosity
   - **Revelation**: the moment of insight (this is where learning happens)
   - **Understanding**: show the mechanism, the "why"
   - **Mastery**: let the user interact or explore variations
   - Ask: "where is the 'aha' moment?" — if you can't answer, redesign the stages

4. **Identify Dynamic Elements**: What moves in this system?
   - Do NOT make a visualization of a static snapshot, everything moves in the Universe
   - Even if the concept has "stages," the actors must be alive (e.g., electrons orbiting, atoms vibrating, lists scanning).
   - be DETAILED. for example if certain electrons will be bonding, find out which ones (e.g., certain valence electrons) and highlight them visually. this of course does not just apply to Chemistry, but to any domain (e.g., in sorting algorithms, show which elements are being compared/swapped at each step)

5. **Identify What Needs Explanation**: What text/labels/diagrams would help?
   - Key terms to define
   - Quantities to show
   - Relationships to highlight

### Phase 1.6: Stage Design Principles

6. **Living Systems**: The system must breathe.
   - **Idle Animation**: Even when waiting for user input, nothing should be perfectly frozen.
   - **Continuous Time**: Use `draw()` to animate physics/logic continuously. `noLoop()` is forbidden.

7. **Granular Transitions**: Never skip the "moment of change"
   - BAD: "state A" → "state B" (viewer misses the transformation)
   - GOOD: "state A" → "approaching change" → "moment of change" → "state B"
   - Rule: if two stages feel like a big jump, add an intermediate stage
   - Examples:
     * Sorting algorithm: show each comparison/swap, not just "unsorted → sorted"
     * Chemical bond: show atoms approaching before showing them bonded
     * Mathematical proof: show each logical step, not just premise → conclusion

8. **Trackability**: When elements transform or move, viewers must follow them
   - Assign distinct colors to individual components at the start
   - Maintain those colors through all stages
   - Link details, configurations, numbers, strings, etc.. visually to their representations
   - Make it obvious which element went where, became what, or combined with whom
   - Examples:
     * In a merge sort: color the two halves differently so viewer tracks them through merges
     * In a state machine: color each state and show transitions with matching colors
     * In molecular bonding: color each atom's electrons to show which ones get shared

9. **Data Cards**: Show the underlying facts, not just the visual
   - Include domain notation (formulas, equations, configurations, pseudocode)
   - Display quantities, measurements, and labels using proper terminology
   - Cards can appear/disappear based on stage relevance
   - Examples:
     * Physics: show F=ma card when demonstrating force
     * Music: show chord notation (Cmaj7) alongside the visual
     * Chemistry: show electron configuration (1s² 2s² 2p⁴)
     * Algorithms: show Big-O complexity or current array state

### Phase 2: Autonomous Loop (The "Work")
Repeat this cycle until the visualization is **High Quality**:

1.  **Implement/Refine**: Write `src/main.js`.
    * *Constraint*: Use a modern color palette (avoid default pure RGB).
    * *Constraint*: For conceptual visualizations, use **progressive revelation**:
      - Build an interactive stepper (← →) through stages
      - Show info panels/cards explaining each stage
      - **Critical**: Animate transitions between states (slide/flow/morph)
    * *Constraint*: **Continuous Motion**: Ensure `draw()` runs continuously. Even in a "Step 1" static state, show micro-movements (vibration, orbit, pulse).
    * *Constraint*: Include **educational elements**:
      - Labels for key components
      - Brief text descriptions of what's happening
      - Visual indicators (badges, diagrams) for important values
    * *Constraint*: Use **domain-accurate** values, not approximations
    * *Constraint*: Ensure text is readable and has high contrast.
    * *Constraint*: Support interactions (mouse drag, click, or keyboard shortcuts).
    * *Constraint*: **Canvas sizing**: Use 850x540 or smaller to fit without scrolling
    * *Constraint*: **Keyboard handling**: Use `window.addEventListener('keydown')` for arrow keys (and map 'G' to `saveGif`).
    * *Constraint*: **Track elements visually**: Color-code components that transform and maintain those colors throughout all stages.
    * *Constraint*: **Expose stage count**: Set `window.stageCount = stages.length` so the inspector can navigate all stages.
    * *Constraint*: **Font sizes**: Use guidelines from `resources/design-defaults.md` (~14px+ body, ~22px+ heading, ~11px+ caption). Legibility is what matters.
    * *Constraint*: **Fractions**: NEVER use forward-slash for math fractions. Use the visual fraction renderer from `resources/design-defaults.md`.
    * *Constraint*: **Transitions — NO FADE-CUTS**: Stages must NOT simply fade out old content and fade in new. Elements present in consecutive stages must lerp to their new positions/sizes. New elements can fade in, removed elements can fade out, but shared elements move continuously. Use the transition pattern from `resources/design-defaults.md`.

2.  **Inspect**: Run `node inspect.js`
    * The inspector captures ALL stages (navigates via ArrowRight, saves `snapshots/stage_N.png` for each).
    * If `window.stageCount` is not exposed, the inspector falls back to 8 presses — so always expose it.

3.  **Critique**: Open **every** `snapshots/stage_N.png` and check against `resources/visual-quality.md`:

    **Layout check** (every stage):
    - no overlapping text or elements
    - nothing outside canvas bounds
    - elements use available space (not tiny in a corner)
    - cards have proper padding (16px minimum)
    - minimum 20px gap between unrelated elements

    **Typography check** (every stage):
    - font sizes legible (~14px+ body, ~22px+ heading, ~11px+ caption)
    - no forward-slash fractions — must be stacked
    - consistent font sizes within same view

    **Transition check** (compare consecutive stages):
    - are shared elements lerping to new positions? (no fade-cuts for elements that persist)
    - does stage N+1 start where stage N ends? (no position jumps)
    - are transitions slow enough to observe?
    - is the moment of change visible, or was it skipped?

    **Educational quality check**:
    - does each stage explain WHY, not just WHAT?
    - are colors consistent across all stages?
    - are interactive elements visually discoverable?
    - does the narrative arc build understanding progressively?

    **Verification rule**: if you claim a fix, re-run `node inspect.js` and verify the specific area in the new screenshot before proceeding.

4.  **Decide**:
    * *Errors?* -> Fix code -> **Repeat**.
    * *Static/Boring?* -> **Add Micro-Movement (vibration, orbits)** -> **Repeat**.
    * *Physics/Logic Broken?* (e.g. Gravity creates energy, sorting fails) -> **Fix Simulation Logic** -> **Repeat**.
    * *Missing Educational Context?* -> **Add Labels/Data Cards** -> **Repeat**.
    * *Layout/Typography/Transition issues found in critique?* -> **Fix the specific issue** -> **Repeat**.
    * *Amazing, Dynamic & Physically Accurate?* -> **Proceed to Phase 3**.

### Phase 3: Presentation (The "Reveal")
Once the loop is complete and the visualization is polished:
1.  **Launch**: Run `npx vite --open`.
2.  **Notify**: Tell the user "Visualization is ready. Controls: [List controls here]."
