   - `$WORKBENCH/.commit-lock/`, `$WORKBENCH/.session-marker`, `$WORKBENCH/.fusion-setup`, `$WORKBENCH/.checkout-id`, `$WORKBENCH/.cadence-anchors`, `$WORKBENCH/.check-stamps`, `$WORKBENCH/.asset-provenance`
   - `$WORKBENCH/monitor`, `$WORKBENCH/stilwerk/`, `$WORKBENCH/stashes/`, `$WORKBENCH/.migration-v2-backup/`
   - `$WORKBENCH/workbench.json` and `$WORKBENCH/.json-state/`, on either format and never at `refine`: moving either takes the workbench out of JSON control.
   - Anything already under the archive store.

2. **Live and deferred records — never archive in tier modes:**
   - Every record whose `status` is outside its kind's terminal set: an `open` or `in_progress` issue or plan, a work package `open`, `claimed` or `paused` (a `claimed` item is somebody's in-flight job, a `paused` one is set aside and expected back), an `open` or `answered` decision (archiving an answer not yet realised breaks decision↔implementation traceability).
   - `deferred` records — *deferred ≠ done*; the user may want to revisit. Terminal, but excluded by default.
