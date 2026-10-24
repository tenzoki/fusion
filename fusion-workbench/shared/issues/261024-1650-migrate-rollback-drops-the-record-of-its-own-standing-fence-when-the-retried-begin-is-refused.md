migrate rollback drops the record of its own standing fence when the retried maintenance begin is refused
---
Since 5e16e63d (13.3.8), a `rollback` whose `maintenance begin` set the fence but lost its stored answer clears `s.rollback` on the retry. The fence stays, no helper command ends it, and `run` answers the verified no-op over a store that refuses every write.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Medium
**Cross-references:** 261024-1650-reviewer-post-release-pass-over-v13-3-8.md, 261024-1425-migrate-run-says-is-being-rolled-back-over-a-record-whose-rollback-maintenance-begin-was-refused.md

## Defect

`hooks/migrate.ts` `function rollback`, the catch around `send(... action: "begin")`, sets `s.rollback = null` on any exit-8 refusal where `!stored(wb, begin)`.

The codec sets the fence first and stores the answer second. `codec/src/kernel.ts` `mutate` says so: "a crash between leaves the fence set and no answer, and a retry meets the fence it set, named by its own id." That retry is refused `conflict/maintenance-active` by `fenceRefusal`, because only an `end` passes a standing fence.

So the refusal comes back with `begin` not stored, although the standing fence *is* `begin`. The `!stored` test cannot tell this case apart. The kernel stores no refusal and answers a stored request before it refuses, so the test is true on every refusal.

## Evidence (probe at fd535452 against dfcc9fc5, `--session <home>/own`)

Setup: a done `run`. Then `rollback` with the begin's answer lost (stand-in exits 9 after the real codec ran, so exit 7). Then `.json-state/ops/<begin_id>.json` is removed, which is the state the crash between `writeFence` and `writeAnswer` leaves. `status` shows `fence=<begin_id>`.

| Step | dfcc9fc5 (13.3.7) | fd535452 (13.3.8) |
|---|---|---|
| named retry `rollback` | 8, `maintenance begin refused: conflict/maintenance-active ... set by operation <begin_id>` | the same |
| record after | `T/set/F` | `T/null/F` |
| `rollback --end-fence` | 0, `result=json-control`, fence `-` | 5, "no fence of a refused rollback stands ...; nothing was sent", fence still `<begin_id>` |
| `run` | 0 `no-op` | 0 `no-op`, "the session records this migration as verified", store fenced |

At 13.3.8 every later `rollback` mints new ids, is refused by the same fence and clears them again. No command of the helper ends the fence. The only way out is deleting `.json-state/maintenance.json` by hand, and no message names that.

Pre-existing in both versions: the exit-8 message at the retry names no way out. At 13.3.7, `--end-fence` would have ended the fence, but the message did not say so.

## Acceptance

1. In the state above, the retried `rollback` leaves `s.rollback` set. The refusal names `rollback --end-fence`, and that command ends the fence (exit 0, `fence=-`).
2. A begin refused by a fence of another id still leaves `s.rollback` null, and `run` then answers the no-op. The test `a rollback whose maintenance begin a foreign fence refused ...` stays green.
3. A test pins (1). It fails at fd535452.

Fix direction, not binding: decide on the standing fence, not on `stored`. One way is a fresh `inspect` in the catch, nulling only when `maintenance.operation_id !== begin`. Another is to treat a standing fence under `begin` as begun before sending.
