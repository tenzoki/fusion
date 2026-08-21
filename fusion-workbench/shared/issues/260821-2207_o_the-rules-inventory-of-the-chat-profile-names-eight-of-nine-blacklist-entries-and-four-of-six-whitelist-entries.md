The rule's inventory of the chat profile names eight of nine blacklist entries and four of six whitelist entries

---

**Severity:** Low
**Domain:** code
**Filed by:** ontorev, noticed beside step 4 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`; the two bullets are not part of that change
**Affects:** `rules/user-facing-output.md:18-19`
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md` — the consequence this drift produced for one new clause

---

## What is wrong

`rules/user-facing-output.md` `## Style anti-patterns apply to everything` summarises what
the chat profile contains. Both bullets are short by construction, and neither says so.

**Blacklist, `:18`** names eight: em-dash overuse (AI02), AI stock phrases (AI01),
mechanical three-part lists (AI04), vague pronoun openers (AI05), filler intensifiers
(AI06), rhetorical question-answer pairs (AI07), sycophantic or paternalistic validation
(AI11), hollow abstractions (L04). The profile carries nine. **AI08, "Announcing
structure"** — "Let me explain.", "Here's the thing:", "There are three reasons:" — is
absent, and was never present: it appears in no revision of this file.

**Whitelist, `:19`** names four: action-first (C01), name the referent (C02), direct
address (C03), terse (C04). The profile carries six. **C05 (sketch structure)** and
**C06 (one name per thing)** are absent. C05's substance survives elsewhere, because the
rule gives it a section of its own at `:34`. C06's does not: the rule's `## Vocabulary`
bullet at `:80` carries "One name per thing" and nothing about restating a claim.

Verified against `stilwerk/chat-voice-en.yaml`, parsed: whitelist `C01 C02 C03 C04 C05 C06`,
blacklist `AI02 AI01 AI05 AI06 AI04 AI07 AI08 L04 AI11`. The German file is identical in
shape.

## Why it matters

The blacklist bullet is the one that carries a stated fallback, at `:32`:

> If no chat profile is loaded (no `stilwerk/` in the workbench, or the file is missing),
> the anti-patterns still hold in spirit.

A project without `stilwerk/` therefore gets eight of the nine anti-patterns and none of
the whitelist beyond what the bullet lists. The grammar of both bullets reads as complete
("Its whitelist is minimal and chat-appropriate: ..."), so nothing signals the shortfall.

Step 4 of the Circle named above put a new normative clause into C06, which is one of the
two whitelist entries this bullet omits. That is the concrete cost, and it is filed
separately.

## What to do

Either add the three missing entries, or mark both bullets explicitly as characterisations
rather than inventories. The second is cheaper and honest; the first is what the fallback
sentence at `:32` implies is true today.

**Note the byte budget** before editing: `rules/user-facing-output.md` and the profiles are
held to two independent budgets, each net zero or less, by `## Current State` of
`circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`.
Adding to this file needs a cut in it.
