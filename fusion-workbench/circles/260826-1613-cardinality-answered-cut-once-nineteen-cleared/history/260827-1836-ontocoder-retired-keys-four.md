# ontocoder — fusion.json `_retired` prose names four retired keys

**Task:** plan step 13a of `planning/260827-1756_p_repair-the-twenty-open-defect-records.md` (record `shared/issues/260825-1456_p_three-shipped-surfaces-say-the-retired-configuration-key-set-is-three-and-the-loader-holds-four.md`).

**Changed:** `fusion.json` and `templates/fusion.json`, identically — "the three top-level keys that held it — guard, decisions, escalation" is now "the four top-level keys that held it — guard, decisions, escalation and, since 260824, churn". Source: `RETIRED_TOP_LEVEL_KEYS` in `hooks/lib/config.ts`.

**Verification:** `cd hooks && npx vitest run lib/__tests__/config.test.ts` — exit 0 (43 passed). Both files parse; identical outside `orchestrator`.

**Not touched:** the issue record (step 13b, coder). No commit.

**Status:** Complete
