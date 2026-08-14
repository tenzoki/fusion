The newest decision record carries no Answered/Implemented footer block, so its next transition has nowhere to land

---
`circles/260801-1244-curator/decisions/260814-1915_o_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`
ends after its `## Recommendation` section. The four-line footer block the decision-record template
mandates — `Answered:`, `Implemented:`, `Deferred:`, `Superseded by:` — is absent. The other three
decision records in this Circle all carry it.

---
**Verified, not reported.** `grep -n '^Answered:\|^Implemented:\|^Superseded'` over the four files
in `circles/260801-1244-curator/decisions/` returns hits for `260814-0738_i`, `260814-0845_i` and
`260814-1332_o`, and nothing for `260814-1915_o`. `tail -20` on that file ends mid-`## Recommendation`
with no separator and no footer. `rules/fusion-workbench-conventions.md` `## Decision Record
Template` shows the block as the closing element of the body.

**Why it is worth a record and not a silent repair.** The footer is where the `_o_→_a_→_i_` walk
writes its evidence, and the reconciler's own contract is to append `Answered:` and `Implemented:`
lines there. A record with no block invites the next pass to either invent the block, which is
authoring, or skip the record, which is how a decision goes stale unnoticed. Adding the block is a
one-edit fix; deciding that a record may ship without one is a change to the template. This record
does not make that change.

**What it is not.** Not a defect in the decision's content: the question, the three options, the
constraints and the recommendation are all present and were written this Turn against a live
measurement. Only the transition surface is missing.

**The fix.** Append the four-line block, empty, after a `---` separator, in the shape the template
gives and the three sibling records carry.

**Filed by:** reconciler, session `shared/history/260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the record it describes
was filed by this Circle's Turn 5.
