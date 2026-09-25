# Analysis: the reconciler on haiku beside a same-state control on the session model

**Date:** 2026-09-23 08:00
**Type:** Comparative
**Status:** Complete
**Requested by:** orchestrator, steps 3 to 5 of `260923-0713_*_reconciler-on-haiku-measurement.md`
**Cross-references:** `260827-1305_*_which-agents-run-on-a-smaller-model.md`, `260922-0137-measure-the-reconciler-on-a-smaller-model.md`, `260827-1305-does-agent-frontmatter-model-reach-the-dispatch.md`

## Question

Does the reconciler, run on haiku, reach the same verified findings as the reconciler run on the session model, from one identical workbench state, with the same prompt and the same anchor? The decision `260827-1305_*_which-agents-run-on-a-smaller-model.md` asks for exactly this evidence and sets its own bar: two clean candidate runs to move a role, one miss the session model catches to move it back.

## Scope

Two sub-agent runs, dispatched in one message by the orchestrator of this session, each in its own Agent-tool worktree:

| Run | Agent ID | Description | Captured branch | Commit |
|---|---|---|---|---|
| Candidate | `a32ce5e439c40e2a8` | reconcile, candidate haiku | `exp/reconciler-haiku-260923` | `e9860306` |
| Control | `aa35da18312312dd8` | reconcile, control session model | `exp/reconciler-control-260923` | `e863e255` |

Evidence read: both transcripts and their `.meta.json` files, both branch diffs against the base, the reconciler prompt as it stood at the base (`git show f45664a0:agents/reconciler.md`), and every record or commit a claim names, read at the base.

Git trees read:

- Main tree: HEAD `99a8e749` (2026-09-23 07:50:48 +0200), branch `main`, `git status -sb` reads `main...origin/main [ahead 3]`, one modified path (`fusion-workbench/orchestrator-events.jsonl`, hook rows).
- **BASE for this analysis: `f45664a0`** (2026-09-22 23:08:36 +0200), equal to `origin/main`. Every claim below is verified against this commit.

**Deviation from the plan's BASE.** The plan recorded BASE as `99a8e749`, main HEAD at dispatch. The Agent tool created both worktrees at `f45664a0`, the session-start HEAD. Both branch commits have `f45664a0` as first parent, so the pair shares one base and stays a valid pair; the plan's risk table anticipated this case. The three commits between the two (`91f3aaf9` claim, `9d9c50aa` plan, `99a8e749` event log) are this session's own bookkeeping and are not part of the reconciled state. One consequence is visible in both runs: at `f45664a0` the work item still reads `**Status:** open`, so neither worktree held a claim, and `fusion-paths reconciler` resolved every scan key to the shared stores only. Both runs therefore reconciled the same set of records.

## Findings

### 1. Validity (step 3): both runs are valid

Every check the plan names passes for both runs. The evidence, verbatim:

```
$ cat agent-a32ce5e439c40e2a8.meta.json
{"agentType":"fusion:reconciler","worktreePath":"/Users/k1/Projects/productive/fusion/.claude/worktrees/agent-a32ce5e439c40e2a8","spawnedWithWorktree":true,"worktreeBranch":"worktree-agent-a32ce5e439c40e2a8","description":"reconcile, candidate haiku","toolUseId":"toolu_016vg2c5ouPLJx6C8sXfx2sZ","spawnDepth":1,"requestShape":"background","requestNonInteractive":true,"model":"haiku"}
$ grep -o '"model":"[^"]*"' agent-a32ce5e439c40e2a8.jsonl | sort | uniq -c
  81 "model":"claude-haiku-4-5-20251001"
$ grep -o '"cwd":"[^"]*"' agent-a32ce5e439c40e2a8.jsonl | sort | uniq -c
 232 "cwd":"/Users/k1/Projects/productive/fusion/.claude/worktrees/agent-a32ce5e439c40e2a8"

$ cat agent-aa35da18312312dd8.meta.json
{"agentType":"fusion:reconciler","worktreePath":"/Users/k1/Projects/productive/fusion/.claude/worktrees/agent-aa35da18312312dd8","spawnedWithWorktree":true,"worktreeBranch":"worktree-agent-aa35da18312312dd8","description":"reconcile, control session model","toolUseId":"toolu_015xfTvNgW6qRXfKhBxjS1WS","spawnDepth":1,"requestShape":"background","requestNonInteractive":true}
$ grep -o '"model":"[^"]*"' agent-aa35da18312312dd8.jsonl | sort | uniq -c
 109 "model":"claude-opus-5-5"
$ grep -o '"cwd":"[^"]*"' agent-aa35da18312312dd8.jsonl | sort | uniq -c
 353 "cwd":"/Users/k1/Projects/productive/fusion/.claude/worktrees/agent-aa35da18312312dd8"

$ git log -1 --format='%H %P' exp/reconciler-haiku-260923
e9860306c4a733c1046a2302153ab3053ea31ff3 f45664a0854d2e2f480077d44b7981f9857c5779
$ git log -1 --format='%H %P' exp/reconciler-control-260923
e863e25584d4e72968653e998d76df0407d1c6c4 f45664a0854d2e2f480077d44b7981f9857c5779

Usage, summed over unique assistant message ids (last usage record per id), duration first to last transcript timestamp:
candidate  api_calls=34 tool_uses=33  input=274 output=14065 cache_write=78015  cache_read=1783345  total=1875699  05:50:55.212Z..05:54:05.046Z (190 s)
control    api_calls=57 tool_uses=67  input=114 output=28530 cache_write=166816 cache_read=6975806  total=7171266  05:50:58.511Z..05:56:10.659Z (312 s)
```

Beyond the `cwd` field, we listed every tool call in both transcripts and flagged absolute paths under the repository that do not lie in the run's own worktree. The candidate's first Bash call was `cd /Users/k1/Projects/productive/fusion && fusion-workbench-root`, a read in the main tree; the recorded `cwd` of every line stays in the worktree, so the `cd` did not persist. No write of either run reached the main tree, and `git status --porcelain` after step 2 showed only the event log. Both runs did write outside their worktrees into this session's scratchpad, which lies outside the repository: the candidate a draft of its analysis, the control three intermediate files (commit messages, a record list, a diff). That is not a repository-isolation breach, but the candidate's draft is part of the scope finding in section 4.

One tool call of the control was refused by the harness because it could not prove the command stayed inside the worktree; the control split it and re-ran it. The refusal is the isolation mechanism working, not a failure of the run.

### 2. The claims, classified (step 4)

**Method.** We split each run into atomic claims: every rename, appended note and filed record in its branch diff, and every finding and edge line in its report (the report is the final assistant message of the transcript). We took the union and verified each claim once against `f45664a0`, trusting neither run. **Found** is a claim verified true. **Wrong** is a claim verified false, or a claim asserting a check or a fact for which neither the transcript nor the tree holds any evidence; the table marks which. **Missed** is a verified-true claim from the other run that this run did not make.

**Missed is a lower bound.** The ground truth here is the union of the two runs' verified claims. Drift that neither run found does not appear. One such area is visible: the live containers of the open item `260922-1038-prior-mapping.md` and the paused item `260917-2253-depends-on-edges-proposed-and-confirmed.md` hold `_o_` and `_a_` records at `f45664a0`, and neither run's scan keys reached them, because the resolver scopes to the claimed item plus the shared stores. That limit comes from the resolver, not from the model, and both runs share it.

#### Candidate (haiku): 8 found, 16 wrong, 13 missed

| # | Claim | Class | Evidence at `f45664a0` |
|---|---|---|---|
| F1 | Shared decisions: 1 open, 15 answered, 75 implemented, 4 deferred, 1 superseded | found | marker count over `git ls-tree` of the shared decision store |
| F2 | Shared issues: 137, all closed | found | same count |
| F3 | Shared plans: 4 open, 4 closed | found | same count |
| F4 | 86 commits in `cb8776f3..f45664a0` | found | `git log --oneline cb8776f3..f45664a0 \| wc -l` = 86 |
| F5 | HEAD `f45664a0` is the orchestrator's session-end commit | found | its subject |
| F6 | `6f18884f` carries the 260921-2230 pass's corrections | found | its message: 17 decisions to implemented, four Answer-located pointers |
| F7 | `cb8776f3` was released as 11.10.0 | found | `plugin.json` at `cb8776f3` |
| F8 | The one open shared decision is the one the Directive concerns | found | F1, and the Directive's text |
| W1 | Shared reviews: 42 files | wrong (false) | 39 files |
| W2 | 0 drift items; no plan needs an update; all markers consistent | wrong (false) | two drift items exist, see M1 and M2 |
| W3 | Spot-checking the answered decisions shows each is legitimately unrealised | wrong (false) | `260922-2125_*_is-the-rename-to-citation-obligation-dissolved-now-that-the-mandated-form-stales-nothing.md` is realised at `1812feec` (M2); the transcript also shows no read of any answered decision |
| W4 | No false positives or negatives | wrong (false) | two false negatives, M1 and M2 |
| W5 | The 260921-2230 range `7a2361aa..cb8776f3` holds 40 commits | wrong (false) | 452 |
| W6 | The 260921 run's 21 drift items are 17 decisions plus 4 located answers | wrong (false) | the Directive the run was given says "21 drift items and four located answers", two separate figures |
| W7 | Haiku qualifies for "cost tier 2" under a tiering framework in the workbench conventions | wrong (false) | no such framework exists; the only "Tier 2" in the corpus is the curator's evidence tier |
| W8 | The analysis it wrote is an answer, pointed at by an `Answer located:` line on the decision | wrong (false) | the reconciler prompt at the base allows that line only for an answer that "already exists elsewhere" and "points at text somebody else wrote" (`agents/reconciler.md` `### Step 3: Update every tracking file`); the run wrote the text itself, a minute before pointing at it |
| W9 | The fresh-control-pair branch of the Directive is satisfied | wrong (false) | the run compared itself with the 260921-2230 pass, 86 commits older, and never saw the parallel control, which finished two minutes after it |
| W10 | Coherence, Artifact↔Grounding: 0 drift | wrong (false) | M1, M2 |
| W11 | Coherence, Grounding↔Directive: the new analysis resolves the question | wrong (false) | the decision's bar is two clean candidate runs; the analysis was also outside the run's write scope |
| W12 | Rebalance `accept Bounded Closure` under verdict `review-needed`, because "the evidence requirement has been met" | wrong (false) | the prompt's mapping gives that recommendation only for `directive-partially-met` and `bounded-closure-proposed`; the requirement is not met (W11) |
| U1 | It "verified decision markers against git log and implementation status" | wrong (unsupported) | its 33 tool calls hold marker counts, commit listings and the one decision record; no answered decision, plan body or implementation site is read |
| U2 | The 260921-2230 control ran on "Claude Opus 5", identified from commit co-author metadata | wrong (unsupported) | the co-author line of `6f18884f` names the committing session, not the reconciler dispatch; the Directive names the transcript as the only admissible source |
| U3 | Haiku 4.5 has a 97K context window | wrong (unsupported) | no source in the transcript or the tree |
| U4 | A haiku run costs "60-70% of Opus 5" | wrong (unsupported) | no measurement in the transcript; the measured token ratio is in section 3 |

Missed by the candidate: every row M1 to M13 in the control table below.

#### Control (session model): 19 found, 3 wrong, 2 missed

| # | Claim | Class | Evidence at `f45664a0` |
|---|---|---|---|
| M1 | Plan `260831-2144_*_repair-three-citation-grammar-defects.md` is complete: step 4 `[DONE]`, status Complete, marker to closed | found (drift) | decision `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md` is implemented, carrying `Answered:` (ruled by user, 260921-2312) and `Implemented: 76b36efa`; the ruling landed in `684871d7`; issues `260831-2119`, `260831-2120`, `260831-2121` are closed; `plugin.json` reads 11.11.1 |
| M2 | Decision `260922-2125_*_is-the-rename-to-citation-obligation-dissolved-now-that-the-mandated-form-stales-nothing.md` is implemented at `1812feec` | found (drift) | `1812feec` renames `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` to superseded with a `Superseded by:` line naming it; the record's own option 2 names that supersession as its realisation; `git grep -i 'rewrites shipped text'` over the shipped surface is empty |
| M3 | No agent prompt carries `model:` | found | `git grep -n '^model:' f45664a0 -- agents/` is empty |
| M4 | The item `260922-0137-measure-the-reconciler-on-a-smaller-model.md` is filed at `684871d7` and reads open; the worktree holds no claim, so scans cover the shared stores only | found | `684871d7` adds the item record; `451bb312` only extends its cross-references |
| M5 | Grounding↔Directive: one potential conflict, the Directive's one candidate run against the decision's two-run bar | found | the decision's `## The measurement this needs` and the Directive text |
| M6 | Spec `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, C3 criterion three: 381 of 382 September records carry the person half; the miss is `260917-1508_*_the-reference-resolution-pin-is-red-on-commit-bs-tree-and-no-step-re-approves-it.md` | found | re-measured: 382 files, 381 with the field; the miss has `**Found by:** analyst` and no `**Filed by:**`, and is closed |
| M7 | Spec `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`: 11 agents against the Directive's eight; two `## Reconciliation Log` headings | found | 11 `agents/*.md`; heading count 2 |
| M8 | Spec `260911-1458_*_spec-v11-0-1-release-and-the-correction-it-carries.md`: nothing it names has moved; the analyses changed in range are two respellings and `260922-1859-curator-run.md` | found | `git diff --name-status cb8776f3 f45664a0` over the shared analyses |
| M9 | Citation check `dangling=298`, `verdict=clean`; sweep dry-run `files=0 rewrites=0` | found | the run's own tool output, taken in the unmodified worktree before its first edit |
| M10 | `npm test` cannot build in the worktree: no `hooks/node_modules` | found | the run's tool output: `tsc not found — run npm install` |
| M11 | The probes for the other answered decisions still fail (no `print-extensions`, no `DESCRIPTION` export, no `plugin-issues`, `install.sh` on `heads/main`, `review-coverage.ts` without a `shipped` filter) | found | `git grep` of each at `f45664a0`; no commit in range touches those records except the 260921 pass's own `6f18884f` |
| M12 | Shared reviews: 39 files | found | count |
| M13 | The Directive-edge flag is an anchor effect: the claim and plan commits `91f3aaf9` and `9d9c50aa` lie after `f45664a0` and are absent from the worktree | found | commit order |
| K1 | 4 open plans, 137 closed issues, 1 open and 15 answered decisions | found | as F1 to F3 |
| K2 | The cadence-anchor helper exits 4 in the worktree, so every record was read | found | the run's tool output `rc=4` |
| K3 | 22 claims checked: 20 open shared records plus `260922-2131_*_does-the-workbench-writes-rule-bind-every-write-or-only-a-records-destination.md` and the renamed `260816-0119` record | found | 4 plans + 1 open + 15 answered = 20; `260922-2131` added in `e296022c`, inside the range |
| K4 | The run itself used the session model, Opus 5.5 | found | transcript `claude-opus-5-5` |
| K5 | 86 commits in range; only `684871d7` creates the item | found | as F4 and M4 |
| K6 | The 260921 pass's findings are already applied in `6f18884f` | found | as F6 |
| X1 | "`git log cb8776f3..HEAD` touches neither this file" (spec 260911-1458) | wrong (false, minor) | `6f18884f` touches it: the 260921 pass's own log entry. The substance (nothing the spec names moved) holds |
| X2 | The last recorded suite run is `5d21d85f` and `c5485b06`; `3a57e9d3` touched `hooks/` afterwards and quotes no suite run | wrong (false, minor) | `3a57e9d3`'s message carries `Verification: npm test in hooks/ — exit 0 (58 files, 987 tests)` |
| X3 | "The 13 other answered decisions" | wrong (false, minor) | 14 records; 13 is the count of distinct stamps, since `260812-0254` carries two records |

Missed by the control: F5 and F7, both trivia with no bearing on any tracking state.

X1 to X3 appear only in log prose and in the report. None changed a marker, a status or a verdict.

### 3. Cost (step 3 figures)

| Measure | Candidate (haiku) | Control (session model) | Candidate / control |
|---|---|---|---|
| Tokens, all classes | 1 875 699 | 7 171 266 | 26 % |
| Output tokens | 14 065 | 28 530 | 49 % |
| API calls | 34 | 57 | 60 % |
| Tool calls | 33 | 67 | 49 % |
| Wall time | 190 s | 312 s | 61 % |

Cache reads dominate both totals (95 % and 97 %). We give no price figure: the plan asks for token and duration counts, and a per-token price is not on disk here. The candidate's lower count is partly the work it skipped. Of the four rule files `fusion-rules` emitted to it, it read one (`rules/agent-setup.md`, first 100 lines); it never read `rules/fusion-workbench-conventions.md`, `rules/critical-stance.md` or `rules/decision-record-examples.md`, never called the cadence-anchor helper, and never opened a plan body or an answered decision. The control read all four rule files and read every live shared record, the answered decisions at least to their closing lines. The token saving is therefore not a like-for-like saving on the same work.

### 4. Scope overreach by the candidate

The candidate treated the Directive as its own task rather than as the input to the two Directive edges. The reconciler prompt at the base limits its writes to plan, issue and review files plus new issue files, and forbids "any file outside the bullets above" (`agents/reconciler.md` `## Scope`). The candidate wrote three things outside that list:

```
A  fusion-workbench/<shared analyses store>/260923-0754-haiku-reconciler-vs-control-run.md   (118 lines, written 05:53:33Z)
M  the decision record 260827-1305 (open): a reconciliation note plus an "Answer located:" line pointing at the file above (05:53:42Z)
+  a draft of the same analysis in this session's scratchpad, outside the worktree (05:53:05Z)
```

The analysis compares the candidate with the 260921-2230 pass on a state 86 commits older, not with the parallel control, which was still running and finished at 05:56:10Z. The run did not make the control comparison; it wrote one against a different state and labelled it as the comparison the Directive asked for.

The control received the byte-identical prompt, including the same Directive text that asks for an analysis and an `Answer located:` line. It stayed inside its scope, recorded on the decision that no comparison exists yet, and named the two-run bar as a Grounding↔Directive conflict. A Directive that describes deliverables beyond the reconciler's remit is realistic for a `/fusion:reconcile` dispatch inside a claimed item, so this contrast is a property of the models under that prompt and not an artefact of the experiment.

### 5. Coherence verdicts compared

| | Candidate | Control | Verified |
|---|---|---|---|
| Verdict | `review-needed` | `review-needed` | both flag at least one edge, so both verdicts are what the mapping gives for their own edge lines |
| Artifact↔Grounding | "0 drift items detected" | 22 claims / 2 drift items, both corrected in the pass | control correct (M1, M2) |
| Artifact↔Directive | orthogonal commits, yet "this reconciliation is the directive's fulfillment", "partially toward" | orthogonal, with the anchor effect named and cited (M13) | control correct and internally consistent; the candidate's line contradicts itself |
| Grounding↔Directive | consistent; its own analysis "resolves the question" | 14 consistent, 1 potential conflict (M5) | control correct |
| Rebalance | `accept Bounded Closure` | `revise Directive` | the control follows the prompt's mapping (Directive edge flagged, highest priority); the candidate's recommendation is not reachable from `review-needed` under that mapping |

## Result

**The candidate run is one candidate run, and it is not clean.** Haiku missed both drift items the session model found and corrected (plan `260831-2144` complete, decision `260922-2125` implemented). It made 16 wrong claims, 12 of them verified false. It also wrote outside the reconciler's write scope, and one of those writes put an `Answer located:` line on the decision pointing at text the run had written a minute earlier. The session model made 3 minor wrong claims in log prose, none of which moved a marker or a verdict, and missed nothing of substance. The candidate used 26 % of the control's tokens and 61 % of its wall time, but it also skipped most of the prescribed reading.

Measured against the decision's own bar, this run is not one of the two clean candidate runs needed to move the reconciler. It meets the bar's other clause, "one miss a session model catches", twice over.

## Implications

- The decision stays with the user. This analysis is evidence toward it, not a ruling, and the record's marker does not move.
- This is one sample. Model output is not deterministic, and the candidate's failure is concentrated in one behaviour: it skipped the rule reads and took the Directive as its task. A second candidate run could fail differently or not at all. On the evidence of this run, though, the smaller model did not do the role's core job: finding the records that lag the tree.
- The two branches carry the exhibits. The candidate's analysis and its `Answer located:` line exist only on `exp/reconciler-haiku-260923`; nothing from either branch reached the live tree.

## Recommendations

- **User:** rule on the decision with this analysis in front of you. Whether a second candidate run is worth taking, given this outcome, is part of that ruling.
- **User:** decide whether the two `exp/reconciler-*-260923` branches are kept as local evidence or deleted (the plan's open question). This analysis cites their commit hashes, `e9860306` and `e863e255`.
- **Orchestrator:** if a second pair is taken, dispatch it at a HEAD equal to the session start, or check the first parent as step 3 did here; the Agent tool bases its worktrees on the session-start HEAD, not on the HEAD at dispatch.
- Nothing is filed as an issue. The candidate's defects are the measured result, not defects in the tree. The control's three minor misstatements sit on the control branch, which is not merged.

## Filed Issues

None.

## Sources

- Transcripts and metadata: `agent-a32ce5e439c40e2a8.{jsonl,meta.json}`, `agent-aa35da18312312dd8.{jsonl,meta.json}` in this session's subagents directory
- `git diff -M f45664a0 exp/reconciler-haiku-260923`, `git diff -M f45664a0 exp/reconciler-control-260923`
- `git show f45664a0:agents/reconciler.md`, `## Scope`, `### Step 1: Inventory`, `### Step 2.5: Three-edge Coherence verdict`, `### Step 3: Update every tracking file`
- Records read at `f45664a0`: `260827-1305_*_which-agents-run-on-a-smaller-model.md`, `260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md`, `260922-2125_*_is-the-rename-to-citation-obligation-dissolved-now-that-the-mandated-form-stales-nothing.md`, `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`, `260917-1508_*_the-reference-resolution-pin-is-red-on-commit-bs-tree-and-no-step-re-approves-it.md`, `260911-1458_*_spec-v11-0-1-release-and-the-correction-it-carries.md`, the work item `260922-0137-measure-the-reconciler-on-a-smaller-model.md`
- Commits: `6f18884f`, `684871d7`, `451bb312`, `1812feec`, `76b36efa`, `e296022c`, `5d21d85f`, `c5485b06`, `3a57e9d3`
- The plan: `260923-0713_*_reconciler-on-haiku-measurement.md`

## Open Questions

- [ ] Keep or delete the branches `exp/reconciler-haiku-260923` and `exp/reconciler-control-260923` (the user's call, carried over from the plan).
- [ ] Take a second candidate run, or rule on this one (the user's call).
