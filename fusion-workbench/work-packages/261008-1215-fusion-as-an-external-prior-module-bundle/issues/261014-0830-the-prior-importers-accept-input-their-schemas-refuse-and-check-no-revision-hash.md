The Prior importers accept input their schemas refuse and check no revision hash
---
The importers under `codec/src/prior/` (`importRegister`, `importPlan`, `importCampaignState`) map Prior's Go structs into codec blocks. Three things are wrong. They check fewer rules than the schemas the blocks must satisfy. They trust their TypeScript types at run time, so a missing or mistyped field raises a `TypeError` or the wrong refusal reason instead of a refusal with a Go path. And the hash identities the schemas say are checked (`charter_hash`, each revision, qualification `evidence_hash`) are computed by helpers that only tests call. None of the importers has a production caller today, so the defect is latent. It surfaces the day one is wired in.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- Verified by the reviewer: `grep -rn` over `codec/src` outside `__tests__` finds `importRegister` (`prior/candidates.ts:91`), `importPlan` (`prior/packages.ts:72`), `importCampaignState` (`prior/campaign.ts:62`), `computeCharterHash` (`prior/gojson.ts:435`) and `computeEvidenceHash` (`prior/gojson.ts:444`) only at their definitions. `prior/candidates.ts:215`: `policy_version: emptyToNull(d.PolicyVersion)` with no per-outcome rule.
- Reported by the delegated pass, not re-read by the reviewer:
  - `record.schema.json:245-287` (string or null `policy_version`/`snapshot_hash` by outcome; admitted requires an admission with a qualification) is unchecked in `splitDisposition` (`candidates.ts:206-234`).
  - `campaign.schema.json:369-372` (null `accepted_revision`/`failure_reason` for formed, admitting and admitted) is unchecked in `importPackage` (`packages.ts:167-190`).
  - `nonEmpty`/`emptyToNull` (`common.ts:143-152`) test only `=== ""`.
  - Stale "unconfirmed" text at `packages.ts:8-10` and `campaign.schema.json:5`.
  - `campaign.schema.json:5` says dependencies name candidates where the mapping uses package ids.

Fix direction: check each input against `GO_STRUCTS` before mapping; enforce the schema's conditional rules in the mappers, or run `validate()` on every produced block inside `guarded`; call the hash helpers on import and refuse on mismatch, or reword the two schema descriptions to say nothing checks them yet; correct the stale text.

Acceptance: importer tests where a candidate lacks `MergeInto`, has `Source: null`, or is `admitted` with no qualification each return a refusal naming the Go path, not an exception; an import with a wrong `charter_hash` is refused, or the descriptions no longer claim the check.
