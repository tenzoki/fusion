# Does the 13.4.2 candidate carry the v3 of the frozen entry assets, or does the v2 stay and the corrections stand as a reading in request 78?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md, 261105-1023-does-entry-v3-keep-or-drop-the-c-and-r-name-status-branch.md, 261027-2337-entry-v2-receipt-check-and-name-status-pattern-admit-dot-dot-path-segments.md, 261027-2337-entry-v2-workbench-step-reads-a-control-record-the-integration-deleted.md, 261028-0810-entry-v2-and-request-77-derive-the-operation-id-from-the-workflow-capability-where-the-module-uses-the-services.md

---

## Question

Request 77 says a correction to a frozen v2 asset is a v3 beside it, never an edit. Prior's response at `52a2703` says the v3 "can" take D-F2, D-F3, D-F4 and the readings S59-2, S60-1 and S60-3 in the same rebuild, and that its host already applies the corrected rules. Does a v3 belong in this candidate?

## What was measured

Read at Prior `52a2703`, every path Prior's:

- `internal/fusionhost/entry_catalog.go:19` fixes the asset as `workflows/entry.v2.json`, and `entryV2()` refuses a bundle without it or with another capability than `api.EntryWorkflowCapability`.
- `moduleapi/v1/entry_service_wire.go:15` fixes that capability as `fusion.entry.v2`.
- `internal/fusionhost/entry_policy.go:81` fixes the output schema as `schemas/entry-result.v2.json`, and `resolveEntryV2` (`entry_catalog.go:113` onward) refuses every entry whose profile names another schema.
- `checkFrozenCatalog` (`entry_catalog.go:190`) only requires each `FROZEN` path to be installed with its bytes, so extra assets are not refused.

Read in fusion: nothing in `internal/entry` interprets the sentences that are wrong. `Load` reads slots and schema paths (`entry.go:157`, `:177`, `:180`); the operation id is derived per service in `hostsvc.go`; a host code reaches the envelope as `host.<code>` with `violations[].code` only `minLength: 1`.

## Options

1. **No v3 file in this candidate.** The v2 bytes and `FROZEN` stay. The module binary takes D-F1 and the last-status rule, and receipts refuse dot segments. Request 78 carries a table of every reading as the contract's reading until a v3 exists, and asks Prior whether it accepts that. The v3 is written with the Prior host step that will bind it.
   - Pros: Prior's host runs the candidate as it stands. Nothing is frozen before the `C`/`R` ruling. The correction Prior asked for is not tied to a change Prior did not commit to.
   - Cons: the frozen v2 text stays wrong in five places (the plan's reading table) until the v3. Three issues keep their asset half open.
2. **A bound v3.** The module serves `fusion.entry.v3`, and the profiles name `entry-result.v3.json`.
   - Pros: text and behaviour agree at the tag.
   - Cons: every run is refused on Prior's host at `52a2703` at the three sites above, so D-F1 cannot be shown until Prior changes host code and its SDK constant. It also freezes a `C`/`R` choice before the ruling, or forces a default that a ruling then replaces with a v4.
3. **An unbound v3 carried beside the v2.** `entry.v3.json` and `entry-result.v3.json` in the payload and in `FROZEN`, read by nothing.
   - Pros: Prior's host accepts it. The corrected text exists under a hash.
   - Cons: the payload then holds two contract texts that disagree, and the binding one is the wrong one. It freezes the `C`/`R` choice as option 2 does. It is a file no decoder reads, which is a statement nothing checks.
4. **Module serves both capabilities.** v2 for today's host, v3 for a later one, over one code path.
   - Pros: Prior can move without another rebuild.
   - Cons: two capabilities meaning one thing, a load path and a test matrix for a difference that is only text. It freezes `C`/`R` as well.

## Constraints

No frozen byte is edited under its name. The tag waits for Prior's answer whichever option stands. Prior's "can" is an offer and not a condition: its verdict on question 12 says the host applies the rules "whatever the v2 bytes say".

## Recommendation

Option 1, and the plan proceeds on it as its default. If the user or Prior's answer to request 78 requires a v3 before the tag, that is a 13.4.3 candidate with Prior's host step named, and nothing in 13.4.2 has to be undone. Confidence: the three refusal sites are read, not run; that Prior's envelope check admits every `host.<code>` is inference.
