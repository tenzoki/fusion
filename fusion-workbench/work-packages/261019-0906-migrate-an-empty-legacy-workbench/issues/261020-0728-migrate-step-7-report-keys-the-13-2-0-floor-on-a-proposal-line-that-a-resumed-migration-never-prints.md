/fusion:migrate Step 7's report keys the 13.2.0 floor on a `proposal=` line that a resumed migration never prints
---
The report's floor sentence names 13.2.0 for "a migration whose `proposal=` line said `0 records`". `bin/fusion-migrate` prints that line only at the end of a `run` that completes. `resume` never prints it, and the Interrupted route skips the question that carries the other copy of the floor. That route is the one the 13.2.0 help paragraph sends every record-less workbench a pre-13.2.0 run refused. On it the user gets a condition they cannot check.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261020-0644-migrate-step-7-keys-the-record-less-notice-and-the-13-2-0-floor-on-every-count-being-0-which-a-terminal-only-workbench-misses.md`

**Severity:** Low. Scope: `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, the **Report** paragraph. The codec and the host behave correctly.

**Evidence.**

- `hooks/migrate.ts`, the `run` function: it returns `[...lines, \`proposal=…\t${p.records.length} records\`, ...drive(wb, session, s)]`. `drive` is evaluated inside that array, so a run that throws (exit 7 interrupted, exit 8 refused) prints no `proposal=` line. `resumeRun` returns `drive(...)` alone, and `status` prints no record count.
- Measured in a scratch root holding one deferred issue (`plain-terminal 1`). A stand-in codec refused `plan` the way the codec before `a9ac4fe4` did, as `hooks/lib/__tests__/migrate.test.ts` "the record the old refusal left" sets it up. `run` exited 8 with no stdout. Then this checkout's `bin/fusion-migrate resume` printed `planned=… 1 chunks`, `applied=1`, `verified=…`, `setup=`, `migrated=` and `result=json-control`, and no `proposal=` line.
- `skills/help/SKILL.md` `### 4. Update`, the 13.2.0 paragraph: "The record a run refused before this release left routes to `ROUTE=interrupted` at Step 7, which offers `resume`, which migrates". Step 7's **Interrupted** paragraph goes straight to continue or undo. The question to migrate, which carries the unconditional "13.2.0 to roll back or re-run a migration that converts no record", is never reached.
- Step 7, **Run**: it says to show `reported=`, `untracked=`, `ignored=` and the receipt. It does not say to show `proposal=`, so even on a completed run the user has not seen the line the report names.
- Step 7, **Report**: "Then repeat the sentence: … (13.2.0 to roll back or re-run a migration whose `proposal=` line said `0 records`)". The sentence it says it repeats reads "a migration that converts no record". So the two copies differ.
- What the floor guards is measured in `codec/fixtures/prior/REQUESTS.md`, the second `### The version boundary, measured`: the bundle that 13.0.0 to 13.1.12 carry (`fb170361…`, the same blob at `v13.0.0` and `v13.1.12`) refuses rollback and the second-run no-op over a zero-write index, and moves no byte. A missed floor costs a refusal, not data.

**Fix direction.** Have the report repeat the question's sentence word for word: "13.2.0 to roll back or re-run a migration that converts no record". That clause is general, so it is true on every route without a predicate. If the report should also tell the user whether *their* migration is one, key that on an observable every route prints, for example a record count on `bin/fusion-migrate status`, which is a code change.

**Acceptance test.** On the refused-then-`resume` route and on a completed `run`, the report's floor sentence is the question's sentence and names no helper output line. `cd hooks && npm test` is green, `surface-growth-bound.test.ts` included.

Resolved: `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, the **Report** paragraph: the floor parenthetical now reads "(13.2.0 to roll back or re-run a migration that converts no record)", word for word the clause in the question to migrate. It names no helper output line, so it holds on the refused-then-`resume` route as on a completed `run`. No code change; a record count on `bin/fusion-migrate status` was not added.
