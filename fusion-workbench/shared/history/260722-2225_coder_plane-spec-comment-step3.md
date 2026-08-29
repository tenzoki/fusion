# Coder — Plane spec-comment, Step 3 (vitest coverage + fixtures)

**Status:** Complete
**Date:** 2026-07-22
**Plan:** `260722-2021_*_plan-plane-spec-comment.md` (Step 3)
**Files touched:**
- `hooks/lib/__tests__/fusion-plane.test.ts` (new describe block appended)
- `hooks/lib/__tests__/fixtures/plane/comments-with-marker.json` (new)
- `hooks/lib/__tests__/fixtures/plane/comments-other-key.json` (new)

`bin/fusion-plane` NOT touched (per task); Steps 4–5 NOT implemented (per task).

## What was implemented

New section `describe("fusion-plane push --plan: spec-comment", …)`, 6 tests, reusing the
existing harness verbatim: `freshWorkbench()` copy-and-mutate, `run()` via `execFileSync`,
`plan()` reading `{"ops":[…]}` off stdout, and the Step-1 `--comments-fixture` seam. The gate
is enabled by APPENDING `spec_comment: true` to the FRESH COPY's `plane.config.yaml` (never
the committed fixture) — the same discipline the map tests use to drop in `.plane-map.json`.
A dedicated `specCommentOp()` finder selects the `op==="spec-comment"` entry (the create/update
op carries the same `natural_key` and is emitted first, so `opFor` would return that one).

1. **Marker + body shape** [C5-1, C5-3, C2] — gate on, no fixture → a spec-comment op exists
   for the Circle; `comment_html` is a string starting exactly
   `<!-- fusion-spec-comment:260719-1536-demo-circle -->\n<pre>` and ending `</pre>`.
2. **HTML escaping** [C3, C5-3] — overwrite the Circle's `_t_circle.md` in the fresh copy with
   `A --> B`, `<tag>`, `a && b`; assert `&amp; &lt; &gt;` present, no raw `<tag>`, no
   double-escaped `&amp;amp;`.
3. **PATCH branch** [C5-2] — `--comments-fixture comments-with-marker.json` → `method:"PATCH"`,
   `comment_id:"comment-uuid-1"`.
4. **POST branch** [C2-3, C5-2] — `--comments-fixture comments-other-key.json` (a different
   Circle's marker) → `method:"POST"`, no `comment_id`.
5. **No-regression** [C1-1, C1-2, C5-4] — gate absent → no spec-comment op; `push --all --plan`
   still yields exactly 8 ops (baseline confirmed against the existing mapping suite).
6. **C4 gate-on + unreachable host** [C4-1, C4-4] — INCLUDED. Reuses the pre-existing offline C4
   pattern (committed fixture `base_url` at the RFC-6761 `.test` TLD): enable the gate, live
   `push --all` → still exit 10, state deferred first, comment never attempted. No new
   network-dependent harness invented.

## Deviation from the plan's literal fixture shape (verified, deliberate)

The plan Step 3 (lines 197–199) specifies the comments fixtures as a **bare array**
`[{"id":…,"comment_html":…}]`. I used the `{"results":[…]}` **envelope** shape instead, for a
verified reason:

- `comment_id_for_marker` runs `(.results // .) | …`. In jq-1.8.1 (this environment),
  `.results` applied to a bare array raises `Cannot index array with string "results"`, and
  jq's `//` does NOT catch that error — so a bare-array fixture makes the jq exit 5, `cid` comes
  back empty, and the branch silently falls to POST.
- Consequence: with a bare-array fixture the PATCH test fails, AND the POST test would pass for
  the WRONG reason (a jq error, not a genuine no-match) — making test 4 meaningless.
- The spec (§Data Structures / C2) explicitly allows "bare array or `{results:[…]}`", and a real
  captured `GET issues/<id>/comments/` response IS the envelope (Plane list endpoints paginate).
  The envelope is therefore both faithful to the wire and the only shape that actually exercises
  the match logic here. Fixture ids are non-UUID-shaped (`comment-uuid-1`) per the plan's lint
  constraint.

## Latent finding (NOT fixed — out of scope; reported for the record)

The bare-array half of `comment_id_for_marker`'s documented "handles both a bare array and a
`{results:[…]}` envelope" claim is broken in jq-1.8.1 — `(.results // .)` errors on a bare array
rather than falling through. The SAME pattern ships in `state_uuid` (`:271`) and `label_uuid`
(`:323`); all three are only ever fed envelopes in production (Plane paginates every list
endpoint), so the defect is latent and pre-existing, not introduced by this feature. If bare-array
robustness is ever wanted, the fix is a guard like `(if type=="array" then . else .results end)`
or `(.results? // .)` in all three helpers. Left to the orchestrator's discretion — I did not
touch `bin/fusion-plane` (task constraint) and did not file a blocking issue since production is
unaffected.

## Verification

- `npm test` (in `hooks/`) → **315 passed / 12 files** (309 baseline + 6 new). All green.
- Lint guards confirmed green: `path-literal-lint` and `marker-format-lint` (both scan only
  `agents/*.md` + `skills/*/SKILL.md` — my JSON fixtures + `.test.ts` are outside their scope),
  and the in-suite fusion-plane UUID guard (scans `bin/fusion-plane` only; fixture ids are
  non-UUID-shaped regardless).

Not committed (orchestrator commits).
