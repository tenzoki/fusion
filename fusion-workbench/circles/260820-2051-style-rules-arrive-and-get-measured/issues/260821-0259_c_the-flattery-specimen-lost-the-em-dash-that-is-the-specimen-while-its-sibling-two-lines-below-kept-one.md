The flattery specimen lost the em-dash that is the specimen, while its sibling two lines below kept one

---

`rules/critical-stance.md` section 1 carries three specimens of the fault it names. `b393a45`
repunctuated two of them and kept the third, and the one it kept is not the one whose em-dash is
load-bearing.

| Line | Specimen | Class | Mark |
|---|---|---|---|
| `:12` | `Praise-as-deflection ("Great catch: your instinct was exactly right!", …)` | a specimen of the fault | **removed** |
| `:17` | `Before: *"Großartiger Hinweis — dein Gespür war goldrichtig! …"*` | a specimen of the fault | kept |
| `:19` | `After: *"…Korrekt ist Z. Fix folgt."*` | a model of good output | removed |

`:19` is correct: a model of good output must not carry the banned figure, and the record says so.
`:12` and `:17` are the same kind of object and got opposite treatment, and the record names only
`:17`, describing it as "the file's designated exhibit of the fault the section names". `:12` is
equally designated and is the English one, in a repository whose artifact language is `en`.

**Why the mark matters at `:12` and is not decoration.** `"Great catch — your instinct was exactly
right!"` is a specimen of AI sycophancy, and the em-dash is part of the register being exhibited.
`"Great catch: your instinct was exactly right!"` is a less faithful specimen of the thing the bullet
tells an agent to recognise. This is the same defect as the open Turn-1 record
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`,
which found a blacklist entry in `chat-voice-en.yaml` whose inline demonstration was repunctuated
away. It recurs here, in a different file, in the same Turn, after the finding was filed.

**The budget is real and is the reason the choice was forced.** `bin/fusion-prose-metric` gives
`rules/critical-stance.md` a permit of 1 at 1 529 words. Keeping both `:12` and `:17` puts the file
at 2 and `over`. So this cannot be fixed by keeping one more mark.

---
**Found by:** coderev, review gate R1 of `circles/260820-2051-style-rules-arrive-and-get-measured`,
review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0257-coderev-turn-2-the-repunctuation-and-the-repaired-step-0e.md`.
**Owner:** `coder`.
**Severity:** Low-Medium. Nothing is wrong. The cost is that an always-on file exhibits the
anti-pattern less faithfully at the one place it is exhibiting it on purpose, and that the choice
between two identical objects was made silently.
**Filed in the Circle store** per the Origin Rule.
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`
(the same class, filed in Turn 1 of this Circle, still open);
`shared/issues/260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
(the register argument the whole programme rests on).

**Verified at HEAD `c226949`** by reading `rules/critical-stance.md:9-19` against
`git show d66763b:rules/critical-stance.md`, and by running
`bin/fusion-prose-metric rules/critical-stance.md`, which returns `1 1529 0.7 1 ok`.

**The integral fix, and it is not a mark swap.** Both `:17` and `:19` are italic prose, which is why
the metric counts them; `bin/fusion-prose-metric` excludes fenced blocks, inline code spans and
block-quote lines, and `rules/user-facing-output.md` already puts its own anti-examples in block
quotes for exactly this reason. Moving the `Before:` / `After:` pair into block quotes, and the
`:12` parenthetical's two quoted specimens with it, takes all three out of the prose count. Both
specimens then keep the em-dash that makes them specimens, the file's permit goes unspent, and the
question of which of two identical exhibits to sacrifice does not arise. That is a structural change
to the exhibit form rather than another round of mark choices, so it belongs with steps 13 and 14
where `rules/user-facing-output.md`'s own exhibits are handled.

**What must not be done instead.** Restoring `:12`'s em-dash and leaving `:17`'s in place. That puts
the file at 2 against a permit of 1.

---
Resolved: fixed — the two parenthetical specimens and the Before/After pair moved into block quotes, both specimens carry their em-dash again, and bin/fusion-prose-metric reads 0 of a permit of 1; rules/critical-stance.md:14
