# `unmodelled()` zeroes the stack's values but not its DEPTH, so an absolute `cd` re-proves a shifted stack

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 5 incremental review of `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Kind:** PRE-EXISTING since `a79ff1a` (Turn 4). Reproduces identically at `cb2c8ad` and at HEAD — this Turn neither caused it nor closed it, but this Turn's corrected audit recipe states the property it violates.
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:1454-1458` (`unmodelled`), `:1721-1736` (the recipe's
shapes 1 and 4), `:1737-1745` (what the recipe says it does not certify), `:1291-1303`
(`resolveDir`, where an absolute operand re-proves the cwd), `:1807-1820` (`popd`);
`hooks/lib/__tests__/bash-mutation-guard.test.ts:2252-2263` (the depth table, which lists
`pushd -n DIR depth +1` and does not test it);
`issues/260803-2039_c_a-bare-pushd-pushes-onto-the-model-stack-where-bash-only-rotates…`
(the sibling this extends), `issues/260803-1803_c_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate…`.

---

## What is wrong

`unmodelled()` is the give-up the whole directory model now routes through. It zeroes the
record's **values**:

```ts
// bash-mutation-guard.ts:1454
function unmodelled(state: ShellState): void {
  state.cwd = CWD_UNKNOWN;
  state.prev = CWD_UNKNOWN;
  state.dirStack = state.dirStack.map(() => CWD_UNKNOWN);
}
```

`.map()` preserves length. That is correct as a statement about values and wrong as a
statement about the stack, because the forms that reach `unmodelled` do not all leave
bash's stack depth alone:

| Form | bash depth | model depth after `unmodelled` |
|---|---|---|
| `pushd` (bare), `pushd +N`, `pushd -N` | 0 | 0 — agrees |
| `pushd -n DIR` | **+1** | **0** — disagrees by one |
| `popd -n`, `popd +N` | **-1** | 0 — disagrees by one |

An all-unknown stack hides the disagreement for as long as the cwd stays unknown, because
every later `popd` recovers an unknown and denies. It stops hiding it the moment the cwd is
**re-proven**, and one construct re-proves it: an absolute `cd` (`resolveDir:1293` returns a
`known` for any operand starting with `/`). After that the model is confident again, and it
is confident with a stack one entry shallower than the shell's.

This is the precise counterexample to the recipe this Turn wrote. Shape 4 states the
property correctly —

> `state.dirStack.push(state.cwd)` / `.pop()` — the property to check is not the value but
> the DEPTH: for every form, does the model's stack end as deep as bash's `dirs`? The
> rotation forms fail that and take shape 1 instead.

— and then offers shape 1 (`unmodelled`) as the answer for forms that fail it. Shape 1 does
not restore depth. The recipe names one gap ("that the function is REACHED"); this is a
second, and it is inside the shapes rather than outside them.

## Measured

Real guard subprocess, one fresh throwaway project per row, shipped protected list, no
flag, no deny reading `[HALTED]`. `{ROOT}` is the project root, substituted identically
into the guard call and the real-shell run.

```
  guard  shell  effect           command
  allow  bash   rules/x.md GONE  cd docs && pushd -n .. && cd {ROOT}/build && popd && rm rules/x.md
  allow  bash   coder.md GONE    cd docs && pushd -n .. && cd {ROOT}/build && popd && rm agents/coder.md
```

Identical verdicts at `cb2c8ad` and at HEAD.

Traced — bash's `dirs` lists the current directory first:

```
                        bash                              model
  cd docs               [docs]              cwd=docs   stack=[]
  pushd -n ..           [docs, root]        cwd=?      stack=[]        <-- bash +1, model 0
  cd {ROOT}/build       [build, root]       cwd=build  stack=[]        <-- cwd re-proven
  popd          -> root [root]              cwd=build  stack=[]        <-- model's popd is a no-op
  rm rules/x.md         writes rules/x.md              writes build/rules/x.md -> ALLOW
```

The model's `popd` finds an empty stack, treats it as bash's "error, stay put" (`:1816`),
and leaves a **proven** `build` standing. Bash pops to the root and deletes the protected
file.

Controls that did not move:

```
  DENY   pushd -n docs && cd {ROOT}/build && popd && rm ../rules/x.md
  DENY   cd docs && pushd -n .. && popd && rm agents/coder.md          (no absolute cd)
  DENY   cd docs && pushd -n .. && cd - && rm agents/coder.md
  allow  cd docs && pushd .. && cd {ROOT}/build && popd && rm rules/x.md   (bash agrees: ends in docs)
```

The last control is the discriminator. With a **modelled** `pushd ..` the same five-segment
shape is correct — model and bash both end in `docs/` and the file is untouched. Only the
give-up path diverges.

The `popd -n` / `popd +N` direction disagrees the other way (model deeper than bash) and I
did not construct an exploiting sequence for it; the same mechanism applies and it should be
closed with the same change rather than measured in a seventh Turn.

Reachability note: an absolute path is required, and absolute paths are the ordinary style
for an agent working in this environment.

## Candidate direction

The give-up has to be stated over depth as well as over values. Two ways:

1. **Make the stack unknowable, not just unknown.** Add a `stackUnknown: boolean` to
   `ShellState`, set by `unmodelled()` and never cleared, and make `popd` return
   `CWD_UNKNOWN` whenever it is set — including when the model's stack is empty, which is
   the case the current code reads as bash's no-op. This is the smallest change and it
   composes with the existing zeroing.
2. **Sink the whole state.** Give `ShellState` an `unmodellable` flag that short-circuits
   every later read to unknown, and stop trying to keep a partially-honest record after a
   give-up. Larger, but it removes the class rather than this instance: any future field
   with a length, an ordering, or a mode will have the same gap.

Direction 1 costs nothing measurable: after a give-up every relative operand already denies,
and the only thing this changes is that an absolute `cd` no longer re-arms a `popd` that had
been given up on. `cd /abs && rm rel` after a clean model is untouched.

While this is fixed, the recipe's shape 4 should stop offering shape 1 as the answer to a
depth violation, since shape 1 does not restore depth.

## Test coverage this needs

- The two escape rows above as integration cases with `denyAndBashWouldHaveWritten`, and the
  `pushd ..` control beside them so a future edit cannot close the escape by breaking the
  modelled path.
- A unit pin that a `popd` after **any** `unmodelled` yields unknown regardless of the
  model's stack depth, and that an absolute `cd` in between does not re-arm it.
- The `popd -n` mirror.

## Origin

Turn 5 incremental code review, answering the review brief's question 3 (does the corrected
recipe hold, and does its stated bound name the right gap). Found by taking the recipe's own
shape 4 at its word — "the property to check is DEPTH" — and asking whether shape 1, which
it names as the answer, actually delivers it.

---

## Resolved — task T6-1, `history/260803-2340-turn6-t6-1-wrapper-give-up-and-stack-depth.md`

**Neither candidate direction as written. A TYPE, so the invalid state cannot be
constructed.** `ShellState.dirStack` is no longer `Cwd[]`; it is

```ts
type DirStack =
  | { kind: "known"; entries: Cwd[] }   // depth exactly the shell's
  | { kind: "unknown" };                // contents AND depth unknowable
```

`unmodelled()` assigns `STACK_UNKNOWN` — there is no length left to preserve, so the
`.map()` shape is not writable back. `popd` on an `unknown` stack yields `CWD_UNKNOWN`
instead of reading its own emptiness as bash's stay-put no-op, and `pushd` onto one leaves
it unknown. Direction 1 (a `stackUnknown` boolean beside the array) was rejected because a
flag beside the data it describes is a second fact that can disagree with the first, which
is the shape of this defect rather than its cure. Direction 2 (sink the whole state) was
rejected because it would stop an absolute `cd` re-proving the CWD, which is correct and
costs real work; only the STACK needs to be permanently unknown.

**Measured** — real guard subprocess, one fresh project per row, real-bash effect asserted,
`{ROOT}` substituted identically into both runs, no deny reading `[HALTED]`:

```
  DENY  bash  rules/x.md GONE     cd docs && pushd -n .. && cd {ROOT}/build && popd && rm rules/x.md
  DENY  bash  coder.md GONE       cd docs && pushd -n .. && cd {ROOT}/build && popd && rm agents/coder.md
  DENY  bash                      cd docs && popd -n; cd {ROOT}/build && popd && rm rules/x.md   (the mirror)
```

The discriminating control still ALLOWS: `cd docs && pushd .. && cd {ROOT}/build && popd &&
rm rules/x.md`, where the modelled `pushd` agrees with bash and both end in `docs/`. So the
give-up did not become a blanket. `cd $D && cd /abs/build && rm out.js` and `pushd -n docs
&& cd /abs/build && rm out.js` also still allow — an absolute `cd` still re-proves the
working directory, and only the stack stays unknown.

**Newly allowing: none.** The change replaces a known stack with an unknown one, and an
unknown stack can only make a later `popd` less certain, which only denies. Verified against
the full suite and against the eighteen earlier-commit verdicts, none of which moved.

**The recipe question, answered as the task asked rather than by writing a third recipe.**
The invariant's audit recipe has now been wrong twice, both times because it enumerated
WRITES TO FIELDS while the invariant is a property of the STATE, and a recipe with a gap
reads exactly like a recipe without one. It is replaced, not corrected: the `applyDirEffect`
docstring now states the property the types carry — every field of `ShellState` has an
"I don't know" value covering the WHOLE field rather than its contents (`Cwd` for
`cwd`/`prev`, `DirStack` for the stack, monotone `true` for `physical`/`cdpath`) — and names
the two things types cannot certify: that the function is REACHED, and that a proven
directory is where the shell is standing. A reviewer checks four type declarations, and the
compiler checks them on every build. The question to ask of a future field is stated: what is
its whole-field unknown, and does `unmodelled` assign it?

Marker moved to `_c_`.
