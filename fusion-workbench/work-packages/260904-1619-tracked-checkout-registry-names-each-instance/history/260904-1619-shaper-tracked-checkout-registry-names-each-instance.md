# Shaper session: the checkout registry becomes an anticipated Circle

**Date:** 2026-09-04 16:19
**Agent:** shaper (anticipated-circle mode, dispatched by `/fusion:direct`)
**Status:** Complete
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>

## What was dispatched

A draft Directive in prose, not a backlog entry, so no backlog entry was promoted and none was touched. The draft proposed a tracked checkout registry as an attribute table over the two identity keys fusion already has, cited the analysis `260904-1058-identity-per-instance-and-the-checkout-registry.md` and its two answered decisions, named the two decisions that stay open, and put the `/fusion:cadence` per-person grouping out of scope. Domain `code`.

## What was clarified

One round of four questions, answered by the user in compact form.

- **Who resolves the hex to the alias in this Circle.** Answer `F1b`: additionally the monitor header and a `FUSION_ALIAS` export at SessionStart. The monitor's own filter stays on the local file; the addition is display only.
- **How two git identities merge into one person.** Answer `F2b`: Setup offers the person names already standing in the registry, and typing a new one stays possible.
- **What a second `/fusion:setup` does in the same checkout.** Answer `F3c`: refresh a changed git identity silently, leave person and alias standing, and report an alias collision with a rename offered rather than enforced. Detect, do not enforce.
- **Whether the two adjacent defects come in.** Answer `F4b`: only the `git clean` defect, because it orphans exactly what this Circle creates. The `$USER`-keyed filename defect stays an open shared issue and is uncited as in-scope.

Two defaults were proposed in the same round and stood unchallenged: the store is `shared/checkouts/`, sibling of the memo store, and the two open decisions are worded in the Directive so they stay open and are answered inside the Circle rather than pre-empted by it.

## What was written

The anticipated Circle `260904-1619-tracked-checkout-registry-names-each-instance`, its record `_a_circle.md`, and the six artifact subdirectories. The record carries the refined Directive, a Grounding snapshot citing the analysis, the two answered decisions, the two open ones, the defect in scope and the two left out, and a Dependencies section citing the three terminal Circles that bind this one. `## Turn log` is empty and there is no closure note, both correct for an `_a_` record.

No spec was written, no Circle was activated, `.active-circle` was not touched, and no existing Circle was modified.

## Verification

- Every record citation in the new record resolves to exactly one file under the workbench, checked with `find "$WORKBENCH" -name '<basename>'` over all ten cited basenames.
- `bin/fusion-prose-metric` reports 0 em-dashes over 1244 prose words in the record, against a ceiling of one per 1000.
- `bin/fusion-paths shaper 260904-1619-tracked-checkout-registry-names-each-instance` was the one permitted second resolution, run immediately after the directory was created, and every write of this run landed through its keys.

## Next step

Activation is the user's separate act, through `/fusion:next`.
