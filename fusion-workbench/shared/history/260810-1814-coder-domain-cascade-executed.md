# coder — execute the domain cascade instead of linting its prose

**Status:** Complete
**Task:** `I:260810-0503-cascade-lint` (tasklist task 6), Turn 1 of session `260810-1646-orchestrator-session.md`
**Source:** `260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`
**Domain:** code

---

## What the defect was

`hooks/lib/__tests__/domain-cascade-order-lint.test.ts` guarded the branch order of the
workbench-domain cascade in `agents/orchestrator.md` Setup Step 5 by asking whether a branch's
*text* mentioned `code_files`. Four edits that reinstate issue `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` in full passed it: a
decoy `elif code_files < 0` above a restored pre-fix order, an inverted `elif code_files == 0` in the
`> 0` slot, a dead `elif code_files > 100000`, and the token present only in a trailing comment. The
second helper, `assertAbsentCountFirst`, had never been shown to reject anything — the block that
looked like its negative control was a second positive assertion.

## What was built

**`hooks/lib/domain-cascade.ts`** (new) — the cascade, executed rather than described. It extracts
the fenced block from the prompt, tokenises and parses each branch condition into an expression tree
(comparison / `and` / `or` / arithmetic over the seven counts Step 5 gathers), validates the chain's
shape (`if` first, `elif` in the middle, a final `else` so the cascade is total), and evaluates it
against a set of counts.

The anti-drift property, which was part of the acceptance: **there is no second copy of the
cascade.** Writing the six branches out again in TypeScript would create two definitions of one
decision with nothing keeping them equal — the same class of defect moved one file over. The
interpreter runs the prompt's own block, so drift is unrepresentable, not merely guarded. The price
is strictness, and it is deliberate: anything the grammar cannot read raises `CascadeError` rather
than being skipped, so a renamed count, an unanticipated condition form, a missing `else` or a fifth
domain fails loudly instead of quietly shrinking what the gate covers. Trailing comments are stripped
before parsing, which is why a token hidden in one can no longer satisfy anything.

The absent count is modelled as the string `bin/fusion-count-sources` actually prints
(`unavailable`), not as a zero. A branch that reads it arithmetically therefore **throws** — the
behavioural form of the `counted_by == "none"` line's load-bearing position.

**`hooks/lib/__tests__/domain-cascade.test.ts`** (new) — asserts three properties:

1. **Verdicts** for the projects commit `2910cf6` measured. Both sides were measured for three of
   them (this repository 88/21 → `code`, KRK 108/11 → `code`, an ontology tree 2/30 → `data`) and
   only the code side for Cargo (27), Go (19) and the frontend (11), which are asserted across every
   data count that does not trip the documented ratio rather than against an invented one. Every
   `code`/`data` scenario carries the artifact profile that produced the original defect — 122
   commits, three open decisions against one open defect record — so a `strategic` answer anywhere is
   `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` returning. One case runs `bin/fusion-count-sources` against this repository live and
   feeds the result to the cascade, so helper and prompt are gated as a pair.
2. **No dead branch** — every branch fires for some input across a ~5 000-case sweep plus the
   absent-count shape.
3. **The absent count** answers `code` without arithmetic reaching `unavailable`.

**`hooks/lib/__tests__/domain-cascade-order-lint.test.ts`** (rewritten) — kept as the narrower
second gate, because the prompt's own prose asks an editor for that order and something should
measure it. `firstIndex` on line text is gone; both helpers now read the **parsed condition** through
`variablesRead`, so a comment cannot answer for a test and a renamed variable fails loudly. Its
header states plainly that it is no longer primary and what it still cannot see. The missing negative
control is added: `assertAbsentCountFirst` is fed a cascade with `if code_files > 0` above the
`counted_by == "none"` branch and expected to throw, matched on `260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md` — an issue ID only that
helper emits.

**`README-hooks.md`** — one row for `lib/domain-cascade.ts`, required by
`derivable-enumerations-lint.test.ts`, which lints that table against the files that exist.

## What was deliberately not done

- **No `bin/` wrapper.** Nothing would call it: the orchestrator evaluates the cascade itself from
  the prompt, and rewiring Step 5 to shell out to a helper is a larger edit than this task's scope
  allows in a file another coder was editing in parallel. An uncalled binary is speculative. If that
  rewiring is wanted, the module is ready for it — `domainFor(markdown, counts)` and
  `countsFromHelperOutput(stdout)` are the two entry points a CLI would need.
- **No edit to `agents/orchestrator.md`.** The block is located by its content, so no marker or
  anchor comment is needed; the anti-drift property comes from having one definition, not from an
  anchor. The file is untouched by this task (`git diff` over lines 100–200 is empty against `HEAD`).

## Verification

`npm test` from `hooks/` — **exit 0**, 1096 tests across 41 files.

Beyond that, the four defeats were applied to the **real** `agents/orchestrator.md` and measured,
alongside the predecessor gate taken verbatim from `HEAD` (which confirms the record's finding rather
than accepting it on trust). A throwaway script made a backup, applied each mutation, ran the three
gate files separately for their exit codes, and restored the file; the Setup Step 5 region was
verified byte-identical to `HEAD` afterwards.

| cascade | behavioural (new) | order lint (new) | order lint (the predecessor) |
|---|---|---|---|
| unmutated prompt | PASS | PASS | PASS |
| decoy `elif code_files < 0` above the pre-fix order | **FAIL** | PASS | PASS |
| inverted `elif code_files == 0` in the `> 0` slot | **FAIL** | PASS | PASS |
| dead threshold `elif code_files > 100000` | **FAIL** | PASS | PASS |
| token only in a trailing comment | **FAIL** | **FAIL** | PASS |

The four defeats are also driven in-memory inside `domain-cascade.test.ts`, so the demonstration
lives in the suite rather than only in this log — each mutation is asserted to break the behavioural
contract *and* to classify KRK as `strategic`, which is the defect stated as a verdict.

## Caveat worth recording

Running the mutation script meant writing to `agents/orchestrator.md`, which another coder was
editing in the same Turn (Step 3b). The backup-and-restore window was about four minutes. Their edit
survived and is intact in the working tree, verified by diff, but the manoeuvre was riskier than it
looked and a future demonstration of this kind should copy the repository rather than mutate a file
another agent owns.
