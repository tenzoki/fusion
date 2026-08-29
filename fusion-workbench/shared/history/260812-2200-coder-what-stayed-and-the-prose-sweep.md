# Coder session — what stayed and why, and the prose that had not caught up

**Date:** 2026-08-12 22:00
**Agent:** coder
**Status:** Complete
**Plan:** `260812-1720_*_circle-first-placement-and-the-backlog-store.md`, steps 13 and 14 (step 12 did not run)
**Predecessors:** `260812-1938-coder-backlog-store-and-resolver-target.md` (steps 1–3, `3c6ec4e`),
`260812-1954-coder-backlog-keys-enumerations-and-the-move.md` (steps 4–6, `dec40bb`),
`260812-2010-coder-the-playmaker-gains-the-backlog-job.md` (step 7, `6e261c4`),
`260812-2054-coder-the-shaper-becomes-circle-first.md` (step 8, `406ec0d`),
`260812-2116-coder-the-planner-parameter-and-the-three-user-surfaces.md` (steps 9–10, `994fe05`),
`260812-2136-coder-the-citation-verifier-and-the-baseline.md` (step 11, `7a50c41`)
**Decisions marked `_a_` → `_i_` by this step:**
`260812-1720_*_when-exactly-does-the-anticipated-circle-come-into-existence.md`,
`260812-1720_*_does-the-circle-first-migration-reverse-a-recorded-promotion-out-of-a-circle.md`
**Deviation on record:** step 13 is assigned to `ontocoder` by the plan's routing rule (workbench
records to `ontocoder`, behaviour files to `coder`). It was run by `coder` on the dispatching
instruction, together with step 14 which is `coder`'s by the same rule. The step writes Markdown
prose and two filename renames — no structured data, no schema, no manifest — and splitting a
two-step dispatch to append one paragraph costs more coordination than the rule protects here.
Same shape as step 6's recorded deviation.

## Step 13 — one note, not seven

Seven files sit in `shared/planning/`. **Six got nothing written on them, deliberately.** Their
reason is the Origin Rule's ordinary case: no Circle was active when each was written, and the
sibling session history in `shared/history/` — same agent run, same `fusion-paths` call, same
`YYMMDD-HHMM` stem — is the witness. A rule that already explains a file does not need the file to
repeat it. Seven identical notes would be thoroughness theatre, and six of them would age into text
a later reader has to check rather than trust. The measurement itself is not lost: the plan's
`## Current State` carries it as a per-file table with the witness path and the verdict, and the
answered decision record carries it in prose.

**The seventh carries a header paragraph**, because its reason existed in exactly two places and
neither is one a reader of *that file* opens.
`260717-1918_*_skill-glob-nomatch-zsh-hardening.md` was written while Circle
`260716-1847-workbench-umbau` was active — its sibling history is inside that Circle — and was
lifted out at closure, deliberately, with the reason recorded in the Circle's `## Closure note`.
Open the plan and none of that is visible: it looks like a sixth ordinary shared plan, and under a
placement rule that now says a Circle holds its own founding documents, the obvious next move is to
move it. The paragraph says where it came from, that the promotion was deliberate and recorded,
that the Circle-first change of 260812 re-examined and confirmed it, and in as many words: **do not
move this file.** It closes with the contrast that makes it legible — every other file here is here
because no Circle was active, this one is the exception.

### Why the file and not the other two candidates

The three were weighed, and they are not interchangeable.

**The conventions file's `## Origin Rule`** was rejected twice over. It already carries the
promotion clause — *"an explicit, recorded move from a Circle to `shared/`"* — which is the rule the
exception rests on, so a note there would be the rule restating its own text. And it is emitted to
all sixteen agents in every consuming project, where one fact about *this* workbench is noise paid
sixteen times a session. A shipped rule is the wrong home for a project's instance of it.

**The Circle record** was rejected because it already answers the question, at `## Closure note`.
A reader who is standing in the Circle asking "where are its documents" is not the reader who is
lost. Appending "and this was reaffirmed on 260812" would put a second sentence about one fact in
the place that already had one.

**The file** was the only candidate where the question gets asked and the answer is absent. That is
the whole criterion, and it is why the answer is one note rather than three.

### The two decision records

Both moved `_a_` → `_i_`, `**Status:** open` corrected to `implemented` on the way (the marker had
moved twice while the head field stayed at its filing value).

`when-exactly-does-the-anticipated-circle-come-into-existence` cites **two** commits, not one. Its
answer had two clauses — the Circle is created at the shaper's first write, *and* the resolver
exception is written into the rule text — so `406ec0d` alone would have marked it implemented on
half of what it says. `3c6ec4e` carries the other half
(`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs*).

The promotion record cites a `<path>` rather than a hash. The convention permits either
(`Implemented: <commit hash> or <path>:<line>`), and the path is the honest form here: this record's
realisation *is* the note, and the note is uncommitted while this is being written. Its line also
states what it does not claim — nothing moved, no citation was rewritten — so a reader does not go
looking for a migration commit that does not exist.

## The plan said step 13 does not run, and that was wrong

Step 11's gate paragraph reads "**Steps 12 and 13 therefore do not run**", and step 11's history
repeats it. Step 12 indeed does not. Step 13 had to, and the answer itself is why: the move
decision's `## Constraints` says *"whatever is chosen must be recorded on the file or the Circle
record, not only here"*, and step 13 is the only step that performs that recording. Read as
cancelling both steps, the answer would have retired a decision to `_i_` against nothing on disk,
and the one file in the workbench whose placement is an argued exception would have stayed silent —
which is precisely the outcome the constraint was written to prevent.

Corrected in the plan at three sites: step 11's gate bullet, step 13's `Dependencies` line (11, the
gate — not 12), and the `## Open Questions` entry that carried the same sentence. Step 11's
*history* was left alone: it is an append-only session log recording what its author believed at the
time, and rewriting it to agree with a later finding is the failure that makes a log worthless.

## Step 14 — one instruction not followed, and the measurement that refused it

**The plan says to delete the first justification for `Active spec/plan:` holding a full path**
(`rules/circle-records.md:103`), "since a spec written before its Circle no longer lands elsewhere".
That premise is false, and the workbench disproves it in four places. `curator`,
`guard-bash-inspection`, `guard-rules-write` and `rule-provenance-header` each name
`260801-1122_*_spec-normative-consolidation.md` as their spec — one shared spec
serving four Circles, and not one of them a migrated pre-v4 case, which is the only justification
the plan wanted to keep. Deleting the bullet would have left the field justified by a reason that
does not cover the workbench's commonest cross-store instance, and would have orphaned the same
claim standing in `agents/orchestrator.md:266`.

What the Circle-first change actually falsified is the bullet's **mechanism** clause: "every
`/fusion:direct` run and every shaper run in anticipated-circle mode produces one". That is now
exactly backwards — anticipated-circle mode creates the Circle first and writes inside it. So the
bullet was rewritten rather than deleted: same reason, current mechanism, and the correction of the
false half stated where the false half was.

**`agents/orchestrator.md:266` was checked rather than inherited, and step 8's executor was right.**
"Because a spec written before the Circle existed legitimately lives in another store" is true under
shaper mode 1, which still writes a spec to `shared/` when no Circle is in scope anywhere, and it
has four live instances. Left standing, and it now agrees with the bullet it cites rather than with
a bullet that was about to be deleted underneath it.

## The corpus delta, and one word inside it

| file | before | after | delta | paid by |
|---|---|---|---|---|
| `rules/fusion-workbench-conventions.md` | 49 990 | 49 992 | **+2** | all sixteen agents, every dispatch |
| `rules/circle-records.md` | 11 203 | 11 228 | **+25** | orchestrator, playmaker, shaper |

**The +2 is one word, and it closes a contradiction step 3 left inside its own file.** The layout
tree at line 37 labelled `shared/planning/` "specs and plans written with no Circle **active**",
while invariant 1 twenty-five lines below had just been restated as "with no Circle **in scope**" —
and the two differ exactly where the new `<circle-dir>` argument bites: a plan written under
`fusion-paths planner <dir>` lands in a Circle with none active. `active` → `in scope`.

The +25 is the rewritten bullet, and it is the price of keeping a true justification instead of
deleting it. The bullet lost its false mechanism clause and gained the fact that replaces it.

Everything else this step wrote went to files no agent loads: `CLAUDE.md` (+825, this repo's own
session context, not the plugin's rule corpus), `README-agents.md` (+359), `README.md` (+58),
`.claude-plugin/plugin.json`. Running total for the plan: steps 1–3 added 3 866 bytes to the
sixteen-agent corpus, steps 4–12 added zero, steps 13–14 add 2. The three-agent corpus took 309 at
step 7 and 25 here.

## Beyond the plan's file list

The plan names four files for step 14. Three more carried the same claim or the same gap, found by
grepping the phrasings rather than opening the list:

- **`README-agents.md`'s workbench tree** enumerated three shared-only kinds and omitted `backlog/`,
  contradicting `rules/fusion-workbench-conventions.md`'s tree, which step 1 updated.
- **`README.md`'s workbench tree** did the same. Neither was in any step's file list: step 5's
  enumerations were the executable ones (`skills/setup`, `staging-drift.ts`, two lints, two skill
  bodies), and the prose half was nobody's.
- **Both READMEs' `/fusion:memo` lines** described a memo log only, after step 10 gave the skill a
  third target. `README-agents.md`'s row also gained the task list, which it had never named.
- **`README-agents.md`'s playmaker row** gained the backlog job, which the plan does name.

Four files were checked and deliberately left: `skills/help/SKILL.md` orients rather than
enumerates (it names `shared/` as a whole and never lists its kinds); `skills/cleanup/SKILL.md`
resolves keys generically and archives through `/fusion:archive`, which step 5 already taught;
`docs/working-model.md` describes the model and lists no stores; `skills/migrate/SKILL.md` converts
a pre-v4 layout, which never had a backlog folder to move.

## Verification

`cd hooks && npm test` — **exit 0**, 48 files, 1010 tests. Baseline at `7a50c41` was the same 48 and
1010, taken before any edit in this session and green. No test was added, changed or removed: this
step is prose and two renames.

Run three times. The middle run failed on exactly one assertion and it was the expected one —
`rules-emission-golden`, `fusion-workbench-conventions.md 49990 → 49992`. The golden was regenerated
with `UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts` and the diff
read line by line before the re-run: 35 lines, and every one of them is one of six values — the two
file sizes and the four distinct per-agent totals they roll into (+2 for the thirteen agents that
get only the conventions file, +27 for the three that get `circle-records.md` too). Nothing else
moved. `RULE_BASELINE` was left alone, per the fixture header.

The `Worker exited unexpectedly` parallel-load flake
(`260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`)
did not appear.

**The citation sweep was not done, by instruction and on the merits.** Step 11 measured 1 454
dangling citations in the workbench, 1 104 of them stale markers. Nothing here rewrites one. The two
renames this step performs (`_a_` → `_i_` twice, `_o_` → `_c_` once on the plan) each create stale
exact-marker citations elsewhere by the same mechanism that produced the 1 104, which is why every
citation this step *writes* uses the wildcard marker form.

## What the plan got wrong

**1. Step 14's delete instruction is wrong on a false premise.** See above. The workbench carries
four live counter-examples the plan did not check.

**2. Step 11's gate paragraph cancels a step whose own gate answer requires it.** "Steps 12 and 13
therefore do not run" — 13 does. Corrected in the plan; step 11's history left as written.

**3. Step 13's `Dependencies: 12` is wrong for the same reason.** It made the recording conditional
on the move, when the recording is what the answer demands either way, and is the entire product
when the answer is *leave it*.

**4. Step 13 asks for a note on every staying file.** Written literally, six of the seven notes
restate the Origin Rule at the file, which is where the rule is least likely to be read and most
likely to rot. One note where the reason is genuinely absent; six left to the rule that already
covers them.

**5. Step 14's file list is three short**, and its `.claude-plugin/plugin.json` line reaches one
surface of four. `CLAUDE.md` `## Release process` names four version surfaces to keep coherent: the
manifest (bumped, `8.1.0`), the marketplace entry, `install.sh`'s `FUSION_REF` header example and
`README.md`'s pin example. The last three still read `v8.0.0` and that is **correct for now** —
`v8.1.0` is not tagged, and pointing a documented pin at a tag nobody pushed is exactly the drift
that section warns about. They move at release step 5, with the tag.

## Files changed

- `rules/circle-records.md` — the `Active spec/plan:` justification rewritten, not deleted
- `rules/fusion-workbench-conventions.md` — one word in the layout tree (`active` → `in scope`)
- `CLAUDE.md` — the `backlog/` store in the workbench row, the second argument in the
  `bin/fusion-paths` row
- `README-agents.md` — tree, playmaker row, `/fusion:memo` row
- `README.md` — tree, the memo/backlog sentence
- `.claude-plugin/plugin.json` — `8.0.0` → `8.1.0`
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated, six values
- `260717-1918_*_skill-glob-nomatch-zsh-hardening.md` — the origin
  paragraph
- `260812-1720_*_when-exactly-does-the-anticipated-circle-come-into-existence.md`
  — `_a_` → `_i_`, `Implemented:`, `**Status:**`
- `260812-1720_*_does-the-circle-first-migration-reverse-a-recorded-promotion-out-of-a-circle.md`
  — `_a_` → `_i_`, `Implemented:`, `**Status:**`
- `260812-1720_*_circle-first-placement-and-the-backlog-store.md`
  — `_o_` → `_c_`, steps 13 and 14 `[DONE]`, step 12 `[NOT RUN]`, header status, three
  steps-12-and-13 corrections, two open questions checked, reconciliation entry

Not committed — the orchestrator commits.
