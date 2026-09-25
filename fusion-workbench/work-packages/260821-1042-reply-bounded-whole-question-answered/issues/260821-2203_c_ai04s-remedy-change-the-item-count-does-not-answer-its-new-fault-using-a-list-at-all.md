AI04's remedy, change the item count, does not answer its new fault, using a list at all

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing step 4 of plan `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Affects:** `stilwerk/chat-voice-en.yaml:119-126`, `stilwerk/chat-voice-de.yaml:121-128`, and both `fusion-workbench/stilwerk/` copies

---

## What is wrong

The extended instruction reads, in full (`stilwerk/chat-voice-en.yaml:122-124`):

> Do not use three-part lists as the default rhythm. Use two or four items when the count
> is substantively justified. An enumeration is not the default shape of a reply either:
> one thing to say is one sentence.

Sentence 2 and sentence 3 pull against each other. Sentence 2 licenses an enumeration
outright, provided it has two or four items — its remedy for a bad list is to **keep the
list and change its length**. Sentence 3 says the list itself is not the default shape. An
agent with four points to make is told by sentence 2 that four items are fine and by
sentence 3 that it should have written sentences.

The German carries the same collision at `stilwerk/chat-voice-de.yaml:124-126`.

Two further gaps in the new clause:

1. **It prohibits a disposition, not an observable feature of one output.** "Default
   rhythm" and "default shape" are statements about a writer's habit across many replies.
   No single reply can be checked against either, so an agent can enumerate every reply
   and defend each one as substantively justified. Every other blacklist entry in the file
   names something observable in the text at hand: a character (AI02), a phrase (AI01,
   AI06), an opener (AI05), a figure (AI07, AI08). AI04 alone names a habit.
2. **The gloss covers only the one-item case.** "One thing to say is one sentence" tells a
   writer what to do with one thing, and the example is that same case. What to do with
   three genuinely distinct findings — the case the entry exists for — is unstated.

## Why it matters

This is the entry that carries the Circle's new register habit into every agent's chat
output. As written, an agent can satisfy it while still opening every reply with a
numbered list, which is the behaviour the clause was added to stop.

## What to do

Give the entry one operative test in place of the two competing remedies. A candidate,
which is shorter than the three sentences it replaces:

> Use an enumeration only when the items are parallel and the reader needs to count them.
> Otherwise write sentences, and never pick a list length for its rhythm.

That drops "two or four items", which is the half that survives from the old rule and does
not answer the new one, and it states a test a single draft can be held against.

---
Resolved: 260821-2251 by ontocoder — AI04's instruction now carries one operative test in
place of the two competing remedies, in all four chat profiles. "Use two or four items when
the count is substantively justified" is gone; the entry reads:

> Use an enumeration only when the items are parallel and the reader needs to count them;
> otherwise write sentences, and never pick a list length for its rhythm. One thing to say
> is one sentence.

The old fault survives as the length half of the same test ("never pick a list length for
its rhythm") rather than as a rival remedy, so the instruction and its remedy now answer one
fault: a shape chosen by habit instead of by content. The extension survives verbatim in the
closing sentence.

Both further gaps move, one fully and one partly. The gloss now covers the general case
rather than the one-item case alone: three genuinely parallel findings pass the test, three
that are not get sentences. The word "default" is gone from both sentences, so the entry
names a property of the draft in hand — are these items parallel, does the reader need to
count them — rather than a disposition across replies. What is left is that the test is a
judgement rather than a token match, unlike AI02's character or AI01's phrase list; the
record's own candidate has the same residual and no text-only fix removes it.

The German clause was rewritten in the same pass, which also settles
`260821-2205_*_the-german-ai04-clause-reads-as-a-calque-of-the-english-one.md`.

Verified: `cd hooks && npm test` exit 0; all four files parse (`ruby -ryaml`) with entry
shape and both id lists intact; both pairs byte-identical by `md5` and `diff -q`. English
6864 → 6854 bytes, German 7438 → 7407 bytes, in both copies.
