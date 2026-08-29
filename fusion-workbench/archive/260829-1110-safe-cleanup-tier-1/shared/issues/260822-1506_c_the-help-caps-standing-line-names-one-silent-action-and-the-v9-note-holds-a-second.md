The help cap's standing line names one silent action, and the v9 note it dropped holds a second

---

`6781814` capped `/fusion:help`'s upgrade section at three releases and replaced the three older
paragraphs with one standing line (`skills/help/SKILL.md:107`). The commit's stated basis for what
that line says is:

> Of the three paragraphs the cap removed, exactly one held an action that fails silently when
> skipped — a Turn budget stranded in a retired config file — so the standing line names that one
> rather than gesturing at the directory.

**Exactly one is wrong. It is two.**

---

**The second one.** The removed *"Coming from a v8 or earlier install"* paragraph named, among the
leftovers a pre-v9 project can be holding, *"a `**Domain:** strategic` or `knowledge` line"*, and
pointed at `$FUSION_SRC/docs/upgrading-to-v9.md` for the checklist. That note's check 2
(`docs/upgrading-to-v9.md:54-59`) states the silence in bold, in its own words:

> **An unrecognised value is not an error: it falls back to `code`, silently**, in `taskplanner`,
> `reconciler` and `playmaker` alike. So an anticipated Circle record, a backlog entry or a dispatch
> prefix still carrying one of the two retired values will run, and will run as a `code` domain
> without saying so.

That is the same shape as the Turn budget: a leftover the project still holds, read by nothing that
complains, changing behaviour without a word. Skipping it means Circles and backlog entries that
declared a non-`code` domain now run as `code` and nothing says so.

**The third one is genuinely clean, and was checked.** The removed *"Coming from a v10.0 or v10.1"*
paragraph points at `docs/upgrading-to-v10-2.md`, whose `## What you have to do` opens
*"**Nothing, for the upgrade itself.**"* (`:62`) and whose one case is an explicit **halt**
(`:66-71`). A halt is loud. That paragraph held nothing of this kind.

**Where the wrong count most plausibly came from.** `docs/upgrading-to-v9.md:35` opens the checklist
with *"Six checks. Each is optional — nothing here is load-bearing, and skipping all six leaves a
working installation with some dead files in it."* Read alone, that preamble gives exactly the
commit's conclusion. Check 2, nineteen lines below it, contradicts its own preamble. That internal
contradiction in the v9 note is a second defect and is filed separately rather than folded in here,
because fixing the help topic does not fix it.

**What the cost actually is.** The standing line still tells a reader to work through the notes under
`docs/`, so `upgrading-to-v9.md` remains in a v8 user's reading path and the information is reachable.
What is lost is the singling-out: the line promises *"One of them carries an action that fails
silently"*, and a reader who takes that promise literally reads the v10 note, does the Turn-budget
move, and stops. The wrong number is the defect, not an unreachable document.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Medium.
**Affects:** `skills/help/SKILL.md:107`.
**Filed in the shared store:** no Circle is active.
**Cross-references:**
`260822-0946_*_the-v10-5-release-note-reaches-the-readme-and-not-fusion-help-because-the-skills-bound-has-30-bytes.md`
(the record the cap closed);
`260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`
(the other consequence of the same cap, already filed by the commit).

**The fix.** Change the last sentence of `skills/help/SKILL.md:107` from one silent action to two, and
name the second as tersely as the first. Roughly 120 bytes on `skills/*/SKILL.md`, which had 4 016 of
head-room at `6781814`, so it does not need a cut in front of it. A form that costs nothing to check
later:

> Two of them carry an action that fails silently when it is skipped: v10 retired the project-root
> `fusion-guard.json`, and a Turn budget left inside it is not read, so it has to be copied into
> `fusion.json` before the old file is deleted; and v9 retired the `strategic` and `knowledge` domain
> values, and a record still carrying one runs as `code` without saying so.

---
Resolved: The finding holds. Verified against the tree: `docs/upgrading-to-v9.md:54-59` states
the silent fallback in bold, and `docs/upgrading-to-v10-2.md:62-71` opens its "What you have to
do" with "Nothing, for the upgrade itself." and makes its one case an explicit halt. Two silent
actions, not one.

`skills/help/SKILL.md:107` now names both, in the same terse form: the v10 Turn budget stranded
in the retired `fusion-guard.json`, and the v9 retirement of the `strategic` and `knowledge`
domain values, where a record still carrying one runs as `code` without saying so. The line was
rewritten once for this finding and for
`260822-1506_*_the-help-caps-standing-line-makes-three-claims-about-docs-and-none-of-the-three-resolves.md`
together, since both are defects in the same sentence.
