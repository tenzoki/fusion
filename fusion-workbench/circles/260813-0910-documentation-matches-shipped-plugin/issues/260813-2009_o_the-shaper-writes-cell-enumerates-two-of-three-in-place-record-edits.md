The rewritten shaper Writes cell enumerates two of the three in-place edits its portfolio-activation mode makes

---
`README-agents.md:25` now names, as the shaper's portfolio-activation writes, "the cited Circle record's `## Directive` and `## Grounding snapshot` sections, in place". `agents/shaper.md:53` mandates a third write to that record in the same breath — the `**Active spec/plan:**` field — and `skills/next/SKILL.md:250` depends on it having happened. A cell rewritten to be exhaustive is missing the one write another consumer reads.
---

## Both sides read

**Documentation side**, `README-agents.md:25`, the Writes column:

> `planning/` (spec files), `decisions/` (decisions the user defers), `issues/`, `history/`. In portfolio-activation mode also the cited Circle record's `## Directive` and `## Grounding snapshot` sections, in place. …

**Artifact side**, `agents/shaper.md:53`, mode 3's write list, read in full:

> - AND updates the cited record's `## Directive` (replace contents) and `## Grounding snapshot` (replace contents) sections in place, **and sets its `**Active spec/plan:**` field to the spec's workbench-relative path**. **No other section of that record may be edited.**

and `agents/shaper.md:52`, which states the same write from the spec's side:

> … and the record's `**Active spec/plan:**` field cites it there.

**The consumer that reads it**, `skills/next/SKILL.md:250`:

> - `**Active spec/plan:**` is left exactly as it stands. If shaper's portfolio-activation mode already pointed it at a spec, that citation is current; if it reads `(none yet)`, this skill has no way to find the right file and must not guess one.

So `/fusion:next` treats the field as authoritative precisely because shaper wrote it, and has no fallback when it did not.

## Why the omission is easy to make and worth correcting

`**Active spec/plan:**` is a frontmatter *field*, not a `##` section, which is why `agents/shaper.md`'s Scope exception ("no other **section** of that record may be touched", `:24`) does not contradict `:53`. The README cell inherited the Scope sentence's section-shaped framing and with it the field's absence. The distinction is real in the prompt and invisible in the cell.

Everything else in the rewritten row was checked and holds: the four invocation modes against `agents/shaper.md` `## Four invocation modes`; the backlog read against `$SCAN_BACKLOG` in `bin/fusion-paths shaper`; the new Circle directory and `_a_circle.md` against `:76-78`; "the six artifact subdirectories" against `rules/circle-records.md:63`, which names them.

## Scope

`README-agents.md` only (shipped doc). No code behaviour is affected.

## Recommended fix direction

Add the third write to the cell: in portfolio-activation mode the shaper also sets the record's `**Active spec/plan:**` field to the spec it just wrote. One clause, and it is the write a reader of `/fusion:next` will come looking for.

Filed by: coderev (review of Circle Turn 2, range `28f3029..5d51abd`, commit `9a11254`).
