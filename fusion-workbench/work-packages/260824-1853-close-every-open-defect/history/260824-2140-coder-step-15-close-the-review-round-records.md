# Step 15: close every record the Turn 1 review round filed

**Date:** 2026-08-24 21:40
**Agent:** coder
**Task:** P-15 of `260824-1905_*_plan-close-every-open-defect.md`
**Status:** Complete

## What was done

Thirteen of the fifteen `_o_` records in this Circle's `issues/` closed: eleven `fixed`, one `moot` (row 66: step 13 had already replaced the opener), one `referred (backlog)` (the seven ideas listed in the closure note for the user to file). The two `260824-2058` records that name stilwerk YAML edits (C05's bare rule filename in both chat profiles; `Das heißt,` in the German writing profile) are left `_o_` for `ontocoder`: the coder does not edit `.yaml` data files, and the plan's progress note says so.

Shipped-text changes, by record:

- `bin/fusion-paths:262`: the placeholder is written bare; a backtick inside the double-quoted string ran it as a command substitution. Pinned by one `expect(r.stderr).toContain(...)` in `fusion-paths.test.ts`, paid for by a one-line comment cut in the same file.
- `bin/fusion-identity`: no-git branch now tested (`fusion-identity.test.ts`, a PATH holding only `bash` and `dirname`; `run()` gained an env parameter). `rules/fusion-workbench-conventions.md` `### Who filed it` and the `CLAUDE.md` row name the second way into exit 1; the rule edit is net -11 bytes.
- `bin/fusion-session-domain`: new `fusion-session-domain.test.ts` (78 lines); header states the true read bound and defines `helper-missing`; `sed` captures the value as itself; `CLAUDE.md` row updated. Paid for by rolling re-approval log entries 26 to 40 (92 lines) out of `reference-resolution-lint.test.ts` into `260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md`, the mechanism decision `260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md` chose.
- `agents/reconciler.md` and `agents/orchestrator.md`: `coherent → none` narrowed to every-edge-evaluable; the Rebalance gate fires on `coherent` + `state Directive`, naming Revise Directive; the held commit begins with `git reset -q` so no index write is unheld; the resume paragraph states its three cases. Paid for by cuts of spent reasoning in both files: agents surface 414 361 → 414 168 bytes.
- `CLAUDE.md`, `docs/upgrading-to-v10.md`: `churn` named as the fourth retired key, with a pointer at `RETIRED_TOP_LEVEL_KEYS`.
- `README-agents.md`: four `skills/next/SKILL.md` line citations re-read against HEAD.
- Workbench records: nine marker spellings starred (two histories, `_t_circle.md:32`, one shared issue); `Corrected:` lines appended to `260822-0120_*_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md`, `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` and `260816-0740`.

## Head-room (before → after)

- always-on rules: 205 → 216 bytes
- `agents/`: 3 482 → 3 675 bytes
- `skills/`: 1 770 → 1 770 bytes (untouched)
- hook tests: 10 → 2 lines (the 92-line roll paid for the 78-line session-domain test, 14 lines in the identity test and a net 2 in the paths test)

`reference-resolution-lint.test.ts` `BASELINE`: `{ paths: 1353, anchors: 189 }` → `{ paths: 1357, anchors: 190 }`, accounted on the constant's line. Both goldens regenerated. No `hooks/` source changed, so no build.

## Verification

`cd hooks && npm test`: see the report line.
