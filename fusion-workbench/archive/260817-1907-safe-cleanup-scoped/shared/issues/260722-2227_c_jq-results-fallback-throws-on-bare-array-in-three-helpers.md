jq `(.results // .)` envelope fallback throws on a bare-array input in three fusion-plane helpers

---
The `(.results // .)` pattern used to accept "either a bare JSON array or a
`{results:[…]}` envelope" does not actually handle the bare-array case in jq 1.8.1.
`.results` on an array raises `Cannot index array with string "results"`, and jq's
`//` alternative operator does NOT catch that error — so a bare-array input aborts the
filter instead of falling through to `.`.

Three helpers carry the pattern:
- `comment_id_for_marker` — `bin/fusion-plane` (added in this Circle's Step 1, commit 4d95a91)
- `state_uuid` — `bin/fusion-plane:271`
- `label_uuid` — `bin/fusion-plane:323`

All three document themselves as handling both shapes; that claim is false for the
bare-array half under jq 1.8.1.

---
**Severity: latent / low.** In production all three only ever receive the paginated
`{results:[…]}` envelope from Plane's REST API, so the broken branch is never hit. The
defect surfaced only while writing offline tests (Circle plane-spec-comment, Step 3):
a bare-array fixture makes the PATCH-match test fail and makes the POST/no-match test
pass for the wrong reason (a jq error, not a genuine no-match). The Step-3 fixtures were
therefore written as envelopes, which is also what the real wire returns.

**Recommended fix (one integral change, all three helpers):** replace `(.results // .)`
with `(.results? // .)` — the `?` suppresses the index error so the fallback to `.`
works — or add an explicit `if type=="object" then .results else . end` guard. Apply to
all three helpers together, since they share the exact pattern (HYG-SOT / one integral
fix, not a per-site patch).

**Not fixed in this Circle** deliberately: `state_uuid`/`label_uuid` are outside the
spec-comment feature's scope, production is unaffected, and folding two unrelated helper
edits into this feature branch would widen its blast radius for no functional gain. Filed
for a separate, focused pass. Verified against jq 1.8.1 by the Step-3 implementer.

---
Reconciliation 260723-0710 (reconciler, domain: code): confirmed STILL OPEN. This is a
pre-existing latent defect in the `(.results // .)` envelope pattern across three helpers
(`comment_id_for_marker` 4d95a91, `state_uuid`, `label_uuid`) — not introduced by and not
resolved by the spec-comment feature. Production only ever receives the `{results:[…]}`
envelope, so the broken bare-array branch is unreached; the Step-3 fixtures were written as
envelopes to sidestep it. coderev verdict for the session was clean (0 new issues). Marker
stays `_o_`; the recommended one-line `(.results? // .)` fix across all three helpers is a
separate focused pass, correctly out of scope for this Circle.

---
Resolved 260723 (coder): replaced `(.results // .)` with `(.results? // .)` at ALL
SEVEN sites carrying the envelope-or-bare-array intent in `bin/fusion-plane` — not just
the three helpers named above. Sites: `state_uuid` (271), `label_uuid` (323), the
label-cache fold (377), `comment_id_for_marker` (431), `JQ_REBUILD_MAP` (977), doctor
states count (1314), seed sequence lookup (1466). Every site was intent-checked: all
share the exact envelope-or-bare-array semantics and `?` is strictly more robust while
behaving identically on an envelope (and on `{results:null}` / `{results:[]}`). Note the
fold at 377 OUTPUTS a bare array, so a later `label_uuid` in the same run could actually
receive a bare array once a label is created — the defect was reachable there, not purely
latent. Verified on jq 1.8.1: bare array `[{"id":"x"}]` and envelope
`{"results":[{"id":"x"}]}` both return the inner array with the new pattern; the old
pattern errors `Cannot index array with string "results"` on the bare array. Added a
regression test — `comments-with-marker-bare-array.json` fixture + a PATCH-on-bare-array
case in the spec-comment suite (the existing `--comments-fixture` seam) — which fails
(POST, no id) against the old pattern and passes with the fix. Full hooks suite: 316
passed (was 315). Commit pending (orchestrator commits).
