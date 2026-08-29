rebuild_map reads .description while push writes description_html — map rebuild may silently find nothing

---
`bin/fusion-plane` embeds the natural key into the issue body on push via the `description_html` field (`build_write_body`). But `rebuild_map` reads it back out of the plain `.description` field (`bin/fusion-plane:684`: `( ($i.description // "") | capture("fusion-key: (?<k>[^\n<]+)").k // empty )`). On a Plane instance that does not derive `description` from `description_html`, the board looks perfectly correct while `push --rebuild-map` finds no keys and rebuilds nothing — a silent failure of the map-loss recovery path.

---
Note the seed path already handles both shapes (`bin/fusion-plane:1038` reads `.description_stripped // .description_html`), which makes the `rebuild_map` single-field read look like an oversight rather than a deliberate choice.

**Confidence:** `inference:` — this is read from the code, not reproduced against a live instance. Whether a given Plane build populates `.description` from `.description_html` is exactly what is unverified. It is the same class of silent failure as the open live-verification issue, one layer narrower.

Suggested fix: make `rebuild_map` read the same fallback chain the seed path uses (`.description_stripped // .description_html // .description`), so it works regardless of which field the instance populates. Cheap and removes the dependency on the answer.

Cross-references: `260719-2304_*_verify-plane-create-patch-body-against-live-instance.md` (the broader live-body verification — check both together at the first real push); `260719-1536-plane-mirror-integration`. Surfaced 2026-07-20 while making `docs/plane-setup.md` concrete.

---
Resolved: `05bb3b8` — `rebuild_map` now reads the key from `description_stripped` / `description_html` / `description` with a string type guard. The guard turned out to be load-bearing beyond the filed diagnosis: some builds return `description` as a ProseMirror object, where jq's `capture` errored and collapsed the entire rebuild, losing every key rather than one. This removes the dependency on which field an instance populates rather than answering it (that stays with issue 260719-2304_*_verify-plane-create-patch-body-against-live-instance.md). Fixture seam `--rebuild-map --fixture` added; tests cover all three fields plus the object case.
