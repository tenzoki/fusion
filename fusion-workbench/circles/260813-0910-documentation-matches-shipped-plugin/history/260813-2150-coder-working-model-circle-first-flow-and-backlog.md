# Coder — plan step 7: docs/working-model.md, the Circle-first flow, the backlog store, the playmaker's role

**Date:** 2026-08-13 21:50
**Agent:** coder
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Plan:** `planning/260813-1820_p_documentation-matches-shipped-plugin.md`, step 7
**Status:** Complete

## What was done

Three prose passages authored in `docs/working-model.md`, plus one correction found inside the same
file. This is the Circle's first step whose subject is an argument rather than a fact, so what
follows names, for every claim written, the artifact it was checked against. No claim here rests on
a match count.

## Passage 1 — §2, the shaper produces a spec

**The defect, both sides read.** `docs/working-model.md:35` said the shaper "produces a **spec**",
full stop, and the flow diagram above it drew one entrance. `agents/shaper.md` `## Four invocation
modes` (`:39-105`) gives four, and the fourth writes no spec at all: anticipated-circle mode's
artifact is the Circle record, stated at `:64` ("**Does NOT write a spec at `$OUT_PLAN`.** The
Circle record is the artifact") and again in the Scope exception at `:28`.

**What was written.** The fenced flow block gained a second line for the `/fusion:direct` entrance,
labelled as capture only — no gate, no plan, no Turn loop. Two paragraphs follow the existing
bullet list. The first splits the four modes three-to-one: user-direct, in-Circle clarification and
portfolio-activation all end in a spec, anticipated-circle ends in a Circle, and the reason is
stated rather than left as a rule ("there is nothing to approve yet — you are writing down a goal,
not commissioning work"). The second carries the Circle-first placement rule: the mode creates the
Circle as its first write and re-resolves its paths against it, so its history file and any deferred
decision land inside. Read against `agents/shaper.md:66-77` (the first-write rule and the one
permitted second resolution) and cited to `rules/fusion-workbench-conventions.md`
`## Path Resolution`.

## Passage 2 — §1, how a Circle comes into existence

**The gap, both sides read.** §1 described the Circle's states, its directory shape and the
`.active-circle` pointer, and never said where a Circle comes from. Three surfaces answer that and
none was named: `skills/direct/SKILL.md` (the capture entrance), `skills/memo/SKILL.md:9-15` and
`:110-126` (the backlog entrance and the one-file-per-idea shape), and
`rules/fusion-workbench-conventions.md` `## Backlog entries` (the store's definition and its two
bounds).

**What was written.** A `### How a Circle comes into existence` subsection with three entrances —
implicit from a request, captured by `/fusion:direct`, promoted from a backlog entry — then a
paragraph defining the backlog and its two bounds (no agent files an entry; the backlog is not the
work queue), then an ASCII sketch of the idea-to-Circle path from `/fusion:memo` through playmaker
ranking, `/fusion:next` and `/fusion:direct` to activation. The sketch is a sketch rather than a
paragraph on the `rules/user-facing-output.md` `## Sketch structure instead of narrating it`
ground: it is a five-hop chain with a different actor at each hop.

Two accuracy points settled by reading rather than by inference. The entry's marker at filing is
always open — `skills/memo/SKILL.md:110` says the skill "writes no other marker and changes none".
And the playmaker renames *the ones it recommends*, not only the top one: `agents/playmaker.md:117`
has it rename to `_p_` what it now recommends and back to `_o_` what it no longer does.

The closing sentence of the `.active-circle` paragraph was rewritten in the same pass: it pointed
at a "portfolio note in `README.md`" without saying what the portfolio is. It now names
`portfolio.md` and the agent that regenerates it, and keeps the README pointer.

## Passage 3 — §5, the walkthrough

**The plan's recommendation was followed**, and the reading confirmed it rather than merely
permitting it. §5a marks a gate or a hook at almost every step — plan gate, guard, churn warning,
commit lock, Coherence check, reconciliation. The idea-to-Circle path crosses none of them. A step
folded into 5a would have sat inside a numbered sequence whose whole rhetorical work is "here is
where fusion stops and asks you", and inherited a gate count that is wrong for it.

§5 is now "Two worked walkthroughs" with a two-sentence lead-in, 5a the existing code session
(unchanged except for the correction below), and 5b five steps: file, rank, read the briefing,
promote, activate.

**The playmaker sentences use step 6's reading, not a fresh one.** Step 6 read
`agents/playmaker.md:40-72` and `:154-176`; 5b step 2 is written from that same material plus Step
2b at `:108-121`, which step 6's row work did not need. What it states: the `_o_`/`_p_` rename is
the one autonomous backlog write (`:121`, "Why the rename is the one autonomous write"); split,
merge, close and defer are four operations each needing a confirmation the run holds for that
operation (`:60`, `:119`, `## Two mandates, by dispatch path`); the agent never originates an entry
(`:66`). 5b step 3's "splitting first, never for shaping" is `:114`. 5b step 4's promotion and
`Promoted:` line is `agents/shaper.md:86-105`, and the multi-idea branch there is the same lines.
**Nothing in step 6's reading was found wrong**, so there is nothing to report as a divergence.

The step's caution was acted on: `skills/direct/SKILL.md` and `skills/memo/SKILL.md` were read in
full, not the agent prompts alone. Two facts in this passage exist only in a skill body and could
not have been got from a prompt — that `/fusion:memo` resolves no read key into the backlog and so
cannot consolidate it (`skills/memo/SKILL.md:31`), and that `/fusion:direct` passes a backlog path
through verbatim without opening the file (`skills/direct/SKILL.md:77`).

## One correction outside the three passages

`docs/working-model.md:95` (§5a step 5) read: "the middleware file isn't protected, sensitivity is
normal, so the write lands". The protected-path check it names was removed on 2026-08-12, which
**§4 of this same document says**, at `:83`: "There was a third until 2026-08-12 — a **protected
path** … The whole half was removed." Two sections of one document disagreed. The line now reads
"the middleware file sits in no decision-governed area, so nothing blocks and the write lands",
which is what §4's own summary sentence says still blocks. Both sides of this one are inside the
file in scope; no other file was touched.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 49 files, 1022 tests. Identical to step 6's run, which
is the expected result: the citation lint scans `docs/` (its `surface()` includes
`mdFilesUnder("docs")`), so every citation added here was resolved by it, and nothing else in the
suite reads this document.

Citations added, all resolved by that gate: `skills/direct/SKILL.md`, `skills/memo/SKILL.md`,
`agents/shaper.md` `## Four invocation modes`, `agents/playmaker.md` `## Two mandates, by dispatch
path`, `rules/fusion-workbench-conventions.md` `## Backlog entries` and `## Path Resolution`.

## Files changed

- `docs/working-model.md` — §1 subsection and backlog paragraph, §2 diagram branch and two
  paragraphs, §5 split into 5a/5b with the new second walkthrough, one corrected sentence at §5a
  step 5
- the plan file — step 7 marked `[DONE]` with a completion note; the §5 Open Question answered

No commit was made; the orchestrator commits.
