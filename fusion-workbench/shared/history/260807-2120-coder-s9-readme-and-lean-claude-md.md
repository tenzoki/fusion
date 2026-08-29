# Coder — S9: the two remaining prose descriptions name both declaration lines

**Date:** 2026-08-07 21:20
**Agent:** coder
**Status:** Complete
**Plan:** `260807-2024_*_two-language-declarations.md`, step S9

## What changed

Two files, one sentence-level edit each. Both point at `rules/fusion-workbench-conventions.md` `## Project language` instead of restating the fallback chain, the exempt-surface list or the profile routing.

**`README.md:117`** — the "Language and voice" bullet kept its existing first two sentences and its existing claim that `**Language:**` selects the profile pair. Appended to that claim: a project wanting its files in a different language than its chat adds an optional `**Artifact language:**` line, which then selects the writing pair, and leaving it out means one language governs everything, as before. The "as before" is deliberate — this is the surface a new user reads first, and someone who only ever wants one language has to be able to conclude from it that they need to do nothing new.

**`rules/context-lean-claude-md.md:39-40`** — the always-on bullet now names both lines in its label, keeps "load-bearing; must stay" attached to the first alone, and says the second is optional and carried only by a project whose files and chat differ. The example block at line 99 was left untouched per the plan: it declares one line, which is a supported configuration, and the example is about leanness.

## Verification

`reference-resolution-lint` green (23 tests) after both edits — the heading citations resolve and the two files' cited paths exist. The emission golden was not run and not regenerated; that is S10, and `RULE_BASELINE` was not touched.

## A fourth site the plan's inventory does not cover

`agents/editor.md`, lines 16 and 62, reads the project's `**Language:**` line to decide the language of a **deliverable** — a Markdown document or a branded pptx written to a project-side location. Under the new boundary that is a persisted artifact, so the editor should be reading the artifact language, not the chat language. The plan's inventory table lists `fusion-workbench-conventions.md`, `user-facing-output.md`, `CLAUDE.md`, `README.md` and `context-lean-claude-md.md`, and its Notes verify the nine *skill* citations are chat surface; agent prompts other than the ones S5 touches were not swept. Outside S9's file scope, so it is reported rather than fixed.

Two further mentions are correct as they stand and need nothing: `hooks/session-start.ts:61` says the `**Language:**` declaration does not govern operator strings (still true — hook strings are an exempt surface), and the skill bodies cite it for `AskUserQuestion` and chat confirmations, which stay chat surface.
