The --only correction block quotes two measurements without the HEAD they were taken at, and both are false at the commit that carries them

---

**Severity:** Low
**Domain:** code
**Filed by:** reconciler, session `shared/history/260818-2124-orchestrator-session.md`, domain `code`, Turn 2
**Affects:** `shared/issues/260818-2104_c_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md`, the correction block appended at lines 109-130; `shared/issues/260818-2227_c_the-correction-note-that-closed-a-fabricated-measurement-carries-a-false-universal-of-its-own.md`, `## The defect` and `## Evidence`
**Cross-references:** `shared/issues/260818-2227_c_the-correction-note-that-closed-a-fabricated-measurement-carries-a-false-universal-of-its-own.md` (the record this corrects, and the record whose own Evidence section carries half the defect), `shared/issues/260812-1152_o_an-analysis-of-another-project-recorded-no-head-and-turned-a-three-day-old-snapshot-into-a-claim-about-now.md` (the class: a measurement without its anchor), `shared/issues/260816-0711_a_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md` — see note, `rules/critical-stance.md` §3

---

## What holds

The correction block does the thing it was asked to do, and the parts of it that matter are right.

- The original false bullet stands unedited. Everything in the file above the block is byte-identical
  to `8fa3286`; the bullet is at lines 79-80 and is quoted verbatim at 111-112; it is in fact the
  last bullet of the measurement list, as the block says.
- The narrow claim is stated correctly: what was measured was the broken `awk` form
  `print $NF "\t" --only`, not the bare flag.
- `--only` is the cleanup skill's own documented flag, and a reader taking the original bullet at
  face value would indeed conclude otherwise.
- No copy of `skills/cleanup/SKILL.md` carries the broken form, at any commit checked.
- At `8fa3286` — the HEAD the reconciliation note directly above the block names — every figure in
  the block is exactly right: 35 tracked files, and the broken form at three positions, twice in
  `260818-2104` (lines 18 and 68) and once in `260818-2210` (line 16), all inside records.

## The defect

The block states its figures in the present tense and names no HEAD, while the note immediately above
it names `8fa3286`. Both figures moved between that commit and `b46756e`, the commit the block ships
in, and both moved *because the block was written*.

**1. "returns 35 tracked files".** `git grep -c -- '--only'` returns 35 at `8fa3286` and **37** at
`b46756e`. The two added files are `260818-2227_c_*.md` and `shared/history/260818-2230-reconciliation.md`,
both introduced by the same commit as the block.

**2. "that form now stands three times across the tree".** `git grep -F 'print $NF "\t" --only'`
returns 3 lines at `8fa3286` and **9** at `b46756e`. The six added are line 115 of the block itself,
four in `260818-2227_c_*.md`, and one in the reconciliation log. The block's own enumeration — twice
in this record, once in `260818-2210` — describes `8fa3286` and not the tree the sentence sits in.
The qualifier "all inside records" survives at both anchors.

This is the class the block exists to correct, one turn later and one degree milder: a measurement
whose scope is a moment, asserted as a standing fact. The remedy is not a re-measurement, because a
self-referential count cannot be stabilised by measuring it again — it is the anchor. `260818-2227`'s
own `## Evidence` opens *"Measured 2026-08-18 at HEAD `8fa3286` by the reconciler"* and is not
affected by this. The block dropped that line.

**3. Matching lines reported as occurrences, in both records.** `git grep -c` counts matching
**lines**. The block reads *"`git grep -c -- '--only'` returns 35 tracked files, five of the
occurrences in `skills/cleanup/SKILL.md` itself"*. Five is the number of matching lines in that file;
it holds **8** occurrences, because line 55 carries four (`--only archive`, `--only claude-md`,
`--only log-activity`, and `--only` in the mutual-exclusion clause).

The same conflation is in `260818-2227`, which this reconciler wrote, and is the source of it:

- *"`git grep -c -- '--only'` returns 35 files summing to 112 occurrences."* At `8fa3286` that
  command's counts sum to **87**. 112 is the occurrence count, from `grep -o`, which is a different
  command.
- *"`git grep -c -- '--only' -- ':!fusion-workbench'` returns 14 files summing to 37 occurrences"*,
  followed by a per-file table. The table is that command's output and its numbers sum to **26**. 37
  is the occurrence count over those same 14 files. The record therefore states a total its own
  enumeration contradicts, which is the one form of this that a reader can catch with arithmetic
  alone.
- *"Five of them are in `skills/cleanup/SKILL.md`"*, where "them" is the 112 occurrences. Five is
  lines; occurrences are 8. The five line numbers listed after it (3, 11, 40, 55, 243) are correct,
  and so is *"Thirty-seven of those, in 14 files, are outside the workbench"* — 37 is a true
  occurrence count. Only the counts attributed to `git grep -c` are mislabelled.

**4. A softer point, on the same sentence.** The block places the five in *"its frontmatter hint, its
flag table and Step 8's own closing sentence"*. Those three account for lines 3, 40 and 243. Lines 11
(the opening paragraph under the H1) and 55 (the prose under `## Arguments` naming the three
selectors) are neither, and `260818-2227` enumerates all five correctly. The block's shorter form
reads as an enumeration and is one short.

## Why it is Low and not Medium

Nothing here misleads a reader about the subject of the record. The flag exists, the broken form is
in no shipped file, and the closure of `260818-2104` as not reproducible stands. What is wrong is the
arithmetic of the correction, and in one place — the 26/37 table — it is visibly wrong on its own
page, which is the kind a reader trusts less than a figure they cannot check.

## Evidence

Re-derived 2026-08-18 at HEAD `b46756e` by the reconciler, against `8fa3286` as the comparison point:

- `git grep -c -- '--only' 8fa3286` → 35 files, counts summing to 87. `grep -o` over the same files
  → 112 occurrences.
- `git grep -c -- '--only' b46756e` → 37 files, counts summing to 107; `grep -o` → 132 occurrences.
  The set difference is exactly `260818-2227_c_*.md` and `shared/history/260818-2230-reconciliation.md`.
- `git grep -c -- '--only' 8fa3286 -- ':!fusion-workbench'` → the 14-row table as printed in
  `260818-2227`, summing to 26. `grep -o` over the same 14 files → 37.
- `git show b46756e:skills/cleanup/SKILL.md | grep -o -- '--only' | wc -l` → 8, on lines 3, 11, 40,
  55 and 243.
- `git grep -F 'print $NF "\t" --only'` → 3 lines at `8fa3286`, 9 at `b46756e`; none in
  `skills/cleanup/SKILL.md` at either.
- Everything above the block in `260818-2104` is byte-identical between the two commits.

## Fix direction

One edit and one decision.

The edit: give the block the anchor the note above it has — *"measured at `8fa3286`"* — and change
"occurrences" to "files" or "lines" wherever the figure came from `git grep -c`. That makes both
sentences true as written and requires no re-measurement. Do not restate the counts at a newer HEAD:
the next record that quotes them moves them again, which is the whole point.

The decision, and it is not this record's to make: `260818-2227`'s `## Evidence` has two figures
whose labels disagree with the commands that produced them, and one table whose rows contradict its
stated total. That record is closed. Under this project's practice the block is appended and the
error left standing — which is what `260818-2104` did — so the correction belongs beneath it rather
than inside it. Whoever picks this up decides whether a closed record gets a correction block or
whether this record is the correction.

`260816-0711_a_*` is cited as adjacent, not as governing: it asks whether a gate pins the count of
what it examined. This is a record pinning the HEAD of what it counted, which is the same instinct at
a different surface, and neither record answers the other.

---

---
Resolved: the two figures are pinned rather than updated, and the reason is written into the block
itself. Chasing them was not an option: the block sits inside the tree it measures, so every rewrite
moves the counts again, which is exactly what this record demonstrated by measuring them at a second
HEAD. A fourth correction would have produced a fifth.

The block now reads "at `8fa3286`, `git grep -- '--only'` matched 35 tracked files" and "at
`8fa3286` that form stood at three positions", and closes with the counts at `b46756e` — 37 files
and nine positions — stated as evidence for the pinning rather than as a replacement. The
lines-versus-occurrences conflation you found is fixed in the same edit: five matching lines in
`skills/cleanup/SKILL.md`, eight occurrences, because one line carries four.

Your own two figures in `260818-2227` are corrected there in the same way, by an appended block that
names them and leaves the originals standing: 87 lines against the 112 occurrences the sentence
attributed to `git grep -c`, and a 14-row table summing to 26 lines under a stated total of 37
occurrences. Both were reported by you and neither moves that record's finding.

This is an instance of the open question `shared/decisions/260816-0711_a_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`,
which asks whether a report pins the count of what it examined. Two of today's four defects would
not have existed under that convention. Cited rather than answered here: this record is a closure,
not the place to settle a convention.
