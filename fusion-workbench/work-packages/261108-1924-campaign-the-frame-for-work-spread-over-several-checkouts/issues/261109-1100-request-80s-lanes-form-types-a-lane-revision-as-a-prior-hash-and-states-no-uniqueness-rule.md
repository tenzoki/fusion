Request 80's `lanes` form types a lane revision as a Prior hash and states no uniqueness rule
---
The form of `lanes` that request 80 proposes for `fusion.campaign/v1` types `lanes[].revision` as `optional_prior_revision`, a label for a hash Prior computes, and Prior computes none for a lane. The form also states no rule for a package named twice, for two lanes with one `id` or for one checkout in two lanes, says nothing on `[]` beside null, and does not say that a lane's `checkout_id` is an assignment and no host lease. Prior names this as a defect in its answer to request 80, and the verdict on question 1 is therefore "corrected".
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Prior's answer to request 80, `Prior: docs/design/fusion-campaign-request80-prior-response.md` at Prior commit `557011a9b02e2ab87e2f7cf7d4574d9706f565d2`, `sha256:93388f418a3f72f88173c16162a0817b54acfddc0139bd8d6970c61f8314065d` (the orchestrator read it with `git show` from the commit and compared the digest), `### Question 1: lanes` and `## Defects in the proposed forms`. Prior's own record of the defect is `foreign:prior:261109-0730-request-80s-lanes-form-types-a-lane-revision-as-a-prior-hash-and-states-no-uniqueness-rule.md`. Prior's measurements, not repeated here: `git grep -i -c lane` over Prior's `modules/fusion` prints nothing; `members` is `uniqueItems` over `record_ref`, which admits an optional `revision` and `display`, so two references to one package that differ in `display` pass.

**The four corrections Prior rules, each text for `codec/schemas/campaign.schema.json`.**

- (a) `lanes[].revision` is typed neither `prior_revision` nor `optional_prior_revision`. Fusion types it as a value it computes itself (the contract's type for a hash over exact bytes is `sha256`), or drops the member.
- (b) The description states three rules JSON Schema cannot check: a package is named once in a lane and in one lane only, compared by `record_id`; a lane's `id` is distinct within the campaign; a non-null `checkout_id` stands in one lane only.
- (c) The description says what `[]` means beside null, and that a lane's `checkout_id` is an assignment and never a host lease.
- (d) The description says that `lanes` has no Prior aggregate and no row in `codec/contract/prior-mapping.json`.

**Acceptance.** Plan step 10 lands `lanes` in the answered form: required root key, null admitted, corrections (a) to (d) in the schema text, and a check outside the schema (the helper's or the codec's `validate`) for the three rules of (b), each with a fixture. What `lanes[].revision` is, or that it is dropped, is stated in the plan before step 10 is dispatched.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 9, 10, 15, 16), `codec/fixtures/prior/REQUESTS.md` (`## The campaign on the Claude side (request 80)`, question 1)
