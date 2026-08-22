CLAUDE.md's docs/ row says /fusion:help points at every upgrade note, and the cap made that false

---

**Severity:** Low. Nothing breaks and no gate fails; a normative statement in `CLAUDE.md` overstates
what one shipped file now does.
**Domain:** code
**Filed by:** coder, step 6 of the C0 plan
**Affects:** `CLAUDE.md`, the `docs/` row of `## Layout`
**Owner:** `curator` — `CLAUDE.md` is a normative surface and its edits go through a user gate
(`/fusion:cleanup --only claude-md`), not through the executor that caused the drift.
**Cross-references:**
`shared/issues/260822-0946_*_the-v10-5-release-note-reaches-the-readme-and-not-fusion-help-because-the-skills-bound-has-30-bytes.md`
(the defect whose fix caused this);
`shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` step 6

---

## The statement

`CLAUDE.md`'s `docs/` row reads, of the `upgrading-to-vN.md` files: "Each is pointed at from
`README.md` `## Install` and from `/fusion:help`'s update topic."

## What is true now

The `README.md` half still holds: all six notes are pointed at, one paragraph each.

The `/fusion:help` half stopped holding at step 6 of the C0 plan. The update topic in
`skills/help/SKILL.md` is now capped at the last three releases — v10.5, v10.4, v10.3 — with one
standing line pointing at `$FUSION_SRC/docs/` for the rest. `upgrading-to-v10-2.md`,
`upgrading-to-v10.md` and `upgrading-to-v9.md` are reachable through that line and are no longer named.

The cap was the user's choice at Gate B, over compressing the tail and over raising the `skills/`
baseline. It is not a regression to undo; the sentence in `CLAUDE.md` is what has to move.

## Why it is filed rather than fixed

`CLAUDE.md` was outside the file scope of the step that caused the drift, and this project routes
its normative surfaces through the curator at a user gate rather than letting the executor that made
a change also restate the rule about it. The correction is a sentence: say that each note is pointed
at from `README.md`, and that `/fusion:help`'s update topic carries the last three releases with a
standing pointer to `docs/` for older ones.

## What would catch this next time, and it does not exist

No gate compares a claim in `CLAUDE.md` against the file it is a claim about. `reference-resolution-lint`
resolves paths and headings, not assertions; `derivable-enumerations-lint` carries no check for this
row. This is the same hole the `templates/` and `docs/` inventory rows record in their own text — a
statement about a shipped file's contents that nothing recomputes.
