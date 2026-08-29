# The directory model assumes every `cd` SUCCEEDS, so a `cd` to a nonexistent directory is a one-segment bypass

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 5 incremental review of `260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only); `rules/protected-path-discipline.md` and `README-hooks.md` (the residual lists that omit it)
**Kind:** PRE-EXISTING, and older than this Circle — the model has behaved this way since the virtual-`cd` walk was written. Identical at `cb2c8ad` and HEAD.
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:1887-1914` (the `word` arm), `:1291-1303` (`resolveDir`),
`:2193-2245` (the segment loop, which carries `state` across every separator equally);
`rules/protected-path-discipline.md:350-410` (the "Known and accepted" list — this is not on
it), `README-hooks.md:199` (the same list);
`260803-1835_*_a-redirection-after-an-unmodellable-cd-overwrites-any-protected-file-with-no-flag.md`
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

## Not implemented — decision filed instead (task T6-1)

Deliberately left open. The decision record is
`260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`,
with the four options costed by measurement rather than estimate. Three results are worth
carrying back here because they change the shape of the question:

1. **The shape the review worried about is not at risk.** Both occurrences of
   `mkdir -p X && cd X && …` in the guard's own corpus are written with `&&` throughout, and
   both measure `allow` before and after a simulated degrade. It is written with `&&` because
   that is what makes it correct in the shell too. The at-risk variant
   (`mkdir -p build && cd build; …`) occurs **0** times in this repository's scripts or in
   the test corpus. Across 308 directory builtins in the corpus, 272 (88%) are `&&`-joined.
2. **Direction 1's cost surface is larger than "a `;`-joined `cd`".** In
   `cd hooks && npm run build; rm -rf dist` the `cd` is `&&`-joined to the next segment while
   a later one is reached unconditionally, so the degrade must fire for it. Counting an
   unconditional separator anywhere after the builtin gives 20 of 308 (6.5%); most move no
   verdict because the unconditional segment writes nothing relative.
3. **Direction 1 does not close all four measured escapes.** `cd nope || true; echo pwned >
   rules/x.md` measures `allow` before and after: it is a redirection on a program outside
   the verb table, which is `260803-1835`. This decision should be taken together with that
   one.

Direction 3 as filed ("degrade only where load-bearing") was costed and found to collapse
into a filesystem probe: the guard cannot tell `cd build` from `cd nonexistent` without
asking, so it is direction 4 with extra machinery.

The residual is now stated in both shipped documents, marked as awaiting this decision —
which is the current state and also exactly option 2, so no work is needed if option 2 is
chosen. Marker unchanged (`_o_`).

---
Resolved (task T7-1): option 1 of
`260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`
— the model may assume a `cd` succeeded only where the shell guarantees it.

`ParsedSegment` gained a `joiner` (`shell-parse.ts`, `SegmentJoiner`) and
`ShellState` a monotone `moved` flag; `classifyBashMutation` calls
`degradeUnprovenCd` at any segment boundary whose joiner is not `&&` once a
directory builtin has run in the current scope. The check sits AFTER the
subshell scope restore, so a `cd` bash itself discarded casts no doubt forward.

The joiner is per NESTING LEVEL and the degrade tests `!== "&&"` rather than
enumerating the others, so a joiner added later is unguaranteed by default.
`ParsedSegment` is consumed by both Bash classifiers, but the GIT classifier
segments through `extractCommandSegments(stripDataRegions(cmd))` — a separate
function, retained verbatim — so it cannot see the field. That is asserted
rather than assumed: `git-branch-guard.test.ts` pins 98 commands × 4 override
combinations of the PREVIOUS classifier's verdicts as a gold fixture and
reproduces them byte for byte, plus a source check that the module never names
`parseCommand`.

Measured, HEAD's own 4203-command test corpus, both directions. The degrade in
isolation moves **6** verdicts: this bypass, plus the five costs the decision
record's `## Answer` showed the user —

```
  cd build; rm out.js
  cd docs; rm ../notes.txt
  mkdir -p build && cd build; rm out.js
  cd hooks && npm run build; rm -rf dist
  cd build || exit 1; rm out.js
```

— exactly the predicted table, no sixth shape, and **no newly-allowing
command**. The `pushd … ; popd` idioms degrade and write nothing relative
afterwards, which is most of why the cost is five rows.

Denies are measured against the real guard subprocess with the real-shell effect
asserted, in bash AND zsh, one fresh project per row, no deny reading
`[HALTED]` — `guard-bash-integration.test.ts`, "a cd the shell never promised to
have made".

The deny names the separator rather than the operand (`unprovenCdReason`),
because the `cd`'s operand is already a literal and `&&` is the way through — and
because `&&` is also what makes the command correct in the shell.
