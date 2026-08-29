The prose metric's worked exhibit reports six em-dashes in a file that carries four

---

**Severity:** Low
**Domain:** code
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `bin/fusion-prose-metric:66-67` and `:112-120`
**Cross-references:** `260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md` (why nothing catches this); `260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`

---

## What is wrong

`bin/fusion-prose-metric` documents its own YAML exclusion rule with a worked figure taken from
`chat-voice-de.yaml`. Both halves of that figure are now wrong, and the header states them in the
present tense.

`bin/fusion-prose-metric:66-67`:

> This is what makes a voice profile measurable at all: chat-voice-de.yaml carries 6 em-dashes
> of which 4 are the anti-example strings it exists to forbid.

Measured at `dbf259a`:

```
$ grep -o '—' stilwerk/chat-voice-de.yaml | wc -l
       4
$ bin/fusion-prose-metric stilwerk/chat-voice-de.yaml
file                         em-dash   words  /1000  permit  verdict
stilwerk/chat-voice-de.yaml        0     595    0.0       0  ok
```

Four, of which four are in `examples:` subtrees. The sentence's point is that the exclusion rule
is what separates a profile's prose from its exhibits, and the file it uses to show that now has
nothing left on the prose side. The exhibit no longer exhibits.

`bin/fusion-prose-metric:115-120` carries the second figure:

> The sixth is chat-voice-de.yaml, where the table reads 882 prose words and this program reads
> 617. 882 is that file's raw `wc -w` [...] 617 is the count under the stated rule, and the rate
> moves from 2.3 to 3.2 per 1000.

The program reads 595 today. With the em-dash count at zero the rate is 0.0, so neither 3.2 nor
the comparison it anchors can be reproduced.

## When it went stale, and what this Turn added

Not in this Turn's range, and this record does not attribute it there. Measured across the
revisions:

```
fac97f4 (the commit that wrote the header)   6 raw em-dash, 2 in prose, 614 prose words
02ea2bd (removed the two prose em-dashes)    4 raw em-dash, 0 in prose
084c626 (before this Turn)                   4 raw em-dash, 0 in prose, 606 prose words
dbf259a (HEAD)                               4 raw em-dash, 0 in prose, 595 prose words
```

The em-dash half was true when written and was invalidated by `02ea2bd`, one commit inside the
Circle that wrote the program. `dce8894` and `dbf259a` moved the word count 606 to 595 and did not
touch the em-dashes. So this Turn deepened the second half and caused neither.

The 617 in the header does not reproduce at `fac97f4` either; that revision measures 614. Three
words, and this record does not chase them: whatever version was measured, no version in the
history reads 617 at the moment the sentence claims it.

## Why it matters

The paragraph these figures sit in is the program's claim to authority over the hand-written table
it replaced: "all six em-dash counts and five of the six word counts reproduce exactly". A reader
who checks that claim against the one file it names finds it does not, and cannot tell from the
header whether the program drifted or the file did.

## What to do

Two shapes, and they are not the same decision.

1. **Re-measure and restate.** Cheapest, and it puts the header back where it was until `02ea2bd`
   moved the file, which is to say it will go stale again the next time a profile is edited.
2. **Cite a file that is not under active edit, or state the figure as of a named revision.** The
   sentence's job is to show what the YAML exclusion rule does, and any file with exhibits does
   that. Naming the revision is the project's own remedy for a measured figure that is true of a
   moment, used in the residual note of
   `260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`.

Owner is `coder`, not `ontocoder`: the fix is prose in a bash header, and no structured data
changes. The four YAML profiles are correct as they stand and must not be edited to make the
header true again.

---
Resolved: fixed — both figures are stated as of revision `fac97f4`, in the past tense, with the note that 617 did not reproduce there either (614); no profile was edited; `bin/fusion-prose-metric` header, "What prose means" item 4 and "The hand count this replaces"
