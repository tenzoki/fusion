# Language claim fixes (R2 + R3) and the two in-repo version-pin examples

**Status:** Complete
**Agent:** coder
**Task source:** user dispatch, closing `shared/issues/260807-2154_o_the-artifact-language-is-mechanised-for-nine-agents-and-asserted-for-sixteen.md` and `shared/issues/260807-2155_o_three-language-claims-outside-the-authoring-home-still-describe-the-single-declaration.md`

## R2 — the artifact language now reaches the single-path agents

Applied fix direction (a) from the issue: a paragraph in `rules/agent-setup.md` `## Voice
profiles`, addressed to the agent that receives only `chat-voice-*.yaml`. It names the
persisted artifacts those seven agents actually produce, says no profile they hold carries
that language, and points at `## Project language` for the resolution rather than
restating it.

Fix direction (c), widening `IS_PROSE_AGENT`, was checked and left alone. The reviewer's
reasoning holds: the long-form profile's sentence-length bands and consulting register are
wrong for a task queue or a defect record, so it would fix the language signal by breaking
the style one. No change to `bin/fusion-rules` — a parallel dispatch owns that file.

## R3 — three stale claims outside the authoring home

1. `README.md:117` — the opening clause now reads "The `**Language:**` line selects the
   chat pair.", so a reader who stops at the semicolon takes away the post-split rule.
2. `hooks/session-start.ts` `## Why the message is English` — the docblock no longer
   describes what `**Language:**` governs. It classifies hook and CLI operator strings as
   one of the surfaces `## Project language` exempts and cites that rule. The argument the
   authoring home cites this block *for* (a hook fires before any agent has read
   `CLAUDE.md`) is untouched, so the cross-citation is no longer circular in either
   direction.
3. `rules/fusion-workbench-conventions.md:215` — the justification for commit messages
   taking the artifact language now stands on the boundary ("fall on the persisted side of
   the boundary with it") instead of on the pre-split claim it replaced.

The `## Project language` heading is byte-exact; the ten citations and the
reference-resolution lint resolve unchanged.

## Rebuild

`hooks/dist/` ships committed and carried the stale docblock in both
`session-start.d.ts:62` and `session-start.js:62`. Ran `npm run build` in `hooks/`
(`rm -rf dist && tsc`); exit 0, and `git status hooks/dist/` shows exactly the two
`session-start.*` files modified — no unrelated dist churn.

## Version pins

`README.md:26` and `install.sh:27` bumped from `tags/v6.0.1` to `tags/v6.1.0`, matching
`.claude-plugin/plugin.json` `6.1.0`. The other two surfaces (marketplace `marketplace.json`
and the git tag) are outside this repository and were not touched. Closes half of
`shared/issues/260807-2154_o_plugin-json-says-6-1-0-while-tag-marketplace-and-both-pin-examples-say-6-0-1.md`;
that record is the user's to update.

## Verification

Six lint suites green (110 tests): `reference-resolution-lint`, `provenance-header-lint`,
`path-literal-lint`, `derivable-enumerations-lint`, `marker-format-lint`,
`glob-nomatch-lint`. `session-start-subdirectory` and `hooks-wiring` green.

`rules-emission-golden` fails as expected and was deliberately **not** regenerated: the
diff is byte-size only — `agent-setup.md` 3162 → 3513, `fusion-workbench-conventions.md`
39507 → 39529 — with identical file lists and no change to any agent's emitted set.
`RULE_BASELINE` untouched.

## Files changed

- `rules/agent-setup.md`
- `rules/fusion-workbench-conventions.md`
- `README.md`
- `hooks/session-start.ts`
- `hooks/dist/session-start.js`, `hooks/dist/session-start.d.ts` (rebuild output)
- `install.sh`

Not committed — the user commits.
