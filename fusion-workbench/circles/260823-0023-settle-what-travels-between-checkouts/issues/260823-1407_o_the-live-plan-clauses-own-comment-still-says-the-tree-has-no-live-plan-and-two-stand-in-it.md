The live-plan clause's own comment still says the tree carries no live plan, and two stand in it

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:331-333`, and the dated measurement it repeats at `:151-156`
**Cross-references:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1318_*_the-readme-corpus-description-omits-live-plans-the-fifth-kind-the-predicate-selects.md`, which corrected the prose description of this same clause in the same commit

---

## What is wrong

`a2a18f9` corrected `README-hooks.md`'s corpus row to name live plans, and edited this test file forty lines above a comment that states the opposite in the present tense:

```
    // Against the predicate for the same reason: there is no live plan in this
    // tree today. Every plan outside `archive/` is `_c_`, and the one `_p_` plan
    // that exists is inside it.
```

Two live plans stand outside `archive/` at HEAD:

```
circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md
shared/planning/260822-1136_o_spec-fusion-becomes-a-multi-user-tool.md
```

Both match `LIVE_PLAN_RE` and both are in the gate's corpus today. The comment's whole purpose is to explain why the case is put to `inCorpus` rather than to the tree walk, and the reason it gives, that the tree would show nothing, is no longer the reason.

**The second instance is dated and is a weaker case.** `:151-156` says "MEASURED before it was written, 2026-08-20 at HEAD `8e7cae7`: the clause admits zero files today." That one carries its own stamp, so a reader can see it as a measurement rather than a claim about now. It is named here so a repair pass sees both and decides once, not so both are rewritten.

**Neither is a correctness fault in the gate.** The predicate is right, the assertions are right, and the suite is green (724 tests, 41 files, run at `a2a18f9`). What is wrong is a comment a maintainer would reason from, in the file this Turn opened, about the clause this Turn documented elsewhere.

## Verified

`bash -c 'ls circles/*/planning/*_o_*.md shared/planning/*_o_*.md'` at HEAD returns the two files above. `LIVE_PLAN_RE` at `:158` is `/(?:^|\/)planning\/[0-9]{6}-[0-9]{4}_[op]_[^/]+\.md$/`; both match, and neither carries a `FROZEN_PREFIXES` prefix. `npm test` from `hooks/` at `a2a18f9`: exit 0.

## Direction, not a prescription

Restate `:331-333` as what it actually justifies. The case is put to the predicate because the predicate is the thing under test and the tree is not a reliable source of every shape. Then drop the tree claim, which will go stale again on the next plan anybody opens or closes. Leave `:151-156` as a dated measurement or stamp it more visibly; do not restate a live count in either place.
