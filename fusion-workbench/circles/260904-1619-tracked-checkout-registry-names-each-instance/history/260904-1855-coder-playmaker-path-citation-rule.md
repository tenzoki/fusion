# Coder: the playmaker's citation rule reaches the path, and the one instance is corrected

**Date:** 2026-09-04 18:55
**Status:** Complete
**Trigger:** Dispatch — repair the defect recorded in `260904-1839_*_the-playmaker-writes-a-store-prefixed-circle-citation-into-the-portfolio-it-regenerates.md`
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## Task

The playmaker's prompt carried the statement-versus-pointer rule for a **marker** and not for a **path**. When a measurement warning reports which files carry a citation finding, spelling the offending path inline makes the report indistinguishable from a citation, and `hooks/lib/__tests__/workbench-citation-lint.test.ts` fails the whole suite on it. One instance stood at `portfolio.md` line 107, inside the `citation-check-verdict` warning.

## What changed

- `agents/playmaker.md`, `## Output — the portfolio`: the citation paragraph is **rewritten**, not extended. It keeps the marker rule verbatim and continues into the same rule one level up, for the path, bound to where it fires — `citation-check-verdict` and any warning naming which files carry a finding — with the two sanctioned forms (name the target in the storeless form, or fence the verbatim spelling) and their source. +686 bytes; the `agents/` surface keeps 8 516 of its 18 000 head-room (409 327 measured against a 399 843 floor).
- `fusion-workbench/portfolio.md` line 107: the store-prefixed Circle path becomes the storeless Circle name, and the shared-issue pointer loses its store segment. Both facts the warning carried survive — which files hold the hits, and that the run did not investigate the count discrepancy.

## A third file, and why it was in scope

The gate reported **two** violations, not one: the defect record itself quoted the offending line inline in its own summary and tripped on itself. The acceptance criterion is unreachable without it, so its summary now names file and line instead, and the record carries a repair note. Its marker stays `_o_` — its Acceptance is a property of a playmaker *run*, and a session reads its agent roster from the installed copy at start, so the proof run belongs to the next session.

## Two gates re-approved rather than edited

- `reference-resolution-lint.test.ts` first read paths 1 564 against a pin of 1 563. The extra token was a new citation of `rules/fusion-workbench-conventions.md` in the rewritten paragraph. **No baseline was moved:** the sentence was rephrased to name the always-on conventions rule and its `## Marker globs` heading without a second file path, and the gate resolves 1 563/217/13 exactly again.
- `fixtures/surface-growth.golden` was regenerated (`UPDATE_SURFACE_GOLDEN=1`), the diff read, and confirmed to be exactly two lines — `playmaker.md` and the surface total, each +686. No head-room baseline moved.

## Verification

`cd hooks && npm test` — exit 1. 47 of 48 files pass, 813 of 814 tests. `workbench-citation-lint.test.ts` passes (13/13), which is this task's acceptance criterion. The single remaining failure is `citation-sweep.test.ts`, red at this session's start commit and filed as `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`; it names a Circle record and a playmaker history file, neither touched here.
