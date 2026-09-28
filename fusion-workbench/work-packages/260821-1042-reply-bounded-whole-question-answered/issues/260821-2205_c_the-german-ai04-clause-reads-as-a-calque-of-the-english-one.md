The German AI04 clause reads as a calque of the English one

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, reviewing step 4 of plan `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Affects:** `stilwerk/chat-voice-de.yaml:125-126` and `fusion-workbench/stilwerk/chat-voice-de.yaml:125-126`

---

## What is wrong

Of the two clauses step 4 added to the German profile, one is written in German and one is
written in English word order.

**C06 is good** (`stilwerk/chat-voice-de.yaml:66-67`): "Ebenso eine Formulierung pro
Aussage: zweimal gesagt wird sie nicht wahrer." The headline fragment parallels the entry's
own name, "Eine Benennung pro Sache", and the participial opening is idiomatic and terse.
Nothing to fix.

**AI04 is not** (`stilwerk/chat-voice-de.yaml:125-126`): "Auch eine Antwort hat nicht die
Aufzählung als Default-Form: eine Sache, ein Satz."

Three faults, in order of weight:

1. **`hat nicht die Aufzählung als Default-Form`.** Negating with `nicht` in front of a
   definite-article noun phrase inside an `als`-predicative is marked German. It is the
   English clause order ("is not the default shape of a reply") carried across word for
   word. Natural: "Auch für eine Antwort ist die Aufzählung nicht die Standardform."
2. **`eine Sache, ein Satz` loses the restriction the English gloss carries.** The English
   is "one thing **to say** is one sentence". Without "to say", "eine Sache" reads as one
   topic or one matter, not one thing you have to report. "Eine Aussage, ein Satz" keeps
   both the brevity and the meaning, and is the same length.
3. **`Default-Form` sits one sentence after `Default-Rhythmus`** (`:124`). The compound is
   consistent with what the entry already carries, so it is not wrong; two `Default-`
   compounds in adjacent sentences is repetitive in a file whose subject is not repeating
   yourself.

## Why it matters

The German profile is the one every agent loads in this project: `bin/fusion-rules ontorev`
emits `./fusion-workbench/stilwerk/chat-voice-de.yaml` and no English chat profile, because
`CLAUDE.md` declares `**Language:** de`. A clause that reads as translation is a weak
exhibit of the register it is teaching.

## What to do

Rewrite the clause, staying inside the file's budget:

> Auch für eine Antwort ist die Aufzählung nicht die Standardform: eine Aussage, ein Satz.

That is 1 byte shorter than the sentence it replaces and drops the second `Default-`
compound. Whether it should also carry the operative test that
`260821-2203_*_ai04s-remedy-change-the-item-count-does-not-answer-its-new-fault-using-a-list-at-all.md`
asks for is that record's question, not this one's; fix that one first if both are taken.

---
Resolved: 260821-2251 by ontocoder — the German clause was rewritten inside the single-test
rewrite this record asked to be taken first
(`260821-2203_*_ai04s-remedy-change-the-item-count-does-not-answer-its-new-fault-using-a-list-at-all.md`),
so the sentence proposed here is not the sentence that landed. What it asked for did land.
The entry now reads:

> Eine Aufzählung nur dann verwenden, wenn die Glieder parallel sind und der Leser sie
> zählen muss; sonst Sätze schreiben und die Zahl nie nach dem Rhythmus wählen. Eine
> Aussage, ein Satz.

Fault 1 is gone with the clause it sat in: no `als`-predicative, no `nicht` before a
definite-article noun phrase, and the whole instruction is infinitive imperative
("verwenden", "schreiben", "wählen"), which is the form every other German instruction in
the file uses. Fault 2 is taken as proposed: `eine Aussage, ein Satz`. Fault 3 is over-paid —
`Default-Form` is gone and so is `Default-Rhythmus`, so the entry carries no `Default-`
compound at all. `Glieder` and `die Zahl` are the terms the entry already used for those two
things, kept rather than varied, per C06.

German 7438 → 7407 bytes in both copies; `ruby -ryaml` parses both.
