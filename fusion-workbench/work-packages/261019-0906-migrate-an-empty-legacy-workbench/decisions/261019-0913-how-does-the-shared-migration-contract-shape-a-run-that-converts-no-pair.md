# How does the shared migration contract shape a run that converts no pair: one chunk with no write, or no chunk at all?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261019-0913-which-route-takes-a-legacy-workbench-that-holds-no-record-to-json-control.md, 261019-0913-plan-migrate-an-empty-legacy-workbench.md, 261019-0906-migrate-an-empty-legacy-workbench.md

---

## Question

The user ruled that the migration accepts a legacy workbench holding no record (`261019-0913-which-route-takes-a-legacy-workbench-that-holds-no-record-to-json-control.md`). The contract shared with Prior (`codec/fixtures/prior/REQUESTS.md` `### The operation, phase by phase` and `### The fence on a legacy workbench`) ties three things to chunk 1: the fence is named by chunk 1's apply id and set by apply 1; `verify` runs under that fence; the exempt set of a rollback after activation contains "the one `maintenance end` naming chunk 1's fence". `readIndex` refuses an index with no chunk part, the plan schema requires `writes` with at least one item on a chunk and a write count of at least 1 on a chunk's part entry, and the schedule requires at least one apply id and two rollback ids. A run that converts nothing has no write to cut, so the contract must say what such a run looks like. Prior's Go harness validates the shared fixtures and replays the recorded migration session, so the shape binds Prior's side as well as fusion's.

## Options

1. **One chunk with no write.** The cut always yields at least one chunk, as `split` already yields at least one part of each kind "even with no item" (`codec/src/migration.ts`). A store with no pair gets chunk 1 with an empty `writes` list. Apply 1 sets the fence and commits an intent with no write; verify, `maintenance end`, rollback after activation and chunk 0 run unchanged. The schema relaxes `chunk.writes` to `minItems: 0` and the chunk part entry's `writes` to `minimum: 0`.
   - Pros: no phase, no host step and no exempt set gains a branch; `hooks/migrate.ts` already schedules one apply id and two rollback ids for zero writes (`Math.floor(writes / 48) + 1`); the change is two schema bounds, the cut's close condition and the removal of the plan step's refusal.
   - Cons: one apply request writes nothing but the fence; a reader of a chunk file meets an empty list.
2. **No chunk; verify sets the fence.** The schedule takes zero apply ids and one rollback id. Verify sets the fence in its own sequence, named by its own operation id, and `maintenance end` names that id.
   - Pros: no request that writes nothing.
   - Cons: the fence's id, the exempt set, the first rollback after activation (which becomes chunk 0 and must then remove the manifest and receipt) and the host's `end` all need a branch on the chunk count; the schedule's and the proposal's `minItems` change as well.
3. **No chunk and no fence.** As option 2, but verify runs unfenced on a record-less store and nothing ends a fence.
   - Pros: the fewest requests.
   - Cons: every branch of option 2 plus the loss of the property "ordinary work is fenced from plan to `end`" (section 8.3.4) for one class of store; the exempt set loses its `end` member for that class only.

## Constraints

- The codec alone writes every byte of the run; the host composes the proposal only (request 45).
- The contract's existing non-empty migrations must answer byte for byte as recorded (`codec/fixtures/protocol-session-migration/`, exchanges 01 to 70).
- Prior qualifies the bundle by exact digest and replays every recorded session; a shape Prior has not accepted is not handed over.

## Recommendation

Option 1. Every later phase keys on the chunk count being at least one and on chunk 1's apply id, never on a write count, so a cut that always emits chunk 1 leaves every phase's order and every refusal as Prior qualified them. Options 2 and 3 each add a special case at four sites for one class of store, which is the thicket of branches the design should avoid.

---
Answered: 261019-0913-plan-migrate-an-empty-legacy-workbench.md `## Open Questions` — option 1, the cut yields one chunk with no write; ruled by user, Kai Stalmann <ks@qantr.com>

Implemented: `codec/src/migration.ts` `cut` and `migrationPlan`, `codec/schemas/migration-plan.schema.json` `$defs/chunk` and `$defs/part_entry` — a proposal naming no record freezes one chunk with no write.
