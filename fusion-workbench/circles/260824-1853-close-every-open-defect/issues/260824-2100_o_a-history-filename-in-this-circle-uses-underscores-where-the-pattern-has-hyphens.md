A history filename in this Circle uses underscores where the pattern has hyphens
---
`circles/260824-1853-close-every-open-defect/history/260824-2042_coder_p-7b-session-domain-layout-row.md` is the one of nineteen history files in the Circle that does not match `YYMMDD-HHMM-<topic>.md` (`rules/fusion-workbench-conventions.md` `## Filename Patterns`: history files carry no marker). The `_coder_` segment is harmless to the marker regex, which wants a single letter, but a glob or sort over `YYMMDD-HHMM-` prefixes skips it.
---
**Filed by:** ontorev
**Severity:** Low
**Domain:** data
**Affects:** the file named above
**Cross-references:** commit `1ea8fed`

Fix: `git mv` to `260824-2042-coder-p-7b-session-domain-layout-row.md`.
