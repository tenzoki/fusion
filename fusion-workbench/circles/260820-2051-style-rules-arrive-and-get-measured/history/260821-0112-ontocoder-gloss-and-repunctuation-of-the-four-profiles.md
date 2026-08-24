# ontocoder: the German chat profile gains the English handle, and the four profiles are repunctuated

**Status:** Complete
**Date:** 2026-08-21
**Agent:** ontocoder
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**Task source:** user dispatch, carrying step 6's residual (`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0205_*_step-6s-acceptance-criterion-names-a-file-the-step-does-not-touch-and-is-unreachable-from-inside-it.md`) and plan step 7

Two changes, deliberately kept separable so they can be committed apart. The word change went in
first; the repunctuation followed it. Nothing was committed here.

## Part A: one clause in `stilwerk/chat-voice-de.yaml`

The issue names option 1 of its two: a single clause in the German chat profile carrying the English
phrase, rather than both handles in both writing profiles.

The gloss took the shape step 6 used in `stilwerk/default-voice-de.yaml:4`, a comment carrying the English
phrase in double quotes, parenthetical beside the German term:

```
# das Langform-Schreibprofil ("the long-form writing profile"), nicht dieses.
```

**The site was chosen against the split, not for prominence.** The file's first mention of the partner
profile is its header comment at line 4, which is the exact analogue of the site step 6 used. Line 4
also carries one of the two prose em-dashes part B had to replace. Putting the gloss there would have
made one *line* carry both changes, which is what the issue's own closing paragraph rules out ("a word
change and the repunctuation of the same file never share a diff"). The third mention, line 12, is a
comment too, is in the same sentence about the same thing, and part B does not touch it. The second
mention, the `description:` value at line 7, was passed over because the quotes inside a YAML
double-quoted scalar would have needed escaping and the gloss would not have read as step 6's shape.

The YAML data stays German. The gloss is in a comment.

**Acceptance:** `grep -ril "long-form writing profile" stilwerk/` now names all four files
(`chat-voice-de.yaml`, `chat-voice-en.yaml`, `default-voice-de.yaml`, `default-voice-en.yaml`). It
named three before.

## Part B: the repunctuation

Eight replacements across two files. The two long-form writing profiles needed nothing:
`default-voice-de.yaml` carries no prose em-dash, and `default-voice-en.yaml` carries one against a
permitted one.

| File | Line | Before | After | Mark and why |
|---|---|---|---|---|
| `chat-voice-en.yaml` | 4 | `NOT for long-form prose — that uses…` | `NOT for long-form prose: that uses…` | Colon. The dash introduced an explanation of the preceding clause; a comma would have spliced two independent clauses. |
| `chat-voice-en.yaml` | 11 | `are exempt — they stay terse and…` | `are exempt: they stay terse and…` | Colon, same shape. |
| `chat-voice-en.yaml` | 21 | `say so plainly: "Done — nothing for you to do."` | `say so plainly: "Done: nothing for you to do."` | Colon. See the note below. |
| `chat-voice-en.yaml` | 86 | `(clause — jargon aside — clause — compressed reason)` | `(clause, jargon aside, clause, compressed reason)` | Three commas. See the note below. |
| `chat-voice-de.yaml` | 4 | `NICHT für Langform-Prosa — dafür gilt…` | `NICHT für Langform-Prosa: dafür gilt…` | Colon, the German counterpart of the English line 4. |
| `chat-voice-de.yaml` | 11 | `ausgenommen — sie bleiben knapp…` | `ausgenommen: sie bleiben knapp…` | Colon, the German counterpart of the English line 11. |

**No sentence split was used, so criterion 3 holds by construction.** The two failure modes recorded
against the first repunctuation pass in this project were vague pronoun openers
(`shared/issues/260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md`)
and a mark weaker than the clause it replaced
(`shared/issues/260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md`).
A pronoun opener can only be created by splitting a sentence, and no replacement here did. The
case-sensitive token stream is byte-identical before and after, which is the same evidence the first
record used to find its three, read the other way: not one token gained a capital, so no new sentence
exists. The clauses that follow a new colon do open with `they`, `that`, `sie` and `dafür`, but each
follows a colon rather than a full stop, each has a concrete noun-phrase antecedent in the same
sentence, and none of the four words was written by this pass.

**On strength, the second record's fault.** Five of the six English replacements are the appositive or
explanatory case that record prescribes a colon for; none took the comma it names as the defect. The
three on line 86 are commas, and are the one place where the choice was not forced.

### Line 21, and why not the comma the German uses

`chat-voice-de.yaml:21` has always read `"Fertig, nichts weiter zu tun."` with a comma, so a comma in
the English would have made the two specimens parallel to the character. The colon was chosen against
that parallel, for the reason the weaker-mark record gives at its `:112` finding: what the dash marked
is an appositive, and the record's own correction for an appositive is a colon, with the comma named
as the fault. The two languages now use different marks for the same break. That is German and English
punctuation practice rather than a divergence in what the two files say, and the German mark was not
introduced by this pass.

### Line 86, and what it costs

`(clause — jargon aside — clause — compressed reason)` sits inside AI02's `instruction:` block, not
inside an `examples:` value. `bin/fusion-prose-metric` therefore counts all three, and criterion 1
cannot be met while they stand. Replacing them costs the entry its inline demonstration of the pattern
it names.

Three things make the cost acceptable and it is still a cost:

1. `rules/user-facing-output.md:132` carries the identical phrase and already reads
   `(clause, jargon aside, clause, compressed reason, all in one breath)`. That file was repunctuated
   in commit `6049d3e`, this replacement was among the 27 the review found sound, and the profile now
   matches the rule that owns the requirement.
2. AI02's `examples:` block at lines 89–90 still carries four em-dashes demonstrating the fault. The
   exhibit was not removed from the entry, it is only no longer duplicated in the entry's prose, which
   is where exhibits do not belong.
3. The user's own scope statement ties the exhibit exemption to "an example or anti-example value" and
   to what the metric excludes. Line 86 is neither.

**The German counterpart is now asymmetric with it, and nothing here changed that.**
`chat-voice-de.yaml:87` reads `(Klausel – Klammer-Jargon – Klausel – komprimierter Grund)` with **en**
dashes (`–` U+2013), which is the mark the German entry AI02 forbids and the mark
`bin/fusion-prose-metric` deliberately does not count (its `## Only the em-dash` section states the
narrowing and says a German rule about `–` is a separate reading it does not serve). So the German
entry still demonstrates the pattern inline and the English one now only lists its parts. Both entries
still say the same thing, and bringing them to parity would mean either restoring three em-dashes to
the English, which criterion 1 forbids, or repunctuating a German en-dash, which step 7's scope does
not reach. Left as found and reported to the user unfiled.

## Verification

| Check | Command | Result |
|---|---|---|
| Part A acceptance | `grep -ril "long-form writing profile" stilwerk/` | all four files |
| Part B criterion 1 | `bin/fusion-prose-metric stilwerk/*.yaml` | every file `ok`; the two chat profiles at 0 |
| Part B criterion 2 | token stream, `afterA` vs final | identical in all four files |
| YAML parses | `ruby -ryaml -e '…YAML.safe_load…'` | all four parse, top-level keys unchanged |
| Suite | `cd hooks && npm test` | exit 0, 40 files, 718 tests |

`bin/fusion-prose-metric stilwerk/*.yaml` after the work:

```
file                            em-dash   words  /1000  permit  verdict
stilwerk/chat-voice-de.yaml           0     628    0.0       0  ok
stilwerk/chat-voice-en.yaml           0     684    0.0       0  ok
stilwerk/default-voice-de.yaml        0     976    0.0       0  ok
stilwerk/default-voice-en.yaml        1    1014    1.0       1  ok
total (4 files)                       1    3302    0.3       3  ok
```

Before, from the same program: `chat-voice-de.yaml` 2 / 626 / 3.2 / permit 0 / over;
`chat-voice-en.yaml` 6 / 690 / 8.7 / permit 0 / over; `default-voice-de.yaml` 0 / 976 / 0.0 / ok;
`default-voice-en.yaml` 1 / 1014 / 1.0 / ok.

### The tokenisation criterion 2 was read under

A token is a maximal run of Unicode letters or digits. Every other character is a separator:
whitespace and **all** punctuation, the em-dash, colon, comma, hyphen, underscore, period, slash,
quote and backtick included. Case is preserved, so a capital gained at a sentence split would show as
a changed token, which is what makes the check able to see the first pass's three pronoun openers.
The comparison is a line-by-line `diff` of the two token streams, not a count.

```perl
$s =~ s/[^\p{L}\p{N}]+/\n/g;   # UTF-8 in and out; one token per line, empties dropped
```

Under it, part B changed nothing:

| File | Tokens | Differing lines |
|---|---|---|
| `chat-voice-de.yaml` | 869 | 0 |
| `chat-voice-en.yaml` | 917 | 0 |
| `default-voice-de.yaml` | 1447 | 0 |
| `default-voice-en.yaml` | 1330 | 0 |

Part A, measured the same way, adds exactly the five tokens of the English phrase to
`chat-voice-de.yaml` after token 91 and changes nothing else: `the`, `long`, `form`, `writing`,
`profile`. The other three files are byte-identical across part A.

**A limit of the tokenisation, stated rather than discovered.** It splits on the hyphen, so
`Langform-Schreibprofil` is two tokens and a change from `Langform-Schreibprofil` to
`Langform Schreibprofil` would be invisible to it. That is inherent to reading punctuation out of the
stream, which is the whole point of the check, and no replacement in this pass touched a hyphen.

## What was changed outside `stilwerk/`

Plan step 7 is marked `[DONE]` in
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`.
Nothing else. Step 6 was left as it stands, and the issue behind part A was left open at `_o_`: part A
satisfies its first acceptance bullet, its second is about step 6's own file list and acceptance
criterion agreeing, which this task did not touch.

## For whoever commits this

Part A and part B both touch `stilwerk/chat-voice-de.yaml`, within four lines of each other, so `git
diff` renders them as one hunk and a per-file split is not available. Two ordered patches were written
to the session scratchpad so the split is mechanical rather than hand-edited:
`partA.patch` (the gloss alone) and `partB.patch` (the repunctuation alone, applying on top of it).
From the repository root, with the tree as this task left it: `git apply -R partB.patch` puts the tree
at part A only, and `git apply partB.patch` restores it. `git apply -R --check partB.patch` was run
and passes.

---
**Correction appended 260824** (ontocoder, plan step 5 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`). The paragraph "On strength, the second record's fault" says five
of the six English replacements took the colon; this record's own table gives three colons
(`chat-voice-en.yaml:4`, `:11`, `:21`) and three commas (the three at `:86`). Six replacements, three
colons, three commas. The verdict the paragraph discharges holds on the corrected count: every
appositive or explanatory break took a colon, and the three commas at `:86` are the one site where the
choice was not forced. The sentence "A pronoun opener can only be created by splitting a sentence" is
also stated too strongly; the argument that holds is the paragraph's own next one, that none of the four
pronouns was written by this pass. Filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0149_*_the-repunctuation-records-evidence-paragraph-carries-a-count-that-does-not-reconcile-with-its-own-table.md`.
