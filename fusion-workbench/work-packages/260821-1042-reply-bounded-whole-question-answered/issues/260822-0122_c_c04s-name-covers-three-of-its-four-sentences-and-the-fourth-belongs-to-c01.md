C04's name covers three of its four sentences, and the fourth belongs to C01

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-en.yaml:37-43`, `stilwerk/chat-voice-de.yaml:38-45`, and both `fusion-workbench/stilwerk/` copies
**Cross-references:** `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` (the same class, closed on its two instances); `260821-2215-coderev-the-bounded-reply-circle.md:85` (a prior review saw this and left it unfiled)

---

## What is wrong

`260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` closed on AI04 and C06. It was filed as two instances, not as a class, and the
class has a third member the two commits of this Turn left in place. C04 reads
(`stilwerk/chat-voice-en.yaml:38-43`):

    name: "Terse without sentence-length targets"
    instruction: |
      Keep it short. The line caps for a gate prompt and for a chat reply are
      stated in user-facing-output.md and are not restated here. Do not enforce
      sentence-length bands; short sentences are normal and welcome in chat.
      Details go to the end or to a file, not the opening lines.

Three sentences are terseness and the absence of sentence-length targets. The fourth is
neither. Moving detail to the end shortens nothing; it reorders. It is a rule about where
material sits, and the entry named for brevity does not lead a reader to it.

German carries the identical structure at `stilwerk/chat-voice-de.yaml:41-45`
("Details ans Ende oder in eine Datei, nicht in die ersten Zeilen").

## Where the clause already lives

`rules/user-facing-output.md:59` states it, as point 4 of `## Information architecture`:

> **Details / references.** Commit hashes, file paths, agent names, history-file paths,
> internal IDs, marker syntax: these go in a clearly separated trailing section called
> "Details" or "References", **not** in the opening lines.

The profile's C01 already mirrors point 1 of that same list, name and all: "Action first" against
"**Action first.**" (`rules/user-facing-output.md:56`). So the rule's information-architecture list
is echoed in the profile across two entries, one of which is named for it and one of which is not.

## Why it matters

Same reason `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` gave and this record does not restate at length: `name:` is the
profile's lookup surface, and a clause reachable only by opening every instruction body in full
is a clause an agent scanning for placement guidance will not find. The asymmetry is the sharper
half here. A reader looking for "where do details go" finds C01 by its name, reads it, and stops,
because C01 says nothing about details and nothing tells them to keep reading into the entry
about sentence length.

## What to do

Three routes, and this record does not choose between them.

1. **Move the sentence to C01.** C01 is the information-architecture entry and already carries
   the rule's point 1 under the rule's own heading. Byte-neutral within the file, no rename.
2. **Rename C04** to cover both halves, as `dce8894` did for C06. Costs bytes and produces a
   two-clause name for what would then be a three-topic entry.
3. **Cut the sentence.** `rules/user-facing-output.md:59` is always-on and states it in full, so
   unlike C06's clause this one is an echo rather than the only copy, and a project with no
   `stilwerk/` still gets it. That is the reverse of the situation
   `260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`
   found, and it is what makes cutting available here and not there. What it costs is the
   language-specific German rendering, which is the reason that record gave for keeping the
   profile echo after moving the authoring home into the rule.

Route 1 is the cheapest and the only one that costs nothing. This record does not decide it,
because C01's own budget and the residency premise of `260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md` both bear on it.

---
**Resolved 260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md** (ontocoder). **Route 1: the placement sentence moved to C01.** All four
copies, net negative on each file.

**What changed.** C04's fourth sentence left both profiles and arrived in C01 as the second half
of its ordering statement:

```
en  C01: "Reason comes after, details at the end or in a file."
de  C01: "Erst danach die Begründung, Details ans Ende oder in eine Datei."
```

C04 is now three sentences and every one of them is terseness: keep it short, the caps are stated
elsewhere, no sentence-length bands. The name covers the entry.

**Why route 1 and not route 2.** This record's own account of the failure decides it. A reader
looking for detail placement finds C01 by its name, reads it, and stops. That reader now finds the
clause. Widening C04's name leaves the same reader in the same place, one entry away from the
answer, and it costs bytes: `"Action first"` to `"Action first, details last"` is +14 English and
+17 German against a per-file budget that ends at −8 and −10. Paying it would have meant cutting a
worked example, the trade
`260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`
already refused for C06's split.

**C01's own name was not widened, and the move does not reproduce the defect there.** "Action
first" states the first slot of an ordering and the whole entry is that ordering; the moved
sentence states its last slot. One subject, one entry. C04's name named a different dimension,
sentence length, which is why the sentence could not stay in it.

**Route 3 (cut) was available and declined.** `rules/user-facing-output.md:59` states the clause in
full and is always-on, so an English reader loses nothing by the cut. What is lost is the German
rendering, which is the reason
`260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`
gave for keeping a profile echo after moving an authoring home into the rule.

**One clause did not travel: "not the opening lines" / "nicht in die ersten Zeilen".** In an entry
named "Action first" the opening is already claimed by the action, so the negation restates the
entry's own subject. One claim in two formulations is what C06 forbids, and dropping it is the
same self-correction `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` made inside C06.

**Bytes, `wc -c` against HEAD `53ff99f`**, whose copies of these four files are the ones `dbf259a`
left. Both findings of the review were taken in one pass, so
the four numbers below are the two records' combined effect and each record states its own share.

```
stilwerk/chat-voice-en.yaml                    6751 -> 6743    −8
fusion-workbench/stilwerk/chat-voice-en.yaml   6751 -> 6743    −8
stilwerk/chat-voice-de.yaml                    7316 -> 7306   −10
fusion-workbench/stilwerk/chat-voice-de.yaml   7316 -> 7306   −10

en:  C01 +33,  C04 −41 (−59 this record's sentence, +18 the anchor of 260822-0117)
de:  C01 +43,  C04 −53 (−65 text and −6 of reflow, +18 the anchor)
```

This record's share alone is −26 English (+33 into C01, −59 out of C04) and −28 German. Each of the
four files is net negative on its own, so the per-file budget in
`260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
is satisfied without borrowing from the other language or from the always-on corpus, which was not
touched.

**Verified.** All four parse (`ruby -ryaml`), both plugin/workbench pairs are byte-identical
(`diff -q`), and line counts are unchanged at 183 English and 186 German. English line *numbering*
is unchanged throughout, because C01 and C04 each kept their line count. German lines 22 to 45
shift by one and return to their old numbers at C05, which reaches only this record, `260822-0117_*_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md`,
and two review files, all of them outside the citation gate's corpus.

---
Revised by: `260822-0251_*_the-german-line-shift-moved-four-citations-in-three-further-records-and-neither-note-names-them.md` — the **Verified.** paragraph above states a citation scope that was never surveyed.

**What the paragraph verified and what it asserted.** Everything in it up to the final clause was
checked and is correct: all four files parse, both plugin/workbench pairs are byte-identical, the
line counts stand at 183 English and 186 German, English numbering is unchanged throughout, and
German lines 22 to 45 shift by one and return to their old numbers at `C05`. The measurement is
exact.

The final clause is not a measurement. "which reaches only this record, `260822-0117_*_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md`, and two
review files" names a set no survey produced, and it is wrong. Six citations in **three further
records** point into the shifted range, two of those records open (`_o_`) at the time this note was
written:

- `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`
  at `:24` twice (`:8`, `:20`) and `:26` once (`:21`)
- `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md:13`
  at `:41-43`
- `260816-0740-rhetorical-register-of-agent-output.md` at `:31` (`:113`), `:23`
  (`:205`), and `:23`, `:31`, `:38` again in the citation list at `:635`

All six were repaired against the file, each target line read rather than offset (`:25`, `:27`,
`:42-44`, `:32`, `:24`, and `:24`/`:32`/`:39`). The `C04` id line at `:38`, in that last list, is a
sixth instance the filing record's own table does not carry.

**The note itself is left as written**, per `rules/fusion-workbench-conventions.md`
`## Inline State Tracking`: it records what was claimed then, and rewriting the sentence would
erase the overstatement instead of pointing at it. The defect it closes is still closed and the
marker stays `_c_`. What moved is the reliability of one clause under a **Verified.** heading, which
is `rules/critical-stance.md` §3 exactly: an unchecked claim dressed as a checked one.

The same claim is restated at
`260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:71-73`
and is **left as written**: the dispatch that produced this note scoped the correction to this
record. A reader of that history file still meets the uncorrected scope.
