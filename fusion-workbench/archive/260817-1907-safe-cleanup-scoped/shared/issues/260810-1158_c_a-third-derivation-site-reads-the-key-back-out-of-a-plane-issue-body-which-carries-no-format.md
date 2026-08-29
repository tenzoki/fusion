# A third derivation site reads the key back out of a Plane issue body, which carries no format

---

**Severity:** Low — same pathological filename shape as its parent, and the same reachability argument bounds it
**Domain:** code
**Filed by:** orchestrator, from a finding the T8 executor reported outside the files it was scoped to (session `260810-0844-orchestrator-session.md`, Turn 4)
**Affects:** `bin/fusion-plane` — `JQ_REBUILD_MAP`, where it applies `stable_key` to a key extracted from a Plane issue body
**Cross-references:** commit `205ae06` (which bound the other two derivations to a recorded map format); `260810-0458_*_the-natural-key-has-two-derivations-and-they-disagree-on-a-second-marker-shaped-segment.md` (the parent)

---

## The defect

`205ae06` closed the divergence between the file side and the map side by stamping
`key_format: 2` on every entry at `map_put` and having the map side derive only for entries
that predate the stamp. That works because the map is a file fusion owns and can stamp.

`JQ_REBUILD_MAP` has a third derivation site that the fix does not reach. A rebuild reconstructs
the map from the board, reading each key back out of the Plane issue **body** — and a body
carries no format field. So a pathological name whose issue was POSTed after the key went
marker-free is stripped again on rebuild, producing the same divergence the parent record
describes, arriving through the wire instead of through the map.

## Reachability, inherited from the parent

The trigger is a filename of the shape `<stamp>_<marker>_<letter>_<rest>.md`. All 348 issue and
decision filenames in this workbench were scanned when the parent was filed and none carries a
second `_<letter>_` segment; kebab-case slugs carry no underscores, so the convention holds and
nothing enforces it. This record inherits that bound exactly: latent today, permanent once
reached, and reached only through a name the convention does not produce.

## Why it was not fixed with its parent

Closing it needs a format marker in the issue body, which changes the **wire format** — what
fusion writes into a Plane issue and expects to read back. That is a larger decision than the
one the parent record settled, it affects issues already on real boards, and it was outside both
the parent record's scope and the file list that task was given. The executor said so rather
than widening, which is the right call.

## What needs deciding before it is fixed

Whether the issue body should carry a format marker at all, and if so what happens to issues
already on a board without one. The map's answer — treat an absent field as legacy and fold
once — is available here too, but it costs a different thing: on the map the fold is a local
rewrite, while on the wire it means a PATCH to every issue fusion has ever created, or an
indefinite legacy path.

An alternative worth weighing: the rebuild could take the key from the map for entries the map
already knows, and derive only for issues it has never seen. That keeps the wire format
unchanged and reduces the exposure to genuinely new issues, though it does not remove it.

---
Resolved: moot, not fixed. The third derivation site was `JQ_REBUILD_MAP` inside `bin/fusion-plane`, deleted in `d0ddabb`. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913.
