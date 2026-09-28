# The shipped cost statement "five shapes, and nothing else measured moved" is false, in every agent's context

---

**Severity:** Medium
**Domain:** code (documentation that ships into every consuming project)
**Filed by:** coderev, Turn 7 review of `260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `rules/protected-path-discipline.md:168-176`, `README-hooks.md:184`,
`hooks/lib/__tests__/bash-mutation-guard.test.ts` (the case named "costs exactly these
five ordinary shapes"), `260804-0140-turn7-…` ("18 verdicts"),
`260804-0106…` ("zero rows of the 119-command ordinary-agent corpus")
**Kind:** REGRESSION of accuracy introduced by `c9c44a3`.

---

## What is wrong

`rules/protected-path-discipline.md:168` tells every agent in every consuming project:

> The cost is these five shapes, and nothing else measured moved:
> ```
> cd build; rm out.js
> cd docs; rm ../notes.txt
> mkdir -p build && cd build; rm out.js
> cd hooks && npm run build; rm -rf dist
> cd build || exit 1; rm out.js
> ```

"Nothing else measured moved" is true only of the corpus it was measured on — command
strings harvested from the suite's own test files. The implementer says so in the
history and the decision record; the shipped rule does not, and an agent reading it will
believe five shapes changed.

A corpus derived from the tests cannot contain a command nobody thought to test. Two of
the three families below were not in it.

## Measured

**A curated ordinary-agent-work corpus, 30 shapes, `048f3db` vs HEAD: 10 newly deny.**

```
  allow -> DENY   cd hooks &&\n  npm run build &&\n  rm -rf dist   # 260804-0838
  allow -> DENY   cd docs\nrm draft.md
  allow -> DENY   cd hooks; rm -rf dist
  allow -> DENY   cd hooks; npm test > out.log                     # neither cost table
  allow -> DENY   cd hooks; npm ci > install.log 2>&1              # neither cost table
  allow -> DENY   cd hooks || exit 1; npm test > out.log
  allow -> DENY   cd hooks && npm test; rm -rf dist
  allow -> DENY   mkdir -p out; cd out; rm -f stale.txt
  allow -> DENY   if cd hooks; then rm -rf dist; fi                # 260804-0839
  allow -> DENY   while cd build; do rm out.js; break; done        # 260804-0839
  allow -> DENY   cd hooks && npx tsc | tee typecheck.log          # 260804-0839
```

**A generated cross-product of 222,319 commands (heads × joiners × directory builtins ×
joiners × writes, plus compound-command shapes): 78,986 newly deny, 0 newly allow.**

The 0 is the number worth keeping — see the review. The 78,986 is the point here: the
class of newly-denying commands is not five shapes and is not eighteen.

Three families are absent from **both** shipped cost tables:

1. **The `&&`-newline continuation** (`260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`) — a false deny.
2. **A conditional body or a pipeline inside an `&&` chain** (`260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`) — false denies.
3. **A redirection to a literal relative target after an unproven `cd`.** This is the
   cross product of the two halves of the Turn. The degrade table shows no redirection
   row; the cause-split table shows three rows and every one of them carries a `$`. So
   `cd hooks; npm test > out.log` — every word a literal — appears in neither, and it is
   the shape most likely to be met.

The last family is a genuine policy cost, correctly taken. It is simply not stated.

## Recommended fix

In `rules/protected-path-discipline.md`, replace "The cost is these five shapes, and
nothing else measured moved" with a statement of the **rule** plus examples:

> Any relative write — a table verb's operand **or a redirection target** — that is
> reached after a directory builtin across a joiner other than `&&` now denies. The five
> shapes below are the ones a test corpus contained; the rule is what to reason from.

and add a redirection row (`cd hooks; npm test > out.log`) to the table. Same in
`README-hooks.md`. Rename the test case from "costs exactly these five ordinary shapes"
to something the assertion supports, e.g. "pins the five shapes shown to the user at the
gate".

The `260804-0106` claim "zero rows of the 119-command ordinary-agent corpus"
should be annotated with what that corpus did and did not contain — a 30-row corpus
built without looking at it moves 10 rows.

---
Resolved (T8-1, 2026-08-04): the enumeration is gone from every shipped surface and is
replaced by the rule that produces the denials, with the examples labelled as examples.

`rules/protected-path-discipline.md` — "A `cd` is tracked" now opens with the rule in a
block quote ("once a `cd`, `chdir`, `pushd` or `popd` has run, the working directory is
unknown in every segment reachable without an `&&`, and a mutation with a relative operand
there is denied fail-closed"), followed by three ordered questions that decide any command,
then a deny/allow illustration block headed **"Illustrations, not a list"** which says in
so many words that the set is open. The three families the review found missing are in it:
the redirection-to-a-literal-relative-target rows (`cd hooks; npm test > out.log`), the
`260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` over-denies, and the bare-newline joiner. The section also states plainly why
the old claim was false — a corpus harvested from the suite can only reproduce what the
suite contains — and records that a generated cross-product moved 10 of 30 ordinary shapes.

`README-hooks.md` — the `cd`-is-tracked bullet carries the same rule and the same
correction, with three of the missing shapes named.

`hooks/lib/bash-mutation-guard.ts` module docstring — "the rule to state is every segment
reachable without an `&&` from the builtin, not a list of shapes", with the reason.

`bash-mutation-guard.test.ts` — the test formerly titled "costs exactly these five ordinary
shapes" is now "costs these ordinary shapes, which are examples of the rule", its docstring
says adding a row is expected and the rule is what must not drift, and five of the review's
rows were added to it (`cd hooks; npm test > out.log`, `cd hooks; npm ci > install.log
2>&1`, `if cd hooks; then rm -rf dist; fi`, `while cd build; do rm out.js; break; done`,
`cd hooks && npx tsc | tee typecheck.log`). Its "nothing else in a 4203-command corpus
moved" comment is gone.

`260804-0106` — the "zero rows of the 119-command ordinary-agent corpus" claim
now carries an annotation saying what that corpus did and did not contain.

Every row above was measured through the real classifier before being written down.

Method change, which is the part that matters: cost is now measured with a **generated
cross-product** (heads × joiners × directory builtins × joiners × writes, plus the
multi-line and compound shapes a flat product cannot reach) rather than with a harvest of
the suite's own string literals. The generator is ~40 lines and found all three missing
families in one run.
