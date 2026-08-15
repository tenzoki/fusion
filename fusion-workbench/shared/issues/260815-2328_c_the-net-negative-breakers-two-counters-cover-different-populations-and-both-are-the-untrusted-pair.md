The net-negative breaker's two counters cover different populations, and both are the untrusted pair

---
`3c0e7da` changed the Net-negative progress circuit breaker from `issues_created > tasks_resolved`
to `issues_created > issues_resolved`, on the ground that the originals were counted in different
units. The new pair is in the same unit but not over the same population: `agents/orchestrator.md:952`
defines `issues_created` as "issues filed **by reviewers during incremental review**", while `:953`
defines `issues_resolved` as "issues resolved **during execution**", unrestricted. A Turn in which
the coder files five defects itself and resolves one reads `0 > 1`, false — the breaker is blind to
every issue no reviewer filed. Separately, `:960` names both of these counters among the four the
prompt explicitly does not trust; the breaker is now the only control decision in the file that
runs entirely on them.

---
**Severity:** Medium. The old comparison fired too often; this one can fail to fire at all on a
whole class of divergence, and nothing in the prompt says the breaker is allowed to read a
hand-kept count for a control decision.

**Where.** All in `agents/orchestrator.md`:

| Line | Text |
|---|---|
| `:619` | `Net-negative progress \| 2 consecutive Turns where `issues_created > issues_resolved`` |
| `:635` | `Net-negative progress \| `issues_created > issues_resolved`, twice running` |
| `:952` | `` `issues_created` — issues filed by reviewers during incremental review `` |
| `:953` | `` `issues_resolved` — issues resolved during execution `` |
| `:960` | "The four record counters above — `issues_created`, `issues_resolved`, `decisions_answered`, `decisions_implemented` — are the ones **not** trusted to the tally at Phase 4." |
| `:642` | The worked example, see part 2 below |

**Part 1 — the population asymmetry.** The numerator is scoped to one producer (reviewers) and one
moment (Step 3c incremental review). The denominator is scoped to neither. Issues also arrive from
`coder` and `bugfixer` during execution, from `analyst` findings, and from the user, and none of
them increments `issues_created` under the definition as written. So the comparison is
systematically biased toward *not* tripping, which is the mirror of the defect `260814-1430` fixed.
The commit message's "compares like with like" holds for the unit and not for the population.

Whichever way it is resolved, resolve it in the **definitions**, not by a third rewrite of the
comparison: either `:952` widens to "issues filed this Turn, by any agent" — which is what a
divergence metric wants — or the asymmetry is stated at `:619` as deliberate, with the reason. It
should not stay silent, because the two definitions are nine hundred lines from the rows that read
them and the mismatch is invisible at either end.

**Part 2 — the worked example at `:642` no longer states the quantity two of the six exits are
counted in.** The sentence was rewritten in the same commit, and had to be:

> A Turn that closes one issue and files another satisfies none of them and leaves the queue no
> shorter, so a session in that steady state runs forever.

It does satisfy none of the six exits, so the sentence's conclusion stands. Two problems with how it
gets there:

- The Zero-progress row (`:620`) is stated as "resolves 0 tasks AND creates 0 issues", and the
  contingency table at `:637` restates it as "both counts at zero". The example says nothing about
  tasks, so a reader checking that row against the example has to supply the missing half. The
  previous wording ("resolves one task and files one issue") named it.
- "leaves the queue no shorter" is a claim about **queue entries**. The example only moves issues,
  and this very commit's premise is that one queue entry can close several issues. So the clause
  now depends on the 1:1 issue-to-task mapping the commit's own reasoning denies.

The fix is a few words, not a restructure: name the task resolution alongside the issue closure —
e.g. "A Turn that resolves one task, closing one issue, and files another". That satisfies none of
the six exits, is checkable against the Zero-progress row from its own text, and restores the
queue-length claim to something the queue is actually counted in.

**Part 3 — trust, recorded rather than proposed.** `:960` permits keeping these counters "if they
help you narrate a Turn" and rules them out for the Phase-4 budget table and the user report,
because a hand-kept count was measured drifting by two in each direction
(`260810-1205`). A circuit breaker is neither narration nor reporting; the prompt gives no ruling
for the third case. A drift of one flips a comparison whose threshold is a zero difference. This is
not necessarily a defect — the Phase-4 remedy (compute the counts off the stores) is expensive to
run per Turn — but it is an unstated position, and whoever fixes part 1 will have to take it. If it
resolves to "the breaker reads the tally and that is accepted", say so at `:619`.

**Budget note.** `agents/` is a growth-bounded surface. Parts 1 and 2 together are well under a
hundred bytes; part 3, if it becomes a sentence at `:619`, adds perhaps a hundred more. Head-room at
`d33cd22` was measured at 18 000 B, and `3c0e7da` was a net shrink of one byte, so none of this is
near the bound.

**Found by:** coderev, review of `d33cd22..f4f01b0`, commit `3c0e7da`.

---

**Resolved:** 260816-0050, `coder`, in `agents/orchestrator.md` (+544 B).

**Part 1 — populations aligned, residual stated rather than closed.** `:952`/`:953` now read
"issues filed this session by **any** agent or the user, not only by reviewers at Step 3c" and
"issues resolved this session by **any** agent". The record's first option was taken: widen the
numerator, because a divergence metric wants every filing, and the asymmetry had no defence to
state.

**Part 3 — taken, not deferred.** The definition edit was judged *necessary but not sufficient*,
so the accepted position is written where the row is read, after the circuit-breaker table:
Net-negative is the one control decision reading the untrusted pair, per-Turn derivation would
cost the Phase-4 store read on every Turn and is not paid, and the row is therefore a divergence
signal rather than a measurement. Deriving the inputs was *not* chosen — see the note below on why
that fix is larger than it looks.

**Why derivation was not the fix.** The Phase-4 block (`:741-765`) is anchored at
`session.git_head_at_start`, so it yields session-cumulative counts. The breaker needs a per-Turn
delta ("2 consecutive Turns where"), which would need a second derivation anchored at
`control.turn_start_head` — a new ~20-line block running every Turn, not a definition edit. That is
a design change with its own cost, and it belongs in a decision record rather than in a review
fix.

**Part 2 — the example now clears each exit in that exit's own units.** `:642` reads "A Turn that
resolves one task — closing one issue — and files another that enters the queue satisfies none of
them: no error, no halt, work still runnable, and one entry off the queue for one on." Net-negative
`1 > 1` false; Zero-progress checkable from the example's own text in tasks *and* issues; Error
cascade and Guard halt named; All-blocked named; the queue-length claim now counted in queue
entries rather than resting on a 1:1 issue-to-task mapping.

**Residual, filed here rather than silently fixed.** The counters are session-cumulative
("maintained throughout the session") while the Net-negative row reads them as a per-Turn
comparison and the Zero-progress row reads them as per-Turn deltas outright. That ambiguity
predates `3c0e7da`, is not what this record raises, and was left untouched.

**Verification:** `cd hooks && npm test` — exit 1, sole failure
`surface-growth-bound.test.ts > matches the checked-in golden` (the per-file byte inventory, stale
by design and excluded from this task's scope); 750/751 pass. Run in a detached worktree carrying
only this patch. The `agents` growth bound itself did not trip.
