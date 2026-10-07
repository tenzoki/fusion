# Analysis: agent dispatch and skill-block observation at 495aca7d

**Date:** 2026-10-07 23:48
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator (plan `261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md`, step 8)

## Question

Do the shipped prompts and skill blocks that issue `261005-1018_*_six-consumers-the-prior-spec-names-have-no-test-that-runs-their-shipped-text.md` (D4) names behave as their text says on a JSON workbench? And which of the six D4 consumers are now covered by a test, which by a recorded observation, and which by neither?

## Scope

- Tree: `/Users/kai/Projects/productive/F04-FUSION/fusion`, branch `fj-json-workbench`, HEAD `495aca7d292a3188ac0254c125168f8ec04602c4` (2026-10-07 19:33 +0200). `git status -sb`: ahead of `origin/fj-json-workbench` by 4. Two workbench files were modified and not committed (`fusion-workbench/orchestrator-events.jsonl`, the plan's `.record.json`). Neither is read by either suite.
- Observation suite: `hooks/lib/__tests__/agent-dispatch-observation.test.ts` (step 7, `495aca7d`). It was run **once**, started 2026-10-07 23:18:55, with `cd hooks && FUSION_AGENT_RUN=1 npx vitest run lib/__tests__/agent-dispatch-observation.test.ts`.
- Skill-block suite: `codec/src/__tests__/install.test.ts`, tenth group (step 6, `f2e8ea4b`), run with `cd codec && npx vitest run src/__tests__/install.test.ts`.
- Transcripts and scratch projects: `/private/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/fusion-agent-run-V3e2gl`. One JSON transcript per case (`<label>.json`), with the scratch project beside it (`<label>/`).
- Not part of this run: a sibling directory, `…/T/fusion-agent-run-P1J9n9` (19:28, holds only `a-analyst`). Its timestamp places it in the step 7 session. Nothing below cites it.

## Findings

### The observation run: 9 of 9 passed

Every case ran this command with the scratch project as cwd. `--plugin-dir` named the work tree, and the environment carried `FUSION_PLUGIN_ROOT=<work tree>` with every other `CLAUDE*`/`FUSION_*` variable removed (test file lines 53, 113–115):

```
claude --plugin-dir /Users/kai/Projects/productive/F04-FUSION/fusion --agent fusion:<name> -p <instruction> --permission-mode bypassPermissions --output-format json
```

Wall-clock is the transcript's `wall_ms`, which covers the `claude` process alone. Cost is the transcript's `total_cost_usd`. Model is the transcript's `modelUsage` key. Every case reported a single model, `claude-opus-5-5`, and `subtype: success`.

| Case | Agent | Wall-clock | Exit | Cost (USD) | Asserted effect | Result |
|---|---|---|---|---|---|---|
| (a) | orchestrator | 17.3 s | 0 | 0.521 | Reply carries every `OUT_*` line `fusion-paths orchestrator` prints, at least one inside the claimed container | pass |
| (a) | reviewer | 11.4 s | 0 | 0.192 | as above, for `reviewer` | pass |
| (a) | state-auditor | 12.0 s | 0 | 0.218 | as above, for `state-auditor` | pass |
| (a) | policy-curator | 12.0 s | 0 | 0.364 | as above, for `policy-curator` | pass |
| (a) | analyst | 12.8 s | 0 | 0.217 | as above, for `analyst` | pass |
| (b) | reviewer | 100.5 s | 0 | 0.435 | A review `.md` with an `.evidence.json` beside it in the container's `reviews/` | pass |
| (c) | state-auditor | 31.9 s | 0 | 0.252 | Reply has a `## Coherence` heading and an `**Audit result:**` line | pass |
| (d) | policy-curator | 63.4 s | 0 | 0.547 | A `YYMMDD-HHMM-curator-run.md` in the container's `analyses/` | pass |
| (e) | orchestrator | 167.0 s | 0 | 1.639 | A `done` with non-empty `outcome.evidence`; `fusion-work-order` reports B `ready` and prints no `unmet=` line | pass |
| **Total** | | 428.4 s of dispatch; suite 455.2 s | | **4.384** | | **9 / 9** |

The vitest log reports `Tests 9 passed (9)` and a duration of 455.23 s. The run log is at the session scratchpad and is not kept in the workbench. The per-case transcripts above are the kept evidence.

### Transcript excerpts

- **(a) orchestrator** (`a-orchestrator.json`): the reply opens with `WORKBENCH=…/a-orchestrator/fusion-workbench`, then `OUT_ISSUE` and `OUT_DECISION` each inside the scratch project's package A container (slug `add-sum`), then `OUT_PACKAGES`. The other four (a) replies have the same shape. Each names its own `OUT_REVIEW` or `OUT_ANALYSIS` inside that container. Each took 3 or 4 turns.
- **(b) reviewer** (`b-reviewer.json`): "The commit does what the work package asks, and I recorded the verdict as **accept**. … Files are in [the container's reviews store]: a `-reviewer-add-sum.md` review stamped 23:21 and its `.evidence.json`." The evidence record on disk has `verdict: accept` and id `ed1be51d-…`.
- **(c) state-auditor** (`c-state-auditor.json`): "## Coherence / **Audit result:** coherent". The recommendation is `state brief`, because the dispatch carried no `**Directive:**`. The reply also notes that `fusion-cadence-anchor changed-files last_reconcile_commit` exited 4 and that it read every store in full. That is the documented branch for a mark that does not exist yet (`bin/fusion-cadence-anchor` header line 98; `agents/state-auditor.md` line 62), not a defect.
- **(d) policy-curator** (`d-policy-curator.json`): "Run file: [the container's analyses store]/<the 23:23 curator run file> … Proposed changes: 0 in each of the eight change types". It also wrote `fusion-workbench/.cadence-anchors` in the scratch project.
- **(e) orchestrator** (`e-orchestrator.json`): "'Add sum' is closed as done, and 'Document sum', the item that was waiting on it, is now ready to start. Before closing it I ran a review of the item's only commit (63d4343 …) … The review accepted it". It committed `c55d274 chore(workbench): close work package add-sum as done`.

### Case (e) on disk, checked beyond the suite's assertion

The suite asserts four values. I read the scratch project `…/fusion-agent-run-V3e2gl/e-orchestrator` again after the run, to check that the D3 mechanism ran in the order step 5 prescribes.

| Check | Observed |
|---|---|
| A `status` | `done`, `outcome.class` `completed` |
| A `outcome.evidence` | one entry: `record_id 2a7a898d-…`, `revision sha256:edfa836c…`, `policy claude-guided` |
| Top-level `evidence` of A | `[]`, so the binding went through the finish and not through `attach-evidence` |
| The bound record | the `-reviewer-add-sum.evidence.json` stamped 23:25 in the scratch reviews store, id `2a7a898d-…`, `verdict: accept` |
| The evidence's `brief_revision` | `sha256:033a8108…`, equal to the brief digest the fixture cited for `set-mode`, which is the brief before the closure note |
| Order: finish, then note | `orchestrator-events.jsonl`: plan `transition` 21:25:47 UTC, package `transition` 21:25:48 UTC. Brief mtime 23:25:55 local, `package.json` mtime 23:25:48 local. The note was appended after the finish. |
| B readiness | `bin/fusion-work-order`: `unmet-edges=0`, `ready=1`, B's row reads `1 0 0 ready` (slug `document-sum`) |
| Approval gates under `autonomous` | `gate_hit` "Circle stop conditions" + `gate_response` "clause 1: not put — answered by **Mode:** autonomous …"; `gate_hit` "A work package is about to close (finish)" + `gate_response` "proceed — answered by **Mode:** autonomous …". The legacy string "Circle" is mandated verbatim by `agents/orchestrator.md:438`. |
| Review dispatched by the orchestrator itself | `review_start reviewer` 21:24:37 → `record_change create` (the evidence) 21:25:25 → `review_done` 21:25:46 |

So case (e) showed package A `done` with `outcome.evidence` and package B `ready`. The closure took the route decision `261007-1836` option 1 describes: the review's evidence was bound into the finish before the note changed the brief's bytes.

### The five skill-block rows (step 6)

`codec/src/__tests__/install.test.ts`, group "the shipped reconcile, cadence, check gitignore, migrate Step 7 and help blocks, verbatim on a JSON workbench" (line 1095). It ran at 2026-10-07 23:19: `Test Files 1 passed`, `Tests 19 passed (19)`, 105.4 s. The run did not set `CODEC_REQUIRE_GOLDENS`, which this file does not read. The step 6 commit reports the goldens-required run separately (1700 passed, 0 skipped).

| Consumer | Test name | Result |
|---|---|---|
| `/fusion:reconcile` | "/fusion:reconcile: Step 1 finds the root from below and halts without one, Step 2 reads the domain and the mark, Step 3 sees a transition, Step 4 sets HEAD" | pass (2.9 s) |
| `/fusion:cadence` `## Process` | "/fusion:cadence ## Process: the resolver, identity, window, scan, week-check and digest-directory blocks" | pass (3.5 s). It pins a gap: a transition-only change is not seen by the `*.md` scan (lines 1222–1230). The gap is filed as `261007-1852-cadences-tree-scan-does-not-see-a-transition-only-change-on-a-json-workbench.md`. |
| `/fusion:check` `## gitignore` | "/fusion:check ## gitignore: appends the negation an excluded workbench.json needs, reports an unignored .json-state/ as class L, and prints nothing on a clean project" | pass (1.3 s) |
| `/fusion:migrate` `## Step 7` | "/fusion:migrate ## Step 7's Node gate: NODE= on the host's node, the refusal for a node too old and for none on PATH" | pass |
| `/fusion:help` | "/fusion:help: the FUSION_SRC block prints the install home with FUSION_PLUGIN_ROOT set, and UNRESOLVED without it" | pass (0.9 s) |

### D4's six rows, classified

| # | D4 consumer | Class | Covered by | What stays unobserved |
|---|---|---|---|---|
| 1 | Agent prompts: Setup, orchestrator, reviewer, state-auditor, policy-curator | **observation** | Cases (a)–(e) above, one run each | The orchestrator's interactive approval paths: (e) ran under `mode` `autonomous`, every gate was answered by the mode, and no `-p` run can answer a question put to the user. The orchestrator's **Drop** path, and a closure whose review returns `revise` or that has no review. `policy-curator` apply mode, which is gated on the user's approval of a ledger. `reviewer` in the ontology/data domain (only `**Review domain:** code` ran). `state-auditor` with a stated `**Directive:**` and with live records to reconcile (its stores were empty). Repetition: one pass per prompt proves one run, not every run. |
| 2 | `/fusion:reconcile` (5 blocks) | **test** | install.test.ts tenth group, reconcile case | The skill body's prose around the blocks (the state-auditor dispatch it makes) is covered only by row 1's case (c) |
| 3 | `/fusion:cadence` (6 blocks) | **test** | install.test.ts tenth group, cadence case | The digest itself (model-written prose). The pinned scan gap is a known defect, not unobserved (`261007-1852-cadences-tree-scan-does-not-see-a-transition-only-change-on-a-json-workbench.md`) |
| 4 | `/fusion:check` `## gitignore` | **test** | install.test.ts tenth group, check case | nothing in the block's scope |
| 5 | `/fusion:migrate` Step 7 Node gate | **test** | install.test.ts tenth group, migrate case | nothing in the block's scope |
| 6 | `/fusion:help` | **test** | install.test.ts tenth group, help case | The rest of help is prose; only the `FUSION_SRC` block executes |

## Implications

- D4's acceptance ("a test runs the shipped block … or the user rules that the consumer is accepted without one") is met for rows 2–6 by test. For row 1 it rests on one observation plus the limits the user has to rule on in step 9.
- D3's mechanism is shown end to end through a shipped prompt once: a headless orchestrator closed a package so that a `succeeded` successor became ready. Step 4's helper test still carries the deterministic proof.
- No case failed, so no issue is owed from this run.

## Recommendations

- Step 9 (orchestrator, then code-implementer): put row 1's unobserved items to the user one by one: interactive approvals, the Drop/`revise`/no-review closures, curator apply mode, reviewer in the ontology domain, and state-auditor with a directive and live records. Each one the user accepts becomes a `## Documented limits` bullet in `docs/upgrading-to-v13.md` that cites this report.
- The observation suite costs about 4.4 USD and 7.5 min per run. Re-run it at release acceptance (FJ05), not per commit.

## Filed Issues

None. Nine of nine cases passed.

## Sources

- `261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md`, steps 6–8, `## Where this work stops`
- `…/issues/261005-1018_o_six-consumers-the-prior-spec-names-have-no-test-that-runs-their-shipped-text.md`
- `…/issues/261005-0626_o_no-shipped-prompt-binds-a-reviewers-evidence-record-to-its-package-so-a-succeeded-edge-cannot-be-met.md`
- `hooks/lib/__tests__/agent-dispatch-observation.test.ts` (lines 53, 112–126, 135–202)
- `codec/src/__tests__/install.test.ts` (lines 1095–1330; 1222–1230 for the pinned cadence gap)
- `agents/orchestrator.md:438, 567`; `agents/state-auditor.md:62`; `bin/fusion-cadence-anchor` header lines 59–98
- Transcripts: `/private/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/fusion-agent-run-V3e2gl/{a-orchestrator,a-reviewer,a-state-auditor,a-policy-curator,a-analyst,b-reviewer,c-state-auditor,d-policy-curator,e-orchestrator}.json` and the scratch projects beside them
- Commits `f2e8ea4b` (step 6), `495aca7d` (step 7)

## Open Questions

- [ ] Step 9: which of row 1's unobserved items the user accepts as documented limits.
- [ ] The transcripts live under the OS temp directory, which the OS may clean. Should the run's nine JSON transcripts be copied into the workbench as evidence before that happens? This analysis did not copy them, because it was limited to one report file.
