Finding 17's Setup-pointer claims name the wrong agents in both halves

---

`260909-1047-size-versus-bookkeeping-across-three-projects.md` finding 17 makes two checkable claims about which agent prompts point at the record stores, both introduced by its own verification pass as corrections. Both are wrong at pin `a1ecf86e`.

**"`bugfixer` and `editor` name none."** `agents/bugfixer.md:51` names `$SCAN_ISSUES` ("a path to a `YYMMDD-HHMM*.md` file under `$SCAN_ISSUES` describing the bug"). Only `editor` names none of the three. The functional reading survives — bugfixer's mention is an input-format description, not an instruction to read the store — but the sentence as written is false and the counts around it (13 / 13 / 12 / 11) are all correct, so the exception clause is the only wrong part.

**"only `reconciler` names all three inside its `## Setup`."** Three agents name all three stores inside `## Setup`: **`analyst`, `coderev`, `consultant`**. `reconciler` names **two** there — `$SCAN_PLANS` and `$SCAN_ISSUES` at `agents/reconciler.md:16`; its `$SCAN_DECISIONS` reads sit under `## Reconciliation Process`.

The finding's direction holds — 12 of 15 agents name no store inside Setup — but its exemplar is inverted, and the qualification that follows ("The prompts say *skim*, not read") does not hold for the agent it names: `agents/reconciler.md:67` says "Read the **live** records under every directory each of these names".

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
Verified in `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` (Corrected, item C7). Command: per-agent `awk` over `git show a1ecf86e:agents/<name>.md` sectioning on `^## ` and matching `SCAN_(DECISIONS|ISSUES|PLANS)`.

---
Resolved: erratum recorded. The analysis this corrects, `260909-1047-size-versus-bookkeeping-across-three-projects.md`, is write-once and stands unchanged; the correction is on disk as `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` item C7, and the analysis's consumer `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` cites that verification. Nothing in the tree can move further, so the record closes on the erratum rather than on a fix. Survey `260921-1653-open-defect-survey-at-11-9-1.md` row 18. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 27, closed in the commit that carries this line.
