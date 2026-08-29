# C06 renamed, paid for by the restatement inside its own instruction

**Agent:** ontocoder
**Date:** 2026-08-22
**Status:** Complete
**Task:** The C06 half of `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`

## What changed

Four files, two pairs, each pair byte-identical before and after:

- `stilwerk/chat-voice-en.yaml` and `fusion-workbench/stilwerk/chat-voice-en.yaml`
- `stilwerk/chat-voice-de.yaml` and `fusion-workbench/stilwerk/chat-voice-de.yaml`

Two edits per file. The second pays for the first.

**The rename.** C06 read `name: "One name per thing"` and `"Eine Benennung pro Sache"` while
its instruction had grown to govern two failures that go wrong differently. One name per
thing fails by variation: the reader keeps having to prove that "registry", "catalog" and
`uif-framework.yaml` are one object. One formulation per claim fails by repetition: "It
passes. All green." spends a line and leaves the claim exactly as true as it was. The name
covered the first only, so an agent scanning `name:` fields to find what bears on its draft
would not find the second. The entry now reads `"One name, one formulation"` and
`"Eine Benennung, eine Formulierung"`.

**The cut, and it is C06 correcting itself.** The English instruction opened with "Use the
same term for the same entity throughout" and closed with "after that, use the one term
consistently". That is one claim in two formulations, inside the entry that forbids one claim
in two formulations. The close is now "after that, the one term." German drops `konsequent`
from "danach konsequent der eine Begriff" for the same reason: `durchgehend` in the opening
sentence already carries it. Both cuts remove a restatement and no content.

## The option not taken, and why

The record proposed the rename and named a second shape it calls cleaner: split C06 into two
entries, which is what `rules/user-facing-output.md:80-81` already does with these same two
principles. It left the choice on budget grounds, and the budget decided it.

`260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
answers option 1: every new clause is paid for by a cut, held here as a per-file rule on the
profiles. A second entry buys four structural keys, `- id:`, `name:`, `instruction:` and
`examples:`, at roughly +57 bytes English net of the text that moves out of C06 and more in
German, since the German heading text is longer. The only cut of that size available inside
these four files is C06's own worked `Avoid:`/`Better:` exhibit, which is the entry's one
piece of evidence that three names for one thing read badly. Deleting a working example to
buy a heading makes the profile worse at the thing the record wanted improved, so the rename
stands. The split is not carried forward as owed work: the record's own accurate name is now
in place, and a future split would pay for itself only out of a budget that does not exist.

## Bytes

Measured with `wc -c`, before against HEAD `084c626`, which the working tree matched exactly
when this task started.

| File | Before | After | Delta |
|---|---|---|---|
| `stilwerk/chat-voice-en.yaml` | 6 854 | 6 844 | −10 |
| `fusion-workbench/stilwerk/chat-voice-en.yaml` | 6 854 | 6 844 | −10 |
| `stilwerk/chat-voice-de.yaml` | 7 407 | 7 405 | −2 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 7 407 | 7 405 | −2 |

English: +7 rename, −17 cut. German: +9 rename, −11 cut. Every file ends net negative, so each
satisfies the per-file budget on its own, with no borrowing between the two languages and none
from the always-on rule corpus, which the decision holds as the separate budget it is.

The German rename is +9 bytes and +9 characters together, so the umlaut trap the record hit on
AI04 does not bite here: neither `"Eine Benennung pro Sache"` nor `"Eine Benennung, eine
Formulierung"` carries a multi-byte character. It bit AI04 because `"Mechanische Aufzählungen"`
does.

## Verification

- All four files parse: `ruby -e 'require "yaml"; YAML.safe_load(...)'` on each, 15 entry ids
  in each, C06 carrying its renamed `name:`, its instruction and three examples.
- Both pairs byte-identical after the edit: `diff -q` on the English pair and the German pair,
  each exit 0.
- Line numbering unchanged, English 184 lines and German 186, so every existing citation into
  these files still resolves by line. That matters here because the defect record and the
  Circle's review both cite `stilwerk/chat-voice-en.yaml:57` and `:65-66`.
- `npx vitest run lib/__tests__/rules-voice-profile.test.ts lib/__tests__/rules-emission-golden.test.ts`
  from `hooks/`, exit 0, 33 tests. The second is the growth bound on the always-on set, which a
  net-negative change cannot trip, and it was run to confirm rather than to assume.

## What was not touched

`rules/user-facing-output.md` keeps both bullets as they stand, "One name per thing" at `:80`
and "One formulation per claim" at `:81`. The profile entry and the rule bullets now name the
same two principles without either surface being renamed to match the other, which is correct:
the rule file already had room for two bullets, and the profile does not have room for two
entries.

## Record closed

`260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` renamed `_o_` → `_c_` with a `Resolved:` note carrying the byte arithmetic and
the reason the split was declined. Its AI04 half was already done on 260821. Nothing staged
and nothing committed: two other executors are working this tree, and every git read here was
path-scoped or `git show HEAD:<path>`.
