# The "one fact about a joiner, in one place" guarantee is asserted over one file, and a second file already holds the same fact

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, incremental review of `4f1007f`
**Affects:** `hooks/lib/__tests__/bash-mutation-guard.test.ts` (`the joiner table > keeps one fact about a joiner in one place`); `hooks/lib/bash-mutation-guard.ts:1706-1730` (the `JoinerFacts` docstring); `hooks/lib/shell-parse.ts:678-686`
**Kind:** NEW in `4f1007f` as a *claim*. The second home for the fact is pre-existing (`0f9…`/`cc012fc` era, the `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md` newline work).
**Cross-references:** `260804-0947_*_…` option 4 (the mitigation this guarantee IS); `260803-2237_*_…` and `260803-2039_*_…` (the two defects the guarantee exists to prevent recurring); `260804-1205-shell-reachability-model` (the Circle that restructures the second file).

---

## What is wrong

`260804-0947_*_…` chose option 4 over option 1-alone, and the stated con it
accepted is that the module would hold **two facts about a joiner in two places** until the
reachability model lands. The mitigation is that both facts became rows in one table and
that no give-up compares a joiner to anything. The test that pins it:

```ts
// hooks/lib/__tests__/bash-mutation-guard.test.ts
const src = readFileSync(join(HERE, "..", "bash-mutation-guard.ts"), "utf8");
```

It reads **one file**. Verified by mutation: adding a third joiner-literal comparison inside
`bash-mutation-guard.ts` fails it (1 test), so the assertion is live for that file. But
`hooks/lib/shell-parse.ts:678-686` already holds one of the two facts, keyed on the same
literal, and the assertion cannot see it:

```ts
// hooks/lib/shell-parse.ts:678-686, inside `flush`
} else if (pending === "&&" && next !== "newline") {
  // The operator flushed nothing, so TWO operators stand between the last
  // emitted segment and the next one (`a && ; b`, or `a && | b`).
  // The weaker wins: `&&` is the only joiner that guarantees anything, and
  // it stops guaranteeing the moment something else can reach past it.
```

"`&&` is the only joiner that guarantees anything" is `carriesCdForward`'s content, written
out as prose and encoded as `pending === "&&"`. So the fact lives in two files: as a table
row in `JOINER_FACTS`, and as a literal comparison in the lexer's downgrade branch.

## Why it is Medium and not High

**Nothing is wrong today.** The two places agree, because `&&` is the only joiner with
`carriesCdForward: true` that can ever be `pending` at that branch (`start` is explicitly
excluded there, and is the only other true row). I could not construct a command where the
two disagree, and I looked: 45,657 generated commands and a second 2,880-evaluation
adversarial round produced zero divergence in either direction.

**What is wrong is the shape, and it is the shape the record priced.** The two places are
inverted with respect to each other. `JOINER_FACTS` is a **safe-list** — a joiner with no
row answers `false` to both, so a new joiner is unguaranteed by default. The lexer branch is
an **unsafe-list** keyed on `&&` — a new joiner reaching that branch as `pending` gets *no*
downgrade and is handed on intact. If someone adds a joiner `X` with
`carriesCdForward: true` to the table, `a X ; b` gives `b` the joiner `X` rather than the
weaker `;`, and the write-side give-up does not fire. That is the ALLOW direction, and it is
reachable by an edit that touches only the table — the one edit the docstring tells a
reader is safe.

## Why now rather than later

`260804-1205-shell-reachability-model` restructures `hooks/lib/shell-parse.ts` from
a segmenter into a parser, by its own Directive. That is the file holding the second copy,
and it is the next thing to be edited. A guarantee scoped to the *other* file is at its
least useful precisely then.

## A second, smaller thing in the same docstring

`hooks/lib/bash-mutation-guard.ts:1716-1718` hands the reader a one-line check:

```
 *     grep -c '\.joiner' hooks/lib/bash-mutation-guard.ts   # => 1 (in code)
```

Run as written, at HEAD, it returns **3**. Two of the three hits are the docstring itself,
one of them being the line that states the recipe. The parenthetical "(in code)" carries the
whole claim and no command is given that does the stripping — the test does it in
TypeScript. A reader who runs the documented check gets a number that contradicts the
comment two lines above it. This is the third generation of an audit recipe in this module
that is wrong as written (`260804-1027_*_…` is the second), and the fix is to quote a
command that actually returns 1, or to point at the test and drop the recipe.

## Recommended fix

Two candidate directions; the second is a design choice and wants a decision record if
taken.

1. **Widen the assertion.** Read both `bash-mutation-guard.ts` and `shell-parse.ts` in the
   source test, and allow the lexer exactly the comparisons it needs, named. Cheap, and it
   makes the second home visible instead of silent.
2. **Move the downgrade rule onto the table.** The lexer branch asks "does `pending` still
   guarantee anything" — which is `joinerFacts(pending).carriesCdForward`. Importing
   `bash-mutation-guard.ts` into `shell-parse.ts` is the wrong direction (the lexer is the
   lower layer and the git classifier's insulation depends on it staying free of the
   mutation module), so the table would have to move down into `shell-parse.ts` or into a
   third module. That is a restructuring, and it is the follow-on Circle's business, not
   this one's.

Whichever is taken, the docstring's claim — "there is no second place where a joiner means
something" — should be narrowed to the file it is true of, today.

## Anti-vacuity

Direction 1 is checkable by mutation: change `pending === "&&"` to
`pending === "&&" || pending === ";"` in `shell-parse.ts` and the widened assertion must
fail. It does not fail today, which is the finding.

## Origin

Found by running the docstring's own `grep` recipe during the incremental review of
`4f1007f`, then grepping the rest of `hooks/lib/` for readers of `joiner`.

---

**Step 3 disposition (coder, 2026-08-05) — A-shaped, foreign file. STAYS `_o_`.**

Both halves are branch A in kind — a docstring claim narrower than it reads, and an audit
recipe that returns the wrong number — and both live in files step 3 does not own
(`hooks/lib/bash-mutation-guard.ts`, `hooks/lib/shell-parse.ts`, and the source test that
pins the claim). This step changes no code and no test.

One of the six findings whose shape the plan's rule has no branch for; reported to the
orchestrator as such.

**Where it is answered, and why waiting is the worse of two costs.** This issue's own
§ "Why now rather than later" is the argument: `260804-1205-shell-reachability-model`
restructures `hooks/lib/shell-parse.ts` from a segmenter into a parser, which is the file
holding the second copy of the fact. A guarantee scoped to the other file is at its least
useful precisely then. That is a reason to route this finding **into** that Circle's opening
context rather than to leave it as a background record, and it is recorded here so the
routing is not lost. Its direction 1 — widen the source assertion to read both files — is
cheap and does not wait on the restructure.

Nothing is wrong in behaviour today, as this issue states and measured across 48,537
commands. It stays open on the shape, not on a verdict.

---
Resolved: Der Gegenstand existiert nicht mehr. Die behauptende Zusicherung stand in `hooks/lib/__tests__/bash-mutation-guard.test.ts`, der `JoinerFacts`-Docstring in `hooks/lib/bash-mutation-guard.ts:1706-1730`, das zweite Zuhause der Tatsache in `hooks/lib/shell-parse.ts:678-686`. Erste beide Dateien sind mit `ba7ccda` gelöscht; `shell-parse.ts` ist im selben Commit auf das zurückgeschnitten, was die Branch-Politik braucht. Am Baum nachgeprüft in der Reconciliation 260807-1515 gegen HEAD `e684eae`: weder `JoinerFacts` noch `SegmentJoiner` kommen außerhalb von `hooks/dist/` noch vor. Es gibt keine Joiner-Tatsache mehr, die an zwei Orten stehen könnte.
