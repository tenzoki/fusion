# What does the user-word source hash bind, when every closure note changes the narrative it names?

---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261110-2045-the-citation-sweep-rewrites-a-review-an-evidence-record-binds-by-hash-and-the-reviewer-wrote-store-prefixed-citations-into-one.md`, `261111-1200-reviewer-closing-pass-over-the-five-issues-package.md`, `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md`

---

## Question

`rules/fusion-workbench-conventions.md` `## Work packages` has `set-mode --source` cite the narrative that holds the user's words as `{"kind":"user-word","ref":{"kind":"other","path":"<it>","sha256":"sha256:<of its bytes>"}}`, so `mode` `autonomous` stands on a hash of the narrative's bytes. The codec reads that reference on `reconcile`: `referenceSites` (`codec/src/cli/ops.ts:2451`) lists `/mode/source/ref` for a `user-word` source, `resolveArtefact` (`codec/src/kernel.ts:509-516`) hashes the file and answers `missing-evidence/artefact-changed` when the bytes differ; `/provenance/claim_transfers/<i>/source/ref` is read the same way (`ops.ts:2471`). Nothing acts on that answer: `hooks/lib/record-index.ts:187-193` keeps only `record-not-found` among unresolved references, no operation refuses on it, and `hooks/citation-sweep.ts` `boundFiles` (lines 889-900) honours two bindings, `active_documents` and an evidence record's report, and not this one, while its header calls that set "each file ... whose bytes a record binds by hash" (lines 60-62).

Measured on 2026-11-11 at `ee1a4984` in this repository: 12 package control files carry a `user-word` source (`grep -rl '"user-word"' fusion-workbench --include='*.json'`, `archive/` excluded), all 12 `done`, and for all 12 the narrative's `shasum -a 256` differs from the recorded hash; `reconcile` reports 13 `missing-evidence/artefact-changed` references. For `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts`, the hash was taken at `f31a84c5` over the narrative as it then stood (the hash of `git show f31a84c5:<narrative>` equals the recorded value) and seven later commits changed the narrative, the closure note of `7ccb1728` and its addendum of `a0c61888` among them. So the binding is broken by the procedure itself on every closed package, not by a third tool: the consent hash never survives `## Closing a work package`.

The citation sweep's new skip (issue `261110-2045-...`) raised the question: its bound-detection is complete for the bindings the codec refuses to read over (an evidence report, an adoption) and incomplete for this one, and whether that is right depends on what the hash is meant to hold.

## Options

1. **The hash pins the moment, not the file.** The user-word reference binds the narrative as it stood when the user spoke, later edits are expected, and `artefact-changed` on it is informational. `## Work packages` says so in one sentence; the sweep's header names this binding as one it does not honour and why; `reconcile`'s entry stays as it is.
   - Pros: no code change in `codec/` (pinned by Prior); matches what every closed package already shows; the sweep's skip set stays what the codec refuses over.
   - Cons: a reader verifying consent by the hash gets a mismatch on every closed package and has to know the rule to read it; the hash then proves nothing a reader can check without `git log`.
2. **The hash is meant to hold.** The words the user spoke, or the closure note, move out of the hashed bytes (the closure note into the control file's `outcome.reason`, or a separate file beside the narrative), and the sweep skips a narrative a user-word source binds.
   - Pros: the consent reference stays verifiable for the package's whole life.
   - Cons: changes the closure procedure (`agents/orchestrator.md` `## Closing a work package`) and the narrative's shape; the sweep gains a third binding role; existing packages stay broken unless rebound.
3. **Drop the byte hash from the user-word reference.** The reference names the path and the commit instead.
   - Pros: nothing drifts.
   - Cons: a schema change in `codec/schemas/`, which Prior pinned by digest (request 81); a commit hash in a record is what `261109-1341-...` found goes stale under the rebase cycle.

## Constraints

`codec/` is pinned by digest for a consuming project: an option that changes its schema or kernel is a Prior request, not a `code-implementer` dispatch. Whatever is chosen, the sweep's header states which bindings it honours and which it does not, so the enumeration there stops reading as "every".

## Recommendation

Option 1, with the sentence in `## Work packages` and in `hooks/citation-sweep.ts`'s header. Twelve of twelve packages already read that way, and nothing has needed the hash to hold; a rule that states what the tree does is cheaper than a procedure change that would still leave the twelve as they are.
