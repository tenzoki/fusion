The Setup rule sends an `unsupported` workbench to `/fusion:migrate`, which has no branch for it
---
`rules/agent-setup.md` `## What fusion-paths emits` on `fj03d` says: "on a `legacy` or `unsupported` workbench, stop and tell the user to run `/fusion:migrate`". For `legacy` that is the way out. `unsupported` is the other direction: the header of `bin/fusion-claimed-package` defines it as "a manifest requiring a feature this version's codec does not know", a workbench written by a newer client. The migration converts nothing there, and its skill body names no such case.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 260930-1219_*_the-rule-text-states-the-claim-criterion-in-head-fields-and-two-causes-of-exit-3-which-the-helpers-no-longer-match.md

Severity: Low. Scope: `rules/agent-setup.md` on `fj03d` at `cd1b5522`, emitted first to all eleven agents.

**Evidence.**

- `rules/agent-setup.md` `## What fusion-paths emits`, the sentence quoted above (added in `8a6100fc`).
- `bin/fusion-claimed-package`, header, the exit 3 list: `legacy` is "Markdown control data, no `workbench.json`", `unsupported` is "a manifest requiring a feature this version's codec does not know".
- `grep -n unsupported skills/migrate/SKILL.md docs/upgrading-to-v13.md` names nothing. `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control` branches on `done=true`, a recorded run, and a survey; an `unsupported` manifest is none of them.
- `rules/fusion-workbench-conventions.md` `#### Exit codes` says it correctly for one of the two: "On a `legacy` workbench the way out is `/fusion:migrate`, never an edit."
- The three skills state the right treatment for every answer but `json-control` and `legacy`: "Any other line, or none, stops it too: quote it" (`skills/wp/SKILL.md` `## Step 0 — Resolve the store`).

Today one contract version exists, so no workbench answers `unsupported` yet. The sentence ships to every agent all the same, and the first project with two client versions meets it.

**Acceptance.** The sentence separates the two: `legacy` goes to `/fusion:migrate`; on `unsupported` the agent stops, quotes the helper's stderr line and says the installed client is older than the workbench. `docs/upgrading-to-v13.md` or the conventions' exit table says the same in one clause. The dispatch-path bound stays green with no baseline moved.

Executor: `code-implementer`.
