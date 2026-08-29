The German chat profile names the referent three ways where the English names it once

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-de.yaml:25`, `:27`, `:106`, and `fusion-workbench/stilwerk/chat-voice-de.yaml` at the same lines
**Cross-references:** `260821-2205_*_the-german-ai04-clause-reads-as-a-calque-of-the-english-one.md` (the same class, one entry over); `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` (C06, the entry that forbids what this record describes)

---

## What is wrong

Two German entries govern the same object, naming a token's referent, and between them they
spell that object three different ways. The English profile spells it once.

| | English | German |
|---|---|---|
| C02 `name:` | "Name the referent" (`chat-voice-en.yaml:25`) | "Klartext-Referenten" (`chat-voice-de.yaml:25`) |
| C02 `instruction:` | "without its referent" (`:27`) | "mit ihrem Bezug nennen" (`:27`) |
| AI05 `instruction:` | "Name the referent." (`:103`) | "Das Bezugswort benennen." (`:106`) |

`Referent`, `Bezug`, `Bezugswort`. In English, C02's name and AI05's closing sentence are the
identical four words, so a reader meeting the second recognises the first. In German nothing
links them.

`Referent` is also the weakest of the three on its own. In ordinary German it names a person
who gives a talk; the linguistic sense exists but is not what a reader reaches for first, and
`Bezugswort` two entries down is the term the file itself already uses correctly.

## Why it matters

This is exactly the fault C06 states, in the file that states it: "Für dieselbe Entität
durchgehend denselben Begriff verwenden" (`chat-voice-de.yaml:60`). A profile that carries
three names for one object while forbidding that is not evidence a reader can act on.

It is also a lookup surface. An agent scanning `name:` fields for the entry that governs bare
counts and codes reads "Klartext-Referenten" and gets no help from AI05's "Bezugswort", and the
reverse.

## What to do

Pick one German term and use it in all three places. `Bezugswort` is the candidate this record
would name: it is unambiguous, it is already in the file, and it is the one an agent writing
German prose would produce. `Klartext-Referenten` then becomes something like
`"Bezugswort statt nacktem Kürzel"`, which is longer, so the fix costs bytes and belongs
inside the profiles' own budget per
`260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`.

Not verified by this record: whether a shorter German name exists that keeps `Bezug` as the
stem and stays inside the current byte count. That is the fixer's search, not this record's
prescription.

## Provenance

Pre-existing. Neither `dce8894` nor `dbf259a` touched C02 or AI05. Found while reading every
remaining entry in both languages for the name-covers-instruction fault `dce8894` closed for C06.

---
Resolved: fixed — C02 and AI05 now share one German term, Bezugswort, in name and instruction; stilwerk/chat-voice-de.yaml:25, stilwerk/chat-voice-de.yaml:27, stilwerk/chat-voice-de.yaml:106, mirrored to fusion-workbench/stilwerk/
Corrected: 260824-2125 by coder — the `Resolved:` line above cites `stilwerk/chat-voice-de.yaml:106` for the AI05 `Bezugswort` sentence; at `43cdde6` and at HEAD the line is 107 (the AI02 instruction above it grew by one line in the same commit). Issue `260824-2059_*_two-stilwerk-closure-notes-cite-a-line-one-above-the-text-they-name.md`.
