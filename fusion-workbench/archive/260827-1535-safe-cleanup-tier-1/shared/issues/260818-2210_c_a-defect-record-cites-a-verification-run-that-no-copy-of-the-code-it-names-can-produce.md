A defect record cites a verification run that no copy of the code it names can produce

---

**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session `260818-2124-orchestrator-session.md`
**Affects:** `260818-2104_*_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md`; the filing discipline in `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY`; the honesty norm in `rules/critical-stance.md` §3
**Cross-references:** `260812-1152_*_an-analysis-of-another-project-recorded-no-head-and-turned-a-three-day-old-snapshot-into-a-claim-about-now.md` (the same class, measured on an analysis rather than on a defect record)

---

## The defect

Record `260818-2104_*_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md` reported a typo in `skills/cleanup/SKILL.md` `## Step 8`, claiming the
`LAST_RUN` block reads `{ print $NF "\t" --only }` where `$0` belongs. It carried an `## Evidence`
section opening "Run today against this repository", stating that the block "returns `0`" and that
the same block with `$0` substituted returns `260818-2050-curator-run.md`.

The token is not in the file. It is not in the installed copy. It has never been in this
repository's history of that file: `git log -p --follow` over the path yields exactly one version of
that line, introduced already correct, with no later edit. The block as it stands returns the very
path the record presents as the post-fix result.

So the record did not report a defect it observed and mis-attributed. It reported a defect that does
not exist, and asserted a run whose stated output no copy of the code can produce.

## Why this is worth its own record

The closed record's own reasoning about `awk` is correct: `--only` would parse as two unary minus
operators on an uninitialised variable and evaluate to `0`. Sound analysis of a counterfactual is
not the problem. The problem is the sentence that converted it into an observation.

`rules/critical-stance.md` §3 names this exactly: *"'I checked it' is permitted only when you
actually read the file, ran the command, or saw the output — and then you cite it. An unchecked
claim dressed as a checked one is the most damaging pattern of the three."* This record is that
pattern, in the artifact store rather than in chat, where it persists and is read later as
established fact.

The cost is measurable and was paid. A session opened against this backlog dispatched no executor
only because it re-measured before acting; the instruction it was given was to fix the typo. A
session that trusted the record would have "fixed" a correct line, and the plausible edit — writing
`$0` where `$0` already stands — is a no-op that leaves the record closed as resolved, the
fabrication unexamined, and a commit in the history claiming a repair that repaired nothing.

## What is not claimed here

No mechanism in fusion could have caught this. No test executes a skill body, which the closed
record says itself, and no gate reads a defect record's evidence section against the code it cites.
Whether one should exist is not settled by this record and is not proposed by it: a gate that
re-runs quoted evidence would need to know which quoted text is a command, which is the undecidable
shape `rules/critical-stance.md` §4 warns against answering by approximation.

What is claimed is narrower and verifiable: one record in the store asserts a run that did not
happen, the assertion was load-bearing for the record's entire content, and the store now holds a
second instance of the class `260812-1152_*_an-analysis-of-another-project-recorded-no-head-and-turned-a-three-day-old-snapshot-into-a-claim-about-now.md` opened.

## Evidence

Measured 2026-08-18 at HEAD `53b6862`:

- `git log -p --follow -- skills/cleanup/SKILL.md | grep -E '^[+-].*awk -F/'` returns one line:
  `+done | awk -F/ '{ print $NF "\t" $0 }' | sort | tail -1 | cut -f2)"`. No `-` counterpart exists,
  so the line has never been changed since it was introduced.
- `git log -1 -- skills/cleanup/SKILL.md` is `381f6d8`, dated 260816-0040, two days before
  `260818-2104_*_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md` was filed. The file was not modified between the filing and this measurement.
- The work tree and `~/.fusion` both carry `$0`, both at plugin version 10.2.0. No other copy of
  the file exists under `~/.claude` or `~/.fusion`; the marketplace cache clone is absent.
- Executing the block against this workbench returns
  `260818-2050-curator-run.md`.
- `grep -rn` for the broken form over the whole tree matches one line: the quoted evidence inside
  the record itself.

## The claim also entered the git history

Commit `53b6862`, which filed the record, carries the same assertion in its message body: *"Found by
running the step; nothing executes a skill body, so no test does."* The second clause is true and is
the reason the first was never checked. The first is the fabrication.

A record can be closed with a correction appended, and this one has been. A commit message cannot be
edited without rewriting history, so `53b6862` states permanently that a run happened which did not.
That is not a reason to rewrite anything; it is a reason to note here where the claim survives, so a
later reader who reaches it through `git log` rather than through the record finds the correction
from this end.

---
**Reconciliation 260818-2230-reconciliation.md** (reconciler, domain `code`). Every claim in this record was
re-derived independently at HEAD `8fa3286` and holds: the pickaxe over the correct-form line returns
nothing, `git log -1 -- skills/cleanup/SKILL.md` is `381f6d8` dated 260816-0040, the work tree and
`~/.fusion` copies of the file are byte-identical under `diff -q` and both carry `$0`, no
`tenzoki-plugins` clone exists under `~/.claude/plugins/marketplaces/` (only
`claude-plugins-official`), and the Step 8 block executed as written returns
`260818-2050-curator-run.md`. Marker stays open: the fabrication is
corrected in the store but survives in the message of commit `53b6862`, which is what this record
exists to reach.

Also seen, in the correction rather than in the original: the resolution note that closed
`260818-2104_*_the-cleanup-skills-consolidation-measurement-carries-a-flag-name-where-a-shell-variable-belongs.md` carries a false universal of its own, filed as
`260818-2227_*_the-correction-note-that-closed-a-fabricated-measurement-carries-a-false-universal-of-its-own.md`.
Filed separately rather than as a line here because it is a different sentence in a different half
of that file, written by the correcting session rather than by the one this record indicts.

---
Resolved: moot — the fabrication is corrected in the store and the commit message it survives in is immutable, so nothing further can be done from here; `git show -s 53b6862` still carries the claim, and this record is the correction a `git log` reader reaches.
