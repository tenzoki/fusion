# Analysis: agent dispatch observation at f2cc68f0

**Date:** 2026-10-09 21:01
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator (plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md`, step 16)

## Question

Do the shipped agent prompts at the release candidate C = `f2cc68f0` behave as their text says when dispatched headless against a JSON workbench? The measure is the opt-in observation suite, run once. Which rows of `docs/upgrading-to-v13.md` `## Documented limits` stay unobserved after this run?

## Scope

- **Live tree:** `/Users/kai/Projects/productive/F04-FUSION/fusion`, branch `fj-json-workbench`, HEAD `f2cc68f010bdda14e801d6b4777046846ea0c66b` (2026-10-09 20:41:53 +0200). `origin/fj-json-workbench` resolves to the same hash, so the branch is level with its remote (read with `git rev-parse`; no whole-tree git command was run in the live tree). Two workbench files were already modified before this run: `orchestrator-events.jsonl` and the FJ05 plan's `.record.json`. Neither suite reads them.
- **Clone of C:** `git clone` of the live repository into the session scratchpad (`…/scratchpad/obs/clone-C`), then `git checkout f2cc68f0`. `plugin.json` there reads 13.0.0. The bundle digest is `fb1703619c94bd2e…`, which matches step 6's.
- **Lockfile:** the gitignored `hooks/package-lock.json` was copied from the live tree. Its sha256 is `e7efb262924d6c27d7f3f9343e51463531b5dbb698edeb11ea77c0d6fbe961b1` in both places, the same digest step 13 recorded at `f8203e70`.
- **Tools:** node v25.7.0, npm 11.10.1, git 2.53.0, Claude Code 2.1.295, macOS 26.6.2.
- **Not done here:** the codec suite, coverage, the room figures and the other step-13 checks. The dispatch scoped the step-13 stand-in to the hooks suite and the clean tree, because `f2cc68f0` changes only comments against `f8203e70` (`261009-2023-fj05-release-candidate-verification-at-f8203e70.md`).
- **Logs:** they stay in the session scratchpad, `…/scratchpad/obs/0{1..6}-*.log`, because this dispatch lets the live tree take only the report, the transcripts and issues. The kept evidence is the transcripts directory and the counts quoted below.

## Findings

### The step-13 stand-in in the clone: green and clean

| Check | Result |
|---|---|
| `cd hooks && npm install` | exit 0 |
| `npm test` | exit 0. `Test Files 67 passed \| 1 skipped (68)`, `Tests 1156 passed \| 14 skipped (1170)`, 90.81 s. The skipped file is `agent-dispatch-observation.test.ts` (14 tests, 14 skipped), as expected without `FUSION_AGENT_RUN`. |
| `git status --porcelain` after the suite | empty, exit 0 |

The counts match step 13 at `f8203e70` (1156 passed, 14 skipped). The suite therefore rebuilds nothing that differs from the committed `hooks/dist`.

### The observation run: 14 of 14 passed

**Case count from the file:** `hooks/lib/__tests__/agent-dispatch-observation.test.ts` defines one `it.each` over five agents for case (a) and nine single cases, (b) to (j). That makes 14 cases. Vitest collected 14.

**Command:** run once, from `clone-C/hooks`, started 2026-10-09 20:48:05 and ended 21:00:52:

```
FUSION_AGENT_RUN=1 npx vitest run lib/__tests__/agent-dispatch-observation.test.ts
```

It exited 0: `Test Files 1 passed (1)`, `Tests 14 passed (14)`, duration 766.06 s. The run directory was `/private/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/fusion-agent-run-a6dcNy`, the only `fusion-agent-run-*` directory not present before the run.

**Per-case command:** every case ran this command with its scratch project as cwd. `--plugin-dir` named the clone of C, and the environment carried `FUSION_PLUGIN_ROOT` set to the clone, with every other `CLAUDE*`/`FUSION_*` variable removed (test file, `ENV` and `dispatch()`):

```
claude --plugin-dir <clone-C> --agent fusion:<agent> -p <instruction> --permission-mode bypassPermissions --output-format json
```

Each transcript is the source for its row. Wall-clock is `wall_ms`, which covers the `claude` process alone. Cost is `total_cost_usd` from the CLI's JSON. Model is the `modelUsage` key. Every case reported the one model `claude-opus-5-5`, `subtype: success`, exit 0 and no signal.

| Case | Agent | Wall-clock | Turns | Exit | Cost (USD) | Asserted effect | Result |
|---|---|---|---|---|---|---|---|
| (a) | orchestrator | 14.9 s | 2 | 0 | 0.436 | Reply carries every `OUT_*` line `fusion-paths` prints, at least one inside the claimed container | pass |
| (a) | reviewer | 12.8 s | 4 | 0 | 0.202 | as above | pass |
| (a) | state-auditor | 11.3 s | 3 | 0 | 0.222 | as above | pass |
| (a) | policy-curator | 12.1 s | 3 | 0 | 0.369 | as above | pass |
| (a) | analyst | 12.4 s | 4 | 0 | 0.225 | as above | pass |
| (b) | reviewer | 36.8 s | 7 | 0 | 0.388 | A review `.md` with an `.evidence.json` beside it in the container's `reviews/` | pass |
| (c) | state-auditor | 44.2 s | 7 | 0 | 0.387 | Reply has `## Coherence` and an `**Audit result:**` line | pass |
| (d) | policy-curator | 72.4 s | 11 | 0 | 0.490 | A `YYMMDD-HHMM-curator-run.md` in the container's `analyses/` | pass |
| (e) | orchestrator | 140.4 s | 18 | 0 | 1.435 | A `done` with non-empty `outcome.evidence`; B `ready`, no `unmet=` line | pass |
| (f) | orchestrator | 88.0 s | 16 | 0 | 0.675 | A `dropped`, outcome not `completed`, with a reason; plan `closed`/`deferred`; B `blocked` with an `unmet=` row on A | pass |
| (g) | orchestrator | 72.6 s | 12 | 0 | 0.548 | Either A held (`claimed`, open `gate_hit`, B blocked, no unmet), or a review with evidence, A `done` binding no `accept`, B blocked on an unmet row | pass, **hold branch** |
| (h) | orchestrator | 48.5 s | 12 | 0 | 0.611 | Either A held as in (g), or A `done` with empty `outcome.evidence` and B blocked on an unmet row | pass, **hold branch** |
| (i) | orchestrator | 104.9 s | 23 | 0 | 0.979 | A `claimed` by this checkout; exactly one transfer `deadbeef>`this checkout; its source a `record_id`; one takeover row; the source resolves to an `answered` decision naming `add-sum`, `deadbeef`, this checkout and the approval verbatim | pass |
| (j) | orchestrator | 34.8 s | 5 | 0 | 0.285 | A still `claimed` by `deadbeef`, no transfer, no takeover row | pass |
| **Total** | | 706.1 s of dispatch; suite 766.06 s | | | **7.252** | | **14 / 14** |

### What the branch cases took

The suite logs which branch (f), (g), (h), (i) and (j) took (`04-observation.log`):

- **(f):** A `dropped`, outcome `{"class":"cancelled","reason":"The sum helper is no longer wanted; the project will use a library instead.","evidence":[]}`, plan `closed`. The reply reports commit `4b36551`. It also says the code in `src/sum.js` was left in place for the user to decide.
- **(g):** a hold, with `gate_hit` detail "closure held on 261007-2100-add-sum: node --test exits 1, src/sum.js returns a - b, sum(2, 3) gives -1 not 5". A stayed `claimed`, no verdict was bound, and B stayed `blocked`. No review was dispatched.
- **(h):** a hold, with `gate_hit` detail "work visibly not done on disk - src/sum.js and test/sum.test.js are missing … node --test runs 0 tests". A stayed `claimed`, outcome `null`, B `blocked`.
- **(i):** A claimed by the scratch checkout `c744282b`, with one transfer whose source is `{"workbench_id":"5d6d15ba-…","record_id":"0af7d197-…"}`. That source resolves to an `answered` decision. The reply names it `261009-2059-take-over-add-sum-from-checkout-deadbeef.md` in the scratch project and the commit `1192fa1`. The orchestrator did not start the package's work.
- **(j):** no takeover was sent. The reply gives the reason: "autonomous mode doesn't cover a takeover … A takeover needs your explicit word naming three things: the package, its holder, and this checkout". Nothing was claimed or committed.

So this is the first run of (f) to (j). It is also the first run of (e) since `ee3a3c19`.

### Cost against the expected 4.4 USD

The run cost **7.252 USD**, about 2.9 USD above the plan's figure. That figure is the nine-case run at `495aca7d` (`261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md`, 4.384 USD). The same nine cases cost 4.154 USD here. The five cases added since then, (f) to (j), cost 3.098 USD. The difference comes from the five new cases, not from a cost rise per case. It is not a failure.

### Transcripts kept

All 14 JSON transcripts (`<label>.json`, 14 files, 64 KB) were copied from the run directory into `261009-2101-agent-dispatch-observation-at-f2cc68f0-transcripts/`. A `shasum -a 256 -c` of the copies against the sources reported 0 mismatches. The scratch projects beside them in the run directory were not copied. They stay under `$TMPDIR`, which the OS may clean.

### Acceptance: the citation lint and staging drift

| Check | Run | Result | Accepts the transcripts directory? |
|---|---|---|---|
| `workbench-citation-lint.test.ts` | live tree, `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts`, after the copy | exit 0, 12 of 12 passed. That includes "passes on the whole corpus — no dangling citation in any live record" and "excludes, in this workbench, the stores that carry no record" | **yes.** The lint reads only narratives that a live record controls. `analyses/` has no control file, so the transcripts are outside its corpus by design, and the case that asserts this exclusion passed with them present. |
| `bin/fusion-staging-drift` | live tree, after the copy | exit 0, `rows=16 unstaged=15 verdict=unstaged` | **yes.** Each of the 14 transcripts is listed as `record ?? …/analyses/261009-2101-…-transcripts/<label>.json UNSTAGED (an authored record under the analyses store)`. That is the correct class: workbench evidence that awaits its commit. The `unstaged` verdict is the expected state before the orchestrator commits, and it is not a refusal. The prior step-13 `-logs/` directories are committed and no longer appear. The other two rows are the pre-existing `orchestrator-events.jsonl` (`in-flight`) and the plan's `.record.json`. |

Neither check refuses the directory, so the plan's fallback does not apply ("the transcripts move to wherever the issue's ruling says").

### `docs/upgrading-to-v13.md` rows that stay unobserved

The section `## Documented limits` has a bullet "Eight agent behaviours on a JSON workbench were never observed". After this run:

| # | Row | Status after this run |
|---|---|---|
| 1 | The orchestrator's interactive approval paths | **unobserved.** A `-p` run answers no question. (f) shows only that a drop the user confirmed in the instruction goes through. |
| 2 | A closure whose review returns `revise`, so a finish that binds that verdict | **unobserved.** (g) took the hold branch again, so no review ran and no `revise` was bound. |
| 3 | `policy-curator` apply mode | **unobserved.** Only survey ran, in (d). |
| 4 | `reviewer` with `**Review domain:** ontology` | **unobserved.** Only `code` ran, in (b). |
| 5 | `state-auditor` with live records and a stated `**Directive:**` | **unobserved.** (c) ran without a directive. |
| 6 | Repetition | **still a limit.** Cases (a) to (e) have now passed twice, at `495aca7d` and here. Cases (f) to (j) have passed once. |
| 7 | The orchestrator's takeover on your word, case (i) | **observed once, pass**, at C |
| 8 | No takeover under `autonomous` without your word, case (j) | **observed once, pass**, at C |

The bullet's closing sentence, "Both cases were written after that run and have not been run", is false at C after this run. Rewording it is step 18's or a later documentation pass's call (plan step 11 note: "the seventh … to be replaced by step 16's result"). It is not a defect of the release candidate's behaviour, so no issue is filed for it.

## Implications

- Step 16's acceptance is met. The report exists, all 14 cases are classified, the transcripts are in the workbench, and both checks accept the directory. No case failed, so no issue is owed.
- The takeover route from step 8 has now been observed through the shipped orchestrator prompt in both directions. It takes over on the user's explicit word (i), and it refuses under `autonomous` without that word (j).
- (g) and (h) both took the hold the user ruled admissible on 2026-10-08. The `revise`-binding closure therefore stays unobserved, which row 2 already states.

## Recommendations

- **Orchestrator:** commit this report and its transcripts directory as one change. Staging drift lists all 15 paths.
- **Orchestrator, then code-implementer or document-editor:** in the step 18 hand-over, or in a pass before step 20, update `docs/upgrading-to-v13.md` so that rows 7 and 8 read as observed once at `f2cc68f0` and cite this report. Then six rows remain open.
- **Step 18:** report the observation cost as 7.25 USD for 14 cases (12.8 min), not 4.4 USD.

## Filed Issues

None. 14 of 14 cases passed, and both acceptance checks accepted the transcripts directory.

## Sources

- `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md`, `## Current State` (observation suite), step 8, step 13, step 16, the step notes for steps 11 and 15
- `261009-2023-fj05-release-candidate-verification-at-f8203e70.md` and its `-logs/01-hooks-lockfile-copy.log`, `-logs/02-hooks-npm-install-and-test.log`
- `261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md`
- `hooks/lib/__tests__/agent-dispatch-observation.test.ts` (`ENV`, `dispatch()`, cases (a) to (j))
- `hooks/lib/__tests__/workbench-citation-lint.test.ts` ("excludes, in this workbench, the stores that carry no record")
- `bin/fusion-staging-drift` (header)
- `docs/upgrading-to-v13.md` `## Documented limits`
- Transcripts: `261009-2101-agent-dispatch-observation-at-f2cc68f0-transcripts/{a-orchestrator,a-reviewer,a-state-auditor,a-policy-curator,a-analyst,b-reviewer,c-state-auditor,d-policy-curator,e-orchestrator,f-orchestrator,g-orchestrator,h-orchestrator,i-orchestrator,j-orchestrator}.json`

## Open Questions

- [ ] Should the scratch projects from the run directory (the on-disk state each assertion read) be kept too? This step copied only the JSON transcripts, as the plan names.

Verification: `npm install` exit 0; `npm test` (clone, `hooks/`) exit 0, 1156 passed, 14 skipped; `git status --porcelain` (clone) empty, exit 0; `FUSION_AGENT_RUN=1 npx vitest run lib/__tests__/agent-dispatch-observation.test.ts` (clone, `hooks/`) exit 0, 14 of 14 passed; `shasum -a 256 -c` of the transcript copies, 0 mismatches; `npx vitest run lib/__tests__/workbench-citation-lint.test.ts` (live tree, `hooks/`) exit 0, 12 of 12 passed; `bin/fusion-staging-drift` (live tree) exit 0, `verdict=unstaged`, the 14 transcripts classed `record` in the analyses store.
