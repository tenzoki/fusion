# Coder — Turn 3, task `P:cascade-reach`

**Status:** Complete
**Agent:** coder
**Session:** `260810-1646`, Turn 3
**Task:** close the three cascade-reach holes if closing them is right, and make the gate's reach
claim a measurement rather than a sentence
**Records worked:** `shared/issues/260810-2110_*_the-cascade-reach-gate-only-sees-a-domain-name-…`,
`shared/issues/260810-2110_*_the-cascade-reach-gate-is-line-scoped-…`,
`shared/issues/260810-2110_*_the-cascade-gates-file-set-is-justified-…` (all three `_p_` → `_c_`)

---

## The pattern the task named, and what was built for it

Three times in two Turns a gate was built and a claim was written about its reach, and the claim was
broader than the gate. Twice to this gate. The dispatch was explicit that a wider regex is not the
deliverable.

So the claim stopped being prose. `REACH` at the foot of `hooks/lib/domain-cascade.ts` holds the file
set, what is caught, what is missed, and what is not scanned — as data. Every entry carries probes,
and `domain-cascade.test.ts` runs them: each `covered` probe must fire, each `holes` probe must
**not** fire, each `excluded` glob must measure the verdict it claims, and the numeric cost a hole is
left open on is re-measured from the tree. The paragraph in `README-hooks.md` is rendered from the
same object by `describeReach()` and compared byte-for-byte.

The property that buys: a hole that gets closed without the list being corrected fails the suite. A
claim that outruns the gate fails here rather than being found by the next reviewer. And the file set
the gate scans is *derived* from `REACH.fileSet` rather than restated beside it.

**It caught its own author twice before the work was done.** The bare-word cost first written into
the claim was `12 / 16`, measured over the old file set with a harness that double-counted lines the
production path reports once. The re-measurement test failed and printed the 14 file:line pairs. The
number in the shipped claim is `14 / 14`, and it is measured on every run rather than remembered.

## Hole 1 — a domain name outside backticks or double quotes

`domainLiteralsIn` now matches a domain name **bracketed** by any of four inline markups: backticks,
double quotes, single quotes, asterisk bold.

Bracketing rather than the "span whose content is a domain" it replaced, and that was measured, not
preferred. A generic span rule including italics was tried first: in a corpus full of `code_files`
and `_o_` markers, `_..._` and `'...'` spans swallow the rest of the line, and that variant **lost**
the definition site's own `counted_by` line — 3 selections down to 2. Bracketing the name has no such
failure mode.

Against the pre-change build (`git show HEAD:hooks/lib/domain-cascade.ts`, run side by side):

| Probe | before | after |
|---|---|---|
| `Pick 'strategic' … otherwise 'code'.` | passes | **caught** |
| `Pick **strategic** … otherwise **code**.` | passes | **caught** |
| bare words — the record's headline probe | passes | passes |
| inputs in unlisted words ("questions", "defects") | passes | passes |

**Bare words are not matched, deliberately, on a measured cost.** `\b(code|data|strategic|knowledge)\b`
selects 14 lines of honest consumer prose across the scanned set, outside the definition site:
`agents/coder.md:24`, `agents/editor.md:3`, `agents/planner.md:33,38,83`,
`agents/playmaker.md:3,10,62`, `agents/reconciler.md:38,65,169`, `skills/cleanup/SKILL.md:98`,
`rules/fusion-workbench-conventions.md:286,287`. `code` and `data` are ordinary English words in
these files and `code files` is both a domain name and an input phrase, so the two-input rule does
not carry the discrimination. A gate that fires on honest prose gets disabled, which is worse than a
narrow one.

Both misses are now `REACH.holes[0]` and `REACH.holes[3]`, each with the record's own probe.

## Hole 2 — the detector was line-scoped and this repository wraps

`statementUnits()` yields every line, then every line joined to the line below it — but only where
that second line does not **open** a markdown block. A heading, list item, table row, blockquote,
fence, HTML tag and link definition each open one; a hard wrap never does.

The record proposed excluding table rows. That is not sufficient, measured: an unconditional two-line
window excluding only table rows selects `agents/playmaker.md:111` and `agents/reconciler.md:135`,
both adjacent bullets of a legitimate per-domain list — the table shape spelled as a list. The
continuation rule selects neither, and both are now `MUST_NOT_FIRE` fixtures.

The record's two-line probe: **passes** before, **caught** after. A wrapped statement reports once,
as its first line with `span: 2`; a pair whose own line already reported is dropped, so one statement
never appears twice.

Three or more wrapped lines is still a miss, and is `REACH.holes[1]` with a three-line probe.

## Hole 3 — the file set, and whether `rules/**` belongs in it

**It belongs, and it was added.** The reason the record gives is right: `rules/agent-setup.md` makes
reading every emitted rule mandatory, so a rule file is a consumer in exactly the sense a skill body
is. The reason the old comment gave — "the file set is the consumer set: the files an agent executes"
— excluded `rules/` while that sentence was true of `rules/`, and it is gone.

**Cost, measured before adding rather than after: 0 false positives across all 13 rule files**, with
the widened matcher and the continuation window both active. The scanned set went 32 → 45 files and
still selects exactly `agents/orchestrator.md:168,170,172`.

Demonstrated end to end on an in-memory copy (decision `260810-1820` — nothing in the working tree is
mutated to run a gate): a cascade statement spliced into `rules/agent-setup.md` is selected at its
line, where the previous file set could not read the file at all.

`docs/` stays out on the measured false positive at `docs/philosophy.md:19`, which says what each
domain *prioritises* in a line shape-identical to a paraphrase. `CLAUDE.md` and `README-hooks.md` are
in `REACH.excluded` with the verdict the suite re-measures, and `CLAUDE.md`'s note says plainly it is
an **uncovered** file rather than a justified exclusion.

## What is still open, stated as such

- **Bare-word domain names.** The plainest second copy still walks past. Cost measured and recorded;
  the standing alternative is the baseline-pin in `260810-2032` rather than a wider regex.
- **Inputs named in words `INPUT_PROSE` does not carry.**
- **A paraphrase across a table's rows or three-plus wrapped lines.**
- **A paraphrase naming no input.**
- **`CLAUDE.md` is a consumer and is not scanned.**
- **`skills/cleanup/SKILL.md:125` now understates the file set** — it says the gate scans "every agent
  prompt and every skill body", which is one third short. That file was held by another executor this
  Turn and was not touched. Filed here rather than edited.

None of this is a proof that one definition exists. It is a floor whose exact height is written down
and checked.

## Verification

`npm test` from `hooks/` — **exit 0**, 41 files, 1142 tests (1113 before this Turn; +29 from the new
probes, fixtures and end-to-end demonstrations). `hooks/dist/` rebuilt and confirmed self-contained:
0 `require(`, 0 external module specifiers (the single `from "keeping it failed"` grep hit is prose
inside a doc comment in `dist/lib/reverted-copy.js`).

The suite run included two other executors' in-flight edits to `agents/orchestrator.md`,
`skills/cleanup/SKILL.md` and `hooks/lib/__tests__/reference-resolution-lint.test.ts`. It passed with
them present.

## Files changed

- `hooks/lib/domain-cascade.ts`
- `hooks/lib/__tests__/domain-cascade.test.ts`
- `README-hooks.md`
- `hooks/dist/lib/domain-cascade.js`, `hooks/dist/lib/domain-cascade.d.ts` (rebuilt output)

`hooks/lib/__tests__/domain-cascade-order-lint.test.ts` was read and needed no change — it measures
branch position, which this Turn did not touch.
