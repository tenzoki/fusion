# Does a read finish a committed `initialize` whose manifest has not landed, or report the target as legacy?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1654_*_plan-initialize-the-codec-creates-a-new-workbench-and-list-names-its-state.md, 260929-1810_*_which-write-creates-the-manifest-of-a-new-json-controlled-workbench.md, 260929-1810_*_what-does-the-claude-side-declare-about-a-read-that-finishes-a-committed-intent.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

`initialize` is the first operation whose intent can stand in a workbench that has no manifest. Between its commit point (`.json-state/journal/<operation_id>/` renamed into place) and the write of `workbench.json`, the target holds `.json-state/` and nothing else. Three facts of the code at fusion `57c5ac7c` then meet. `openWorkbench` in `codec/src/store.ts` reports such a target `legacy`, because the state is a function of the manifest alone. `read` in `codec/src/kernel.ts` runs the body of a read once, without recovery, on every state but `json-control` ("a workbench not under JSON control has no journal this codec wrote", its header). `inspect` in `codec/src/cli/ops.ts` runs outside `read` and has never recovered anything. So `inspect` and `list` answer `legacy` for a target that the next `initialize` request, of any operation id, will turn into a JSON-controlled workbench by finishing the committed intent under the lock.

The specification does not settle which answer is right. Section 6 at Prior `ad21e58` says reads *may* reconstruct committed intents ("dürfen zuvor rekonstruiert werden"); section 4.1 says reading creates no new initialisation ("Lesen erzeugt weiterhin keinen neuen Initialisierungsauftrag") and that after an abort only the committed initialisation bytes are reconstructed, without saying by whom. Prior's ruling on request 27 (`Prior: docs/design/fusion-fj03a-followup-decisions.md` `## 27.` at `ddd4973`) routes a retry after activation through the ordinary compatible-workbench path and says nothing about the window before activation. The choice is needed now because the kernel step and the recorded session of the `initialize` plan pin it in bytes both hosts replay, and because `/fusion:setup` (FJ03d) and Prior's provisioning route both read `inspect` to decide between reuse, `initialize` and FJ04.

## Options

1. **Reads do not finish it; only an `initialize` request does.** `inspect` and `list` report `legacy`, which is true under section 4.1 (no manifest, so legacy). Any `initialize` request takes the lock, and the kernel's existing sequence recovers every pending intent before the replay lookup: the same request answers the committed result, another one lands the committed manifest first and is then refused `conflict/manifest-present`. The kernel header's sentence is narrowed to say that such an intent is finished by `initialize` alone.
   - Pros: no change to the read protocol; `inspect` stays a read that never writes, as it has been since FJ01; the operation that created the intent is the one that finishes it; the recorded bytes of every existing session stay valid.
   - Cons: `inspect` answers `legacy` for a target that is committed to becoming JSON-controlled, so a caller that routes every `legacy` answer to FJ04 routes this one wrongly unless it checks for `.json-state/` first; FJ04's survey has to refuse or finish such a target.
2. **Every read finishes it.** Whenever `.json-state/journal/` holds a pending intent, every read (`inspect` included) runs the read protocol whatever the manifest state, and reopens the workbench after recovery.
   - Pros: no read ever reports a state that a committed intent has already decided; one read protocol for every state.
   - Cons: `inspect`, the gate both hosts call first, becomes a read that may write, on a legacy-state target too; Prior's authorisation of recovery effects then has to cover its gate call; the read path of every operation changes for a window that only `initialize` creates.
3. **Option 1's write-free core, plus a codec-owned report of the window on `inspect`.** No read finishes a pending `initialize`, exactly as option 1. `inspect` gains one additive field (working name `pending`) that is non-null in one window only: the state is `legacy`, and the target's only entry is a `.json-state/` holding a committed `initialize` intent. It names the intent's operation id and whether it is blocked. The state stays `legacy`, and only an `initialize` request finishes the intent.
   - Pros: every read stays write-free. The knowledge of which entries are exempt stays in the codec (`initialContent` and `store.ts`'s constants): Setup and Prior's provisioning route read one field and never re-spell the exemption to decide between `initialize` and FJ04.
   - Cons: a new field in an answer both hosts parse, and one more `inspect` fixture case; the target still needs an `initialize` request to finish.

## Constraints

- A read creates no new initialisation (section 4.1); a diverged file is never overwritten and is reported as blocked recovery.
- The consumer gate (response 28) proceeds only on `json-control`; all three options keep a pending initialisation away from every consumer.
- The Claude side admits recovery on the explicit route only (the recovery declaration, item 30); no automatic hook reaches the codec under any option.
- Not finishing is inside the specification's permission and needs no Prior ruling: section 6 says reads *may* reconstruct (`Prior: concept/fusion-json-workbench-spec.md` at `ad21e58`, the `inspect`/`list`/`show`/`validate` row, "dürfen zuvor rekonstruiert werden"; and "Lesen kann einen committeten Intent fertigstellen" in the paragraph on `recovery-blocked`). Verified by reading the committed object. Whatever is chosen is stated to Prior as a fusion decision in request 33, which Prior may object to before the freeze, and it binds Prior's provisioning route to act on what `inspect` reports for the window.

## Recommendation

Option 3 (revised on a second opinion, 2026-09-30, before approval; the first draft recommended option 1). Verified: `read` in `codec/src/kernel.ts` already runs every state but `json-control` once without recovery (the early return at the head of `read`), and `inspect` runs outside `read`, so the write-free core needs no change to either. Inferred, not measured: without a codec-owned report, each host has to rebuild the exemption list to tell "a pending initialisation" from "a legacy store for FJ04", and two copies of that list would drift the way the Claude side's two reader-helper copies did (`260930-1446_*_scope-and-work-graph-each-carry-their-own-copy-of-the-reader-helpers.md`). Option 3 keeps the list in one place for one additive field.
