# S8 — `skills/news/SKILL.md`, the reading skill

**Status:** Complete
**Agent:** coder
**Circle:** 260907-0829-message-between-checkouts-read-before-pull
**Plan:** `260907-1942_o_message-between-checkouts-read-before-pull.md`, step 8

## What was written

One new file, `skills/news/SKILL.md`, and nothing else. Frontmatter carries a `description` and `allowed-tools: [Bash, Read, AskUserQuestion]`, with no `argument-hint`, since the skill takes no argument.

The body carries the flow and the user-facing sentences only. Every mechanism question is answered by a citation of `bin/fusion-forum`'s own header rather than restated: the fetch, the two-tree set difference, the exit codes and the state vocabulary.

Steps: 0 roots and paths (the guarded `bin/fusion-source-root` block, `bin/fusion-workbench-root`, `fusion-paths news`); 1 the `[ -x ]` guard on `bin/fusion-forum` with the `fusion --update` sentence and an explicit prohibition on improvising the mechanism; 2 `new "$SCAN_FORUM"` with one sentence per exit code and per `state=`; 3 `new=0` said in words and stopping; 4 render through `show "$HEAD" "$ENTRY"` with the writer's hex resolved through the guarded `bin/fusion-checkout-name resolve`, falling back to the hex on exit 3; 5 `seen "$HEAD"`; 6 the pull question, refused first on a dirty tree or a merge or rebase in progress; 7 the report.

The settled ordering stands as rendered, mark, then pull question. All five exit-5 states are named, `upstream-unresolved` included, and the local-ref case is carried as one of the three `note=` uses rather than as a state, which is how the helper's header has it.

The three sentences the plan requires aloud are collected under the intro and repeated at the step that carries each: the mark advances on render so an abandoned message does not come back; a pull is the user's yes and never automatic; the skill reads a store and holds no thread, so a message needing an answer gets one through the other person's own next message.

No path literal: the store is named only as `$SCAN_FORUM`. No bare glob: the entries come from the helper's own `entry=` lines, and the zsh `nomatch` reason is stated at that step.

## Measurements

- `wc -c skills/news/SKILL.md` = **8 766** bytes, against the step's ceiling of 9 000.
- `bin/fusion-prose-metric skills/news/SKILL.md` = 0 em-dashes over 1 194 prose words, verdict `ok`. The one em-dash in the file sits inside a fenced block, in the `bin/fusion-source-root` stanza copied verbatim from the other bodies, and is not prose by that program's own rule.
- `bin/fusion-paths news` now exits 0 and emits `WORKBENCH`, `CIRCLE` and `SCAN_FORUM=shared/forum`.

## Gates

`fusion-paths.test.ts` and `path-literal-lint.test.ts` pass.

`reference-resolution-lint.test.ts` fails on its counting pin, and **the failure is not this file's alone**. Measured by moving the new file aside and re-running: without it the pin already reads paths 1663 / anchors 228 against a committed baseline of 1646 / 227, so 17 paths and 1 anchor were added by work that landed before this task. With it the reading is 1680 / 231. Re-approving that baseline belongs to plan step 12, which owns the suite run; this task edited no baseline.

No baseline map, golden or pin was touched. Nothing was committed.
