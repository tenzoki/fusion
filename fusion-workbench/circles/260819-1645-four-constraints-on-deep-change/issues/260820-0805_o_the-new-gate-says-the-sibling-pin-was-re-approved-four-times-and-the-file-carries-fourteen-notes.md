# The new gate says the sibling pin was re-approved four times, and the file carries fourteen notes

---

`hooks/lib/__tests__/workbench-citation-lint.test.ts:33-34` argues for carrying no baseline by
contrasting itself with the sibling lint: "The sibling gate pins the count of what it resolved and
has had that pin re-approved four times; this one has nothing to re-approve".

`hooks/lib/__tests__/reference-resolution-lint.test.ts` carries **fourteen** re-approval notes above
`BASELINE`, plus the original approval that put the pin in. `grep -c '^// Re-approved'` returns 14;
the first is dated 2026-08-16 and the last 2026-08-20.

The argument is unaffected and is arguably stronger at fourteen than at four. What is wrong is that
the number is a measurement of the neighbouring file, stated in the design comment of a gate whose
whole justification is that a number nobody re-measures gets re-approved instead of investigated.

---

**Severity:** Low — a factual claim in a design comment, off by a factor of three and a half. It
misleads no mechanism; it does mislead the next reader trying to judge how heavily the sibling's pin
has moved.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:33-34`
**Cross-references:**
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
(option 1, the decision the sentence is arguing from)

**Verified 2026-08-20 at HEAD `bbfc912`:**

```
cd hooks && grep -c '^// Re-approved' lib/__tests__/reference-resolution-lint.test.ts
14
```

## Fix direction

Either state the count as measured, or drop the count and keep the property — that the sibling's pin
is a number somebody re-approves and this gate has none. The property is what the paragraph needs;
the count is what will go stale again on the sibling's next re-approval.
