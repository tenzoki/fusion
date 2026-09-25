The German writing profile still bans "Das heißt," after the chat profile stopped doing so
---
Row 100 (`260822-0120_*_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md`) closed on the chat profile alone: `stilwerk/chat-voice-de.yaml:99` now lists `Allerdings,`. The same connective stands in the writing profile's AI01 list at `stilwerk/default-voice-de.yaml:137`, where it has no English counterpart at all (`default-voice-en.yaml:122-132` carries no "That said,"). The defect the record describes, an appositive connective German prose needs being banned as an AI phrase, is unchanged for every long-form German deliverable.
---
**Filed by:** ontorev
**Attribution backfilled 260825 (not written by the filing agent):** `ontorev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Low
**Domain:** data
**Affects:** `stilwerk/default-voice-de.yaml:137`, `fusion-workbench/stilwerk/default-voice-de.yaml:137`
**Cross-references:** triage row 100 of `260824-1905_*_plan-close-every-open-defect.md`; commit `43cdde6`

The 0120 record's `Affects:` named only the chat profile, so the closure is correct as scoped; this is the sibling instance. Fix direction: drop the entry or replace it with a real German AI marker, in both copies.
---
Resolved: fixed — AI01 in the German writing profile carries `Allerdings,` in place of `Das heißt,`, the same substitution the chat profile took at row 100, in both copies; `stilwerk/default-voice-de.yaml:137`
