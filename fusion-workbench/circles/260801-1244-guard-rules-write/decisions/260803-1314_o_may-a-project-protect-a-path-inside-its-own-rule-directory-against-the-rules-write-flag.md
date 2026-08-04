# May a project protect a path inside its own rule directory against `FUSION_ALLOW_RULES_WRITE`?

---
**Domain:** code
**Status:** open
**Filed by:** coder, closing `260802-2231` (T3-2) in `circles/260801-1244-guard-rules-write`
**Cross-references:** `circles/260801-1244-guard-rules-write/issues/260802-2231_c_stated-exempt-boundary-is-narrower-than-the-implemented-one-for-whole-subtree-deletes.md` `## Adjacent, for Turn 2` (where the question was raised); `hooks/lib/rules-write-exemption.ts` `RULE_DIR_PATTERNS`; `circles/260801-1244-guard-rules-write/decisions/260802-1912_a_does-the-self-protection-floor-apply-before-the-config-file-exists.md` (the floor this would sit next to); plan Step 6 (project-configurable `protectedPaths`)

---

## Question

`RULE_DIR_PATTERNS` in `hooks/lib/rules-write-exemption.ts` is a hardcoded constant, `["rules/**", ".claude/rules/**"]`, while plan Step 6 makes `protectedPaths` project-configurable through `fusion-guard.json`. Once a project can write its own protected list, two consequences follow that nothing currently answers.

**The exemption outranks a project's own protected entry.** A project that deliberately adds `rules/immutable/**` to its `protectedPaths` finds the flag exempts it anyway, because `rules/immutable/x.md` matches `rules/**` and the exemption never consults the project's list. Measured shape, not yet measured against Step 6's code, which does not exist at the time of filing: the exemption is asked only about paths the protected list already matched, and it answers from its own constant.

**A project whose rules do not live in `rules/` gets no exemption, and nothing tells it why.** The flag is documented as "set this to curate rules"; in such a project it is silently inert, which is the same failure mode T3-2 closed on the diagnostic side for hard links and `..` spellings.

The question has to be answered wherever the effective protected list is assembled, which is Step 6, and it is a security property rather than an implementation detail — which is why it is recorded rather than settled in a docstring.

## Options

1. **Keep `RULE_DIR_PATTERNS` fixed; the flag names two well-known directories and nothing else.**
   - Pros: the exempt set is readable without opening the project's configuration, and no project can widen the grant by editing a file the guard reads. The exemption stays a claim about fusion, not about a project.
   - Cons: a project cannot carve out an immutable subtree inside `rules/`, and a project with a differently-named rule directory has a flag that does nothing.
2. **Subtract the project's own protected entries from the exempt set.** An entry a project adds explicitly (`rules/immutable/**`) wins over the exemption; the two default rule patterns keep working as they do now.
   - Pros: answers both consequences with one rule, and matches the intuition that a list a project wrote by hand outranks a flag it set in a shell. Natural neighbour of the self-protection floor decided in `260802-1912`.
   - Cons: the exempt set becomes a function of the project's configuration, so "what does the flag reach" is no longer answerable from the plugin alone. Needs a precedence rule precise enough to test.
3. **Make the rule roots configurable too**, alongside `protectedPaths`.
   - Pros: covers the differently-named-rule-directory project.
   - Cons: a project could widen its own grant, which is the direction a guard may not move without the user knowing. The self-protection floor exists because that direction was already judged dangerous once in this Circle.

## Constraints

- Whatever is chosen must not let a project's own configuration WIDEN the grant without a decision the user makes deliberately; narrowing it is the safe direction.
- The answer must be stated where the user reads it (`README-hooks.md`, `rules/protected-path-discipline.md`), not only in this record. The flag being silently inert is the failure this Turn spent two findings on.
- The exemption is consulted only for paths the protected list already matched, so any precedence rule has to be expressed at that seam rather than by rewriting `RULE_DIR_PATTERNS` at load time.

## Recommendation

None yet, and deliberately: the question belongs to Step 6, which is where the effective list is assembled and where the cost of each option becomes measurable. Recorded now because closing `260802-2231` would otherwise take the question with it.

---
Answered:
Implemented:
Deferred:
Superseded by:

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Genuinely unanswered; the question's precondition still does not exist.**

`RULE_DIR_PATTERNS` is still the hardcoded `["rules/**", ".claude/rules/**"]` in `hooks/lib/rules-write-exemption.ts`, and `protectedPaths` is still not project-configurable: `hooks/lib/config.ts:34` resolves a single plugin-side source at module load. Both consequences this record names are therefore still hypothetical, exactly as it says.

Searched for an answer across `circles/260801-1244-guard-rules-write/analyses/` (empty), `shared/analyses/`, both planning stores, and both decision stores. Nothing addresses it. The record's own `## Recommendation` declines to recommend, deliberately, and defers to plan Step 6.

**Cross-reference confirmed live.** Plan Step 6 of `planning/260802-1856_o_plan-guard-rules-write.md` is the step this record hands the question to, and it is unstarted. Whoever picks up Step 6 inherits this decision as an input, not as a note to read afterwards.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_o_`, unchanged. The precondition still does not exist.**

`RULE_DIR_PATTERNS` is still the hardcoded `["rules/**", ".claude/rules/**"]` in `hooks/lib/rules-write-exemption.ts`, and `protectedPaths` is still not project-configurable (`hooks/lib/config.ts:34`). Plan Step 6, which this record defers to, is unstarted at HEAD `cc012fc`. Searched both analysis stores, both planning stores and both decision stores for an answer; there is none, exactly as the previous reconciliation found.
