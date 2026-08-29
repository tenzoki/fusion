# Session — the compound-as-pipeline-element defect, measured and closed

**Status:** Complete
**Agent:** coder
**Circle:** `260804-1205-shell-reachability-model`
**Plan step:** 2 (follow-up to the second diagram evaluation)
**Committed:** nothing — the user asked for measurement plus a fix, no commit.

## What was asked

A second diagram evaluation of the plan reported that
`{ cd build; } | grep x && rm out.js` would become a deny-to-allow transition with no
shell justification. It traced the plan's diagram, not the code, so the finding could
already have been closed by step 2's two refinements. Settle by measurement.

## What was measured

**1. Current classifier.** Denies, in both spellings — and so does HEAD `38c5123`, because
`bash-mutation-guard.ts` is byte-identical to HEAD and the only change to
`command-word.ts` is the additive `GRAMMAR_TERMINATORS` export. The reach layer is not
wired into the classifier yet, so no verdict can have moved. The reported transition is a
prediction about step 3, not a present fact.

**2. Reach edges.** The claim holds, and its mechanism is off by one segment. The
evaluation put the fault at `}` typing `transparent`; measured, `}` does type
`transparent`, but it hands on nothing (it closes), so the decisive fault is one segment
earlier — `{ cd build` typed `start`, a carrying edge. Fixing `}` alone would have left it.

**3. Shells.** `{ cd build; } | cat && pwd` prints the project root in bash AND zsh, in
both spellings. `{ cd build; } | cat && rm rules/x.md` deletes `rules/x.md` in both. The
class is wide: `if … fi | …`, `while … done | …`, `until … done | …`, `for … done | …`,
`case … esac | …` and a group nested in a group all behave the same, all in both shells.

**4. The class is worse than reported.** The reported operand (`out.js`) is harmless
wherever it lands, which is why the row read as bookkeeping. With `rm rules/x.md` the same
command deletes a protected rule.

## The fix

`hooks/lib/shell-reach.ts` — a new edge `pipe-exit`, `SPAN_OPENERS`, a per-scope span
stack and `spanIsPipelineElement`.

The design question the evaluation posed — does the subshell fact reach every segment of a
compound element, or only the segment the operator touches — is answered by neither, and
the answer is forced rather than chosen. Recorded in
`260807-0250_*_does-a-pipelines-subshell-fact-reach-every-segment-of-a-compound-element.md`
with the three shell rows that force each clause. In short: the fact is a property of the
ELEMENT and lands at its closing boundary; the interior keeps its ordinary edges because
inside the subshell the directory change is real (`{ cd rules; rm x.md; } | cat` deletes
`rules/x.md`).

Named tests: `shell-reach.test.ts`,
`describe("a compound command that is itself a pipeline element")` — nine cases including
the reported command verbatim, both spellings, all four compound heads plus `for`/`case`,
nesting, tail position, and the two bounds (a non-piped group still carries; a group that
merely contains a pipeline is not one).

## The corpus gap

The generator could not produce a compound command inside a pipeline at all — wrapper was
one dimension, so `brace` and `pipe-head` could not co-occur. Decided: the dimension lands
NOW, not at step 5, because step 3 moves the classifier and a dimension added after that
has no before-image. Added `POSITIONS` (`standalone` / `pipe-head` / `pipe-tail`), applied
to the four compound wrappers only.

The baseline fixture was regenerated a second time under the same licence and the same two
conditions, both checked: all 448 rows the committed fixture holds reproduce their verdict
byte for byte and keep their relative order, and the file only grows.

## Numbers

- suite: 1677 passed, 32 files, 0 failed (`npm test`)
- corpus: 38 192 → 93 744 rows; committed subcorpus 560 → 1008
- differential, committed fixture vs the classifier now: missing 0, added 0, moved 0
- differential, full corpus, HEAD `38c5123` → working tree: 93 744 rows,
  deny-to-allow 0, allow-to-deny 0, reason-only 0
- reach-layer blast radius of the fix: 60 032 / 93 744 rows move an edge (64.0 %), every
  one `transparent` → `pipe-exit` at a boundary — the deny direction only
- prospective step 3 model against the shells, 19 hand-built rows: 5 protected-path holes
  before the fix, 0 after
- witness over the 16 newly-generable rows with a protected relative target: 8 write a
  protected path in zsh (every `pipe-tail` row)

## Filed

- `260807-0250_*_does-a-pipelines-subshell-fact-reach-every-segment-of-a-compound-element.md`
- `260807-0251_*_the-corpus-cannot-generate-the-operand-shape-where-the-worst-holes-were-measured.md`
  — must land before step 3
- `260807-0252_*_joinerfacts-claims-a-pessimism-for-the-pipe-row-that-the-row-itself-does-not-carry.md`
  — no live hole, but step 3's table author is the one who would be misled

## Files touched

- `hooks/lib/shell-reach.ts`
- `hooks/lib/__tests__/shell-reach.test.ts`
- `hooks/lib/__tests__/helpers/reachability-corpus.ts`
- `hooks/lib/__tests__/reachability-corpus.test.ts`
- `hooks/lib/__tests__/fixtures/mutation-verdicts-head.json`
