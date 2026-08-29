# `push --fixture <f>` without `--rebuild-map` never reads the fixture and says nothing

---

**Severity:** Low
**Domain:** code
**Filed by:** orchestrator, from an adjacent finding reported by the executor of task T1 (session `260810-0844-orchestrator-session.md`, Turn 1)
**Affects:** `bin/fusion-plane` — `cmd_push` flag handling
**Cross-references:** commit `4bf509e`; `260810-0747_*_push-plan-rebuild-map-without-a-fixture-drops-the-flag-silently.md` (the same silence, from the other side)

---

## The defect

`--fixture <f>` is only ever consumed by the rebuild path. A caller who passes it without
`--rebuild-map` gets a run that ignores the file entirely, exits 0, and prints nothing about
the flag on either stream.

This is the same silent-no-op family as `260810-0747_*_push-plan-rebuild-map-without-a-fixture-drops-the-flag-silently.md`, which `4bf509e` just closed: the user
named an input, the input was not used, and nothing said so. The file's own rule is stated in
`map_forget` (around `:1504`) — an absent mutation is a reported failure, never a silent no-op.

## Why it was not folded into `4bf509e`

The T1 executor left it deliberately and said why, and the reasoning holds: `FUSION_PLANE_ISSUES_FIXTURE`
is the env twin of this flag and is picked up unconditionally, so a blanket refusal would break
every push issued from a shell that exports the seam for other purposes. The refusal that was
right for `--rebuild-map` under `--plan` is not obviously right here, which makes this a separate
decision rather than a widening of that one.

## What needs deciding before it is fixed

Whether an unused `--fixture` should be a usage error, a warning on stderr, or left alone as a
harmless no-op on a documented test seam. The env twin is the complication: whatever is decided
has to say what happens when the fixture arrives from the environment rather than the command
line, since that is the spelling a user does not see in their own command.

## Severity note

Low because `--fixture` is documented in the file header as a test seam and no operator
documentation tells a user to reach for it. The cost is one more spelling where the file
contradicts its own stated rule about silent no-ops, in a file that has now had two of those
closed in one night.

---
Resolved: moot, not fixed. `bin/fusion-plane` was deleted in `d0ddabb` (Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`, step 2), so `cmd_push` and its flag handling no longer exist. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913: `bin/` holds eleven helpers and none is `fusion-plane`. Closed because the subject left the tree, not because the flag handling was repaired.
