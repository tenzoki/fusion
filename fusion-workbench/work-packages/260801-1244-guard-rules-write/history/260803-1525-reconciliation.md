# Reconciliation — 260803-1525-reconciliation.md

**Agent:** reconciler
**Domain:** `code`
**Circle:** `260801-1244-guard-rules-write`
**Session reconciled:** `260803-1038-orchestrator-session.md`
**Range:** `c9bf59e..fa81589`, seven commits, one Turn (the Circle's third)
**Mode:** standard code reconciliation. Workbench-shape check: 24 workbench commits, 7 analyses, 5 open Circle issues of which 5 describe defects and 0 describe open questions. No branch of the strategic heuristic fires.

---

## Counts

| | Reviewed | Updated |
|---|---|---|
| Plans | 5 (1 in Circle, 4 shared) | 1 |
| Issues | 63 (19 in Circle, 44 shared) | 6 |
| Decisions | 13 (4 in Circle, 9 shared) | 5 |
| Reviews | 7 (2 in Circle, 5 shared) | 1 |
| Histories | 56 skimmed, 2 read in full | 1 appended (`## Coherence`) |
| New issues filed | 0 | — |

No new issues were filed. Every drift found is either an evidence correction, which belongs in the annotation rather than in a new file, or a recurrence of a defect already filed in the shared store, which was annotated with the new instance instead of duplicated.

---

## Ground truth: what the session actually did

**Ten of eleven issues closed, verified by name-status rather than by marker.** `git log --name-status c9bf59e..HEAD` over the Circle's `issues/` gives the exact set:

| Issue | Closed by | Route |
|---|---|---|
| `260802-2213` grammatical `rulesWriteDetail` | `245b8b7` | `_o_`→`_c_` rename |
| `260802-2231_*_stated-exempt-boundary-is-narrower-than-the-implemented-one-for-whole-subtree-deletes.md` overstated subtree-delete boundary | `245b8b7` | `_o_`→`_c_` rename |
| `260802-2232_*_advisory-rows-share-the-30-row-warnings-panel-and-can-bury-blocks.md` advisories can bury blocks | `aff7486` | `_o_`→`_c_` rename |
| `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` lexical `..` collapse | `3b0f9e7` | added already `_c_` (untracked at session start) |
| `260802-2331_*_readme-hooks-states-bash-has-no-halt-check-which-this-turn-made-false.md` README halt claim | `ce7a125` | `_o_`→`_c_` rename |
| `260802-2332_*_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-with-no-diagnosable-reason.md` nlink lockout, undiagnosable | `245b8b7` | added already `_c_` |
| `260802-2333_*_the-exemption-docstring-says-canonicalise-is-shared-with-the-protection-check-which-is-the-split-it-must-not-invite-unifying.md` false canonicalise-is-shared docstring | `245b8b7` | added already `_c_` |
| `260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md` shape-valid escalation fails open | `d77eda8` | `_o_`→`_c_` rename |
| `260802-2335_*_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md` alias residual omitted | `ce7a125` | `_o_`→`_c_` rename |
| `260802-2336_*_the-bash-guard-halt-event-records-neither-the-command-nor-the-segment-it-blocked.md` uninformative Bash halt event | `d77eda8` | `_o_`→`_c_` rename |

`260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` (case folding) stays `_o_`. That is correct and is examined below.

**Five issues open in the Circle at session end, confirmed against the filesystem:** `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md`, `260803-1251`, `260803-1352`, `260803-1402`, `260803-1431`. The count the session reports matches the disk.

**None is a duplicate of another, and none duplicates a shared-store issue.** The two that look closest were checked in code rather than by title. `260803-1251` is `realFsLocator.absolute()` collapsing `..` inside the exemption's own resolver (`hooks/lib/fs-locator.ts:129-130`); `260803-1431` is `resolveDir` collapsing `..` in the `cd` base before the classifier builds `Target.spelled` (`hooks/lib/bash-mutation-guard.ts:1143`). Same class, different modules, different reachability — the `cd -P` route does not deliver a `..` to `absolute()`, because `resolveDir` consumed it first. Each needs its own fix. Against the 20 open shared issues, no overlap of any kind: the shared set is workbench, cadence, archive and Plane material plus `260801-1020_*_guard-protects-rules-but-not-claude-rules`, which is a different defect (a missing `protectedPaths` entry, not a boundary escape).

**The suite was re-run independently.** `cd hooks && npx vitest run` at HEAD: 1080 passed, 23 files, exit 0. This matches the figure `260803-1431-coderev-turn3-guard-boundary.md` reports. `npm test` was deliberately not used: it builds first, and rebuilding `hooks/dist/` is plan Step 10's work, not a reconciliation side effect.

---

## The plan did not advance, and now says so

`260802-1856_*_plan-guard-rules-write.md` claimed `Status: Draft — awaiting user approval at the plan gate` while five of its ten steps were done, committed, and reviewed twice. Corrected to `In Progress`.

Steps 1 to 5 `[DONE]` verified against code, not against the marker; steps 6 to 10 verified *unstarted* rather than assumed. Both tables are in the plan's own `## Reconciliation Log`. The short form: `hooks/lib/config.ts:34` still resolves one source at module load, `templates/` has no `fusion-guard.json`, `skills/setup/SKILL.md` never mentions one, `.claude-plugin/plugin.json` is still `5.8.0`, and `FUSION_ALLOW_RULES_WRITE` appears in no shipped document. That is exactly the state the user's scope choice intended.

One formatting inconsistency corrected: Step 2's marker was written `### Step 2 — [DONE] …` where the other four are `### Step N [DONE] — …`.

**Step 9's scope has genuinely changed, and the plan now records it.** This is the one place where an issue closed this session reached into the plan's remaining work, and it moved in both directions:

- **Removed.** `ce7a125` (task T3-7, closing `260802-2331_*_readme-hooks-states-bash-has-no-halt-check-which-this-turn-made-false.md` and `260802-2335_*_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md`) already rewrote `README-hooks.md` and `rules/protected-path-discipline.md` for the both-surfaces halt and the planted-alias residual. Step 9's body was written before Turn 2 chose that halt, so part of what it describes is done under another task's name.
- **Added.** `260803-1402_o` lists three items that must land together and that T3-7 deliberately did not write: the `FUSION_ALLOW_RULES_WRITE` row in the README tuning table, the correction of the two "no override exists" sentences (live at `rules/protected-path-discipline.md:171` and `README-hooks.md:187`), and the hard-linked-rule-file exception. Naming the flag in a file that denies it exists would have shipped a self-contradiction, which is why the whole piece was deferred rather than half-written.
- **Sequenced.** The Turn 3 review asks that `260803-1431` land before Step 9 writes the flag into shipped documents, so the user-facing text is not authored against a boundary that is about to move.
- **Not final afterwards.** `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` commits to unconditional case folding, which falsifies the "purely textual" premise the same file states. That correction belongs to a later Circle, so Step 9 cannot claim to leave the document settled.

Two of the plan's three `## Open Questions` are now closed with citations: the floor-versus-seeding question (answered by `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`, the planner's recommendation carried) and whether Step 5 belonged in the Circle (answered by doing it, in two commits rather than the forecast one line). The `.claude/rules/**` question stays open — `260801-1020_*_guard-protects-rules-but-not-claude-rules.md` is still `_o_` and `hooks/config.json` still lists no `.claude/` pattern.

---

## Decisions: four in the Circle, each checked against what its marker claims

**`260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md` — `_a_` correct.** The answer is recorded; nothing realises it. Plan Steps 6 and 8, which implement the floor and the seeding, are both unstarted, so the collision this record resolves has not yet been reachable. Its `Answered:` footer cites an event ("user decision at the plan gate") rather than a `<path>:<line>`; the content is unambiguous and restated in full, so this is a citation-form note. The resolvable citation is now the plan's `## Open Questions` item 1.

**`260803-1314_o` — `_o_` correct, genuinely unanswered.** Searched both analysis stores (the Circle's is empty), both planning stores and both decision stores; nothing addresses it. Its precondition does not exist yet either: `RULE_DIR_PATTERNS` is still hardcoded and `protectedPaths` is still not project-configurable. The record declines to recommend on purpose and hands the question to Step 6, which is where the cost becomes measurable.

**`260803-1402_o` — `_o_` correct; two cross-references do not resolve.**

1. It cites `260802-2335_*_…`. The file is `260802-2335_*_…` — closed by `ce7a125`, in the same session that filed this record. This is precisely the failure `260802-1740_*_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md` predicts.
2. It cites `260802-2320` three times. That issue is in this Circle, not in the shared store.

A third point matters more than either. This record defers its option 3 (resolve every guarded path through the filesystem) to `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` on the grounds that deciding it here would pre-empt that question. `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` has since been decided — and the answer was **unconditional case folding, not filesystem resolution**. So option 3 was not taken there, the deferral did not resolve it by proxy, and this record's option 3 is still genuinely open. Annotated on the record.

**`260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` — `_a_` correct; its `Answered:` citation resolves to nothing.** The marker is right: the direction is chosen and the code is unchanged, which `## Realisation` states plainly. But the footer cites `260803-1038-orchestrator-session.md`, and that file does not record the Turn 3 closing gate or this answer. It was written once at `3b0f9e7` and its `## Per-Turn Log` still reads "(No Turn started yet in this session.)". A reader following the citation finds an empty section. Three resolvable citations were added to the record: its own `## Answer` section, commit `242b723`, and the issue-side footer on `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md`.

**The `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` ↔ `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` pair points both ways, checked in both directions.** The issue's footer names the decision by full path; the decision's `**Cross-references:**` names the issue by full path including the `_o_` marker, which is correct while that marker stands. `## Answer` selects option 1 of the record, which is option 2 of the issue's candidate list — different numbering, one choice (unconditional folding). Neither document claims the code has moved. The pair is internally consistent; only the outward citation to the session history is broken, and its cause is the bookkeeping freeze below.

**`260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` stays `_o_`, and that is the right call.** Verified in code rather than inferred: `hooks/lib/paths.ts:37-38` and `:77-79` contain no case handling of any kind, and `hooks/guard.ts` CHECK 2 matches against that pair. The measured bypass reproduces at HEAD. `rules/fusion-workbench-conventions.md` draws the line this depends on: for a decision, the answer event and the implementation event are distinct, and a defect issue closes at the implementation. Closing it here would leave a live protected-list bypass with no open record anywhere.

**One shared decision moved materially without changing marker.** `260801-1020_*_may-any-fusion-writer-touch-rules.md` (D2) is half-realised for the first time: `FUSION_ALLOW_RULES_WRITE` now exists and works on both guarded surfaces, with the advisory and the dashboard rendering the answer promised. The project-level configuration half is untouched, and the flag is named in no shipped document — both files a user would consult still state that no such override exists. Half a mechanism whose documentation denies its own existence is not a realisation, and `_i_` is terminal, so the marker stays `_a_`.

---

## Bookkeeping drift: the same four surfaces, one Circle later

Three of the four session-state surfaces froze again, in the pattern `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` describes:

| Surface | Says | Reality |
|---|---|---|
| `agentstate.yaml` | `progress.turn: 0`, `commits: 0`, all eight tasks `queued`, current task a gate | eight tasks resolved, seven commits, ten issues closed, one review filed |
| `_t_circle.md` | `Status: anticipated`, `Active session history: (none yet)`, `## Turn log` empty | active since 260802, three Turns, its own plan and fifteen history files |
| `260803-1038-orchestrator-session.md` | `## Per-Turn Log` → "(No Turn started yet in this session.)" | written once at `3b0f9e7`, never updated |
| `orchestrator-events.jsonl` | current | the one surface that kept up, again |

That issue proposes a cheap detector: compare `agentstate.yaml`'s `progress.commits` against `git rev-list --count <git_head_at_start>..HEAD`. Computed here for the first time — the file says `0`, git says `7`, against a stated threshold of "more than one". The check works, costs one command, and nothing runs it. Annotated on the issue as its second instance.

**Not repaired**, per that issue's own candidate 3: the reconciler's scope excludes `agentstate.yaml` and Circle records, and widening it would put two writers on the session-state surfaces. The Circle record's stale `Status` field was likewise left alone and annotated on `260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`, whose survey table has now drifted from two of nine records disagreeing to three of nine.

**Cost, stated once.** The Circle is one gate from closure with three Turns and twenty-three commits behind it and an empty `## Turn log`. That log is where a Circle's history lives after its session state is deleted.

---

## Evidence corrections made to open issues

One issue carried citations that would send its fixer to the wrong lines. `hooks/guard.ts` has not changed since `d77eda8`, which precedes the commit that filed the issue, so the numbers were wrong when written rather than overtaken:

| `260803-1352` says | Actually at | What is there |
|---|---|---|
| `guard.ts:532` | `guard.ts:519` | `rulesWriteDetail(mutation.exempted)` — the Bash advisory |
| `guard.ts:560` | `guard.ts:548` | the git override note |
| `guard.ts:795` | `guard.ts:786` | `rulesWriteDetail([filePath])` — the write-tool site, the one that is fine |

The review reports `:519` and `:548` independently, which agrees. The issue's other citations (`guard.ts:214`, `:225-230`, `rules-write-exemption.ts:503`) are correct.

Every other citation checked in this pass resolves. The Turn 3 review's eight code citations all hold, and so do the affected-line citations on `260803-1251`, `260803-1402` and `260803-1431`.

---

## Misfiled — should be a decision

None. All five open Circle issues describe defects with a verifiable fix, and the two that contained a genuine choice point (`260802-2231_*_stated-exempt-boundary-is-narrower-than-the-implemented-one-for-whole-subtree-deletes.md`, `260802-2335_*_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md`) already had their questions extracted into decision records by the coder that closed them, which is the correct handling and worth noting because it is rare.

---

## What a later Circle inherits

Not a summary of what went well. The list of what is open, in the order it will hurt:

1. **`260803-1431`, High, open.** Gate 0 misses the `..` in a `cd -P` operand, so a planted link still spends the grant. Reach is the whole protected list. This is the **fourth** instance of one class inside this Circle: `260802-2229_*_rules-write-flag-is-a-write-anywhere-primitive-via-a-symlink-planted-in-rules.md` (planted symlink, closed by gate 2), `260802-2230_*_check-2-matches-the-protected-list-un-canonicalised-so-dot-slash-agents-coder-md-is-not-protected.md` (un-collapsed protected match, closed by `collapseSegments`), `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` (lexical `..` collapse, closed by gate 0), and now the `cd` as a second entrance. Three narrowings have been shipped and the class has returned each time through a door the previous fix did not model. The review's framing — narrow the grant, do not widen the resolver — has now been applied three times; whoever picks this up should weigh that record before applying it a fourth.
2. **Three shipped docstrings are false at HEAD** and each is the reason a later reader would not look at the defect above: `bash-mutation-guard.ts:296-300`, `rules-write-exemption.ts:69-71`, `bash-mutation-guard.ts:215`. They must be corrected in the same commit as the fix.
3. **`260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md`, High, open, direction decided.** A complete bypass of `protectedPaths` on both write surfaces on any case-insensitive filesystem, which is the default on macOS. The code change is the smaller half; the larger half is that `rules/protected-path-discipline.md` loads into every agent in every consuming project and was rewritten this same Turn on the premise the fix falsifies.
4. **The flag is undocumented and both shipped documents deny it exists.** Plan Step 9, blocked behind item 1 by the review's sequencing, and widened by `260803-1402`.
5. **Plan Steps 6 to 10 are entirely unstarted** — the C5b loader, the template, the seeding, the documentation, the `dist` rebuild and version bump. `hooks/dist/` is stale in the working tree and the review confirmed it by a fresh `tsc` diff.
6. **Two open decisions await Step 6** (`260803-1314`) and a user judgement (`260803-1402`, whose deferral to `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` did not resolve it).
7. **The bookkeeping drift above**, which will cost this Circle its own Turn log if the closure step does not write one.

---

## Coherence verdict

Computed and appended to `260803-1038-orchestrator-session.md` `## Coherence`. Verdict **`review-needed`**, dominant flagged edge Artifact↔Grounding, recommendation **revise Artifact**. The session Directive was met; the Artifact it produced carries an open High finding on its own Turn's work and a second open High predating it.
