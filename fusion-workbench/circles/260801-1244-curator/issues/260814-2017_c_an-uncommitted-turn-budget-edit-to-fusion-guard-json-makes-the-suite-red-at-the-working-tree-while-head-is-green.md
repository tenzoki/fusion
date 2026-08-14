An uncommitted Turn-budget edit to fusion-guard.json makes the suite red at the working tree while HEAD is green

---
`fusion-guard.json` at the repository root carries an uncommitted change — `"orchestrator": {
"maxTurns": 12 }` inserted as the first key — and `hooks/lib/__tests__/config.test.ts:1325-1336`
asserts that this file is byte-identical to `templates/fusion-guard.json`. So `cd hooks && npm test`
fails 1 of 1 030 tests in the working tree. The committed copy is identical to the template, so the
same suite is green at HEAD `41c224c`. The failure exists only in the tree, and only for as long as
the edit is uncommitted.

---
**Verified, not reported.** `git show HEAD:fusion-guard.json | diff - templates/fusion-guard.json`
returns nothing, so HEAD is clean. `git status --short` shows ` M fusion-guard.json`, and
`git diff` shows the single added line. `cd hooks && npm test` at the tree: `Test Files 1 failed |
48 passed (49)`, `Tests 1 failed | 1029 passed (1030)`, the one failure being
`config.test.ts > is what this repository's own fusion-guard.json is, byte for byte`. The same
suite run against the golden test alone passes 15 of 15, so nothing else is affected.

**Why the edit was made.** `agentstate.yaml` records `progress.max_turns: 12` while this session's
own Setup snapshot in `shared/history/260813-2345-orchestrator-session.md` records a Turn budget of
5. `bin/fusion-turn-budget` reads the budget from `fusion-guard.json` and from nowhere else, and
`CLAUDE.md` states that this file is where a project sets it. So raising the budget mid-session for
this Circle is the documented way to do it, and doing it is what broke the pin.

**The tension is real and neither side is obviously wrong.** `config.test.ts`'s assertion exists
because the root copy is meant to be the template verbatim, and its own comment says the two "drift
the first time someone edits the one they happen to have open" — this is that. But
`fusion-guard.json` is also the one file a project, including this one, is supposed to edit to
configure itself, and the Turn budget is the first setting that gives this repository a reason to.
The pin makes fusion's own repository the one project that cannot use the mechanism it ships.

**Three ways out, none chosen here.**

1. Revert the edit and run this repository at the shipped default budget. Cheapest, and it keeps the
   pin honest, but it means the plugin's own sessions can never raise their budget.
2. Narrow the assertion: compare the two files for the documentation keys and allow the root copy to
   carry configuration leaves the template does not. That keeps the "the notes are the same" value
   the test was written for and drops the byte-identity it actually asserts.
3. Move this repository's own configuration to a layer the test does not read. There is no such
   layer today for the Turn budget, so this one is a design change rather than an edit.

Whichever is taken, the immediate state has to be resolved before a release: `npm test` green is
step 0 of the release process in `CLAUDE.md`, and it is red in the tree right now.

**No commit carries this and no review opened it.** `bin/fusion-staging-drift` reports `clean`
because it scans `fusion-workbench/` only and this file sits at the project root, and
`bin/fusion-review-coverage` tiles commits, of which this change is not one. It was found by running
the suite.

**Filed by:** reconciler, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the edit was made to run
this Circle past its 5-Turn budget.

---
Resolved: duplicate. A `coderev` Turn-5 review pass was running concurrently with this
reconciliation and filed the same defect at 20:24 as
`shared/issues/260814-2022_o_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`.
That record is the fuller one — it carries the mtime of the edit (2026-08-14 19:35:20, after the
Turn-5 task reported a green suite at 19:12), the default at `hooks/lib/config.ts:277`, the
`_turnBudget` note in `templates/fusion-guard.json:6` that tells every project this file is where
the budget is set, and two cross-references to the same shape one layer up in
`circles/260813-0910-documentation-matches-shipped-plugin/issues/`. It is also placed better: the
tension between the pin and the documented configuration surface is general to this repository
rather than caused by this Circle's Directive, so `shared/` is the Origin Rule's answer and this
record's own placement reasoning was wrong.

Closed against that record. This one's measurement stays on disk and in git as the second
independent observation of the same failure, taken at the same HEAD by a different agent from a
different starting point.
