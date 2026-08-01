# An unsubstituted `$SCAN_HISTORY` makes `/fusion:cadence` report a quiet week instead of failing

**Filed by:** coderev (incremental review, Turn 1, v5.7.0 release session)
**Scope:** `skills/cadence/SKILL.md` (surfacing site) + the resolver-key-in-shell-block house pattern shared by 7 other skills
**Severity:** Medium — silent wrong output, low probability, cheap fix

---

## The defect

`skills/cadence/SKILL.md:88` gathers the skill's primary source this way:

```bash
for d in $SCAN_HISTORY; do find "$WORKBENCH/$d" -maxdepth 1 -name '*.md' 2>/dev/null; done
```

`$SCAN_HISTORY` and `$WORKBENCH` are **resolver keys**, not shell variables. Step 0
(`skills/cadence/SKILL.md:29`) says "Read `WORKBENCH`, `OUT_MEMO` and `SCAN_HISTORY` out
of the output" — the running agent is expected to substitute the values textually before
executing the block. Nothing exports them into the shell, and the Bash tool does not
persist shell state between calls (working directory persists; environment does not).

If the agent runs the block verbatim, both names expand to the empty string. Verified in
this repo:

```
$ unset SCAN_HISTORY WORKBENCH OUT_MEMO
$ for d in $SCAN_HISTORY; do find "$WORKBENCH/$d" -maxdepth 1 -name '*.md' 2>/dev/null; done; echo "exit=$?"
exit=0
```

Zero iterations, no output, **exit 0**. The skill then proceeds to build three lists from
an empty source set and writes a digest saying nothing happened. That is exactly the harm
the skill's own prose names at `skills/cadence/SKILL.md:97`: *"the result looks like a
quiet week rather than a bug."*

Two further sites in the same file share the failure mode:

- `skills/cadence/SKILL.md:91` — `"$WORKBENCH/activity-log-$USER.md"` becomes
  `/activity-log-$USER.md`; the `[ -f ]` test just returns false, so the activity-log
  source disappears silently too.
- `skills/cadence/SKILL.md:147` — `mkdir -p "$WORKBENCH/$OUT_MEMO"` becomes
  `mkdir -p "/"`, which **succeeds** (verified, exit 0). The digest at
  `skills/cadence/SKILL.md:144` would then be written to `/cadence-$USER.md` — the
  silent-wrong-place failure `rules/fusion-workbench-conventions.md` `## Path Resolution`
  → *Failure behaviour* exists to prevent, arrived at from the caller's side rather than
  the resolver's.

## This is not cadence's invention — it is the house pattern

Every skill that resolves paths interpolates the keys into fenced shell blocks the same
way, with the same "hold the emitted values" instruction and no export:
`skills/archive/SKILL.md:49`, `skills/circle-pop/SKILL.md:215-216`,
`skills/circle-stash/SKILL.md:228`, `skills/direct/SKILL.md:46`,
`skills/next/SKILL.md:44`, `skills/seed-from-plane/SKILL.md:68`,
`agents/playmaker.md:76`. Cadence conforms to the convention; it does not break it.

What makes cadence the site worth fixing is that **it is the first consumer where an empty
expansion is silent and self-consistent.** In the siblings the same slip fails loudly or
visibly: `cp` into `/` errors, `[ ! -d "/$SCAN_CIRCLES" ]` short-circuits the skill,
`circle-stash` refuses without a `CIRCLE` line. Cadence produces a well-formed report that
is simply wrong, and the reader has no way to tell.

## Recommended fix

Do not paper over it per-site with an `export`. The integral fix is an **assertion on the
resolved values before first use**, added to cadence and stated once in the convention:

1. In `skills/cadence/SKILL.md` step 3, before the loop: if the resolved `SCAN_HISTORY` or
   `WORKBENCH` value is empty, stop and report a fusion bug — do not write a digest. An
   empty *directory* is legitimate (a fresh workbench has no history yet); an empty *key*
   never is. The two must be distinguished, because only one of them is a quiet week.
2. In `rules/fusion-workbench-conventions.md` `## Path Resolution`, add one line to
   *Where the call belongs*: a consumer that interpolates a resolver key into a shell block
   must fail loudly on an empty expansion. The resolver already refuses to emit `KEY=`
   (exit 4) for precisely this reason; the same guarantee should hold on the consumer side,
   where the interpolation actually happens.

## Uncertainty, stated plainly

I did not observe this failing in a live `/fusion:cadence` run — the skill was authored in
this session and the installed plugin at `~/.fusion` is still 5.5.1, which has no cadence
skill. The evidence is: (a) the Bash tool's documented non-persistence of shell state,
(b) the verified exit-0-with-no-output behaviour of the block under empty expansion, and
(c) the absence of any substitution instruction at step 3 (step 2 has one — "Use the
printed values literally" at `skills/cadence/SKILL.md:70` — and step 3 does not). Whether
it bites depends on the running agent substituting, which it evidently does often enough
that the seven sibling skills work. This is a robustness gap, not a reproduced failure.

---
Reconciliation 260731-2324 (reconciler, domain `code`) — **confirmed, stays `_o_`.** Independently re-verified against `skills/cadence/SKILL.md` as it stands at `17730b8`: all three cited sites are present and read as described — `:88` (`for d in $SCAN_HISTORY; do find "$WORKBENCH/$d" …`), `:91` (`"$WORKBENCH/activity-log-$USER.md"`), `:147` (`mkdir -p "$WORKBENCH/$OUT_MEMO"`). Step 2 carries the "Use the printed values literally" instruction at `:70`; step 3 carries no equivalent, exactly as the issue states. The house-pattern claim also holds — the seven cited sibling sites exist.

Not fixed by anything in the v5.7.0 release; the release shipped the skill as reviewed. Nothing downstream depends on this being open. Placement and marker correct: filed to `shared/issues/` with no Circle active, which the Origin Rule and invariant 1 both give.
