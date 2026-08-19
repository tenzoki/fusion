The voice-profile fallback is performed by the helper, so the agent cannot record it
---
`rules/fusion-workbench-conventions.md:257` requires an agent whose resolved voice profile is missing to fall back to the `-en.yaml` variant and "record a single line in its session history file noting the fallback". The agent performs neither half. `bin/fusion-rules` does the fallback itself and emits only the resolved path, so an agent receiving `chat-voice-en.yaml` cannot tell a fallback from a project that declared `en`. The obligation is unreachable as written.
---
**Found by:** curator, survey run `circles/260801-1244-curator/history/260814-1332-curator-run.md` (ledger entry L24–L28 group, entry L28)
**Owner:** `coder` — the fix is in `bin/fusion-rules`, which the curator's remit excludes.

**Verified 2026-08-14 at HEAD `ae21c87`,** `bin/fusion-rules` `emit_voice_profile()`, lines 313-320:

```sh
local profile="$stilwerk_dir/${stem}-${lang_code}.yaml"
if [ -f "$profile" ]; then
  printf '%s\n' "$profile"
  return 0
fi
if [ "$lang_code" != "en" ]; then
  local fallback="$stilwerk_dir/${stem}-en.yaml"
  [ -f "$fallback" ] && printf '%s\n' "$fallback"
fi
return 0
```

Both branches print a bare path and nothing else. The emission format is one path per line, which `rules/agent-setup.md` `## Read every emitted path` defines, so there is no channel on which a fallback signal could arrive today.

`rules/agent-setup.md:50` is consistent with the code and does not carry the defect: it covers only the case where a profile is *absent entirely* ("If a profile you expect is absent, note the absence… and proceed"), which an agent can in fact detect, because no path arrives.

**Two ways to fix it, and they are not equivalent.**

1. **Make the helper say so.** Emit the fallback as a distinguishable line, or print a note on stderr naming both the requested and the resolved variant. The rule then stands unchanged and the agent can obey it. Costs a change to the emission contract, which `hooks/lib/__tests__/rules-emission-golden.test.ts` and the `HYG-NO-REGRESS` byte-identity guarantee in `rules/context-manifest.md` both constrain — a stderr note avoids both.
2. **Move the obligation to the helper.** The helper logs nothing today and has no history file, so this means dropping the history-line requirement. That is a constraint removal and needs a decision, not a patch.

**Why the curator did not simply delete the sentence.** Deleting the history-line requirement would remove a constraint on Tier 1 evidence, which `agents/curator.md` `## Evidence tiers` forbids and the preserve list bars. The curator corrected the actor — the verified falsehood — and left the obligation standing with this record cited beside it. Closing this issue is what lets the qualification come back out of the rule.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). `emit_voice_profile()` is byte-unchanged, and the rule now cites this record beside the qualification.**

`bin/fusion-rules` still emits only the resolved path: on a missing `-de` variant it prints the `-en` one and says nothing about having fallen back. `rules/fusion-workbench-conventions.md:247` now names this very record as the tracker for the unreachable history line — which is the state the record predicted, where closing it is what lets the qualification come back out of the rule. Nothing has moved on the helper side.
