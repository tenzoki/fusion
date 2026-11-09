# Does `lanes` stay a required key when campaign records valid before it stop validating?

---
**Domain:** data
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 10 and 13), `261109-1100-request-80s-lanes-form-types-a-lane-revision-as-a-prior-hash-and-states-no-uniqueness-rule.md`, `codec/fixtures/prior/REQUESTS.md` (`### Prior's answer to 80 at 557011a`, question 1; Prior's answer to 62, part 7)

---

## Question

Plan step 10 makes `lanes` a required root key of `fusion.campaign/v1`, `null` admitted, as Prior's answer to question 1 of request 80 admits it. With that change in the working tree, one test outside the plan's list of expected failures is red. It holds a condition Prior set on request 62, part 7, quoted from the answer as recorded: "Also show ordinary old records still validate in the new bundle." Both statements were made to Prior, and with `lanes` required they do not hold together for a campaign record. Which gives way?

## Measured at `e5ab2ead`, with step 10's edits uncommitted

- **The red case.** `cd codec && npx vitest run src/__tests__/round-trip-cli-takeover.test.ts` exits 1: 58 of 59 cases pass, and "every record the manifest at 031645d2 expects valid validates in the schema set the new bundle inlines" fails at `valid/campaign/minimal.json` with `must have required property 'lanes'` (line 671). Run by the data-implementer and repeated by the orchestrator.
- **What the case reads.** The 86 valid entries of the manifest at `031645d2`, each fixture as it stood at that commit, against the source schemas (`installInlined`). It reads no bundle, so the bundle rebuild of plan step 13 does not clear it, and step 13's file list does not name the test.
- **How many records.** The manifest at `031645d2` lists four valid campaign fixtures. None carries `lanes`. The data-implementer measured outside the tree that all four are refused and the other 82 validate; the test stops at the first.
- **Why the plan did not list it.** Its `## Current State` measured the couplings in scratch copies without a repository, where this file fails for another cause.
- **What Prior said about this case.** In its answer to request 80, question 1, quoted: "The case of a campaign record stored before the schema lands is not ruled here." Prior's acceptance of the takeover addendum records "All 86 previously valid manifest cases still validate in the new schema set."
- **No campaign file exists on the Claude side.** `fusion-workbench/campaigns/` is absent and the writer is plan step 16. Whether Prior's side stores a `fusion.campaign/v1` file anywhere is not determined here.
- **Everything else in step 10 is as planned.** The other red cases are in the four files the plan names; `codec/dist/fusion-record.js` is unchanged at `sha256:bc0de764…`.

## Options

1. **`lanes` stays required; the old-records case is restated.** Step 13 changes the test so that the four campaign fixtures of `031645d2` are expected to be refused for exactly the missing `lanes` key and the other 82 are expected valid.
   - Cost: the sentence "all 86 still validate" stops being true and is replaced by a measured one, which a re-pin request carries to Prior. A campaign file stored before the change is schema-invalid until `"lanes": null` is added to it; nothing migrates one.
   - Keeps: Prior's answer to question 1 as given, and step 10's edits as they stand.
2. **`lanes` becomes optional, an absent key read as `null`.** The test stays as it is and green.
   - Cost: a deviation from the form Prior admitted ("a required root key with null admitted … as `register` and `formation` are"), to be stated to Prior. Step 10 is done again in part: the schema, `lanes-missing.json` (no longer invalid) and its manifest row; every reader of `lanes` in steps 13 to 17 treats absent as `null`.
   - Keeps: the condition of request 62, part 7, for all 86 records.
3. **Nothing lands until Prior rules on the case it left open.** The user relays the question; step 10's edits wait uncommitted, and steps 13, 14, 15, 16b, 17 and 19 wait with them.
   - Cost: the work stops for the length of one exchange with Prior.

## Constraints

- A change to a test that holds a condition Prior set is not an executor's to make on its own; the plan flags step 10 as requiring approval, and the approval was given for the step as the plan described it, without this consequence.
- Under options 1 and 2 the statement to Prior is the user's to relay; no agent gives it.

Answered: `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md` `## Ruling on campaign records valid before `lanes`` — option 1, `lanes` stays required and plan step 13 restates the old-records case for the four campaign records; ruled by user, Kai Stalmann <ks@qantr.com>, 2026-11-09.

Implemented: 15be5d20 — plan step 13 restates the old-records case in `codec/src/__tests__/round-trip-cli-takeover.test.ts` (82 valid, the four campaign records refused for the missing key `lanes` alone and valid with `"lanes": null`); `lanes` stays required since 26a9d6b2.
