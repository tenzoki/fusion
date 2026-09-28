The presence party sort is not total, and the comment beside it claims it is

---

`measurePresence` sorts parties by timestamp and breaks ties on `checkout`. Parties are keyed by the **pair** of person and checkout, so two parties can share a checkout. Two such parties sharing a timestamp compare equal, and their order then follows their position in the file — which is the input this whole module exists to stop reading.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low

**Evidence.** `hooks/lib/events-query.ts:264-269`:

```ts
  // Most recent first, then by checkout so the order is total and a test can
  // assert it.
  parties.sort((a, b) => {
    const d = (parseTs(b.ts) ?? 0) - (parseTs(a.ts) ?? 0);
    return d !== 0 ? d : a.checkout.localeCompare(b.checkout);
  });
```

The key is the pair (`:244`), not the checkout. Measured over two `session_start` lines with one timestamp, one checkout and two persons:

```
input order 0,1 -> Alpha <a@x> | Beta <b@x>
input order 1,0 -> Beta <b@x>  | Alpha <a@x>
```

**Why it is worth fixing despite being unreachable in practice.** The condition needs one checkout to have changed hands and two `session_start` lines in the same second, so nothing in a real log will hit it. What will hit it is plan step 10, which is written against this comment: a test asserting party order believes the comment's promise of totality.

**Fix direction.** Add `person` as the last tie-break, matching the key the map is built on: `a.checkout.localeCompare(b.checkout) || (a.person ?? "").localeCompare(b.person ?? "")`. One clause, and the comment becomes true.

**Scope.** `hooks/lib/events-query.ts`.

---
Resolved: the tie-break now falls through to `person` after `checkout`, which is the whole of the pair the party map is keyed on, so the order is total and the comment beside it is true. The comment was rewritten at the same time to name the key rather than to claim the property, and to say what the old form fell back on — position in the file, which is the one input this module exists to stop reading.

Measured with the record's own fixture, two `session_start` lines sharing one timestamp and one checkout and carrying two persons:

```
input order 0,1 -> Alpha <a@x> | Beta <b@x>
input order 1,0 -> Alpha <a@x> | Beta <b@x>
```

Before the change the second line was the first reversed. Plan step 10 can now assert order against a comment that holds.
