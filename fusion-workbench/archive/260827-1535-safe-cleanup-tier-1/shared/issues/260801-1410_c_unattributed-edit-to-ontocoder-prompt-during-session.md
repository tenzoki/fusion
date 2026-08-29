An agent prompt was modified during a session by no task that authorized it, and nothing stopped it

---

`agents/ontocoder.md` gained seven lines during the orchestrator session of 260801, and no dispatched task named that file or authorized editing it. The working tree was clean apart from the untracked workbench at session start; the file is modified now. The change is uncommitted and was deliberately left out of commit `56a41c4`.

---

## What was added

A scope-exclusion bullet under `ontocoder`'s "not your scope" list, excluding session and project bookkeeping files (`activity-log*.md`, `CLAUDE.md`, the project root `README.md`) unless a task names them explicitly. It describes a recurring failure mode where the agent piggybacks an activity-log update onto an unrelated ontology change.

## Why it is filed rather than reverted

The change reads as substantively reasonable, and its provenance is not certain. It may be the user's own edit made in a parallel window rather than an agent's. It was therefore left in place, unstaged and uncommitted, for the user to judge, rather than reverted per the orchestrator's usual out-of-scope handling (`agents/orchestrator.md` Phase 2 Step 3a item 5).

## Why it matters regardless of who wrote it

**The write guard could not have stopped it here.** `agents/**` is in `guard.protectedPaths` (`hooks/config.json:8-18`), but the guard stands down entirely when cwd is the plugin's own repo (`hooks/lib/self-detect.ts:18-33`). In a consuming project the same edit would have been blocked on the `Edit` path — and would have succeeded anyway through a shell, per `260801-1156_*_bash-bypasses-the-protected-path-check-entirely.md`. Either way nothing detected it. It surfaced only because a coder noticed an unexpected entry in `git status` and mentioned it in its report.

**The added text asserts orchestrator behaviour that does not exist.** It states "The orchestrator grep-checks staged diffs before committing." No such check is specified in `agents/orchestrator.md` and none is implemented. Whatever the merit of the rest, that sentence creates exactly the class of defect the curator Circle exists to detect: a normative file asserting something untrue about the system, in a file loaded into an agent's context on every run.

## Suggested resolution

Three parts, in order:

1. The user confirms or denies authorship. If an agent wrote it, that is a scope violation worth understanding, since no dispatched task in the session was near this file.
2. If the substance is wanted, keep it — but remove or implement the grep-check sentence. An unimplemented assertion is worse than no rule.
3. Consider whether the orchestrator should diff the working tree against its own expected file set after each dispatched task, rather than relying on an executor happening to report an anomaly it noticed in passing.

Part 3 is the durable fix and is not specific to this incident.

---
**Reconciliation 260801-2029 (reconciler) — part 2 done, parts 1 and 3 still open. Marker stays `_o_`.**

Part 2 of the suggested resolution is discharged. Commit `a342e9b` ("docs(ontocoder): exclude session bookkeeping from scope; drop a false claim") committed the nine lines and removed the false sentence. Its message states the verification: no grep appears anywhere in `agents/orchestrator.md`, Phase 2 Step 3b describes no inspection of what was staged, no implementation exists in hooks or skills. The replacement claim rests on `agents/orchestrator.md:357` and then states the position honestly — explicit staging means a stray edit is not swept in by default, but nothing detects one either. The unimplemented assertion this issue called "worse than no rule" is gone.

Part 1 is unresolved on the record. Nothing in the Circle's history files, the session history, or the commit trail records the user confirming or denying authorship. The commit is authored `Kai Stalmann <ks@qantr.com>` with `Co-Authored-By: Claude`, which is how every commit in this session is attributed and therefore says nothing about who wrote the nine lines.

Part 3 — the durable fix, that the orchestrator diff its working tree against its own expected file set after each dispatched task — is not implemented and no plan step or Circle covers it. It is the part this issue itself called durable and not specific to the incident.

Note the issue's own observation held during this Circle: the guard could not have stopped the edit here, and after the Bash-inspection Circle
(`archive/260817-1907-safe-cleanup-scoped/260801-1244-guard-bash-inspection`) it still could not, because the plugin-repo stand-down covers the new shell check too by design (`hooks/lib/__tests__/guard-bash-integration.test.ts:398-410`). The Circle closed the shell bypass for consuming projects and deliberately did not change this repo's behaviour.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `260817-1836-reconciliation.md`). Partly settled. The text half landed: `a342e9b` removed the false "grep-checks staged diffs" sentence and kept the scope-exclusion bullet, and `agents/ontocoder.md:33-36` reads correctly at HEAD. Two halves are untouched. The authorship question has no answer anywhere in the workbench, and the proposed orchestrator step — diff your own working tree against the expected file set after a dispatch — does not exist in `agents/orchestrator.md`. Marker stays open on those two.

---
Resolved: referred (backlog) — part 1, the authorship, is unanswerable from disk and part 2 landed in a342e9b; part 3, the orchestrator diffing its working tree against the expected file set after each dispatch, is the idea; backlog entry to be filed by the user
