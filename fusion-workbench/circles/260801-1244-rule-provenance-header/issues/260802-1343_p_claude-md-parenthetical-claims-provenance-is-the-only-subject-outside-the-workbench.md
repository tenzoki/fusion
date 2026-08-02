CLAUDE.md's new parenthetical claims provenance headers are the only subject the conventions file governs outside `fusion-workbench/`, and four other subjects contradict it
---
Commit `7703330` rewrote the `rules/fusion-workbench-conventions.md` row in `CLAUDE.md:30` to end with "and the provenance headers on rule files (the one subject it governs outside `fusion-workbench/`)". The parenthetical is false. At least four other parts of the same conventions file govern things outside the workbench directory. Drop the parenthetical, or replace it with a non-exclusive phrasing such as "one of the few subjects it governs outside `fusion-workbench/`".
---
This is a regression introduced by the fix for `260802-1251` (conventions lede scope excludes the new provenance section). That issue is correctly closed: the lede at `rules/fusion-workbench-conventions.md:5` now reads "for all agents operating on `fusion-workbench/`, and for the rule files those agents load" and lists provenance headers as a ninth subject, which is accurate and makes no exclusivity claim. The overclaim is only in the `CLAUDE.md` half of the same commit, and the two documents now disagree: the conventions lede is non-exclusive, `CLAUDE.md` asserts exclusivity.

Counter-examples in `rules/fusion-workbench-conventions.md`, each verified by reading the file at HEAD:

- `:601` `## Security` — "Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables." Scoped to every file in the project, with no relation to `fusion-workbench/`.
- `:7` (lede, second paragraph) — "A path literal that names a store directory belongs in exactly two places: this file, and `bin/fusion-paths`." This governs `agents/*.md`, `skills/*/SKILL.md` and `bin/fusion-paths`, and it is enforced over those files by `hooks/lib/__tests__/path-literal-lint.test.ts`.
- `:91` `## Path Resolution (Pfadauflösung)` — "No agent and no skill hard-codes a store path." Same surface as above.
- `:220` `## Project language` — "Projects declare the language of their prose output in `CLAUDE.md` via a line of the form `**Language:** <lang>`." Governs `CLAUDE.md` itself.

Consequence: `CLAUDE.md` is auto-loaded into every Claude session in this repository, so the false claim is read before any edit to the conventions file. A future editor who trusts it would conclude that the security rule and the path-literal rule are misplaced, or that a new non-workbench subject cannot be added here.

Scope: `CLAUDE.md` only. The plugin's shipped behaviour is unaffected — `CLAUDE.md` is dev-only and is not copied by `install.sh`.

Cross-reference: `circles/260801-1244-curator` C9 rewrites `rules/fusion-workbench-conventions.md` wholesale and may restate its scope. If the lede's subject list is revisited there, the `CLAUDE.md` row has to move with it.
