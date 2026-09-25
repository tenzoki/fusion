The new C06 clause lives only in a profile a project may not have, and the rule's fallback covers the blacklist half only

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing step 4 of plan `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Affects:** `stilwerk/chat-voice-en.yaml:65-66`, `stilwerk/chat-voice-de.yaml:66-67`, and both `fusion-workbench/stilwerk/` copies
**Cross-references:** `260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`

---

## What is wrong

Step 4 added two normative clauses. They landed on opposite sides of a fallback that
only covers one of them.

AI04's clause is on the **blacklist**, and `rules/user-facing-output.md:32` says:

> If no chat profile is loaded (no `stilwerk/` in the workbench, or the file is missing),
> the anti-patterns still hold in spirit: they are language-independent and this rule
> applies regardless.

"The anti-patterns" is the blacklist. AI04 survives a missing profile.

C06's clause — "Likewise one formulation per claim: saying a claim twice does not make it
truer" (`stilwerk/chat-voice-en.yaml:65-66`) — is on the **whitelist**, which that
sentence does not reach. And the rule file's own summary of the whitelist,
`rules/user-facing-output.md:19`, names four items:

> Its **whitelist** is minimal and chat-appropriate: action-first, name the referent (no
> bare counts or codes), direct address, terse.

Those are C01, C02, C03, C04. C05 and C06 are absent. The rule's `## Vocabulary` section
does carry C06's *first* half as a bullet ("One name per thing",
`rules/user-facing-output.md:80`), and it carries nothing about restating a claim: a grep
of the file for `twice|restate|repeat|redundan` returns one hit, line 93, and it is about
an `AskUserQuestion` `description` restating its own label, not about a reply restating a
claim.

So for any project whose workbench has no `stilwerk/`, the new C06 clause reaches no
reader at all, while its sibling AI04 clause does.

## Why it matters

The executor's own log states the residency premise and then does not apply it
(`260821-2132-ontocoder-two-register-habits-in-four-profile-files.md`):

> The pointer runs profile to rule and never the other way. Every agent reads the rule
> file; the profile can be absent from a workbench entirely, so a rule file pointing at a
> profile would point at nothing.

The same premise decides where a *clause* may be the only copy, not only which way a
pointer may run. A clause whose only home can be absent is in the same position as a
pointer into an absent file.

## What to do

Two routes; the fixer picks one.

1. Put "one formulation per claim" in `rules/user-facing-output.md` `## Vocabulary`,
   beside the "One name per thing" bullet that already carries C06's first half, and
   leave the profile clause as the language-specific echo it is.
2. Extend the whitelist summary at `rules/user-facing-output.md:19` so a profile-less
   project gets the whitelist the way it already gets the blacklist.

**The byte budget constrains both.** `## Current State` of the plan holds the rule file
and the profiles to two independent budgets, each net zero or less, and step 4 spent its
whole −12/−42 inside the profiles. Either route adds to the rule file and needs a cut
there, so this is a decision to put to the user rather than an edit to apply.

---

Resolved: route 1, at the user's decision. `rules/user-facing-output.md` `## Vocabulary`
now carries the clause as its own bullet, directly after `One name per thing`:

    - **One formulation per claim.** State a claim once. A second wording is not truer.

It is a bullet rather than a sentence appended to its neighbour, because the two failure
modes this record's companion separates are variation and repetition, and a bolded lead-in
is the rule file's lookup surface exactly as `name:` is the profile's. Folding the second
habit under the first heading would have reproduced in the rule file the defect
`260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`
filed against the profile.

The clause carries no worked example. Its neighbour carries none either since the step-5
cut, so the pair is consistent, and the 82 bytes of credit the file had would not hold one.

The profile clause stays where it is, as this record's route 1 says it should. The rule
file is now the authoring home and the profile entry the language-specific echo, which is
the direction the residency premise forces.

Not taken here, and still open: route 2. `rules/user-facing-output.md:19` still names four
of the six whitelist entries, so a profile-less project gets this clause and not C05's.
That is `260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`,
which was out of this task's scope and is unaffected by the edit.

Bytes: the file stood at 20 062 before this pass and 20 142 after it, against the anchor
`e764637`'s 20 144. Net minus 2. The bullet cost 85 bytes including its blank line, and
5 of those were paid by the companion edit in the same pass.
