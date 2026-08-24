The session-domain helper's header claims a scope its `grep` does not have, and its skill callers print a `source=` value it never defines
---
Three header-versus-behaviour gaps in the new `bin/fusion-session-domain` (commit `1ea8fed`, step 7) and its three call sites (commit `8140cf3`, step 10).

1. The header (`bin/fusion-session-domain:36-38`) says "the key must sit two spaces deep, which scopes it to the `session:` block". The grep is `^  domain:` (`:74`), which matches the direct child of **any** top-level block. `agentstate.yaml` has three two-space blocks today (`session:`, `control:`, `plan_context:`, per `agents/orchestrator.md:1071-1102`) and only `session:` carries `domain:`, so the read is correct now and the claim is wrong as a mechanism: a `domain:` added under `plan_context:` above the `session:` block would be read as the session's. The claim was carried over verbatim from the skill-body one-liners the helper replaced.
2. A value the `sed` at `:74` cannot capture (anything not `[a-z]+`, e.g. `domain: Code`) leaves the whole line in `$domain`, so the stderr reason reads `carries session.domain=  domain: Code, which is neither code nor data` rather than naming the value.
3. The header defines `source=` as `agentstate` or `default` (`:15-16`), and `CLAUDE.md`'s Layout row repeats `source=<agentstate|default>`. All three call sites print `source=helper-missing` on the `[ -x ]` miss (`skills/next/SKILL.md:80`, `skills/direct/SKILL.md:53`, `skills/cleanup/SKILL.md:105`). That value is right to exist and is defined nowhere; the skills say "a `source=` other than `agentstate` is a fallback" so it is handled, but a reader of the header cannot learn the third value.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Fix direction: for 1, either state the true bound ("the first two-space `domain:` key in the file") or anchor the read to the `session:` block with an awk range; for 2, capture with a permissive class and validate after; for 3, add `helper-missing` to the header's `source` vocabulary as the value a caller prints when the helper itself is absent, and mirror it in the `CLAUDE.md` row.

Severity: Low.
---
Resolved: fixed — the header states the true bound (the first `domain:` key exactly two spaces deep, in whichever top-level block holds it, which only `session:` does today) instead of the `session:`-scope claim, the `sed` captures the value as itself so `domain: Code` is named as `Code`, and `helper-missing` is defined as the third `source` value a caller prints on its `[ -x ]` miss, in the header and in the `CLAUDE.md` row; `bin/fusion-session-domain:16,25-28,38-43,73-75`, `CLAUDE.md` `bin/fusion-session-domain` row
