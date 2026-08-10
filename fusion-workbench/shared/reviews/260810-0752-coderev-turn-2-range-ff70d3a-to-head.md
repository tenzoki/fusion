# Code review — `ff70d3a..HEAD`, session `260810-0241` Turn 2

**Sender:** coderev
**Range:** `ff70d3a..HEAD`, 6 commits, 8 non-workbench files (+1 245 / −172)
**Origin:** Not Circle work. No Circle active — filed to `shared/`.
**Suite state at review time:** `npm test` **green** — 993 passed, 0 failed, 38 files
**Prior review:** `shared/reviews/260810-0512-coderev-turn-1-range-8960e1a-to-head.md`

---

## Verdict

**Turn 2 repaired Turn 1 without repeating it, and the two fixes that mattered most are sound.**
All five findings the Turn was scoped to are genuinely closed — the suite is green, the Plane
read path no longer writes, the queue retirement no longer writes through an empty key, and the
count helper no longer labels a failure as a measurement. Four of the five executor claims the
dispatch asked me to test hold as stated; the fifth holds in the code and is overstated in its
commit message.

**But the range re-enters two of the same classes it was closing, in the commits that closed
them.** `c923935`, which exists to stop `.plane-map.json` losing a UUID, made the one function
that replaces that file report success when the replacement fails — the shape `ea492e6` had
removed from a sibling binary twelve minutes earlier. And `2d103be`, whose entire purpose is to
state the byte cost rather than absorb it, absorbed 1 749 bytes on the orchestrator.

Neither is the careless-commit kind. Both are the structural condition Turn 1 named: an author
that cannot see the commit beside it, applying a rule outward while breaking it inward. That
pattern is now four Turn-1 instances plus two more here, and the decision filed tonight
(`260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`) is the
right place for it.

### Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 6 |
| **Total filed** | **9** |

All nine are in `shared/issues/` with `_o_` markers, timestamps `260810-0743` … `260810-0751`.
Checked against the 41 open records first; none duplicates an existing one.

---

## Part 1 — The five claims the dispatch asked me to test

Each was checked by execution where execution was possible, not by reading the commit message.

### Claim 1 — `map_view` "provably cannot write". **Holds in the code. Overstated in the message.**

The property as the code header states it (`bin/fusion-plane:681`) is exact and true: *"READ-ONLY
with respect to `$MAP`: it never writes, creates or replaces it."* Verified three ways.

- **Every reference to `$MAP` in the file was enumerated.** Exactly one is a write: `mv "$1"
  "$MAP"` in `map_put` (`:734`). Two functions reach it — `map_write` (`:759`) and `rebuild_map`
  (`:1330`) — and `map_write`'s four callers are `map_set`, `map_forget`, `map_migrate`,
  `map_prune`, every one of them a command asked to mutate. So yes: `map_put` is the single
  physical writer, and a read path added later that calls `map_view` has no route to it.
- **The read commands were run** against a fixture workbench holding the legacy duplicate pair.
  `map`, `map <key>`, `push --plan --all`, `push --plan --circle …` and `plan --all` each left
  `.plane-map.json` byte-identical (SHA compared), while naming the pending fold and the losing
  UUID on stderr. This is the F2 defect, gone.
- **One command still reaches a writer on a path that reads as read-only**, and it is a test seam:
  `push --plan --rebuild-map --fixture <f>` rewrote the map in the reproduction, because the
  fixture rebuild sits deliberately ahead of the dry-run gate (`:1379-1382`). Filed as `260810-0746`,
  Low, because `--fixture` is documented as a test seam — but four separate documents state the
  "a dry run writes nothing" property without that qualification, including `docs/plane-setup.md`.

Where the message overstates: *"`map_view` computes the fold **in memory**"* and *"has no route to
the filesystem"*. It writes a `mktemp` file and hands it to an `EXIT` trap. That is not the same
claim, and the difference turned out to matter — see M1 below, which is a defect that lives
entirely in that temp file.

### Claim 2 — a total ordering for the rebuild collision. **Verified.**

`sort_by([ (.id == current[$k].plane_id), .updated, .id ])`, winner is `last`. Distinct Plane
issues have distinct UUIDs, so key 3 breaks every tie that keys 1 and 2 leave. Checked by
execution rather than by reading:

- two candidates with identical `updated_at` and no entry in the current map: winner `BBB`;
- the same two with the fixture's array order reversed: winner `BBB` again.

So the winner does not depend on API result order, which is what F3 asked for. The one case where
the three keys genuinely tie is the same issue appearing twice in the response, and there the
*ordering* is still fine while the *report* is not — filed as `260810-0748`, Low.

### Claim 3 — the negative control is `git show ff70d3a:agents/orchestrator.md` through the same extractor. **Verified. Genuine.**

`queue-retirement-empty-key.test.ts:194-199` reads the pre-fix text out of git and passes it
through the same `extractBashBlock` the live assertions use; `:281-304` then asserts that the
pre-fix block lands the queue at the workbench root and aims the `mv` at `/`. Run in isolation:
9 passed, 0 skipped, including all three pre-fix controls.

This is the claim I caught overstated three times in Turn 1 (`260810-0502`, `-0503`, `-0510`).
Here it is true, and the test is the strongest artefact in the range: it extracts the prompt's own
bash and runs it, with `mkdir`/`mv` stand-ins confining the two runs that would otherwise write to
`/`. One documented limit, not a defect: in a repo without the commit (an installed copy, a
shallow clone) the three controls `ctx.skip()` themselves rather than assert against invented
history — visible in the reporter, so it does not fail quiet.

### Claim 4 — the assertion sits inside the `if`, so an early exit cannot leave a renamed record beside a live pointer. **Verified.**

The nesting at `agents/orchestrator.md:568-579` is exactly as claimed: the emptiness check is an
inner `if`/`else` inside the head-matches-Circle `if`, its failure branch is an `echo` to stderr,
and `rm -f fusion-workbench/.active-circle` sits outside both and always runs. The test asserts it
directly (`:251-261`, *"a skipped retirement is not a skipped closure"*). No half-closure.

### Claim 5 — the extension lists are parsed out of the script rather than copied. **Verified, with one residual.**

`extensions()` reads the alternations from `bin/fusion-count-sources` at test time, and the parse
cannot silently match nothing: `expect(exts.length).toBeGreaterThan(50)` / `> 15`. The comment
naming that risk is accurate.

The residual is the neighbouring case. Measured: `CODE_EXT` parses 60 extensions from 11
assignment lines against a floor of 50, so two lines can stop matching — a `${CODE_EXT}` spelling,
a trailing comment — while the test still passes over reduced coverage, which is the drift the
parse exists to prevent. `DATA_EXT` (19 from 3 lines, floor 15) is not exposed. Filed as
`260810-0749`, Low, with a structural fix that removes both magic floors.

---

## Part 2 — Findings

### Theme A — The class each commit closed, re-entered inside it

**F1 · High · `map_put` reports success on a failed write.**
`260810-0743_o_map-put-reports-success-on-a-failed-write-so-map-write-s-error-branch-never-fires.md`

`bin/fusion-plane:733-739`. `mv "$1" "$MAP"` runs, and four assignments follow it, the last
returning 0. So `map_put` always succeeds, `map_write` always succeeds, and every caller's
`|| return "$EXIT_CONFIG"` guard is unreachable.

Reproduced with the workbench directory made unwritable:

```
mv: rename /var/folders/.../fusion-plane-map.n7JN1J to .../.plane-map.json: Permission denied
STATUS: migrated (1 entries)
exit 0
```

The map is unchanged. Both surfaces a caller reads assert a migration that did not happen.

Why High: `map_set` reaches the same chain on the live push path (`:1039`, `:1043`, `:1778`).
*Inference, from the call chain rather than a live Plane run:* a lost write there means the new
issue's UUID never enters the map, the next push's `map_get_id` returns empty, and fusion POSTs a
second Plane issue — issue `260807-1939`, which is the defect this entire line of work exists to
close, re-entered from the write side. And it is F5's shape verbatim, one commit after `ea492e6`
removed F5's shape from `bin/fusion-count-sources`.

**F2 · Medium · the golden's approval names the wrong cohorts and absorbs 1 749 bytes.**
`260810-0745_o_the-golden-approval-names-the-wrong-cohorts-and-absorbs-1749-bytes-on-the-largest-agent.md`

`2d103be`'s subject is *"approved rather than absorbed"*, and the approval statement is the commit.
Read off the golden it commits:

| Cohort | before | after | delta |
|---|---|---|---|
| 8 base-set agents | 84 495 | 86 646 | +2 151 |
| 5 design-diagram agents | 90 168 | 92 319 | +2 151 |
| playmaker | 93 800 | 95 951 | +2 151 |
| shaper | 99 473 | 101 624 | +2 151 |
| **orchestrator** | **105 008** | **108 908** | **+3 900** |

*"Every agent emitted total by the same 2151"* is false for the orchestrator, because
`workbench-stash-and-lock.md` also grew, 11 208 → 12 957, in commit `b6bbae7`. That 1 749 bytes is
mentioned nowhere. The named cohorts do not exist either: the base set is 8 agents, not twelve;
the 92 319 group is 5 agents carrying `design-diagrams.md`, not three carrying `circle-records`
and `workbench-stash-and-lock`; and three of the five distinct totals never appear in the message
at all.

What is *not* wrong, stated so the finding is scoped: the conventions arithmetic is exact
(2 151 = 670 + 1 481), no threshold was crossed (`RELEASE_CAP` and the budget measure a role's
`RULE_BASELINE` floor, not its current total — the orchestrator has 5 241 bytes of head-room), and
the golden test prints no cleanup report.

### Theme B — The Plane read/write split, in the parts the tests do not reach

**F3 · Medium · `map_view`'s cache and cleanup die in the subshell every caller runs it in.**
`260810-0744_o_map-view-s-cache-and-cleanup-die-in-the-subshell-every-caller-runs-it-in.md`

The sharpest measured finding in the range. `map_get_id`, `map_get_state`, `map_get_origin` and
`map_json` all call `map_view`, and all four are always invoked as `$(…)` — a subshell. Every
variable `map_view` sets dies there, and bash does not run an inherited `EXIT` trap for a
command-substitution subshell. So the fold is recomputed per lookup, a fresh temp file is created
per lookup, and nothing removes any of them.

Measured, one `push --plan --all` against a legacy map with `TMPDIR` pointed at an empty directory:

| Binary | temp files leaked | fold-report lines |
|---|---|---|
| `ff70d3a` | 0 | 0 (it wrote the map instead — that was F2 of Turn 1) |
| `c923935` (HEAD) | **24** | **24** |

Control against an already-folded map: 0 and 0. The mechanism was confirmed independently in a
minimal bash script.

Three consequences: an unbounded temp-file leak in exactly the population `map --migrate` exists
for; a "name each losing UUID once, because that string is the only handle a human has" report
that arrives 24 times; and four `jq` passes over the whole map per lookup where the design intends
one per run. `map_view`'s own header names this hazard at `:682-684` — for the return-value case
only.

**F4 · Low · `push --plan --rebuild-map --fixture` writes the map.** `260810-0746_…`
Reproduced. Contradicts `bin/fusion-plane:104-107`, `:1371-1375`, `map_report_fold`'s stderr line
and `docs/plane-setup.md:187-192`, all four of which state the property unqualified. The `reads
never write` describe covers four spellings and not this one.

**F5 · Low · `push --plan --rebuild-map` without a fixture drops the flag silently.** `260810-0747_…`
Exit 0, map unchanged, nothing on either stream. `map_forget`'s own header, in the same file,
states the opposite doctrine: *"an absent key is a reported failure … never a silent no-op,
because the caller asked for a mutation that did not happen."*

**F6 · Low · the rebuild collision report names a dropped UUID that was kept.** `260810-0748_…`
When one issue appears twice in the response: *"kept UUID-SAME, DROPPED UUID-SAME … close it by
hand."* An operator who follows it closes the live issue. The ordering is fine; the report is not.

**F7 · Low · an unreadable record yields an empty Plane comment.** `260810-0750_…`
`bin/fusion-plane:961`, a masked pipe with no `pipefail`, bypassing the `comment_skip` that exists
for this outcome. `ea492e6` named this site in its own message and closed with *"The first has no
record yet."* It still had none at the end of the Turn, which is the one case
`rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY` forbids without
exception. Reporting it in a commit message is better than swallowing it and is not a substitute.

### Theme C — Records about counting

**F8 · Low · the extension parse guards against nothing, not against less.** `260810-0749_…`
Claim 5's residual, measured above.

**F9 · Low · the record about counting instances of a shape gives three different counts.**
`260810-0751_…`
`260810-0710` opens *"It is the third instance of one shape tonight … read the three together"*,
lists two, and then says *"Both arrived in Turn 1"*. `8d66265`'s message says "second". The count
is the argument, and this session already produced `05c013d`, whose subject is a list that called
itself exhaustive and was missing two. Same failure, sign reversed.

---

## Part 3 — The two things no commit claims

### `agents/orchestrator.md`, now edited six times tonight

Six commits in the session touch it (`2910cf6`, `31d8bb3`, `1f2faaf`, `9bad4d6`, `ff70d3a`,
`3df0c17`), not nine — the nine in the dispatch presumably counts edits within commits. I read the
combined diff plus surrounding context for the two new sites. **No contradiction found**, and
specifically:

- **`3df0c17` did not disturb `9bad4d6`'s drift check.** Its guard is a new `if` wrapping the `REC`
  assignment only (`:856-862`); the four `row` calls, the reading table and the three
  when-any-row-drifts steps are untouched. The `[ -n "$REC" ]` trailing guard at `:868` is the
  pre-existing defect already filed as `260810-0710`; `3df0c17` did not make it worse.
- **`3df0c17` did not disturb `ff70d3a`'s queue ground.** The `Where the ground moves` table row 1
  and the honesty paragraph were both amended in the same commit to match the new behaviour, so
  the table and the code agree. The cross-reference resolves correctly: with the pointer deleted by
  the `rm -f` that follows, a queue whose head names the closed Circle lands in row 2 of the
  reading table (*names a Circle / holds a different one, or is absent → stale*), which is exactly
  what the new prose promises.

Two smaller observations, not filed:

- **Three sites, three failure behaviours, one rule.** Setup Step 5 exits 1; Phase 4 warns and
  skips the move; the drift check warns and skips one row. Each is individually argued, and the
  Phase 4 and drift-check arguments are good ones. But the rule they all cite says *"the run halts
  naming the key"*, and the only site that halts is the Circle count, which the prompt itself calls
  a hint that *"never gates execution"*. The harshest response sits on the least consequential
  site. Worth one sentence in the section, not a fix.
- **"row 2 of the table below"** in Phase 4 is ambiguous — two tables follow, sixty lines away, in
  another section. The intended one gives the right answer, so nothing is wrong today.

### Judging the two deferrals in `8d66265`

**The issue (`260810-0710`) defers honestly, with one understatement worth naming.** It states the
defect precisely, cites the site, explains why an exit code matters more than usual here, names
who found it, and says outright that it was left unfixed deliberately as a different class. That
is the honest form. Two things temper it. First, the fix is one line — the record itself says
*"an explicit `if`, or a trailing `true`, or reordering"* — in a block the same commit was already
editing, so the record cost more than the fix; scope discipline is a real principle and this is the
edge where it stops paying. Second, the record says the executor found it *"while working in the
same file"*. It was working in the **same code block, six lines above the defective line**
(`3df0c17` edits `:856-862`; the defect is `:868`). "Same file" reads as incidental proximity and
understates it. Neither point makes the deferral a dodge.

**The decision (`260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it`)
defers honestly and is the right artefact.** Carrying no recommendation is not evasion here: it
names three options with pros and cons, three constraints, and — the part that makes it a decision
rather than a shrug — the specific dependency that has to resolve first, namely the fate of the
lint cohort, with a stated reason (option 1 is only worth taking if the project can tell a real
gate from a decorative one). `rules/critical-stance.md` §2 explicitly permits "I don't have a
clean answer yet" when what is missing is named. It is.

**Is its reading of my Turn 1 findings fair? Mostly yes, with one tilt.**

Fair: *"Four tasks each added a lint over prompt prose, and the reviewer judged two of them to be
decorative"* maps correctly onto the four prompt-prose lints, with the two being
`state-drift-detection-lint` (F8) and `queue-ground-lint` (F11). The three specifics it cites — the
anchor on the phrase it checks, the negative control that is a renamed duplicate, the two controls
that re-implement the logic — are all mine and all quoted accurately. The commit message's shorter
version is worse: both of its two examples come from the same lint (`state-drift`) while being
presented as two. The decision record fixes that by adding the third.

The tilt: *"tonight it produced four and got two right."* That counts `domain-cascade-order-lint`
among the two it got right. I rated it **"half a gate"** and filed `260810-0503` because an
unsatisfiable decoy branch defeats `firstIndex` outright and its second helper has no negative
control at all. Counting it as right is the more generous of the two readings available. It does
not change the decision's argument — the argument only needs "this project can produce decorative
checks at speed", which stands — but the score is 4 produced, 1 clean, 1 with an overstated fixture
claim, 1 half, 1 decorative, plus two genuinely executable non-prose gates that were never in
dispute.

---

## Cross-cutting observations

**1. The pattern is now six instances, and it survived being written down.** Turn 1 named four
cases of a rule applied outward and broken inward. Turn 2 adds two, both inside the commit that was
closing the class: `c923935` re-entering "an operation that failed must not claim it succeeded"
(F1), and `2d103be` absorbing bytes in the commit whose subject is "approved rather than absorbed"
(F2). The Turn's own decision record says the question is not whether the rule was clear. This is
the evidence for that reading: two authors who had just read the finding they were fixing broke its
sibling in the same commit.

**2. The strongest test in the range is the one that runs the prompt.** `queue-retirement-empty-key.test.ts`
extracts the orchestrator's own bash, runs it against four throwaway workbenches, and drives the
pre-fix text from git through the identical path to show the scenario reaches the defect. That is
the shape Turn 1's cross-cutting note 3 pointed at, arrived at within one Turn. It is worth naming
as the template the open lint-cohort decision should measure against.

**3. Where the tests stop is where the findings are.** Every finding in Theme B sits in a spelling
the new tests do not cover: `--plan --rebuild-map --fixture` is absent from the four-label
`reads never write` loop; the temp-file leak is invisible to assertions that use `toContain` on
stderr and never count; and `map_put`'s failure path has no test at all because no test makes a
write fail. The suite is green and the coverage is real; the gaps are one step past the property
each test was written to prove.

**4. Two long-lived Turn 1 findings were sequenced past, and one of them correctly.** `260810-0504`
(where the tracked-workbench section lives) is still open while the golden it would change was
regenerated — a deliberate reversal of my Turn 1 sequencing, argued in the commit on the ground
that a red suite across a session boundary is worse than a second fixture diff. I agree with the
reversal. `260810-0507` (`docs/plane-setup.md` documenting the marker-bearing key) sat untouched in
a commit that edited 40 lines of that same file, which is a cheaper miss.

---

## Recommended sequencing

**Before any release or tag**

1. **F1** (`260810-0743`) — `map_put`. One line. It is the only finding here whose failure mode is
   a second Plane issue created against a human's board, and it defeats four already-written error
   branches.
2. **F3** (`260810-0744`) — the `map_view` leak. It has a real resource cost today on any workbench
   with a legacy map, and it drowns the report that is the operator's only handle on a dropped UUID.
3. **F2** (`260810-0745`) — restate the golden approval. Cheap, and it is the record a future
   reader will use to answer "what did this cost and who approved it".

**Next Turn**

4. F4 + F5 (`260810-0746`, `-0747`) together — one decision about what `--plan` means when combined
   with `--rebuild-map` settles both.
5. F7 (`260810-0750`) — and name the two `[ -f ]`-guarded pointer reads `ea492e6` mentioned while
   the executor's context still exists.
6. F8 (`260810-0749`) — before the next language is added to `CODE_EXT`.

**Cleanup**

7. F6 (`260810-0748`), F9 (`260810-0751`).

**Still open from Turn 1 and untouched by this Turn:** `260810-0458` (F4, the natural key's two
derivations — pair it with whichever plane fix lands first), `-0501`, `-0502`, `-0503`, `-0504`,
`-0505`, `-0506`, `-0507`, `-0508`, `-0509`, `-0510`, `-0511`. Turn 1's own sequencing still
applies to them.
