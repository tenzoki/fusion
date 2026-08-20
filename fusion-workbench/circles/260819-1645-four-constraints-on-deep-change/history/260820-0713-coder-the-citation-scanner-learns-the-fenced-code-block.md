# The citation scanner learns the fenced code block

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260819-1645-four-constraints-on-deep-change`
**Step:** 9a — not in the plan; follows from the user's answer at the foot of
`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`
**HEAD at start:** `46133dc`

---

## What was built

`scanCitationTokens` judged one line at a time. The only multi-line construct it knew was the
blockquote, and that "construct" is a test of one character at the start of one line
(`/^\s*>/`); the enclosing loop carried no state at all. It now carries fence state, and a token
inside a closed fenced code block is `exempt` with its own reason, `fenced-code`, beside
`blockquote`.

One new exported function, `fencedContentLines(lines): boolean[]`, returning a mask parallel to
the input rather than a set of line numbers — indexed so that a caller passing a filtered or
repeated line list cannot silently collide two entries. The gate's own caller does filter:
`scannedLines` in the lint drops every non-comment line of a `bin/` script or a `hooks/**/*.ts`
source, so its line numbers are non-contiguous by construction.

`fenced-code` is placed **ahead of** `blockquote` in the exemption chain. Inside a fence a
leading `>` is a literal character — a shell prompt, a diff marker — so on a line that satisfies
both, the fence is the true reason and the quotation is a coincidence of the first character.
Both exempt either way; only the reported reason differs, and the reported reason is what a
corpus scan tallies.

## The three properties

### 1. A fence opens and closes

Implemented from CommonMark 0.31.2 §4.5, read on 2026-08-20 rather than recalled, because the
closing rule has three clauses and two of them are easy to get wrong from memory. What is
implemented:

- at least three consecutive backticks or tildes, and the two characters may not be mixed;
- either fence preceded by up to three spaces of indentation;
- a closing fence of the **same** character, **at least as long** as the opening one, and
  "followed only by spaces or tabs";
- the info-string rule — "if the info string comes after a backtick fence, it may not contain
  any backtick characters" — which is what keeps a one-line inline span written on its own line
  from opening a block that never ends;
- the opening fence's line (which carries the info string) and the closing fence's line are
  **not content**. A token on either is judged. That is the difference between exempting a
  transcript and exempting the sentence that introduces it.

What is **deliberately not** implemented, each stated at the branch in the source:

- **Container blocks.** A fence inside a list item sits at that item's content column, well past
  three spaces, and CommonMark scopes the fence to the container. This tracker is flat, so such
  a fence never opens — `agents/orchestrator.md:162` carries one at five spaces. The cost is
  that its content stays judged, which is the status quo and the safe direction. Dropping the
  indent bound instead would let any indented run of three backticks switch the gate off for an
  arbitrary span, which is the failure this whole step exists to avoid.
- **Tabs as indentation.** A leading tab advances to column 4 and so cannot introduce a fence.
  The pattern asks for spaces and stops there.

### 2. An unclosed fence exempts nothing — the departure, taken deliberately

CommonMark: *"if the end of the containing block (or document) is reached and no closing code
fence has been found, the code block contains all of the lines after the opening code fence
until the end."* This implementation does the opposite: the lines an unclosed fence opened are
**discarded** at the end of the walk rather than committed. A gate that one stray backtick line
can switch off for the whole remainder of a file is not a gate, and an unbalanced fence is a
record to fix rather than a region to stop reading.

**The departure is cheap on this corpus and that is a fact about the corpus, not an argument.**
Measured both ways over the whole workbench, 1 624 files and 15 128 tokens: the CommonMark
reading exempts 491 tokens as `fenced-code` and leaves 2 637 dangling; the strict reading
exempts 483 and leaves 2 640. Eight tokens and three violations separate them. Over the repair
corpus the two readings are identical (24 violations, 19 `fenced-code`), because it holds no
unclosed fence at all. The reason to take the strict reading is the shape of the failure it
refuses, not the size of the population it currently touches.

### 3. Indented code blocks — measured, not assumed, and left out

Four-space indentation is ambiguous with list continuation, and the instruction was to leave the
question alone **unless indented blocks already produce tokens today**. They do, so the finding
is reported rather than the exclusion assumed.

| corpus | tokens on a line indented four spaces or more | of those, not already exempt |
|---|---|---|
| shipped markdown surface | 2 | 2 |
| whole workbench, all `.md` | 182 | 179 |

Both shipped-surface instances are in `agents/orchestrator.md`, at lines 166 and 189 — five-space
continuation lines of a numbered list step, in running prose. Every workbench sample inspected
was the same shape: `portfolio.md:80` is an indented `/fusion:direct` command line inside a
bullet, and the rest are list continuations in decision records. Not one inspected sample was an
indented code block.

So treating four-space indentation as code would exempt 181 tokens on the strength of a guess
about which of two constructs the author meant, and 179 of them are judged today. That is the
wrong direction for a gate, and the question of whether an indented block should ever exempt is
left open rather than answered by this step.

## What moved on each caller

### `reference-resolution-lint.test.ts` — `BASELINE` did **not** move

**No re-approval note was written, and none was due.** `BASELINE = { paths: 1179, anchors: 155,
records: 104 }` stands unchanged; the test passes untouched. Per-class delta: **paths 0, anchors
0, records 0.**

That is zero by measurement and not by inaction, which is worth separating because the expected
outcome was a large move. The tracker fires hard on the shipped surface: **39 of the 81 surface
files carry at least one closed fence, and 1 411 lines are inside one.** What sits in those
1 411 lines is shell commands, layout trees, JSON fragments and frontmatter — **exactly two
citation tokens**, and both are of a kind the gate does not read:

| token | kind | in `GATE_KINDS`? |
|---|---|---|
| `rules/circle-records.md:103` | `stamp-bare` | no |
| `rules/fusion-workbench-conventions.md:28` | `stamp-name` | no |

`scanRecordCitations` skips every non-`GATE_KINDS` hit before it counts anything, so neither
token ever contributed to `records` and neither leaving scope can move it. Classes (a) and (b)
are separate functions in the lint file with their own line handling and were not touched at
all, so `paths` and `anchors` could not move in principle.

**The finding, stated because the next step may rest on it:** the shipped text is full of fenced
blocks and nearly empty of fenced *citations*. The gate was not silently judging the inside of
its own code blocks. Whatever this exemption is worth, it is not worth anything on the shipped
surface today — it is worth what the workbench rewrite of step 9 will make it worth.

### The workbench repair corpus — 26 violations become 24

Corpus assembled from the tree, matching the predicate step 8c's log records: Circle records in
every state, `portfolio.md`, issues carrying `_o_`, decisions carrying `_o_` or `_a_` in the wide
reading and `_o_` alone in the narrow one, `archive/` excluded. It reproduces the defect record's
26 exactly — same files, same line numbers — so the corpus is the same one that record measured.

| | before | after |
|---|---|---|
| files (wide) | 192 | 192 |
| tokens (wide) | 1 793 | 1 793 |
| **gate violations (wide)** | **26** | **24** |
| **gate violations (narrow)** | **26** | **24** |
| `exempt` total (wide) | 46 | 65 |
| of which `fenced-code` | 0 | 19 |

Per class, wide reading, as `kind/status`:

| | before | after | delta |
|---|---|---|---|
| `record/stale-marker` | 16 | 16 | 0 |
| `bare-record/stale-marker` | 8 | 6 | **-2** |
| `circle-record/stale-marker` | 2 | 2 | 0 |
| `record/resolved` | 791 | 788 | -3 |
| `bare-record/resolved` | 56 | 53 | -3 |
| `stamp-name/resolved` | 104 | 96 | -8 |
| `stamp-bare/*` (all) | 697 | 694 | -3 |

Nineteen tokens moved into `exempt`; **two of them were violations.** The other seventeen were
already resolving or already undecidable, so the exemption's visible effect on the gate is a
seventh of its effect on the scan.

## The measurement the next step depends on

**Of the 26 statement-citations, exactly 2 become `exempt` by this change alone, before anything
is rewritten. Measured, not estimated.** Both are in one record:

| record | line | what stands there |
|---|---|---|
| `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md` | 17 | a `grep -rl` command inside a fenced block |
| the same record | 77 | a `grep -ro` command inside a fenced block |

Both were already in the shape the answer prescribes — a verbatim transcript already living in a
fence — and the scanner simply could not see the fence. The same record's third violation, at
line 12, is a sentence of running prose naming a `planning/…_o_…` path, and stays judged. Every
one of the remaining 24 is prose.

**So the fenced-block exemption is not a repair; it is the place the repair can put things.**
The user's answer says so directly — it chose option 4, rewrite the 26, and named the fence as
"the smallest honest addition available, because a verbatim transcript belongs in one anyway".
Two of the 26 turn out to have been written that way already. The other 24 are step 9's work,
and this change is what makes that work expressible.

## Tests

New file `hooks/lib/__tests__/fenced-code-exemption.test.ts`, 168 lines, 14 tests in four
groups: the exemption itself, what opens and closes a fence, fences against blockquotes, and the
gate's view. It covers the four minimum cases named in the task — a token inside a fence is
exempt, a token after a closed fence is judged, a token after an unclosed fence is judged, a
fence marker inside a blockquote confuses neither — plus the marker-length rule, the trailing-text
rule, the info-string rule, the tilde/backtick non-mixing rule, the indent bound, and the two
gate-level properties (a fenced dead citation is not a violation, and a fenced live citation is
not counted as resolved either).

### Demonstrated failing, twice, on purpose

**Revert 1 — the unclosed-fence departure only.** Replaced the discard of `pending` at the end
of the walk with CommonMark's "commit to end of document", changing nothing else. Three tests go
red, and they are precisely the three that assert the departure:

```
× judges a token after a fence that never closes — the negative control
    → expected 'exempt' not to be 'exempt'
× opens on tildes as well as backticks, and does not close on the other marker
    → expected [ false, true, true, true ] to deeply equal [ false, false, false, false ]
× does not close on a fence marker that carries trailing text
    → expected [ false, true, true, true ] to deeply equal [ false, false, false, false ]
Tests  3 failed | 11 passed (14)
```

The second and third are the useful surprise. Both feed the tracker a fence that is opened and
then *not* closed — by the wrong marker character, and by a marker carrying trailing text — and
under the CommonMark reading each one silently exempts the rest of the input instead. That is
the switch-off failure the departure exists to refuse, arriving through two doors nobody would
have thought to guard.

**Revert 2 — the wiring only.** Left `fencedContentLines` in place and forced its branch in the
exemption chain to `false`. Four tests go red: the exemption itself, the `>`-inside-a-fence
reason, and both gate-level properties.

```
Tests  4 failed | 10 passed (14)
```

The two reverts are disjoint in what they redden, which is the property that says the test file
tests the tracker and the wiring separately rather than testing one thing twice.

## The golden that went stale

`hooks/lib/__tests__/fixtures/surface-growth.golden` — the machine-written record of the four
bounded surfaces' sizes. The hook-test surface moved and the golden test went red, as designed.
Regenerated with the one documented command; the diff is exactly the two files this step touched
and nothing else:

```
+  fenced-code-exemption.test.ts 168
-  helpers/citation-scan.ts 728
+  helpers/citation-scan.ts 832
-  total 19004
+  total 19276
```

**No baseline moved and none may.** `TEST_LINE_BASELINE` sums to 17 875 with 2 500 lines of
head room, so the bound is 20 375 and the surface now stands at 19 276 — **1 099 lines left**,
down from 1 371. Regenerating the golden does not move a baseline and does not clear a bound;
the bound assertion passed on its own terms both before and after.

## Verification

`cd hooks && npm test` — **exit 0**, 38 test files and 692 tests passed. Run with output
redirected to a file rather than piped, so the code read is the process's own. The suite was run
twice: the first run was **exit 1** on the stale growth-bound golden alone, which is the golden
doing its job, and the second after regenerating it.

## Files changed

```
hooks/lib/__tests__/helpers/citation-scan.ts          +104 lines (728 -> 832)
hooks/lib/__tests__/fenced-code-exemption.test.ts     new, 168 lines
hooks/lib/__tests__/fixtures/surface-growth.golden    regenerated, +3 -2
```

`hooks/lib/__tests__/reference-resolution-lint.test.ts` is **not** in this list, deliberately:
its baseline did not move, so it was not edited and carries no re-approval note for this step.

Nothing under `agents/`, `rules/` or `skills/` was touched, and no workbench record other than
this log. Step 8c's uncommitted workbench repairs were left alone. Nothing was committed and no
plan step was marked.

## What this step does not do

Three things the answer at the foot of the defect record asks for are **not** here, and each is
someone else's step:

1. **The 24 remaining statement-citations are not rewritten.** That is option 4 itself.
2. **The failure message does not yet name the two correct remedies** — correct the pointer, or
   fence it and name file and line — nor say that a file allowlist is not one. The answer places
   that on the gate's message, in the shape `BASELINE_MESSAGE` already uses; the gate it belongs
   to is step 9's and does not exist yet.
3. **The convention line in `rules/fusion-workbench-conventions.md` is not written.** Out of this
   step's file set by instruction.
