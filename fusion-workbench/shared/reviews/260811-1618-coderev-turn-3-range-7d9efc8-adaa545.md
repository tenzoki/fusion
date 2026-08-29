# Code review — Turn 3, `7d9efc8..adaa545`

---
**Sender:** coderev
**Reviewed-range:** `7d9efc8..adaa545`
**Not-opened:** `hooks/dist/**`
**Commits:** 3 — `41d8e2b`, `3b30f5e`, `adaa545`
**Files in range:** 53 (34 outside `fusion-workbench/`, of which 12 are `hooks/dist/`)
**Cross-references:** issues `260811-1610_*_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md` … `260811-1617_*_record-260811-1547-states-its-proposed-lint-has-no-exceptions-and-a-shipped-skill-already-is-one.md` filed by this pass; open records `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md`, `260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md`, `260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md`, `260811-1146`, `260811-1522`, `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`, `260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`, `260811-1409_*_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md`

---

## What "not opened" means here

**`hooks/dist/**`** (12 files). Not read line by line. Verified by the stronger method the last two
passes used: `npx tsc --outDir /tmp/tsccheck` in `hooks/`, then `diff -rq dist /tmp/tsccheck` — **no
differences**, exit 0. The committed build is the current build of the current source, so the shipped
tarball is what was reviewed.

Everything else was opened. The 22 source and prompt files were read as their diff plus the
definition each one changes; `agents/orchestrator.md` (the four sections the range touches),
`hooks/lib/staging-drift.ts` `classify()`, `hooks/lib/churn.ts` `rankThrashing`,
`hooks/lib/rules-write-exemption.ts` `boundedList`/`rulesWriteDetail`, `bin/fusion-churn-rank`,
`hooks/lib/__tests__/commit-message-path.test.ts` and
`hooks/lib/__tests__/record-counts-measurement.test.ts` were read in full. All 19
`fusion-workbench/` files were opened, the eleven renamed records included;
`orchestrator-events.jsonl` was read as a diff and as its committed tail, which is where one of the
findings comes from.

`cd hooks && npx vitest run`: **49 files, 1284 tests, exit 0**. `tsc` compiles clean.

---

## The `git mv` check — clean, no data loss

Asked for first because it is cheap and irreversible if wrong. All eleven records renamed in this
range carry the appended version, not the pre-append one:

| | old lines | committed | worktree | committed vs worktree |
|---|---|---|---|---|
| `260803-1352` → `_c_` | 149 | 185 | 185 | same |
| `260805-1859` → `_c_` | 23 | 54 | 54 | same |
| `260809-2252` → `_c_` | 56 | 68 | 68 | same |
| `260810-1632` → `_c_` | 77 | 101 | 101 | same |
| `260811-1406_*_the-record-counts-block-reports-unmeasured-whenever-the-active-circles-issue-store-was-empty-at-the-session-anchor.md` → `_c_` | 75 | 105 | 105 | same |
| `260811-1407_*_the-record-counts-block-reads-shell-variables-a-fresh-bash-call-never-has-and-calls-the-result-a-fusion-bug.md` → `_c_` | 63 | 95 | 95 | same |
| `260811-1408_*_the-ontocoder-prompt-still-claims-every-toml-three-times-after-cargo-toml-was-given-to-the-coder.md` → `_c_` | 54 | 75 | 75 | same |
| `260811-1410_*_the-commit-message-path-gate-narrowed-with-the-classifier-it-reuses-and-no-longer-catches-a-prescription-inside-a-store.md` → `_c_` | 52 | 86 | 86 | same |
| `260811-1411_*_the-coder-scope-sentence-carves-toml-out-of-its-own-exclusion-list-and-leaves-json-standing.md` → `_c_` | 51 | 72 | 72 | same |
| `260811-1412_*_the-orchestrator-prompt-ships-the-bash-tool-runs-zsh-as-fact-to-every-consuming-project.md` → `_c_` | 46 | 66 | 66 | same |
| `260811-1413_*_readme-hooks-still-describes-the-commit-message-class-without-the-store-scoping-that-defines-it.md` → `_c_` | 38 | 57 | 57 | same |

Every one grew, every one ends in its closing note, and `git show <commit>:<path> | diff - <path>`
is empty for all eleven. `git status` carries one modified file (`orchestrator-events.jsonl`) and
nothing else. The unstage-and-re-add worked.

---

## Summary

The three repairs are sound in their mechanisms and the substitution in `41d8e2b` is the right
question to ask git. What did not travel with them is the *scope* of each repair: three of the eight
findings below are a claim, a contract or a dependency that was corrected on the surfaces the task
named and left standing on the one it did not — the same shape Turn 2's review called the batching
damage, arriving again in a Turn that had just closed four instances of it. The one High finding is
the record-counts block repeating, one branch narrower, the exact defect it was fixing: a number
that could be taken, reported as unmeasurable.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 4 |
| Low | 3 |

Eight findings, eight records filed under `shared/issues/260811-161*`.

---

## Focus 1 — `41d8e2b`, the probe substitution

### The substitution answers the bound's question. Verified, not accepted.

The old probe asked `git cat-file -e "$A:./${SCAN_ISSUES%% *}"` — the first store, which
`bin/fusion-paths` makes the Circle's. The new one asks `git cat-file -e "$A:./"` with `-C
"$WORKBENCH"`, which resolves the workbench's own tree at the anchor.

The author declined both fix directions the record proposed and the reasoning holds. Probing
`shared/issues` moves the same weakness one step out: git tracks no empty directory, so a workbench
whose shared store held no committed record at the anchor would read as untracked. Probing every
store spends one `cat-file` per store to answer the same proxy. The bound's stated question is
*"does the project track its workbench"*, and the workbench tree is that question rather than a
proxy for it. Verified working: `git -C fusion-workbench cat-file -e "$(git rev-parse --short
HEAD):./"` exits 0 here, and exits non-zero over a throwaway project with `fusion-workbench/` in
`.gitignore`.

The measurement behind the old defect checks out exactly. Twelve Circle directories in this
repository, four with no tracked file under `issues/` at all —
`260716-1847-workbench-umbau`, `260717-1638-marker-format-ohne-glob-metazeichen`,
`260719-1536-brest-unite-co-creator-conversion`, `260801-1244-curator`. The prompt says four of
twelve; it is four of twelve.

The other two corrections are clean. The block resolving its own keys is right and the reason given
is the one the same file states at `:712`; reading `agentstate.yaml` through `$WORKBENCH` instead of
a cwd-relative path is a real second improvement the commit does not claim credit for. The zsh claim
is gone and its replacement — *"splits an unquoted parameter on spaces under bash and does not under
zsh"* — is a property of the shells rather than of a machine.

### `records=unmeasured` is not reachable for exactly the causes the prompt names — twice

**The reachable-but-discarded half.** `260811-1610_*_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md`, **High**. Both `unmeasured` branches print the
cause and no counts. One of the four cells does not need git at all: `Issues created` is `filed
issue`, computed from the record's own filename stamp against `session.started`, which the prompt
itself says holds *"whether or not a commit carries the file yet"*. Measured — block extracted
verbatim, workbench gitignored, two records filed after the start stamp, both shells:

```
records=unmeasured why=workbench-not-in-anchor-commit anchor=465f0ff… start=260811-1000
```

`2 filed issue` was on the disk and was not printed, and `:649` then instructs writing `unmeasured`
into all four cells. This is `260811-1406_*_the-record-counts-block-reports-unmeasured-whenever-the-active-circles-issue-store-was-empty-at-the-session-anchor.md`'s own closing standard failing in the other direction, and
its reach is **wider** than the defect it replaced, not narrower: `260811-1406_*_the-record-counts-block-reports-unmeasured-whenever-the-active-circles-issue-store-was-empty-at-the-session-anchor.md` fired for Circle
sessions in a tracked workbench, this fires for every session of every project that does not track
its workbench — the configuration `CLAUDE.md` leaves to the consumer and the one fusion itself used
until 260801. `record-counts-measurement.test.ts:271` (`expect(v.counts).toEqual({})`) now pins the
discard, so the fix has to replace an assertion rather than only add one.

**The mis-assigned cause.** `260811-1616_*_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md`, **Low**. `:649` lists "a project outside git" under
`workbench-not-in-anchor-commit`. Setup records the anchor conditionally (*"Note current git HEAD (if
git repo)"*), so that project has no `$A` and branch 1 fires. Measured:

```
--- no git, empty anchor ---   records=unmeasured why=no-anchor-in-agentstate anchor=none
--- no git, anchor present --- records=unmeasured why=workbench-not-in-anchor-commit anchor=abc1234
```

Branch 1's prose (*"carries no `git_head_at_start` and `started`"*) also reads as a conjunction where
the code is `||`. No wrong cause reaches the user, because the model copies the `why=` field through;
the cost is that the one paragraph explaining the causes does not list the case a reader will meet.

### The gate is strong, and its own description overstates it once

`record-counts-measurement.test.ts` is the best artifact in the range. It runs the block rather than
reading it, in both shells, with the three keys deleted from the environment, over fixtures it
builds; its controls read the pre-fix block **out of commit `7749845`** rather than transcribing it,
and each control asserts the old block fails where the new one passes. That is the right shape for a
negative control and it is not the shape most suites reach for.

One overstatement, in the executor's history file rather than in the code
(`260811-1502-…:64`): *"that `unmeasured` fires for exactly the two causes"*. The
suite asserts that two constructed causes produce the right `why=`; nothing asserts exhaustiveness,
and `260811-1616_*_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md` above is a case the enumeration misses. Not filed — it is one sentence in a
history log, and the two records already carry the substance.

---

## Focus 2 — `3b30f5e`, one regex for two questions

### The export is the right call and the composition is correct

`hasCommitMessageName(rel)` is `COMMIT_MESSAGE.test(basename(rel))` and `classify` now calls it, so
the two callers cannot drift about what a commit-message name is. Behaviour is identical:
`classify`'s old line was `COMMIT_MESSAGE.test(name)` with `name = basename(rel)`, so the
substitution is exact. The asymmetry argument in the docstring is sound — a false positive in
`classify` told the model to delete three authored records, a false positive in the gate costs a
developer an exemption entry — and it is the reason the two scopings are both correct rather than one
being a compromise. The suite grew from 1271 to 1284 across the range and stays green.

### The positive control does not assert the dependency it says it asserts

`260811-1611_*_the-positive-control-documents-the-keyword-exemption-dependency-in-a-comment-and-asserts-something-else.md`, **Medium**, and this is the question the dispatch asked.

The commit message claims the widening's *"dependency on the keyword exemption is now asserted by the
positive control instead of sitting latent"*. The assertion added is:

```ts
expect(workbenchMessagePaths(`see \`${cited[1]}\` for the record`)).toEqual([cited[1]]);
```

That asserts the **name test flags a record citation** — which the test one line above,
`negative control: a prescription INSIDE a store fails it too`, already establishes for a store path.
It says nothing about the exemption, and the fixture it builds carries none of the six exemption
keywords, so it never exercises the branch the dependency lives in.

Measured — the widened helper's pattern and the exemption regex run over `agents/*.md` and
`skills/*/SKILL.md`:

```
agents/orchestrator.md:418   hits=fusion-workbench/.commit-msg-tmp   exempt=leftover
skills/commit/SKILL.md:88    hits=fusion-workbench/.commit-msg-tmp   exempt=leftover
```

Two lines, and the single keyword `leftover` is the whole of what keeps `it("finds none")` green.
Answer `260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md` by narrowing that regex — which is what `1149` is filed against — and the
suite goes red in `it("finds none")` with a message about a shipped prompt, while the positive
control stays green. The dependency is documented in a comment and not asserted, so whoever answers
`1149` still discovers it rather than meeting it.

The fix is small: lift the exemption into a named constant and assert both predicates against those
two real lines, which is also what the file's own header demands (*"the negative controls call the
SAME helpers … never a re-implementation"*).

### The `.toml` boundary reached every prompt that states it, and made a fifth one load-bearing

`260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md`, **Medium**. The rule the four prompts now state is right, and stating a rule instead of
an exception list is the correct move. What each of them also does is stop stating the boundary and
name `agents/orchestrator.md` `## Agent Routing Table` as the authority for it. Read at `:346-358`:

| Line | What it says about the three files the four prompts cite |
|---|---|
| `:346` coder row | `package.json` yes, **`Cargo.toml` absent** |
| `:347` ontocoder row | `.toml` in `ontology/`, `manifests/`, schema dirs — routes on **directory**, not role |
| `:352` | `tsconfig.json` yes |
| `:358` tiebreaker | the role-not-extension rule, as a sentence |

So `Cargo.toml`, the file the whole sweep is about, is decided in the "authority" by nothing but the
tiebreaker. That is `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md`, still `_o_`. Its stated reason for being a record rather than a
one-line edit — `agents/orchestrator.md` was outside the dispatching task's disjoint file set — **no
longer holds inside this Turn**: `41d8e2b` and `adaa545` both edit that file, in the same
three-commit range that rewrote four siblings to point at it. Before the commit the boundary was
written down in the executor prompts and `1301` was, in its own words, "a gap, not a contradiction".
After it, four surfaces defer to a text that does not carry the sentence they quote.

The `README-hooks.md` row and the `domain-cascade` count both check out: `REACH.holes[0].cost` moved
14 → 13 on both fields, `README-hooks.md:214` was regenerated to match, and `domain-cascade.test.ts`
re-measures both — which is how the change announced itself rather than being asserted.

---

## Focus 3 — `adaa545`, the tracker cluster

### The churn contract moved through four surfaces and was left behind on the fifth

`260811-1612_*_claude-md-is-the-fifth-surface-of-the-churn-rank-output-contract-and-was-left-on-the-old-one.md`, **Medium**. The `noise=` key is in the right position (`absent=` then `noise=` then
`ranked=`) in every one of: `hooks/churn-rank.ts` doc and `main()`, `bin/fusion-churn-rank`'s usage
block, `agents/orchestrator.md:126`, `skills/setup/SKILL.md:252`, and two `README-hooks.md` rows. The
prose in each agrees with the code and with the others, and `skills/setup/SKILL.md` correctly defers
rather than restating the keys.

`CLAUDE.md:33` does not:

> Prints `anchor=`/`entries=`/`absent=`/`ranked=` … so the absent ones are excluded **here**, on the
> read path

Both halves are now false — five keys, two exclusions. It survived because it spells the keys inline
(`` `absent=` `` inside a slash-separated list) rather than as the `absent=367` form the sweep
grepped for, and because it is outside the surface list the executor's own history file enumerates
(*"all four surfaces that document it … plus two `README-hooks.md` rows"*). It is the file every
session in this repository reads first, and it is the same shape as `260811-1413_*_readme-hooks-still-describes-the-commit-message-class-without-the-store-scoping-that-defines-it.md`, which this Turn
closed two commits earlier.

The code behind the contract is right. `rankThrashing` asks noise before existence, so the two
exclusions are disjoint by construction and a live dashboard file is never reported as deleted; the
comment says exactly that and the test at `churn.test.ts` asserts `noise + absent + ranked ===
entries` under an `exists` that returns false for everything. `TRACKER_NOISE_FILES` moved to
`churn.ts` rather than being exported from a hook entry point, for the reason given (`tracker.ts`
runs `main()` at module load), and the single-definition test pins it. The live-map figures are
reproducible: `entries=451 absent=209 noise=2`.

One observation, not filed: the single-definition test enumerates four candidate files
(`lib/churn.ts`, `tracker.ts`, `guard.ts`, `churn-rank.ts`) rather than scanning `hooks/**`, so a
fifth copy would not be seen. The repository already has a lint family for derived enumerations;
this is one more candidate for it, and it belongs beside decision `260811-1522` rather than as a
defect of its own.

### The advisory bound is well-placed and contradicts itself in the exempted case

`260811-1615_*_boundedlist-emits-plus-zero-more-for-a-single-over-long-path-against-its-own-stated-invariant.md`, **Low**. Putting the bound in `rulesWriteDetail` rather than in a new `lib/events.ts`
clamp is the right choice for the reason given: it is the only place that knows the value is a list
and can drop whole entries instead of cutting a path in half. The 30-path case falls from 902 to 185
characters, measured through the compiled build, and both the unit case and the two-hook integration
case assert the shape.

`boundedList`'s comment states *"`dropped` is never 0"*. The proof covers the loop and not the floor
above it. With one path that alone overruns the budget, `kept` is forced to 1 and `dropped` is 0.
Measured against `dist/`:

```
Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule path:
rules/deep/…/rule.md (+0 more)
```

The over-length is the documented exception and is correct; the suffix is not — `(+N more)` exists so
a short list is never mistaken for a complete one, and here it says the complete list was truncated.
`guard.ts:586` passes exactly one path on every call, so the branch is on the common path; it needs a
project-relative rule path over ~109 characters to fire. The test at `:1121` covers the over-long
path only with a second path beside it, so `dropped === 0` is untested.

### Task 21's split is genuine, and the closed half is genuinely closed

Judged against the acceptance clause, not against the status line.

| Acceptance clause | State |
|---|---|
| the contentless Bash event is removed or carries something a reader could use | **done** |
| `npm test` green from `hooks/` | **done** |
| the log has an upper bound or documented rotation, and the monitor stops re-parsing the whole file | **not done**, in `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` |
| whatever is decided about `/fusion:archive` is its own case, not an exception to the state-file rule | **not done**, carried into the same decision as a constraint |

Half (a) is verified. `trackChurn` no longer emits for `Bash`; nothing consumed the event
(`bin/monitor:117,1060` filter it, `WARNING_EVENT_TYPES` excludes it, and no hook, helper or prompt
reads one); the write-tool records survive and a case asserts each half. The measurement is exact —
`wc -l` gives 17 528 and `grep -c '"detail":"Bash command observed"'` gives 4 226, which is the
24 % the commit claims. `monitor-warnings-panel.test.ts` was updated to a shape the tracker still
writes rather than left pinning a line nothing produces, which is the right call and easy to skip.

**The split was the right call and no acceptance clause was quietly reduced.** The two undone
clauses are both *in* `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`, one as an option set and one as a constraint, and the record's
reasoning is real rather than a deferral dressed up: any line or byte cap discards the oldest lines
first, those are the 99 `guard_block`/`guard_halt`/`halt_cleared` events, and tail-reading in
`bin/monitor` loses the same evidence from the reader's side because the panel caps each class
separately. That is `rules/critical-stance.md` §4's "the mechanism changes, not the approximation",
applied correctly. The task's own status line says *"the acceptance clause is therefore met in part
only"* rather than reading as discharged.

One thing worth stating because it is what makes the split safe: `agents/taskplanner.md:89` surfaces
an `_o_` decision as an open blocker, so half (b) does not leave the work queue when the issue closes.
Had decisions been invisible to the queue builder, the same split would have been a quiet drop.

### The sibling record filed alongside carries an unchecked claim of its own

`260811-1617_*_record-260811-1547-states-its-proposed-lint-has-no-exceptions-and-a-shipped-skill-already-is-one.md`, **Low**. `260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md` is correct that `/fusion:monitor-reset` does not exist and that
the citation is load-bearing. Its proposal says the lint it asks for *"has no exceptions to carve"*.
Measured over `agents/`, `skills/`, `rules/`, `docs/`, `README*.md` and `CLAUDE.md`: eighteen distinct
`/fusion:<name>` references, **two** unresolvable. The second is `skills/setup/SKILL.md:49`, which
deliberately names the retired `/fusion:migrate-workbench-v2` to explain why a directory that skill
left behind is on the probe's exclusion list. A lint written to the record's acceptance criterion 2
fails on that line on its first run. Same class as the defect the record files, one level down.

---

## Cross-cutting observations

**1. The pattern the dispatch asked about is present, and it is the *scope* of a repair rather than
its mechanism.** Every mechanism in this range is well-chosen: the tree probe over the store probe,
the exported predicate over a second regex, the bound in the string-builder over a new clamp, the
split over a guessed cap. Three of the eight findings are instead about how far the repair was
carried:

| Repair | Corrected on | Left standing on |
|---|---|---|
| the churn output contract (`260811-1612_*_claude-md-is-the-fifth-surface-of-the-churn-rank-output-contract-and-was-left-on-the-old-one.md`) | 4 surfaces + 2 README rows | `CLAUDE.md:33` |
| the `.toml` boundary (`260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md`) | coder, ontocoder, planner, README-agents | `agents/orchestrator.md:346`, now cited as the authority |
| the widened gate's dependency (`260811-1611_*_the-positive-control-documents-the-keyword-exemption-dependency-in-a-comment-and-asserts-something-else.md`) | a comment | the assertion |

Turn 2's review named this exact mechanism — *"the sibling that was not in the file set"* — and this
Turn closed four instances of it. The mitigation it named (file a record for what you saw outside your
set) was used once here, for `260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md`. What it did not reach is the case where the surface left
behind is the one the repair *promotes*: `CLAUDE.md` documents the helper whose contract moved, and
the routing table is what four rewritten prompts now defer to. Both were made more load-bearing by
the change that skipped them.

**2. The High finding is, again, the same class as the defect it repairs.** Turn 2's review closed
with that sentence about `260811-1406_*_the-record-counts-block-reports-unmeasured-whenever-the-active-circles-issue-store-was-empty-at-the-session-anchor.md`. It holds a second time, one branch narrower:
`260811-1406_*_the-record-counts-block-reports-unmeasured-whenever-the-active-circles-issue-store-was-empty-at-the-session-anchor.md` was "a number that could have been taken and was not, reported as unmeasurable"; the
repair fixed *when* that verdict fires and kept the coupling that produces it, so the git-free count
still goes down with the git-dependent ones. The block was written twice in two days and grew from 8
lines to 15; the growth bought key resolution and a `why=` field, both real, and none of it bought a
split between what needs the anchor and what does not. That split is one `if` and it is the actual
shape of the problem.

**3. The measured claims held; the enumerated ones slipped.** Every number this range states
survived checking — 4 of 12 Circles, 4 226 of 17 524 lines, `entries=451 absent=209 noise=2`, 902 →
185 characters, the reproduced live-map ranking. Every *list of places* it states was short by one:
the surface list in the churn sweep, the cause list under `why=`, the exception count in
`260811-1547_*_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md`. Turn 2 found the same asymmetry between measurement and generalisation. The pattern is
now stable enough to act on: a claim of the form "and these are all of them" is the one that has not
once been checked the way the numbers beside it were.

**4. The session's own event log froze in the Turn about measured bookkeeping.** `260811-1614_*_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone-so-a-turn-that-emits-nothing-else-reads-clean.md`,
**Medium**, and this is the finding no record covered. `orchestrator-events.jsonl` as committed at
`adaa545` carries Turn 3's `turn_start` and nothing after it, while the range's three commits closed
eleven queue entries. Turn 2 emitted a `task_done` per task. `agents/orchestrator.md` `### Drift
check` names this log as one of the two records that *"cannot silently freeze"* — and
`hooks/lib/state-drift.ts:271` reads exactly one event type out of it, `turn_start`. So
`bin/fusion-state-drift` reports `verdict=clean`, four rows, zero drift, over precisely the state the
section exists to catch. The mechanism this session spent two Turns building measures the boundary
events it rides and not the per-task events that say what happened between them.

**5. Not a release blocker, and one thing that is release-shaped.** The range compiles clean, ships a
`dist/` byte-identical to its source, and passes 1284 tests. No finding here damages anything: the
High one is a report going blank, the rest are texts that disagree with code. Separately, and
unchanged from Turn 2's note: `.claude-plugin/plugin.json` still reads `7.2.0` with 39 commits since
the `v7.2.0` tag (`git rev-list --count v7.2.0..HEAD`). That is a release-time act on a protected path, named again only so the next
release does not discover it.

---

## Recommended sequencing

**Before the next session runs the record-counts block**

1. `260811-1610_*_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md` (High) — the `filed` count. The fix is the one `if` that splits on what each half
   needs, and it has to replace `record-counts-measurement.test.ts:271` rather than only add a case.
2. `260811-1616_*_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md` — the cause list, same paragraph, same edit.

**Before anyone answers `260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md`**

3. `260811-1611_*_the-positive-control-documents-the-keyword-exemption-dependency-in-a-comment-and-asserts-something-else.md` — the exemption dependency. Answering `1149` without it means discovering the two
   prompt lines from a red suite in a different file.

**Before the next dispatch that routes a `.toml`, and in the same edit as `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md`**

4. `260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md` — the routing table. `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` is one line in a file this Turn already edited
   twice; the reason it was deferred no longer applies.

**Documentation, before the next Setup read**

5. `260811-1612_*_claude-md-is-the-fifth-surface-of-the-churn-rank-output-contract-and-was-left-on-the-old-one.md` — `CLAUDE.md:33`. Cheap, and it is the first text a session in this repository reads.

**Cleanup, any time**

6. `260811-1614_*_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone-so-a-turn-that-emits-nothing-else-reads-clean.md` — the drift check's fifth row. Not urgent, but it is the mechanism the last two
   Turns were built around and it currently cannot see the failure it was built for.
7. `260811-1615_*_boundedlist-emits-plus-zero-more-for-a-single-over-long-path-against-its-own-stated-invariant.md`, `260811-1617_*_record-260811-1547-states-its-proposed-lint-has-no-exceptions-and-a-shipped-skill-already-is-one.md`.
