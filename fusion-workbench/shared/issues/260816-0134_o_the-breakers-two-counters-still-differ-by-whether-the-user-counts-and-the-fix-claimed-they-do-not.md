The breaker's two counters still differ by whether the user counts, and the commit closing that defect claimed they no longer do

---
`e18dcb1` closed `260815-2328_c_*` — the Net-negative-progress breaker reading two counters over different populations. Its message states *"Both now read 'by any agent or the user'."* At `3a0408a` they do not. `agents/orchestrator.md:954` reads *"issues filed this session by **any** agent or the user"*; `:955` reads *"issues resolved this session by **any** agent"*. The user is on the created side of the comparison and off the resolved side. That is the same directional bias the fix removed, one population narrower, against a threshold whose difference is zero.

---

## Verified

```
agents/orchestrator.md:954  - `issues_created` — issues filed this session by **any** agent or the user, not only by reviewers at Step 3c
agents/orchestrator.md:955  - `issues_resolved` — issues resolved this session by **any** agent
```

The breaker that reads them, `agents/orchestrator.md:619`: *"2 consecutive Turns where `issues_created > issues_resolved`"*. A strict inequality at a zero difference, so one uncounted resolution flips the verdict.

The user closing a defect by hand is not hypothetical in this project: the batch closure at `4f7508d` is an orchestrator act, but a user marking a record `_c_` between Turns is an ordinary session event, and `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` places no restriction on who renames.

## What the derived figures do, for contrast

`agents/orchestrator.md:737-780` — the Phase 4 block that these two counters are explicitly *not* trusted against (`:962`) — counts `_o_`→`_c_` and file-arrival transitions off the stores. It reads filenames. It is author-agnostic on **both** sides by construction. So the derived pair already covers one population, and the tallied pair, which the breaker actually reads, does not.

## Why the rest of the fix is sound

The parts that did land, verified:

- `:627` — the caveat paragraph is present and its claim checks out: `:962` names exactly four counters as the untrusted set, and both breaker inputs are among them.
- `:643` — the worked example now clears each exit in that exit's own units, and the queue-length claim is counted in queue entries.
- The stated reason for not deriving per-Turn (`:627`) is honest: the Phase 4 block is anchored at the session head and yields cumulative counts, so a per-Turn delta needs a second derivation. That is a design change and belongs in a decision record, as the commit says.

This record is about the one clause the fix did not carry across.

## Fix direction

Change `:955` to *"issues resolved this session by **any** agent or the user"*. One clause, four words, on a surface with 17 147 bytes of head-room.

Then check the sibling pair while the file is open: `:956` `decisions_answered` and `:957` `decisions_implemented` are the other two of the untrusted four, and they are worded as transition counts rather than by author, so they do not carry the same asymmetry — confirm rather than assume.

**Found by:** coderev, reviewing `f4f01b0..3a0408a`. This is a partial landing of `260815-2328`, which is now `_c_`; it should not be reopened, this record carries the remainder.
