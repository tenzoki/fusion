Step 9's harness reduction deletes four fixtures `guard-bash-integration.test.ts` still imports, and its "five surviving files" count is wrong

---

Plan step 9 says of `hooks/lib/__tests__/helpers/guard-harness.ts`: "the governed-project
fixtures (`GOVERNED_*`, `withGovernedProject`, `governedFiles`, `GOVERNED_CONFIG`), the seeded
`escalation.json` and `readEscalation`/`EscalationSnapshot` go; the rest of the harness is used
by five surviving files and stays."

Both halves are wrong about the tree, and in the same way the two ordering defects already filed
in this Circle were wrong: a step reasons about a symbol's last consumer and the consumer is in a
file the step's own list does not name.

**The fixtures keep a consumer step 9 does not delete.** `hooks/lib/__tests__/guard-bash-integration.test.ts:5-17`
imports `GOVERNED_PATH`, `governedFiles`, `readEscalation` and `withGovernedProject` from the
harness. That file is in no step's Files list — not step 9's four deletions, not its nine edits,
not any other step. Grepped at `3c2e1c6` across `hooks/lib/__tests__/`, the consumers of each
fixture step 9 removes are:

| Fixture | Consumers at HEAD | Left after step 9's four deletions |
|---|---|---|
| `withGovernedProject` | `guard-escalation-shape`, `guard-halt-event`, `guard-project-config-integration`, `guard-bash-integration` | `guard-project-config-integration` (edited), **`guard-bash-integration` (unowned)** |
| `governedFiles` | `guard-project-config-integration`, `guard-bash-integration` | same |
| `GOVERNED_PATH` | `guard-halt-event`, `guard-escalation-shape`, `guard-project-config-integration`, `guard-bash-integration` | same |
| `readEscalation` | `clear-halt-concurrent-halt`, `guard-escalation-shape`, `guard-project-config-integration`, `legacy-halt-clearing`, `guard-bash-integration` | `guard-project-config-integration`, `legacy-halt-clearing` (both edited), **`guard-bash-integration` (unowned)** |

So executing step 9 as written turns a file that is already red at five cases into a file that
cannot be collected at all, and the step's own verification (`npm test` green) is unreachable
without touching a file the step never names.

**The count is wrong too.** Twelve test files import the harness at HEAD. Step 9 deletes four of
them (`clear-halt-concurrent-halt`, `guard-escalation-shape`, `guard-halt-event`, plus
`escalation.test.ts`, which imports the module rather than the harness), leaving **nine**
harness consumers, not five: `guard-state-shape`, `guard-bash-integration`,
`guard-project-config-integration`, `hook-fail-open`, `legacy-halt-clearing`, `review-coverage`,
`session-start-subdirectory`, `staging-drift`, `surface-growth-bound`. `withPluginProject`, which
step 9 does not mention at all, has four consumers after the deletions and must stay.

---

Context: found by `coderev` reviewing Turn 1 of this Circle, range `3d41d4a..3c2e1c6`. Verified
by `grep -l` over `hooks/lib/__tests__/*.ts` and `helpers/*.ts`, and by
`cd hooks && npm test -- lib/__tests__/guard-bash-integration.test.ts` (5 failed, 10 passed).

Related and not duplicated:
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2021_o_the-plan-requires-guard-bash-integration-to-stay-green-while-five-of-its-cases-assert-a-deny.md`
records that the same file is red and absent from step 9's list, and proposes adding it. This
record is the second half of that: even with the file added, step 9's harness instruction as
written removes the fixtures the re-pointed cases would run on, and the instruction's own count
of surviving consumers is off by four. The two need fixing in one pass, or the second will be
rediscovered when the first is done.

This is the third defect of the shape the Circle has now met three times
(`260816-2032_c_*` for `clear-halt.ts` importing `escalation.ts`, `260816-2108_o_*` for
`matchesAny`'s caller sitting in `config.ts` rather than in `guard.ts`). All three are a step
asserting "this loses its last caller" against a caller the step did not grep for. Worth
considering as a plan-wide check rather than a third point fix: before any remaining step
deletes an exported symbol or a fixture, grep it across `hooks/**` including `__tests__/`, and
add every file that comes back to that step's Files list.

What it costs if it stands: step 9 lands, the compile of the test surface breaks on a file the
executor was not told about, and the executor either edits outside its file list or reports the
step done with the suite red for a reason nobody wrote down.
