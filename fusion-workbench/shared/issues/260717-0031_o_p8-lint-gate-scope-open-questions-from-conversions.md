P-8's path-lint gate needs four scope decisions the conversions surfaced

---
Tasks P-4 through P-7 each hit a case where the lint gate's exact scope matters, and none of them could settle it alone. Collected here so P-8 does not rediscover them one at a time.

**1. Frontmatter carries type-folder literals in six agent prompts.** `playmaker`, `analyst`, `planner`, `consultant`, `investigator`, `taskplanner` have `description:` lines naming directories — e.g. playmaker's "writes only circles/<file>.md, ... and history/<own>.md". P-6 left them alone (out of its mandate: frontmatter changes broke agent loading once, v2.8.1). The gate reads `agents/*.md` and will fail on them unless it skips frontmatter. Playmaker's description is also now factually stale — it describes the pre-container model.

**2. `skills/setup/SKILL.md` hard-codes a `circles/` glob.** Around line 239. Setup was converted (P-3, commit `138cd46`) before `SCAN_CIRCLES` existed for it to use. P-5 routed the orchestrator's equivalent through the resolver. The gate will flag setup's unless `circles/` is exempted, which would be the wrong exemption.

**3. The gate must match the path shape, not the bare noun.** P-7's files legitimately contain the words "issues", "analyses", "decisions" in prose — `log-activity`'s legend names artifact kinds, `help` explains the layout to the user in sentences. A regex on the bare word fails those falsely. The gate matches `<type>/` path forms.

**4. The gate must union each agent's prompt with the skills hosted in its session — and must not treat the two mismatch directions alike.** From T2-B's audit:
- The orchestrator's `OUT_MEMO`, `OUT_CIRCLE` and `SCAN_HISTORY` look spare against its prompt but are used by `/fusion:memo`, `/fusion:circle-pop`, `/fusion:direct` and `/fusion:circle-stash`. A gate that ignores hosted skills flags them, someone "fixes" them by deletion, and `/fusion:memo` breaks.
- **Under-emission** (prompt uses a key the resolver withholds) is an unambiguous bug and should hard-fail. That class produced a live defect: reconciler wrote decision records to the workbench root until commit `45d8a71`.
- **Over-emission** (resolver emits a key the prompt never names) is ambiguous. T2-B's audit of eleven cases classified only one as clear-cut (`bugfixer`/`SCAN_PLANS`, whose prompt says twice it does not follow plans); several others look like prompt gaps rather than resolver spares. Auto-failing over-emission would pressure people into stripping keys where the prompt is what is at fault.

Note item 4 interacts with the open namespace decision (`decisions/260716-1940[o]-fusion-paths-argument-namespace-agents-vs-skills.md`): under option 2, skills resolve their own keys and the union problem disappears.

---
Collected by the orchestrator from findings reported by `coder` in tasks P-4, P-5, P-6, P-7 and T2-B.
Source: fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md step 8
