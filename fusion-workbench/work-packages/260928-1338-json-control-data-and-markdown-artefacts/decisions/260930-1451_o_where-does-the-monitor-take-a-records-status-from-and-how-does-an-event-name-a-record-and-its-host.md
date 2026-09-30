# Where does the monitor take a record's status from, and how does an event name a record and its host?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260930-1451_*_plan-fj03b-observers-checkers-citations-and-the-monitor-on-json.md, 260929-1810_*_what-does-the-claude-side-declare-about-a-read-that-finishes-a-committed-intent.md, 260929-1919_*_the-dispatch-hook-reaches-the-claimed-package-helper-through-fusion-rules-so-how-does-it-stay-off-the-codec.md

---

## Question

Row 8 of section 7 of the specification (Prior `ad21e58`, `concept/fusion-json-workbench-spec.md`) asks of the monitor and the events: "Status aus JSON, Historie lesbar; neue Ereignisse mit Host-/Record-Bezug, alte Gate-Strings erhalten". FJ03b carries that row in code. Two facts, read at fusion `c6c25d3e`, make the row a design choice and not a mechanical change:

- **The monitor cannot reach the codec as the helpers do.** `bin/monitor` is a bash wrapper around an embedded Python HTTP server. `/fusion:setup` copies it verbatim into the workbench, and the user starts it there by hand (`./fusion-workbench/monitor <name> <port>`). Its own comment says it has "no reliable `$FUSION_PLUGIN_ROOT` at poll time", which is why it already reads `.checkout-id` and `shared/checkouts/<hex>.md` directly (`bin/monitor`, the comment above the alias reader). It polls every 2 seconds by default (`INTERVAL=2`). It reads no record today: the dashboard shows the running dispatch's `work_item`, a container basename copied from the dispatch prompt.
- **No automatic hook may read record content.** The rows that name a record today are written by automatic hooks: `task_start` carries `work_item` from the prompt text (`hooks/lib/orchestrator-events.ts` `workItemFromPrompt`), and `guard_allow`, `staging_drift` and `citation_form` carry paths. A record reference in the sense of section 4.4 is `(workbench_id, record_id)`, and both halves live in JSON. A hook that opens `package.json` or `workbench.json` to copy an id is a second reader beside the codec (section 6, "kein zweiter unabhängiger Parser"), and could copy a mixed state during an unfinished operation. A hook that asks the codec breaks the recovery rule (`hooks/lib/__tests__/hook-route-exclusion.test.ts`).

So "the current status of record X" is not something the monitor can decide from the inputs it has. Either the mechanism that supplies the status changes, or the monitor gains a route to the codec.

## Options

1. **Events carry the observed change; the monitor reads events only.** A new row kind, written only on an explicit mutation route after the codec answered it (FJ03c's write client is its first caller; FJ03b defines the writer and the readers): `{ts, event: "record_change", host: "claude", workbench_id, record_id, path, kind, from, to, revision, operation_id, person, checkout, session_id}`, appended to `orchestrator-events.jsonl` (class R2). Every value comes from the request the caller sent and the answer the codec gave, so nothing is read from disk to write it. The monitor shows, for the running work item, the last observed change: status, revision, host and time, labelled as observed rather than current. A work item with no such row shows "no observed change". Rows written by hooks keep their shape; old rows, the retired kinds and the gate strings render as before.
   - Pros: the monitor never runs the codec, so the recovery declaration Prior confirmed at `ad21e58` stays exactly as worded. It needs no plugin root at poll time. `host` makes the log a shared surface for the Prior host, which can append its own rows. History stays readable by construction, since the log is append-only.
   - Cons: the monitor shows the last observed change, not the current state. A hand edit, a change made before the row kind existed, or a write by a host that logs nothing is invisible to it until the next logged change. Before FJ03c nothing writes the row, so the panel is proven on fixture rows only.
2. **The monitor asks the codec.** The wrapper resolves the plugin root at start (a new `-p <plugin-root>` flag, or `FUSION_PLUGIN_ROOT` required), and the server runs a gated status helper (`inspect`, then `list`) at most once per bounded interval. New hook-written rows gain `host`, and name a record by its workbench-relative control path, which an explicit reader resolves to an id through `list`.
   - Pros: the dashboard shows the current JSON status of every package, not only the last logged change.
   - Cons: a process nobody calls per read sends reads that may finish a committed intent on its own schedule. That widens the declaration, which admits recovery "for a helper somebody called and for nothing else", so it needs the Prior side's confirmation again. Starting the monitor gains a required argument, and a monitor started without it has no status. It adds 0.4 to 0.7 s of spawns per refresh, and the cadence has to be bounded.
3. **Events as in 1, and the codec only on an explicit click.** The page shows the observed changes of option 1 and offers a "read status now" action. Each press runs the gated status helper once, with the plugin root taken from the flag of option 2.
   - Pros: each codec read is a human request, which the declaration already covers. The current status is available when somebody asks for it.
   - Cons: it combines the costs of both: the new flag, a second code path in the server, and an action the page needs a POST route for, which it does not have today (`/api/dashboard` and `/api/state` are GET).

## Constraints

- No automatic hook reaches the codec, by import or subprocess, and none reads a control file.
- The monitor stays a verbatim copy under the workbench, started by the user. No hook starts it.
- Old rows, retired kinds and the gate strings (`gate_hit`, `gate_response` and their fixed values) render and keep their meaning. Nothing rewrites the log.
- The row shape is shared with the Prior host once the log is shared, so fusion proposes it and the Prior side confirms it. The request goes to `codec/fixtures/prior/REQUESTS.md` as item 32.
- No agent prompt changes in FJ03b. The model-written event rows of `agents/orchestrator.md` are FJ03d's.

## Recommendation

Option 1. It is the only option that answers a decidable question: "what was the last observed change of X, by which host, at which revision", taken from the codec's own answer at the moment of the write. It keeps the confirmed declaration as it stands. The current state of a package stays available through `bin/fusion-work-order`, which a person calls. If the Prior side wants a live status panel, option 3 can be added later without undoing anything in option 1.
