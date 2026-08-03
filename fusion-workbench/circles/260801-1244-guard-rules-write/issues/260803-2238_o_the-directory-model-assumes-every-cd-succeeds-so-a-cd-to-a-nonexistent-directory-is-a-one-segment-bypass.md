# The directory model assumes every `cd` SUCCEEDS, so a `cd` to a nonexistent directory is a one-segment bypass

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 5 incremental review of `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only); `rules/protected-path-discipline.md` and `README-hooks.md` (the residual lists that omit it)
**Kind:** PRE-EXISTING, and older than this Circle — the model has behaved this way since the virtual-`cd` walk was written. Identical at `cb2c8ad` and HEAD.
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:1887-1914` (the `word` arm), `:1291-1303` (`resolveDir`),
`:2193-2245` (the segment loop, which carries `state` across every separator equally);
`rules/protected-path-discipline.md:350-410` (the "Known and accepted" list — this is not on
it), `README-hooks.md:199` (the same list);
`issues/260803-1835_o_a-redirection-after-an-unmodellable-cd-overwrites-any-protected-file-with-no-flag.md`
(the other still-open working-directory issue).

---

## What is wrong

The model treats `cd DIR` as unconditionally successful. It has no filesystem access, so it
cannot check — that is a design constraint, not a defect. The defect is that the assumption
is carried across **every** segment separator, including the ones the shell does not
condition on.

With `&&`, the shell enforces the assumption: a failed `cd` short-circuits and the rest of
the command never runs, so the model is safe by construction. With `;`, `||`, `&` or a
newline, the shell runs the next segment **from where it never left**, and the model runs it
from a directory that does not exist.

The result is a one-segment, no-flag, no-wrapper bypass of the whole protected list, and it
is not on any residual list in either shipped document. The residual list names `cd .. &&
cd fusion && rm rules/x.md` (walking out and back by name) and the `eval` / alias / `source`
family, both of which require the classifier to be blind to a `cd`. This one needs it to
*see* the `cd` — that is why the enumeration missed it.

## Measured

Real guard subprocess, one fresh throwaway project per row, shipped protected list, no flag,
no deny reading `[HALTED]`. `effect` is the same command in a second fresh project.

```
  guard  shell  effect                    command
  allow  bash   rules/x.md GONE           cd nonexistent; rm rules/x.md
  allow  zsh    agents/coder.md GONE      cd build/nope 2>/dev/null; rm agents/coder.md
  allow  zsh    rules/x.md OVERWRITTEN    cd nope || true; echo pwned > rules/x.md
  allow  bash   rules/x.md GONE           cd notes.txt; rm rules/x.md
```

The fourth row is worth reading twice: the operand is an existing **file**, so `cd` fails
for a reason no name-based heuristic would catch either.

Control:

```
  allow  bash   build/out.js GONE   cd build && rm out.js    (correct — the cd succeeds)
```

Identical verdicts at `cb2c8ad` and at HEAD. Nothing in Turn 5 touched this.

## Candidate direction

The classifier cannot know whether a `cd` succeeded, so the question is which separator it
is entitled to assume success across.

1. **Condition the assumption on the separator.** Keep the model exact after `&&` (where the
   shell guarantees it) and call `unmodelled(state)` when a modelled `cd` is followed by a
   segment the shell would run regardless — `;`, `||`, `&`, newline. The segment record
   already carries what is needed to know which separator preceded it, or can be made to.
   **Cost:** `cd build; rm out.js` and `pushd docs >/dev/null; ls; popd` stop being modelled
   after the `cd`. That is a real idiom, and this is the argument for direction 2 instead.
2. **Document it and leave the model alone.** Add the row to both residual lists, say what
   `&&` buys, and tell the agent that `cd X && …` is the form the guard can follow. Cheap,
   honest, and consistent with how `eval` and the alias family are handled — but it leaves a
   trivially constructible bypass open with only prose against it.
3. **Split the difference:** degrade only where the assumption is *load-bearing* — a `;`-
   separated segment whose operand is relative AND whose resolution depends on a `cd` earlier
   in the same command. `cd build; rm out.js` still denies-or-allows on the modelled `build`,
   while the escape shape above still denies, because there the `cd` is the only reason the
   operand escaped the list. This needs care to state precisely and is the one worth costing
   properly before choosing.

This is a decision, not a repair. It should get a decision record rather than a
straight-to-code fix, because direction 1's cost falls on a shape agents genuinely write.

## Test coverage this needs

Whichever direction is taken: the four escape rows as integration cases with
`denyAndBashWouldHaveWritten`, plus the `cd build && rm out.js` control, plus — if a
separator-conditioned degrade lands — a pin on `cd build; rm out.js` recording whichever
verdict was chosen, so the cost is stated by a test rather than by prose.

## Origin

Turn 5 incremental code review. Found while bounding the wrapper-walk finding: `command cd
build; rm rules/x.md` escapes for two independent reasons, and stripping the wrapper away
left the second one standing on its own.

---
