# Where does a `fusion.evidence/v1` record live on disk, and under which name, so that `attach-evidence` can resolve it by id?

---
**Domain:** data
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-2251_*_plan-fj02-operation-kernel-revisions-and-local-transactions.md, 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

`attach-evidence` binds a package to an evidence record at an exact revision and must check the binding: the record exists in this workbench under that id, its stored bytes hash to the revision the request pins, its `execution_policy` equals the policy the binding claims, its `brief_revision` equals the package narrative's current hash, and its report artefact is on disk at the hash the record names. The same checks apply to `outcome.evidence` when a package moves to `done`, and `reconcile` re-runs them to report a stale binding. All of that needs the kernel to find an evidence file by id, and today nothing says where such a file is or what it is called. The spec's section 3 layout says only `reviews/  # Berichte, bei neuen Prüfungen Ergebnis-JSON`. FJ01's `record_selector` admits `package.json` and `<name>.record.json`, so an evidence file cannot be named by `show` or `validate` either. The scratch workbench's `done` package already binds an evidence id (`51f3db37-…`) that exists nowhere, which is why FJ01's `validate` never resolved bindings and why FJ02's `validate` must not start to (the recorded pair `06-validate` would change). The choice has to be made before FJ02's step 7, and it binds what FJ03's reviewer and the Prior side write.

## Options

1. **`<basename>.evidence.json` beside its report `<basename>.md`, in the `reviews/` store of the container or of `shared/`**, the same pairing rule the record kinds use (`<name>.record.json` beside `<name>.md`); the kernel's walk admits `*.evidence.json` wherever it sits under the workbench, and `record_selector` gains the suffix additively.
   - Pros: one naming rule for every JSON control file (a fixed suffix beside the Markdown it belongs to); the report `artefact_ref` inside the record and the file beside it are the same document, so a reader finds both with one `ls`; `list` and `validate` cover evidence with the code they already have.
   - Cons: an evidence record produced by Prior for a subject outside any container lands in `shared/reviews/`, which is where the conventions put reviews anyway. Two limits the pairing does not settle alone (discussion `260929-0709_*_fj02-kernel-plan-and-three-open-choices.md`, C2): nothing in the name makes the record's `report.path` name the neighbouring file, so the kernel has to check it; and a correction over an unchanged report cannot take `<basename>.evidence.json`, which the first, immutable record holds, so the rule needs a second form (the plan's step 7 uses `<basename>.<n>.evidence.json`, `n` from 2, naming the same report).
2. **A dedicated store `evidence/` per container and under `shared/`**, files named `<uuid>.json`.
   - Pros: lookup by id is a path computation, no walk.
   - Cons: a new store the layout definition, the tracking rule, the archive sweep and the path lints all have to learn; the report and its record sit in different directories; the spec's decision 3 (existing directory names stay, no new business register) reads against it.
3. **Evidence stays inside the package record** as an inline object under `evidence[]` instead of a separate file.
   - Pros: no lookup at all.
   - Cons: the spec's 4.4 makes evidence an immutable record with its own revision that several packages may bind; inlining it makes the package's revision move whenever evidence is added and gives the same result two homes.

## Constraints

- Spec 4.4: an evidence file is immutable once accepted, a correction is a new record naming its predecessor, a package binds it through `evidence_ref` at an exact revision.
- Spec decision 3: existing directory names stay, no new business register beside `issues/`.
- The six recorded pairs stay byte-identical, which means the scratch workbench gains no file and `validate`'s finding set does not grow for it.
- Additive only: `record_selector` widens, nothing narrows.

## Recommendation

Option 1. It is the pairing rule the workbench already has, applied to the one control kind that had none, and it needs no new store. FJ02's kernel resolves an id by walking the control files (packages, records and evidence) and reading each `id`; if that walk is ever measured slow, the spec's 4.4 allows a derived, deletable index and FJ03 may add one without changing the layout.

---
Answered: 260928-2251_*_plan-fj02-operation-kernel-revisions-and-local-transactions.md step 7 — option 1: `<basename>.evidence.json` beside its report `<basename>.md` in a `reviews/` store, `report.path` checked to name that neighbour, a correction over an unchanged report named `<basename>.<n>.evidence.json` from n = 2; approved with the revised plan on 2026-09-29; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: cc3d82b0 — codec/src/store.ts reads `<basename>.evidence.json` beside its report and a correction as `<basename>.<n>.evidence.json` from n = 2; codec/src/cli/ops.ts `bindEvidence` checks the neighbour rule for attach-evidence and the transition to done (FJ02 step 7).
