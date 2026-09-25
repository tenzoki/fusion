# A gate-0 deny reads as an ordinary protected-path deny, and names a file the agent may in fact write

---

**Severity:** Medium
**Domain:** code
**Filed by:** coder, closing `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` (T3-1) in `260801-1244-guard-rules-write`
**Affects:** `hooks/guard.ts` CHECK 2 (the deny reason), `guardBashCommand` STEP 2 (same),
`rules/protected-path-discipline.md` and `README-hooks.md` (the agent-facing explanation)
**Cross-references:** `hooks/lib/rules-write-exemption.ts` `## Gate 0`,
`260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md`,
`rules/git-branch-discipline.md` (the rule written to prevent exactly this failure)

---

## What was introduced

Gate 0 refuses the rules-write grant for any path spelled with a `..` segment. That closes
the escape completely, and it deliberately over-refuses: `rules/retired/../x.md` and
`cd rules/retired && rm ../x.md` name a genuine rule file and are now denied, because the
collapsed string cannot tell a `..` after a directory from a `..` after a symlink — the
collapse is what removed the component that decides.

The refusal is right. What it says is not. The agent gets the standard message:

```
  Protected path: rules/x.md cannot be modified directly.
  This path is under compliance guard protection.
```

with `FUSION_ALLOW_RULES_WRITE=1` set, for a file that the very same flag *does* let it
write under the name `rules/x.md`. Nothing in the deny mentions the spelling, and the path
the deny names is the one that would have worked.

## Why this is the failure mode that matters

`rules/protected-path-discipline.md` exists because of one observed behaviour: an agent that
meets a deny it cannot explain does not stop, it *rephrases*. Here rephrasing is the fix —
drop the `..` — but nothing tells it so, and the message actively points the wrong way: it
names a path that is writable, which reads as "the flag is not working" rather than "this
spelling is not accepted". The likely next move is the flag being set harder, or a second
route being tried.

This is the same shape as the fail-closed denies the Bash guard already learned to explain
("an operand of a recognised verb that still carries `$`… is denied rather than guessed at",
with the deny reason naming which). Gate 0 is a fail-closed deny with no such reason.

## A second, smaller inaccuracy in the same family

The deny event and reason name the COLLAPSED spelling, which through a planted symlink is
not the file either. Measured, with `rules/up -> ../` planted:

```
  Edit rules/up/../agents/coder.md
    reason: "Protected path: rules/agents/coder.md cannot be modified directly."
    event:  {"event":"guard_block","file":"rules/agents/coder.md"}
    the write would have reached: agents/coder.md
```

`rules/agents/coder.md` does not exist. This is the protection side's long-standing lexical
naming — a text classifier names the target its text names — and it is an imprecision on a
DENY, not a grant describing a write that happened, so it is materially less serious than
the advisory bug T3-1 closed. It is recorded here because it is the same reader confusion
arriving from the other direction, and any fix to the message above should decide what it
wants to say here too.

## Candidate directions, not decided

1. **Name the cause in the deny.** When the exemption was active and gate 0 was the only
   thing that refused, say so: "…and `FUSION_ALLOW_RULES_WRITE` does not cover a path spelled
   with `..` — write it without one." Needs the exemption to report WHY it said no, which it
   currently does not (one boolean). The smallest honest version is a second predicate the
   guard can ask, not a richer return type.
2. **Document only.** T3-7 owns `rules/protected-path-discipline.md` and `README-hooks.md`
   this Turn; a paragraph there costs nothing and reaches an agent that reads its rules. It
   does not reach an agent that only reads the deny, which is the one that rephrases.
3. Both — 2 now, 1 when the message is next touched.

## Constraint on any answer

Whatever is said must not describe the boundary in a way that reads as a workaround. "Write
it without a `..`" is the correct instruction for a rule file the agent may write; it must
not read as "spell it differently and it will go through", which is what the guard's whole
protected-path discipline is written against.

---
Resolved: candidate direction 1, by the same mechanism that closed `260802-2332_*_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-with-no-diagnosable-reason.md` — one
diagnostic serving both gates, filed as T3-2 rather than split. The exemption now reports
WHICH gate refused (`rulesWriteRefusal`), and each surface appends the matching sentence to
its deny reason.

Measured, with the flag set:

```
  Edit rules/retired/../x.md
    Protected path: rules/x.md cannot be modified directly. This path is under compliance
    guard protection. FUSION_ALLOW_RULES_WRITE is set and this path is inside a rule
    directory, but the exemption still refused it: the spelling contains a `..` segment,
    which the exemption never covers. A `..` deletes the component before it, and that
    component can be a symlink that sends the write somewhere else entirely. Name the rule
    file without a `..`.

  cd rules/retired && rm ../x.md
    fusion policy: … writes `rules/x.md`, which is under compliance guard protection.
    <the same sentence> Do not rephrase the command — … STOP and ask the user.
```

The issue's constraint is met by construction rather than by wording alone. "Name the rule
file without a `..`" is emitted ONLY when the collapsed path is inside a rule directory — the
membership test is asked before the spelling test for exactly this reason. For
`x/../agents/coder.md` the refusal is reported as `not-a-rule-path` and no note is written, so
the message never suggests re-spelling a path that would deny either way. It is also the one
note that names an action; the other refusals say rewriting will not help.

The smaller inaccuracy in `## A second, smaller inaccuracy` is NOT closed and is left open
deliberately. The deny still names the collapsed spelling (`rules/agents/coder.md` through a
planted `rules/up`), because that is the path the protection side matched and renaming it
would mean the deny reason and the protected-list match disagree. What changed is that the
reader is no longer left with only that string: the refusal sentence tells them a `..` was
the cause. Whether the deny should name the kernel-resolved target is a protection-side
question, on the same ground as `260803-1251_*_fs-locator-collapses-dotdot-lexically-…`.

Session: `260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
