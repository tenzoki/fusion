# Which party binds a closing review's evidence into the finish, and by which write, so that a `succeeded` edge can be met?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261005-0626_*_no-shipped-prompt-binds-a-reviewers-evidence-record-to-its-package-so-a-succeeded-edge-cannot-be-met.md, 261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

---

## Question

Issue 261005-0626 asks which party sends `bin/fusion-write attach-evidence`. Reading the codec at `c76bbce9` shows that the question is cut one step too early, because `attach-evidence` alone never meets `succeeded`. We need to settle which party writes the binding that `succeeded` reads, by which write, and at which point of the closure. Prior's response to request 61 (Prior `7da6690`, `docs/design/fusion-fj03d-prior-response.md`) makes this a release condition: "A workflow claiming to support `succeeded` dependencies must attach the evidence and demonstrate that an eligible successor can proceed."

Four facts, each read in the source at `fj-json-workbench` `04673bec`:

1. `succeeded` reads `outcome.evidence` and no other field. `codec/contract/dependencies.json` names `"source": "outcome.evidence"`, and `dependencySatisfied` in `codec/src/transitions.ts` iterates `target.outcome?.evidence`.
2. `attach-evidence` appends to the package's top-level `evidence` array, on a live package only (`attachEvidencePlan` and `livePackage` in `codec/src/cli/ops.ts`; a terminal package is refused `conflict/package-terminal`). Nothing in the codec copies `evidence` into `outcome.evidence`.
3. The transition to `done` runs `bindEvidence` over every `outcome.evidence` entry, and `bindEvidence` refuses `missing-evidence/brief-changed` when the package narrative's bytes on disk differ from the `brief_revision` the evidence record was produced against (`narrativeOf` in `codec/src/store.ts` hashes the file as it stands).
4. `agents/orchestrator.md` `## Closing a work package` step 4 appends the closure note to that narrative and only then sends **Finish**. Any evidence put into the outcome at that point is therefore refused. If the note is written after the finish instead, `reconcile` reports the outcome binding `stale` (`brief-changed`) from then on, and `agents/state-auditor.md` Setup reads every entry other than `fresh` as a finding.

The `--outcome` value is plain JSON today, so binding evidence there means composing `{"ref":{"workbench_id","record_id","revision"},"policy"}` by hand from a `show` of the evidence record. No prompt can be expected to do that reliably.

## Options

1. **The orchestrator binds the evidence in the finish itself, the client composes the binding, and the note follows the status write.** `bin/fusion-write transition` gains a repeatable `--evidence <evidence control path>` on a package transition that carries `--outcome`. The client composes each entry exactly as `attach-evidence` already does, and appends it to `outcome.evidence`. `## Closing a work package` step 4 sends **Finish** with `--evidence` naming the closing review's record, `<review stem>.evidence.json` beside the review, whenever step 2 produced one. The closure note is appended after that write. The state-auditor reads an `evidence` row of a `done` package as history, in line with `rules/fusion-workbench-conventions.md` `## Terminal states are history`. `attach-evidence` stays a helper subcommand that no prompt sends.
   - Pros: one write, by the party that already performs the closure and reads the reviewer's return. The client change reuses an existing composition. The reviewer prompt, whose dispatch path has about 530 bytes of room, does not change. No codec byte moves.
   - Cons: it changes the order of a closure step that has been stable since v11. The state-auditor gains a clause. A closure with no review, or a review with verdict `revise` or `escalate`, leaves `succeeded` unmet by construction. That outcome is the contract, but users will meet it.
2. **As option 1, but the closure note moves out of the narrative into `outcome.reason`.** The brief keeps the bytes the review was produced against, so the binding stays `fresh` and no state-auditor clause is needed.
   - Pros: no stale row exists at all. It also fits the principle that the narrative carries the brief and nothing that decides state.
   - Cons: `agents/policy-curator.md` reads "a work package's closure note" in the narrative as evidence, at three places. The note would become a JSON string that a person reads less easily. The change reaches the conventions rule, a component shared by all eleven dispatch paths at zero head-room.
3. **The orchestrator sends `attach-evidence` when the closing review returns, and the finish carries the attached bindings into `outcome.evidence`.**
   - Pros: the binding is visible on the live package, and `reconcile` checks it before the closure.
   - Cons: two writes where one suffices. The finish still needs option 1's client flag or a hand-composed value. The live binding meets no condition on its own.
4. **The reviewer sends `attach-evidence` right after `evidence`.**
   - Pros: the party that knows the record writes it.
   - Cons: the reviewer path has about 530 bytes of room. A reviewer that binds its own verdict also marks its own work, and the `succeeded` binding still has to be written at the finish by somebody else.

Rejected: leaving `succeeded` unreachable through the agents and documenting it. That is the state today, and Prior's response says it does not make the feature work.

## Constraints

- No byte of `codec/dist/fusion-record.js` moves (`sha256:c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e`).
- The dispatch-path bound has zero head-room. As measured at `04673bec`, the room is reviewer 530, state-auditor 1 158 and orchestrator 4 433 bytes. A shared rule file costs every path.
- A test must show a successor with a `succeeded` edge becoming ready through the shipped helpers, and an observation must show it through the prompt.

## Recommendation

We recommend option 1, contingent on the user accepting the reordered closure step. It is the only option where one write by one party produces the field the condition reads, and it leaves the shared rule corpus and the tightest dispatch path untouched. Option 2 is the cleaner long-term placement of the closure note. It is also a separate change to how a closure reads and who reads it, and we would file it as its own question if the stale-row clause proves noisy.

---
Answered: this record `## Options` option 1 — the orchestrator binds the closing review's evidence in the finish through a client flag `transition --evidence`, and the closure note follows the status write; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: `bin/fusion-write` header (`transition --evidence`), `hooks/lib/record-write.ts` (`evidenceBinding`), `agents/orchestrator.md` `## Closing a work package` step 4, `agents/state-auditor.md` Setup — the finish binds the closing review's evidence and the note follows; observed in case (e) of the opt-in agent suite.
