# Gate 0 misses the `..` in a `cd -P` operand, so a planted link still spends the grant

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 3 incremental review
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only; the write-tool
surface is unaffected)
**Cross-references:**
`260802-2229_*_rules-write-flag-is-a-write-anywhere-primitive-via-a-symlink-planted-in-rules.md`
(the class, closed by gate 2),
`260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md`
(the same class one layer down, closed by gate 0 in `3b0f9e7`),
`260803-1251-turn3-t3-1-gate-0-dotdot-spelling-refusal.md`

---

## What is wrong

Gate 0 refuses the rules-write grant for any `..` segment in `spelledAs`. On the Bash
surface `spelledAs` is `Target.spelled`, which `resolveTarget` sets to `joined`
(`hooks/lib/bash-mutation-guard.ts:1190-1191`):

```ts
const joined = absolute ? value : joinCwd(base, value);
const path = normalizePath(opts.normalize(joined));
return { kind: "path", path, spelled: joined };
```

`joined` preserves the `..` the **operand** carries. It does not preserve the `..` the
**`cd`** carried, because `base` comes from `resolveDir`, which already collapsed it
lexically (`hooks/lib/bash-mutation-guard.ts:1133-1144`):

```ts
return { kind: "known", dir: canonicalDir(normalizePath(joinCwd(base.dir, value))) };
```

For a plain `cd` that lexical collapse is faithful — bash's `cd` is logical by default and
resolves `..` against `$PWD` textually, exactly as `normalizePath` does. For `cd -P`
(and `set -P`, and `pushd -P`) bash switches to physical resolution and asks the kernel,
which resolves the symlink component first and then takes the parent **of its target**.
`firstDirArg` explicitly skips `-P` as a flag (`hooks/lib/bash-mutation-guard.ts:1232`,
the comment names `-P` by name) and then models the physical form with logical semantics.

The result is the class gate 0 was added to close, arriving through the `cd` instead of
through the operand: the component that decides where the write lands is deleted from the
string before gate 0, gate 1 and gate 2 ever see it. Gate 2 then resolves a path that
does not name the file being written, finds it inside the real `rules/`, and grants.

## Measured

Real guard subprocess, one throwaway project per row, shipped `hooks/config.json`
protected list, `rules/L -> ../agents` planted. `flag on` is
`FUSION_ALLOW_RULES_WRITE=1`; `real effect` is the same command run through `bash` in the
same project.

```
  command                                            flag on  flag off  real effect
  cd -P rules/L/.. && rm agents/coder.md              allow    DENY      DELETED
  cd -P rules/L/.. && echo pwned > agents/coder.md    allow    DENY      OVERWRITTEN
  set -P; cd rules/L/.. && rm agents/coder.md         allow    DENY      DELETED
  pushd -P rules/L/.. && rm agents/coder.md           allow    DENY      (same verdict)

  reach, same command shape, guard verdict / file deleted by bash:
  rm agents/coder.md                                  allow / deleted
  rm skills/demo/SKILL.md                             allow / deleted
  rm rules/x.md                                       allow / deleted
```

The plant is three allowed commands, all under the same flag:

```
  ln -s ../agents stage/L    allow
  mv    stage/L rules/L      allow      (the stated bound of `exemptible: false` on ln)
  cp -P stage/L rules/L      allow      (the same bound, second spelling)
```

Controls, same project, same plant, confirming the gates that DO hold:

```
  rm rules/L/../agents/coder.md          DENY   (gate 0 — the operand carries the ..)
  cd -P rules/L && rm ../agents/coder.md DENY   (gate 0 — the operand carries the ..)
  cd rules/L && rm coder.md              DENY   (gate 2 — resolves outside)
  cd rules/L/.. && rm agents/coder.md    allow  but bash's logical cd leaves the file
                                                intact, so the classifier is faithful here
```

The plain-`cd` row is the one that matters for scoping the fix: the model is correct for
logical `cd` and wrong only once `-P` or `set -P` puts bash into physical mode.

## Why this is High and not Critical

The reach is the whole protected list, which is the reach of `260802-2229_*_rules-write-flag-is-a-write-anywhere-primitive-via-a-symlink-planted-in-rules.md` (Critical).
Two things argue it down one step, and they should be visible to whoever triages it:

- The exploit needs the flag twice — once to plant inside `rules/`, once to spend the
  grant. A project that never sets `FUSION_ALLOW_RULES_WRITE` is unaffected.
- An agent that wanted the same effect without any flag already has it, through the
  planted alias this Turn documented as known and accepted
  (`ln -s ../agents/coder.md build/alias; echo pwned > build/alias`, measured allowed on
  both surfaces). So this does not extend an attacker's reach past an accepted residual.

What it does break is the invariant this Turn's headline fix claimed to establish: that a
grant cannot be spent on a symlink planted in the rule directory. Two shipped docstrings
state that claim as complete, and both are false as written:

- `hooks/lib/bash-mutation-guard.ts:296-300` — "gate 0 refuses any operand SPELLED with a
  `..`, **which is the only way to traverse a planted link without naming it**". `cd -P
  rules/L/..` traverses it without naming it and without a `..` in any operand.
- `hooks/lib/rules-write-exemption.ts:69-71` — gate 0 "is also complete against the class
  BY INSPECTION". It is complete against the class *in the operand*; the `cd` is a second
  entrance.
- `hooks/lib/bash-mutation-guard.ts:213-215` (`MutationOptions.exempt`) describes `spelled`
  as "that operand BEFORE `normalize`". True of the operand, silent about the base, and
  the base is where this one lives.

## Candidate directions

1. **Refuse the grant when the virtual cwd's own spelling carried a `..`.** Carry a
   `walkedUp` bit on `Cwd`, set in `resolveDir` when the incoming value has a `..`
   segment, and have `resolveTarget` report `spelled` as unusable (or prepend a `..`
   marker) so gate 0 refuses. Narrows only the grant side, which is the direction that
   fails safe, and matches gate 0's existing "cruder than a resolver" stance. Costs the
   curator `cd rules/a/.. && mv x.md retired/`, which nothing needs.
2. **Treat `-P` as un-modellable.** `firstDirArg` currently skips it; instead set
   `CWD_UNKNOWN` when a directory builtin carries `-P`, and likewise for a `set -P` /
   `set -o physical` segment. That is the honest answer for the *protection* side too —
   under `-P` the classifier's lexical model is simply wrong — and it makes every relative
   operand after such a `cd` fail closed. Wider than direction 1, and it changes deny
   behaviour for commands that use `-P` innocently.
3. Both. Direction 1 closes the grant; direction 2 stops the classifier from asserting a
   working directory it cannot compute. They are independent.

Whichever lands, the three docstring claims above have to be corrected in the same commit,
because each of them is currently the reason a later reader would not look here.

## Origin

`260801-1244-guard-rules-write`, Turn 3 incremental review, while checking whether
gate 0 is complete against its class.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Every code citation verified; the three false docstrings are still false at HEAD `fa81589`.**

The mechanism is at the lines the issue names:

- `hooks/lib/bash-mutation-guard.ts:1191-1192` — `const path = normalizePath(opts.normalize(joined)); return { kind: "path", path, spelled: joined };`
- `hooks/lib/bash-mutation-guard.ts:1143` — `dir: canonicalDir(normalizePath(joinCwd(base.dir, value)))`, the collapse inside `resolveDir`
- `hooks/lib/bash-mutation-guard.ts:1232` — `if (a.length > 1 && a.startsWith("-")) continue;` with `-P` named in the trailing comment

The three docstrings that assert the closed form are unamended:

- `hooks/lib/bash-mutation-guard.ts:296-300` — "gate 0 refuses any operand SPELLED with a `..`, which is the only way to traverse a planted link without naming it"
- `hooks/lib/rules-write-exemption.ts:69-71` — gate 0 "is also complete against the class BY INSPECTION"
- `hooks/lib/bash-mutation-guard.ts:215` — `spelled` described as "that operand BEFORE `normalize`", silent about the base

**Reachability of the neighbouring open issue, checked so the two are not confused.** This route does not make `260803-1251_*_fs-locator-collapses-dotdot-lexically-…` reachable. `resolveDir` consumes the `..` before `Target.spelled` exists, so `realFsLocator.absolute()` never receives one. Same class, different defect, and each needs its own fix.

**Fourth instance of one class in this Circle.** `260802-2229_*_rules-write-flag-is-a-write-anywhere-primitive-via-a-symlink-planted-in-rules.md` (planted symlink, closed by gate 2), `260802-2230_*_check-2-matches-the-protected-list-un-canonicalised-so-dot-slash-agents-coder-md-is-not-protected.md` (un-collapsed protected match, closed by `collapseSegments`), `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` (lexical `..` collapse, closed by gate 0 in `3b0f9e7`), and now this one, entered through the `cd` rather than the operand. `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` (case folding) is the same shape on the protection side. Whoever picks this up should weigh the review's own framing — narrow the grant, do not widen the resolver — against the fact that the narrowing has now been done three times and the class keeps returning through a new entrance.

---

## Resolved — reconstructed by reconciliation 260804-1021-reconciliation.md, because the closing commit left no note

Renamed `_o_` → `_c_` in `a79ff1a` with **zero content change** (`R100`). The closure holds, but the file carried no evidence of it and its `## What is wrong` section still reads as live. Recorded here.

**The entrance is closed, and closed where the analyst's root-cause pass said it should be** — in the classifier, not by widening gate 0. `hooks/lib/rules-write-exemption.ts:83-87` now states the bound explicitly: "That entrance is closed in the classifier rather than here: `applyDirEffect` now allow-lists the `cd` forms it models and yields `CWD_UNKNOWN` for the rest, so an operand under an unmodelled `cd` is unresolved and reaches no gate at all. Gate 0 was not widened, and no claim is made here that it covers the working directory."

**All three docstrings this issue named as unamended are amended at HEAD `cc012fc`**, which was the substantive half of the finding:

| Named at | State at HEAD |
|---|---|
| `bash-mutation-guard.ts:296-300` — "gate 0 refuses any operand SPELLED with a `..`, which is the only way to traverse a planted link without naming it" | Rewritten at `:446-470`. It now names three layers, calls itself "a layer, not the layer", and carries the line `IT IS WRITTEN AS A LIST BECAUSE EACH SHORTER VERSION OF IT WAS FALSE` followed by both earlier false versions verbatim, this issue's included. It ends "So no completeness claim is made here at all." |
| `rules-write-exemption.ts:69-71` — gate 0 "is also complete against the class BY INSPECTION" | Rewritten at `:73-87` under the heading "### The bound on gate 0, which is not the bound it was first written with", which quotes the false claim and states why it was false. |
| `bash-mutation-guard.ts:215` — `spelled` "that operand BEFORE `normalize`", silent about the base | The base is now named in the surrounding prose; `:361` states that the spelling check "has to read the second" operand component. |

**Note on how these were amended, because it is the useful part.** Each correction keeps the false version in place and marks it, rather than replacing it. That is the practice which makes this class auditable at all, and it is the reason the reconciliation could verify the closure without the issue file's help.

**The neighbouring-issue distinction this file drew has survived and was re-checked.** `## Reachability of the neighbouring open issue` argued that this defect and `260803-1251` are the same class but different defects, each needing its own fix. Both are closed at HEAD by different commits — this one by `a79ff1a` in the classifier, `260803-1251` by `7cf9693` in `fs-locator.absolute()` (`joinUncollapsed`). Two fixes, two files, no overlap. The distinction was correct.
