`CLAUDE.md` names three retired top-level keys in two rows, and `config.ts` now carries four
---
Commit `e31a73d` (step 6) added `churn` to `RETIRED_TOP_LEVEL_KEYS` in `hooks/lib/config.ts:359-361` and updated the module header (`:96-98`) and `config.test.ts:330-335` to four keys. Commit `f3f7895` (step 8) rewrote nine `CLAUDE.md` sentences and left both rows that enumerate the set at three: the `fusion.json` Layout row ("`RETIRED_TOP_LEVEL_KEYS` names `guard`, `decisions` and `escalation` inside the new file") and the "Where to look" row ("or one naming `guard`, `decisions` or `escalation`"). `docs/upgrading-to-v10.md`, which the second row points at, names the same three. A project that copied the plugin's old `hooks/config.json` block across, the case the `churn` entry was added for (issue `260815-1247`), gets an advisory naming a key that none of the three documentation surfaces says is retired.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Fix direction: name the fourth key in both `CLAUDE.md` rows and in `docs/upgrading-to-v10.md`'s retired-key paragraph, or replace the enumeration with a pointer at `RETIRED_TOP_LEVEL_KEYS` in `hooks/lib/config.ts`, which is what the templates row already does for its own inventory.

Severity: Low.
---
Resolved: fixed — both `CLAUDE.md` rows and `docs/upgrading-to-v10.md` name `churn` as the fourth retired key and point at `RETIRED_TOP_LEVEL_KEYS` in `hooks/lib/config.ts` for the set; `grep -n churn CLAUDE.md docs/upgrading-to-v10.md`
