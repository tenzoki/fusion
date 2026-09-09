Recommendation 7 names an archive confirmation that the cleanup pipeline explicitly skips

---

`260909-1047-size-versus-bookkeeping-across-three-projects.md` recommendation 7 ("Move the questions into the work") names two gates that land after the work is over: "the curation gate and the archive confirmation are both asked about material that existed hours earlier."

The archive confirmation is not on that path. `skills/archive/SKILL.md:201` reads: "**Confirm via `AskUserQuestion` — except inside the full cleanup pipeline.** A tier-1 run performed as Step 4 of a full `/fusion:cleanup` skips this step: that pipeline declares tier-1 safe-by-construction and autonomous, and its Step 6 gate is the run's one stop — two prompts for one wrap-up was the two bodies' contradiction." `skills/cleanup/SKILL.md` Step 4 says the same from its side: execute tier-1 "autonomously — no confirmation gate". The archive prompt exists only on a targeted `--only archive` or by-name run, which the user chose to start.

So half of the recommendation's named target does not exist on the path it is aimed at, and the arrangement it proposes — one stop, held at Step 6 — is the one the pipeline already has, settled by `260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md`. The curation gate half stands.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
Verified in `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` (Corrected, item C6). Paths: `skills/archive/SKILL.md:201`, `skills/cleanup/SKILL.md` Step 4, at pin `a1ecf86e`.
