Four steps of commit A carry a green-suite acceptance criterion that only step A7 can satisfy

---
Steps A2, A3, A5 and A6 of `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md` each
end with the acceptance criterion "The full suite is green." Two of them change bytes on a dispatch path, and
the checked-in golden `hooks/lib/__tests__/fixtures/rules-emission.golden` records every path's byte total. So
the moment A2 lands, `rules-emission-golden.test.ts` goes red and stays red until A7 regenerates the fixture.
A2's criterion cannot be met by A2, by construction, and no re-dispatch of its executor could meet it.

Measured at A2's completion: `cd hooks && npm test` exits 1 with 943 of 944 passing, the single failure being
`rules emission golden > matches the checked-in golden, agent by agent`, on
`fusion-workbench-conventions.md 65073` against a file now measuring 65612.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

The plan's `## Approach` is not wrong about the commit: it says commit A lands green, and it does, because A7 is
inside commit A. What is wrong is the per-step criterion, which asserts of an intermediate state a property only
the commit has. The cost is not hypothetical — it routes a correct executor return into the orchestrator's
blocked branch, where the self-healing attempt would re-dispatch an agent that is forbidden to touch the only
file that could fix it.

The acceptance test: for a step whose edit is covered by a generated fixture that a later step in the same commit
regenerates, the criterion reads "the suite is green except for `<the named fixture test>`, which step A7 clears",
or it names no suite state at all. A criterion that a step cannot satisfy with the files it is permitted to touch
is not an acceptance criterion.

Two consequences for the work in flight, neither of them a defect in any executor's output:

- Steps A2 through A6 are not committed one by one. Commit A lands once, after A7, which is what the plan's own
  approach section describes.
- A red suite between A2 and A7 is the expected state and is not evidence of a defect. Only a failure *other* than
  the named golden is.

**Cross-references:** `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md`
