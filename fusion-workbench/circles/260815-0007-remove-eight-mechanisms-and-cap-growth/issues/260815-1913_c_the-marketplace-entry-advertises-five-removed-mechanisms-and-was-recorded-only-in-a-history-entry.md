# The marketplace entry advertises five removed mechanisms, and the finding was recorded only in a history entry

---
**Severity:** Medium — it is the description a user reads before installing, and it is wrong in five clauses
**Domain:** data
**Filed by:** reconciler, Phase-3 pass `history/260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** the user — the file is in another repository and no plan step can reach it
**Affects:** `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/.claude-plugin/marketplace.json`, the fusion entry's `description` and `keywords`
**Cross-references:** `history/260815-1855-coder-step15-release-preparation.md` (where it was found and recorded); `planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md` step 15; `CLAUDE.md` `## Release process` steps 2–4

---

Step 15 read the marketplace clone and found its fusion `description` still advertising five things
the tree no longer has: `17 … agents` (fifteen), `code/data/strategic/knowledge` (two values),
`investigator parameterised by a project-supplied capture-layout rule` (agent and template both
deleted), `churn detection` (deleted), and `an optional push-only Plane work-queue mirror` (deleted).
Its `keywords` array still carries `churn-detection`. The plugin's own `plugin.json` description was
corrected step by step as each mechanism left; the marketplace copy was not, because no step of this
plan could write into another repository.

Verified by this pass at HEAD `9306f0a`: the entry's `version` also still reads `8.2.0` against
`9.0.0` in `plugin.json`, `install.sh:27` and `README.md:26`.

---

## Why it is filed now

The finding is real and was correctly established, but it was written into a session history entry
and nowhere else. `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY`
is explicit that a defect goes in its own file and never into a history log, because embedded items
get lost. This record is that file; the history entry keeps the measurement.

## What closes it

The steps are already written out at `history/260815-1855-coder-step15-release-preparation.md:205`
as a numbered hand-off: pull the clone, set the fusion `version` to `9.0.0`, rewrite the
`description` and drop `churn-detection` from `keywords`, commit and push both repositories, and tag
`v9.0.0` in this one. The tag does not exist yet either — `git tag --list` stops at `v8.2.0` — which
matters because `install.sh`'s own header now names `FUSION_REF=tags/v9.0.0` as the current pin.

---
Resolved: marketplace commit `2f1b4e8` ("chore: fusion 9.0.0") in
`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`, pushed to
`origin main` (`259d58d..2f1b4e8`). The fusion entry's `version` is now `9.0.0`, matching
`.claude-plugin/plugin.json`; the `description` was rewritten against the plugin's own
`CLAUDE.md` and `README.md` rather than edited by subtraction, so the agent count reads 15,
the domain values read code and data, and the investigator agent, churn detection and the
Plane work-queue mirror are gone; `churn-detection` left the `keywords` array and
`decision-records` took its place. The release tag `v9.0.0` this record also named already
existed when the fix ran.
