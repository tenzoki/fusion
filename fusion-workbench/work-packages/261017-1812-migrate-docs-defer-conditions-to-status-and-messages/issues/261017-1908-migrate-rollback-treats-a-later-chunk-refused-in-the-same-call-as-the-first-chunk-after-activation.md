# migrate: `rollback` treats a later chunk refused in the same call as a refusal of the first chunk after activation, because it tests an `inspect` taken before the loop

---
`rollback` in `hooks/migrate.ts` calls `inspect` once, before its chunk loop. Its `catch` sends a refusal to `refusedFirstChunk` when `i.state === "json-control"`, and the comment there says "Still activated, so no rollback chunk landed: the refused one was the first". The loop sends several chunks in one call. The first rollback chunk after activation removes the manifest (`idleFence`'s comment says so), so the tree is legacy once that chunk lands. If the next chunk in the same call is refused (exit 8), `i.state` still reads `json-control` from the earlier snapshot, and `refusedFirstChunk` runs for a chunk that was not the first. With no work stored since the plan, its message says the fence stands and offers `rollback --end-fence` "to end the fence and stay under JSON control", but the store is already legacy. With work stored, it sends `maintenance end` to a legacy store, the codec refuses it, and the message reports that ending the fence failed. Nothing is removed, so the harm is a misleading message. A plain `rollback` run again resumes correctly.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`, `261017-1823-migrate-skill-interrupted-says-an-exit-8-rollback-names-the-way-out-where-ending-its-fence-was-refused.md`

**Evidence (read at `d825345e`; inference from reading the code, not reproduced).**
- `hooks/migrate.ts` `rollback`: `const i = inspect(wb);` before the loop. In the `catch`: `if (!(e instanceof Stop) || e.code !== EXIT.refused || i.state !== "json-control") throw e; throw refusedFirstChunk(wb, session, s, e);`.
- `hooks/migrate.ts` `idleFence` comment: "the first after activation removes the manifest".
- `codec/README.md` `## The kernel and the journal`: "a legacy or unsupported workbench refuses every operation but `initialize`". The `## Ending a fence over a legacy tree` section of the `hooks/migrate.ts` header says the codec admits no `maintenance end` over a legacy tree.
- `hooks/migrate.ts` `refusedFirstChunk`: the message for `work === null || work.length === 0` ("… or run `bin/fusion-migrate rollback --end-fence` to end the fence and stay under JSON control …"), and the `endRollbackFence` attempt otherwise.
- The 13.1.12 header's `rollback` entry speaks only of "the first chunk after activation", so no doc sentence is false here. Only the code's premise is.

**Fix direction.** Decide "first after activation" from evidence the loop has, not from the snapshot. For example, take the branch only when no rollback chunk was sent and stored in this call and none of the schedule's rollback chunks was stored before it, or re-read `inspect` in the `catch`. Add a test with a refusal on the second chunk of one call. Rebuild `hooks/dist/migrate.js` so `committed-dist` stays green.

**Acceptance.** A refusal of any rollback chunk other than the first after activation never reaches `refusedFirstChunk`. It stops with the codec's refusal and leaves the fence alone. A test pins this.
