The archive safety filter checks only CLAUDE.md while the citation lint guards a corpus thirty-one files wider

---
`skills/archive/SKILL.md` `## Safety filters` item 3 excludes a candidate when `CLAUDE.md`
references it, on the ground that CLAUDE.md is auto-loaded and its references must stay
resolvable. Measured in fusion's own repository, a tier-1 sweep would archive 14 terminal
Circles that CLAUDE.md does not name and 31 shipped files do, including 10 rule files, 2
agent prompts, 4 lint tests and several `**Provenance:**` headers. `/fusion:cleanup` runs
tier-1 unattended, calling it safe by construction.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** skills/archive/SKILL.md `## Safety filters (apply to ALL modes)` item 3; skills/cleanup/SKILL.md Step 4; hooks/lib/__tests__/workbench-citation-lint.test.ts; CLAUDE.md `## Where to look when something breaks` (the row that accepts an archive sweep reddening the suite)

## What was measured

At HEAD `3d4b181`, in this repository, with no Circle active. The tier-1 survey returns 18
terminal Circles. Filter 3 excludes 4, the ones CLAUDE.md names. Of the remaining 14, 13 are
cited from outside the workbench:

| Circle | Files citing it |
|---|---|
| `260801-1244-guard-rules-write` | 12 |
| `260807-0923-guard-misst-statt-orakelt` | 5 |
| `260718-1924-v5x-overhaul` | 5 |
| `260716-1847-workbench-umbau` | 3 |
| nine others | 1 or 2 each |

31 distinct files, among them `rules/circle-records.md`, `rules/commit-lock.md`,
`rules/agent-setup.md`, `rules/critical-stance.md`, `rules/rule-file-provenance.md`,
`agents/orchestrator.md`, `agents/playmaker.md` and four tests under
`hooks/lib/__tests__/`.

## Why this is a defect and not this repository being unusual

The filter's own justification names the property it protects: a reference must stay
resolvable because the file holding it is loaded. That property is not unique to CLAUDE.md.
Every rule file is loaded by `bin/fusion-rules` into every agent that matches its pattern, and
a `**Provenance:**` header is checked by `provenance-header-lint.test.ts`. The filter protects
one loaded surface and ignores the rest.

`workbench-citation-lint.test.ts` makes the disagreement mechanical rather than theoretical.
It recomputes its corpus from the tree on every run and carries no approvable baseline, so
the sweep this filter permits turns `npm test` red the moment it lands. Two mechanisms in one
plugin hold different answers to "which citations must resolve", and the archive step acts on
the narrower one while the gate enforces the wider one.

CLAUDE.md already records the consequence as accepted: an archive sweep reddening the suite is
a documented outcome, and the remedy given is to correct the paths afterwards. Accepting the
cost of a sweep somebody chose is different from an unattended pipeline step incurring it. The
cleanup skill calls tier-1 "safe-by-construction ... no confirmation gate", and that claim is
what this record contradicts.

## What a fix would have to decide

1. **Widen filter 3** to the corpus the citation lint already computes, so the two agree by
   construction rather than by coincidence. The lint knows how to enumerate it.
2. **Keep the filter narrow and remove tier-1 from the unattended path**, so a sweep is always
   a choice somebody made with the blast radius in front of them.
3. **Leave both and make the repair part of the step**: sweep, then rewrite the citations the
   sweep broke. Larger, and it needs the archive destination to be derivable from the old path,
   which it is.

Not decided here. Option 1 looks cheapest and option 2 safest; whether an archived Circle's
citations should be rewritten at all is a separate question this record does not open.

## What this session did

Skipped the archive step and reported why. `/fusion:cleanup` Step 4 performed no move.

**Severity:** High. The step runs unattended, its own documentation calls it safe, and the
damage is 31 broken citations plus a red suite in a repository that had touched none of it.

Resolved: 260827-2022-coder-session.md, coder, Kai Stalmann <ks@qantr.com>. Option 1 of decision `260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md` realised in plan step 12: `skills/archive/SKILL.md:118` (filter 3) and `skills/archive/SKILL.md:193` (the Step 4 grep) run over a positive, existence-guarded enumeration of the shipped corpus plus the project's `CLAUDE.md`, `rules/` and `.claude/rules/`, and the kept-line names the citing file; `hooks/lib/__tests__/workbench-citation-lint.test.ts` names the filter as its twin in the `inCorpus` comment. Checked in this repository: the survey now keeps 18 of 19 terminal Circles, every Circle the table above names among them, each with its citing file; the one uncited Circle (`260822-1921`) is the whole tier-1 selection.
