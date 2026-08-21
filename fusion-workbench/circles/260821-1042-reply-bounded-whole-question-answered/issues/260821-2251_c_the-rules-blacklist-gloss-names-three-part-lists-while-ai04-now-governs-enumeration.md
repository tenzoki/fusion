The rule's blacklist gloss still names three-part lists while AI04 now governs enumeration

---

**Severity:** Low
**Domain:** data
**Filed by:** ontocoder, repairing AI04 per `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2203_*_ai04s-remedy-change-the-item-count-does-not-answer-its-new-fault-using-a-list-at-all.md`
**Affects:** `rules/user-facing-output.md:18`
**Cross-references:** `shared/issues/260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`

---

## What is wrong

`rules/user-facing-output.md:18` summarises the chat profile's blacklist, and its third item
is "mechanical three-part lists". That was an accurate gloss of AI04 until this repair.
AI04 is now named "Mechanical enumeration" / "Mechanische Aufzählungen" and its instruction
governs using a list at all, with the item count as one half of a single test. The rule's
gloss now names the narrower of the two, and it is the only statement of AI04 that reaches a
project whose workbench has no `stilwerk/` — the fallback at `rules/user-facing-output.md:32`
carries the blacklist over, and this bullet is what it carries.

## Why it matters

Same mechanism as the cross-referenced record, one line apart in effect: a reader who takes
the rule's inventory as the entry's subject gets a rule about triads and not the one the
Circle landed. That reader is precisely the one with no profile to correct the impression.

## What to do

Two words at `rules/user-facing-output.md:18` — "mechanical three-part lists" becomes
"mechanical enumeration" (−12 bytes) — and the same edit region is the cross-referenced
record's, which adds three missing entry names. Take both in one pass against that file's own
budget rather than opening it twice. Not fixed here: the repair that caused it was held to
the four profiles, and `rules/user-facing-output.md` was under another task's edit at the
time.

---

Resolved: `rules/user-facing-output.md:18` now reads "mechanical enumeration" where it read
"mechanical three-part lists". The gloss and the entry name it summarises are now the same
two words, which is what an inventory line owes the reader who has no profile to check it
against.

The saving is 5 bytes, not the 12 this record estimated. "mechanical three-part lists" is
27 characters and "mechanical enumeration" is 22, both measured with `printf %s | wc -c`.
The record's arithmetic is the only thing it got wrong.

Not taken here: the cross-referenced record's three missing entry names. It is
`shared/issues/260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`,
it was outside this task's scope, and it stays open. This record's advice to take both in
one pass stands for whoever takes that one.

The 5 bytes were spent inside the same pass, on the bullet that closes
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`.
The file's net against the anchor `e764637` is minus 2, measured with
`wc -c rules/user-facing-output.md` at 20 142 against 20 144.
