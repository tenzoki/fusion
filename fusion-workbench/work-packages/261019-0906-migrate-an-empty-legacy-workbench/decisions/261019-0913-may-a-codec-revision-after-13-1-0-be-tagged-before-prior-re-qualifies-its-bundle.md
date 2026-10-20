# May a codec revision after 13.1.0 be tagged before Prior re-qualifies its bundle?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261019-0913-plan-migrate-an-empty-legacy-workbench.md, 261019-0913-how-does-the-shared-migration-contract-shape-a-run-that-converts-no-pair.md, 261009-1021-who-accepts-fj05-and-may-13-0-0-ship-on-fusions-evidence-alone.md

---

## Question

No byte of `codec/dist/fusion-record.js` has moved since Prior qualified `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f` under request 64 (`git log v13.1.0..HEAD -- codec/dist codec/src codec/schemas` is empty at `836046ad`). The fix for a record-less legacy workbench moves the bundle, two schema bounds and the recorded migration session. For 13.0.0 the user ruled that Prior's codec qualification precedes the release (`261009-1021-who-accepts-fj05-and-may-13-0-0-ship-on-fusions-evidence-alone.md`, whose question cites the ruling of 2026-10-09). That ruling was taken for the takeover revision. This plan needs to know whether its tag waits for Prior too, and the answer binds every later codec revision.

## Options

1. **The tag waits for Prior's conformance run.** The hand-over asks Prior to re-snapshot the fixtures and re-pin the bundle; the release act waits until Prior's answer is recorded in `codec/fixtures/prior/REQUESTS.md` as complete.
   - Pros: the rule 13.0.0 shipped under, unchanged; no released bundle is one Prior has not run.
   - Cons: the user's Prior repository stays without a released route to JSON control until Prior answers; the user can still run the fix from this checkout (`<checkout>/bin/fusion-migrate`).
2. **The tag waits for Prior's acceptance of the contract delta only.** Prior answers whether a record-less migration as one chunk with no write meets the contract; the conformance re-pin follows after the tag.
   - Pros: the shape, which is the shared decision, is settled before release; the mechanical re-pin does not hold the fix back. Prior pins the bundle by exact digest, so an unqualified bundle never reaches Prior's runtime.
   - Cons: a re-pin finding after the tag is answered by a further patch release, not by changing the tagged bytes.
3. **Fusion's evidence alone.** The tag follows fusion's green suites; Prior is informed by the hand-over.
   - Pros: the shortest path.
   - Cons: departs from the rule 13.0.0 shipped under for a change to the shared contract.

## Constraints

- Prior's repository is read-only for fusion; Prior's answers reach fusion through the user and are recorded in `codec/fixtures/prior/REQUESTS.md`.
- Fusion runs under Claude Code with no Prior installation; no option makes Prior a runtime dependency.

## Recommendation

Option 2. The new behaviour is a widening the contract has to name, and that is Prior's to accept; the re-pin is a replay of exchanges fusion has already recorded. The plan's `## Where this work stops` carries whichever option the user picks as the precondition of the tag.

---
Answered: 261019-0913-plan-migrate-an-empty-legacy-workbench.md `## Open Questions` — option 2, the tag waits only for Prior accepting the shape (request 71); re-pinning may follow the tag; ruled by user, Kai Stalmann <ks@qantr.com>

Implemented: tag `v13.2.0` on fusion `main`, after Prior accepted request 71 (`codec/fixtures/prior/REQUESTS.md`, the hand-over for requests 72 and 73); re-pinning follows under 72 and 73.
