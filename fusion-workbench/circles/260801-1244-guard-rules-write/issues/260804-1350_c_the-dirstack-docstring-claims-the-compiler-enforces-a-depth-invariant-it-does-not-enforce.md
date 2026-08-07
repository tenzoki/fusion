# The `DirStack` docstring claims the compiler enforces a depth invariant it does not enforce

---

**Severity:** Low
**Domain:** code (documentation of a security control)
**Filed by:** coderev, review of `048f3db` (Job 2)
**Affects:** `hooks/lib/bash-mutation-guard.ts:1794-1819` (the `DirStack` docstring, specifically `:1812-1813`), and the parallel claim at `:2360-2375` (`applyDirEffect`'s "carried by the TYPES instead")
**Kind:** NEW in `048f3db`. The type change is right; the sentence wrapped around it claims more than the type buys.
**Cross-references:**
`issues/260803-2237_c_…` (the defect the sum type closed — closure is correct, no reopen),
`issues/260803-2039_c_…` (bare `pushd`, the OTHER depth defect, which the sum type does not address),
`issues/260804-1027_o_…` (the stale audit recipe — same paragraph family, close together).

---

## What is wrong

The `DirStack` docstring ends:

> With the depth inside the `known` arm there is no zeroed-but-still-N-deep value to
> construct … **The compiler enforces what the previous wording could only ask a reader to
> check.**

The sum type buys one of the two facts the invariant needs, and the sentence claims both.

**What the compiler does prove.** A give-up is a total assignment — `unmodelled` sets
`state.dirStack = STACK_UNKNOWN` (`:1981`), and the `unknown` arm has no `entries` field, so
`.map()`-style zeroing cannot be written back and `popd` cannot read the model's emptiness as
bash's (`:2492-2496`). That closes `260803-2237` and it closes it properly.

**What the compiler does not prove.** That the model's depth equals bash's *while the stack
is `known`*. Nothing in the type stops `{ kind: "known", entries: [...] }` from holding the
wrong number of entries. Depth correctness rests entirely on a reachability argument at the
two mutation sites:

- `:2540-2542` — `pushd` pushes only when `state.dirStack.kind === "known"`, and only on the
  `word` and `previous` arms, because `none` and `opaque` took the give-up at `:2527` and an
  unmodelled flag took it at `:2510`;
- `:2497` — `popd` pops on `known` only.

That argument is correct today. It is also **exactly the kind of argument that was wrong
twice in this Circle**: `260803-2039` (bare `pushd` reaches `firstDirArg`, is correctly told
there is no operand, and was pushed onto the model's stack anyway) and `260803-2237` (the
give-up was stated over values while depth survived). Both were reachability, not typing.

The same over-reach appears in `applyDirEffect`'s docstring at `:2360-2375`, which lists
`dirStack` under "the invariant is carried by the TYPES instead, and there is nothing here to
run" and then, three paragraphs later, correctly says the types "cannot certify … that the
function is REACHED". The two halves are both there; the `DirStack` sentence is the one a
reader quotes.

## Why it matters

This module's history is that a confident sentence about a checked property is what lets the
next reader stop checking. `applyDirEffect`'s own docstring says so, about the audit recipe:
*"a recipe with a gap reads exactly like a recipe without one, which is what makes the third
attempt worse than no attempt."* A type claim with a gap has the same shape, and it is
harder to notice because the compiler really did do something.

There is no defect in the behaviour. Every push and pop site was re-read against bash 3.2 and
zsh 5.9 semantics for this review and none is wrong.

## Recommendation

Narrow the sentence to what it earns. Something in this shape:

> The compiler proves that a **give-up erases the depth** — the `unknown` arm has no
> `entries`, so the zeroed-but-still-N-deep value is not writable. It does not prove that a
> `known` stack's depth tracks bash's: that still rests on reaching `entries.push` only where
> bash pushes, which is a property of `applyDirEffect`'s control flow and is checked by
> reading `:2510`, `:2527` and `:2540`.

And in `applyDirEffect`, add `dirStack`'s depth to the "what the types cannot certify" list,
where `reached` and `proven` already are — it is a third member of that list, not a member of
the list above it.

## Test coverage this needs

The property is not testable through the classifier's public surface, because a wrong depth
only shows up as a wrong `cwd` several segments later. What *is* pinnable, and what would have
caught `260803-2039` earlier, is a depth-parity fixture: for a set of `pushd` / `popd` /
`cd -` sequences, assert the classifier's resolved directory against the directory the real
shell reports (`dirs` / `pwd`), in bash and zsh. `guard-bash-integration.test.ts` already has
the shell-effect machinery for it.

## Anti-vacuity

There is nothing to mutate here — this is a wording change. The anti-vacuity for the
suggested fixture is that it must fail against a build with the `state.dirStack.kind ===
"known"` guard at `:2540` removed.

---

**Step 3 disposition (coder, 2026-08-05) — A-shaped, foreign file. STAYS `_o_`.**

Branch A in kind: a sentence claims more than it earns. It is a docstring in
`hooks/lib/bash-mutation-guard.ts` (`DirStack`, and the parallel claim in
`applyDirEffect`), which step 3 does not own. This step changes no source comment.

One of the six findings whose shape the plan's rule has no branch for; reported to the
orchestrator as such.

**Where it is answered.** `circles/260804-1205-shell-reachability-model` restructures the
directory model, and both docstrings are that model's. This issue's § Recommendation gives
the replacement wording verbatim, so the fix is a paste rather than a re-derivation, and its
§ "Test coverage this needs" proposes a depth-parity fixture against the real shell that the
follow-on Circle is the right owner of.

Recorded because the issue itself says so: **there is no defect in behaviour.** Every push
and pop site was re-read against bash 3.2 and zsh 5.9 semantics for that review and none is
wrong. What is open is a confident sentence about a checked property, which is this module's
documented failure mode.

---
Resolved: Der Gegenstand existiert nicht mehr. Beide Stellen (`hooks/lib/bash-mutation-guard.ts:1794-1819`, der `DirStack`-Docstring, und `:2360-2375`, `applyDirEffect`) lagen in der mit `ba7ccda` gelöschten Datei. Am Baum nachgeprüft in der Reconciliation 260807-1515 gegen HEAD `e684eae`: `DirStack` und `applyDirEffect` kommen außerhalb `hooks/dist/` nicht mehr vor. Es gibt kein Verzeichnismodell mehr, dessen Tiefe eine Zusicherung tragen könnte.
