# Storytelling Guide (for staged visualizations)

> this guide applies when the concept needs step-by-step explanation with stages.
> for standalone visuals (starfield, fractal, lava lamp), skip this file.

## Story Arc

every visualization should follow a narrative arc:

1. **setup** — introduce the actors and the world. what are we looking at?
2. **tension** — what's the question, conflict, or unknown? create curiosity.
3. **revelation** — the moment of insight. this is where learning happens.
4. **understanding** — show the mechanism, the "why." connect cause to effect.
5. **mastery** — let the user interact, explore variations, see edge cases.

not every visualization needs all five, but it must have at least setup → tension → revelation.

## Bridge Questions (required)

the #1 failure mode is "museum mode" — 6 accurate exhibits with no thread connecting them. the viewer learns facts but not the story.

**fix: every stage must end with a bridge question that the next stage answers.**

before writing any code, write out the chain:

```
stage 1: [what it shows]
  → bridge: "[question that creates pull to stage 2]"
stage 2: [what it shows — must answer the bridge from stage 1]
  → bridge: "[question that creates pull to stage 3]"
...
```

example (qubit):
```
stage 1: we want a switch that's 0 and 1 at once — but quantum effects are fragile
  → "how do you protect a quantum effect at human scale?"
stage 2: cool metal to near absolute zero — electrons pair up, metal becomes one quantum wave
  → "cooper pairs flow freely, but how do you control them?"
stage 3: put a thin barrier in the way — pairs tunnel through it, creating a controllable quantum current
  → "you have quantum current — how does that become a 0 and 1?"
stage 4: junction + capacitor = two energy levels = qubit
  → "you have a qubit — how do you put it in superposition?"
stage 5: send microwaves → rotate the state → superposition achieved
```

**the bridge must appear visually in the stage** — as text at the bottom, in the info card, or as an animated prompt. the viewer should *want* to press →.

if you can't write a bridge question between two stages, they're either disconnected (rethink the order) or redundant (merge them).

## Analogies

abstract concepts need familiar-world anchors. for every stage, ask: "what everyday thing works like this?"

- don't just state the analogy — show it visually alongside the real thing
- analogies should be specific, not generic ("like a ball rolling in a bowl" not "like energy")
- one good analogy per stage is enough — don't overload
- the analogy helps the viewer *enter* the concept, then the real physics/math takes over

examples:
- Cooper pairs: "like two dancers holding hands — individually they bump into everything, but paired they glide through the crowd"
- Josephson junction: "like a wall with a gap just thin enough that paired dancers can reach through and pull each other across"
- anharmonic energy levels: "like a staircase where each step is a different height — you can target just the first step without accidentally climbing to the second"

## Anti-Patterns

- **"slideshow"**: 5 static stages with labels. no engagement, no story.
- **"PowerPoint"**: corporate boxes, tiny fonts, bullet point lists. this is not a presentation.
- **"answer first"**: showing the result before building understanding. kills curiosity.
- **"decoration movement"**: wobble/float that teaches nothing. motion must have meaning.
- **"text-first"**: paragraphs of explanation with decorative visuals beside them. the visual should carry the meaning — a pile splitting into mole-sized chunks teaches more than a paragraph about molar mass. text annotates, it doesn't explain.
- **"info dump"**: cramming every fact onto one screen. progressive revelation beats density.
- **"museum mode"**: 6 accurate exhibits, each well-researched, but with no thread connecting them. the viewer learns isolated facts but can't see why A leads to B. fix: bridge questions between every pair of stages.

## Depth Over Breadth

- 3 deep stages beat 7 shallow ones
- each stage should have internal movement and evolution
- a stage isn't a picture — it's a living scene
- if a stage has nothing happening beyond a label, merge it into another stage

## The "WHY" Principle

- every step must answer "why is this happening?"
- use color-coded annotations connecting cause to effect
- if you'd have to say "trust me, this is the formula" — add a stage showing why the formula works
- show the mechanism, not just the result
- connect the abstract (formula) to the concrete (visual behavior)
