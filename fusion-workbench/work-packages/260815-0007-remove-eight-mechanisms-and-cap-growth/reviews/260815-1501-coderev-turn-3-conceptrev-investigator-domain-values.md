# Code review — Turn 3: conceptrev removed, investigator folded, the domain values cut to two

**Sender:** `coderev`
**Reviewed-range:** `5d29b6d..518926d`
**Not-opened:** none
**Date:** 2026-08-15 15:01
**Circle:** `260815-0007-remove-eight-mechanisms-and-cap-growth`

---

## The range, corrected

The dispatch named `6350854..HEAD` and said the coverage tool reported seven uncovered commits. Those two statements do not agree, and the dispatch is the one that is wrong: `6350854..HEAD` is **four** commits, and `6350854` is itself one of the seven uncovered. Reviewing the range as dispatched would have left `b093a54`, `b70097f` and `6350854` uncovered for a third Turn running.

```
$ bin/fusion-review-coverage
uncovered=7
  518926d 0894d0d 7260bbc a17cc8c 6350854 b70097f b093a54

$ git rev-list --count 6350854..HEAD      → 4
$ git rev-list --count 5d29b6d..518926d   → 7
```

`hooks/lib/review-coverage.ts` expands each declared range with `git rev-list <from>..<to>`, so `from` is exclusive. The range that tiles the seven is `5d29b6d..518926d`, and that is what this pass covered. 69 files, +2 873 / −1 157.

This is the third dispatch in a row to name a wrong commit count. The cause is the same each time — the range is written from the last Turn's boundary rather than from the coverage tool's uncovered list — and the tool prints the answer, oldest uncovered commit's parent to `HEAD`.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 1 |

All three are filed as defect records under this Circle's issue store:

- `260815-1501_*_the-reach-gate-is-blind-to-a-copy-written-only-in-the-retired-domain-names-and-reach-holes-does-not-say-so.md`
- `260815-1501_*_four-cardinal-words-still-count-items-the-removals-deleted-and-no-gate-reads-a-cardinal-word.md`
- `260815-1501_*_setup-step-5s-worked-example-says-this-repository-counts-88-source-files-and-the-helper-beside-it-returns-118.md`

Nothing found here blocks the Circle. The suite is green (45 files, 831 tests), `hooks/dist/` rebuilds byte-identical, and `claude plugin validate .` passes with the one pre-existing CLAUDE.md warning.

---

## The six checks the dispatch asked for

### 1. The order lint's non-vacuity guards — they guard

Both assertions in `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` were re-cut onto evidence rather than onto a domain name, and the re-cut is correct. Against the prompt's cascade at `agents/orchestrator.md:163-173`:

| Branch | Condition | reads `code_files` | data-alone |
|---|---|---|---|
| 0 | `counted_by == "none"` | — | — |
| 1 | `code_files > 0 and data_files > code_files * 2` | yes | no |
| 2 | `code_files > 0` | yes | no |
| 3 | `data_files > 0` | no | **yes** |
| 4 | `else` | — | — |

`assertCodeCountFirst` finds `firstCodeCount = 1` and `nonBuild = [3]`, and asserts `3 > 1`. Its new guard — `nonBuild.length > 0` — is the one that matters, and it is **not** vacuous: exactly one branch qualifies today, and the guard's failure message names the two ways it could stop qualifying (the branch is lost, or it grows a `code_files` conjunct) and says the position rule then needs re-cutting rather than deleting. That is the right shape. It also fires on the plausible future edit: the prompt's own prose says the branch's implicit condition is `code_files == 0`, so an editor making that explicit turns the gate red with an actionable message instead of silently disarming it.

The four historical defeats are all re-expressed in the surviving vocabulary and all still throw. `dataAloneLifted` and `commentTokenCascade` throw `/260807-1942/`; `countAboveAbsent` throws `/260807-1951/`; the real `2910cf6` text now throws `/retired/` at parse, and there is a new test asserting exactly that rather than leaving it implied.

**One residual, reported and not filed.** `assertAbsentCountFirst` did not gain the same treatment. Its guard is `none >= 0` — the absent-count branch exists — and its loop over `[...allReading("code_files"), ...allReading("data_files")]` has no non-empty floor of its own. A cascade with no count branch at all would pass it vacuously. That state is caught, but only by the *sibling* test's `firstCodeCount >= 0` in a different `it()` block, so the guarantee is a property of the pair rather than of the function. Small, pre-existing, not introduced here. Worth a one-line `expect(counts.length).toBeGreaterThan(0)` next time the file is opened; not worth its own record.

### 2. The two retirement constants — one does its job, one has a gap

`RETIRED_DOMAINS` refuses a re-added branch, with a message that says *retired* rather than *not a domain*, and both call sites are tested (`parseCascade` on the historical text; a branch reading `decisions_count`).

The reach detector **does** still fire on the fixture kept from the earlier defect. `CLEANUP_COPY` in `hooks/lib/__tests__/domain-cascade.test.ts:602` is `skills/cleanup/SKILL.md:114` verbatim as it shipped through v7.2.0, and it selects on its two surviving domain names plus `decisions_count` and `analyses_count` — inputs only the retired branches ever read. So it is firing *because* `RETIRED_COUNT_NAMES` was kept, not because the selector still happens to match something. That is the thing the dispatch asked to distinguish, and it distinguishes correctly.

What is missing is the mirror image, and it is filed. `domainLiteralsIn` builds from `DOMAINS` alone, so a stale statement written **only** in the two retired outcome names names zero recognised domains and is dropped before its inputs are read. Measured against the shipped build, two such probes miss. `REACH.holes` — the list that exists so every uncovered shape is written down with a probe — has no entry for it. Record: `260815-1501_*_the-reach-gate-is-blind…`.

### 3. The fold into `analyst` — enough carried, and the omissions are defensible

The ninth type is 20 lines and costs +141 bytes on the always-on core (`agents/analyst.md:193-211`). Judged against the 204-line prompt it replaced, the four things the eight existing types genuinely could not reach are all there: the capture as an object you never edit, the inventory taken before anything is read, the chronological timeline with the derail point and verbatim transcripts, and primary cause separated from contributing factors with hypotheses-with-evidence when the chain does not resolve.

Each omission the executor listed holds up on inspection:

- The 14-step process would have been a second procedure beside `## Analysis Process`; the 8-step type hands off to it at step 8 for issue filing, and step 6 of the generic process is in fact the issue-filing step, so the handoff resolves.
- The separate report template would have made the ninth type the only one with a template of its own; the other eight each get one line under `## Findings`, and so does this one.
- The vision section is not lost — `## Tools` covers vision generically and the type's step 5 carries the substantive part (an annotated screenshot names the symptom; an error screenshot is checked against the logs, not summarised alone), which is stronger as a process step than as a tools bullet.
- Executor routing survives at `agents/analyst.md:266` (*"Route each to an agent if applicable: shaper, planner, coder, ontocoder"*).

The one thing genuinely gone is the `## Affected Areas` severity table. Findings route to issue files, which carry severity, so the information has a home. Not filed.

The `## Tool Discipline` interaction is correct and is the part most likely to have been missed: the type's step 1 says to *ask* when the user names no capture, and `agents/analyst.md:42-47` already routes every "ask" through the dispatched/top-level split, so a dispatched analyst proceeds under a stated assumption instead of reaching for a tool it does not hold.

### 4. Dispatchability — nothing else in the tree promises the old property

Both statements went (`agents/orchestrator.md` may-NOT list, and the `investigator` row under **Never invokes**), and the swept tree has no third. `grep` over `agents/`, `skills/`, `rules/`, `docs/`, both READMEs and `CLAUDE.md` for `user-initiated` / `Never invokes` / `may NOT` returns only correct statements: `consultant` is still named as the user-initiated agent the orchestrator never dispatches, at `agents/orchestrator.md:1418`, at `agents/consultant.md:160` and at `README-agents.md:277`. `README-agents.md`'s *"never invokes"* sentence was re-pointed at `consultant` in the same commit, which is the only agent it is still true of.

`agents/bugfixer.md:30` kept an owner for the don't-touch-a-capture refusal by re-pointing at the analyst's new type rather than deleting the line — worth naming because deleting it was the easier move and would have left the refusal ownerless.

### 5. The investigations resolver arms — measurement re-taken, store intact

Re-run independently at HEAD with the resolver's own derivation grep over `agents/*.md` and `skills/*/SKILL.md`:

```
$ grep -ohE '\$(OUT|SCAN)_[A-Z][A-Z_]*' agents/*.md skills/*/SKILL.md | sort -u | wc -l
19
```

Nineteen `$OUT_*`/`$SCAN_*` keys named, plus `PORTFOLIO` and `TASKLIST` which the grep shape cannot see: 21, exactly the post-removal `ORDER` list in `bin/fusion-paths:379-382`. Every surviving key has at least one consumer and neither retired key has any. The measurement holds.

The store survives on all four surfaces that touch it: `rules/fusion-workbench-conventions.md:42` (in the layout tree, marked write-frozen), `skills/setup/SKILL.md:82` (still created), `skills/archive/SKILL.md:108` (still out of tier scope), and `README-agents.md:263`. `fusion-workbench/shared/investigations/` exists on disk here.

The retirement is loud rather than silent, and I checked the claim rather than the comment: `bin/fusion-paths investigator` and `bin/fusion-paths conceptrev` both exit 2 naming the missing prompt, and a prompt naming a retired key would hit the ORDER-membership check and exit 4 naming the key and both places to add it back. The replacement test — *"emits no investigation key to anyone"* — iterates every agent and every skill, which is genuinely stronger than the two single-consumer cases it replaced.

`rules/workbench-path-resolution.md:80` writes the retirement up as the worked procedure for retiring a key. That is the right place for it and it is the part of this step most likely to be reused.

### 6. Line citations — all twelve resolve, and so does the rest of the tree

Every numeric citation in `README-agents.md` was checked against its target file. All resolve, and all resolve to a line that supports the claim — `agents/orchestrator.md:410/667/868/396/318/319/320/456`, `agents/taskplanner.md:19` and `:32-34`, `agents/reconciler.md:28-30` and `:41-43`, `agents/playmaker.md:25-27`, `:34-36`, `:202`, `:206`, `:214`, `agents/planner.md:47-51`, `agents/shaper.md:39-47`, `:45`, `:47`, `:55`, `:59`, `agents/editor.md:18-30`, `skills/next/SKILL.md:103/167/170/176`, `skills/direct/SKILL.md:70/71/72`, `skills/cleanup/SKILL.md:147`, `agents/bugfixer.md:42`.

Widened to the whole tree: every `<dir>/<file>:<line>` citation in every tracked `.md`, `.ts` and `bin/` file was resolved against its target. One hit, `rules/x.md:72` in `reference-resolution-lint.test.ts:225`, is that test's own negative fixture. Nothing else is out of range.

Two citations moved into `hooks/lib/domain-cascade.ts` this Turn deserve a separate note, because they are measurements rather than pointers: `agents/playmaker.md:31-32` and `agents/reconciler.md:107-108` are named as what an unconditional two-line window would select. I re-ran that measurement against the shipped build over `REACH.fileSet` and it returns exactly those two units and nothing else. The claim is current, and `agents/reconciler.md:107-108` had shifted by this Turn's own deletion of Step 1.5 — the citation was updated with it.

---

## Findings by theme

### Theme A — a deletion took the item and left the number counting it

Three fresh instances plus one the Turn moved from wrong to differently wrong. `README-agents.md:185` says "Two side loops" over one bullet; `skills/help/SKILL.md:103` says "Three things to configure" over two; `bin/fusion-rules:408` says "the five producers" where the case arm 220 lines above it names four; `bin/fusion-rules:437` says "The other fifteen agents" where the tree holds 15 in total.

The `skills/help` one is the worst of the four because it is read aloud to a user by `/fusion:help configure`.

What makes it a class rather than four typos is that `derivable-enumerations-lint.test.ts` has a `describe` block for exactly this failure, and its five `CLAIMS` regexes match **Arabic numerals in agent-count phrasings only**. All five moved correctly this Turn — the gate worked on everything inside it. A cardinal word, or a count of anything but agents, is outside it by construction, and three of the four sit in files the gate already opens. Three removal steps remain, each deleting list items.

Record: `260815-1501_*_four-cardinal-words-still-count-items-the-removals-deleted-and-no-gate-reads-a-cardinal-word.md`.

### Theme B — a symmetric widening applied on one axis and not the other

`RETIRED_COUNT_NAMES` is kept recognisable-but-unreadable so a stale copy stays visible to the reach gate; `RETIRED_DOMAINS` is not, so a copy written only in the two retired outcome names is invisible, and `REACH.holes` does not record the gap. Detailed above and filed.

### Theme C — a present-tense measurement carried through a rewrite

`agents/orchestrator.md:178` says this repository counts 88 source files. `./bin/fusion-count-sources` returns 118, and the paragraph names that helper in its own first clause. Low: no verdict depends on it, but the paragraph's entire job is calibration by worked example, and the one example a reader can check is the wrong one.

Record: `260815-1501_*_setup-step-5s-worked-example…`.

---

## Cross-cutting observations

**The two `bin/fusion-rules` comment defects are the same shape as the CLAUDE.md rows already filed as `260815-0803`, one layer down.** That record's argument is that a self-declared-derivable inventory row with no gate goes stale on the first removal. A script comment restating what a `case` arm four hundred lines away says is the same construction with the same absence of a gate, and it has now failed twice in one file. Worth noticing when that record is fixed: whatever check is added for `CLAUDE.md`'s `templates/` and `docs/` rows does not reach these.

**Deliberate archaeology is being kept, and the criterion is consistent.** Four surfaces still name `conceptrev` or `investigator` and every one of them is correct to: the pre-v4 folder names in `skills/{setup,migrate}/SKILL.md`, the `conceptreview` entry in the path lint's `TYPE_FOLDERS`, the `<sender>` note at `rules/fusion-workbench-conventions.md:296` telling a reviewer it will meet older files carrying a third sender, and the dated event log at `rules-emission-golden.test.ts:304`. The executor's stated cut — a dated event log keeps its names, a present-tense claim about prompts that exist does not — was applied evenly, including to `rules/critical-stance.md` and `CLAUDE.md`, which no gate would have caught.

**The `+750 → +141` cut is the part of this Turn most worth repeating.** Two paragraphs were drafted into the always-on core and one was deleted outright on the reasoning that no agent will ever *meet* an investigation filename again, because the key is gone — as against the `conceptrev` `<sender>` clause, which is operative precisely because a reviewer still scans `$SCAN_REVIEWS` and will meet those files. That is the right test for whether archaeology earns per-dispatch bytes, and it is not written down anywhere as a rule.

**One thing left standing that no record names.** A consuming project that had the investigator configured now holds a `./rules/investigator-capture-layout.md` that nothing loads: `analyst` sits in the `PATTERNS=""` arm, so no project-local rule file reaches it by filename pattern at all, and `/fusion:help`'s configure section lost the bullet that told users how to set this up without gaining a replacement. A route exists — `./rules/context-manifest.yaml` with `agents: [analyst]` and `topics: [always]` — and it is not documented as the successor. I have not filed this: it is a question about what a removal owes the installed base, which is a decision rather than a defect, and the plan's step 15 or the curator at G1 is the place to put it. Naming it here so it is not lost.

---

## Verification performed

| Check | Result |
|---|---|
| `cd hooks && npm test` | 45 files, 831 tests, green |
| `cd hooks && npm run build` then `git status` | `hooks/dist/` byte-identical — no uncommitted drift |
| `claude plugin validate .` | passed (one pre-existing CLAUDE.md warning) |
| `bin/fusion-rules` / `bin/fusion-paths` on every surviving agent | resolve; retired names exit 2 with a named reason |
| Every `path:line` citation in every tracked `.md` / `.ts` / `bin/` file | in range; `README-agents.md`'s twelve checked for sense as well |
| Reach detector, against the shipped `hooks/dist/` build | fixture fires; two retired-domain-only probes miss |
| Two-line-window measurement in `domain-cascade.ts:782-783` | re-run, selects exactly the two units it names |
| `bin/fusion-count-sources` | `code_files=118 data_files=13` against the prompt's `88` |

## Not duplicated

Already filed by this Circle and confirmed still open at HEAD, cross-referenced rather than refiled: `260815-0803_*_two-claude-md-inventory-rows-went-stale…` (the `templates/` row now naming two phantom files — the executor appended the current count), `260815-1447_*_claude-mds-dispatch-parameter-bullet-asserts-orchestrator-behaviour-step-9-inverted…`, `260815-1339_*_step-7-named-a-review-coverage-sender-set-that-does-not-exist…`, `260815-0803_*_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane`.

One addendum to `260815-1447_*_claude-mds-dispatch-parameter-bullet-asserts-orchestrator-behaviour-step-9-inverted-not-just-a-value-list.md`, offered here rather than as a new record: its *"What it would take"* names `CLAUDE.md:16`'s value list and `:59`'s derivation clause, and `CLAUDE.md:59` **also** carries a stale value list of its own (`**Domain:** <code|data|strategic|knowledge>`) in the same sentence. Whoever works that record should cut both halves of `:59`, not only the behaviour clause.

`ontorev` ran in parallel on the structured-data half. Files I opened that its pass may also reach: `.claude-plugin/plugin.json`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, and this Circle's issue and history records. None of my three findings is in those files.
