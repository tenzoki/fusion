# Code review — Turn 2, `270c566..1d5eed6`

---
**Sender:** coderev
**Reviewed-range:** `270c566..1d5eed6`
**Not-opened:** `hooks/dist/**`
**Commits:** 5 — `337c01b`, `7749845`, `619dfb7`, `f2d9905`, `1d5eed6`
**Files in range:** 53 (23 outside `fusion-workbench/`), 1608 insertions
**Cross-references:** issues `260811-1406` … `260811-1413`; open records `260810-1135`, `260811-1301`, `260811-1345`, `260811-1142`, `260811-1149`

---

## The range holds five commits, not six

`git log --oneline 270c566..1d5eed6` returns five. The dispatch said six. The difference is
whether `270c566` — the commit that landed the Turn 1 review — is counted as reviewed work or as
the range's exclusive floor. It is the floor, and it is Turn 1's own artifact, so five is right.
Stated because a review whose commit count disagrees with its dispatch is the class of defect this
Turn spent four commits closing.

## What "not opened" means here

**`hooks/dist/**`** (6 files). Not read line by line. Verified by the stronger method instead, the
same one Turn 1 used: `npx tsc --outDir <tmp>` in `hooks/`, then `diff -rq dist <tmp>` — no
differences. The committed `dist/` is the current build of the current source, so the shipped
tarball matches what was reviewed.

Everything else was opened, including `fusion-workbench/**`, which Turn 1 declared exempt. The
dispatch asked for the batching-damage sweep and the five executor histories are where a batch
records what it saw and did not fix, so they were read rather than declared out of scope. The four
records the range closed and the two it amended were read too. `orchestrator-events.jsonl` and
`.fusion-setup` were read as diffs only — one is an append-only log, the other a timestamp.

`npx vitest run` in `hooks/`: **48 files, 1248 tests, exit 0**, three consecutive runs, identical
totals. `tsc` compiles clean.

---

## Summary

The regression fix is sound and its stated trade holds — I verified the residual runs in the safe
direction and found no destructive gap in the new ordering, only a lint that quietly narrowed with
the classifier it borrows. The batching cost is real and concentrated in one place: the new shell
block in the orchestrator prompt is correct as code and wrong about where it runs, and it reports
`unmeasured` for the common Circle session. The flaky run is not the pty probe's fault, and the
flake is real: I reproduced a load-sensitive failure in that file 3 of 3 times.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 4 |

Eight findings, eight records filed under `shared/issues/260811-14*`.

---

## Focus 1 — `337c01b`, the classifier reorder

### The residual does run in the safe direction. Verified, not accepted.

The commit gives up one case deliberately: a genuine commit-message file written inside an artifact
store is no longer read as one. Traced end to end:

`classify()` returns `record` → `measureStagingDrift` sets `fault = (klass === "record" || klass ===
"commit-message") && !staged` (`staging-drift.ts:468`) → `stagingSentence` puts it in the `records`
branch, which says *"add these paths … to the next Step 3b staging list"*. So the file is committed
rather than deleted. That is non-destructive, and the docstring's claim is accurate on the axis it
claims. The cost it does not name is that a `/tmp`-destined scratch file lands permanently in git
history inside an artifact store — a pollution cost, not a data-loss one, and the right side of the
trade against three real records that were being proposed for deletion.

### The new ordering has no destructive gap. What it has is a narrowed lint.

The split is still disjoint (first match wins) and complete (`unclassified` fallback). The classes
that moved ahead of `commit-message` were checked one at a time:

| Now shadows `commit-message` | Effect |
|---|---|
| `LIVE_STATE` / `LIVE_PREFIXES` | a message file under `.guard-state/` reads `in-flight`. Immaterial. |
| `stashes/` | reads `unclassified`. Deliberate — the commit names the stashed snapshot of these records as fixed by the same change. |
| `ROOT_RECORDS`, `circles/*_circle.md` | cannot collide with the pattern. |
| `STORES` | the stated trade, and it is exactly as narrow as the docstring says: only files **directly under one of the nine store directories**. `shared/commit-msg.txt`, `circles/<dir>/commit-msg.txt` and `.commit-msg-tmp` all still reach the class. Confirmed by reading each branch against a constructed path. |

The one thing that got worse is not in `classify()`. `commit-message-path.test.ts:83-91` reaches
through `classify()` to answer a *different* question — "does a shipped prompt prescribe a message
path inside the workbench?" — and inherited the narrowing. A prompt line naming
`fusion-workbench/shared/consult/commit-message.txt` is no longer flagged. The file states and
defends this at `:72-81`, and the defence rests on an assumption about where a future improvisation
will land, which is the same shape of guess the whole family exists because of. Filed as
`260811-1410`, Low: three assertions that do not go through `classify()` still pin the prescription.

### The wording landed on four surfaces and missed the fifth

`hooks/lib/staging-drift.ts`, `hooks/tracker.ts`, `agents/orchestrator.md`'s class table and
`skills/commit/SKILL.md` all carry the new definition. `README-hooks.md:180` still carries the old
one. It survived because `derivable-enumerations-lint.test.ts` checks that a row exists per
`lib/*.ts` file and never what the row says. Filed as `260811-1413`, Low.

The orchestrator table's new cell is the strongest text in this commit: it names the class as
name-decided, says a false positive can enter it, and says a deletion is not recoverable, with the
issue number. That is the right way to write an instruction that a mechanism cannot make safe.

---

## Focus 2 — `7749845`, the shell block

The dispatch asked for this to be read as code. It was extracted verbatim from
`agents/orchestrator.md:618-636` and run against purpose-built scratch repositories in both shells.

### It is correct as code

Three configurations, bash and zsh, byte-identical output in every pair:

- shared store only → `1 filed issue`, `1 now_c issue`, `1 now_o issue`
- two stores, Circle store present at the anchor → `1 filed issue`, `1 filed decision`,
  `2 now_c issue`, `1 now_a decision`
- the `tr`-to-lines handling of a two-store `SCAN_*` does what the prose says it does

`cut -c13` reads the marker correctly for the `YYMMDD-HHMM_S_` shape the `case` glob already pinned.
`git -C "$WORKBENCH" cat-file -e "$A:./$d/$b"` is right and better than the obvious alternative: the
`./` makes it relative to the workbench inside the repository, so it survives a workbench sitting
below the git toplevel. The two-count rule — filed from the filename stamp, reached-a-marker from
the name's absence at the anchor — genuinely fixes the −2/−2 the record measured, and the two bounds
it states are honest.

### It is wrong about where it runs — twice

**The probe reads the first store, and `bin/fusion-paths` puts the Circle's first.**
`${SCAN_ISSUES%% *}` resolves to `circles/<dir>/issues`. Git tracks no empty directory, so the probe
fails for every Circle that had no committed issue when the session began. Measured: `records=unmeasured`
on a fully tracked workbench in both shells. Four of the twelve Circle directories in this
repository's own workbench hold no tracked file under `issues/` at all, so a session against any of
them would print `unmeasured` for its whole life. The prompt then tells the model to *"say which of
the two causes applies"* — and neither does. **Filed as `260811-1406`, High**: the mechanism that
replaced the hand tally does not run for the common Circle session, and the fallback instructs a
false diagnosis.

**The variables are never set, and the failure calls that a fusion bug.** Run verbatim with the
three resolver keys unset, the block prints `fusion bug: a resolver key is empty — record counts not
taken` and exits 1. The only sibling block with this guard idiom (`:178-179`) carries the missing
sentence directly under it — *"Substitute the `WORKBENCH` and `SCAN_CIRCLES` values from Step 2"* —
and the file states the reason in full at `:712`: *"the Bash tool gives every call its own shell, so
no value Setup resolved survives to here."* Filed as `260811-1407`, Medium.

### The other two corrections check out

The churn-exit paragraph was verified line by line against `bin/fusion-churn-rank:19-25` and
`hooks/package.json`. Exit 2 is no workbench, exit 3 is missing compiled hooks, a project with no
churn is exit 0 with `ranked=0`, and `npm run build` really is `rm -rf dist && tsc` — so exit 3 is
routinely reachable in this work tree, which is what the correction claims. All four claims true.

The Cleanup / Step 3e / Phase 2 rewording is correct: `turn_start` does fire in every Turn, and the
three sentences now say what a short session can *find* rather than which points it reaches.

One small claim in shipped prose is machine-specific rather than false: *"The Bash tool runs zsh"*.
The implementation is shell-agnostic and correct either way; only the justification generalises one
machine's shell to every consumer. Filed as `260811-1412`, Low.

---

## Focus 3 — `619dfb7`, the four text corrections

**The frontmatter hazard was avoided.** `agents/coder.md:2` carries no `:` in its `description`, so
the failure CLAUDE.md warns about — an unquoted colon breaking the whole frontmatter — is not
present. Backticks, commas and the em-dash are all safe in a plain YAML scalar outside flow context.
`allowed-tools: [Bash, Read, Write]` in the cadence skill is accurate: `Glob`, `Grep`, `Edit` and
`AskUserQuestion` appear nowhere in the 256-line body.

**The cleanup-skill sentence is now exactly true.** `REACH.fileSet` is
`["agents/*.md", "skills/*/SKILL.md", "rules/*.md"]` (`domain-cascade.ts:840`), `describeReach()`
renders it, and `domain-cascade.test.ts:935-947` compares the rendered block against
`README-hooks.md` between markers. A fourth entry genuinely needs no edit in the skill.

**The `.toml` correction is half-landed.** `agents/coder.md` and `README-agents.md` were updated;
`agents/ontocoder.md` still claims `.toml` unconditionally at `:2` (the frontmatter description a
dispatcher reads), `:7` and `:24`. So `README-agents.md` and `agents/ontocoder.md` now contradict
each other about the ontocoder's own scope, and two agent prompts each claim `Cargo.toml`. Record
`260811-1301` covers the routing table and explicitly calls that one *"a gap, not a contradiction"* —
this is the contradiction it is not. Filed as `260811-1408`, Medium.

Inside `agents/coder.md` itself the same sentence resolves `.toml` and leaves `.json` standing:
`.json` is in the exclusion list while `package.json` is in the ownership list two lines above and
`tsconfig.json` is cited as the coder's one clause later. Filed as `260811-1411`, Low.

**A known defect was parked in a history log.** The commit message records that *"the coderev row
repeats the language omission one line below, noted in the executor's history."* `README-agents.md`
still reads *"Reviews Go / TS / Python code"*. `rules/fusion-workbench-conventions.md` `## Issue and
Decision Filing — MANDATORY` says every discovered defect is a separate file and **"NEVER put issues
… inside … history logs."** Its sibling — the routing-table omission — was filed correctly as
`260811-1301`; this one was not. Not refiled here, because it is one line of documentation prose and
the record would cost more than the fix; named so the discipline gap is visible.

---

## Focus 4 — `f2d9905` and the flaky run

**The probe did not make it worse. Measured, not inferred.**

`ptyAvailable()` is a memoised `spawnSync("python3", ["-c", "import os; m, s = os.openpty(); …"])`.
Measured at 40–70 ms, run at most once per worker process. It sits inside `startMonitor`, which
returns before the ten-second `waitForFile` clock starts, so it cannot consume that budget. The two
added listeners *reduce* one class of worker death: an `error` event on a spawn with no listener is
re-raised by Node as an uncaught exception, which is precisely a worker dying with no assertion
failing.

**I did not reproduce the reported failure.** Seventeen runs on this machine, no
`Error: Worker exited unexpectedly`:

| Configuration | Runs | Result |
|---|---|---|
| Full suite, alone | 3 | green, `48 files / 1248 tests` every time |
| `monitor-warnings-panel.test.ts` alone | 5 | green |
| That file, six concurrent copies | 6 | green |
| **Full suite, three concurrent copies** | **3** | **all three failed, on the same two cases** |

**I did reproduce a different failure, deterministically.** Under three concurrent full suites,
every run failed `monitor-warnings-panel.test.ts:695` — *"a terminal on stdout still gets the
dashboard opened for it"* — at `expect(await waitForFile(marker, 10000)).toBe(true)`, in 12331 ms
against a 30 s `it` timeout. So the ten-second budget inside the case expired, not vitest's. The
already-recorded `fusion-commit-lock.test.ts` case failed beside it in all three.

So: **cannot tell whether the worker death recurs; can tell that the file has a load-sensitive
wall-clock case, and it is the second file of the class `260810-1135` records.** Filed as
`260811-1409`, Medium — this session commits on the suite's exit code, and two independently
load-sensitive cases give a three-executor batch a false-failure rate that teaches its reader to
re-run rather than to look.

One diagnostic gap the commit did not close: it made a *pty allocation* failure say so, and the
failure that actually happens says `expected false to be true`, naming neither load nor the budget.
That still reads as a `bin/monitor` defect, which is the sentence the commit set out to remove.

The other two corrections are clean. The provenance-lint change is exactly right — four assertions
that interpolated the constant on both sides now carry the literal, and the fifth was removed
because it asserted nothing about the fixture it sat beside. The skip-licence docstring deleting
three counts rather than correcting one number is the correct call: nothing derives a count from the
array, so a number beside it is a second source of truth for its length.

Also worth noting on the suite-total question: three consecutive full runs reported **1248 every
time**. Record `260810-0918`'s variance in `fusion-plane.test.ts` did not reproduce today.

---

## Focus 5 — `1d5eed6`, the guard stand-down

**The demonstration was verified rather than accepted.** A detached worktree at `f2d9905`, the new
test file copied in, `npm run build`, then the file run:

```
× the churn stand-down is anchored to the workbench root
  > stands down in the plugin's own repository when the session started below its root
  expect(readChurn(project.root)).toBeNull()
  → churn.json held { "notes.txt": { totalChanges: 1 … }, "keyAnchor": "workbench-root" }
Test Files 1 failed (1) — Tests 1 failed | 12 passed (13)
```

The claim holds in all three parts. The new case fails against the previous tracker with exactly the
churn record the commit says it recorded. The sibling case — *"stands down from the plugin root as
it always did"* — passes before and after, so the gate moved without trading one half for the other.
And the twelve other cases in the file, which drive the tracker from a non-plugin project's
workbench, pass before and after, which is the consumer-sees-no-change evidence.

The gate itself reads correctly. `workbenchRoot !== null && isFusionPluginRoot(workbenchRoot)` keeps
a null root out of the stand-down for the reason the comment gives: with no workbench there is no
churn key and no event destination, and folding the two causes into one null would answer "fusion's
own repository" for any directory that never ran `/fusion:setup`. The three reports staying ahead of
the gate is right and the comment says why.

One observation, not a defect: `findWorkbenchRoot()` is now called five times per tracker run
(`:729`, `:840`, `:899`, `:971`, `:1096`) and the helper caches nothing — each call walks up from
cwd doing an `existsSync` per level. This runs on every guarded tool call. It was four before; the
gate made it five. Not filed: the walk is short and Turn 1 measured the whole tracker at ~0.10 s
including node startup. It belongs in the chassis decision (`260811-1146`) rather than as a defect
of its own.

The `bin/fusion-plane` documentation is accurate. Verified: the `--comments-fixture` read at `:1206`
sits inside the dry-run branch and behind `spec_comment_enabled`, `grep` confirms `COMMENTS_FIXTURE`
is read at exactly that one site, and the live path does its own `GET issues/<id>/comments/`. Note
that this second seam inherits the silence open record `260810-0918` describes for the first — passed
on a live push it is accepted and ignored — but the new text now *says* so, which the first seam's
text did not. Cross-referenced, not refiled.

---

## Cross-cutting observations

**1. The batching damage is real and it has one shape: the sibling that was not in the file set.**
Three of the eight findings are the same event. `agents/ontocoder.md` was outside task 35's file set
(`260811-1408`). `README-hooks.md` was outside `337c01b`'s (`260811-1413`). The substitution sentence
that exists at `agents/orchestrator.md:181` was not carried to the block added at `:618`
(`260811-1407`). In every case the batch's disjoint-file-set discipline — which is correct, and which
is what let four tasks run in parallel — is exactly what produced the miss. The mitigation already
exists and was used twice: file a record for what you saw outside your set. It was used for the
routing table (`260811-1301`) and not for the ontocoder prompt, the README row or the substitution
sentence.

**2. Where a claim was measured, it held; where it was reasoned, it slipped.** Every claim in this
range that came with a measurement survived checking: the churn stand-down demonstration, the
two-shell run of the counts block, the four churn-exit-code claims, the `describeReach` reach, the
`--comments-fixture` call site. The two that did not survive are both *generalisations* from a
measurement — "the Bash tool runs zsh" from one machine (`260811-1412`), and "the place a
prescription puts one is where no store owns it" from one improvisation (`260811-1410`). That is
`rules/critical-stance.md` §3 working exactly as intended in one direction and being skipped in the
other: the verification was done, the scope of what it verified was widened afterwards.

**3. The High finding is the same class as the defect it was fixing.** `260810-1205` was filed
because a count was hand-kept and nobody could tell it had drifted. The replacement computes the
count — and then declines to compute it, silently, for the sessions that use Circles, while
instructing the model to report a cause that is not the cause. A number that cannot be taken is
better than a wrong number, which the block gets right; a number that could have been taken and was
not, reported as unmeasurable, is the old failure with a new label.

**4. A borrowed predicate answered a question it was not narrowed for.** `260811-1410` is worth
reading beside Turn 1's chassis decision. The instinct — reach through the shipped `classify()`
rather than transcribe its pattern — is the discipline `260810-0510` asks for, and it is right. What
it does not survive is the shipped function being narrowed for a *different* caller's reasons. The
lesson is not "stop reusing"; it is that a reused predicate needs the question it answers written at
the seam, so a change to one caller's answer is visibly a change to the other's.

**5. The suite is green and the gate it feeds is not reliable under the project's own working
pattern.** `48 files / 1248 tests`, three times, exit 0. Under three concurrent copies — the state a
multi-executor batch or a reviewer running `npm test` alongside puts it in — 3 of 3 failed, both
times on wall-clock cases with no product defect behind them. Two records now describe that
(`260810-1135`, `260811-1409`) and neither is a code defect. It is worth deciding, once, whether this
suite is meant to be run concurrently with itself at all.

---

## Recommended sequencing

**Before the next Turn touches the orchestrator prompt**

1. `260811-1406` (High) — the `unmeasured` probe. The section it lives in is the Turn's own
   deliverable and it does not run in the common case.
2. `260811-1407` — the substitution sentence. One line, same file, same section.

**Before the next dispatch that routes a `.toml`**

3. `260811-1408` — the ontocoder prompt. Its `:2` line is what a dispatcher reads.
4. `260811-1411` — the `.json` half of the same sentence, in the same edit.

**Test infrastructure, before the next parallel batch**

5. `260811-1409` — with `260810-1135`. Neither is a product defect and both cost the commit gate.

**Cleanup, any time**

6. `260811-1410`, `260811-1412`, `260811-1413`.
7. `260811-1345` (already open, uncommitted) — the CLAUDE.md troubleshooting row. It now names all
   three stand-down sites, so correcting it closes the drift `1d5eed6` widened rather than caused.

**Not a release blocker, stated so it is not mistaken for one:** the range compiles clean, ships a
`dist/` byte-identical to its source, and passes 1248 tests three runs running. The High finding is
a report that goes silent, not a mechanism that damages anything. Note separately that
`.claude-plugin/plugin.json` still reads `7.2.0` with 35 commits since the `v7.2.0` tag — that is a
release-time act on a protected path, not this range's omission, and it is named here only so the
next release does not discover it.
