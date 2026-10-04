# How is a later partial override of a decision recorded?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-1641_*_how-mark-partly-overridden-decision-261001-1804.md, 261001-1804_*_how-are-legacy-values-with-no-v1-counterpart-mapped-at-import.md

---

## Question

`rules/fusion-workbench-conventions.md` gives a decision five closing annotations (`Answered:`, `Implemented:`, `Deferred:`, `Superseded by:`, `Retired:`). None of them records that a later ruling replaced **part** of a decision's answer while the rest stands: `Superseded by:` (rename to `_s_`) declares the whole decision overridden and must cite a new decision, and `Retired:` covers a subject that was removed with no ruling overriding it. Issues have `Revised by:` for a reversal of a closed record's reasoning, with no rename; decisions have no counterpart, and `rules/decision-record-examples.md` shows none.

The case that surfaced it: decision 261001-1804 (legacy values at import) was realised in full at `b9d43fb1`, and three of its clauses were later replaced by the FJ04 plan's 2026-10-03 amendment (a user ruling recorded in a plan, not in a decision). The discussion 261004-1641 (claim C9) found it undecidable without a ruling on the conventions and marked that decision with the existing forms: a cross-reference and an `Implemented:` line whose summary names the later replacement.

## Options

1. **Keep the existing forms.** A partial override is stated in the summary of the record's last closing line (`Implemented:` or `Answered:`) and in `Cross-references:`, as done for 261001-1804.
   - Pros: no new vocabulary; nothing to lint; already works.
   - Cons: an override after the `_i_` transition cannot be recorded at all, since an `_i_` record takes no later header change; a reader must open the body to learn that part of the answer no longer holds.
2. **Extend `Revised by:` to decisions.** `Revised by: <citation> — <which clauses, and what replaced them>`, appended with no rename, allowed on `_a_` and `_i_`.
   - Pros: the same form for the same fact across issues and decisions; recordable after `_i_`.
   - Cons: one more annotation the citation and marker lints must read; loosens "terminal records take no later change".
3. **Require a new decision for any override.** A partial override is filed as its own decision that names the replaced clauses; the old one stays and is cross-referenced.
   - Pros: every ruling lives in a decision record; no new annotation.
   - Cons: rulings made in a plan amendment or in chat must be re-filed as decisions after the fact; more records.

## Constraints

- A terminal record (`_i_`, `_s_`) takes no later header change (conventions `:370`, `:372`).
- `Superseded by:` stays reserved for a whole override by a later decision.

## Recommendation

None given; the choice changes the shared conventions and is the user's.
