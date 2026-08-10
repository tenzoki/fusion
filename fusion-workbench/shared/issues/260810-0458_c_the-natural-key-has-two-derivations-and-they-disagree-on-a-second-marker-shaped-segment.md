# The natural key has two derivations that disagree, and the disagreement reinstates the defect `f320db2` closed

---

**Severity:** Medium — latent today, permanent once reached
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `bin/fusion-plane:574` (`stable_basename`), `:602` (`JQ_STABLE_KEY`), `:570-572` (the idempotence comment)
**Cross-references:** commit `f320db2`; `hooks/lib/__tests__/fusion-plane.test.ts:933-940`

---

## The defect

`f320db2` made the natural key marker-free, and on the **file** side it did the job: all six
composition sites now call `natural_key` (`bin/fusion-plane:1034, 1039, 1054, 1059, 1266, 1269`).
But the **map** side normalises independently, with a second regex:

```bash
# :574 — file side, anchored at the start of the basename
stable_basename() { printf '%s' "$1" | sed -E 's/^([0-9]{6}-[0-9]{4})_[a-z]_/\1_/'; }

# :602 — map side, anchored after `::issues/` or `::decisions/`
JQ_STABLE_KEY='def stable_key: sub("(?<p>::(issues|decisions)/[0-9]{6}-[0-9]{4})_[a-z]_"; .p + "_");'
```

Both strip exactly one marker, but they are applied at different times to different inputs. The sed
runs once, on the raw on-disk basename. The jq runs once **per invocation**, over whatever the map
already holds — including keys the sed produced.

For a filename of the shape `<stamp>_<marker>_<letter>_<rest>.md` the two answers diverge and stay
diverged:

| Input | file side (`stable_basename`) | map side, applied to that output |
|---|---|---|
| `260719-1600_o_a_b-thing.md` | `260719-1600_a_b-thing.md` | `260719-1600_b-thing.md` |

The lookup key and the stored key never meet, `map_get_id` (`:650`) misses, `process_artifact` (`:807`)
routes to `op="create"`, and a new Plane issue is minted on **every** push. That is the defect
`f320db2` exists to close, arriving through the migration rather than through the marker.

## Verification

Read from source as quoted. A sub-analysis reproduced it against a scratch fixture: three consecutive
runs against `260719-1600_o_a_b-thing.md` each planned `op=create`.

Reachability is checked, not assumed: all 348 issue and decision filenames in this workbench were
scanned and none carries a second `_<letter>_` segment. Kebab-case slugs carry no underscores, so the
convention holds today. Nothing enforces it.

## What else the divergence falsifies

`bin/fusion-plane:570-572` states: *"A name that carries no marker is returned unchanged, so the
transform is idempotent and safe to apply to an already-stable name."* The transform is not idempotent
— `260719-1600_a_b.md` → `260719-1600_b.md` — and the map side relies on repeated application.

## Fix direction

One derivation, not two. Either the migration becomes a one-shot keyed on a map-format version field
(so it cannot re-derive over its own output), or `stable_key` anchors the marker to exactly one
position so a second `_<letter>_` segment is inert. The version-field form is the stronger of the two,
because it also removes the reason a dry run has to touch the file at all
(`260810-0456_o_fusion-plane-dry-run-rewrites-the-map-and-can-destroy-a-mapping.md`).

Note for whoever takes it: `hooks/lib/__tests__/fusion-plane.test.ts:959-961` asserts the literal sed
spelling, so a correct fix fails that assertion for no behavioural reason. That assertion should be
replaced by a behavioural one at the same time.

---
Resolved: 205ae06 — MAP_KEY_FORMAT=2 stamped per entry at map_put, the single place the file is replaced. settled_key reads that field first and derives only for entries that predate it; both map-side callers go through it. map_migrate now branches on the recorded format rather than on "would folding change any bytes", which was a different question and left stable-but-unstamped maps unstamped forever.

Reproduced before the change (three consecutive push --plan runs planned create each time, and a later unrelated map write stranded the UUID) and after (update three times, same key, same UUID). The literal sed assertion this record warned about is replaced by a behavioural one, mutation-tested: the deleted assertion would have passed a double strip, which is the defect itself.

One residual documented in the commit: an entry written after the key went marker-free but before the stamp existed is indistinguishable from a legacy one and is folded once.

A third derivation site was found and filed separately, since closing it changes the wire format: shared/issues/260810-1158_o_a-third-derivation-site-reads-the-key-back-out-of-a-plane-issue-body-which-carries-no-format.md
