The resume shell is two independent copies and nothing holds them identical

---

The five-line block that derives the commit and Turn counts at an interrupted-session resume exists
twice — `agents/orchestrator.md:88-93` and `skills/setup/SKILL.md:248-252` — with no shared owner
and no gate. Closing `260815-1631_c_the-resume-shell-…` fixed both copies identically; it did not
give them a reason to stay that way.

---

## Context

This is the Cross-cutting paragraph of `260815-1631`, carried forward rather than closed with the
two output faults it sat beside:

> The block exists twice, in two files, with no shared owner. That is the duplication class decision
> `260810-2145` created `bin/fusion-source-root` to end after a correction to one of four copies
> reached two and left two standing. A fix applied to one copy here will drift from the other in
> exactly the same way.

The two copies are **not** byte-identical even now, and were not before: the orchestrator writes
`fusion-workbench/agentstate.yaml`, the skill writes `./fusion-workbench/agentstate.yaml`. Each is
right in its own file's convention and both resolve to the same path, so the difference is inert —
but it means "diff the two blocks" is not, today, a check that can be written in one line.

Three options, none of them free:

1. **A helper both prompts call.** Ends the duplication the way `bin/fusion-source-root` ended its
   four copies. Costs a thirteenth entry in `bin/`, its `!bin/` line in `.gitignore`, and a Layout
   row in `CLAUDE.md` that `derivable-enumerations-lint` asserts in both directions — for five lines
   of shell. The record itself flags this as possibly "too heavy for four lines".
2. **A lint pinning the two fenced blocks equal** after normalising the leading `./`, in the shape
   of `glob-nomatch-lint.test.ts` (a narrow, single-idiom gate over fenced shell in prompts). Cheaper
   than a helper and it closes the class rather than the instance, but it is a fortieth test file in
   a Circle whose Directive is to cap growth.
3. **Accept two copies** and say so in both prompts, which is what the corpus does today by silence.

## Why it is filed rather than decided

Choosing between them is a design call about how much mechanism five lines of shell are worth, in
the one Circle that is explicitly removing mechanisms. That is the orchestrator's and the user's
call at a gate, not an executor's inside a repair dispatch. Both copies are correct at HEAD, so
nothing is broken while this is open — the exposure is the next correction reaching one of them.

---
Resolved: closed by user decision at gate G1, option three of the three the filing executor costed — two copies are accepted and no mechanism is built to hold them identical. Reasoning recorded at shared/history/260814-2306-orchestrator-session.md:252 — five lines of shell justify neither a thirteenth bin helper with its gitignore line and its asserted table row, nor a fortieth test file, and both are the kind of addition the growth cap in step 13 exists to slow. The risk is not denied: the two copies can diverge and nothing will say so. It stays named here rather than engineered away.
