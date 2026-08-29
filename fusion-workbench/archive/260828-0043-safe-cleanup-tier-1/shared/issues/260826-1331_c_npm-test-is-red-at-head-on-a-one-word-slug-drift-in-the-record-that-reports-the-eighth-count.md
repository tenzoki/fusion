`npm test` is red at HEAD on a one-word slug drift, in the record that reports the eighth wrong count

---

`hooks/lib/__tests__/workbench-citation-lint.test.ts` fails at `69e7e5a`. One live workbench record
cites the C4 cardinality decision as `how-should-this-project-keep-…` where the record on disk is
`how-does-this-project-keep-…`. Line 15 of that same file spells it correctly; line 59 does not.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Nothing runs wrongly, but the suite is red for everybody until it is fixed, and
a red suite that everybody knows about is how the next real failure gets waved through. The gate
carries no baseline by design, so there is nothing to re-approve — the citation is the thing to fix.

**Found outside the reviewed range.** This pass covered `7774d56..e66f7d5`, where the suite was green
(44 files, 776 tests, recorded in that commit's own verification line and in
`260826-1200-coder-z2-the-three-remaining-counts.md`).
The failing record was added by `312b1ff`, two commits later. It is reported here because it is red
now.

## The failure

```
FAIL lib/__tests__/workbench-citation-lint.test.ts
  > passes on the whole corpus — no dangling citation in any live record

  shared/issues/260826-1305_o_the-closure-note-reporting-seven-wrong-counts-states-an-eighth-in-the-paragraph-that-reports-them.md:59
    'circles/260825-2023-presence-travels-monitor-filters-own-checkout/decisions/260826-1252_*_how-should-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md'
    no record in the workbench matches this citation
```

`hooks/lib/__tests__/committed-dist.test.ts` passes; this is the only failure in the suite.

## The drift

The record on disk is
`260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`.

Inside the one file that fails:

- line 15 carries the slug beginning `how-does-this-project-keep` and resolves.
- line 59 carries the same stamp and store with the slug's first word spelled `should` instead of
  `does`, and resolves to nothing. The verbatim form is in the failure block above.

One word, `does` to `should`, in the second of two citations of the same record in the same file.
Every other citation of it in the tree (`portfolio.md` three times, the Circle record, and
`260826-1315_*_…`) uses the correct slug.

**Fix direction.** Correct line 59 to `how-does`. Nothing else moves: the marker position is already
wildcarded, the store prefix is right, and the gate is a pointer check with no count to re-approve.

**Scope.** `260826-1305_*_…md:59`. Workbench record only, no shipped
text, no behaviour.

---
Resolved: commit `3f62a7d` corrected line 59 of `260826-1305_*_the-closure-note-reporting-seven-wrong-counts-states-an-eighth-in-the-paragraph-that-reports-them.md` from `how-should` to `how-does`; both citations in that file now carry the resolving slug (its lines 15 and 59). Re-measured 260827-1528-reconciliation.md in the working tree: `npx vitest run lib/__tests__/workbench-citation-lint.test.ts` passes, 10 of 10. This retakes the measurement the active Circle's Grounding said to retake at activation.
