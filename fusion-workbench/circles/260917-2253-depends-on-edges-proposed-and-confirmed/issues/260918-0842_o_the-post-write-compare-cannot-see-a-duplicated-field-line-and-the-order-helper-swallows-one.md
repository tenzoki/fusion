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
