# How does a frozen catalog asset leave the tree when the contract it serves is withdrawn?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`; `261027-1612-does-the-module-keep-serving-fusion-entry-v1-beside-fusion-entry-v2.md`; `261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md`; `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md` (step 15)

---

## Question

`catalog/schemas/FROZEN` names every published schema and workflow definition with its sha256. The rule is stated in three places and nowhere else: `catalog/README.md` `## The frozen assets` ("A change to a frozen file turns `npm test` red; the route is a new schema version beside the old one, agreed with Prior, and a new `FROZEN` line for it, never an edit under the same name"), `catalog/src/__tests__/frozen.test.ts` (the list is exactly the `.v1.json` files on disk, every line hashes to its file, the explorer's five are the bytes of `d52223a9`), and request 76 `### What fusion does with the answer` ("a correction to a frozen entry asset … is a new version beside it, never an edit under the same name"). The freeze was made at step 15 of the plan cited above, on Prior's answer 69, and no decision record defines it. All three statements govern a **correction**. None says whether a frozen asset may leave the tree when the contract it belongs to is withdrawn. Under the ruling on repair (option 3 of the first cross-reference) eleven frozen assets describe a contract fusion no longer serves: `workflows/repair.v1.json`, `schemas/repair-request.v1.json`, `repair-result.v1.json`, `implementer-request.v1.json`, `implementer-result.v1.json`, `review-request.v1.json`, `review-response.v1.json`, `audit-request.v1.json`, `audit-result.v1.json`, and the accepted-reference entry pair `workflows/entry.v1.json` and `schemas/entry-result.v1.json`. `schemas/entry-request.v1.json` stays in use. The 13.4.1 plan needs the answer before its catalog steps.

## Options

1. **Withdraw: the file and its `FROZEN` line leave together, and the name is recorded as withdrawn.** A new file `catalog/schemas/WITHDRAWN`, in `FROZEN`'s line form, lists each withdrawn path with its last sha256, under a comment naming the ruling and the commit at which the bytes stand (`v13.1.0` for the nine repair assets, request 76's C `ca9eb60d` for the two entry assets, which no tag carries). `frozen.test.ts` gains three checks: `WITHDRAWN` and `FROZEN` name disjoint paths; no withdrawn path exists on disk; and each withdrawn hash equals `git show <commit>:catalog/<path>`. The README's rule gains one sentence: a withdrawn name is never published again, and a later contract on the same subject takes a new name or a new version. The bundle assembler is unchanged, since it copies only what is on disk.
   - Pros: it keeps the property the freeze exists for. Bytes under a published name never change, because the name can never return with other bytes. Prior's old runs stay readable "under their original formats and pins" (answer 69.5): the installed 13.1.0 payload, Prior's own copy under `internal/fusionhost/testdata/repair-contract/`, and fusion's `v13.1.0` tag hold them. The shipped tree no longer describes a withdrawn model.
   - Cons: one more fusion-only file and three more test cases. Prior learns of the withdrawal only through request 77.
2. **Keep the files and their `FROZEN` lines, and leave them out of the bundle.** The assembler takes a list of withdrawn paths and skips them.
   - Pros: `FROZEN` and the test do not change.
   - Cons: `FROZEN` no longer names the published set, which is the test's first invariant. The tree keeps describing repair and the accepted reference, and the assembler gains a second list that has to match.
3. **Keep the files, their lines, and their place in the bundle, unserved.** This is option 1 of `261027-1612-does-the-module-keep-serving-fusion-entry-v1-beside-fusion-entry-v2.md` as first filed, extended to repair.
   - Pros: no change to any freeze mechanism.
   - Cons: Prior installs schemas of a model fusion's user ruled out, and the bundle carries data no capability serves. It keeps the accepted-reference model alive in the shipped tree, which the ruling on repair excludes.

## Constraints

- No frozen file changes its bytes under its name.
- The explorer's five assets stay published, byte-equal to `d52223a9`.
- `entry-request.v1.json` stays published, because `entry.v2` uses it unchanged.
- No codec byte moves.

## Recommendation

Option 1. The freeze rule binds bytes under a name and is silent on withdrawal. Its test already holds only the set on disk, so a file and its line leaving together breaks none of its checks. What the rule needs is the one guarantee withdrawal could otherwise undo, that a name never returns with other bytes, and `WITHDRAWN` makes that guarantee mechanical. The first filing of `261027-1612-does-the-module-keep-serving-fusion-entry-v1-beside-fusion-entry-v2.md` stated the constraint as "never edited or removed under its name". The "removed" half read more into the rule than its three sources say, and that record now cites this one. Confidence: the three sources were read at `cd4970b5`. That Prior needs nothing from fusion's tree to read old repair runs is fusion's reading of 69.5, which request 77 asks Prior to confirm.
