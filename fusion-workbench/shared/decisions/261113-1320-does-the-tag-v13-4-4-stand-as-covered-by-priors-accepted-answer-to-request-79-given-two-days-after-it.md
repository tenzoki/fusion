# Does the tag `v13.4.4` stand as covered by Prior's accepted answer to request 79, given two days after it?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `codec/fixtures/prior/REQUESTS.md` `## The candidate 13.4.4 (request 79)` and `### Prior's answer to 79 at 10e07d2` (fusion `e3ced136`)

---

## Question

Request 79 set a rule for fusion itself. Under `### What fusion does with the answer` it says: "**The tag `v13.4.4` and the marketplace bump follow only on an accepted answer and the user's rulings** on the decisions under `### Stated and not asked`", and: "**the question whether to tag or bump the marketplace is put to the user before either is done**, which is the step 13.4.3 missed." It also says "until a tag, `main` takes no commit to a shipped file after D other than this file."

Measured at fusion `e3ced136` on 2026-11-13:

- The tag `v13.4.4` exists, annotated (`5136c265…`), on the remote, naming `bcb7133d6d907477d3a3070e029bc98d5b07605f`. D (`438df715`) is its ancestor, eight commits back; outside `fusion-workbench/` and the request log the tagged tree differs from D by `.gitignore` alone.
- Its creation date is 2026-11-11 12:49:57 +0100, the same second as `v13.5.0`'s. Prior's answer to request 79 is Prior `10e07d2`, 2026-11-13 12:20 +0100. The tag predates the answer by two days.
- Prior's answer is **accepted** on 79.1 to 79.4, on the digest request 79 requires, and names no defect in the delivery. It states that the hook replay was not repeated on this bundle, the one item of Prior's own five-item list left unmet. Prior's text says that what an accepted answer releases is fusion's user's ruling.
- A search of fusion's workbench finds no issue or decision that rules for the tag, and no record that the question was put to the user before it was made. That is what a search finds, not proof that it was never put.
- The two decisions request 79 tied the tag to (the `C`/`R` branch of entry v3, and the deferred fetch item) both read `open`.
- Not measured: the state of the marketplace entry.

The question is whether the tag, made against the rule's order, is now ruled to stand, and on what footing. It has to be answered because Prior has reported it as a finding in its answer, and the request log otherwise carries a rule fusion broke with nothing beside it.

## Options

1. **The tag stands, covered after the fact.** The accepted answer is ruled to be the answer the clause meant, with the unmet replay named as a limit. A passage in the request log states the order as it happened and the ruling.
   - Forecloses: treating the missing replay as a reason to hold 13.4.4 back. The two tied decisions still have to be ruled or the passage has to say the tag stands without them.
2. **The tag stands as a fact, without being called covered.** The request log states that the tag was made before any answer and against the rule, that 13.4.4 is superseded by 13.5.0, and that no claim is made that 13.4.4 was released on an accepted answer. The rule is carried to the next candidate, which gets its request before anything further is tagged.
   - Forecloses: citing 13.4.4 as a version qualified on Prior. It leaves `v13.5.0`, tagged in the same second with no bundle request to Prior at all, as the case the rule next applies to.
3. **The tag is withdrawn.** `v13.4.4` is deleted locally and on the remote.
   - Forecloses: a stable name for the bytes Prior's run of record was made on, and it rewrites a published ref that an install or a clone may already hold. A destructive act on a shared remote.

## Constraints

- `codec/fixtures/prior/REQUESTS.md` is append-only: whichever option is ruled, the statement is a passage appended at its end.
- Nothing is written in Prior's repository.
- Prior's pin has not moved at `10e07d2`; the re-pin of request 81 does not wait on this decision.
- `v13.5.0` carries the codec `36570a7c…` and the log holds no bundle request for that version. Whether that becomes a request is a separate matter the answer section names as open.
