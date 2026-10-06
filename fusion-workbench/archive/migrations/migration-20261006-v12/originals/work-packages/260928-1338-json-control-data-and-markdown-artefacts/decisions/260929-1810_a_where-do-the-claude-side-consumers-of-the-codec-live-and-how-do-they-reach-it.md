# Where do the Claude-side consumers of the codec live, and how do they reach it?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md, 260928-1550_*_which-process-boundary-and-shipped-form-does-the-codec-take.md, 260929-1810_*_does-the-2026-09-27-ruling-on-the-growth-bound-reach-the-hook-tests-and-shipped-text-fj03-changes.md

---

## Question

FJ03 makes fusion's own helpers read control data from JSON. Through FJ02b the codec has one entry, the bundle `codec/dist/fusion-record.js`, which answers one request per process and which Prior pins by digest (`sha256:5f116c6436175a6b8e1cb08aa2625d2e2f68ef193657b00eb1891ea8d3b965bd` at fusion `7b8dde51`). The consumers FJ03a changes are `bin/fusion-claimed-package` (bash, two `grep` calls on the record's head), `bin/fusion-work-order` (`hooks/dist/order.js` over `hooks/lib/work-graph.ts`) and, through the first, `bin/fusion-paths` and `bin/fusion-rules`. The specification forbids a second parser and forbids reading JSON with `grep` and `sed` (section 6). Where the new reading code lives decides three things at once: whether the bundle's digest moves, how many processes one helper call costs, and which test suite grows. Measured at `b4c8f7ca`: one spawn of the bundle takes 171 ms (ten `inspect` calls in 1.71 s, Node 25.7.0); `list` returns path, kind, id, status and revision of every control file but neither a claim nor `depends_on`; the hook test surface has 6 lines of room.

## Options

1. **A protocol client under `hooks/lib/`, one spawn per request.** `hooks/lib/record-client.ts` spawns the bundle as Prior's adapter does; the consumers stay where they are and swap their reader.
   - Pros: the bundle stays the one entry to fusion JSON and its digest does not move, so Prior's pin stands; the Claude side reaches the codec exactly as the Prior side does; no new shipped artefact.
   - Cons: scope resolution costs `inspect`, `list` and one `show` per claimed package, about 0.5 s per call and two calls per agent Setup; the order costs three spawns; the tests are hook tests and need room the surface does not have.
2. **A second bundle in `codec/`, reading in process.** The consumers move to `codec/src/` and import the store and the kernel's read protocol directly; `codec/dist/` gains a second committed file.
   - Pros: one process per helper call; the tests join the codec suite, which no bound measures.
   - Cons: Claude-host logic (checkout scope, the order report) enters the package both hosts pin and Prior snapshots; the in-process read functions become a second contract beside the protocol; a second bundle of the size of the first is committed; the move reads as a way around the hook-test bound, which the decision that created `codec/` said it was not.
3. **New read operations in the one bundle.** `list` gains control detail, or the protocol gains operations shaped for scope and order.
   - Pros: one spawn per helper call; dependency evaluation stays in the codec.
   - Cons: the digest moves and Prior re-pins; host semantics enter the shared protocol; section 6's operation table is closed at fourteen, so each addition is Prior's to rule.

## Constraints

- One implementation of the reader and the transition rules; no bash parsing of JSON (section 6).
- Every consumer decides the workbench's state before it reads anything: `list` on a legacy workbench answers an empty list and names no state (issue `260929-1810_*_list-answers-a-legacy-workbench-with-an-empty-list-and-names-no-state.md`).
- Dependency edges are evaluated by `dependencySatisfied` in the codec and nowhere else; `reconcile` reports them.
- The installed copy resolves the bundle relative to the helper, as `bin/fusion-record` does.

## Recommendation

Option 1. It keeps the boundary the two answered codec decisions drew: the codec is the shared contract, a host reaches it through the protocol, and nothing host-specific enters it. The cost is measured and bounded, and an additive `list` detail stays available as a later request to Prior if the spawn count proves too high in use. The test room it needs is the subject of the growth-bound record cited above.

---
Answered: Prior `docs/design/fusion-fj03a-prior-plan-response.md` `## A. One protocol client, one process per request` at Prior `b2a931b` — option 1: one client under `hooks/lib/`, one codec process per request, the bundle unchanged; a typed refusal and an unanswered call stay distinct and neither is read as an empty store or as no claim; the user gave the Prior side's acceptance as the answer on 2026-09-29; ruled by user, Kai Stalmann <ks@qantr.com>
