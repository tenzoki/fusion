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

---

**Half-closed 2026-08-21 (coder, step 4 of `circles/260820-2051-style-rules-arrive-and-get-measured`) — STAYS `_o_`.** Option 1 landed: `emit_voice_profile` in `bin/fusion-rules` now prints one line to standard error on the fallback branch, naming the family, the requested variant and the resolved one, with standard output byte-identical in every case. The event is detectable. Two cases in `hooks/lib/__tests__/rules-voice-profile.test.ts` hold both halves of that.

**What the record still asks for is a rule edit this step's file list excludes, and it is two edits, not one.** First, the sentence in `rules/fusion-workbench-conventions.md` `## Project language` that cites this record — "It emits only the resolved path, so an agent cannot today tell a fallback from a project that declared `en`" — became false with that commit and still stands. Second, and this is the half the record's title is about: the obligation itself is gone from the rule. Commit `1a36fe4` replaced "the agent falls back to the `-en.yaml` variant of that same family **and records a single line in its session history file noting the fallback**" with the description of the defect, so the rule now refers to "the history line this rule asks for" while asking for no such line. An agent can detect the fallback and is instructed by nothing to record it.

Closing this now would assert a reachable obligation where there is no obligation. It closes when that paragraph is rewritten to state the mechanism as it stands and to put the history-line ask back, or to drop the ask deliberately — and dropping it is a constraint removal that needs a decision, exactly as this record's option 2 already says. The history log for the mechanism half is `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0035-coder-voice-profile-fallback-says-so-on-stderr.md`.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`).
**STAYS `_o_`, against plan step 4's `Closes:` line. The coder's own half-closed note was right and
is upheld on independent evidence.**

The mechanism half was measured in a scratch project rather than read out of the commit. A project
declaring `de` with only the `-en` variants present receives `./fusion-workbench/stilwerk/chat-voice-en.yaml`
on standard output and `fusion-rules: voice profile chat-voice: requested variant de is absent,
resolved to en` on standard error. The same project switched to `en` receives the same standard
output and an empty standard error. The event is detectable, exactly as option 1 of this record
proposed.

Both rule-text faults the half-closed note names still stand, re-read at HEAD:

1. `rules/fusion-workbench-conventions.md` `## Project language` still states "It emits only the
   resolved path, so an agent cannot today tell a fallback from a project that declared `en`, and
   the history line this rule asks for is unreachable until the helper says so", citing this record.
   That sentence became false at `1c1178d` and is an always-on rule every agent loads.
2. The obligation itself is gone. `1a36fe4` replaced "records a single line in its session history
   file noting the fallback" with a description of the defect, so the rule refers to "the history
   line this rule asks for" while asking for no such line.

Closing now would assert a reachable obligation where no obligation stands, which is the inverse of
the fault this record was opened on. It closes when that paragraph is rewritten to state the
mechanism as it is and either restores the history-line ask or drops it deliberately, and dropping
it is the constraint removal option 2 already says needs a decision. Fault 1 is filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0042_*_the-always-on-rule-states-two-things-about-the-voice-profile-fallback-that-stopped-being-true.md`.
