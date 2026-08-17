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

---
Resolved: in two halves, deliberately, because the defect had two.

**The skill half** (commit `6a69717`). `skills/cadence/SKILL.md` step 3 now asserts `WORKBENCH`, `OUT_MEMO` and `SCAN_HISTORY` before the gather block, names every empty key and exits 1. The assertion is written in the same interpolated form as the rest of the skill, so the mistake it catches cannot also disarm it: an agent that fails to substitute fails to substitute the assertion too. The step-8 `mkdir` carries the same check, because the Bash tool starts a fresh shell per call and nothing from step 3 survives into it. Exercised by extracting both blocks from the file and running them under `bash` and `zsh` rather than by retyping them: all three keys empty names all three and exits 1; one key empty names only that one; substituted values exit 0 and the gather block still finds its 92 history files. A genuinely quiet week still produces a digest that says so, so the two cases stay distinguishable, which was the point.

**The conventions half** (commit below). One paragraph in `rules/fusion-workbench-conventions.md` § "Path Resolution (Pfadauflösung)" → *Where the call belongs*: a consumer receiving an empty or unset key stops and names it, never a default, never a fallback, never an empty result. Without it the guarantee lived in one skill body and the seven sibling skills inherited nothing, which is the per-consumer re-typing that `rules/critical-stance.md` §2 calls a rim of special cases. It is written as the consumer-side end of the existing exit-4 rule under *Failure behaviour* rather than as a second rule beside it: the resolver refuses to emit `KEY=` for a reason that still holds one step later, where a held value is interpolated into a shell block, a glob or a path join and can go missing long after the resolver exited 0.

Cost stated rather than hidden: 670 bytes added to the rule set every agent loads on every dispatch. A first draft cost 896 and was trimmed.

Session: `shared/history/260810-0241-orchestrator-session.md` (tasks T10 and T10b). Executor logs: `shared/history/260810-0330-coder-cadence-empty-key.md`, `shared/history/260810-0340-coder-conventions-empty-key-rule.md`.
