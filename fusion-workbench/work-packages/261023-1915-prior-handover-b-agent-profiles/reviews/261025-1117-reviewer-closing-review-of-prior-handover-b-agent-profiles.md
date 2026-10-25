# Closing review of package B: agent entry profiles (plan steps 5 to 10)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `3e8e4c2e..5544cfca`
**Not-opened:** none
**Review domain:** code
**Range note:** the dispatch asked for `22d16e6a^..5544cfca`. `22d16e6a^` resolves to `777405eb`, so that range holds eight commits and leaves out `777405eb` and `f7526c70`, both of which the dispatch lists. `3e8e4c2e..5544cfca` holds all ten (`git rev-list --count` gives 10), and all ten were opened.
**Carried scope:** `fusion-workbench/orchestrator-events.jsonl` (the 51 rows the range adds, and the 4 uncommitted rows); `261024-1005-reviewer-post-release-pass-over-v13-3-4-and-v13-3-5.md` (read); `fusion-workbench/work-packages/`: every file the range changes under it; the narratives and `package.json` of packages B and F and of the parent package; package B's analysis, decisions and discussion; the parent's plan. The parent package's five decisions (question and `Answered:` line), four open issues and closing review (head) were opened too. None of the four issues overlaps a finding here. No other package is touched by the range.
**Verdict:** revise

## Summary

The conversion holds where it is mechanical. All eleven Claude renders are byte-equal, the eight new profiles tile exactly at the span map's offsets, and the lint split is D-B1 and nothing more. The defects are in what the `prior` text tells a run to do on Prior. Every entry Setup passes an absolute `directory` that Prior's wire refuses. The orchestrator keeps neutral steps that need a commit per task. In Prior's exec container no git identity is configured, so every `fusion-write` stops; that one is Prior's to fix through request 76. Three smaller gaps sit at Prior's exec bounds, the evidence record and step 15's hand-off.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 (one of them a request-76 carry) |
| Medium | 3, plus one decision record |
| Low | 2 |

## Verification as run

- `cd catalog && npm ci && npm test`: exit 0, 237 tests in three files.
- `npm run render -- claude`, then `git diff --exit-code agents/`: exit 0, all eleven files rewritten byte-equal. `git diff --quiet 22d16e6a HEAD -- agents/`: no `agents/` byte moved in the range.
- Tiling, own check (`/private/tmp/claude-501/-Users-kai-Projects-productive-F04-FUSION-fusion/8b3b7bf5-6951-4e24-abd3-a430445d035b/scratchpad/rv_tile.py`). It parses the span map's `#### <id>` tables independently of the analyst's `spans.json`, walks each `profile.json` in order, and compares the cumulative byte offsets and tags of the `neutral`/`claude` parts with the table rows. It also checks that each part number is either one `neutral` part or exactly one `claude` and one `prior` part. Result: all eight `OK`, span counts 64, 16, 26, 22, 26, 18, 10, 56, `RESULT PASS`.
- Services and Claude-only tokens over every `prior` part of the eleven agent profiles (`…/scratchpad/rv_services.py`, the substring rule of `servicesNamed` and the three `CLAUDE_ONLY_TOKENS` regexes, include lines removed). Zero Claude-only token hits. Services equal `catalog.json` `requires` for nine entries; orchestrator and policy-curator differ (Finding 3).
- Hooks suite at `5544cfca` in a scratch clone (`git clone --no-hardlinks` into the session scratchpad, `cd hooks && npm ci && npm test`): exit 0, 1216 passed, 14 skipped. The executors' commit messages state the catalog suite and the Claude render diff but not the plan's `HOOKS-WT`; this run stands in for it.
- Prior facts were read at the pin `08c57fb` (`adapters/prior/PRIOR_PIN`) with `git show`, Prior's working tree untouched.

## Findings by theme

### A. What an entry run is told to do against Prior's exec wire

**Finding 1 (High). Every entry Setup passes an absolute `directory`.** All eleven Setup bindings say: run `fusion-workbench-root` "with the workspace root as `directory`. It prints the project root …; give that path as the `directory` of every later call." The path is absolute: Prior mounts the workspace at its host path (`internal/supervisor/exec.go` `mounts`, `{Source: s.Workspace, Target: s.Workspace}`). Prior's `ExecCall` decoder refuses anything but `.` or a clean relative path (`moduleapi/v1/entry_wire.go`: `if c.Directory != "." && !workspacePath(c.Directory)`; `workspacePath` is `fs.ValidPath(p) && …`). No part states the relative rule, and `WORKBENCH` (absolute) is offered for file tools that take "a relative file path in the granted workspace; no host paths". Sites: the nine `03-prior.md`, `orchestrator/parts/07-prior.md`, `policy-curator/parts/05-prior.md`. Fusion fixes this.
Issue: `261025-1117-prior-setup-parts-pass-the-absolute-workbench-root-as-exec-directory-which-prior-refuses.md`.

**Finding 9 (High, request-76 carry). No git identity in the exec container.** `bin/fusion-write` stops (exit 1, "Nothing sent") when `bin/fusion-identity` exits 1. That helper reads the person only from `git config user.name`/`user.email`. Prior's exec prelude (`internal/supervisor/exec.go` `execPrelude`, at the pin) writes the container's whole global git config as `safe.directory = *`, with `HOME=/tmp`. A project whose identity is global, this repository included (`git config --local --get user.name` is unset), has none visible there. So on Prior every `create`, `transition`, `claim` and `evidence` of every entry profile stops. This is inference from source, and no entry run was executed. The checkout half is handled after the pin: Prior HEAD carries `.checkout-id` into the workspace read-only (`internal/fusionhost/entry_workspace.go` `EntryCarriedReadOnly`). **Request 76 must carry** the identity provisioning ask and the `.checkout-id` carry at the bundle's pin.
Issue: `261025-1117-every-fusion-write-in-a-prior-exec-container-stops-because-git-config-names-no-user.md`.

**Finding 4 (Medium). Reads and writes exceed exec's bounds.** `MaxExecOutputBytes = 64 << 10`, `MaxExecArgBytes = 32 << 10` (`entry_wire.go`). Setup reads emitted rule paths with `["cat", "<path>"]`. `rules/fusion-workbench-conventions.md` is 67 996 bytes and is emitted to every agent, so its tail is cut on every run. `reviewer/parts/17-prior.md` writes a whole file in one `printf` argument; one of the 182 review files in this workbench is over 32 KiB. Fusion fixes this.
Issue: `261025-1117-prior-parts-read-and-write-through-exec-past-its-64-kib-output-and-32-kib-argument-bounds.md`.

### B. One integration per run, carried through only half the orchestrator

**Finding 2 (High). Neutral orchestrator steps need a commit per task.** The `prior` parts (`33`, `37`, `49`, `51`, `55`) say an entry run integrates once, at its end. The executor's choice is forced: `entry.v1` has one `integrate` step. But five neutral spans still act on per-task commits:

- `36-neutral.md` 2d and `54-neutral.md`: revert with `git checkout HEAD -- <files>`. On Prior `HEAD` is the base revision, so a failed task's revert also discards earlier tasks of the same run on those files. `35-prior.md` repeats the sentence.
- `36-neutral.md`: `--to implemented --implementation-ref` "once Step 4 has committed". No hash exists inside the run.
- `38-neutral.md`: "After each commit … with the short hash".
- `48-neutral.md` step 2: the closing review is routed by uncovered commits. Inside the run there are none, so the step "skip[s] cleanly" and the finish carries no evidence. A package closed in an entry run is never reviewed.
- `48-neutral.md` step 4 and `## Ending the session`: commit range and "one line per commit".

The reviewer's own contract (`rules/review-contract.md`, two resolved hashes) has the same gap on an entry run dispatched mid-run. The span map could not see this: it tags by host token (`### 1. Tagging rule`), and per-task commits are plain prose. Fusion re-cuts the spans. **Request 76 must carry** the question whether an entry run may integrate per task.
Issue: `261025-1117-orchestrator-prior-render-keeps-neutral-steps-that-presume-a-commit-per-task.md`.

### C. Services named in `prior` parts

**Finding 3 (Medium). Orchestrator names no `host.dispatch.v1`.** Measured: orchestrator's `prior` parts name `host.exec.v1` only ("the host's agent-dispatch tool", `07-prior.md`, `17-prior.md`). `catalog.json` has `host.question.v1`, `host.exec.v1`; the span map says exec + dispatch. Step 15 is planned as a `catalog.json`-only change by data-implementer. Setting `requires` to exec + dispatch then fails `checkEntries`. The hand-off is in commit `98a6c2ed` only.

The dispatch's claim checks out with one refinement. Orchestrator and policy-curator are the only two mismatches. Every other agent entry already matches: analyst, code-implementer, data-implementer, document-editor and reviewer at exec; consultant at exec + dispatch; implementation-planner and requirements-designer at question + exec, per the user's ruling in `261025-0750-request-76-sequencing-and-prior-ask-channel.md`. The refinement: policy-curator closes with step 15's `requires` change alone, while orchestrator needs a `prior` part edit too. Fusion fixes this, best now in package B.
Issue: `261025-1117-orchestrator-prior-parts-name-no-host-dispatch-v1-so-step-15-alone-cannot-pass-checkentries.md`.

### D. The repair roles' entry branch (step 10)

**Finding 5 (Medium, decision). Read-only roles write through exec.** Reviewer and state-auditor keep read-only file ceilings and write through `bash -c printf`. The only bound on where they write is a sentence. The choice works at the pinned wire, but `prior-enforced` cannot see it. **Request 76 must carry** whichever form is chosen.
Decision: `261025-1117-how-does-a-read-only-role-write-the-workbench-on-a-prior-entry-run.md` (recommends a per-workflow file grant, exec writes as interim text).

**Finding 6 (Medium). Evidence on Prior misstates host and tree.** `hooks/lib/record-write.ts` hard-codes `host: "claude-code"` and `execution_policy: "claude-guided"`, and takes `subject.git_tree` from `HEAD^{tree}`, which is the base revision on Prior. Commit `5544cfca` names the host half only. A fix touches `hooks/`, which the plan's stop conditions hold still until C. So either the user amends the plan, or **request 76 must carry** it as a deliberate difference.
Issue: `261025-1117-fusion-write-evidence-on-prior-stamps-host-claude-code-and-the-base-revision-tree.md`.

**Finding 7 (Low). `reviewer/parts/06a-claude.md` has no `prior` counterpart.** An entry run loses standard 9's placement sentence. Fusion fixes this.
Issue: `261025-1117-reviewer-06a-claude-part-has-no-prior-counterpart-so-an-entry-run-drops-the-placement-finding.md`.

### E. Test coverage

**Finding 8 (Low). Nothing reads the eight new `prior` parts until step 15.** The Prior token lint runs over rendered profiles only. `priorProfiles` skips `unsupported` ones, and `checkEntries` skips entries not `supported`. My pass found no hit today. Fusion fixes this.
Issue: `261025-1117-the-eight-new-prior-parts-pass-no-lint-and-no-service-check-until-step-15.md`.

## The executors' choices, judged

| Choice | Judgement |
|---|---|
| Orchestrator integrates once per run | Forced by `entry.v1`'s single `integrate`, and right as far as the `prior` parts go. Incomplete: Finding 2. |
| Identity through exec environment names | Sound as far as the event-log fragment goes. Prior passes the SessionStart exports to every command whether named or not (`exec.go` `commandEnvironment`; the `Exports` comment: "Every command receives them without listing them"), so naming `FUSION_PERSON`, `FUSION_CHECKOUT`, `FUSION_SESSION_ID` is harmless. The fragment degrades to empty when both the exports and `fusion-identity` fail. It does not reach `fusion-write`, which reads `fusion-identity` itself: Finding 9. **Request 76 must carry**: confirm that an entry run receives the SessionStart exports, since they depend on the deferred lifecycle hooks. |
| data-implementer drops the commit-under-lock exception | Correct. The host is the sole committer, and `07-prior.md` says what to report when a task asks for a commit. |
| document-editor stops on branded decks; `writes_workbench` false | Correct. Prior has no skill service, and the Claude prompt also writes nothing in the workbench (`05-claude.md`). **Request 76 must carry** the deck stop as a deliberate difference to H3. |
| reviewer and state-auditor write via `host.exec.v1` | Workable, but steps around the ceiling: Finding 5 and Finding 4's 32 KiB bound. |
| `fusion-write evidence` stamps `claude-code` | A defect, and the tree half is worse: Finding 6. |
| reviewer `06a-claude.md` without a counterpart | A gap: Finding 7. |
| Every `prior` part a faithful replacement of its `claude` span | Byte tiling exact. Spot-read pairs are faithful: orchestrator 07, 33, 37, 39, 49, 51, 53, 57, 59; data-implementer 03, 07, 11, 15; document-editor 05, 07, 09; policy-curator 07, 15, 27, 37, 39, 47; analyst 09, 25; consultant 03, 13; the step-10 diffs of all three repair profiles. Exceptions: Finding 1 in every Setup part, `orchestrator/35-prior.md` (Finding 2). Not read pair by pair: the remaining short pairs, which are mostly one-line store or slash-command replacements. |

Two further assumptions in the `prior` text that **request 76 must carry**, neither of them a fusion defect today:

- `orchestrator/parts/57-prior.md`: `task_start`/`task_done` "land from the dispatch hooks the host runs". This needs Prior to fire PreToolUse/PostToolUse for its dispatch tool in the shape the hooks read (tool name `Agent`). That belongs to H9's `protocol_subset`.
- `requirements-designer/parts/13-prior.md`, `implementation-planner/parts/13-prior.md`: "a dispatched child is granted no `host.question.v1`". Prior's dispatch resolves the child's grant (`internal/supervisor/dispatch.go`, read at Prior HEAD `c5832fd`). I found no statement there that the question service is withheld from a child.

## Lint split (`af5fad9d`)

The commit implements D-B1 and nothing wider. `HOST_TOKENS` is unchanged, and `tokenHits` over neutral parts is unchanged. `priorTokenHits` filters `HOST_TOKENS` to the three `CLAUDE_ONLY_TOKENS` names, and the live Prior-render test switches to it. Four new cases pin both halves, including that the neutral lint still refuses the same helper line. The commit also transitions both decisions, and touches nothing else under `catalog/`.

## Release 13.3.9 and the two commits before it

`22d16e6a` moves the four version surfaces together: `plugin.json`, `install.sh` and `README.md` pins, and the help paragraph, with the golden regenerated (help 17620 to 17841 bytes). Tag `v13.3.9` points at it. `777405eb` changes a doc comment in `hooks/migrate.ts` and its `dist`, no code. `f7526c70` is workbench records only. Nothing found.

## Cross-cutting observations

- **One Setup binding, eleven copies.** Findings 1 and 4 hit all eleven profiles because the binding paragraph was copied into each Setup part. A fix applied by hand eleven times will drift. An `{{include}}` of one shared binding text, if the renderer can take one outside `rules/`, or one test that holds the eleven paragraphs equal, would keep them together.
- **Token tagging misses semantics.** Finding 2 comes from the span map's method. A span is `neutral` when it names no host mechanic, even if what it asks for only exists on one host. Package C's skill span map (step 11) uses the same method. It should also look for "commit", "hash", `HEAD` and "range".
- **The container is not the user's shell.** Findings 1, 4 and 9 share one cause. The `prior` parts treat an exec call as if it ran in the user's checkout. In fact it runs in a fresh container with a relative-path wire, a tmpfs `HOME` and bounded arguments and output. The parts state Prior's `directory` rule, its exec bounds and its git-config gap nowhere.
- **Prior's wire bounds are not in fusion's text.** Findings 1 and 4 both come from Prior constraints that `entry_wire.go` states and no `prior` part mentions. Request 76 can quote them back as part of what fusion read.

## Recommended sequencing

1. Before package B closes: Findings 1 and 3 (small text changes, no Claude byte moves), and Finding 2's re-cut.
2. Before step 15: Finding 8's test, so step 15's change is checked.
3. For the user: the decision of Finding 5, and the plan ruling Finding 6 needs.
4. For request 76 (package F): git identity in the container (Finding 9), the per-task integration question (Finding 2), the write form (Finding 5), the evidence difference if `hooks/` stays (Finding 6), and the four carries in the judgement table and the list below it.
5. Cleanup: Findings 4 and 7.
