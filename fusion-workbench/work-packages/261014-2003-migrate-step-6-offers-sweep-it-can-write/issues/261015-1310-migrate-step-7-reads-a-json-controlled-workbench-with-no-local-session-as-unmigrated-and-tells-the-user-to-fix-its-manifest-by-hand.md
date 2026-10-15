/fusion:migrate Step 7 reads a JSON-controlled workbench with no local migration session as unmigrated, and tells the user to fix its manifest by hand
---
Step 7 decides "already on JSON control" only from `done=true` in `fusion-migrate status`. That session lives under `$HOME/.fusion-migrate/<hash of the workbench's real path>`, so a workbench migrated in another checkout, on another machine, or created JSON-native by v13 setup prints `run=none`. The skill then runs `survey` and `repair --list`, which report every control file and `workbench.json` as blocking and unrepairable ("stays blocking until the Markdown is fixed by hand"), and the skill names each one for the user to fix by hand. Since 13.1.2 every `FOUND=0` run reaches Step 7 after Step 6, and the 13.1.2 help paragraph and decision option 1 recommend re-running `/fusion:migrate` on JSON-controlled workbenches (krk), so this path is now the advertised one.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261015-0633-does-a-migrate-run-on-a-v12-format-workbench-offer-the-citation-sweep-when-its-census-counts-store-prefixed-citations.md`, `261015-1310-reviewer-closing-pass-over-the-migrate-step-6-package.md`

**Evidence.**

- `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, `**Survey.**`: "With `done=true` and `rolled_back=false` the workbench is already on JSON control: say so and stop. … Otherwise run `"$M" survey`". `**Repairs**`: "A finding with an `unrepairable=` line is named with its reason: the user fixes it by hand".
- `hooks/migrate.ts` `status()`: with no session state it returns `state=<inspect>` and `run=none`, no `done=` line.
- Run by the reviewer, 261015: `codec/fixtures/workbench/` copied into a committed scratch repo, `HOME` pointed at an empty directory. `bin/fusion-migrate status` printed `state=json-control` and `run=none`, exit 0. `survey` printed `layout=json-control` and `blocking=` lines for `manifest-present workbench.json` ("a manifest stands; this workbench is not legacy") and `control-file-exists` per `package.json`. `repair --list` printed `blocking=3` with an `unrepairable=` line on each.
- `skills/help/SKILL.md` `### 4. Update`, the 13.1.2 paragraph: "every re-run, a JSON-controlled workbench included, offers the citation repairs".

**Fix direction.** Read `state=` off `status` (or `layout=` off `survey`) and stop on `json-control` with "already on JSON control", whatever `run=` says. Pin it with a case in `hooks/lib/__tests__/store-name-migration.test.ts` that runs Step 7's status call on a `jsonWorkbenchAt` tree with an empty session directory.

**Acceptance.** On a JSON-controlled workbench with no session under `$HOME/.fusion-migrate/`, Step 7 as written says the workbench is already on JSON control and stops, asking nothing and naming no finding. A test runs that case.

---
Resolved: 2026-10-15, plan `261015-1559-plan-migrate-step-7-recognises-json-control-without-a-local-session.md` steps 1 to 3. Reproduced first: on a `jsonWorkbenchAt` tree with an empty `$HOME/.fusion-migrate/`, `fusion-migrate status` printed `state=json-control` and `run=none` and no `done=` line (`hooks/lib/__tests__/store-name-migration.test.ts`, `describe("Step 7 on a JSON-controlled workbench with no local session")`). `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, `**Survey.**`, now routes on the tree's `state=` as well as the session: its block prints one `ROUTE=` line, and `ROUTE=json-control` says the workbench is already on JSON control, whatever `run=` says, and stops, asking nothing and naming no finding; `survey` runs only under `ROUTE=survey`. The regression runs the shipped block over cases (a) to (g) in `hooks/lib/__tests__/store-name-migration.test.ts`, `describe("Step 7 as shipped: the survey block routes every cell of session by state")`, case (a) being this issue's acceptance.
