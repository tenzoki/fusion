# Coder run 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md: plan steps 15 and 16

**Status:** Complete
**Agent:** coder
**Circle:** `260820-2051-style-rules-arrive-and-get-measured`
**Plan:** `260820-2324_*_plan-style-rules-arrive-and-get-measured.md`, steps 15 and 16
**HEAD read against:** `86edaac`, working tree clean for every file measured

## What was done

Seven workbench records gained an appended correction. Nothing existing was overwritten in any of
them: `git diff --numstat` reports 0 removed lines on all seven, which is the check plan step 16's
acceptance names and which step 15 is held to as well.

**Step 15, four files.** Each live record that names the always-on set now states it as its
derivation, the unindented `emit_if_exists` calls in `bin/fusion-rules` plus the unconditional
`emit_voice_profile "chat-voice" "$CHAT_LANG"` call, and each names `CLAUDE.md` separately as
always-on prose an agent holds that no helper emits and whose prose this Circle does not repair,
per `260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
option 3. The inverted `rules/workbench-tracking.md` claim is corrected in the two places it stood
live, the decision record's 260819-1400 reconciliation and this Circle's own Grounding snapshot.

**Step 16, three files.** The unreproducible token count is restated as the identity without a
total, with the tokenisations that produce a total named beside every figure. The capitalisation
claim is stated in the direction the evidence shows, ten gained and none lost. The 260814 claim
about the 8.2.0 tarball is annotated expired with today's measurement. The curator run gains a note
that the cap it prices against is no longer in dispute.

## Numbers, and how each was obtained

- **The always-on prose corpus.** `bin/fusion-prose-metric $(bin/fusion-rules coder) CLAUDE.md` at
  HEAD `86edaac`: the six emitted files 8 prose em-dashes over 13 292 prose words, 0.6 per 1000;
  `CLAUDE.md` 126 over 8 892, 14.2 per 1000; total 134 over 22 184, 6.0 per 1000. `CLAUDE.md` is
  40 per cent of those words (8 892 of 22 184) and 94 per cent of those marks (126 of 134).
- **Why that differs from the decision record's 125 over 9 155.** That figure is a raw
  `wc -w` and `grep -o '—'` count taken at `a5b73da`, reproduced exactly by
  `git show a5b73da:CLAUDE.md`. Two later commits, `fac97f4` and `dc78da2`, grew the file to 127
  over 9 483 by the same raw count. The prose metric additionally excludes fenced code, inline code
  spans, block quotes and YAML example values, so the two programs differ for two independent
  reasons. Both figures are stated in the appended notes with their command and their HEAD.
- **`rules/workbench-tracking.md` is emitted to nobody.** `grep -c workbench-tracking bin/fusion-rules`
  returns 0 at HEAD `86edaac`. `git show --stat b200902` records the always-on set falling from
  98 874 to 95 458 bytes, so that commit moved text out of the emitted set rather than into it.
- **The four stylometric profiles.** `diff -q` of `$FUSION_PLUGIN_ROOT/stilwerk/<f>` against
  `git show 7135a19:stilwerk/<f>` returns identical for all four; against the work tree at
  `86edaac` it returns diverged for all four, by this Circle's own four `stilwerk/` commits.
  `$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json` reads version 10.4.0, not 8.2.0. `diff -q` of
  `stilwerk/<f>` against `fusion-workbench/stilwerk/<f>` returns identical for all four, so plan
  step 8's refresh holds.
- **The line caps.** Read at `rules/user-facing-output.md` `## Length`: gate prompt 8, question stem
  6, option `description` 2, chat reply 12. `fusion-workbench/stilwerk/chat-voice-de.yaml` C04 and
  `chat-voice-en.yaml` C04 both point at that section and state no number.

## What was deliberately not done

`260816-0740-rhetorical-register-of-agent-output.md` is untouched;
`git status --porcelain` over it returns nothing.

The uncorrected copy of the token-count sentences in the progress note on
`260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
still stands. Plan step 16's file set names the 260816-1330 record and not that one, and step 15's
note on that file corrects the always-on set rather than the token count. The step-16 note records
the residual and where it stands.

No marker was moved and no filename was renamed. Steps 15 and 16 are marked `[DONE]` in the plan.

## Verification

`cd hooks && npm test` at HEAD `86edaac` with the working tree above: **exit 0**, 40 files, 718
tests. `npx vitest run lib/__tests__/workbench-citation-lint.test.ts` separately: 10 passed.
