The C04/C05 anchor split is verified in English and asserted for German, where its stated premise is false

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, reviewing `dbf259a..d6b867e`, review file `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0251-ontorev-the-moved-clause-and-the-restored-anchor.md`
**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/issues/260822-0117_c_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md:94-96`, and the same claim restated in `circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:38-39`
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md:133-136` (the review that credited `dbf259a` with removing an English heading string from German prose); `shared/issues/260822-0115_o_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` and `shared/issues/260822-0120_o_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md` (the open German-register records; this is a different fault and does not restate either)

---

## What is wrong

`746ae4d` restored `## Length` to `C04` and left `C05` anchorless, and both records give one
reason for the asymmetry:

> C05's anchor was character-for-character C05's own `name:` field and carried nothing either
> way, which is why the same commit was right about it.

**That is exactly true of the English file and false of the German one.** The originating record
was careful about this and verified it against one file:
`rules/user-facing-output.md:34` and `stilwerk/chat-voice-en.yaml:46` are the same string,
`Sketch structure instead of narrating it`. The resolution note dropped the qualifier and
generalised the claim to all four copies.

In German, the anchor `dbf259a` removed from `C05` was also `"## Sketch structure instead of
narrating it"` — the **English** heading. The German `name:` field one line above reads
`"Skizze statt Prosa bei Struktur"` (`stilwerk/chat-voice-de.yaml:48`). The two are a translation
of one another, not a character-for-character copy, so the reason given for keeping German `C05`
anchorless does not apply to German `C05`.

**A second, German-only argument was reversed without being addressed.** `dbf259a`'s own message
counted it as a gain that the rewrite "removed an English heading string sitting inside German
prose", and the review at
`circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md:133-136`
named `C05` after `dbf259a` among the things the German gets right and called that half of the
commit the one it had no objection to. German `C04` now reads
`in user-facing-output.md unter "## Length" und werden hier nicht wiederholt`
(`stilwerk/chat-voice-de.yaml:43`), which puts an English heading string back into German prose.
Neither record mentions that, and both price the anchor at "+18 in both languages" as though the
two files pay the same thing for it.

## Why it matters, and how much

Modestly, and the outcome is probably right either way. `## Length` is an English heading in an
English-only rule file: no German rendering of it would resolve, so a German profile that points
at a section has no alternative to naming it in English. The German `C04` clause is defensible
on that ground. It has simply never been argued on that ground.

Leaving German `C05` anchorless is also defensible, on a reason nobody has written down: its
German name translates the English heading closely enough that a reader scanning nine headings
finds the right one, and restoring it would cost a 43-byte English string for a section the
entry already names.

What is wrong is the shape of the record, not the shape of the text. One argument was verified
against one file and applied to four, and a reason the same Circle's own review had endorsed was
reversed in silence. That is the same defect class as the `Revised by:` line this commit
correctly added to `260821-2204_c_`, one file over.

## What to do

**No change to the four profiles is proposed.** Do not restore German `C05`'s anchor on the
strength of this record; that would trade a written-down reason for a byte cost, and the byte
budget in
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
is already spent to −8 and −10.

Append a note to `260822-0117_c_` that states, in one paragraph:

1. the character-for-character claim holds for `stilwerk/chat-voice-en.yaml:46` and not for
   `stilwerk/chat-voice-de.yaml:48`, where the removed anchor was the English heading;
2. German `C05` stays anchorless because its own name translates the heading, not because the
   anchor duplicated it;
3. German `C04` reintroduces an English heading string into German prose, which `dbf259a` and
   the review of it both counted as a cost, and it is taken because the heading exists in no
   other language.

An `_o_` decision record is not needed: nothing here is a choice between routes, only a reason
that was never written.

---
Resolved: The disposition is this record, plus a `Revised by:` note on the record it corrects. No text changed.

`260822-0117_c_` gains an appended block stating the three points this record asks for: the
character-for-character claim holds for `stilwerk/chat-voice-en.yaml:46` against
`rules/user-facing-output.md:34` and not for `stilwerk/chat-voice-de.yaml:48`, where the removed
anchor was the English heading; German `C05` stays anchorless because its own name translates that
heading, not because the anchor duplicated it; and German `C04` puts an English heading string back
into German prose (`stilwerk/chat-voice-de.yaml:43`), a cost `dbf259a` and the review at
`circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md:133-136`
had both booked as a gain, taken because `## Length` exists in no other language.

That record keeps its `_c_` marker and its original `Resolved:` note, per
`rules/fusion-workbench-conventions.md` `## Inline State Tracking`. The four profiles were not
touched: no route was open to choose between, only a reason that had never been written, which is
why this record proposed no change and none was made. Its second-named target, the same claim in
`circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:38-39`,
is left as written for the same reason the parallel gap in `260822-0251_c_` is: the dispatch scoped
the annotation to the issue record.
