# Who accepts FJ05: may 13.0.0 ship on fusion's evidence alone, or does the release act wait for Prior's answer to it?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md, 261009-0650-prior-fusion-integration-status.md, 261009-0647-v13-functional-completeness-against-v12.md, 260930-2305_*_how-is-a-claim-held-by-a-checkout-that-no-longer-exists-released-under-response-22.md, 261004-2212_*_where-is-the-fj03d-windows-client-installed-from-which-ref-and-what-may-13-0-0-change-after-it.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

The FJ05 plan ends in the release act: `main` fast-forwarded to the release candidate, the tag `v13.0.0`, the push and the marketplace entry. Prior's specification (`concept/fusion-json-workbench-spec.md`, section 9) names FJ05's verifiable result but no accepting party. Section 1.9 asks for "Nachweise für beide Zugangswege". Prior's FJ03d response lists what "its release acceptance still needs" and adds that it "does not infer an approved plan or authorize publication". The package narrative defines its own end as FJ05's evidence existing. The plan must know, before it writes the FJ05 hand-over to Prior (step 18), whether that hand-over asks Prior for an acceptance that the release act then waits for (step 19), or only reports. The ruling of 2026-10-09 already makes one part of Prior's answer a gate: the takeover revision moves the codec bundle, and its conformance run (step 10) precedes the release. This record asks only about the rest of the FJ05 evidence: the review pass, the re-migrations, the observation run, the documentation check and the candidate's verification.

## Options

1. **Fusion's evidence alone.** The user accepts FJ05 on fusion's evidence. Prior is informed by the hand-over and after the release by the post-release report; no Prior answer gates the release act. Prior's codec qualification of the takeover bundle still gates it, by the 2026-10-09 ruling.
   - Pros: the shortest path; matches section 1.9's standalone clause and Prior's own statement that the module bundle is no prerequisite of the Claude Code release.
   - Cons: Prior frames the five items as "its release acceptance". Releasing before Prior has read them risks a later objection that only a 13.0.1 can answer, and section 8.1 forbids shipping 13.0.0 again with changed bytes.
2. **Joint acceptance.** The FJ05 hand-over (request 65) asks Prior to accept the evidence at the release candidate. The release act waits for a "yes" relayed by the user.
   - Pros: no reading of section 1.9 is left to one side; an objection arrives before the tag, while the bytes can still change under the same version.
   - Cons: one more round trip through the user; the release date depends on Prior's turnaround.
3. **Split by subject.** Prior gates what belongs to the shared contract: the codec qualification (already ruled) plus a statement that the hand-over's codec and migration evidence meets section 9's mandatory checks. Everything host-specific (review pass, observation run, Claude-side documentation, install) is accepted by the user alone.
   - Pros: each party accepts what it owns, which is the separation by repository the user set on 2026-09-28.
   - Cons: the line between shared and host-specific evidence has to be drawn in the hand-over, and Prior may draw it differently.

## Constraints

- Fusion runs under Claude Code with no Prior installation, binary, service or variable (spec section 1.9); no option may make Prior a runtime dependency.
- Prior's codec qualification of the takeover revision precedes the release under every option (user ruling, 2026-10-09).
- `~/.fusion` is never installed, updated or written by this work (decision 261004-2212, the user's words).
- Prior's repository is read-only for fusion; Prior's answer reaches fusion through the user and is recorded in `codec/fixtures/prior/REQUESTS.md`.

## Recommendation

Option 3. Prior already holds the contract and has qualified every codec revision so far, so its statement on the shared evidence is cheap to ask for and expensive to miss. The host-specific evidence is fusion's, and Prior has said it neither runs nor authorizes the Claude-side release. Under option 3 the plan's step 19 waits for Prior's answer on the shared part only.
