# Closing review of package C: skill profiles (plan steps 11 to 14), and the fix commit after package B's review

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `5544cfca..ec6c968e`
**Not-opened:** none
**Review domain:** code
**Range note:** `git rev-list --count 5544cfca..ec6c968e` gives 7. They are the seven commits the dispatch lists: `81f000c7`, `ff14570b`, `79c0c41e`, `eab95b30`, `6d49600a`, `87675d99`, `ec6c968e`. All seven were opened. The range changes 711 files.
**How the 711 files were opened:** the 438 `neutral` and `claude` parts were checked byte for byte, by tiling against the span map and by the Claude render, not read as prose. That is the same method as package B's review. The 151 skill `prior` parts that differ from their `claude` part were read as text. For the sixteen `01-prior.md` bindings, three were read in full and the rest by their skill-specific bullets, after a script showed every shared bullet byte-identical across all sixteen. The 59 skill `prior` parts that are byte-identical to their `claude` part were confirmed with `cmp`. Of the 21 `prior` parts `81f000c7` touched, the ten orchestrator and reviewer parts were read in full. The eleven Setup parts were checked for the relative-directory rule, and analyst's was read in full. Also opened: every workbench record the range adds or changes, `catalog/src/render.ts` and its test diff, `catalog/README.md`, and every `profile.json`.
**Carried scope:** none was carried (the dispatch: "Carried Not-opened list from the last review: none").
**Verdict:** revise

## Summary

The conversion holds where it is mechanical. All 27 Claude renders are byte-equal. The sixteen skill profiles tile the span map exactly. Every skill's `prior` parts name exactly the span map's service set, and the Prior lint finds no Claude-only token. The renderer takes the target from the entry's kind and refuses both kinds of duplicate. `81f000c7` fixed package B's three findings at every site that acts.

The defects are again in what the `prior` text makes a run do against Prior's pinned wire:
- Three dispatching skills pass `host.dispatch.v1` a text input, where the pin takes a JSON object.
- wp and memo route free-text questions to a question tool that needs an option.
- The text calls `/tmp` persistence unknown, which the pin states.

Two hand-offs are open. Step 15 as written would make `commit` and `cleanup` supported. The reviewer has no range form for the uncommitted scope that `81f000c7` now sends it.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 4 |
| Low | 4 |

Three lines were appended to open issues of package B as `Also seen:`, not refiled.

## Verification as run

- **Span map, re-run.** The four appendix blocks of `261025-2218-skill-span-map-for-entry-profiles.md` were extracted into an empty scratch directory. Then `python3 -I tile_check.py <fusion> skill_spec.py . eab95b30` was run: all sixteen `tiling=ok concat=equal alternating=ok neutral_token_hits=0 uncoded_claude=0`, `RESULT PASS`. `shell_check.sh` gave sixteen `cmp-equal`, and `js_tokens.mjs` sixteen `neutral-spans-with-hits=0`. The neutral percentages differ from Finding 2 by rounding only (setup 47 against 48).
- **Parts against the map, own check** (`/private/tmp/claude-501/-Users-kai-Projects-productive-F04-FUSION-fusion/8b3b7bf5-6951-4e24-abd3-a430445d035b/scratchpad/rv_ctile.py`). It walks each `skill-*/profile.json` in order, accumulates the byte lengths of the `neutral`/`claude` parts, and compares tag and offsets with the span map's `spans.json`. It also checks that each part number is one `neutral` or exactly one `claude` and one `prior` part, and that every part file on disk is listed. Result: all sixteen `OK` (39, 44, 15, 12, 22, 28, 30, 9, 17, 52, 22, 24, 26, 16, 26 and 33 spans), `RESULT PASS`.
- **Catalog and render**, in a `git clone --no-hardlinks` at `ec6c968e` in the scratchpad. `cd catalog && npm ci && npm test` exits 0 with 259 tests. `npm run render -- claude` wrote 27 files, and `git diff --exit-code agents/ skills/` exits 0. `git diff --stat 5544cfca ec6c968e -- skills agents rules hooks bin codec templates docs README*.md CLAUDE.md .claude-plugin` is empty, so no shipped byte and no codec byte moved.
- **Step 15 simulated**, in the clone's `catalog.json`. All sixteen skill entries were set `prior: supported`, `requires` taken from the span map's Finding 5 column. `npm test` then exits 0 with 259 tests: `checkEntries` and the live Prior-token lint pass for every skill render. So each skill's `prior` parts name exactly the span map's set. `npm run render -- prior` wrote sixteen `skill-*.md` and `.json`, the largest 33 469 bytes.
- **`HOOKS-WT`** in the same clone: 1216 passed, 14 skipped. Steps 13 and 14 name it as Verification, and neither commit message claims it. This run stands in for it.
- **Prior facts**, read only, with `git -C /Users/kai/Projects/productive/F09-Prior show 08c57fb:<path>`: `moduleapi/v1/entry_wire.go`, `internal/supervisor/exec.go`, `tool_containers.go`, `question.go`, `general_tools.go`, `dispatch.go`, `internal/platform/container.go`, and `internal/fusionhost/external_catalog.go`. Prior's working tree was not touched.
- **Not run:** `FUSION-MODULE` (`adapters/prior/stage.sh test`). The commit messages state it exit 0, and no Go source changed in the range.

## Findings by theme

### A. What a skill run is told to do against Prior's pinned wire

**Finding 1 (High). The dispatch input is text in the profile and a JSON object on the wire.**
- The text: reconcile, curate and discuss bind "the dispatch text as its input". The call sites describe that input as lines: `skill-reconcile/parts/15-prior.md`, `skill-curate/parts/09-prior.md` and `21-prior.md`, `skill-discuss/parts/19-prior.md`.
- The pin: `general_tools.go` `DispatchDescriptor` takes "input its role input as a JSON object written as a string". `validDispatch` refuses a non-object, and `entry_wire.go` `DecodeDispatchCall` decodes the input into a map.
- No `prior` part, agent or skill, states which object, `consultant/parts/13-prior.md` included.
- Separately, discuss's input starts with `**Round:**`. The `consultant` entry declares only `conversation`, and no agent reads that line.

Fusion fixes the text. **Request 76 must carry** the input shape fusion proposes.
Issue: `261025-2352-skill-prior-parts-pass-host-dispatch-v1-a-text-input-where-the-pinned-wire-takes-a-json-object.md`.

**Finding 2 (Medium). Free-text questions go to a tool that needs an option.**
- wp `07-prior.md` mode 3 asks for title and paragraph with one `host.question.v1` call and no options.
- memo `15-prior.md` mode 3 asks kind, topic and content in one call.
- The pin: `question.go` `QuestionDescriptor`: "options are required". `questionCall` refuses `ask-user-question` with zero options. `DecodeResult` takes exactly one answer when `multi_select` is false.
- Both profiles' own binding sends only fixed-option questions to the service, and everything else to a turn end.

As chat text, wp names no question service, and its `requires` stays `host.exec.v1`. That is what `catalog.json` holds now, so one of the span map's five step-15 disagreements disappears. Fusion fixes this.
Issue: `261025-2352-wp-and-memo-put-free-text-questions-through-host-question-v1-which-needs-an-option-and-takes-one-answer.md`.

**Finding 3 (Medium). `/tmp` persistence within a run is stated at the pin, and the text calls it unknown.**
- The pin: `tool_containers.go`, header: one container per function run, shared by its child runs, and "files outside the mounted workspace (/tmp, which is also HOME) … persist for the later calls of the same function run". `container.go` mounts `/tmp` as a 64 MiB `noexec` tmpfs.
- The text: the span map's P5 and question 5 read only `exec.go`. `skill-archive/parts/01-prior.md` says "not stated", while its `41-prior.md` comment says "kept between calls". `skill-cleanup/parts/09-prior.md` and `skill-commit/parts/07-prior.md` build on "not known".

Fusion fixes this. Request 76 should drop or narrow question 5.
Issue: `261025-2352-skill-prior-parts-and-request-76-question-5-call-tmp-persistence-unstated-which-prior-08c57fb-states.md`.

### B. Hand-offs to later steps

**Finding 4 (Medium). Step 15 would make `commit` and `cleanup` supported.**
- The plan's step 15 sets `supported` "for every entry whose profile has a `prior` part", and both have such parts.
- The decision to keep them unsupported, which the dispatch also states, lives in the span map's Recommendation 2 and two commit messages.
- Package B's Finding 3 was the same kind of gap.

The `requires` changes need no such note: they follow from the parts, as the step-15 simulation shows.
Issue: `261025-2352-plan-step-15-as-written-would-mark-commit-and-cleanup-supported-on-prior.md`.

**Finding 5 (Medium). The reviewer has no range for an uncommitted scope.**
- `81f000c7`'s `48a-prior.md` dispatches the closing review over "the files this run changed", uncommitted on the base revision. `48e-prior.md` then reports each file "with the review of this run that opened it".
- The reviewer's `prior` parts still follow `rules/review-contract.md`: two hashes, and a not-opened list only.
- Package B's review named this gap. The addendum left it open.

Fusion fixes this, unless request 76 allows a commit per task.
Issue: `261025-2352-a-reviewer-entry-run-over-uncommitted-files-has-no-reviewed-range-to-write.md`.

### C. Wording and upkeep

**Finding 6 (Low). The orchestrator's neutral framing still commits per task.** Six sentences remain: `04-neutral.md` (lines 4, 6 and 8), `24-neutral.md`, the `36b-neutral.md` heading, `62-neutral.md` and `64-neutral.md`. No step acts on them.
Issue: `261025-2352-orchestrator-neutral-parts-still-frame-the-loop-as-a-commit-per-task-after-81f000c7.md`.

**Finding 7 (Low). The question numbers cited from the span map are not stable.** 38 citations "(request 76, question N)" in 32 `prior` parts rest on the span map's numbering, and request 76 is not written yet. `skill-discuss/parts/09-prior.md` cites question 2 where it means question 11.
Issue: `261025-2352-thirty-eight-prior-part-citations-name-request-76-questions-by-a-number-only-the-span-map-assigns.md`.

**Finding 8 (Low). No stated rule picks a `tools_ceiling`.** migrate and news write the workbench with a read-only ceiling, and archive moves files without `rename` or `delete`. The values fit "the file classes the text uses through file tools", but nothing says so. The open decision `261025-1117-how-does-a-read-only-role-write-the-workbench-on-a-prior-entry-run.md` decides whether such ceilings bind.
Issue: `261025-2352-skill-profile-tools-ceilings-follow-no-stated-rule-and-three-write-the-workbench-past-them.md`.

**Finding 9 (Low). The release help paragraph now lives in two parts.** `skill-help/parts/21-claude.md` holds the release notes, and `21-prior.md` repeats them after a preamble. A release that edits one part keeps the byte test green. Plan step 22 should own this.
Issue: `261025-2352-the-release-help-paragraph-now-lives-in-two-parts-and-the-editing-route-names-one.md`.

### Appended to package B's open issues

- `261025-1117-the-eight-new-prior-parts-pass-no-lint-and-no-service-check-until-step-15.md`: the gap now covers the 210 skill `prior` parts. `catalog/README.md` ("held to the same lints … the narrower Prior lint") and `eab95b30`'s message ("skill parts are covered as they land") overstate the coverage. My step-15 simulation found no hit today.
- `261025-1117-prior-parts-read-and-write-through-exec-past-its-64-kib-output-and-32-kib-argument-bounds.md`: the skill bindings read in chunks, while the eleven agent Setup parts still `cat`.
- `261025-1117-every-fusion-write-in-a-prior-exec-container-stops-because-git-config-names-no-user.md`: memo now halts on it. Also, `execPrelude` overwrites `$HOME/.gitconfig` before every call, so a run cannot set the identity itself.

## Renderer (`eab95b30`)

`claudeTargets` names one target per role with a Claude name and one per entry, chosen by `entryClaudeTarget` from `kind`. It drops a repeat from the same profile, refuses one file from two profiles, and refuses one profile to two files. `renderClaude` keeps the orphan check for a role with no Claude name. The live test "named by no role and no entry" covers a profile directory no entry names. The fixture group proves both directions of kind over prefix and both refusals. The live byte test iterates every converted target.

The CLI's optional argument changed from an agents directory to the fusion root. No caller passes one: `catalog/README.md` and `README-agents.md` both call `npm run render -- claude` bare. `README-agents.md` still says three prompts are generated. That is plan step 22's, and no new finding.

## The executors' choices, judged

| Choice | Judgement |
|---|---|
| profile.json: curate read-only, `writes_workbench.prior` false, `may_delegate` true | Correct. `skills/curate/SKILL.md` lines 14 and 118: "This workflow writes nothing". Both writes are the child's. Whether a child's writes are bounded by the parent's `writes_workbench` is undefined at the pin. **Request 76 must carry** it for curate, reconcile and discuss. |
| wp-order, help, commit, cleanup `writes_workbench.prior` false | Correct: none writes the workbench. |
| reconcile and discuss `may_delegate` true | Correct: each dispatches exactly one entry. |
| migrate, news read-only ceiling with workbench writes | Consistent with an unstated rule. Finding 8. |
| commit and cleanup unsupported, with `prior` parts that report nothing to do | Sound as a state, and the parts say so honestly (`skill-commit/parts/03-prior.md`, `skill-cleanup/parts/01-prior.md`). Not protected: Finding 4. |
| Notes that `.check-stamps`, `.session-marker` and `.cadence-anchors` are absent from a fresh workspace | Correct: class L, untracked. |
| wp: no shell variable carries between exec calls | Correct, and the same sentence is in all sixteen bindings. The pin's `exec.go` runs each call as its own process in one container. |
| check: `git rm --cached .checkout-id` replaced by a report | Prudent. The capture is a tree fingerprint (`exec.go` `TreeBefore`), and an index-only change is not shown to survive. |
| news: no network | Correct: `Network: "none"`, and a remote is mounted only when declared. |
| cadence: GNU `ls --full-time`, `node` when `python3` is missing | Correct for `ls` and `date`. The neutral block already falls back to `date -d`. Whether the image has `python3` was not verified (speculation: `node:24-bookworm` builds on `buildpack-deps`); request 76's question 6 asks. |
| help: READMEs read by heading range | Correct. `README-hooks.md` is 263 153 bytes, against a 64 KiB output bound. |
| memo halts with no git identity | Correct under `### Who filed it`, and the only option a run has: see the `Also seen` on the identity issue. |
| post removes an unfiled draft before the run ends | Correct: the capture takes the workspace. |
| archive reports a survey lost between calls | Unneeded at the pin: Finding 3. |
| migrate's commit wording becomes the host's integration | Correct. `15-prior.md`'s "a run that moved anything ends here" mirrors the Claude two-commit route under one integration. |
| setup reads `profiles/skill-check.md` from the bundle | Correct choice. The path depends on request 76's question 10. |

## Whether `81f000c7` fixed package B's three findings

- **Absolute exec directory: fixed.** All eleven Setup bindings (`*/parts/03-prior.md`, `orchestrator/parts/07-prior.md`, `policy-curator/parts/05-prior.md`) carry "never absolute" and the `pwd` subtraction.
- **Commit per task: fixed where an instruction acts.** The re-cuts are 36a, 36c, 38a, 48a, 48c, 48e and 54a, with 35 and 53 corrected. The Claude bytes are unchanged. Residue: Finding 5 (reviewer range) and Finding 6 (framing sentences).
- **Reviewer 06a: fixed.** `06a-prior.md` carries the placement sentence for an entry run and is listed in `profile.json`.

The closure note of package B (`79c0c41e`) names the review gap at `81f000c7`. This review closes that gap.

## What belongs in request 76, and what fusion fixes

**Fusion fixes:** Findings 1 (the text), 2, 3 (the text), 4, 5, 6, 7, 8 and 9.

**Request 76 must carry, beyond the span map's twelve questions:**
- The dispatch input shape (Finding 1).
- Question 5 reduced to what the pin leaves open for entry runs (Finding 3).
- Whether a child run's writes count against the parent entry's `writes_workbench` (curate, reconcile, discuss).
- That a run cannot provision a git identity itself, because the prelude overwrites the global config (appended to package B's identity issue).

## Cross-cutting observations

- **The binding is now 27 copies in two variants.** The sixteen skill bindings are byte-identical bullet for bullet (checked), and the eleven agent ones differ from them in how they read. Package B's review suggested a shared include or an equality test. Neither exists, and Findings 1 and 3 each touch every copy of a bullet.
- **Each wrong fact came from reading one Prior file.** The span map read `entry_wire.go` and `exec.go`. The question rule is in `question.go`, the dispatch input in `general_tools.go`, and the container lifetime in `tool_containers.go`. Package B's lesson was "the container is not the user's shell". The same holds one layer up: the wire struct is not the tool the model calls.
- **Free-text answers are the one input the fusion text and the pin disagree on.** Findings 1 and 2 both come down to what free text the model may hand a service: a role input, or a reply typed beside options.

## Recommended sequencing

1. Before step 15: Findings 1, 2 and 4, because they change `requires` or `support`.
2. With package F's request: the four carries above, and Finding 7's numbering.
3. Cleanup, any time before candidate C: Findings 3, 5, 6, 8 and 9.
