Two entry names no longer cover their instructions, and AI04's only example is not a triad

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing step 4 of plan `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Affects:** `stilwerk/chat-voice-en.yaml:56-75,119-126`, `stilwerk/chat-voice-de.yaml:57-76,121-128`, and both `fusion-workbench/stilwerk/` copies

---

## What is wrong

Both extended entries kept a `name:` that is now narrower than the `instruction:` under it.

**AI04**, `name: "Mechanical triads"` / `"Mechanische Dreiergruppen"`. Its instruction now
also forbids the enumeration as a reply's default shape, and its single new example
(`stilwerk/chat-voice-en.yaml:126`) is:

    "Not 'Result: 1. It passes.' Just: 'It passes.'"

That is a **one**-item enumeration. Nothing in the entry's name would lead a reader to it.
The entry named for the three-part list now carries, as its only exhibit, a list of one.

**C06**, `name: "One name per thing"` / `"Eine Benennung pro Sache"`. Its instruction now
also governs restating a claim (`stilwerk/chat-voice-en.yaml:65-66`), which is not a
naming question. The two halves fail differently, and the entry names only the first:

- *One name per thing* fails by **variation**: the reader must keep proving that
  "registry", "catalog" and `uif-framework.yaml` are one object.
- *One formulation per claim* fails by **repetition**: "It passes. All green." wastes a
  line and, as the clause itself says, does not make the claim truer.

## Why it matters

These are lookup surfaces. An agent holding a draft scans `name:` fields to decide which
entries bear on it. "Mechanical triads" does not match a numbered list of one, and "One
name per thing" does not match a restated verdict. Both new clauses are reachable only by
a reader who opens every instruction body in full.

## What to do

Rename both, or split C06. Renaming is available inside the profiles' own budget, because
the accurate names are no longer than the current ones:

- AI04: `"Mechanical triads"` → `"Mechanical enumeration"` (−1 byte);
  `"Mechanische Dreiergruppen"` → `"Mechanische Aufzählungen"` (−1 byte).
- C06: `"One name per thing"` → `"One name, one formulation"` (+7);
  `"Eine Benennung pro Sache"` → `"Eine Benennung, eine Formulierung"` (+9).

A split of C06 into two entries is the cleaner shape and costs more; whether the profiles'
budget can carry it is the fixer's call, and this record does not decide it.

---
Partly addressed: 260821-2251 by ontocoder — AI04 is renamed in both copies of both chat
profiles, alongside the instruction rewrite this record's sequencing put first
(`260821-2203_*_ai04s-remedy-change-the-item-count-does-not-answer-its-new-fault-using-a-list-at-all.md`):
`"Mechanical triads"` → `"Mechanical enumeration"`, `"Mechanische Dreiergruppen"` →
`"Mechanische Aufzählungen"`. The name now covers the whole entry and matches the one-item
example the record objected to. The English rename costs +5 bytes rather than the −1 this
record estimated (17 characters to 22), and the German 0 rather than −1 (`ä` is two bytes);
both are absorbed by the instruction rewrite, which leaves each file net negative.

**C06 is deliberately left at `"One name per thing"` / `"Eine Benennung pro Sache"`, and
this record stays `_o_` for that half.** The clause the name undersells is the one whose
residency in the profile is the open question in
`260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`,
which the review recommends taking to the user rather than fixing, and both routes there
move or copy the clause out of the profile. Renaming the entry for a half that may leave it
spends +7 bytes English and +9 German on text that would then be renamed back. The rename
costs the same after that question is answered, and the accurate name is the one this record
already proposes.

---
**Reconciliation 260821-2349** (reconciler, HEAD `9a68760`). **Confirmed open, and open for the
half the record already says stands.** Verified in the tree: AI04 reads `name: "Mechanical
enumeration"` in `stilwerk/chat-voice-en.yaml:120` and `"Mechanische Aufzählungen"` in
`stilwerk/chat-voice-de.yaml`, both mirrored in `fusion-workbench/stilwerk/`; C06 still reads
`name: "One name per thing"` at `stilwerk/chat-voice-en.yaml:57` while its instruction carries
"Likewise one formulation per claim". The C06 rename remains owed and remains cheapest after
`260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`
resolved where the clause lives, which it now has: `rules/user-facing-output.md:81` carries "One
formulation per claim" as its own bullet and the profile entry stayed. So the reason this record
gave for waiting has expired, and the rename is now a clean, unblocked edit inside the profiles'
own budget.

---
**Resolved: 260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md by ontocoder.** C06 is renamed in both copies of both chat profiles,
which closes the half this record kept open: `"One name per thing"` → `"One name, one
formulation"`, `"Eine Benennung pro Sache"` → `"Eine Benennung, eine Formulierung"`. Both
halves of the instruction are now reachable by an agent scanning `name:` fields, which is
what this record asked for.

**The rename, not the split.** The split into two entries is the shape this record calls
cleaner and `rules/user-facing-output.md:80-81` already uses, and it was priced and rejected
on the budget in
`260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
(option 1, net zero or less, held per profile file). A second entry costs its own `- id:`,
`name:`, `instruction:` and `examples:` keys, about +57 bytes English net of the text moved
out of C06 and more in German, and the only cut of that size inside these files is C06's own
worked `Avoid:`/`Better:` exhibit. Deleting a working example to buy a heading is the worse
trade, so the rename stands and the split is not carried forward as owed work.

**The cut that pays for it, and it is C06 correcting itself.** The instruction opened with
"Use the same term for the same entity throughout" and closed with "after that, use the one
term consistently", which is one claim in two formulations inside the entry that forbids
exactly that. The close is now "after that, the one term." German drops `konsequent` from
"danach konsequent der eine Begriff" for the same reason: `durchgehend` in the first sentence
already carries it.

**Bytes, measured with `wc -c` against HEAD `084c626`.** English 6 854 → 6 844 (−10): +7
rename, −17 cut. German 7 407 → 7 405 (−2): +9 rename, −11 cut. The German rename is +9
rather than +9-characters-and-fewer-bytes because neither name carries an umlaut; the trap
this record hit on AI04 does not bite here. Each of the four files ends net negative, so each
satisfies the per-file budget on its own without borrowing from the other language or from
the always-on corpus.

Both plugin/workbench pairs verified byte-identical with `diff -q` after the edit, all four
parse, and line numbering is unchanged (English 184 lines, German 186), so every existing
citation into these files still resolves. `rules/user-facing-output.md` was not touched.
