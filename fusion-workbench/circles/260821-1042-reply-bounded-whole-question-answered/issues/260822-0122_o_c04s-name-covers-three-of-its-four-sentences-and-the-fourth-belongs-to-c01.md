C04's name covers three of its four sentences, and the fourth belongs to C01

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-en.yaml:37-43`, `stilwerk/chat-voice-de.yaml:38-45`, and both `fusion-workbench/stilwerk/` copies
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2202_c_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` (the same class, closed on its two instances); `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260821-2215-coderev-the-bounded-reply-circle.md:85` (a prior review saw this and left it unfiled)

---

## What is wrong

`260821-2202` closed on AI04 and C06. It was filed as two instances, not as a class, and the
class has a third member the two commits of this Turn left in place. C04 reads
(`stilwerk/chat-voice-en.yaml:38-43`):

    name: "Terse without sentence-length targets"
    instruction: |
      Keep it short. The line caps for a gate prompt and for a chat reply are
      stated in user-facing-output.md and are not restated here. Do not enforce
      sentence-length bands; short sentences are normal and welcome in chat.
      Details go to the end or to a file, not the opening lines.

Three sentences are terseness and the absence of sentence-length targets. The fourth is
neither. Moving detail to the end shortens nothing; it reorders. It is a rule about where
material sits, and the entry named for brevity does not lead a reader to it.

German carries the identical structure at `stilwerk/chat-voice-de.yaml:41-45`
("Details ans Ende oder in eine Datei, nicht in die ersten Zeilen").

## Where the clause already lives

`rules/user-facing-output.md:59` states it, as point 4 of `## Information architecture`:

> **Details / references.** Commit hashes, file paths, agent names, history-file paths,
> internal IDs, marker syntax: these go in a clearly separated trailing section called
> "Details" or "References", **not** in the opening lines.

The profile's C01 already mirrors point 1 of that same list, name and all: "Action first" against
"**Action first.**" (`rules/user-facing-output.md:56`). So the rule's information-architecture list
is echoed in the profile across two entries, one of which is named for it and one of which is not.

## Why it matters

Same reason `260821-2202` gave and this record does not restate at length: `name:` is the
profile's lookup surface, and a clause reachable only by opening every instruction body in full
is a clause an agent scanning for placement guidance will not find. The asymmetry is the sharper
half here. A reader looking for "where do details go" finds C01 by its name, reads it, and stops,
because C01 says nothing about details and nothing tells them to keep reading into the entry
about sentence length.

## What to do

Three routes, and this record does not choose between them.

1. **Move the sentence to C01.** C01 is the information-architecture entry and already carries
   the rule's point 1 under the rule's own heading. Byte-neutral within the file, no rename.
2. **Rename C04** to cover both halves, as `dce8894` did for C06. Costs bytes and produces a
   two-clause name for what would then be a three-topic entry.
3. **Cut the sentence.** `rules/user-facing-output.md:59` is always-on and states it in full, so
   unlike C06's clause this one is an echo rather than the only copy, and a project with no
   `stilwerk/` still gets it. That is the reverse of the situation
   `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2201_c_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`
   found, and it is what makes cutting available here and not there. What it costs is the
   language-specific German rendering, which is the reason that record gave for keeping the
   profile echo after moving the authoring home into the rule.

Route 1 is the cheapest and the only one that costs nothing. This record does not decide it,
because C01's own budget and the residency premise of `260821-2201` both bear on it.
