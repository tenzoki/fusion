The correction note that closed a fabricated measurement carries a false universal of its own

---

**Severity:** Medium
**Domain:** code
**Filed by:** reconciler, session `shared/history/260818-2124-orchestrator-session.md`, domain `code`
**Affects:** `shared/issues/260818-2104_c_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md`, the `Resolved:` block; commit `b3de0ba`, message body
**Cross-references:** `shared/issues/260818-2210_o_a-defect-record-cites-a-verification-run-that-no-copy-of-the-code-it-names-can-produce.md` (the same file, the other half — that record indicts the original Evidence section, this one the correction that replaced it), `shared/issues/260812-1152_o_an-analysis-of-another-project-recorded-no-head-and-turned-a-three-day-old-snapshot-into-a-claim-about-now.md` (the class), `shared/issues/260816-1330_o_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md` (a further instance), `rules/critical-stance.md` §3

---

## The defect

The resolution note that closed `260818-2104` on 2026-08-18 ends its measurement list with:

> The string `--only` occurs in this repository at exactly one position: line 18 of this record,
> inside its own quoted evidence.

Commit `b3de0ba` repeats it in its message body: *"The string `--only` occurs in this repository at
one position: inside the record's own quoted evidence."*

The string `--only` occurs **112 times across 35 tracked files**. Thirty-seven of those, in 14
files, are outside the workbench and are shipped surfaces. Five of them are in
`skills/cleanup/SKILL.md`, the very file the record is about, where `--only` is the skill's own
documented command-line flag: it is in the frontmatter `argument-hint` (line 3), in the opening
paragraph (line 11), in the flag table (line 40), in the paragraph naming the three selectors
(line 55), and in Step 8's own closing sentence (line 243).

## Why it matters rather than being a slip of scope

The intended claim is almost certainly about the *broken awk form*, `print $NF "\t" --only`, not
about the four-character flag. The intended claim is true and the new record states it correctly:
`260818-2210` writes *"`grep -rn` for the broken form over the whole tree matches one line"*, which
is the measurement that was actually taken.

Three things make the loose form worth its own record rather than a silent tidy.

1. **It is the same class the correction was written to name.** `260818-2210` indicts
   `260818-2104` for asserting a run whose output no copy of the code can produce. The remedy for
   that assertion contains an unbounded claim about a whole repository that a one-line `git grep`
   refutes. A reader who checks the note's five bullets in order finds four that hold exactly and a
   fifth that does not, which is precisely the erosion `rules/critical-stance.md` §3 is about: an
   unchecked claim standing beside checked ones borrows their credibility.
2. **The claim is not even true of the broken form at the moment it was written.** The note's own
   third-from-last bullet quotes `git log -S'print $NF "\t" --only'` at line 68 of the same file.
   So the broken form stood at two positions inside that one record when the sentence claimed one,
   and at three across the tree once `260818-2210` quoted it as well.
3. **A reader could act on it.** "The string `--only` occurs at exactly one position" reads as
   evidence that the flag does not exist. It does exist, it is one of the two selectors the cleanup
   skill documents, and `CLAUDE.md`'s administrative-surface paragraph turns on it.

## Evidence

Measured 2026-08-18 at HEAD `8fa3286` by the reconciler:

- `git grep -c -- '--only'` returns 35 files summing to 112 occurrences.
- `git grep -c -- '--only' -- ':!fusion-workbench'` returns 14 files summing to 37 occurrences:
  `agents/curator.md` (2), `agents/orchestrator.md` (1), `CLAUDE.md` (1), `docs/upgrading-to-v9.md`
  (2), `README-agents.md` (7), `README.md` (1), `rules/fusion-workbench-conventions.md` (1),
  `skills/archive/SKILL.md` (1), `skills/cadence/SKILL.md` (1), `skills/cleanup/SKILL.md` (5),
  `skills/curate/SKILL.md` (1), `skills/help/SKILL.md` (1), `skills/log-activity/SKILL.md` (1),
  `skills/setup/SKILL.md` (1).
- `grep -rn -F 'print $NF "\t" --only'` over the tree returns three lines, all inside records:
  `260818-2104_c_*.md:18`, `260818-2104_c_*.md:68`, and `260818-2210_o_*.md:16`.
- `sed -n '18p'` on the closed record returns `| awk -F/ '{ print $NF "\t" --only }'`, so the line
  number the note cites is right; only the universal around it is wrong.

## What is not claimed here

The rest of the resolution note was re-derived independently by this reconciler and every other
bullet holds: the pickaxe over the correct-form line returns nothing, `git log -1` on
`skills/cleanup/SKILL.md` is `381f6d8` dated 260816-0040, the work tree and `~/.fusion` copies are
byte-identical and both carry `$0`, no `tenzoki-plugins` marketplace cache clone exists under
`~/.claude/plugins/marketplaces/`, and the block executed as written returns
`fusion-workbench/shared/history/260818-2050-curator-run.md`. The closure of `260818-2104` as not
reproducible is correct and is not disputed.

No mechanism is proposed. A gate that re-ran a record's quoted measurements would face the same
undecidability `260818-2210` declines to answer.

## Fix direction

Append one line to the resolution note narrowing the claim to the broken form, in the wording
`260818-2210` already uses. The commit message cannot be corrected and does not need to be; this
record is where a reader arriving from `git log` finds the correction, which is the arrangement
`260818-2210` set up for the other half of the same file.

---
Resolved: the false universal is corrected where it stands, and the sentence itself is left
unedited above it. A correction block appended to
`260818-2104_c_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md`
names the bullet, states that the measurement taken was of the broken `awk` form and not of the bare
token, and gives the re-derived figure: `git grep -c -- '--only'` returns 35 tracked files. It also
records this record's second point, that the narrow claim was already untrue of the broken form when
written, since the pickaxe invocation in the same note quotes it a second time.

The wording of this record's `## Fix direction` was followed rather than improved on: append, do not
edit. Commit `b3de0ba` keeps the false sentence and is not rewritten.

Verified after the edit: the correction block is present, the original bullet is unchanged, and both
records now state the same narrow claim in the same terms.

**Correction to this record's own Evidence section, appended by the orchestrator after a narrow
verification pass, and reported by the reconciler that wrote it.** Two figures above are wrong, in
the same lines-versus-occurrences way the record was written to catch.

`git grep -c` counts matching **lines**, not occurrences. So *"`git grep -c -- '--only'` returns 35
files summing to 112 occurrences"* mixes the two: at `8fa3286` those per-file counts sum to **87
lines**, and 112 is the `grep -o` occurrence figure for the same tree. Both numbers are real, they
measure different things, and the sentence attributes one to the command that produced the other.

The same conflation makes the second: the 14-row table below, presented as *"14 files summing to 37
occurrences"*, sums to **26**. Twenty-six is the line count outside the workbench; 37 is the
occurrence count. The table is a line-count table under an occurrence-count total, and it is visibly
wrong on its own page.

The finding this record makes is untouched. `--only` is the cleanup skill's documented flag, it is in
14 shipped files, and the closed record's claim of one occurrence tree-wide is false under either
unit. Only the units of the two supporting figures were wrong. Filed and closed as
`shared/issues/260818-2249_c_*`.
