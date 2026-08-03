# `README-hooks.md` states "Bash has no halt check, deliberately" — which this Turn made false, with a rationale attached

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `circles/260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** agent-facing and user-facing documentation of a security control
**Cross-references:** `README-hooks.md:143`, `README-hooks.md:9`, `README-hooks.md:19`,
`README-hooks.md:180`, `rules/protected-path-discipline.md:217-220`,
`hooks/guard.ts:309-352` (STEP 2a, the behaviour that landed),
`circles/260801-1244-guard-rules-write/planning/260802-1856_o_plan-guard-rules-write.md:362-369`
(Step 9, the documentation step, whose stated scope does not name these sentences)

---

## What was found

`49bb4da` implemented option 3 of `260802-2220` — a halted guard now denies every recognised
shell mutation. Three shipped sentences still describe the behaviour it replaced, and one of
them states the opposite and explains why.

**`README-hooks.md:143`**, in full:

> A halt blocks the four **write tools** only. `Bash` has no halt check, deliberately: an
> agent should still be able to run `ls` and `git status` while halted, and a shell write to
> a protected path is blocked by the protected-path rule whether or not a halt is active.

Every clause is now wrong. The halt blocks both surfaces. `Bash` has a halt check
(`guard.ts:334-352`). `ls` and `git status` do still run, so the middle clause survives by
accident, but it is offered as the reason for an absence that is no longer there. And the
final clause inverts the new order: a shell write to a protected path under a halt is blocked
by the **halt**, and reports `[HALTED]`, not the path.

**`rules/protected-path-discipline.md:217-220`** understates rather than contradicts:

> Three consecutive guard denials put the guard into halt mode, which blocks every
> `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call until a human clears it. So retrying
> a denied command twice more costs you the write tools for the rest of the session, not
> just the one call.

It now costs the agent every mutating shell command as well. The enumeration reads as
exhaustive and the second sentence names the cost explicitly, so an agent that has been
halted and reaches for `mv` will meet a deny this file told it would not happen.

**`README-hooks.md:9` and `:19`** say "*all* writes are blocked" and "blocking all write
operations", which are now true and were not before — they are fine, and they sit two lines
from `:141`'s four-causes paragraph and eight lines from `:143`, which is where the reader
who wants precision goes.

## Why this is High rather than a doc chore

`rules/protected-path-discipline.md` exists for one stated purpose: that an agent never meets
an unexplained deny and works around it. Its own text at `:200-206` names routing around one
surface to reach the other as "the failure this rule exists to prevent". A halted agent that
has read this file believes the shell is the surface the halt does not cover — which is
exactly the belief the file was written to remove, now installed by the file itself.

The rule is auto-emitted by `bin/fusion-rules` into **every** agent's context, so the wrong
sentence is loaded on every dispatch in every consuming project.

## The Step 9 overlap, stated so this is not refiled work

The Circle plan has a documentation step (Step 9, still open). Its scope as written covers
two other sentences: the "no env override waives it" claim and the "lives in the plugin's own
`hooks/config.json`" claim. It was written before Turn 2 chose option 3, so it does not name
the halt sentences. This issue is the delta — Step 9 should absorb it rather than a separate
edit landing alongside.

## Recommended correction

- `README-hooks.md:143` — rewrite around the actual rule: a halt blocks the four write tools
  and every **file-mutating** shell command; read-only commands still run, deliberately, so
  an agent can find the clear-halt instruction; a halted deny reports `[HALTED]` rather than
  the path, on both surfaces.
- `rules/protected-path-discipline.md:217-220` — extend the enumeration to the shell and
  adjust "costs you the write tools" to name both surfaces.
- While in that paragraph: the halt reason string agents will now see on `Bash` is a
  different string from the write-tool one (`"All file-mutating shell commands are blocked"`
  vs `"All write operations blocked"`). Quoting the shell one in the rule file is what stops
  an agent reading it as a new and unfamiliar policy.

## Also missing, and probably Step 9's

`FUSION_ALLOW_RULES_WRITE` appears in no shipped document — not `README-hooks.md`, not
`rules/protected-path-discipline.md`, not any agent prompt. `README-hooks.md:138` has a table
row for `FUSION_ALLOW_BRANCH_SWITCH` and none for this flag, and
`rules/protected-path-discipline.md` still tells agents no env override waives the
protected-path policy. Noted here for completeness; it is Step 9's stated scope and not a
separate finding.

## Origin

Found in `circles/260801-1244-guard-rules-write` while checking that the halt change landed
coherently across the two surfaces. It did, in code.

---

**Resolved:** Turn 3, task T3-7 (coder). Both sentences rewritten against measured
behaviour, not against the diff.

- `README-hooks.md:143` replaced. A halt now blocks both surfaces; it is broader on the
  shell than the protected-path check it sits above, because it asks only whether the
  command writes a file at all; read-only commands still run and the paragraph says why;
  both halt reason strings are quoted verbatim; a halted protected-path shell write
  reports the halt, not the path.
- `rules/protected-path-discipline.md` halt paragraph replaced and given its own heading,
  `### What a halt costs you`. Quotes the shell halt string in full, so an agent meeting
  it does not read it as an unfamiliar policy, and states the write-tool string beside it.
  The closing sentence now names both surfaces as the cost.
- Also corrected in the same paragraph, wrong for a reason this issue did not name:
  `README-hooks.md:141` said "**Four** things cause a block, and only these" and omitted
  the git branch/worktree deny, which calls `recordBlock` like the others and counts
  toward the halt (`hooks/guard.ts:327-346`; measured). Now five.
- Also added: the three `guard_halt` event details `d77eda8` introduced, so the event log
  and the documentation agree on how the three cases are told apart.

Verified by measurement, not by reading the diff: real guard subprocess, throwaway
consuming project with the shipped `hooks/config.json`, halt seeded on and off. Under a
halt, `rm notes.txt` / `mv` / `echo hi > out.txt` / `rm rules/x.md` all return
`[HALTED] All file-mutating shell commands are blocked…`; `ls -la`, `git status` and
`cat rules/x.md` all return `{}`; `Edit notes.txt` and `Write agents/coder.md` return
`[HALTED] All write operations blocked.`; `git switch main` returns the branch-policy
reason, because that check runs above the halt. The three event details were read back out
of `events.jsonl`.

**Left for plan Step 9, deliberately:** the `FUSION_ALLOW_RULES_WRITE` gap this issue
names under "Also missing". Both documents still say no override exists for a
protected-path write. See `issues/260803-1402_o_step-9-must-also-document-that-a-hard-linked-rule-file-is-not-exempt.md`
for the third sentence Step 9 must add alongside the two this issue lists.
