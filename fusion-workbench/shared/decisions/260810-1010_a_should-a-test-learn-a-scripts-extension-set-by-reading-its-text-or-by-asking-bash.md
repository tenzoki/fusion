# Should a test learn a script's extension set by reading its text, or by asking bash for the value?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (session `260810-0844-orchestrator-session.md`, Turn 3 — from a residual the T14 executor measured and correctly declined to patch)
**Cross-references:** `260810-0749_*_the-extension-parse-guards-against-matching-nothing-but-not-against-matching-less.md` (round 1, closed by `38fe341`); `260810-0939_*_the-declared-but-not-parsed-guard-is-anchored-like-the-regex-so-two-drift-shapes-still-cover-less.md` (round 2, closed by `c546ef0`); `hooks/lib/__tests__/fusion-count-sources.test.ts`; `bin/fusion-count-sources`; `rules/critical-stance.md` §4

---

## Question

`extensions(varName)` in the count-sources test reads the extension alternations out of
`bin/fusion-count-sources` by regex, rather than copying them, so the test cannot drift from
the script. The reason is sound and is not in question here.

What is in question is whether the reading can be made correct. This is now the **third** round
on one defect shape, each one a tighter anchor than the last:

1. The guard was a magic floor (50 for `CODE_EXT`, 15 for `DATA_EXT`). It caught a parse
   matching nothing and missed a parse matching some. Closed by `38fe341`, which replaced the
   floors with "every line declaring the variable must also parse".
2. That guard decided "declares the variable" with the same left-anchoring the match regex uses,
   so a declaration the regex could not see was invisible to the guard too. An indented line and
   a `+=` rewrite both left bash computing 60 while the test asserted over 52 and passed. Closed
   by `c546ef0`, which made the filter its own, wider pattern.
3. Four more spellings escape both filters today, each valid bash, each leaving the runtime value
   at 60 while the test covers 52 and throws nothing:

   ```
   export CODE_EXT="$CODE_EXT|…"        declare CODE_EXT="$CODE_EXT|…"
   : ; CODE_EXT="$CODE_EXT|…"           printf -v CODE_EXT '%s' "$CODE_EXT|…"
   ```

   `typeset` and `readonly` behave as `declare`; `read -r CODE_EXT <<<…` and `eval` behave as
   `printf -v`; `&&` and `||` behave as the leading separator. The generalisation the executor
   drew: **a declaration whose variable name is not the first token on the line escapes the
   filter.**

Each round has been a correct fix for the case it named, and each has been followed by another
case. `rules/critical-stance.md` §4 names this pattern precisely: a growing rim of special cases
is evidence about the problem's cut, not about the care taken on it, and when a question is
undecidable from the inputs the mechanism has, the mechanism changes rather than the
approximation.

## Options

1. **Keep reading the text; widen again when a case appears.**
   - Pros: no new mechanism; each round is small and the tests stay pure-JS with no subprocess.
   - Cons: three rounds in one day, and the fourth is already measured and sitting in this
     record. Widening further means matching `CODE_EXT` anywhere on a line, which starts
     catching the script's own *uses* (`count_matching "$CODE_EXT"`) and its header comment —
     so the next anchor is not merely wider, it is wrong in a new direction.

2. **Ask bash for the value.** Source the script (or run it under `set -a` with a stub for its
   work) and read `$CODE_EXT` / `$DATA_EXT` back, then compare against what the test intends to
   cover.
   - Pros: decides the question the test is actually asking. Every spelling above, and every one
     nobody has thought of, produces the value bash produces, because bash produced it. This is
     the mechanism change §4 asks for, and it is the same move fusion's own write guard made when
     it stopped predicting shell writes and started measuring protected paths.
   - Cons: the test gains a subprocess and a shell dependency, and it must run the script's
     assignments without running its `git ls-files` work — which needs the script to be
     structured so that is possible, or the test to source only a prefix of it. Neither is free,
     and the second reintroduces a text-reading step at a different place.

3. **Invert the direction: have the script emit its own extension set.** Add a documented mode
   (`fusion-count-sources --print-extensions`) whose output the test consumes.
   - Pros: no text parsing and no sourcing tricks. The script becomes the single source of truth
     for its own configuration, which is what the test wanted from the start.
   - Cons: adds a public surface to a helper for a test's benefit. Against that: the same output
     is plausibly useful to a human debugging why a file was or was not counted, so the surface
     may earn itself.

## Constraints

- Whatever is chosen must keep the property that closed round 1: the test may not carry a
  *copy* of the extension list. A copy drifts silently, which is the original defect and the
  worst of the available failure modes.
- The legitimate case must stay legitimate. When a line is genuinely deleted the script really
  does ship fewer extensions, and covering fewer is correct. Round 2 pinned this deliberately;
  any answer that turns a real reduction into a failure is worse than the defect.
- `bin/fusion-count-sources` is correct as it stands and is not the thing being fixed. Options 2
  and 3 both touch it, so each has to argue that the change is worth making to a working script.

## Recommendation

Option 3, tentatively, with option 2 as the fallback if the added surface is judged too much.

The reasoning is that option 2's cost is concentrated in exactly the place that has failed three
times: it needs to run the assignments without the work, and every way of doing that reintroduces
an assumption about the script's text. Option 3 has no such seam — the script computes its own
value by running, and prints it.

`speculation:` on whether the `--print-extensions` surface earns itself independently of the
test. Nobody has asked for it, and "a human debugging a count" is a use I have imagined rather
than observed.

---
Answered:
Implemented:
Deferred:
Superseded by:

---

## Answer (user, session 260810-0844-orchestrator-session.md)

**Option 3: the script emits its own extension set.** `bin/fusion-count-sources` gains a
documented mode whose output the test consumes, and the text parsing goes away entirely.

This is the mechanism change `rules/critical-stance.md` §4 asks for, rather than a fourth anchor.
Three rounds of tighter regex landed in one day — a magic floor, a left-anchored filter, a wider
filter — and the fourth was already measured before the third was committed: `export`, `declare`,
a leading separator and `printf -v` all escape, and the generalisation is that any declaration
whose variable name is not the first token on the line escapes. Widening again starts matching the
script's own *uses* of the variable, so the next anchor is not merely wider but wrong in a new
direction.

Sourcing the script (option 2) was rejected for the reason the record gives: its cost is
concentrated in exactly the place that has failed three times, because running the assignments
without the script's work reintroduces an assumption about the text.

The property that closed round 1 must survive: the test may not carry a copy of the list. Consuming
the script's own output satisfies that, since the script computes the value by running.

---
Answered: 260810-0844-orchestrator-session.md `## Grounding revision` — recorded at the Rebalance gate, session 260810-0844-orchestrator-session.md. Not yet realised in code; the defect record it unblocks stays open until a commit implements it.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; the answer is nine days old and nothing has been built.**

`bin/fusion-count-sources` has no `--print-extensions` mode, and no flag of any kind that emits its
extension set: `grep -n 'print-extensions\|--print'` over the script is empty.
`hooks/lib/__tests__/fusion-count-sources.test.ts:114` still defines
`extensions(varName, src = readFileSync(script))` and still parses the script's text by regex, which
is precisely the mechanism the answer replaced. Its own header at `:76-108` continues to narrate
the three rounds of tightening that led here, and `:335-366` still asserts the widened filter's
behaviour — so the file both records that the approach was abandoned and continues to implement it.

**What binds a deep change.** Until the mode is built, every extension declaration in
`bin/fusion-count-sources` must keep its variable name as the first token on the line. `export`,
`declare`, `typeset`, `readonly`, `printf -v`, a leading `:` or `&&`, and an indented or `+=` form
each leave bash computing one value while the test covers a smaller one, silently and with nothing
thrown. That is a real constraint on a two-line edit to a working script, and it is the reason the
answer chose to move the mechanism rather than widen the anchor again.
