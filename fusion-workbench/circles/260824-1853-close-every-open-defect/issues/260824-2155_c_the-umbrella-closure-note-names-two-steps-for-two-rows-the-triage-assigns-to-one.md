The umbrella closure note names two steps for two rows the triage assigns to one
---
`shared/issues/260811-1734_c_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md` closes (last section, coder, step 14) with "the routing table through `260811-1301` and `260811-1613`, which this Circle closed in steps 11 and 12 (triage rows 21 and 23)". The plan's triage table assigns both rows to S12 (`circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md:274,276`), and both records' `Resolved:` notes cite `agents/orchestrator.md` alone (`shared/issues/260811-1301_c_*:25` `:525`; `shared/issues/260811-1613_c_*:80` `:525,539`). Step 11 is `agents/*.md` except the orchestrator and touched neither record. The umbrella's own closure is sound; the pointer inside it is wrong by one step.
---
**Filed by:** ontorev
**Attribution backfilled 260825 (not written by the filing agent):** `ontorev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Low
**Domain:** data
**Affects:** `shared/issues/260811-1734_c_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md` (the `Resolved: fixed` section)
**Cross-references:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md:274,276`; `circles/260824-1853-close-every-open-defect/history/260824-2150-coder-step-14-closing-measurement.md`

Attribution: the person half of `Filed by:` is absent because the installed plugin copy (`$FUSION_PLUGIN_ROOT/bin/`) does not carry `bin/fusion-identity`; the guarded call failed with the helper missing, not with exit 4, so an identity was owed and could not be read.

Fix: append a `Corrected:` line: "steps 11 and 12" reads "step 12 (triage rows 21 and 23)".

---
Resolved: fixed — a `Corrected:` line reads the pointer as step 12 for both rows 21 and 23; `shared/issues/260811-1734_c_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md:53`
