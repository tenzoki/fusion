# Which route takes a legacy workbench that holds no record to JSON control: the migration, or Setup's initialize?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261019-0906-migrate-an-empty-legacy-workbench.md, 261019-0913-how-does-the-shared-migration-contract-shape-a-run-that-converts-no-pair.md, 261019-0913-plan-migrate-an-empty-legacy-workbench.md

---

## Question

A legacy workbench that holds no record pair (its `.fusion-setup` or a fusion store present, no `workbench.json`, zero pairs) has no route to JSON control today. `/fusion:setup` sends `initialize`, which answers `result=legacy` because existing content is present, and every agent then refuses the workbench and routes to `/fusion:migrate`. `/fusion:migrate` composes a proposal with no record, and the codec's plan phase refuses it: `schema-invalid/proposal-invalid: … names no record; a migration converts at least one pair` (`codec/src/migration.ts`, `migrationPlan`, the proposal step). The user met this on the Prior repository, which had been worked with Codex. One of the two commands has to accept such a workbench, and the choice decides which shared contract changes.

## Options

1. **The migration accepts it.** A proposal naming no record is admitted. The run converts nothing and writes its receipt and `workbench.json`, the manifest; every agent then reads the workbench as `json-control`.
   - Pros: `initialize` keeps its rule that any existing content is refused by name (`codec/fixtures/prior/REQUESTS.md`, the section headed "27. Which write creates workbench.json for a new workbench: ruled"); the workbench carries a receipt like every other migrated one, and `bin/fusion-migrate rollback` takes it back to legacy.
   - Cons: the migration contract shared with Prior changes, so the codec bundle moves and Prior re-qualifies it.
2. **Setup initialises it.** `initialize`, or Setup in front of it, writes the manifest onto a legacy folder that holds no record.
   - Pros: no migration run, no receipt, no plan files.
   - Cons: overturns the ruling of request 27 that `initialize` refuses any existing content, legacy Markdown without JSON included; the workbench gets a manifest with `migration: null` although it was set up before the cutover, and nothing takes it back.

## Constraints

- The codec alone writes `workbench.json` (request 27); neither host writes manifest JSON itself.
- `initialize` refuses any existing content by name (request 27, ruled at Prior `ddd4973`).

## Recommendation

None: the user ruled before this record was filed. Asked how fusion should fix it, the user chose: "Die Migration akzeptiert einen leeren alten Workbench-Ordner. Sie konvertiert nichts und schreibt nur das Abschlussprotokoll und die `workbench.json`" (option 1), over Setup initialising the folder directly (option 2), as the package narrative `261019-0906-migrate-an-empty-legacy-workbench.md` `## The user's words` records. The receipt binds the frozen plan and its parts by hash (`codec/schemas/migration-receipt.schema.json`), so the plan files the plan phase freezes under `archive/migrations/<id>/` stand beside the receipt; the plan reads "writes only the receipt and the manifest" as "converts and rewrites no record", and says so at plan approval.

---
Answered: 261019-0906-migrate-an-empty-legacy-workbench.md `## The user's words` — option 1, the migration accepts a legacy workbench that holds no record; ruled by user, Kai Stalmann <ks@qantr.com>
