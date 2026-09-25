The relocated growth-bounds bullet says the zero-head-room bound "reaches this file", and at its new home that is false and contradicts the paragraph two lines above it

---

`L14` moved the growth-bounds convention out of `CLAUDE.md` into `README-hooks.md` `### Growth bounds on the shipped text`, byte for byte. Two of its sentences were written about `CLAUDE.md` and read as being about `README-hooks.md` now. One of them is false there, and the file states the opposite two lines earlier.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** At `7ea6e40b`, `README-hooks.md:514`, inside `### Growth bounds on the shipped text` (heading at `:487`):

> **One further bound works differently and reaches this file**: `hooks/lib/__tests__/fixtures/dispatch-path.baseline` charges `CLAUDE.md` to all eleven dispatch paths at **zero head-room**, so N bytes added here puts every path N over at once and must be paid for inside the same paths.

`README-hooks.md` is charged to no dispatch path and carries no bound. `README-hooks.md:512`, in the same section, says so in as many words:

> Nothing bounds them, and nothing bounds `hooks/*.ts`, `hooks/lib/*.ts`, `bin/`, `docs/` or the READMEs either.

So one section asserts that N bytes added to this file puts eleven paths over, and asserts two lines above that nothing bounds it. The warning was correct about `CLAUDE.md` and is the one a `CLAUDE.md` edit meets first, so it is worth keeping — at an address where it is true.

The same passage also points at itself: *"Which surfaces are bounded … is one table in `README-hooks.md` `### Growth bounds on the shipped text`. Do not copy a figure out of it into this file"* now sits inside that file and that section.

**Why no gate sees it.** `reference-resolution-lint` resolves the path token `README-hooks.md`, which resolves. Nothing reads which file a sentence's "this file" denotes.

**Scope.** `README-hooks.md:514`. The sibling instance of the same class is `260916-2206_*_the-relocated-dispatch-parameters-bullet-names-its-own-section-as-the-roster-it-must-not-restate.md`; the two are one pattern with two sites and the repair is per site.

**Acceptance test.** No sentence in `README-hooks.md` `### Growth bounds on the shipped text` claims a bound over the file it sits in, and the dispatch-path warning names `CLAUDE.md` explicitly rather than by deixis. A reader who greps that section for `this file` finds no claim that contradicts `README-hooks.md:512`.

**Cross-references:** 260916-1612-curator-run.md, 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md

---
Resolved: the bullet at `README-hooks.md` `### Growth bounds on the shipped text` names `CLAUDE.md` as the file the zero-head-room dispatch-path bound reaches, its section citation now reads as the address a pointer cites, and "into this file" reads "into the pointer"; the path and anchor token census of the line is unchanged, so the reference lint's pinned baseline does not move. One `this file` remains in the section, the true possessive in the paragraph on why the instrument sits under `helpers/`, so the plan's `grep -c` acceptance is met at 1, not 0. Concept accepted by a consultant read with two wording changes; fixed in the commit that carries this line.
