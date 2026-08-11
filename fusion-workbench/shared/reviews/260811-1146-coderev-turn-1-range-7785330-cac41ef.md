# Code review — Turn 1, `7785330..cac41ef`

---
**Sender:** coderev
**Reviewed-range:** `7785330..cac41ef`
**Not-opened:** `fusion-workbench/**`, `hooks/dist/**`
**Commits:** 5 — `d8e38d5`, `8a49fd5`, `b4eb4db`, `afd7c2e`, `cac41ef`
**Files in range:** 60 (12 024 insertions)
**Cross-references:** issues `260811-1141` … `260811-1149`; decision `260811-1146`; open record `260810-0510`

---

## What "not opened" means here, precisely

Two entries, and neither is a file a re-dispatch should burn a pass on without reading this first.

- **`fusion-workbench/**`** (12 files: `tasklist.md`, 7 new history entries, 4 renamed issue records).
  Out of scope by `agents/coderev.md` `## Scope`, which excludes the workbench as "workbench content,
  not production code". Two of the four issue records (`260810-0510`, `260811-0114`) *were* read,
  because the review depends on them. Declared rather than assumed exempt.
- **`hooks/dist/**`** (14 files). Not read line by line. Verified by a stronger method instead:
  `npx tsc --outDir <tmp>` produced output **byte-identical** to the committed `dist/`
  (`diff -rq` empty), and `grep` over every new `dist` file confirms the only imports are
  `node:child_process`, `node:fs`, `node:path` and relative `./lib/*.js`. The
  self-containment constraint the HTTPS installer depends on holds.

Everything else in the range was opened in full: three library modules, three CLI entries, three
`bin/` wrappers, `hooks/tracker.ts`, all six new or changed lint files, all three new module test
suites, both reviewer prompts, `agents/orchestrator.md`, `agents/taskplanner.md`, three skill bodies,
`bin/monitor`, `README-hooks.md`, `hooks/lib/events.ts`, `.gitignore` and the two test helpers.

`npm test` passes: 48 files, 1243 tests. `tsc` compiles clean.

---

## Summary

The three-module family is the **right shape at the domain level and one abstraction short at the
mechanical level** — and the missing abstraction already exists in this codebase, unused. One
High-severity defect: the staging classifier reads any workbench file whose *name* contains
"commit-message" as a commit-message leftover and tells the model to delete it, verified end to end
against a filename pattern this workbench already holds. The six lints are, with one exception, the
strongest cohort this repository has produced — the two known traps were avoided in the new files,
though the older trap survives untouched in a file this range edited.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 4 |
| Low | 3 |

Plus one decision record on the family's shape, and one cross-reference to an open record.

---

## Focus 1 — the convergence: is the family right?

### The sibling argument is correct. Judge it, then set it aside.

Each executor argued its module was a sibling rather than an extension. Read against the code, that
argument holds and is not the interesting question. `lib/state-drift.ts` compares four bookkeeping
surfaces against git and the event log; `lib/review-coverage.ts` tiles declared ranges over a commit
set; `lib/staging-drift.ts` classifies porcelain entries. Three unrelated subjects, three unrelated
records, three unrelated triggers. Folding them into one module would produce a module with three
subjects and no thesis.

**The triggers in particular are the best reasoning in the family and must not be flattened.**
`review-coverage.ts:92-100` and `staging-drift.ts:33-54` each argue, from a measured issue
(`260810-0710`), why the module declines the every-tool-call path the first one sits on. That
argument is different in each case and it is right in each case. Any consolidation that reduced it
to a flag would destroy the most valuable text here.

### Where it is one abstraction short — measured, not asserted

What repeats is not the subject. It is the **chassis**. Counted across the three modules, three CLI
entries and three `bin/` wrappers:

| Repeated | Copies | Sites |
|---|---|---|
| Throttle store under `.guard-state/<name>.json` | 3 | `state-drift.ts:512-531`, `review-coverage.ts:560-579`, `staging-drift.ts:449-466` |
| `git(root, args)` `execFileSync` wrapper | 2 verbatim + 1 inline | `review-coverage.ts:315-326`, `staging-drift.ts:260-271`, `state-drift.ts:280-288` |
| `WB` + `.guard-state` path building | 3 | one Layout block per module |
| `EMPTY(root, why)` factory | 2 | `review-coverage.ts:371-382`, `staging-drift.ts:359-365` |
| `signature` contract | 3 hand-rolled | one per module |
| Tracker's resolve → measure → throttle → emit → return shape | 3 | `tracker.ts:838-860`, `:892-926`, `:969-1008` |
| CLI `main(argv)` + exit 2 + `anchor=workbench-root` + `process.exitCode` | 3 | the three `hooks/*.ts` entries |
| `bin/` wrapper boilerplate | 3 (4 with `fusion-churn-rank`) | the three new wrappers |

**The finding that decides it:** `hooks/lib/guard-state-file.ts` is the throttle store, and its own
header names this exact class —

> Three state modules … each carried their own copy of the same twelve lines … **Copies drift, and
> this set drifted in the way that matters.**

Two modules use that seam. Three more were written beside it, in one afternoon, by three executors
each of whom had read the previous module. And the copies are already worse than the original: the
seam writes atomically through a `.tmp` and a `rename`; all three new writers call `writeFileSync`
directly.

`readStateFile` and `stateField` were deduplicated during the third task. That is the right instinct
applied to one of eight places. The one that mattered most — the state file with its own seam
module — was not the one caught.

### The abstraction, named

A `Measurement` record plus one driver per surface:

```
interface Measurement<R> {
  name; event;
  fires(input, root): boolean;   // every call | a review file lands | HEAD moved
  measure(root): R;
  signature(r); sentence(r); detail(r); render(r);
}
```

Then one throttle (the existing seam, widened by an optional `root`), one `lib/git.ts`, one tracker
loop over a registry, one CLI driver, one `bin/` wrapper template. What survives per module is what
is genuinely different.

**This is not merely tidiness.** The registry is what would have made the `bin/monitor` omission
below structurally impossible: a measurement that declares its event type in one place cannot have
two of three events land in a log nothing reads.

Filed as issue `260811-1142` (the narrow, unambiguous half: reuse the seam) and decision
`260811-1146` (the chassis question, with the recommendation to build the two owned pieces now and
the rest before a fourth module).

### Do the three trigger points interact or fire redundantly?

**No redundancy, and one shared cost.**

- On an ordinary tool call: state-drift measures; the other two return early. Staging-drift still
  runs one `git rev-parse HEAD` to arm its trigger (`staging-drift.ts:491-495`), and state-drift one
  `git rev-list --count` when a session is live. Measured: ~0.10 s total for `hooks/dist/tracker.js`
  including node startup, in a real repository with a live `agentstate.yaml`. Acceptable.
- On a commit: both state-drift and staging-drift fire, and they say different things — one that a
  counter is stale, one that a record missed the commit. Complementary, not duplicated.
- On a review file landing: review-coverage fires. Its cost is unbounded in the number of review
  files in the mtime window (one `git rev-list` each, `review-coverage.ts:447`). Bounded in practice
  by the anchor-date floor; worth watching if a session ever produces many reviews.

Each is isolated in its own `bestEffort` (`tracker.ts:1037-1058`), so one measurement's failure
cannot cost another's sentence. That is correct and should survive any refactor.

### Does `hooks/tracker.ts` still read as one hook?

**Mostly yes, and the seam where it stops is visible.** `main()` is coherent: three measurements,
each `bestEffort`-isolated, then the plugin-repo stand-down, then the protected-path measurement,
then the reply, then churn. The ordering is documented and each ordering decision cites the defect
that established it.

What has grown awkward is the header. Jobs `0`, `0b`, `0c` are numbered as if they were amendments to
a numbering that was already `1, 2` — because they were. The file is 1118 lines, of which roughly 180
are the three near-identical `measure…ForModel` functions. It reads as one hook with three tenants,
not as three bolted-together hooks. The registry above is what turns the tenants back into one job.

---

## Focus 2 — the lints

### The two known traps

**Trap 1 (`260810-0510`: negative controls that re-implement instead of calling) — avoided in every
new file, and still present in the file this range edited.**

The four new or heavily changed lints all state the discipline in their headers and all keep it:

| File | Controls call the production helper? |
|---|---|
| `queue-ground-producer.test.ts` | Yes — `assertMandatesTheGround`, `mandatedHeadLines`, and the real bash block extracted from `agents/orchestrator.md` and **executed** |
| `queue-commit-ownership-lint.test.ts` | Yes — `weakenedStaging`, `mandatesEveryRun` |
| `commit-message-path.test.ts` | Yes — reaches through the shipped `classify()` rather than transcribing its pattern |
| `review-coverage-mandate.test.ts` | Yes — drives the real `parseRange` / `parseNotOpened` |
| `state-drift-detection-lint.test.ts` | Yes, and further: each `SKIP_LICENCES` entry must be the *first* in the list that matches its own example |

`queue-ground-producer.test.ts` is the strongest of them. It does not describe the consumer's check —
it extracts the bash block from `agents/orchestrator.md` and runs it, against head lines taken out of
`agents/taskplanner.md`, in a throwaway workbench. Producer and consumer are bound by execution.

**But `queue-ground-lint.test.ts` still carries both defects `260810-0510` names, and this range
touched one of them without fixing it.** The control at `:246-268` re-implements the table split from
`:155-160` verbatim; the commit changed only its expected value (`not.toBe(5)` → `not.toBe(3)`). The
control at `:232-244` still calls `uniqueLine` alone and never `assertRidesTheAct`. Cross-referenced,
not refiled — the record is open. Its cited line numbers are now stale and should be refreshed at the
next reconciliation.

**Trap 2 (a lint that pins prose failing for the wrong reason) — handled correctly, with one hole.**

`queue-commit-ownership-lint.test.ts:91-105` scans fenced blocks only, deliberately, because
`agents/orchestrator.md` quotes `git add -u` in prose as the explanation of the defect. Verified:
`agents/orchestrator.md` has 28 balanced fenced blocks; the two prose mentions (`:435`, `:988`) fall
outside all of them, and the two real commands (`:318`, `:438`) fall inside. The reasoning is right
and the parity currently holds.

The hole is in what the scan then *decides*. `weakenedStaging` flags a directory argument only when
the token ends with `/`, so `git add fusion-workbench` — the ordinary spelling, and how the `f38f37d`
defect was written — passes the assertion the file's own header calls "the one that matters most".
The negative control at `:244` passes on the `-u` token alone and never exercises the directory rule.
Filed as `260811-1144`.

### Does each lint test what it claims?

Yes, with the two exceptions above and one Low. `commit-message-path.test.ts:141` exempts any line
matching `/Never inside|never inside|leftover|Measured|improvised|fault/` — a blacklist standing in
for the undecidable question "does this prose name the path as a defect or prescribe it?", with
inconsistent case handling (`Measured` capital-only, `fault` lowercase-only). Filed as `260811-1149`.

`state-drift-detection-lint.test.ts` deserves separate mention: it is honest about its own limits at
length (`:80-137`), names the blacklist as incomplete by construction, names the sentence-scope gap
it cannot close, and names the pin that would close the vocabulary class and why it was not taken.
That is `rules/critical-stance.md` §3 applied to a test file, and it is the standard the other lints
should be read against.

---

## Focus 3 — the compiled output

**Clean.** Three checks:

1. `npx tsc --outDir <tmp>` then `diff -rq dist <tmp>` — no differences. The committed `dist/` is the
   current build of the current source.
2. Every import in the six new `dist` files resolves to a `node:` builtin or a relative `./lib/*.js`.
   No package import, no `require()`.
3. `git ls-files hooks/dist` lists all twelve new files; `git check-ignore` confirms none is ignored.
   The three new `bin/` wrappers are tracked with mode `100755` and their `!bin/…` exceptions were
   added to `.gitignore` in the same range.

The tarball remains runnable with no `npm install`.

---

## Findings by theme

### Classification and destructive instruction

**`260811-1141` — High. Any workbench file whose name contains "commit-message" is classified as a
commit-message file, and the model is told to delete it.**
`staging-drift.ts:208` tests `/commit[-._]?(msg|message)/i` against the basename alone, with no
directory scoping, and it runs first by design (`:296-305`). `shared/history/260810-1810-coder-commit-message-out-of-the-shell.md`
already exists in this workbench and classifies as `commit-message`. Reproduced end to end against a
scratch project: the tracker returned *"A commit-message file is sitting in the workbench: … Delete
it and use the prescribed path."* — for a session history record. `agents/orchestrator.md`'s Staging
check table repeats "delete it". Two failures at once: the instruction is destructive, and because
the classes are exclusive the *real* fault (a record that missed its commit) is suppressed at the
same moment.

### Reuse and duplication

**`260811-1142` — Medium. The three modules hand-roll a `.guard-state/` store that
`lib/guard-state-file.ts` already owns, and write it non-atomically.**
Six functions where two calls plus three coercions would do. The seam's signature resolves the root
itself and the new modules pass one — a reason to widen the seam by one optional argument, not to
fork it three times.

**`260811-1146` (decision) — does the family get a shared chassis before a fourth module?**
Three options with the measured duplication table. Recommendation: take the two pieces that already
have an owner now, build the rest at the fourth module, and write that trip-wire down rather than
remembering it.

### Surfaces and reachability

**`260811-1143` — Medium. `staging_drift` and `review_coverage` events are emitted into a log nothing
reads.** `bin/monitor:1081` drops every event not in `WARNING_EVENT_TYPES`, and only `state_drift` was
added (`:125`). The two later siblings emit into `.guard-state/events.jsonl` and reach no panel and
no event list. `staging_drift` is the one whose subject can actually be *lost*.

**`260811-1145` — Medium. `conceptrev` review files are scanned and trigger the coverage report,
though no mandate covers them.** `reviewFiles()` takes every `*.md` under every reviews store with no
sender filter, and the tracker trigger (`tracker.ts:905-907`) fires on any `.md` under a `reviews/`
path. A conceptrev assessment — which structurally cannot carry a commit range — is permanently
`UNUSABLE` and can fire the whole coverage measurement at Phase 0b. The mandate's own gate
(`review-coverage-mandate.test.ts:68`) fixes the sender set at two; nothing carries that fact into
the scan or the trigger.

### Prompt and parser precision

**`260811-1144` — Medium.** The staging-shape lint misses a directory argument with no trailing slash.

**`260811-1147` — Low.** Both reviewer prompts place the mandated fields "beside `**Sender:**`", a
header field neither prompt defines anywhere. `headerField` scans the whole file for the first
matching line, so a review *about* the mandate is the file where that bites.

**`260811-1148` — Low.** `parseNotOpened` reads `none of the prompt files` as "nothing excluded"
(the quiet failure) and promotes `nothing left unopened` to a one-element file list handed to the
next dispatch as scope (the loud one).

**`260811-1149` — Low.** The commit-message-path lint's exemption regex is broad and
case-inconsistent.

---

## Cross-cutting observations

**1. The one real cross-cutting defect is the missing chassis, and it produced two of the other
findings.** The `bin/monitor` omission (`260811-1143`) and the non-atomic throttle writes
(`260811-1142`) are both "the third copy did not inherit what the first copy has". A registry that
names each measurement's event type and state file in one place makes both classes unrepresentable.

**2. Every module reasons impeccably about its own trigger and not at all about its own surfaces.**
Each header argues at length why its trigger is what it is, citing measured issues. None asks who
reads its output after the sentence is delivered. `lib/state-drift.ts:47-48` names `bin/monitor` as
its third caller; the two siblings were written against that model and simply did not get one.

**3. A name-based classifier landed in a codebase whose whole recent history is about not
classifying from text.** `staging-drift.ts` opens by arguing that the trigger must be *measured*
rather than predicted from a command's text, citing the classifier that fell in v6.0.0 and the branch
policy deleted after 24 false blocks. It then classifies files by regex over their names, and the
first false positive is already on disk. `rules/critical-stance.md` §4 asks whether the question is
decidable from the inputs; "is this file a commit-message leftover?" is decidable from *where it
lives and whether git has ever tracked it*, and is not decidable from its name.

**4. The prompt-text gates are converging on a genuinely good pattern**: extract the executable block
from the prompt, run it, drive the negative controls through the same helper, and state in the header
what the gate cannot prove. `queue-ground-producer.test.ts` and `state-drift-detection-lint.test.ts`
are the two to copy. `queue-ground-lint.test.ts` is the one still at the previous standard, and it was
edited in this range without being brought up to it.

**5. Test coverage of the three modules is strong and has three named holes.** All three suites spawn
real subprocesses against real git repositories, and each case cites the measured instance it
reproduces. Untested branches worth knowing about, none filed as a defect on its own:
`state-drift.ts:263-267` (the `EVENT_TAIL_BYTES` truncation path that reports the Turn row
unchecked); `review-coverage.ts:427-429` (the mtime floor); `review-coverage.ts:476` (the deliberate
choice that an `UNUSABLE` review still contributes its `**Not-opened:**` list). The two fixture gaps
that *are* defects are named inside `260811-1141` and `260811-1145`.

---

## Recommended sequencing

**Before the next release**

1. `260811-1141` (High) — the destructive instruction. Nothing else in the range can cost a file.
2. `260811-1143` — the two unreadable event types. `bin/monitor` is protected, so this is a human
   change; batching it with any other monitor work is sensible.

**Before the fourth measurement module**

3. `260811-1146` (decision) — answer it, at least to option 2.
4. `260811-1142` — the seam. Mechanical, no test-surface change.
5. `260811-1145` — the sender filter, on both the scan and the trigger.

**Cleanup, any time**

6. `260811-1144`, `260811-1147`, `260811-1148`, `260811-1149`.
7. `260810-0510` — the two surviving controls in `queue-ground-lint.test.ts`, plus a line-number
   refresh on the record itself.

**Not a release blocker, stated so it is not mistaken for one:** the range compiles clean, ships a
`dist` that matches its source, and passes 1243 tests. The High finding is a false positive in a
reporting path, not a mechanism that runs unprompted — it fires only when a record whose name matches
the pattern is unstaged at the moment HEAD moves.
