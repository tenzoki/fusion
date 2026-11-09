# Which value does a Claude-side writer put in a `prior_revision` field it cannot compute as Prior does?

---
**Domain:** data
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md` (`## Open for Planner`, the hashes item; `### C4`), `261108-2212-review-of-the-campaign-spec.md` (finding 5), `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`

---

## Question

`fusion.campaign/v1` requires `state.charter_hash` as a `prior_revision`, "hex SHA-256 over encoding/json output" of Go's marshalling of the charter (`codec/schemas/common.schema.json`, `$defs/prior_revision`), and types `state.revision`, `register.revision` and `formation.revision` the same way, nullable. `codec/contract/prior-mapping.json` names every field's Go name, and the struct order that fixes Go's output is in Prior's `modules/fusion/campaign/campaign.go`, which fusion's tree does not hold and which may move. A Claude-side writer therefore cannot produce the bytes Prior hashes, and the field is required and non-null. The first `open` of a campaign fails schema validation unless this is settled, so it is settled before the write side is built, and the choice is put to Prior as question 4 of request 80.

## Options

1. **Fusion computes every `prior_revision` it writes over its own canonical JSON** (keys sorted, no whitespace, UTF-8) of the aggregate with its own `revision` member set to null, labelled `prior-json-sha256:` as the pattern requires, and states to Prior that the value is fusion-verifiable and Prior-unverifiable until Prior publishes the canonical bytes or accepts the rule.
   - Pros: every field validates today; the value changes when the content changes, so a read-confirmation row naming it says which content the session read; one rule for `charter_hash`, `state.revision` and the proposed `lanes[].revision`.
   - Cons: a value Prior cannot verify under a label that promises Go's bytes; if Prior later verifies, every Claude-written campaign is invalid under Prior's check.
2. **Null wherever the schema admits it, and a question for `charter_hash`,** which does not. `state.revision` null means a read-confirmation row names no revision and the overview cannot tell an unread revision from a read one.
   - Pros: nothing is claimed that is not true.
   - Cons: `charter_hash` still needs a value, so the question is not avoided; the read confirmation loses its content.
3. **Reproduce Go's marshalling from the mapping**, with the struct order copied into fusion.
   - Pros: Prior-verifiable if the copy is exact.
   - Cons: a second implementation of a Prior encoding, keyed on a struct order fusion does not own and cannot check; a Go field added at Prior silently breaks every hash.

## Constraints

- The field is required and must match the pattern, so the writer produces some value in every option.
- `codec/schemas/common.schema.json`'s `extensions` rule forbids carrying the real revision in an extension.
- The spec reserves at most two further questions to Prior; this is one of them.

## Recommendation

Option 1, as the interim rule, with Prior asked which of the three it wants. `charter.revision` (an opaque label) is `prior-opaque:r<n>`, `n` incremented at every amendment; `baseline_hash`, `register`, `formation` and `completion_evidence` stay null, the last until `end`. The plan's step 16 implements the rule in one function, so Prior's answer changes one place.

Answered: `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md` `## Rulings on the planner's decisions` — option 1, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>, 2026-11-09.
