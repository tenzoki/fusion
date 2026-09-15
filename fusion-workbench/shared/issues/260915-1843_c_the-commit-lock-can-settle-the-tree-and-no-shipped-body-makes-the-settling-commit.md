The commit lock can settle the tree and no shipped body makes the settling commit

---
`8d4bbe07` makes a log-only commit emit no row, so one further commit after a session's
splits leaves the tree clean. Nothing shipped makes that commit, and the one body whose
push is gated on a clean tree was not changed in the same step.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Where it stands.** `skills/cleanup/SKILL.md` Step 1 reads `git status --short` once, before
any commit. Step 2 commits the splits derived from that reading; each split's
`emit_commit_event` appends a row to `fusion-workbench/orchestrator-events.jsonl`, so the log
is modified again after the last split. Step 3 then reads: "When the working tree is clean and
`--no-push` was not given: plain `git push`." Its stated precondition is false at that point in
every run that committed anything, and no step between 2 and 3 re-reads the tree or commits the
log that the splits dirtied.

**What that costs.** The push is the body's own last action and its guard no longer holds, so
whether the session pushes is left to the model's reading of "clean" rather than decided by the
body. `rules/commit-lock.md` `### The lock writes the commit event` now states "one further
commit settles it" and "a loop that commits until clean terminates"; no shipped consumer is that
loop, so the sentence describes a capability with no caller.

**Evidence that the manual commit is the current practice.** `6f744b15` in this same range is a
hand-made log-only commit titled "chore(events): the session's closing rows", filed by the
previous session because nothing made it automatically. The working tree of this checkout at
`1401a71d` carries ` M fusion-workbench/orchestrator-events.jsonl` for the same reason.

**Scope.** `skills/cleanup/SKILL.md` Step 2 and Step 3. `skills/commit/SKILL.md` has the same
shape but no push gate, so it is the weaker case.

**Acceptance test.** In a fixture project with a tracked workbench: run the cleanup body's commit
sequence over a dirty tree containing one code file, then assert `git status --porcelain` is
empty before the push step is reached, and assert that the settling commit carries
`fusion-workbench/orchestrator-events.jsonl` and nothing else.

**Cross-references:** `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`

Resolved: both bodies now make the settling commit. `skills/cleanup/SKILL.md` `## Step 2 — Commit
in meaningful splits` ends with a column-0 paragraph that runs once after the split loop, not per
split: it stages `fusion-workbench/orchestrator-events.jsonl` alone, by absolute path, in its own
`with cleanup --` acquisition, and cites `rules/commit-lock.md` `### The lock writes the commit
event` for why that region emits no row. `skills/commit/SKILL.md` `### 6. Stage and commit as one
held pair` carries the same paragraph in a second `with commit --` acquisition.

`## Step 3 — Push` no longer names a clean tree. The condition it named was unreachable for a
reason that has nothing to do with the event log — `fusion-workbench/.fusion-setup` and this
checkout's `shared/checkouts/<id>.md` are machine-written live state that `hooks/lib/staging-drift.ts`
classifies as `in-flight` and no split names — so the gate was reworded rather than dropped, to what
the body can actually establish: every split committed and the log was settled above. The reference
is `rules/workbench-tracking.md`. A rejected push keeps its handling in the first guardrail, which
is stated as holding on every run.

Acceptance test run as the record states it, in a throwaway repository with a tracked workbench,
one modified code file and `FUSION_SESSION_ID` exported. After the code split the tree carried
` M fusion-workbench/orchestrator-events.jsonl`; after the settling commit `git status --porcelain`
was empty before the push step, `git show --name-only --format= HEAD` listed the event log and
nothing else, and the log held exactly one row — the code commit's. The settling commit emitted
none, which is the property this fix depends on.

The bytes were funded inside `skills/`, the surface having 95 bytes of margin: the two worked
commit-message examples in `/fusion:commit` (step 4 already fixes the format, and the second
example's bullet body contradicted its own "a few sentences at most"), the `style` type that
`/fusion:cleanup`'s type set does not carry, two Safety bullets that were dead (this body never
pushes, and step 5 already mandates the approval), `/fusion:cleanup`'s `## Notes for the assistant`
(both bullets restated the Guardrails and the opening), and the negative list in the opening
paragraph that the sentence after it already states as command names. No baseline and no head-room
constant moved; the surface stands at 56 bytes of margin.
