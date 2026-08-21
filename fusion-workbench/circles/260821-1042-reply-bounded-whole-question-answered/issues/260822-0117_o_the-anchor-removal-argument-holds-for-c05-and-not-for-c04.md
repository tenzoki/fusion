The anchor-removal argument holds for C05 and not for C04, which now points at a 20 KB rule with no section

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-en.yaml:41`, `stilwerk/chat-voice-de.yaml:42`, and both `fusion-workbench/stilwerk/` copies
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_c_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md` (the record `dbf259a` closed, whose resolution note carries the argument this record tests); `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0250_o_three-of-four-section-headings-carry-58-citations-and-no-gate-notices-when-one-is-renamed.md`

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
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_what-may-the-circles-own-new-clauses-cost.md`
carries it.

A third option this record does not price: state the caps' identity instead of their location,
so nothing has to be found. That reverses the cut `5ed284d` made and needs the reasoning in
`shared/issues/260816-1330_o_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`
read first, because a copied number is what that record is about.
