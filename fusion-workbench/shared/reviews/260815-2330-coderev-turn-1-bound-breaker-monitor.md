# Code review — Turn 1: the hook-test bound, the net-negative breaker, the monitor

**Sender:** coderev
**Stamp:** 260815-2330
**Reviewed-range:** `d33cd22..f4f01b0`
**Not-opened:** none

## A note on the declared range

The dispatch named the range as `d33cd22..HEAD` and enumerated four commits. `HEAD` had already
moved by the time this review ran — `4f7508d` ("eighteen defect records close because their subject
was deleted or already fixed") landed from a concurrent task at 23:2x. The range above is the four
commits as resolved short hashes, which is what the header mandate requires and what
`bin/fusion-review-coverage` can tile. **`4f7508d` is not covered by this review.** It reached
`bin/fusion-review-coverage`'s uncovered list while this pass was in progress; whoever dispatches
the next review should carry it.

Two files in the working tree carried uncommitted concurrent edits throughout
(`rules/fusion-workbench-conventions.md`, `skills/setup/SKILL.md`). Every measurement below was
taken in a detached `git worktree` at `f4f01b0`, never in the shared tree, so none of it is
contaminated by that.

## Summary

All three code changes do what they claim, and each was verified by execution rather than by
reading. The full hook suite is green at the range head — 40 files, 751 tests, exit 0 — and the
`hook-tests` surface measures 19 453 lines, the figure at the arming, so no baseline moved. What the
pass found is not a broken change but four places where the *reason written down beside* a change is
weaker than the change: a fallback path that quietly restores the defect it stands in for, a
narrowing that may not see the one process it exists to clear, a comparison whose two sides still
disagree, and a comment that misstates the runner it appeals to.

## Totals

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 1 |

Four issues filed, all in `shared/issues/` (no Circle is active, so the Origin Rule places them
there):

- `260815-2325_o_the-monitors-ipv4-fallback-reinstates-the-defect-the-dual-stack-bind-removed-and-says-nothing.md`
- `260815-2326_o_the-monitors-listen-only-port-clearing-cannot-see-the-stale-listener-the-same-file-documents-on-macos.md`
- `260815-2327_o_no-test-exercises-the-monitors-wildcard-bind-and-the-residual-is-recorded-only-in-a-closed-record.md`
- `260815-2328_o_the-net-negative-breakers-two-counters-cover-different-populations-and-both-are-the-untrusted-pair.md`
- `260815-2329_o_the-growth-bound-walks-comment-misstates-what-vitest-runs-and-the-fixtures-question-was-left-to-the-filter.md`

(Five files; `2328` carries the Medium breaker finding with the Low example finding folded in as its
part 2, because both are fixed in one pass over the same twenty lines of `agents/orchestrator.md`
and two queue entries there would be churn.)

## What was verified, claim by claim

The dispatch asked for the claims to be tested rather than read. They were.

### 1. The growth bound's file walk — the claim holds

`hooks/lib/__tests__/surface-growth-bound.test.ts:341-350`.

- **Reaches every depth:** yes. Two probes added under `lib/__tests__/unit/` in a worktree at
  `f4f01b0` both appear in the golden diff (`unit/probe.test.ts 2`, `unit/probe.ts 1`, total
  19 456). The old reader saw neither.
- **Figure unchanged today:** yes. Without probes the surface measures 19 453 and the `hook-tests`
  golden block matches byte for byte. Only the `agents` block moved in the range, by one byte, from
  `3c0e7da`.
- **`.ts` filter:** correct as far as it goes. No `.d.ts` exists anywhere under `__tests__/`, so the
  question of excluding them is hypothetical; `readdirSync(here, { recursive: true })` returns
  directory entries too and the filter drops them. Node ≥ 20.12 is declared in
  `hooks/package.json`, and `recursive: true` needs ≥ 18.17, so the requirement is satisfied.
- **Sort order and baseline keys:** unchanged. Both the old and the new form sort the combined
  relative paths, and the recursive walk produces `helpers/x.ts` — the same key the old
  `join("helpers", f)` produced. That is why no baseline needed touching.
- **Line-neutrality bought at the cost of clarity?** No. The nine-in-nine-out constraint is real
  (this file is on its own bounded surface, recorded at 576 lines) and the replacement is *shorter*
  in code — five lines of expression against seven — with four lines of comment added. The
  expression is clearer than what it replaced.

The one thing wrong is in those four comment lines, and it is filed as `260815-2329`: they say
vitest's include means "a `.ts` file at ANY depth under `__tests__/` runs". `hooks/vitest.config.mjs`
declares no `include`, so the default `**/*.{test,spec}.?(c|m)[jt]s?(x)` applies. Measured:
`npx vitest list` collects `unit/probe.test.ts` and does not collect `unit/probe.ts`. The source
record `260815-1935` stated this correctly; the fix's comment restated it wrongly. It matters
because that comment is where the next reader will look for the criterion that settles whether
`fixtures/` belongs in the walk — the one question the source record asked to be answered
deliberately, and which the resolution note acknowledges was decided by the filter instead.

### 2. The net-negative circuit breaker — the third edit is where the argument thins

`agents/orchestrator.md:619`, `:635`, `:642`.

The dispatch was right that the third edit is where a reviewer finds something, though not quite the
something it expected. The rewritten example still satisfies none of the six exits, so its
conclusion stands. Two steps in the middle got weaker:

- The example no longer names a task resolution, and the Zero-progress row (`:620`, restated at
  `:637`) is stated in `tasks_resolved`. A reader checking that row against the example has to
  supply the missing half.
- "leaves the queue no shorter" is a claim about queue **entries**, and the example only moves
  issues — resting exactly on the 1:1 issue-to-task mapping this commit's own premise denies.

The larger finding is upstream of the example. `:952` defines `issues_created` as issues filed *by
reviewers during incremental review*; `:953` defines `issues_resolved` as issues resolved during
execution, unrestricted. Same unit, different population. A Turn where the coder files five defects
itself and resolves one reads `0 > 1`, false — the mirror of the bias the fix removed. And `:960`
names both counters among the four the prompt declares untrusted, which makes this the only control
decision in the file running entirely on the distrusted pair. All of it is `260815-2328`.

Coverage of the "any third statement" check was re-run independently and is sound: `issues_created`
appears in `agents/`, `skills/`, `rules/`, `docs/` and the READMEs only at `:619`, `:635`, `:952`
and `:960`.

### 3. The monitor — the largest change, and it works

`bin/monitor`. All three fixes were reproduced on macOS 24.6.0 against `f4f01b0`.

- **Dual-stack bind.** Default spawn gives `TCP *:18477 (LISTEN)` on an IPv6 socket; `curl --ipv4`
  and `curl --ipv6` against `http://localhost:18477/` both return 200. The socket option is set at
  the right point: `DualStackServer.server_bind()` clears `IPV6_V6ONLY`, then delegates to
  `ReuseServer.server_bind()` (`SO_REUSEADDR`, `SO_REUSEPORT`), which delegates to
  `TCPServer.server_bind()` (`bind()`). `IPV6_V6ONLY` before `bind()` is the required order.
  `HTTPServer.server_bind` slices `self.server_address[:2]`, so the AF_INET6 four-tuple is handled.
  On construction failure `TCPServer.__init__` calls `server_close()` before re-raising, so the
  fallback does not leak a descriptor.
- **Fallback.** Reached and working. Forced by replacing `socket.IPV6_V6ONLY` with an invalid option
  number in a copy of the script: the IPv4 server binds (`TCP *:18479 (LISTEN)`, IPv4) and serves.
  **But the banner still prints `http://localhost:18479` and `curl --ipv6 localhost` then returns
  nothing** — the fallback restores the original defect with no diagnostic. Filed as `260815-2325`,
  including the constraint that the browser launcher lives in the bash wrapper (`:1386`) and has no
  channel from the python process, so a banner-only fix leaves the tab wrong.
- **`-sTCP:LISTEN`.** Correct for its purpose and verified end to end: with a client in `CLOSE_WAIT`
  on the port, `lsof -ti :PORT` returned both PIDs and `-sTCP:LISTEN` returned the server alone;
  starting a second monitor cleared the prior listener and left the client alive. The dispatch asked
  whether the narrowing can still miss a stale listener it ought to clear, and there is one candidate
  — `bin/monitor:1263-1266` states that macOS parks a **non-loopback** listener of a process without
  Local Network permission in `CLOSED`, never `LISTEN`, and the default bind is non-loopback. That
  case is inference, not reproduction (this machine's wildcard listener shows `LISTEN`), and it is
  filed with the label attached as `260815-2326`.
- **Line buffering.** Verified: 297 bytes in a redirected log 2.5 s after start, matching the
  record's measurement, with the guard against `AttributeError`/`OSError` correct.

One narrower inconsistency, noted in `260815-2325` rather than filed alone: the `except OSError` on
the fallback is narrower than the same file's own precedent forty lines up, where the `SO_REUSEPORT`
setsockopt catches `(AttributeError, OSError)`. A platform whose `socket` module lacks
`IPV6_V6ONLY` — or `AF_INET6`, which is read at class-definition time — raises `AttributeError` and
takes down the monitor instead of falling back. The named platform (OpenBSD) does raise `OSError`
and is covered; the unnamed one is not.

### 4. The untested wildcard bind — the executor's open flag is correct, and worth filing

Confirmed against the harness rather than taken on trust:
`hooks/lib/__tests__/monitor-warnings-panel.test.ts:277` sets `MONITOR_BIND: "127.0.0.1"` on the one
spawn helper every case uses, and every fetch (`:306`, `:332`, `:339`, `:847`, `:892`) names a
literal address. `:874` is the only mention of `localhost` and it is a string comparison on the URL
handed to the browser launcher, not a request. So the whole `WILDCARD_BINDS` branch is executed by
no test.

Filed as `260815-2327`. The filing reason is not that the executor failed to notice — it noticed
precisely — but that the observation was written into the final paragraph of a record it then closed
(`260812-0253_c_…`), where no scan for open work will return it. The record also names the
constraint that makes the missing test hard: `bin/monitor:1263-1266`'s macOS claim, which is the
same claim `260815-2326` asks to be confirmed or deleted. Those two should be worked in that order.

## Cross-cutting observations

**One claim, unverified, is now load-bearing in three places.** `bin/monitor:1263-1266`'s statement
about macOS parking non-loopback listeners in `CLOSED` is the reason the test harness pins
`MONITOR_BIND=127.0.0.1`, the reason a wildcard-bind test may be impossible to write, and the reason
the narrowed port-clearing may miss a stale monitor. Nothing anywhere confirms it — it is a comment,
citing no record and no measurement. Three findings in this review point back at it, which makes
answering it the highest-leverage single act available: confirm it and two findings are constrained
by a real platform fact, refute it and one of them evaporates while another becomes easy.

**The pattern across all three commits is the same, and it is the mild one.** Each change is
correct; each carries an explanation that is slightly stronger than what was established. The growth
bound's comment appeals to a runner behaviour that is not what the runner does. The breaker's commit
message says "compares like with like" of two counters that match in unit and not in population.
The monitor's fallback comment says "identical to today", where today is the state the record was
filed against. None of these is a defect in shipped behaviour. All of them are the kind of sentence
a future reader will reason from.

**The executors' own verification reports were unusually good, and their one systematic gap is the
same.** All three isolated their suite runs in detached worktrees rather than asserting past the
concurrent edits in the shared tree, and all three said what they had not established. The gap is
what happens to a named residual: two of the three wrote it into a record they then marked `_c_`.
A residual in a closed record is invisible to the next queue build. Worth a convention rather than
three more findings — this review turned one of them back into an open record, and the other
(`260815-1935`'s two latent surface readers, `agents/` non-recursive and `skills/` SKILL.md-only) is
carried forward in `260815-2329`'s closing section rather than filed, since neither is exploitable
at HEAD.

**No growth bound is threatened by any of these fixes.** `bin/monitor` is on no bounded surface.
`hooks/lib/__tests__/surface-growth-bound.test.ts` is, and `260815-2329`'s fix is a comment
correction that can be written line-neutral. `agents/orchestrator.md` is, and `260815-2328`'s three
parts total well under 200 bytes against 18 000 B of head-room measured at `d33cd22`.

## Recommended sequencing

Nothing here blocks a release. Ordered by what unblocks what:

1. **`260815-2326`** — first, because it is a question, not a fix, and its answer constrains the
   next item. One measurement on a macOS host without Local Network permission, or the deletion of
   an unfounded comment.
2. **`260815-2325`** — the fallback's silent regression. Independent of everything else; the fix is
   local except for the one real design choice about who owns the launched URL.
3. **`260815-2327`** — the missing test. Write it after 1 is answered, or the case may be unwritable
   or flaky on the machines it matters on.
4. **`260815-2328`** — the breaker. Cleanup, but do all three parts in one pass; the counter
   definitions and the worked example are the same twenty lines.
5. **`260815-2329`** — the comment correction. Cheapest, and the one most likely to be skipped;
   it costs nothing and it prevents the next reader inheriting a wrong criterion.

`4f7508d` is uncovered and outside this range. It should be carried into the next review's scope.
