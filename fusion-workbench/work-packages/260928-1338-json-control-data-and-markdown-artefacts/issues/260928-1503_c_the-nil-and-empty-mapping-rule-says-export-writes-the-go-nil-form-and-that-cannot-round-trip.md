The `nil-and-empty-to-[]` rule in `codec/contract/prior-mapping.json` says "export writes the Go nil form", and that cannot round-trip Prior's actual output
---
Prior's own code writes empty non-nil collections (`Qualify` sets `Reasons: []string{}`; `Open` and `Form` create `{}` maps), so a nil form on export changes the bytes `json.Marshal` produced and with them the aggregate's revision. The implementation in `codec/src/prior/` therefore keeps the form each collection had, under `provenance.legacy_fields.empty_collections`, and restores exactly that on export; the row text still states the flattened rule. Evidence: `codec/src/prior/common.ts` (the value rules), `codec/src/__tests__/prior-mapping.test.ts` (both forms exercised in every fixture). Acceptance: the row's `null_vs_empty` text describes the carried form and names `empty_collections`, and the step-12 request asks the Prior side whether the distinction is wanted this way.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
Found at FJ00 step 9, 2026-09-28; the row belongs to `data-implementer`, the fix is one sentence in `prior-mapping.json`.
---
Resolved: contract/prior-mapping.json `conventions.null_vs_empty` — the nil-and-empty-to-[] entry now describes the empty_collections carry, as Prior's 3c ruled
