The post-write compare claims a class it cannot see, and the order helper swallows that class silently

---

`### Pass 2 — apply` names "a duplicated field line" among the four defects the byte-for-byte post-write compare catches. The compare is specified over one line and cannot see a second one. `headField()` in `hooks/lib/work-graph.ts` returns the first match and ignores the rest, so the confirmed edge disappears from `bin/fusion-work-order` with no error anywhere.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## The defect

`agents/curator.md` `### Pass 2 — apply`, last bullet of the edge exception:

> **The post-write compare is byte for byte against a text you compute at write time** — the line as found plus `, <basename>`, or the whole new field line where you created it. Re-read that line from disk and compare it to that text; any difference is `failed`, naming both. A membership test over basenames is **not** this check and does not replace it: it passes a doubled comma, a lost space, a trailing separator and a duplicated field line, which is the entire class the post-write compare was filed for

Three of those four are differences *within* the line the compare re-reads, and it catches them. The fourth is not: a duplicated field line is a second line elsewhere in the head block. The procedure says "re-read **that line** from disk" — with two lines carrying the field name there is no *that line*, and whichever one the agent reads, a match passes the compare while the record carries a duplicate.

This is the one member of the list that the edge case introduced, and it is the one the mechanism does not cover.

## Why it is not cosmetic

`hooks/lib/work-graph.ts`, `headField()`:

```ts
function headField(head: string[], name: string): string | null {
  const re = new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.*)$`);
  for (const line of head) {
    const m = re.exec(line.trim());
    if (m) return m[1].trim();
  }
  return null;
}
```

First match wins, later lines are dropped without a diagnostic. So a duplicated `**Depends-on:**` line leaves `bin/fusion-work-order` reading only one of the two, and the user-confirmed edge that landed in the second is absent from the order with nothing reporting it — the silent-loss failure mode the post-write compare was filed to close (`260815-1943_*_the-curators-applied-text-carries-two-characters-the-approved-text-did-not.md`).

The absent-field write is the majority path (four of seven records carry no `**Cross-references:**` line, six carry no `**Depends-on:**` line — verified), which is the path on which a duplicate is produced rather than merely inherited.

## Acceptance test

After an approved edge write, the record carries exactly one line matching `^\*\*<field>:\*\*` in its head block, and the apply pass marks the entry `failed` when it does not. State the uniqueness check in the compare bullet so it is performed rather than implied.

Resolved: **the check was widened, not the claim narrowed.** Dropping "a duplicated field line" from the list would have left the class undetected, and the class is the silent-loss failure mode the compare was filed against in the first place — so the fix is to make the compare see it.

`agents/curator.md` `### Pass 2 — apply`, the post-write compare bullet now reads the head block rather than one line: "**count the lines whose field name matches this entry's first: anything but exactly one is `failed`, naming the count**; then compare that one line to the computed text". The bullet says why the count is part of the check and not a nicety — three of the four defects are differences inside the line, the fourth is a second line no single-line comparison can see, and `headField()` in `hooks/lib/work-graph.ts` then hides it by returning the first match and dropping the rest with no diagnostic, losing the user-confirmed edge out of `bin/fusion-work-order` in silence. The count is taken on every entry rather than only where a line was already there, because the created-field write is the majority path and the one that produces a duplicate rather than inheriting one.

The `applied`-with-nothing-written branch would have escaped a post-write-only count, so **precondition 3 carries it too**: "**Presence means exactly one line** — two lines matching the field name is `stale`, naming the count, and no branch below is defined on a record carrying two." That closes the entry-writes-nothing path and states the precondition the four write branches were already assuming.

The helper was weighed and left alone, and the reason is stated rather than skipped. A diagnostic there means a new report field on `WorkGraphReport`, a new printed line in `hooks/order.ts`, and a test — against 26 free lines on the hook-test bound and a change to `bin/fusion-work-order`'s printed contract in a release-prep window. The curator-side checks close the only agent route that produces a duplicate, which is the route this record measures as the majority path. What remains exposed is a duplicate arriving by hand edit, and it is named here so the next reader does not take the silence for coverage. Acceptance test met on its stated terms: after an approved edge write the record carries exactly one matching line, and the apply pass marks the entry `failed` when it does not.
