# Tasklist rebuild — shell-reachability-model

**Agent:** taskplanner
**Domain:** code
**Date:** 2026-08-07 00:10
**Status:** Complete
**Wrote:** `fusion-workbench/tasklist.md` (full rebuild), and closed `shared/issues/260801-2038_*_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`

---

## What was scanned

Both stores for every scan key, per `bin/fusion-paths taskplanner`:

| Store | Scanned | Open items found |
|---|---|---|
| Plans | active Circle + shared | 1 open plan (the active Circle's, 11 steps, none marked done), 1 open spec (shared, belongs to an anticipated Circle) |
| Issues | active Circle + shared | 45 open: 22 in `shared/issues/`, 23 inside Circle directories |
| Decisions | active Circle + shared | 4 non-terminal: 2 open, 2 answered-not-realised |
| Reviews | active Circle + shared | 21 review records, all advisory, no unresolved finding not already filed as an issue |
| History | active Circle + shared | skimmed; the 260806-1152 reconciliation pass is the most recent ground-truth check |

The active Circle's own issue and decision stores are empty. Every open issue therefore predates the Circle, which is why the queue's backlog sections are as large as they are.

## What was produced

44 tasks in four sections, plus a fifth listing what was deliberately left out.

- **Section A, 11 tasks** — the active Circle's plan steps in the plan's own dependency order, all routed to `coder`. One task is ready now (S1, the measurement instrument); the remaining ten are blocked on a dependency or a human gate.
- **Section B, 9 tasks** — filed defects living in the same files S2, S3, S4, S6 and S7 will edit. Marked as outside the Circle, with a second diagram showing the file-level collision so an executor recognises them rather than absorbing them.
- **Section C, 24 tasks** — unaffiliated backlog, ranked. 21 route to `coder`, 2 to `ontocoder` (both are JSON configuration changes), 1 needs both.
- **Section D, 11 items not queued** — 4 blocked on a user decision, 2 needing a resource no executor has (a live Plane instance, a specific machine), 4 suspected already resolved and needing a reconciler pass rather than an executor, 1 spec awaiting Circle activation. Plus a note on the two answered-not-realised decisions.

## Two issues appear as plan steps, not as backlog

The plan adopted them, so listing them twice would produce duplicate work:

- `circles/260801-1244-guard-rules-write/issues/260803-1352_*_two-guard-advisory-details-skip-the-200-char-clamp...` is `P:S9`.
- `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/260806-0022_*_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` is `P:S10`.

Both are cited where they sit and not moved into the active Circle, per the Origin Rule's second corollary. Each carries the instruction to append its resolution note and rename its marker on completion.

## Changes from the previous tasklist

All 11 prior entries removed. They were the v4.0.0 workbench-restructure queue generated 260716-1920 for `circles/260716-1847-workbench-umbau`, closed 260716. Nine entries were done and two deferred, so nothing carried forward and no status marker had to be preserved. The header's dead `**Source plan:**` path (pre-v4, root-relative, bracket-marker form) and its `**Circle:** 1 of 2` free-text line are gone.

## Citation form

All 51 workbench-record citations in the new tasklist use the wildcard form `YYMMDD-HHMM_*_<slug>`, per decision `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md`, answered as option (a) and implemented in `a1b7872`. The queue is the artifact most exposed to marker drift, because working its tasks is what moves the markers. `reference-resolution-lint.test.ts` does not cover workbench artifacts, so nothing enforces this here; it was applied because the rationale applies, not because a gate demanded it.

## Observations worth a reader's attention

**The plan's header says `**Status:** Draft`.** The dispatch described the plan as approved, and the Circle record and the session history are consistent with an approved plan. The plan file itself was not updated. The taskplanner does not edit planning files, so this is reported rather than fixed; a reconciler pass or the next coder session should set it to Approved.

**Closing the stale-tasklist issue does not stop the drift.** The issue named three answers. This rebuild performs the first (regenerate). The second (delete `tasklist.md` at Circle closure) and the third (compare the generation stamp against the active Circle and warn) are unbuilt, and the issue's own point stands: regeneration is reliable only if a taskplanner dispatch becomes mandatory at activation, where today it is optional. The 260801 session ran a full Circle without one. The closure note says this explicitly rather than implying the class is handled.

**Nine open issues sit in the files the Circle is about to edit.** That concentration is why the second diagram exists. The risk is not that they get forgotten, it is that an executor fixes one in passing during S3 or S4 and the S5 differential then measures two changes at once, which is the exact failure S1 was sequenced first to prevent.

**One backlog item is a higher-severity guard defect than anything in the Circle.** `circles/260801-1244-guard-rules-write/issues/260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md` is filed Severity High against a security control and describes a real bypass. It is unowned and outside the active Directive, so it was queued as backlog rather than pulled in. Worth the user's notice at the next portfolio pass.

**The 17 measured guard blocks are a different over-deny from the one this Circle fixes.** `circles/260801-1244-guard-rules-write/issues/260805-1830_*_alle-17-guard-blocks-im-beobachteten-konsumprojekt-waren-fail-closed-fehlalarme.md` records a 100% false-positive rate on the Bash surface in a live consuming project. All 17 were unresolvable-operand denials, which the active plan explicitly leaves untouched. Closing the reachability over-deny will not move that number.
