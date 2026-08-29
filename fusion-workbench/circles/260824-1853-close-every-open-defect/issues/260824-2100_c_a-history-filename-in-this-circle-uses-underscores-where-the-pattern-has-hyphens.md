A history filename in this Circle uses underscores where the pattern has hyphens
---
`260824-2042-coder-p-7b-session-domain-layout-row.md` is the one of nineteen history files in the Circle that does not match `YYMMDD-HHMM-<topic>.md` (`rules/fusion-workbench-conventions.md` `## Filename Patterns`: history files carry no marker). The `_coder_` segment is harmless to the marker regex, which wants a single letter, but a glob or sort over `YYMMDD-HHMM-` prefixes skips it.
---
**Filed by:** ontorev
**Attribution backfilled 260825 (not written by the filing agent):** `ontorev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Low
**Domain:** data
**Affects:** the file named above
**Cross-references:** commit `1ea8fed`

Fix: `git mv` to `260824-2042-coder-p-7b-session-domain-layout-row.md`.
---
Resolved: fixed — history file renamed to the pattern form; 260824-2042-coder-p-7b-session-domain-layout-row.md
