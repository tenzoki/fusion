# `rules/circle-records.md` names playmaker as a resolver of the head field, and the playmaker prompt never reads it

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Affects:** `rules/circle-records.md:240` (the rewritten head-field paragraph), `agents/playmaker.md`
**Cross-references:** `260829-1225_*_which-path-shaped-tokens-does-the-storeless-form-reach-beyond-a-record-citation.md` (option 1, whose cost line names "the four prompts that write or read the fields")

---

The rewritten paragraph says: "The consumers (playmaker's `portfolio.md` rendering and the orchestrator's resume) resolve it with `find "$WORKBENCH" -name '<basename>'`". The orchestrator half is true: `rules/orchestrator-resume.md:34` carries that exact instruction since `f1099c5f`. The playmaker half is not written anywhere: `grep -n 'spec/plan' agents/playmaker.md` returns nothing at `e9f2ed0b`, and the prompt's one edit in the range is the Circle citation at line 197. Either playmaker does not read the field (then the rule names a consumer that does not exist, carried over from the paragraph it replaced, which made the same claim) or it does and now has no resolution instruction for a storeless value.

The same sentence's second consumer claim was already present before the sweep; the rewrite kept it while changing what the field holds, which is when a stale consumer claim starts to cost something.

## Acceptance

- Either `agents/playmaker.md` reads `**Active spec/plan:**` and says how it resolves the basename, or `rules/circle-records.md:240` names the orchestrator's resume alone.

Reconciled: 260829-1805, reconciler. Still open at `a60d1fea`: `rules/circle-records.md:240` still names playmaker among the resolvers of the head field; `grep -c "Active spec/plan" agents/playmaker.md` is 0. No commit since `e9f2ed0b` touches either file for this.
