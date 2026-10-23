The frozen entry-result schema describes commits.changes and questions differently from what the module and Prior produce
---
Two descriptions in `catalog/schemas/entry-result.v1.json` are contradicted by the module that fills the envelope and by Prior at the pin. The file is frozen and is the text Prior will read in request 76.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. **Scope:** `catalog/schemas/entry-result.v1.json` (frozen in `catalog/schemas/FROZEN`), `adapters/prior/fusionmodule/internal/entry/entry.go` `controlRecords`, request 76 (plan step 25).

**Evidence**

1. **`commits[].changes`.**
   - The schema says: "One per changed path, `<status>\t<path>` in git's name-status form, from the snapshot's changed_paths."
   - The module copies `snapshot.ChangedPaths` unchanged (`entry.go` `run`, `w.commits[0].Changes = append(..., snapshot.ChangedPaths...)`).
   - Prior fills `ChangedPaths` with plain paths: `Prior: internal/fusionhost/repair_snapshot.go` at `08c57fb` passes `change.Paths` to `files.Read(path, ...)`.
   - `TestOneEntryPerClassRunsAgainstTheFakeHost` (reconcile case) asserts a plain path.
   - `adapters/prior/README.md` `### The entry workflow` already says "not git's name-status form". The frozen schema says the opposite.
   - The tab-splitting branch in `controlRecords` exists only for the form the schema describes.
2. **`questions` provenance.**
   - The schema description says questions and commits "are read from the host's receipts and copied, never composed by the model".
   - The module copies `questions` from the run's settled answer (`entry.go` `role`, `w.answer = &a`; `envelope`, `env.Questions = w.answer.Questions`). It has no access to `host.question.v1` receipts.
   - The fake host's model composes the list itself (`internal/fixture/entry.go` `scripted`).
   - Whether Prior's role output for an entry run is host-assembled or model text is not settled at the pin.

**Fix direction (a choice for the user).**
- (a) The schemas are fusion's unaccepted proposal and request 76 is not yet sent. Correct both descriptions and re-hash through the frozen-asset test's documented route, recording why in `FROZEN`'s comment.
- (b) Leave the bytes and have request 76 state both discrepancies, with a v2 beside the file once Prior answers.

Either way, request 76 must ask Prior who assembles an entry run's `questions`.

**Acceptance.**
- Under (a): the two descriptions match the module's behaviour; `FROZEN` carries the new hashes; `cd /Users/kai/Projects/productive/F04-FUSION/fusion/catalog && npm ci && npm test` exits 0.
- Under (b): plan step 25's request text names both discrepancies and the question. In both cases the name-status branch of `controlRecords` is either removed or its comment says which input produces that form.
