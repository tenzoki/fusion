The division rule says what applies it restates none of it, and `agents/curator.md` restates three of its clauses

---

`rules/context-lean-claude-md.md:181` states, as a fact about the tree, that the two surfaces applying the heading division restate none of it. `bin/fusion-claude-md-weight` obeys. `agents/curator.md:309` restates three clauses of it.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** At `7ea6e40b`.

`rules/context-lean-claude-md.md:181-186`:

> **This section is where that division is authored, and what applies it restates none of it.** `bin/fusion-claude-md-weight` implements exactly the rule above and prints the level it picked as `heading-level=` … `agents/curator.md` classifies placement per passage as divided here.

`bin/fusion-claude-md-weight:81-86` holds to it in as many words: *"THE RULE THAT PICKS IT IS NOT RESTATED HERE, and a second statement of it here would be the defect this header used to carry."*

`agents/curator.md:309`, rewritten in this range:

> One line per **passage** of the surface a passage is leaving — the passage as Step 1 of the placement criterion divides it, **by one heading level picked once for the whole file, which is not always its top one, and with whatever stands above the first heading of that level counting as a passage of its own**: …

That is three clauses of Step 1 restated: the one-level-per-file rule, the not-necessarily-top qualification, and the preamble-is-a-passage rule. Each is true today, so nothing is currently wrong downstream — what is wrong is the rule's own sentence, which asserts that no such restatement exists.

**Why it matters.** `260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md` was filed because three surfaces stated this rule and two disagreed. The repair made the rule authoritative and stripped the helper's copy. A third surface kept a partial copy, and the sentence declaring the repair complete is the one that is false.

**Acceptance test.** Either `agents/curator.md:309` names Step 1 and states none of its mechanics, or `rules/context-lean-claude-md.md:181` stops claiming that nothing restates it and says instead what a restatement owes. Whichever lands, the rule and the prompt agree in the same commit, as `260916-1316_*`'s own test required of its pair.

**Cross-references:** 260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md

---
Resolved: the placement-classification bullet in `agents/curator.md` now names `rules/context-lean-claude-md.md` `### Step 1 — divide the file by heading, before judging anything` and restates none of its three clauses (the first of the two routes the acceptance offered, so the rule's "what applies it restates none of it" holds as written); the commit that carries this line.
