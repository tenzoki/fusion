# Coder — S1: `## Project language` becomes the authoring home for two declarations

**Date:** 2026-08-07 21:16
**Agent:** coder
**Status:** Complete
**Plan:** `260807-2024_*_two-language-declarations.md`, step S1
**Decision realised:** `260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` (three of its three open rule-text edits: the exempt-surface list, the head-label resolution, the direct-user-interaction wording — the first two land here in full, the third here and in S5)

## What changed

One file, `rules/fusion-workbench-conventions.md`: the body of `## Project language` was replaced (41 insertions, 5 deletions), and the lede at line 5 now says "the project's two language declarations" instead of "the project language declaration", because the file's own inventory sentence would otherwise undercount what the section defines.

The heading text `## Project language` is byte-identical and still at line 176. Ten citations resolve against it by prefix and `reference-resolution-lint.test.ts` checks them; the suite is green.

## The shape of the new section

Nine blocks, in the order the plan specified:

1. **The boundary by surface**, stated first and as a rule rather than as a mechanism: terminal output takes the chat language, output that persists as a file takes the artifact language, text that ships to consumers is English regardless.
2. **The two declarations**, shown as a two-line fenced block from `CLAUDE.md`, with `en` and `de` as the valid values of both and a sentence saying a single-language project declares only the first line.
3. **The fallback chain** as one rule: absent, unreadable and invalid collapse into "not declared", `**Artifact language:**` then falls to `**Language:**` and `**Language:**` to `en`, both silently. The disjoint-and-complete reason is stated, so a later reader does not add an error path for the second line.
4. **The profile routing as a consequence** — chat family from the chat language for every agent, writing family from the artifact language for the nine long-form-prose agents.
5. **The mismatch sentence:** two emitted paths in different languages are the intended configuration, not a fault.
6. **The per-family missing-variant fallback**, carried over unchanged and now labelled per family rather than shared.
7. **The exempt-surface list** — six bullets, with `hooks/session-start.ts` `## Why the message is English` as the worked case.
8. **The persisted-but-profile-exempt surfaces** — dashboard, commit messages, monitor strings — following the artifact language, cross-referencing `rules/user-facing-output.md` `## Style anti-patterns apply to everything`, and marked as settled by user decision rather than derived.
9. **Head labels**, and the "existing artifacts are not translated" clause.

## Verification

`reference-resolution-lint`, `derivable-enumerations-lint`, `path-literal-lint` and `provenance-header-lint` all green after the edit. The emission golden was deliberately not run and not regenerated — that is S10's job, and `RULE_BASELINE` was not touched.

## Notes for the following steps

- Blocks 4, 5 and 6 now say in the authoring home what S6 was going to add to `rules/agent-setup.md` `## Voice profiles`. S6's sentence there is still worth adding — an agent reads `agent-setup.md` first — but it should be a pointer, not a restatement.
- The exempt list names `README.md` "and its siblings" rather than enumerating `README-agents.md` and `README-hooks.md`, so it does not become a third enumeration that can go stale.
