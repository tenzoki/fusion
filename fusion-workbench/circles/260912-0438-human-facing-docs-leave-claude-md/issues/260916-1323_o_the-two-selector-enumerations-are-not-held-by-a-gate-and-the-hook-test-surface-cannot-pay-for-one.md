The two selector enumerations are not held by a gate, and the hook-test surface cannot pay for one

---
This record exists because `260916-1310_*_the-eleventh-check-is-absent-from-setups-due-list-so-nothing-ever-makes-it-due.md`
offers it as the alternative in its own acceptance test: *"the two enumerations … are held equal by a
gate, **or a record says why they are not**."* The gate was not built. This is the why.

**What was fixed there:** `skills/setup/SKILL.md:86` now carries `claude-md` in `SEL`, so the
eleventh selector is reported due, run on the periodic path and stamped. The two statements the
record named as false — `skills/check/SKILL.md:8` and `README-agents.md`'s `/fusion:check` row — are
true again without either being edited, because the code moved to meet them.

**What is still true, and is the deeper defect that record names:** the roster of selectors is stated
twice. Its authoring home is the table in `skills/check/SKILL.md` (`| Selector | What it answers |`);
`SEL` in `skills/setup/SKILL.md` is a second copy, and the two drifted in one commit (`c9d4013d`)
with a green suite. Nothing holds them equal.

**Two fixes were measured and both are unaffordable at this head.**

1. **Derive `SEL` from the selector table** rather than restating it — the single-source fix, and the
   better one. The derivation itself is roughly byte-neutral (a `matchAll` over the check body
   costs about 15 bytes less than the literal array), but it needs three things the literal does
   not: a third argv carrying the path, a `try`/`catch` so an unreadable table cannot kill the
   marker write that the same block performs, and a loud `checks_due=unread` branch for the empty
   result — plus the prose saying that the roster is read from the installed copy and what an
   unreadable table prints. Measured at about **+350 bytes** all told. The `skills/` surface stood
   at **1 byte** of margin (213 678 against a 213 679 budget).
2. **A lint pinning `SEL` against the table**, in `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`.
   The `hook-tests` line surface stands at **0 lines** of margin (21 921 against 21 921), and a
   check that asserts nothing cannot be written in zero lines.

Both budgets are the growth bounds in `hooks/lib/__tests__/surface-growth-bound.test.ts`, and
`## Re-baselining` in `hooks/lib/__tests__/helpers/growth-bound.ts` names the only events at which
either head-room moves. Neither event is "somebody needed room". So the fix that landed was the one
that fits: `"claude-md"` added to the array (+12 bytes) and the bare cardinality `Ten of them,`
dropped from `skills/setup/SKILL.md:12` (-13), for a net of **-1 byte** — which also settles a
`rules/critical-stance.md` §5 violation, since that count had no enumeration beside it and was
already wrong.

**What this leaves exposed:** a twelfth selector added to `skills/check/SKILL.md` will be invisible
to Setup exactly as the eleventh was, and the suite will stay green. The cost of that is one check
never running on the periodic path until somebody notices.

**Acceptance test:** either fix 1 or fix 2 lands, paid for by a cut inside its own surface or by a
head-room raise the user rules on; or a twelfth selector is added and the drift is caught by
something other than a reviewer reading both files.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-1310_*_the-eleventh-check-is-absent-from-setups-due-list-so-nothing-ever-makes-it-due.md` (the record whose acceptance test admits this one).
