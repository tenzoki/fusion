# The cleanup pipeline gains the message half of Step 6, a `forum` selector, and its own step numbering back

**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 1d05b0e4
**Circle:** 260907-0829-message-between-checkouts-read-before-pull
**Task:** plan step 10 of `260907-1942_*_message-between-checkouts-read-before-pull.md`, plus the numbering half of `260907-1942_*_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md`
**Status:** Complete

## What was done

One file edited: `skills/cleanup/SKILL.md`. `skills/curate/SKILL.md` was deliberately not touched, per the plan: it owns the ledger question, it is reached alone under `--only claude-md` where no draft exists, and a conditional message option in its body would be a copy that drifts.

**The ruling this step waited on.** `260907-1942_*_does-the-pipelines-one-stop-permit-a-second-question-in-the-same-askuserquestion-call.md` was answered option 1 at 260907-2320, so the body asks for the message as a second question inside the existing `AskUserQuestion` call, each question keeping its own three options and its own eight-line cap. The coupled-options variant the plan named as the alternative was not implemented.

**The message half**, written as a `### The message half` subsection of Step 6, carries the four obligations the plan names:

- **Compose before the stop**, with the twenty lines allocated as subject, blank, at most eight lines of the person's part in the chat language, blank, at most nine of pointer block in the artifact language. The pointer block gives the commit range from `session.git_head_at_start`, the session history basename, the session's filed records as storeless wildcard citations, and a sentence on what the other side need not redo.
- **The cap is counted, not hoped for**: `wc -l` on the composed text before it is put, and over the cap the draft is cut and recounted rather than put and trimmed.
- **The context-freedom obligation is authored in this body**, not cited, because `rules/user-facing-output.md` `## Vocabulary` exempts workbench records by name and so would exempt this one. The body names what is barred: state marker, fusion noun, agent name as a subject, bare identifier.
- **The write** goes to `$WORKBENCH/$OUT_FORUM/<YYMMDD-HHMM>-<checkout>-<slug>.md` after `mkdir -p`, stamp from `date +%y%m%d-%H%M`, checkout from the `[ -x ]`-guarded `bin/fusion-identity`, and carries no `**Filed by:**`, with the reason cited to `260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md`.

The draft is printed as ordinary output immediately before the gate; the body states that printing is not stopping, so the walk-away property is untouched.

**The selector.** The step table gains `| forum | Step 6, message half — leave a message for the other checkout |`, and the sentence beneath it that calls the table the selector's whole vocabulary keeps holding. The body states the three flag consequences aloud: `--skip claude-md` drops the whole step and with it the message, `--dry-run` puts no draft and writes nothing, and `--only forum` runs the half alone, asking its own one-question confirmation, touching git not at all, and telling the user to carry the file in the next commit. The two conditions under which nothing is written are stated (no git repository; nothing to say, meaning no commits in the range and no records filed), Step 7's split list gains `chore(workbench): leave a message for the other checkout`, and the accepted property is named once: the entry is written after Step 2's push and carried by Step 7's.

The store is named only as `$OUT_FORUM`; no path literal was written, which `path-literal-lint.test.ts` confirms with `forum` in its `TYPE_FOLDERS`.

**The numbering defect, corrected in passing but only half of it.** In this file: the Step 5 and Step 6 sections now stand in numeric order, `## Step 0`'s `--dry-run` sentence names Step 6's survey dispatch, Step 6's rejection clause sends the reader to Step 7, and `## Notes for the assistant` names Step 6's gate. `README-agents.md` still labels the `/fusion:log-activity` row "Cleanup Step 6" while the `/fusion:curate` row carries the same label; the dispatch bounded this task to one file, so the third clause of that record's acceptance test is unmet and the record stays `_o_` with a progress note appended.

## Budget

`wc -c skills/cleanup/SKILL.md`: 23 674 before, 25 871 after. Growth 2 197 bytes against the step's 2 200-byte allowance. No baseline was edited.

`bin/fusion-prose-metric` on the file: 67 em-dashes before, 68 after, so the edit added one while adding 304 prose words; the rate fell from 21.8 to 20.2 per 1000 prose words. The file was already over the ceiling of 3 before this task, and the helper reports rather than gates.

## Verification

`cd hooks && npx vitest run lib/__tests__/path-literal-lint.test.ts lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 42 tests passed.

`bin/fusion-prose-metric skills/cleanup/SKILL.md` — exit 0, figures above.

`reference-resolution-lint.test.ts` is red on its pinned count, as the dispatch said it would be. Measured by single-file revert rather than attributed by reading the diff: the tree reads `{paths: 1686, anchors: 233}` with this edit and `{paths: 1683, anchors: 231}` with `skills/cleanup/SKILL.md` alone reverted to HEAD, so **this task's share is paths +3, anchors +2**. It enumerates: `rules/user-facing-output.md` with its `## Vocabulary` anchor, `$FUSION_SRC/skills/archive/SKILL.md` with its `## Process` anchor, and the one record citation. No bare stamp was written, so `stampBare` is unmoved. The pinned baseline stands at `{paths: 1646, anchors: 227, stampBare: 14}` and was deliberately left alone: re-approval belongs to step 12.

## Notes for the next reader

- `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cleanup` now exits 4, naming `$OUT_FORUM` as a key the resolver does not know, because the installed copy at `/Users/k1/.fusion` predates step 1. The work-tree copy emits `OUT_FORUM=shared/forum` and exits 0. This is the standing one-release-behind cost recorded in `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`, not a defect in the edit — but it does mean a `/fusion:cleanup` run in this session would halt at Step 0, which matters for step 13's proof run.
- Plan step 10 was not marked `[DONE]` in the plan file, and `260907-1942_*_does-the-pipelines-one-stop-permit-a-second-question-in-the-same-askuserquestion-call.md` was not moved `_a_` → `_i_`: the transition wants the commit hash this edit lands in, and this task does not commit. Both markings are owed to whoever holds the plan.
