The archive skill says it reads the new rule, and no step in its Process reads it

---

The whole of decision `260816-1707` option 1 rests on one claim: that
`rules/workbench-tracking.md`, emitted to no agent, is nevertheless read by a named non-agent
consumer that says so. The realisation wrote the sentence and did not add the read.

---

`skills/archive/SKILL.md:11`, the sentence added by `b200902`:

> **This skill reads `rules/workbench-tracking.md`** — that file is the authoring home of the
> record-versus-live-state split, and what it classifies as a record is what this skill must preserve
> rather than discard when it decides what to archive.

Nothing in the body performs that read.

- A skill receives no rule emission. `bin/fusion-rules` serves agent names and exits 2 on anything
  else — which is the premise the decision itself opens with — so the only way a skill body reads a
  rule file is by instructing it.
- `## Step 1 — Resolve paths` (`skills/archive/SKILL.md:33-65`) runs `bin/fusion-paths archive` and
  nothing else. There is no other setup step.
- `## Process` steps 1-9 (`:152-264`) never name the file. Step 1 resolves paths, step 2 parses the
  argument, step 3 builds candidates, step 4 is the `CLAUDE.md` citation check, steps 5-9 propose,
  confirm, move, manifest and report.

Nor does any behaviour depend on the read, because the classification is restated inline both places
the file is cited. Safety filter 1 (`:91-97`) enumerates the reserved root-anchored surfaces in the
skill's own words and cites `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` —
not the tracking rule. `### Rolling the guard event log` (`:128-142`) states the evidence
classification, the no-ceiling rule and the roll in full before citing the file. Delete
`rules/workbench-tracking.md` from the tree and this skill's behaviour is unchanged.

So the two citations are real and specific, and the third sentence — the one that carries the
decision's positive reason — asserts a procedure the document does not contain. The decision's own
Cons column had already named the risk: "Nothing then guarantees the archive step actually reads
it." The realisation answered that con with a claim rather than with a mechanism.

Verified at HEAD `b54ace5` by reading the whole of `skills/archive/SKILL.md` and by
`grep -n "workbench-tracking" skills/archive/SKILL.md` → lines 11 and 130 only, both inside prose.

**Fix direction — two options, and they are not equivalent.**

1. Make the sentence true: add the read to Step 1, beside the `fusion-paths` call, in the form the
   agent Setup contract uses ("read every emitted path"). Costs bytes on `skills/`, whose growth
   bound is one of the four failing ones, and gives the decision the mechanism it was answered on.
2. Make the sentence accurate: downgrade "reads" to "cites", and accept that
   `rules/workbench-tracking.md` is reached the same way the two existing no-agent rule files are —
   by a human following a citation. That is honest, but it retires the distinction the decision drew
   between this file and those two, and `260816-1707` should then be re-read rather than silently
   weakened.

This is a choice somebody has to make, not a wording fix; if option 2 is taken it wants a decision
record against `260816-1707` rather than an edit.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.

---
Resolved: fix direction 1, chosen by the user. `skills/archive/SKILL.md` `## Step 1` is now "Resolve paths, read the tracking rule": its bash block resolves the source root through `bin/fusion-source-root` (guarded, falling back to `$FUSION_PLUGIN_ROOT`) and `cat`s `rules/workbench-tracking.md`, and a following sentence instructs the run to read it in full before Step 2, with the one clause on what for and a named failure path if neither root yields the file. `## Process` step 1 points at both halves, so a run following the Process list performs the read rather than inheriting it. Line 11 tightened to say the read happens at Step 1, so the lede and the step agree. Decision `260816-1707` now has the mechanism its positive reason claimed.
