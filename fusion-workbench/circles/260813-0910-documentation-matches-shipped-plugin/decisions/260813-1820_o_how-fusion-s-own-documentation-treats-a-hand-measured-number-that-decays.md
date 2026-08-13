# How does fusion's own documentation treat a hand-measured number that decays?

---
**Domain:** code
**Status:** open
**Filed by:** planner
**Cross-references:** `circles/260813-0910-documentation-matches-shipped-plugin/planning/260813-1820_o_documentation-matches-shipped-plugin.md` steps 2 and 3; `shared/analyses/260813-0828-documentation-staleness-survey.md` findings 6 and 7; `circles/260813-0910-documentation-matches-shipped-plugin/_t_circle.md` `## Grounding snapshot`

---

## Question

Three claims in `CLAUDE.md` are hand-written measurements of things that change on their own, and this Circle gives each a different treatment without a stated rule connecting them:

| Claim | Treatment in this Circle | Why |
|---|---|---|
| `CLAUDE.md:51` — "612 files since `e8988d9`" against a measured 1023 tracked workbench files | **deleted** | Directive: the sentence makes its point without a number, and the directory grows every session |
| `CLAUDE.md:29-51` — the `bin/` helper roster, ten rows against fifteen files | **gated** | mechanically derivable, and `derivable-enumerations-lint.test.ts` already derives four such enumerations |
| `CLAUDE.md:64` — "88 023 bytes per dispatch, 80 670 of shipped rule text" against a measured 93 819 and 86 466 | **partly deleted** in step 2 of the plan, keeping the historical measurement and dropping the present-tense floor | decided in the plan, not by a rule |

Three instances, three treatments, no convention. The next hand-measured number that lands in a shipped document will be decided the same ad-hoc way, and the third row above shows the cost is not hypothetical: the byte figure went stale within a day, because `rules/fusion-workbench-conventions.md` gained 1 928 bytes in seven hours on the day this record was filed.

The question is what rule decides which treatment a decaying number gets, so that it is applied rather than re-argued.

## Options

1. **Derivable numbers are gated; everything else is deleted.** If a lint can compute the value from the tree, the claim stays and gains a check. If it cannot, the number goes and the sentence is written to survive without it.
   - Pros: one criterion, disjoint and complete, and it reproduces all three treatments above without special cases — the byte floor is derivable in principle but only against a moving target, which the third option below separates.
   - Cons: a gate that must be updated at every rule edit is a maintenance treadmill, so "derivable" alone is too coarse for the byte case.
2. **Every number in a shipped document is gated or absent, with no third state.** Strictest reading of the same idea.
   - Pros: no unchecked figure can go stale anywhere.
   - Cons: over-broad. Historical measurements — "it was 10 541 bytes on every dispatch when it was removed on 260812" — are permanently true and carry the argument; gating them is meaningless and deleting them destroys the record.
3. **Split by whether the number describes a state or an event.** A number describing the *current* state of something that changes is either gated or deleted, per option 1. A number describing a *past measurement* stays, carrying its date stamp, and is never gated because it cannot go stale.
   - Pros: settles all three rows and the byte case cleanly, including why one half of one sentence stays and the other half goes. A stamp makes the claim self-limiting.
   - Cons: needs the stamp convention to be written down somewhere agents read, or the distinction is invisible to whoever writes the next sentence.

## Constraints

- Deleting a claim is a legitimate fix and must stay one. The Circle record already says the next reader would otherwise restore the tracked-file count with the right number.
- A gate whose expected value changes at every unrelated edit is worse than no gate: it trains people to update the fixture rather than to read the failure.
- Whatever is decided applies to fusion's own `CLAUDE.md` and shipped documents first. Whether it becomes advice to consuming projects is a separate question and is not asked here.

## Recommendation

Option 3, with the stamp convention written into `rules/rule-file-provenance.md` or alongside the enumeration lint's boundary comment, wherever a future author is more likely to read it. It is the only one of the three that explains why the byte-budget sentence keeps half its numbers and loses the other half, which is the case that forced this record. Option 1 is the same rule with the event class missing, and option 2 destroys the historical measurements that make several of `CLAUDE.md`'s arguments legible.

---
Answered:
Implemented:
Deferred:
Superseded by:
