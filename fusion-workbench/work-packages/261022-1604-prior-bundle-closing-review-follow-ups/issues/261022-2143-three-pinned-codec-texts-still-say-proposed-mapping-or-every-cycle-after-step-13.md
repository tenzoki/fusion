Three pinned codec texts still say "proposed" mapping or "every cycle" after step 13
---
Step 13 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md` brought the codec's contract and schema texts in line with the code, but three strings in pinned files still claim something the code or the table does not do. All three are bytes Prior pins, so the fix rides the next codec revision put to Prior (the re-pin request that follows request 74), never a revision of its own.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261022-2142-reviewer-closing-review-of-the-prior-bundle-follow-ups.md`, `261014-0830-the-prior-importers-accept-input-their-schemas-refuse-and-check-no-revision-hash.md`, `261019-0913-may-a-codec-revision-after-13-1-0-be-tagged-before-prior-re-qualifies-its-bundle.md`

## Defects

1. **`codec/contract/dependencies.json`, `notes[2]`** (written by `e2312078`): "reconcile reports every cycle through a package in its scope". `cyclesOf` in `codec/src/cli/ops.ts` reports, for each package id in sorted order that no reported cycle covers yet, the first cycle through it in edge order; its own doc comment says "So every package that lies on a cycle lies on a reported one". That is not every cycle. Counter-example: edges A->B, B->C, C->A, A->C. `cycleThrough(A)` returns A->B->C->A and covers all three ids, so A->C->A is never reported. Request 74 quoted the sentence and Prior accepted it (`codec/fixtures/prior/REQUESTS.md` `#### 74(a) The codec delta: **accepted**`), so the overclaim now stands in an accepted text.
2. **`codec/schemas/campaign.schema.json`, `$defs` formation package `description`** (line 346 at `59992f23`): "the fusion package status it may correspond to is a proposal in codec/contract/prior-mapping.json". Step 13 dropped "unconfirmed" from the root description because every `state_mapping` row is `confirmed: true`; this `$defs` string kept the old wording.
3. **`codec/contract/prior-mapping.json`, `state_mapping.description`**: "Proposed correspondence of packages.Package.State to a fusion.package/v1 status". Every one of its rows is `confirmed: true` (`jq '[.state_mapping.rows[].confirmed]|all'` prints `true`), and `codec/src/prior/packages.ts`'s header, rewritten by `695e1f84`, now calls it confirmed.

## Fix direction

Data-implementer. (1) Say what `cyclesOf` does: reconcile reports a cycle through every package in its scope that lies on one, not every cycle. (2) and (3) Drop "proposal"/"Proposed": the mapping is confirmed and applied by no importer, as the root description already says. Descriptions and notes only. Land it with the next codec revision put to Prior, and name the three strings in that request's delta.

## Acceptance

- `grep -n 'every cycle' codec/contract/dependencies.json` prints nothing; `grep -n -i 'proposal\|proposed' codec/schemas/campaign.schema.json codec/contract/prior-mapping.json` prints nothing.
- `jq -S 'del(.. | .description?, .notes?)'` over each changed file at the base commit and after the change compares equal.
- `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` green; `git status --porcelain -- codec/fixtures` empty apart from `prior/REQUESTS.md`.
