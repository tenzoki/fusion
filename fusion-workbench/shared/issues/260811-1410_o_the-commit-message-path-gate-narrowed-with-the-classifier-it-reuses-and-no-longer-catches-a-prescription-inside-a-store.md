# The commit-message-path gate narrowed with the classifier it reuses, and no longer catches a prescription inside a store

---
**Severity:** Low — a backstop lint lost coverage as a side effect of a fix to a different mechanism; the prescription itself is still pinned by three other assertions
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `337c01b`)
**Affects:** `hooks/lib/__tests__/commit-message-path.test.ts:83-91` — `workbenchMessagePaths()`
**Cross-references:** `shared/issues/260811-1141_c_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md` (the fix that caused this); `hooks/lib/staging-drift.ts:304-390` (`classify`)

---

## The defect

`workbenchMessagePaths()` reaches through the shipped `classify()` rather than transcribing its
pattern — the right instinct, and the reason `260810-0510`'s trap was avoided here. But the two
callers ask different questions:

- **`classify()`'s question** — "is this file on disk a leftover commit message?" The answer since
  `337c01b` is decided by location first: a path a store owns is a `record`, whatever its name.
- **the gate's question** — "does a shipped prompt PRESCRIBE writing a commit message inside the
  workbench?" That is a question about the prompt's instruction, and it is not the same question.

Because the gate reuses the first predicate to answer the second, a prompt line naming
`fusion-workbench/shared/consult/commit-message.txt` — or any store path — is now classified
`record` and passes silently. Before `337c01b` the same line was flagged.

## The trade is documented, and the documentation is where the assumption sits

`commit-message-path.test.ts:72-81` states the narrowing and defends it:

> What this gate exists to catch is a prompt PRESCRIBING a message file inside the workbench, and
> the place a prescription puts one is where no store owns it.

That last clause is an assumption about where a future improvisation will land, not a property of
the mechanism. The improvisation this whole family exists because of — `fusion-workbench/.commit-msg-tmp` —
landed at a path no helper named and nobody predicted. Predicting the *next* one's directory is
the same shape of guess.

## Severity note

Low, for two reasons. The prescription is separately pinned by three assertions that do not go
through `classify()` (`:94-106`, `:108-114`, `:125-132`), so a prompt that stopped naming a `/tmp`
path still fails the suite. And the run-time half — `staging-drift.ts` measuring the actual tree —
is the enforcement; this file is the backstop.

## Fix direction

Give the gate its own predicate for its own question: the `COMMIT_MESSAGE` name pattern applied to
a workbench path, with no store scoping, exported from `lib/staging-drift.ts` beside `classify()`
so the two still cannot disagree about *what counts as a commit-message name* while disagreeing
about what to do with one. The positive control at `:182-197` then keeps asserting `classify()`'s
narrower answer, which is what it is actually about.
