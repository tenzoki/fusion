# Does the operation kernel take one workbench-wide write lock, or keep FJ01's lock per record under the journal?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-2251_*_plan-fj02-operation-kernel-revisions-and-local-transactions.md, 260928-1550_*_plan-fj01-codec-port-bundle-wrapper-and-first-record-round-trip.md, 260928-1735_*_does-transition-keep-walking-the-claim-and-release-edges-once-they-are-operations-of-their-own.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

FJ01's `writeControl` locks one record at a time: `.json-state/<sha256 of the record path>.lock`, created with `O_EXCL`, reaped after 60 s when its holder's PID is gone (`codec/src/store.ts` `acquireLock`, `isStale`). FJ02 adds the journal the spec's section 6 requires for multi-file operations (`create` writes a control file and a narrative; `adopt-plan` writes a package and one or two plan records), and every operation must first recover any pending intent before it reads or writes. A pending intent names several paths, and recovery of it must be atomic with respect to every other local writer. With per-record locks that means taking the locks of every path an intent names, in a fixed order, and re-scanning the journal after each acquisition because a crashed writer may have left a further intent naming paths the recovering process does not yet hold. With one workbench-wide lock the sequence is: lock, recover everything pending, run the operation, unlock. The Prior side's FJ01 acceptance carries a regression that creates a lock file at FJ01's per-record path and expects the codec to wait on it (`docs/design/fusion-fj01-prior-response.md` `## Additional boundary evidence`), so the choice changes a file Prior's test names. The choice has to be made before FJ02's step 2, which lays the journal and the lock down together.

## Options

1. **One workbench-wide exclusive write lock, `.json-state/write.lock`**, taken by every mutation and by every recovery; reads take it only when the journal is non-empty and recovery is needed. The stale rule (age plus holder PID) does not stay as FJ01 wrote it; the last sentence of the Cons below says why and what replaces it.
   - Pros: one lock, one journal scan, one recovery pass, one operation, no lock ordering and no re-scan loop; the invariant "no intent exists at both ends of a read" is enough for a reader to know it saw no torn state; matches the workbench's actual concurrency (one user, one process per request on both hosts).
   - Cons: two local writers of unrelated records serialise; Prior's regression must move its hand-made lock from `<sha>.lock` to `write.lock` (one line in a test, announced in `REQUESTS.md`). With FJ01's stale rule kept as written, one lock makes a writer killed by Prior's cancellation (SIGKILL, so no exit hook) stall every writer of the workbench for at least 60 s, and the reap (`unlinkSync`, then retry) can delete a lock another waiter has just taken (discussion `260929-0709_*_fj02-kernel-plan-and-three-open-choices.md`, C9 and C10); the plan's step 2 pays that cost instead of keeping the rule: a holder whose recorded PID is dead on this host is replaced at once, the age rule stays only for a lock recording no PID, the lock records its host and another host's lock is never replaced, and a stale lock is replaced (never unlinked) only by the one waiter holding the exclusive claim named after its content hash, which keeps Prior's live-owner regression green at the new path (C21).
2. **Per-record locks kept, taken in sorted path order for a multi-file operation**, with recovery acquiring the locks of every path a pending intent names and re-scanning until the held set is closed.
   - Pros: Prior's regression stands unchanged; unrelated records can be written concurrently.
   - Cons: a loop whose termination argument rests on the finiteness of the journal; two code paths (single-path fast case, multi-path recovery case) where one would do; the reader's consistency argument needs the same closure computation.
3. **Per-record locks plus a separate journal lock** taken around every journal scan and recovery.
   - Pros: recovery is serialised without ordering per-record locks.
   - Cons: two lock kinds with an ordering rule between them (journal lock before record lock, always), which is the deadlock discipline option 1 avoids by having one lock.

## Constraints

- Spec section 6: a local exclusive write lock, CAS, durable intent before changes, a journal for multi-file operations; readers never serve a mixed state; locks are local and never cross-checkout coordination; `.json-state/` is class L.
- Prior's FJ01 response, item 8: one process per request, a deadline per call, the process group killed on cancel; a lock the codec waits on is therefore always released by the adapter's cancellation, never by the codec giving up the write.
- Whatever is chosen is announced to the Prior side in `codec/fixtures/prior/REQUESTS.md` `## FJ02` before Prior re-pins, since the regression names the lock path.

## Recommendation

Option 1. The journal's whole argument is that recovery and the operation that follows it happen under one exclusion, and one lock is that exclusion stated once. The concurrency option 2 preserves is not one either host uses: Prior runs one process per request under a deadline, and the Claude side runs one agent's helper call at a time. The cost is one line in Prior's regression, which `REQUESTS.md` names.
