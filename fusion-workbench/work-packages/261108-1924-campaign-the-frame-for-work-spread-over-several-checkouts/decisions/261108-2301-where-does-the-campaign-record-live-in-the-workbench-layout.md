# Where does the campaign record live in the workbench layout?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md` (`## Open for Planner`, first item), `261108-1927-does-the-claude-side-adopt-the-campaign-as-its-one-frame-for-work-spread-over-several-checkouts.md`, `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`, `260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md`

---

## Question

`codec/schemas/campaign.schema.json` names the file `campaigns/<id>/campaign.json` and says nothing about the directory above it. The layout tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` holds two kinds of entry: the per-item container store and `shared/`, both of whose stores hold artefacts of one kind filed under one brief or none, and the root-anchored surfaces the hooks and helpers read at fixed paths. A campaign fits neither description as written: it belongs to no work package (it groups them), it is not session state (it travels), and it has one writer (the steering session). The choice has to be made before the first helper reads or writes the file, because `hooks/lib/stores.ts`, `bin/fusion-stores`, `bin/fusion-paths`, `hooks/lib/staging-drift.ts`, the path-literal lint and `rules/workbench-tracking.md` each enumerate the layout and refuse or misclassify a path they do not know.

## Options

1. **A root-anchored store `fusion-workbench/campaigns/<id>/campaign.json`, beside `work-packages/`, class R1.** The schema's own path read relative to the workbench, as `work-packages/<name>/package.json` is. Keys `OUT_CAMPAIGN` and `SCAN_CAMPAIGNS` valued literally as `campaigns`, the way `OUT_PACKAGES` is.
   - Pros: the schema's path stands as written and Prior's reading of it needs no translation; the directory name is the `campaign_id`, so `ls` on one path is a campaign's whole account; one writer per file holds by the single-writer rule of the spec, which is exactly the R1 property; the store sits beside the one it groups.
   - Cons: a new root entry touches six enumerations in one commit (the layout tree, `stores.ts`, `fusion-stores`, `fusion-paths`, the classifier, `workbench-tracking.md`), and every byte added to the conventions file is charged to all eleven dispatch paths.
2. **A store under `shared/`, `shared/campaigns/<id>/campaign.json`.** The campaign belongs to no item, and `shared/` is where the conventions put what belongs to no item.
   - Pros: `RECORD_STORES` already drives the lint, the classifier and the scan keys, so adding one name there is the smaller edit.
   - Cons: the schema's path would be wrong by one segment on the Claude side and right on Prior's, which is a translation two hosts would have to agree on; `shared/` is defined as "the same kinds, for work belonging to no item", and a campaign is not one of those kinds but a frame over the items, so the `## Origin Rule` has nothing to decide about it; a `SCAN_CAMPAIGNS` under the `<scope>/` rule would also name a container store that can never hold one.
3. **Inside the steering checkout's own container, as a plan-like record.** The campaign as an artefact of the work package that opened it.
   - Pros: no new store at all.
   - Cons: a campaign outlives and spans work packages, and the steering checkout holds no package by definition (spec C3), so there is no container to file into.

## Constraints

- The schema's `campaigns/<id>/campaign.json` is a shared-format statement; a Claude-side location that contradicts it is a format question to Prior, which the plan's request states rather than asks.
- `rules/workbench-tracking.md` `## The four classes` requires every layout entry to fall in exactly one class in the same commit that creates it.
- `hooks/lib/__tests__/path-literal-lint.test.ts` parses the layout tree: `RECORD_STORES` must equal the `shared/` subtree and `CONTAINER_STORE` must stay the tree's first root, so the new entry sits after `work-packages/` and before `shared/`.
- No skill body may spell the store as a literal; the helper reads the name from `bin/fusion-stores` and the skill from `bin/fusion-paths`.

## Recommendation

Option 1. The campaign is a root entry because it is neither an item's artefact nor session state, and R1 because one checkout writes each file and git carries it. The plan's step 2 performs the six edits in one commit and pays the conventions file's bytes with a cut in the same file, so no dispatch-path row moves.

Answered: `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md` `## Rulings on the planner's decisions` — option 1, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>, 2026-11-09.
