# The reference-resolution pin's re-approval log, entries 26 to 40

**Date:** 2026-08-24 21:21
**Type:** Record
**Status:** Complete
**Requested by:** coder, step 15 of `260824-1905_*_plan-close-every-open-defect.md`

## What this is

The second roll of the attribution log that `hooks/lib/__tests__/reference-resolution-lint.test.ts`
keeps above `const BASELINE`. The first roll,
`260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`, states
the convention and the decision that chose it (`260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`,
option 2); nothing here restates either. Between 2026-08-22 and 2026-08-23 the log gained the
fifteen entries below, 92 lines on a surface whose head-room stood at 10 lines when step 15 needed
about 55 for the two tests the Turn 1 review asked for (`bin/fusion-session-domain` and the no-git
branch of `bin/fusion-identity`). They moved here verbatim; the 2026-08-24 entries stay in the test
file.

## The entries, verbatim

```
// Re-approved 2026-08-22 for the v10.5 release: paths 1258 -> 1262, anchors and records unmoved. One token is
// README.md's pointer to the new `docs/upgrading-to-v10-5.md`; three are that note's own citations of shipped
// files. A release note is the one recurring edit that adds paths and nothing else, so this class moves alone.
// Re-approved 2026-08-22 for step 3 of the C0 cut, ONE block for the whole step: paths 1262 ->
// 1277, anchors 163 -> 171, records 116 -> 117. Five restatement rows left the fifteen agent
// prompts and the reviewer contract moved into the new `rules/review-contract.md`. The counts
// RISE on a step that removed 15 000 bytes, because every removed restatement left a citation of
// its authoring home behind. anchors is exactly +16 -8: eight voice blocks gained
// `## Voice profiles` and `## Style anti-patterns apply to everything`, eight prompts lost the
// `## Effort estimates` bullet. records is +1, the new rule file's provenance line. paths is a
// net across the prompts, the rule file, the emission helper and README-agents.md, not split.
// Re-approved 2026-08-22 for step 4 of the C0 cut, ONE block for the whole step: paths 1277 ->
// 1269, anchors unmoved, records 117 -> 115. Two restatement rows left the skill bodies. Row S1
// replaced the source-root "Why the branch" paragraph in setup, next, cleanup and help with a
// citation of `bin/fusion-source-root`'s own header, which authors that criterion; the four
// paragraphs together carried three `bin/…` spellings and a `$FUSION_SRC/skills/…` one that the
// pointer does not, hence -8, and two of them cited decision `260810-2145`, hence -2 records.
// Row S2 removed the Exit 3 and Exit 4 bullets from six bodies, whose authoring home is already
// cited in the sentence above them; those bullets name no path, so they move nothing here.
// Re-approved 2026-08-22 for the orchestrator's `/fusion:direct` permission: records 115 -> 116,
// paths and anchors unmoved. The one token is the citation of decision `260822-1635` in the new
// `## Capturing a Directive as an anticipated Circle` section of `agents/orchestrator.md`, which
// is the record that granted the permission. That section names its condition by pointing at a
// neighbouring heading in its own file rather than citing one in the class-(b) adjacent form, so
// anchors do not move with it.
// Re-approved 2026-08-23 for the v10.6 release, ONE block for the whole text pass: paths 1269 ->
// 1284, anchors 171 -> 175, records unmoved. Thirteen of the fifteen paths are the new
// `docs/upgrading-to-v10-6.md` citing shipped files. The other two are README.md gaining a pointer
// to that note, and `rules/review-contract.md` entering `skills/help/SKILL.md` with the v10.6
// paragraph — which displaced the v10.3 one under the update topic's three-release cap, a
// `docs/…` pointer each way, so that displacement is net zero here. anchors is +4: the note's four
// `## Where to read more` entries that name a heading, in `skills/next/SKILL.md`,
// `agents/orchestrator.md`, `skills/setup/SKILL.md` and `README-hooks.md`. records does not move
// because the note cites no workbench record, on the precedent `docs/upgrading-to-v10-5.md` set.
// Re-approved 2026-08-23 for step 1 of the C2 plan: paths 1284 -> 1286, anchors 175 -> 176,
// records 116 -> 118. `rules/workbench-tracking.md` was rewritten from the two-group
// record-versus-live-state split into the four-class partition, and every token moved is in that
// one file. paths +2 and anchors +1: the layout tree is now cited twice, once in the sentence
// naming what this rule was partitioned out of and again where the partition states its range,
// and `agents/playmaker.md` enters as the ground for `portfolio.md` moving to class L. records +2:
// the multi-user specification joins the provenance header, and the merge-driver section cites the
// decision that chose `merge=union`.
// Re-approved 2026-08-23 for step 4 of the C2 plan: paths 1287 -> 1288, anchors 177 -> 178. The
// conditional setup-marker write in `skills/setup/SKILL.md` cites `rules/workbench-tracking.md`
// and the section that holds its reasoning. records does not move: the step cites no record.
// Step 3 moved both counts by one the same way and approved it in `git:c9eba48` with no note here.
// Re-approved 2026-08-23 for step 5 of the C2 plan: paths 1288 -> 1291, anchors and records
// unmoved. Step 0i in `skills/setup/SKILL.md` cites three files — `rules/workbench-tracking.md`
// for why the pointer does not travel, `agents/playmaker.md` for the `MISSING-POINTER` name it
// reuses, and `bin/fusion-paths` for the resolution its placement protects. The conventions
// clause naming `/fusion:setup` as the pointer's fifth writer cites no path of its own.
// Re-approved 2026-08-23 for the C2 head-room cut in `skills/setup/SKILL.md`: anchors 178 -> 179,
// records 118 -> 117, paths unmoved. Eleven prose passages were cut from that body to free head-room
// on the `skills/` surface, and only two carried a counted token. Step 0d's stamp paragraph dropped
// its restatement of why the stamp makes staleness decidable and cites the authoring home instead,
// which is the +1 anchor (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`) and
// a +1 path that cancels the `install.sh` spelling leaving Step 0e with the same restatement. records
// is -1: the pre-v4 ordering rationale cited defect `260717-0115`, and the rationale went with it.
// Accounted 2026-08-23, retrospectively and out of sequence: the two moves of this range that were
// approved with no block here. The invariant above puts the accounting in this file, and both had
// it only in a commit message or a workbench history file (issue
// `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_two-of-six-baseline-re-approvals-carry-no-accounting-and-the-log-now-contradicts-the-constant.md`).
// The constant does not move for this entry: these two ARE the gap the entries above left against
// it, written down rather than added to.
// `git:c9eba48`, plan step 3, the union merge driver: paths 1286 -> 1287, anchors 176 -> 177,
// records unmoved. Step 0h of `skills/setup/SKILL.md` cites `rules/workbench-tracking.md` and its
// `## The event log carries a union merge driver` section — one path and one anchor. The step
// carries two sentences and points there for the reasoning, so nothing else entered scope.
// `git:1400402`, plan step 6, the briefing's provenance: paths 1291 -> 1292, anchors 179 -> 180,
// records unmoved. Step 5's checkout clause in `skills/next/SKILL.md` cites the same file and its
// `## The four classes` section as the ground for `portfolio.md` being class L — again one path
// and one anchor. Its accounting lived in a workbench history file, which is not here.
// With both entered the chain runs unbroken: paths 1284 -> 1293, anchors 175 -> 180, records
// 116 -> 117, and every entry closes where the next one opens.
// Re-approved 2026-08-23 for the Turn 1 Critical repair: paths 1292 -> 1293, anchors and records
// unmoved. The one token is `rules/workbench-tracking.md` entering `README-hooks.md`'s row for the
// workbench citation gate, where the corpus description now qualifies `portfolio.md` as class L and
// cites the file that defines the class. It was written against the constant
// rather than against the entry above it, which closed at 1291 while the constant read 1292; the
// retrospective block now standing above accounts for that gap.
// Re-approved 2026-08-23 for the Turn 1 text-correctness pass: paths 1293 -> 1294, anchors and
// records unmoved. The one token is `agents/playmaker.md` entering `skills/setup/SKILL.md` a second
// time, in Step 0i's new `MULTIPLE-ACTIVE` branch, which names that condition where the step's
// opening paragraph names `MISSING-POINTER`. The same pass repaired two `:N` suffixes in
// `rules/fusion-workbench-conventions.md` and six in `README-agents.md`, and this gate resolves the
// path and never the line after it, so not one of those registers here.
// Re-approved 2026-08-23 for the C2 closing pass: records 117 -> 118, paths and anchors unmoved.
// The one token is `rules/circle-records.md`'s new `### Citation form in a Circle record's head
// field` citing the defect that exposed the gap,
// `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1408_*_the-plan-field-now-carries-a-wildcard-and-no-rule-authorises-one-in-a-circle-record-head-field.md`.
// The same section names `$PORTFOLIO` and `Active spec/plan:`, which are not paths, and the
// template and worked-example edits beside it changed a marker letter inside a path already counted.
```

## The unaccounted +1, written retrospectively on 2026-08-24

The chain above closes at paths 1294 and anchors 180; the first entry left in the test file opens
at paths 1295 and anchors 181. The move between them is commit `0db1fbb` (2026-08-24, "the
orchestrator asks in chat, and the dialog is banned without exception"), which re-approved
`BASELINE` from `{ paths: 1294, anchors: 180 }` to `{ paths: 1295, anchors: 181 }` with no
attribution line: its message says only that "two gate baselines moved and both were re-approved".
The tokens are in the new `## How you ask the user anything` section of `agents/orchestrator.md`: the +1 path is
`agents/shaper.md` entering that prompt one more time, and the +1 anchor is that section citing
`rules/user-facing-output.md` `## Length`. Recovered by `git log -S'paths: 1295'` and the diff of
that commit, not from memory, and it is the same class `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_c_*`
closed the day before (issue `260824-2145_*_*_the-reference-resolution-pin-chain-has-an-unaccounted-plus-one-between-the-c2-closing-pass-and-c3-step-3.md`).
The line lives here rather than in the test file because the hook-test surface has no head-room.
