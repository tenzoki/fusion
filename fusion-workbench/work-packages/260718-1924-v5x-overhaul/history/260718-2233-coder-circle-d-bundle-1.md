# Coder session — Circle D, Bundle 1

**Date:** 2026-07-18
**Status:** Complete
**Circle:** 260718-1924-v5x-overhaul
**Plan:** 260718-2150_*_plan-circle-d-agent-prompt-revision.md (§Bundle 1)

## Task

Bundle 1 of the Circle D prompt revision: factor the duplicated Setup step-2
block in the four smallest, most uniform prompts down to the F1 bootstrap-pointer
form, and apply the F5 decision (document-the-exception) to the two reviewers.

## Changes

- `agents/coder.md` — Setup step 2 reduced to the F1 pointer form.
- `agents/ontocoder.md` — Setup step 2 reduced to the F1 pointer form.
- `agents/coderev.md` — Setup step 2 reduced to the F1 pointer form; F5 sentence
  added under `## Review Process`.
- `agents/ontorev.md` — Setup step 2 reduced to the F1 pointer form; F5 sentence
  added under `## Review Process`.

Setup step 1 (locate-workbench + halt message) left inline and byte-unchanged in
all four, per the F1 split (pre-load bootstrap must stay inline).

### Pointer wording (canonical, reuse verbatim in later bundles; `<self>` = agent name)

> 2. **Rules and paths.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <self>` and
> `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" <self>`. Read every path `fusion-rules`
> emits, and follow `rules/agent-setup.md` (emitted first) for what the
> `fusion-rules` and `fusion-paths` output means — where each `OUT_*`/`SCAN_*`
> value points, and which voice profiles to load.

### F5 sentence (coderev + ontorev, under `## Review Process`)

> You write no separate session-history entry — your review file under
> `$OUT_REVIEW` is this session's durable record, and a history log would only
> duplicate it.

Per decision 260718-2150_*_reviewers-history-log-step: document the exception,
no `$OUT_HISTORY` step added. coder/ontocoder unaffected by F5.

## HYG-NO-REGRESS

None of the four Setup step-2 blocks named an agent-specific rule file or a
`$OUT_*`/`$SCAN_*` key, so only shared boilerplate moved. The removed prose
(read-every-path, KEY=value/OUT/SCAN semantics, two-directories nuance,
exit-3/exit-4) is centralised in `rules/agent-setup.md` (Bundle 0). No
voice-profile sentences were present in these four to lose. Pattern-kind adjective
("coding" / "ontology/normative/verb") dropped — generalised in agent-setup.md.

## Verification

- `bin/fusion-paths <agent>` for all four: exit 0, key set byte-identical to
  pre-edit (captured before editing). Confirmed unchanged.
- `npm test` (hooks): 261 passed — path-literal-lint and context-manifest
  baseline both green.
- `claude plugin validate .`: passed (one pre-existing unrelated CLAUDE.md
  warning).

## Scope discipline

Touched only the four owned files. Did not touch rules/agent-setup.md,
bin/fusion-rules, other prompts, or plugin.json. No unrelated defects found.
