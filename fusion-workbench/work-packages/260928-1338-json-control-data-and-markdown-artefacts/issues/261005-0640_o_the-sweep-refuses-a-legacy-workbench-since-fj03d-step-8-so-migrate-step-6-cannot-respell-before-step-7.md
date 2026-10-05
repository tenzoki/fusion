The sweep refuses a legacy workbench since FJ03d step 8, so /fusion:migrate Step 6 cannot respell before Step 7
---
FJ03d step 8 made `bin/fusion-citation-sweep` refuse a workbench without `workbench.json` (exit 6, stderr naming `legacy` and `/fusion:migrate`), as the plan's step 8 and `## API Changes` ask. `/fusion:migrate` Step 6 runs that sweep after the store rename and before Step 7 migrates to JSON control, so at Step 6 the workbench is always legacy. Every Step 6 run now stops on exit 6, and a v11 workbench keeps its `circles/`, `planning/` and `consult/` citations unrespelled.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 261004-2059_*_since-13-0-0-the-citation-sweep-cannot-rewrite-a-v11-container-root-citation-so-migrate-step-6-leaves-every-one.md

Evidence, on `fj03d` at the step 8 commit:

- `skills/migrate/SKILL.md` `## Step 6 — Sweep the citations` runs `"$SWEEP" --dry-run --kinds "$K"`, then `--write --yes`; `## Step 7 — Repair, then migrate to JSON control` follows it.
- `hooks/citation-sweep.ts` `main`: `if (read.format === "legacy") return notRead("legacy", root);`, exit 6.
- `hooks/lib/__tests__/citation-sweep.test.ts`, the JSON case "refuses a <path> naming a control file …": a legacy workbench is exit 6 with nothing on stdout.
- No test runs Step 6 (analysis 261005-0504-fj03d-step2-classification-at-the-base-commit.md, consumer table), so the suite does not show this.

The sweep reads no Markdown control data: on legacy it only skips the `bound=` lines and the codec-file refusal. Its legacy branch is name grammar, not a control parser in the sense of section 9's FJ03 row. Step 8 refused it anyway because the plan lists the sweep among the explicit checkers.

Options, none chosen:

1. The sweep admits `legacy` again, as rewriter-only (no `bound=` lines), and the checker and plan-size keep refusing. One branch back in `hooks/citation-sweep.ts`, its test case reversed.
2. `/fusion:migrate` moves the sweep after Step 7. On JSON the sweep prints `bound=` lines, and a rewrite of an adopted plan or a bound report leaves that binding stale right after migration.
3. Step 6 is dropped, and v11 citations stay as they are (`store-prefixed`, reported by the checker).

Acceptance: a ruling between the options; then `/fusion:migrate` Step 6 either runs to its census on a legacy workbench or is reordered or removed in `skills/migrate/SKILL.md` (FJ03d step 7 owns that file). If option 1, a test that runs the sweep on a legacy workbench and gets exit 0 with no `bound=` line. Executor: `code-implementer`.

**Ruled:** 2026-10-05 by the user (Kai Stalmann), in chat ("2:1"): option 1. The sweep admits `legacy` as a rewriter only, with no `bound=` lines; the checker and plan-size keep refusing. Carried by FJ03d step 7.
