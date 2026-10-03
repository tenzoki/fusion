# How does the frozen plan carry an optional repair, when the migration-plan schema admits a repair only for a blocking finding?

---
**Domain:** code
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md

---

## Question

Step 12d makes every repair optional: the composer derives, carries or defaults every class `hooks/lib/legacy-repair.ts` repairs, so all of them are `reported`, and `repair --apply` takes a reported finding. `hooks/migrate.ts` `serialise` carries the session's repair log into the proposal's `repairs`. `codec/schemas/migration-plan.schema.json` `$defs/repair` pins the entry's `finding.severity` to `const: "blocking"` (its description: "the blocking finding it cleared"). With the bundle frozen at `f3de44c1`, any applied optional repair makes `plan` refuse `schema-invalid/proposal-invalid` (`/repairs/0/finding/severity const`). Measured in step 12d on the fixture: the duplicate-step repair applied with consent, then `run` exited 8 with that refusal and nothing migrated. Because no repairable class is blocking any more, the `repairs` part can only ever be empty or refused. The contract text (`codec/fixtures/prior/REQUESTS.md` `## FJ04 (addendum for the user's ruling of 2026-10-03)`, "The repairs become optional") keeps the repairs available and says a repaired value is a recorded one; it does not say how the frozen plan records it.

The answer is owed before step 12e: the skill names `repair --list --optional` to the owner.

## Options

1. **The schema admits `reported` in a repair's finding.** `data-implementer` drops the `const`, the bundle is rebuilt and the digest moves again before step 13. A fixture shows a reported repair entry.
   - Pros: every consented edit, a control-only actor included, stays in the frozen plan, as step 8 designed.
   - Cons: a codec change after `f3de44c1`; one more digest before the hand-over; Prior reads the schema change.
2. **The host carries only repairs of blocking findings in `repairs`; an optional repair stays in the session's `repair-log.jsonl` and the external backup.**
   - Pros: no codec change; the schema's sentence "the blocking finding it cleared" stays literally true.
   - Cons: the workbench no longer explains why `originals/` differs from the backup. A control-only answer (a terminal record's actor) then enters a control with no `derived` entry and no frozen record of where it came from.
3. **`repair --apply` refuses a reported finding until option 1 lands.** `--optional` still lists.
   - Pros: no trap ships: an owner cannot make the migration unrunnable by a repair.
   - Cons: departs from the contract text that keeps the repairs available.

## Constraints

- `codec/` is frozen for this step at `f3de44c1` (686 926 bytes, `sha256:4bc2dc26…`).
- A value the user answered is never recorded as derived, and no record states a finding as blocking that was reported.

## Recommendation

Option 1. It is the only option that keeps every consented value traceable inside the workbench. Option 2 loses that for control-only answers. Until it is ruled, step 12d's tests migrate without a repair and list the optional repairs without applying one.
