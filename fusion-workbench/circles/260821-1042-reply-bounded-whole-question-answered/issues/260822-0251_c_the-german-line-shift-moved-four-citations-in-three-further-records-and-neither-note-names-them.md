The German line shift moved citations in three further records, and the two notes that survey it name none of them

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing `dbf259a..d6b867e`, review file `260822-0251-ontorev-the-moved-clause-and-the-restored-anchor.md`
**Affects:** `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md:135-137`, `260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:71-73`
**Cross-references:** `260821-0250_*_three-of-four-section-headings-carry-58-citations-and-no-gate-notices-when-one-is-renamed.md` (the same uncaught-citation class, one token form over); `260821-2349_*_closing-the-plan-and-the-verbosity-record-dangles-seventeen-marker-literal-citations.md` (the same class, marker literals); `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` (the open record two of the moved citations sit in)

---

## What is wrong

`746ae4d` added one line to the German `C01` entry and removed one from `C04`, so German lines
22 to 45 each moved down by one and numbering returned to its old values from `C05` (line 47)
onward. That measurement is correct and both records state it.

What is wrong is the account of who was pointing into that range. Both notes name the same
scope, and `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md` states it inside a paragraph headed **Verified.**:

> German lines 22 to 45 shift by one and return to their old numbers at C05, which reaches only
> this record, `260822-0117`, and two review files, all of them outside the citation gate's corpus.

Four line citations in **three records outside that set** were exact before the commit and are
one line off after it. Two of the three records are open (`_o_`), and one of those two is the
record the same reviewer's sequencing note called the largest single quality gain available in
these files.

| Citing record | Cites | Held at `53ff99f` | Holds now |
|---|---|---|---|
| `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`, `:8` and `:20` | `stilwerk/chat-voice-de.yaml:24` | `name: "Klartext-Referenten"` | `- id: C02` |
| the same record, `:20`, table row, bare `:26` form | `:26` | `Nackte Kürzel und Zähler immer mit ihrem Bezug nennen.` | the `instruction:` key |
| `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md:13` | `stilwerk/chat-voice-de.yaml:41-43` | the three opening lines of `C04`'s caps deferral | the `instruction:` key and the first two of them |
| `260816-0740-rhetorical-register-of-agent-output.md:113`, and `:205` with `:635` | `:31` (C03) and `:23` (C02) | the two `- id:` lines | the blank line above each |

Each pair was read directly, `git show 53ff99f:stilwerk/chat-voice-de.yaml` against the tree.
The English file is untouched by this: its numbering is unchanged, which both notes state and
which a `diff` over its `id:` lines confirms, so every English citation still resolves.

**One citation that looks like a fifth instance is not one, and this record does not claim it.**
`260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md:6`
cites `chat-voice-de.yaml:41` for the string `Gate-Prompts bis 8 Zeilen, Chat-Antworten bis 12 Zeilen`,
which `5ed284d` removed well before this Circle. That pointer was already stale in content.
`746ae4d` neither broke it nor owns it.

## Why it matters, and how much

The pointers themselves are cheap to recover. Each citing record quotes the string it points at,
so a reader who lands one line high reads the next line and continues. The damage is not there.

The damage is that a **Verified.** paragraph asserts a surveyed scope and the survey was not run.
`rules/critical-stance.md` §3 is exactly this: an unchecked claim must not be dressed as a checked
one. A later reader has no reason to re-derive the citation impact, because the note says it was
derived. This Circle is closing, which is the moment a record stops being revisited.

Nothing catches it mechanically, and that is prior art rather than news:
`hooks/lib/__tests__/workbench-citation-lint.test.ts:111-115` places `stilwerk/` outside its
corpus and `surface()` in `reference-resolution-lint.test.ts` walks no `.yaml`. A line number is
in any case a token form no gate here reads.

## What to do

Two parts, and the first is the substance.

1. **Correct the scope claim** in the two notes, appended rather than rewritten, per
   `rules/fusion-workbench-conventions.md` `## Inline State Tracking`. The corrected statement is
   that four citations in three further records moved, two of those records open, and it names
   them.
2. **Repoint the four citations**, or restate them without line numbers.
   `260822-0115_*_` is the one that matters, because it is next to be worked and its
   whole argument is anchored to those two lines. `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md` needs one number range moved.
   `260816-0740-rhetorical-register-of-agent-output.md` is a finished analysis; an appended note is enough there, and
   a finished analysis is not retro-edited freely.

**Not in scope for this record:** whether the profiles should come inside a citation gate at all.
That is `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md` and route 2 of `260821-2204_c_`, both already open, and neither would
have caught a line number even if taken.

---
Resolved: All six affected citations repaired and the overstated scope claim annotated.

**The citations.** Each target line was read in `stilwerk/chat-voice-de.yaml` rather than derived by
offset, and both copies of the file are byte-identical (`diff -q`), so the same numbers hold for the
`fusion-workbench/stilwerk/` copy the records also name.

| Record | Was | Is | Line now holds |
|---|---|---|---|
| `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md:8` | `:24`, `:26` | `:25`, `:27` | `name: "Klartext-Referenten"`; `Nackte Kürzel und Zähler immer mit ihrem Bezug nennen.` |
| the same record, `:20` | `:24` | `:25` | `name: "Klartext-Referenten"` |
| the same record, `:21` | `:26` | `:27` | `Nackte Kürzel und Zähler immer mit ihrem Bezug nennen.` |
| `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md:13` | `:41-43` | `:42-44` | the three opening lines of `C04`'s caps deferral |
| `260816-0740-rhetorical-register-of-agent-output.md:113` | `:31` | `:32` | `- id: C03` |
| the same file, `:205` | `:23` | `:24` | `- id: C02` |
| the same file, `:635` | `:23`, `:31`, `:38` | `:24`, `:32`, `:39` | `- id: C02`, `- id: C03`, `- id: C04` |

**A sixth instance this record's table did not carry.** `:38` (`C04`) sits in the citation list at
`260816-0740:635`, inside the shifted range 22 to 45, and was stale from the same commit. It was
repaired with the two beside it: leaving one stale number between two corrected ones on a single
line would read as a checked list that is not one. The record's count of four table *rows* is right;
its coverage of that row is not.

**Not affected, and re-read to establish it rather than assumed.** `chat-voice-de.yaml:106` and
`:60` in `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`, and `:81`, `:104`, `:138`, `:156` in `260816-0740`, all sit at or after
line 46, where `diff` shows the file unchanged. `:138` and `:156` land on blank lines, but not
because of `746ae4d`; they were the same before it, so they are a separate question this record
neither owns nor claims. Every English citation resolves unchanged.

**The scope claim.** `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md` gains a `Revised by:` block naming the six citations and the
three records, with its `Resolved:` note and `_c_` marker left as they stand, per
`rules/fusion-workbench-conventions.md` `## Inline State Tracking`. What that block corrects is one
clause: the measurement of the shift itself was checked and is exact, and the assertion of who was
pointing into it was not.

**Part 1 is half done, deliberately.** The same claim is restated at
`260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:71-73`
and was **not** corrected: the dispatch scoped the correction to the issue record. The `Revised by:`
block on `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md` says so, so the gap is written down rather than closed.
