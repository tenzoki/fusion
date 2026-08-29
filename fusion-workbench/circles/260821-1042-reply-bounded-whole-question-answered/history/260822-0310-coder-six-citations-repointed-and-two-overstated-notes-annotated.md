# Six citations repointed, and two notes that stated more than they checked

**Agent:** coder
**Date:** 2026-08-22 03:10
**Status:** Complete
**Circle:** `260821-1042-reply-bounded-whole-question-answered`
**Closes:** `260822-0251_*_the-german-line-shift-moved-four-citations-in-three-further-records-and-neither-note-names-them.md`, `260822-0252_*_the-c04-c05-anchor-split-is-verified-in-english-and-asserted-for-german-where-its-premise-is-false.md`
**Touched:** workbench records only. No shipped text, no profile, no rule, no test, nothing under `hooks/`, `agents/`, `skills/` or `bin/`.

---

## What the shift actually was, measured before anything was edited

`diff` between `git show 53ff99f:fusion-workbench/stilwerk/chat-voice-de.yaml` and the tree returns
two hunks and nothing else: German lines 20 to 21 became 20 to 22, and 42 to 45 became 43 to 45. The
net is that lines 22 through 45 each moved down by one and every line from 46 on kept its number. The
measurement both notes state is exact; only the account of who pointed into the range was wrong.

`diff -q` also shows `stilwerk/chat-voice-de.yaml` and `fusion-workbench/stilwerk/chat-voice-de.yaml`
byte-identical, so one set of numbers serves the records that cite either path.

## The six repairs

Every new target line was read out of the file. No repair was computed as "old plus one" and then
left unchecked, which is the failure mode the closing record exists to correct.

| File | Line | Was | Is | Reads |
|---|---|---|---|---|
| `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` | `:8` | `:24`, `:26` | `:25`, `:27` | `name: "Klartext-Referenten"`; `Nackte Kürzel und Zähler…` |
| the same | `:20` | `:24` | `:25` | `name: "Klartext-Referenten"` |
| the same | `:21` | `:26` | `:27` | `Nackte Kürzel und Zähler…` |
| `260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md` | `:13` | `:41-43` | `:42-44` | `C04`'s three caps-deferral lines |
| `260816-0740-rhetorical-register-of-agent-output.md` | `:113` | `:31` | `:32` | `- id: C03` |
| the same | `:205` | `:23` | `:24` | `- id: C02` |
| the same | `:635` | `:23`, `:31`, `:38` | `:24`, `:32`, `:39` | `- id: C02`, `- id: C03`, `- id: C04` |

The analysis file got line numbers changed and not one word else, per the dispatch: a pointer repair
inside a finished analysis is not a rewrite of it.

## The sixth instance, which the filing record did not carry

`:38` (`C04`) sits in the citation list at `260816-0740:635`, between `:23` and `:31`, inside the
shifted range, stale from the same commit. The record's table has four rows and none of them reaches
it. It was repaired with the two beside it and named as an undercount in the closing note, because a
single corrected list carrying one stale number reads as checked and is not.

## Re-read to establish they were unaffected, rather than assumed

`chat-voice-de.yaml:106` and `:60` in `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`, and `:81`, `:104`, `:138`, `:156` in
`260816-0740`, all at or after line 46, where the file is unchanged. `:138` and `:156` land on blank
lines, but held the same numbers before `746ae4d`, so that is a separate question and neither record
claims it. Every English citation resolves unchanged.

## The two annotations

Both are appends under `Revised by:`, both leave the original `Resolved:` note and the `_c_` marker
untouched, per `rules/fusion-workbench-conventions.md` `## Inline State Tracking`. Rewriting the
sentence would erase the overstatement instead of pointing at it.

`260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md`: the block separates what its **Verified.** paragraph checked (four files parse,
both pairs byte-identical, 183 and 186 lines, English numbering unchanged, the shift itself) from
the one clause it asserted: that the shift reached only two records and two review files. Six
citations in three further records reached it, two of those records open at the time.

`260822-0117_*_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md`: the block states that the character-for-character claim holds for
`stilwerk/chat-voice-en.yaml:46` against `rules/user-facing-output.md:34` and fails for
`stilwerk/chat-voice-de.yaml:48`, where the removed anchor was the English heading; that German
`C05` stays anchorless on a reason nobody had written down; and that German `C04`
(`stilwerk/chat-voice-de.yaml:43`) puts an English heading string back into German prose, a cost
`dbf259a` and its review had both booked as a gain, taken because `## Length` exists in no other
language. No profile was touched, which is what both the record and the dispatch asked for.

## Left undone, and written down rather than closed

The same overstated scope is restated at
`260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:71-73`, and the
same anchor claim at `:38-39` of that file. The dispatch scoped both corrections to the issue
records, so the history file was left as written. Part 1 of `260822-0251`'s "What to do" asked for
both notes; one of the two is done. Both closing notes say so, so a reader meets the gap on the
record rather than by rediscovering it.

## Verification

`cd hooks && npm test` returned exit 0 over 40 files and 718 tests. Nothing staged, nothing committed.
