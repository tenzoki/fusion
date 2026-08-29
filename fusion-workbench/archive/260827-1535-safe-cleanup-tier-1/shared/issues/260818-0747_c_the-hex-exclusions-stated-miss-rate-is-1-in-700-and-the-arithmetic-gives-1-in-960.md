The hex exclusion's stated miss rate is 1 in 700 and the arithmetic gives 1 in 960

---

`hooks/lib/__tests__/sentence-identifier-containment.test.ts:31-33` states the cost of the
no-digit exclusion at `:69`:

> and a 7+ character hash drawn entirely from `a`-`f`, excluded so English words
> spelled in hex ("defaced") are not read as commits, about 1 in 700.

A hex character is a letter `a`-`f` with probability 6/16 = 0.375. For the 7-character short hash
`git log %h` yields in a repository this size:

    0.375^7 = 0.0010428  →  about 1 in 959

For an 8-character short hash it is 1 in 2557, and for a 40-character full hash it is negligible
(~1.2e-17). No length in the pattern's 7-40 range gives 1 in 700.

---

## Why it is worth a record and why it is Low

The error runs in the conservative direction: the file claims the gate misses more foreign hashes than
it does, so nobody is being told the gate is stronger than it is. Nothing behaves differently either
way — the number is prose, not a threshold, and no assertion reads it.

It is filed because this project treats a stated cost as load-bearing: the number is there so the next
reader can weigh the exclusion instead of re-deriving it, and a figure that cannot be reproduced from
the pattern beside it defeats that purpose. It is the same class as
`260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce…`.

## Suggested fix

Replace "about 1 in 700" with "about 1 in 960 for a 7-character short hash, rarer at every greater
length", or state it as `0.375^7`. One line at `:32`.

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review `260818-0748-coderev-turn-1-range-1dc062d-33645a2.md` (range `1dc062d..33645a2`)

---
Resolved: the header now reads "0.375^7, about 1 in 960 for the seven-character short hash
`git log %h` yields here, and rarer at every greater length". The arithmetic is carried beside the
figure, so the next reader can check it against the `[0-9a-f]{7,40}` pattern two paragraphs down
rather than re-derive it, which is the purpose the unreproducible 1 in 700 defeated. The exclusion
itself (`if (!/\d/.test(m[0])) continue;`) is unchanged — the number is prose and no assertion reads
it.
