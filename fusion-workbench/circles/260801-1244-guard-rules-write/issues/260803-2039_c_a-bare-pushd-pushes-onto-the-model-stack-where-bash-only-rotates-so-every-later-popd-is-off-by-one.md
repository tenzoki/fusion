# A bare `pushd` pushes onto the model's stack where bash only rotates, so every later `popd` is off by one

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 4 incremental review of `260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:1746` (the unconditional push), `:1759-1772` (the `none`
and `opaque` arms), `:1425-1446` (`unmodelled`, and the reasoning this issue extends),
`:1656-1682` (the `applyDirEffect` invariant and its audit recipe),
`260803-1803_*_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate…`
(same mechanism, flag form, closed by `a79ff1a`),
`260803-1835-turn4-t4-2-working-directory-allow-list.md`
(`## Three entrances I found while implementing`)

---

## What is wrong

`applyDirEffect` pushes the current directory onto the model's stack for **every** `pushd`
that survives the allow-list, before the switch that decides what the operand meant:

```ts
// bash-mutation-guard.ts:1746
if (name === "pushd") state.dirStack.push(state.cwd);
```

Two `pushd` forms reach that line and are **not pushes in bash**:

| Form | `firstDirArg` | What bash does | What the model does |
|---|---|---|---|
| `pushd` (no operand) | `{kind:"none"}` | Swaps the top two stack entries. Stack **depth unchanged**. | Pushes `cwd`, sets `cwd = CWD_UNKNOWN`. Depth **+1**. |
| `pushd +N` / rotation | `{kind:"opaque"}` | Rotates the stack. Depth unchanged. | Pushes `cwd`, sets `cwd = CWD_UNKNOWN`. Depth **+1**. |

Setting `cwd` to unknown is right and is not the defect. The defect is the extra stack
entry: the model's stack is one deeper than bash's and shifted by one, so the **next**
`popd` recovers a directory bash does not go to, and the one after that recovers another —
each of them a *known*, confidently-named `Cwd`. The unknown is spent on the first `popd`
and the model is confidently wrong from there on.

This is the mechanism the implementer identified while fixing `pushd -n`:

> `pushd -n DIR` pushes onto the directory stack and **stays put** … So the wrong assertion
> is not in `cwd` at all — it is in `dirStack` and in `prev`, and it is collected later, by
> a `popd` or a `cd -`.

That reasoning produced `unmodelled()` zeroing the whole record, which is correct, and it
was wired to the **flag** forms only. The two non-flag rotation forms take the ordinary
path and put a *proven* value at a stack position bash does not have.

The `applyDirEffect` docstring's audit recipe cannot find it:

> So the audit is: grep this function for `state.cwd =` and check each right hand side.

`state.dirStack.push(state.cwd)` is not a `state.cwd =`. The one field the Turn learned was
load-bearing is the one field the recipe does not enumerate.

## Measured

Real guard subprocess through `hooks/lib/__tests__/helpers/guard-harness.ts`, one fresh
throwaway project per row, shipped protected list, no flag. `effect` is the same command
run through real `bash` in a second fresh project. The deny is not `[HALTED]`. At `b85f6a0`:

```
  command                                                            guard  effect
  cd rules && pushd ../build && pushd ../docs && pushd
            && popd && popd && rm x.md                               allow  rules/x.md DELETED
```

(`>/dev/null` on each `pushd`/`popd` in the probe, to keep the output out of the way; it
changes no verdict.)

Traced, so the off-by-one is visible rather than asserted — bash's `dirs` lists the current
directory first:

```
                        bash                                    model
  cd rules              [rules]                   cwd=rules  stack=[]
  pushd ../build        [build, rules]            cwd=build  stack=[rules]
  pushd ../docs         [docs, build, rules]      cwd=docs   stack=[rules, build]
  pushd  (swap top 2)   [build, docs, rules]      cwd=?      stack=[rules, build, docs]  <-- +1
  popd                  [docs, rules]   -> docs   cwd=docs   stack=[rules, build]
  popd                  [rules]         -> rules  cwd=build  stack=[rules]
  rm x.md               writes rules/x.md                    writes build/x.md  -> ALLOW
```

Verified in **zsh** as well as bash: the same sequence lands in `rules/` in both.

Controls that did not move:

```
  cd rules && pushd ../build && pushd && popd && rm x.md        allow, bash leaves it intact
  pushd docs >/dev/null && ls; popd                             allow  (the idiom)
  cd rules && rm x.md                                           DENY   (the model's control)
```

The short control matters: bare `pushd` followed by a **single** `popd` is an identity on
`cwd` in bash too, so the model and bash agree. The divergence needs one `popd` more than
the bare `pushd` consumed, which is why the shape is contrived — but it is contrived in
exactly the way an agent working around a deny would arrive at, and its reach is the whole
protected list.

`pushd +N`: I did not construct an exploiting sequence for it. The same unconditional push
runs on the `opaque` arm and the same off-by-one follows, so it should be closed with the
`none` arm rather than left for a fifth Turn to measure.

## Candidate direction

Move the push inside the arm that is actually a push, or give the rotation forms the
give-up they already have a mechanism for:

1. `case "none"` for `pushd`, and `case "opaque"`, call `unmodelled(state)` and return —
   the same answer `pushd -n` gets, for the same reason. `cd` with no operand keeps its
   `CWD_OUTSIDE` (it is a real move to `$HOME`, not a stack edit) and is untouched.
2. Then `state.dirStack.push(state.cwd)` runs only on the `word` / `previous` arms, where
   bash really pushes. Guarding it that way also makes the invariant true of the stack and
   not only of `cwd`.

Cost: `pushd` with no operand and `pushd +N` stop being modelled, so a relative operand of
a table verb after either one denies fail-closed. Neither appears in the ordinary-agent-
command corpus, and the surviving idiom `pushd DIR >/dev/null && … ; popd` is unaffected
because it names its operand.

While this is being fixed, the `applyDirEffect` docstring's audit recipe should be restated
over **every write to `state`**, not over `state.cwd =`. As written it certifies an
invariant it cannot check, which is the failure mode this Circle has now corrected in four
separate docstrings.

## Test coverage this needs

The exploiting sequence and the two controls, each in its own project, asserting the deny is
not `[HALTED]` and that real bash would have deleted the file
(`denyAndBashWouldHaveWritten`). Plus a unit pin that the model's `dirStack` **depth**
tracks bash's across `pushd` / `pushd -n` / bare `pushd` / `pushd +N` / `popd` / `popd -n`,
since depth is the invariant that broke and no current test states it.

## Origin

Turn 4 incremental code review, answering the review brief's question 1. Found by asking
which writes to `ShellState` the stated invariant does **not** enumerate, then constructing
the sequence that collects one.

---
Resolved: the unconditional `state.dirStack.push(state.cwd)` now sits below a guard that
routes the two rotation forms into `unmodelled(state)`, exactly as the candidate direction
scoped it — the give-up mechanism that already existed, not a new one. `pushd` with no
operand (`kind: "none"`) and `pushd +N` (`kind: "opaque"`) return before anything is
modelled; `pushd -N` was already fail-closed through the flag allow-list. The push is then
reachable only on the `word` and `previous` arms, which are the two forms bash really
pushes on — `pushd -` measured as a push followed by a move to `$OLDPWD`, which is what the
`previous` arm already modelled.

Depth verified against real bash 3.2 and zsh by reading `dirs` after each step, rather than
inferred: `pushd DIR` and `pushd -` are +1, `pushd` / `pushd +N` / `pushd -N` are 0, `popd`
is -1, and a `popd` past the bottom is the no-op bash makes it.

Measured after the change through the real guard, one fresh project per row, with the
real-bash effect check: the issue's six-segment sequence denies and bash deletes
`rules/x.md`; the `pushd +1` and `pushd -1` siblings deny with the same effect. The
surviving idiom `pushd build >/dev/null && rm out.js; popd >/dev/null` still allows, as do
`pushd rules && popd && rm x.md` and `cd build && pushd /tmp && popd && rm out.js`.

Cost, stated: bare `pushd` followed by exactly one `popd` used to allow AND agree with bash
— by cancelling two errors, not by modelling anything — and now denies fail-closed with the
working directory named as the cause. Same for `pushd +1 … popd`. Neither appears in the
ordinary-agent-command corpus, and both are covered by a named test that says so.

The audit recipe is corrected in the `applyDirEffect` docstring: it now runs over every
field of `ShellState` through a command a reader can paste, and it names what it does not
certify (that the function is reached at all). T4-2's history carries a superseded banner
pointing at the replacement.
