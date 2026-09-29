# Which response size does the Claude-side client accept from the codec, and which environment does the child process get?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

FJ03a step 2 landed `hooks/lib/record-client.ts`. The plan left two properties of the client open, and the executor set both:

- An answer above 16 MiB is `unanswered` (`MAX_RESPONSE_BYTES`, passed as `maxBuffer`). The executor reports that Prior's adapter bounds an answer at 1 MiB; the orchestrator did not read that figure in the Prior checkout.
- The child process gets an empty environment (`env: {}`).

Both hold at the step's commit and both are tested as they stand. The choice is whether the two hosts should agree on the bound, and whether an empty environment is the intended contract. It is wanted before FJ03c, whose write client reuses this module, and it is a candidate for a request to the Prior side in `codec/fixtures/prior/REQUESTS.md`.

## Options

1. **Keep both as they are, and state them to the Prior side.** 16 MiB and an empty environment, named in the FJ03a hand-over.
   - Pros: nothing changes; a `list` over a large workbench has room.
   - Cons: the two hosts differ in what they accept, so an answer one host reads the other may refuse.
2. **Take Prior's bound.** The client accepts what Prior's adapter accepts.
   - Pros: one bound on both hosts; a too-large answer fails the same way everywhere.
   - Cons: the figure has to be confirmed in the Prior checkout first, and a large `list` may then be refused on the Claude side too.
3. **Ask the Prior side to rule on both as part of the protocol contract.** The bound and the environment become statements of the contract, pinned by a fixture or a test on each side.
   - Pros: the contract says it, and neither host chooses alone.
   - Cons: one more request, and the answer is needed before FJ03c.

## Constraints

- The bundle does not move in FJ03a.
- A too-large or malformed answer is never read as an empty store or as no claim.
- The client sends one request and reads one response; it does not retry.
