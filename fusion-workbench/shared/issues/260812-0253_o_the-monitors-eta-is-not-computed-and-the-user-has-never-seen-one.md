The monitor's ETA is not computed, and the user has never seen one

---
Reported by the user on 260812. The session-scoped ETA is one of the monitor's advertised
features — it is named in the marketplace description and it is the reason
`rules/user-facing-output.md` forbids agents from emitting effort estimates at all ("the monitor's
session-scoped ETA already covers that need"). If it does not compute, that prohibition removes an
estimate and puts nothing in its place.

---
**Witness:** the user, directly. Not observed by any agent, which is itself worth noting: nothing
in the plugin checks that the ETA renders.
**Severity:** medium — a shipped feature that does not work, and a rule elsewhere that depends on it
**Affected:** `bin/monitor`

Not yet diagnosed. The cause is likely one of: the estimator has no input because the events it
keys on are not emitted (this session's own log froze for a whole Turn, three times); the UTC
timestamp parsing defect that `CLAUDE.md` documents for this exact file, where a stamp without `Z`
is read as local time and the arithmetic comes out wrong by the offset; or the panel is rendered
only under a condition that is never met. Establish which before changing anything — the three have
nothing in common.
