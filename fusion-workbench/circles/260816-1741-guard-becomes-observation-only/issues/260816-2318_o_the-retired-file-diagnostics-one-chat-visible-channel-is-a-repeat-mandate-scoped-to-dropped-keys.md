The retired-file diagnostic's one chat-visible channel is a repeat mandate scoped to dropped keys, and a retired file is not a drop

---

**The migration text itself is correct and sufficient.** Verified end to end against a scratch
consuming project (a workbench marker, `fusion-guard.json` carrying
`{"orchestrator":{"maxTurns":12}}`, no `fusion.json`):

```
A. old file only        -> stderr: "…fusion-guard.json is no longer read — … copy
                           {"orchestrator": {"maxTurns": <n>}} into fusion.json first …
                           Then delete this file to stop this advisory."
                           stdout: max_turns=5
                           guard on Edit: one guard_advisory carrying the same text, one guard_allow
B. budget copied across -> max_turns=12, advisory still naming the leftover file
C. old file deleted     -> max_turns=12, no advisory
```

A project acting on that sentence alone completes the migration and keeps its budget. The text
names the key, the destination, and the order, and the order is the load-bearing half.

**What is not settled is who reads it.** `guard_advisory` has exactly one consumer in the whole
tree: `bin/monitor`'s warnings panel (`bin/monitor:172`, `:180`, `:597`). Nothing in any agent
prompt or skill body reads `.guard-state/events.jsonl`. So the per-guarded-call channel — the one
the user's option 1 was chosen for, on the ground that it "runs on every guarded tool call while
Setup runs once per session and only for a project that runs Setup at all"
(`hooks/lib/config.ts:105-114`) — delivers into a JSONL file that a human sees only by opening the
dashboard.

The one channel that puts the text in front of a user *in chat* is `bin/fusion-turn-budget`'s
stderr at Setup, and the mandate that repeats it is `agents/orchestrator.md:132`:

> It prints one line, `max_turns=<n>`, and puts on stderr **anything the configuration loader had
> to drop** — a budget that is not a whole number of 1 or more is dropped, named, and inherits the
> default. **Repeat any such line to the user in the Setup-complete summary.** A project that
> declared a budget of zero and was silently handed the default has a setting it believes is in
> force and is not.

"Any such line" has one stated antecedent and the em-dash clause narrows it to bad-budget values.
A retired file is not a drop — nothing was dropped, the file was never read — so under a literal
reading the migration notice is the one stderr line the orchestrator is not told to repeat. The
closing sentence describes the bad-budget case only, which is the weaker of the two losses it now
has to cover: a project that declared 12 and gets 5 is exactly the failure the whole channel
exists to prevent, and it is the case the mandate does not name.

`skills/setup/SKILL.md:292` delegates the whole block to this section and adds only "Report the
value, or the fact that it did not resolve and why", so it inherits the same scope.

**No step owns the line.** Step 11's entry for `agents/orchestrator.md` names `:122` *(filename)*,
`:150`, `:626` and `:644`. `:132` is not among them, and `turn-budget-lint.test.ts` pins the call
and the `[ -x ]` guard (`:194-207`) but nothing about repeating stderr.

**Two fixes, one decision.** Either widen `:132` so its antecedent is "anything on stderr" and name
the retired file among the cases (cheapest, and it is one sentence in a file step 11 already
opens), or give the advisory a second consumer that a session cannot miss. The first is enough if
the answer to "does a project that never runs Setup need to hear this?" is *no* — and it may well
be, because the budget is read only at Setup, so a project that never runs Setup loses nothing by
not hearing about it. That question is not recorded anywhere and is worth recording with the fix.

**Severity:** Medium.

**Scope:** `agents/orchestrator.md`, shipped to every consuming project.

**Cross-references:**
- `hooks/lib/config.ts:105-114`, `:324-327` (the diagnostic and the argument for the channel)
- `hooks/turn-budget.ts:92-94` (the stderr write)
- `circles/260816-1741-guard-becomes-observation-only/decisions/260816-1916_a_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`
