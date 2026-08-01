No `map --forget`: deleting an issue in Plane leaves a stale .plane-map.json entry that 404s the next push

---
`bin/fusion-plane` has no way to drop a single entry from `.plane-map.json` (verified: no `forget` subcommand). If a user deletes a mirrored issue in the Plane UI — which is exactly what the documented throwaway-Circle smoke test tells them to do at cleanup — the map keeps the dead UUID. The next `push` for that Circle finds the natural key present, PATCHes the deleted UUID, takes a 404, and defers the transition into `.plane-outbox.jsonl`. It is not silent (C4 holds), but it is a recurring, self-inflicted deferral with no clean way out short of hand-editing the JSON.

---
Impact is small but hits precisely the first-run path a new user follows, so it lands on the worst possible audience: someone evaluating whether the bridge works.

Suggested fix: add `map --forget <natural-key>` (and possibly `map --prune`, dropping entries whose Plane issue 404s on a HEAD/GET). The `map` subcommand already loads and dumps the file, so this is a small addition at an existing call site.

Interim workaround (documented in `docs/plane-setup.md` `## First run` cleanup step): prune the map entry by hand after deleting test issues in Plane.

Cross-references: `circles/260719-1536-plane-mirror-integration/planning/260719-2223_c_plan-plane-bounded-bridge.md` (Data Structures — the map); `docs/plane-setup.md` `## First run`. Surfaced 2026-07-20 while making the first-run procedure concrete.

---
Resolved: `05bb3b8` — `map --forget <natural-key>` removes one entry (exit 1 when the key is absent: a mutation that did not happen is a failed request, not a truthful query). `map --prune` added too: only a definitive HTTP 404 deletes; transport failure, 5xx, 429 and absent key all keep the entry and defer (C4). `docs/plane-setup.md` first-run cleanup now gives the real command instead of the hand-edit workaround.
