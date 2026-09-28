# Does the live dashboard file survive a session that has no Turns?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `## User Decisions Pending` states this question with its full trade-off; C1 removes the schedule the file is written on. `260909-1628-adversarial-review-of-the-cut-fusion-to-a-working-minimum-spec.md` sharpened it by finding the monitor's second reader.

---

## Question

`orchestrator-live.md` is written by the model on a per-Turn schedule, and C1 removes Turns. Keeping
the file therefore means keeping a model-written per-Turn write in a design that has no Turns, which
is the shape the whole cut is against. Dropping it means the monitor's state panel is re-sourced or
goes dark. The question must be answered before C1 lands, because the answer decides whether C1
removes a writer or replaces one.

## Options

1. **Drop the file, re-source the monitor from the event log**: the log already carries most of
   what both readers render.
   - Pros: no model-written state remains; one file carries the session trace, which is what the
     rest of the cut assumes.
   - Cons: the fields no event row carries are lost unless rows gain them; the state panel that
     reads `agentstate.yaml` directly needs its own answer, and `agentstate.yaml` is itself removed.
2. **Drop the file and let the monitor's state panel go dark**: accept the loss.
   - Pros: cheapest; nothing is re-implemented.
   - Cons: a working surface is removed without a replacement, which the spec's own constraint on
     removing things with demonstrated readers argues against.
3. **Keep the file, written on a different trigger**: for instance once per dispatch, machine-written.
   - Pros: the monitor keeps both readers.
   - Cons: a per-dispatch model write is the cost C1 exists to remove; a machine write means the
     hook or a helper becomes a second author of session state.

## Constraints

- Whatever survives may not require a model-written file on a schedule, since no schedule remains.
- `agentstate.yaml` is removed by the same spec, so an option that leans on it is not available.
- The event log already merges by union across checkouts and has one recorded misattribution defect
  of that class; adding readers to it concentrates risk the spec already names.

## Recommendation

None. The trade-off is between a working surface and the design's own rule, and the spec puts it to
the user deliberately.

---
Answered: 260909-1700_*_does-the-live-dashboard-file-survive-a-session-with-no-turns.md `## Question` — the file does not survive, and its information does. A machine-written event row carries the running task and what is pending; the monitor renders the panel from that row instead of from the file, and the state panel is re-sourced the same way rather than going dark. Measured against the alternative: the ETA, the event list and the warnings panel read `orchestrator-events.jsonl` and `.guard-state/events.jsonl` and are untouched by the removal, so what needed a carrier was the queue view alone. The cost is one-off hook work; the recurring model-side write per task disappears; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: 34cd5bc2 — the carrier and the renderer both exist. The dispatch row carries the
running task and the named work item (`9c4dbdbb`), and the monitor's dashboard and state panels
render from `orchestrator-events.jsonl` (`34cd5bc2`), scoped to this checkout. The plan sets this
transition at B4's commit, and this is it. What has not happened yet is the removal itself:
`orchestrator-live.md` is still written and both panels still fall back to it, by design, until
step C0 has proved the log-sourced panels against a live session and step C1 deletes the fallback.
So the answer is realised as a capability and not yet as an absence.

---

Reconciliation (260910-2020, reconciler): the `Implemented:` note above closes by saying "what has
not happened yet is the removal itself" and naming C0 and C1 as what would perform it. Both have
since run. Step C1 (`6357ebfc`) stopped the writes and removed the two fallback halves from
`bin/monitor` — the `orchestrator-live.md` reader, the `/api/state` file path and the two
placeholder messages naming those files — after C0's five checks passed, whose result that commit's
message carries. The answer is realised as an absence as well as a capability at `07961552`. The
marker is untouched; this is evidence, not a transition.
