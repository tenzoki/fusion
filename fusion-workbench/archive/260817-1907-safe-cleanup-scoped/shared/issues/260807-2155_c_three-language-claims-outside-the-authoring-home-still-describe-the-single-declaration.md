Three language claims outside the authoring home still describe the single declaration, and one of the three is cited by the new rule text as its worked case

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `b246996..HEAD` (the two-language declaration split)
**Affects:** `README.md:117`, `hooks/session-start.ts:61-63` (mirrored in `hooks/dist/session-start.d.ts:61`), `rules/fusion-workbench-conventions.md:215`
**Cross-references:** `260807-2024_*_two-language-declarations.md`; the drift already caught and removed from `CLAUDE.md` during this work (the claim that the two families shared one fallback)

---

## The pattern

`## Project language` is the authoring home; five other files carry pointers. Three of
those restatements still assert the pre-split rule or contradict the text they sit in. They
are grouped here because the fix is the same in each: state less, and point.

### 1. `README.md:117` — the opening clause was not updated

```
The `**Language:**` line selects which pair applies; a project that wants its written
files in a different language than its chat adds an optional second line,
`**Artifact language:** en` (or `de`), which then selects the writing pair — leave it out
and one language governs everything, as before.
```

The first clause survives verbatim from before the split, where it was true. It now is
true only when the second line is absent — the condition the clause after the semicolon
introduces. A reader who stops at the semicolon takes away the wrong rule, and this is the
surface a user reads first.

Fix: `The **Language:** line selects the chat pair. A project whose written files use a
different language adds ...`.

### 2. `hooks/session-start.ts:61-63` — the docblock the new rule cites

```
 * Every string fusion's hooks emit is English — this file's sibling banner, the
 * guard's deny reasons, the halt notice. The project `**Language:**`
 * declaration governs *agent prose* and the stylometric profiles under
 * `fusion-workbench/stilwerk/` ...
```

Two claims, both now stale. `**Language:**` no longer governs "agent prose" as a whole —
it governs the chat surface — and it no longer governs both stylometric profiles, only
`chat-voice-*`. The new rule text points at this very block as its authority:

```
rules/fusion-workbench-conventions.md:213
  `hooks/session-start.ts` `## Why the message is English` is the worked case ...
```

So the authoring home now cites a passage that restates the rule the authoring home
replaced. The heading exists and the *argument* still holds — hooks fire before any agent
has read `CLAUDE.md`. Only the sentence describing the declaration's reach needs changing:
name the two declarations, or drop the description and cite `## Project language` for it.

Note that `hooks/dist/session-start.d.ts:61` carries the same text and is committed
(`.gitignore` exception for `hooks/dist/`), so it needs a rebuild, not a hand edit.

### 3. `rules/fusion-workbench-conventions.md:215` — a paragraph arguing against itself

```
... but exemption from a style profile is not exemption from the language rule. They
persist as files, so they take the artifact language. This reading was **settled by user
decision rather than derived**: ... on the ground that commit messages are the same class
of persisted-but-user-facing surface and are named English explicitly.
```

The rule states that commit messages take the **artifact language**. The justification
offered two sentences later is that commit messages "are named English explicitly". Both
readings trace back honestly — the decision record's answer did name commit messages
English (`260807-1515` `## Answer`, line 116), and the split generalised English into
"artifact language". But the paragraph now carries both, and the ground it stands on
contradicts the conclusion it supports. In this repository they coincide (`**Artifact
language:** en`); in a project declaring only `**Language:** de` they do not, and the
paragraph gives no way to tell which of its two sentences wins.

Fix: keep the ruling, restate the ground in the generalised terms — commit messages are the
same class of persisted surface, and this repository's answer put them in the artifact
language.

## Restatements that are currently correct, listed so a later pass does not re-derive them

`rules/agent-setup.md:52-53`, `rules/user-facing-output.md:9`, `rules/context-lean-claude-md.md:39-44`
and `CLAUDE.md:57` each restate the family-to-declaration mapping or the artifact-to-chat
fallback. All four are accurate today. They are four copies of one rule, which is what
produced the drift already caught in `CLAUDE.md` during this work and what produces items 1
and 2 above. No change is proposed here — the trade between a pointer and a legible local
statement is a judgement, not a defect — but the count is the reason the same class of
finding keeps appearing.

---
Resolved: All three fixed in Turn 2 of session 260807-2020-orchestrator-session.md. `README.md:117` no longer opens with a
clause that is true only under a condition the rest of the sentence introduces; a reader stopping at
the semicolon now gets the post-split rule. `hooks/session-start.ts` stops claiming what the
declaration governs and instead classifies its own subject as one of the exempt surfaces, which ends
the circularity in both directions, since `## Project language` cites that docblock as its worked
case. The compiled copies in `hooks/dist/` were rebuilt with `npm run build`, and exactly the two
expected files moved. The persisted-surfaces paragraph in `## Project language` no longer justifies
the commit-message ruling with the claim it replaced; it now rests on the boundary itself.
