The newest decision record carries no Answered/Implemented footer block, so its next transition has nowhere to land

---
`260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`
ends after its `## Recommendation` section. The four-line footer block the decision-record template
mandates — `Answered:`, `Implemented:`, `Deferred:`, `Superseded by:` — is absent. The other three
decision records in this Circle all carry it.

---
**Verified, not reported.** `grep -n '^Answered:\|^Implemented:\|^Superseded'` over the four files
in `circles/260801-1244-curator/decisions/` returns hits for `260814-0738_i`, `260814-0845_i` and
`260814-1332_o`, and nothing for `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md_o`. `tail -20` on that file ends mid-`## Recommendation`
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

**Filed by:** reconciler, session `260813-2345-orchestrator-session.md`, Circle
`260801-1244-curator`. Filed in the Circle's own store per the Origin Rule: the record it describes
was filed by this Circle's Turn 5.

---
**Reconciliation, 2026-08-14 21:53, at HEAD `d90b794` — stands unchanged.**

`260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`
still ends with the last line of its `## Recommendation` paragraph. No `---` separator and no
`Answered: / Implemented: / Deferred: / Superseded by:` block. Read at HEAD, not inferred.

The contrast case is on disk beside it: `260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
closes with the separator and all four empty lines, which is the shape this record asks for. None of
the four commits since the record was filed touched either decision file.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged, and one thing about the template has moved since — in the record's favour.**

`grep -c '^Answered:' 260814-1915_*_should-mode-3-require-the-audit-line-…` → **0**; its three siblings at `260814-0738_i`, `260814-0845_i` and `260814-1332_i` each return 1. The file still ends mid-prose with no `---` and no four-line block.

**What changed around it.** On 2026-08-18 the decision-record head lost its `**Status:**` field (`rules/fusion-workbench-conventions.md` `## Decision Record Template`, binding decision `shared/decisions/260818-2212_*`), so the filename marker is now the state's only source — which makes the *footer* the only place a transition can be evidenced. The record's argument is stronger at HEAD than when it was filed: with the head field gone, a record without the footer block has nowhere at all to record how it moved.

Note for whoever adds the block: that same rule says a record written before the removal keeps its `**Status:**` field untouched, including through a transition. This record's subject carries one; leave it.

---
Resolved: fixed — the record now ends with the footer block: Answered and Implemented filled (the Implemented line names 30d6f0a), Deferred, Superseded by and Retired empty; its Status head field is left as it stood; cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts
