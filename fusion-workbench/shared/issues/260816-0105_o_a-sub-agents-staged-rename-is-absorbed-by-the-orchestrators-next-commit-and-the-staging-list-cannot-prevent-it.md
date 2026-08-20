A sub-agent's staged rename is absorbed by the orchestrator's next commit, and the staging list cannot prevent it

---
Sub-agents that use `git mv` to move a record's state marker leave the rename **staged in the
index**. The orchestrator's next `git commit -F <msg>` then carries it, because `git commit`
commits the whole index rather than the paths the orchestrator named. The Step 3b staging-list
shape — every path written out in full — makes over-staging impossible on the *orchestrator's*
side and does nothing about this, because the extra content never passes through the
orchestrator's `git add` at all.

---

**Measured, in session 260815-2147, commit `a19c867`.** That commit's staging list named
`bin/monitor`, one test file, three issue renames and two history files. Its actual contents
carry two further renames it never mentions, each showing `| 0` changed lines:

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_*_setups-resume-summary-still-asks-for-diverging-rows-that-no-step-produces.md`,
  renamed `_o_` → `_c_` (from the setup/migrate task)
- `shared/issues/260815-2328_*_the-net-negative-breakers-two-counters-cover-different-populations-and-both-are-the-untrusted-pair.md`,
  renamed `_o_` → `_c_` (from the breaker-populations task)

Both rename entries are in `git show --stat a19c867`, which is where the old and new filenames
stand verbatim.

Both belong to this session and both are legitimate closures, so nothing is *wrong* in the tree.
What is wrong is the attribution: two records closed under a commit message about the monitor,
and the commits that should have carried them — written and dispatched separately — found their
paths already gone and failed with `pathspec … did not match any files`.

**How the two arrived.** The breaker task disclosed it outright: "the issue rename used `git mv`,
which stages it. I issued no `git add` or `git commit`; the staged rename is yours to carry into
the commit." That is a correct and honest report, and it still produced the defect, because the
orchestrator's commits are sequential and the *next* one absorbed it rather than the intended one.
Three other executors in the same session used `git mv` and then explicitly unstaged, one of them
under the commit lock — so the behaviour is already known to be a hazard and the mitigation is
folklore passed between prompts rather than a rule.

**Why this is not the commit lock's job.** The lock serialises `add`+`commit` against *parallel
committers*. Here the stager is a sub-agent that returned minutes earlier and holds no lock, and
the absorber is the orchestrator's own next commit. Serialisation cannot help: the index already
carries the content when the lock is acquired.

**Candidate fixes, not decided here.**

1. **The orchestrator commits with a pathspec** — `git commit -F <msg> -- <paths>`, or checks
   `git diff --cached --name-only` against its own staging list before committing and stops on a
   surplus. Cheapest, and it puts the guarantee where the staging list already lives.
2. **Sub-agents are told never to leave the index dirty** — either use plain `mv` rather than
   `git mv`, or unstage afterwards. Three of five executors did this unprompted, so the rule is
   already half-established; writing it down costs a line in each executor prompt. Weaker, because
   it is an obligation on a party that has already returned when the damage lands.
3. **Both.** The rule states the intent; the pathspec enforces it.

Option 1 alone is sufficient and needs no executor-prompt change, which argues for it over 3.

**Cross-references:**

- `agents/orchestrator.md` Step 3b step 4 (the staging-list shape) and step 5 (the commit command)
- `rules/commit-lock.md` (why serialisation does not reach this)
- `shared/issues/260811-0114_*` (the staging-drift check, which reports records *no* commit carries
  and is silent about records the *wrong* commit carries)

Also seen: 260817-1613 by reconciler — recurred in session 260816-1841, commit `dbbad70`, and was filed a second time as `circles/260816-1741-guard-becomes-observation-only/issues/260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md` without this record being found first. That record carries the newer measurement (six renames in one commit, four of them unnamed by its message, plus two unstaged annotation blocks absorbed with them) and a three-option remedy; this one carries the original 260815-2147 measurement. **They are one defect and want merging.**

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:542` still commits with no pathspec and no surplus check over `git diff --cached --name-only`. The record-s own trailer records a recurrence in session 260816-1841 at commit `dbbad70`, filed separately under the guard Circle-s issue store, so the failure is reproducing rather than dormant. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
