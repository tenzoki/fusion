# How does the host hold maintenance exclusivity over codec writers while it moves pairs?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1030_*_plan-the-archive-revision-archive-leaves-json-control-and-json-archival-follows-its-qualification.md, 260928-2251_*_does-the-kernel-take-one-workbench-wide-write-lock-or-keep-a-lock-per-record-under-the-journal.md, 261001-0638_*_json-pairs-cannot-be-archived-until-request-36-is-answered-and-the-archive-safety-filter-reserves-no-json-surface.md

---

## Question

Prior `b912302` (`Prior: docs/design/fusion-fj03c-prior-response.md` `## 36`, "Moving and recovering") makes an archive move an explicit maintenance action. Participating writers stop, and so do reads that could recover intents. Pending committed writes are settled first. Source revisions are rechecked after exclusivity is taken. After a partial move, normal work does not reopen. Prior adds that "a reference check followed by an uncoordinated `mv` is insufficient". Nothing in fusion can provide that today. The codec's one workbench-wide lock (`codec/src/store.ts`) is held only for the duration of one codec process, and a dead holder's lock is taken over as stale. Claude sessions, other checkouts and Prior's host all write through the same bundle, and no host-level convention reaches them all. The choice decides whether this codec revision gains an operation, so it is due before plan step 1.

## Options

1. **A persistent maintenance fence in the codec.** A new operation `maintenance` with `action: begin | end`. `begin` takes the lock, recovers what it can, and refuses `operation-unknown/recovery-blocked` while any intent stays pending. Otherwise it writes a fence file under `.json-state/` naming its operation id and time. While the fence stands, every mutation, `initialize` excepted (it never meets a fenced `json-control` store), is refused `conflict/maintenance-active` before it writes an intent. Reads keep answering, and since no new intent can be written they have nothing to recover. `end` removes the fence for the operation id that set it. `inspect` names the fence additively. The fence survives a crash, so a half-done move keeps the store closed until the host resumes or restores it.
   - Pros: one fence for both hosts and every session, enforced where every writer passes. It survives a crash, which Prior requires. Reads that the archive verification needs still work.
   - Cons: a sixteenth operation, a schema branch, a new reason and an `inspect` field, all of which go into this revision's contract delta and Prior's re-pin. A fence left behind by a crashed run blocks writes until somebody ends it. The host must name that state.
2. **The host holds the codec lock for the move**, through a codec process that takes the lock and keeps it until its stdin closes.
   - Pros: no persistent state.
   - Cons: other writers time out after 65 s with `conflict/lock-timeout`. A crash releases the fence: the lock becomes stale and is taken over, so normal work reopens over a partial move, which Prior forbids.
3. **Host-side convention only.** The skill asks the user to stop other sessions and rechecks hashes before and after.
   - Pros: no codec change.
   - Cons: this is exactly the uncoordinated move Prior calls insufficient. Nothing stops a writer in another checkout or in Prior's host.

## Constraints

- Prior rules that the move itself is a host operation and not a codec transaction. The fence may close the store, but it may not move files.
- Request 38 (takeover) is not in this revision. The fence grants no claim authority.
- The fence writes no record, so it composes no `record_change` row (item 32).

## Recommendation

Option 1. Options 2 and 3 each fail one of Prior's stated conditions, crash persistence and coordination respectively. Option 1 is the only option that both hosts' writers cannot bypass. If the user rules this way, plan step 1 proposes it as request 39, a contract change put for answer, and plan steps 7 and 8 implement it.

A second opinion (2026-10-01) agrees with option 1 and adds what recovering a fence requires.

- **Order.** Under the lock the replay lookup comes before the fence check, so a completed operation still replays its stored answer. A second `begin` under another operation id is refused `conflict/maintenance-active`.
- **Recovery.** The host writes its inventory, naming the fence's operation id, before `begin`. `bin/fusion-archive resume` finishes or restores a run. `bin/fusion-archive abandon` ends a fence with nothing moved. With the inventory lost, the documented last resort is deleting `.json-state/maintenance.json` by hand.
- **Visibility.** `/fusion:check` reports an active fence. `bin/fusion-write` maps `conflict/maintenance-active` to a message that names `resume` and `abandon`.
- **The limit, stated in request 39.** The fence is local to one checkout, because `.json-state/` never travels (`JSON_LIVE_STATE` in `hooks/lib/staging-drift.ts`). A checkout that has not pulled the move can add a reference to an archived record. A `reconcile` after the pull is the only place that catches it, and no mechanism closes the gap.

---
Answered: plan `261001-1030_*_plan-the-archive-revision-archive-leaves-json-control-and-json-archival-follows-its-qualification.md` — option 1 — a durable codec maintenance lock as a sixteenth operation, with the recovery path and visibility the second opinion asked for, put to the Prior side as request 39 (a contract change); the user approved it with the plan on 2026-10-01; ruled by user, Kai Stalmann <ks@qantr.com>
