`other_checkouts` counts two different sets depending on whether the reading person resolved, and its interface comment describes only one of them

---

When the reading person is known, `other_checkouts` counts only the further checkouts of that person. When it is not, the same key counts every other checkout. The field's own doc comment states the second reading unconditionally, so it is false in the ordinary case.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium

**Evidence.** `hooks/lib/events-query.ts:188-190`:

```ts
  /** Distinct other checkouts, whoever they turn out to belong to. */
  otherCheckouts: number;
```

`:271-282` computes it. A party of kind `person` goes into `people` and into nothing else; only `checkout` and `unknown` parties reach `checkouts`. Measured over one fixture log holding four other parties, three of them other people and one a further checkout of the reader:

```
identity.person known    -> other_people=3   other_checkouts=1
identity.person null     -> other_people=null other_checkouts=4
```

**Which half is right.** The **code** is right and the comment is wrong. The plan's `## API Changes` example prints `other_people=1 other_checkouts=1` over exactly one other person and one further checkout of the reader, and step 6 asks the two surfaces to render "the count of other people, the count of further checkouts of the reading person, reported separately". The implementation matches the plan.

**What is still unstated anywhere.** That the key's denotation changes with the exit code. `bin/fusion-events:68-70` says exit 4 prints `other_checkouts` and not `other_people`; it does not say that `other_checkouts` then means something wider than it meant at exit 0. A skill body rendering both surfaces (plan step 6) will read the same key across both branches.

**Fix direction.** Correct the comment at `hooks/lib/events-query.ts:188-190` to say what is counted — further checkouts of the reading person, plus every unclassifiable party when the reading person could not be read — and add one clause to the exit-4 row of the `bin/fusion-events` header saying the key widens there.

**Scope.** `hooks/lib/events-query.ts`, `bin/fusion-events` header, and the renderer plan step 6 has yet to write.

---
Resolved: the doc comment on `PresenceReport.otherCheckouts` now says what is counted — the reading person's **further checkouts**, and, where the reading person could not be read, every other checkout, because none of them can then be told from one of the reader's own — and names `otherPeople === null` as exactly when the wider reading applies. The exit-4 row of the `bin/fusion-events` header gained the same clause, so a skill body rendering both branches (plan step 6) reads it in the one place the header is authoritative.

No code change. The record's finding stands unaltered: the code matches the plan and the comment did not match the code.
