The `/fusion:discuss` row in `README-agents.md` names the shared store for a record the resolver files in a container

---
`README-agents.md:253` says the claim register is "written to `fusion-workbench/shared/discussions/`". `$OUT_DISCUSSION` resolves into the claimed work item's container whenever one is claimed, which the spec makes an acceptance criterion.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The statement and the fact.** The new skills-table row reads:

> … against a claim register written to `fusion-workbench/shared/discussions/` from the first round onward.

`rules/workbench-path-resolution.md:109` gives `OUT_DISCUSSION` the value `<scope>/discussions`, not a literal. `hooks/lib/__tests__/fusion-paths.test.ts:216-218` pins both answers:

```
expect(parse(run(project, "discuss").stdout).OUT_DISCUSSION).toBe("shared/discussions");
claimAlpha();
expect(parse(run(project, "discuss").stdout).OUT_DISCUSSION)
  .toBe("circles/260910-1000-alpha/discussions");
```

Spec C6's last acceptance criterion is "A discussion run while a work item is claimed writes into that item's container", and `skills/discuss/SKILL.md:200` states the same. The row states the `shared/` case as the whole answer.

**Why the neighbouring rows are not the precedent.** The `/fusion:memo` and `/fusion:cadence` rows also spell `fusion-workbench/shared/…`, and those are correct: `OUT_MEMO` is a literal `shared/memos` in the key table, with no second candidate. `OUT_DISCUSSION` is scope-resolved, so the same spelling is false for it.

**Acceptance test.** The row names the store the way a scope-resolved key is named elsewhere in the file, or names both candidates. A reader of the row alone answers "where does a discussion started under a claimed work item land?" with the container. The path-literal gate does not reach `README-agents.md` (`hooks/lib/__tests__/path-literal-lint.test.ts` reads `agents/*.md` and `skills/*/SKILL.md` only), so nothing fails today and nothing will.

**Cross-references:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C6`, `### C7`

---
Resolved: The `/fusion:discuss` row in `README-agents.md` now names both candidates in the order the resolver decides them — the register is "written from the first round onward into the claimed work item's own container, or into `fusion-workbench/shared/discussions/` when no item is claimed" — which is the form `## Where the work persists` already uses for the issue and decision stores. The `shared/` path is kept as the second branch rather than dropped, so the row's path tokens are unchanged and `reference-resolution-lint.test.ts` stays at its baseline. Verification: `cd hooks && npm test` — exit 0, 942 tests over 56 files.
