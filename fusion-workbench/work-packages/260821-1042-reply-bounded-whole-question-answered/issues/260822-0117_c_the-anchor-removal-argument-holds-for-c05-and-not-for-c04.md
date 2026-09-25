The anchor-removal argument holds for C05 and not for C04, which now points at a 20 KB rule with no section

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-en.yaml:41`, `stilwerk/chat-voice-de.yaml:42`, and both `fusion-workbench/stilwerk/` copies
**Cross-references:** `260821-2204_*_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md` (the record `dbf259a` closed, whose resolution note carries the argument this record tests); `260821-0250_*_three-of-four-section-headings-carry-58-citations-and-no-gate-notices-when-one-is-renamed.md`

---

## What is wrong

`dbf259a` removed two heading anchors and gave one argument covering both. The argument is
sound for C05 and does not reach C04, and the commit does not distinguish them.

The resolution note on `260821-2204` states three reasons, and its first is the load-bearing one:

> the anchor buys no navigation: `rules/user-facing-output.md` is one of the five always-on
> rules, emitted by `bin/fusion-rules` to every agent ahead of the profile, so the only reader
> of this file already holds that file whole. An anchor into a document already in context
> points at nothing the reader has to find.

**For C05 the conclusion holds, and it holds without that argument.** The note's own third reason
settles it: C05's anchor was `## Sketch structure instead of narrating it`, character for
character C05's `name:` field one line above. It carried no information whether the reader held
the rule or not. Verified: `rules/user-facing-output.md:34` and `stilwerk/chat-voice-en.yaml:46`
are the same string.

**For C04 it does not.** The removed anchor was `## Length`. C04's name is "Terse without
sentence-length targets", so the section name is not recoverable from the entry. And holding a
document in context is not the same as knowing which part of it answers a question:
`rules/user-facing-output.md` is 20 142 bytes under nine `##` sections, and three of them could
plausibly carry a line cap. `## Length` named the right one in nine bytes. What C04 now says is
that the caps are "stated in user-facing-output.md", which is true of the whole file.

## The second reason does not separate the anchor from what was kept

The note's second reason is that an anchor "is the one token form no gate here can check and a
title-only rename silently breaks". Both halves are true, and both are equally true of the bare
filename the same commit kept. No gate reads these files at all: `surface()` in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` walks no `.yaml`, and
`hooks/lib/__tests__/workbench-citation-lint.test.ts:111-115` records `stilwerk/` as outside its
corpus. Route 2 of `260821-2204` was declined, so nothing changed that. A rename of the file
breaks `user-facing-output.md` in four profiles exactly as silently as a rename of the heading
would have broken `## Length`.

So the argument that survives for C04 is the first one, and the first one answers reachability
rather than location.

## Why it matters, and how much

Modestly. The reader is an agent holding both files, and it can find the caps by reading. The
cost is a search where there was a pointer, on the one entry in the profile whose whole content
is a deferral to another file. It is worth recording because the commit presents one argument as
covering two removals and only one of them needs it.

## What to do

Either restore a section name in C04 alone, or accept the loss deliberately rather than as a side
effect of C05's case. Restoring the removed form costs 22 bytes in English (`, section "## Length",`) and 24 in German
(`, Abschnitt "## Length",`), plus up to seven more if either instruction reflows to an extra
line. Both files sit 93 and 89 bytes below the anchor `dbf259a` measured against, so the budget in
`260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
carries it.

A third option this record does not price: state the caps' identity instead of their location,
so nothing has to be found. That reverses the cut `5ed284d` made and needs the reasoning in
`260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`
read first, because a copied number is what that record is about.

---
**Resolved 260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md** (ontocoder). **The anchor is restored in C04 and stays out of C05.** All
four copies, net negative on each file.

**What changed.** C04's deferral now names the section:

```
en:  stated in user-facing-output.md under "## Length" and are not restated here.
de:  stehen in user-facing-output.md unter "## Length" und werden hier nicht wiederholt.
```

Not the form this record priced (`, section "## Length",` / `, Abschnitt "## Length",`, 22 and 24
bytes). `under` / `unter` says the same thing in 18 bytes in both languages and reads as one clause
rather than as a parenthesis. C05 is untouched, and the bare-filename spelling `dbf259a` introduced
stands in both entries: only the section name came back.

**Why restored.** This record's separation of the two removals holds. The argument that survived
`dbf259a`'s three reasons is that the rule is one of the five always-on files, emitted to every
agent ahead of the profile, so its reader holds it whole. That answers **reachability**: nobody has
to fetch the file. C04's clause is not a reachability pointer, it is a **location** pointer, and
holding 20 142 bytes under nine `##` headings in context is not knowing which of them carries a
line cap. `## Length` (`rules/user-facing-output.md:99`) names it in nine bytes. C05's anchor was
character-for-character C05's own `name:` field and carried nothing either way, which is why the
same commit was right about it.

**The second reason does not distinguish, and this closure does not lean on it.** An anchor is a
token no gate here reads and a heading rename breaks in silence. Both halves are equally true of
the filename `dbf259a` kept: `surface()` in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` walks no `.yaml`, and
`hooks/lib/__tests__/workbench-citation-lint.test.ts:111-115` puts `stilwerk/` outside its corpus.
A property shared by what was removed and what was kept cannot be the reason for removing one. What
it does establish is that this restoration adds one more unchecked heading citation to a class
already open as
`260821-0250_*_three-of-four-section-headings-carry-58-citations-and-no-gate-notices-when-one-is-renamed.md`,
and the trade is taken deliberately: `## Length` is a one-word heading on a file this project edits
often and renames rarely, against a pointer that is the whole content of the clause.

**The third route in this record was not taken.** Stating the caps' identity instead of their
location reverses `5ed284d` and copies a number into a second place, which is exactly the defect
`260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`
is about. Naming the section keeps one copy of the number and points at it.

**Bytes, `wc -c` against HEAD `53ff99f`.** This record's share is +18 in each of the four files.
It is paid inside C04's own text by the sentence
`260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md`
moved out, so nothing was cut to afford it and no worked example was touched.

```
stilwerk/chat-voice-en.yaml                    6751 -> 6743    −8
fusion-workbench/stilwerk/chat-voice-en.yaml   6751 -> 6743    −8
stilwerk/chat-voice-de.yaml                    7316 -> 7306   −10
fusion-workbench/stilwerk/chat-voice-de.yaml   7316 -> 7306   −10

C04:  en −41 = −59 (moved sentence) + 18 (this anchor)
      de −53 = −65 (moved sentence) − 6 (reflow) + 18 (this anchor)
```

**One earlier record's reasoning is reversed, and it is annotated rather than rewritten.**
`260821-2204_*_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md`
carries a `Resolved:` note that argued both anchors away together and verified that no `"##` token
survived in either profile. One does now. That record gains a `Revised by:` line and keeps its
`_c_` marker and its original note, per `rules/fusion-workbench-conventions.md`
`## Inline State Tracking`.

**Verified.** All four parse (`ruby -ryaml`), both plugin/workbench pairs are byte-identical
(`diff -q`), `rules/user-facing-output.md` was not touched, and `## Length` still stands at
`rules/user-facing-output.md:99`.

---
Revised by: `260822-0252_*_the-c04-c05-anchor-split-is-verified-in-english-and-asserted-for-german-where-its-premise-is-false.md` — the anchor-split reasoning above was verified against the English file and asserted for all four; the German premise is false.

The claim at `## Why restored.` that "C05's anchor was character-for-character C05's own `name:`
field" is exact in English and false in German. In English the removed anchor and
`stilwerk/chat-voice-en.yaml:46` are the same string, `Sketch structure instead of narrating it`,
matching the heading at `rules/user-facing-output.md:34`. In German the anchor `dbf259a` removed was
that same **English** heading, while the German `name:` one line above reads
`"Skizze statt Prosa bei Struktur"` (`stilwerk/chat-voice-de.yaml:48`). The two are a translation of
one another, not a copy, so the reason given does not reach the German file.

German `C05` stays anchorless on a different reason, which nobody had written down: its own name
translates the heading closely enough that a reader scanning the rule's headings finds the right
one, and restoring the anchor would spend a 43-byte English string on a section the entry already
names.

German `C04` reintroduces an English heading string into German prose: `in user-facing-output.md
unter "## Length" und werden hier nicht wiederholt` (`stilwerk/chat-voice-de.yaml:43`). `dbf259a`'s
own message and the review at
`260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md:133-136`
both counted removing such a string as a gain. The cost is taken deliberately: `## Length` is an
English heading in an English-only rule file, so no German rendering of it would resolve. The
"+18 in both languages" pricing above is bytes only and does not price this.

**No text change follows from any of it.** The four profiles stand as `746ae4d` left them, the
defect this record closed is still closed, and the marker stays `_c_` per
`rules/fusion-workbench-conventions.md` `## Inline State Tracking`. What moved is the reasoning,
not the outcome.
