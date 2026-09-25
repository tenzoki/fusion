# Planner session — C4, presence travels and the monitor reads its own checkout

**Date:** 2026-08-25
**Agent:** planner (dispatched by orchestrator)
**Person:** Kai Stalmann <ks@qantr.com>, checkout 5e8248d7
**Status:** Complete
**Executors named in the dispatch:** coder, ontocoder, analyst

## What was planned

Capability C4 of `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, read against
the active Circle record, which governs where the two disagree. The plan is
`260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`:
eleven steps, ten to `coder` and one to `analyst`, no `ontocoder` step because the capability touches
no structured data file.

## The design, in one line

Every emitted event line names the person and the checkout that wrote it, and every reader scopes the
merged log by checkout before it asks anything else. One new helper, `bin/fusion-events`, answers both
questions the log is asked, presence and the Turn count, so the four Turn-count sites become one
implementation. The monitor's four measured false readings are repaired by one change to one read.

## What was read

The Circle record in full; the specification's `### C4` and `## Constraints`; the three referred defect
records; `agents/orchestrator.md` at its emit sites, its Turn-count sites, its Observability section and
its Phase-4 diagram step; `skills/setup/SKILL.md` Steps 0c, 0i, 1 and 5; `skills/next/SKILL.md`;
`bin/monitor`'s `/api/dashboard`, `_parse_mode` and `_read_warnings`; `bin/fusion-identity`;
`hooks/session-start.ts`, `hooks/guard.ts` and `hooks/tracker.ts` for the session-identifier question;
`rules/workbench-tracking.md`; and the two growth-bound test files.

## Measured rather than assumed

Head-room at HEAD, summed with each bound's own collector: always-on rule core **14 bytes**,
`agents/*.md` **3 007**, `skills/*/SKILL.md` **1 923**, hook tests **0 lines**. The event log stands at
2 331 lines and 358 980 bytes, 80 `session_start` and 146 `turn_start` lines. `cd hooks && npm test`
after the plan and the three records were written: 43 files, 760 tests, exit 0.

## Two facts the referred records do not carry

`skills/setup/SKILL.md` Step 1 carries a fourth whole-file Turn count, byte for byte identical to the
one at `agents/orchestrator.md` Setup Step 1, and the record that referred the defect here names three
sites. The two `session_start` emit sites disagree on the `detail` field against a vocabulary that
declares it. Both are filed.

## Records filed

- `260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`
- `260825-2140_*_the-two-session-start-emit-sites-disagree-on-the-detail-field-and-the-vocabulary-names-one.md`
- `260825-2140_*_where-do-c4s-hook-test-lines-come-from-when-the-cut-only-circles-room-is-spent.md`

The decision blocks step 10 and nothing else. Steps 1 through 9 touch no hook-test line, so the
capability can be built and read while it stands open.

## Voice profiles

`bin/fusion-rules planner` emitted `chat-voice-de.yaml` and `default-voice-en.yaml`, both present and
read. No fallback line on stderr. The plan measures 1 em-dash over 4 667 prose words against a permit
of 4.
