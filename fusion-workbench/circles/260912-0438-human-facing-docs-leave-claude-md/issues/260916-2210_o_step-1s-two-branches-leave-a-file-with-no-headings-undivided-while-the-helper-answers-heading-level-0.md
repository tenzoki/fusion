Step 1's two branches leave a file with no headings undivided, while the helper answers `heading-level=0`

---

`rules/context-lean-claude-md.md` `### Step 1` picks the division level in two branches: the shallowest level with at least two headings, else the shallowest level present at all. A `CLAUDE.md` with no headings falls through both. `bin/fusion-claude-md-weight` answers it anyway.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** `rules/context-lean-claude-md.md:151-158`:

> 2. Take the **shallowest level that has at least two headings**. …
> 3. Where no level has two, take the **shallowest level present at all**.

With no heading at any level, branch 2 finds none and branch 3 has no level to take. The section claims completeness for the split — *"the passages sum to the file with nothing left over"*, *"it still gives every reader the same division"* — which `rules/critical-stance.md` §4 makes a defect class rather than a rough edge.

The helper answers: measured at `7ea6e40b` against a scratch root whose `CLAUDE.md` is 5 022 bytes of prose and no headings,

```
bytes=5022 lines=3 headings=0 heading-level=0
  over      5022      3  (preamble)
```

which is the sensible answer — the whole file is one passage — but it is the helper's answer, not the rule's, and `rules/context-lean-claude-md.md:181-186` says the helper implements the rule and *"if code and rule ever disagree the rule is right"*. Here the rule is silent, so the reader following it gets nothing and the tool gets something.

The three shapes the rule does claim were each run and each hold: a lone `# ` title over two `## ` gives `heading-level=2` with the title in the preamble; one `## ` over three `### ` gives `heading-level=3`; a file where no level has two gives `heading-level=1` and one passage. Only the empty-of-headings case is open.

**Acceptance test.** `### Step 1` names the no-heading case and the division it produces, and the answer it names is the one `bin/fusion-claude-md-weight` prints for such a file. Proved by running the helper against a heading-less scratch `CLAUDE.md` and reading the rule's own branch for it.

**Cross-references:** 260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md
