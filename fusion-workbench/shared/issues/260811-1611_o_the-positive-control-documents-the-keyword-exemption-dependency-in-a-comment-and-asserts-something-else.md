# The positive control documents the keyword-exemption dependency in a comment and asserts something else

---

**Severity:** Medium — the commit states the dependency is "asserted by the positive control instead of sitting latent"; it is not asserted, and narrowing the exemption leaves the control green
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `hooks/lib/__tests__/commit-message-path.test.ts:225-231` (the positive control's new assertion), `:190` (the exemption the dependency is on)
**Cross-references:**
`shared/issues/260811-1410_c_the-commit-message-path-gate-narrowed-with-the-classifier-it-reuses-and-no-longer-catches-a-prescription-inside-a-store.md` (the finding `3b30f5e` closed);
`shared/issues/260811-1149_o_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md` (the open record the dependency lands on)

---

## What is wrong

`3b30f5e` widened `workbenchMessagePaths()` by reaching `hasCommitMessageName` instead of
`classify()`. That is the right call and the export is the right shape. The widening has a stated
cost: a prompt line citing a record whose slug says "commit message" is now flagged, and the only
thing keeping `it("finds none")` green is the line-level keyword exemption at `:190`:

```ts
if (/Never inside|never inside|leftover|Measured|improvised|fault/.test(line)) continue;
```

The commit message says: *"its dependency on the keyword exemption is now asserted by the positive
control instead of sitting latent, so whoever answers `1149` meets it instead of discovering it."*

The assertion that was added is:

```ts
expect(workbenchMessagePaths(`see \`${cited[1]}\` for the record`)).toEqual([cited[1]]);
```

That asserts the **name test flags a record citation**. It says nothing about the exemption. The
fixture it builds carries none of the six exemption keywords, so it exercises the path where the
exemption does not apply. And the claim it makes is already made one test above, by
`it("negative control: a prescription INSIDE a store fails it too")`, which asserts the same helper
flags `fusion-workbench/shared/consult/commit-message.txt`.

## Measured

Which shipped prompt lines the widened helper flags, and what spares each — the helper's pattern and
the exemption regex applied over `agents/*.md` and `skills/*/SKILL.md`:

```
agents/orchestrator.md:418   hits=fusion-workbench/.commit-msg-tmp   exempt=leftover
skills/commit/SKILL.md:88    hits=fusion-workbench/.commit-msg-tmp   exempt=leftover
```

Two lines, one keyword. Drop `leftover` from the exemption — a plausible outcome of answering
`260811-1149`, which is filed against that regex being *too broad* — and `it("finds none")` turns
red with the message *"a shipped prompt names a commit-message file inside fusion-workbench/ without
marking it as the defect"*, while the positive control stays green. Whoever answers `1149` discovers
the dependency from a failure in a different test, which is exactly the outcome the commit says was
avoided.

## Why it matters beyond the wording

The comment beside the assertion is accurate and useful. But a comment is not a gate, and this file's
own header states the standard it is being held to: *"The negative controls call the SAME helpers as
the assertions above them, with a fixture in place of the real file — never a re-implementation of
what they claim to test."* The dependency is on a **real line in a real shipped prompt**, and nothing
reads that line under both predicates.

## Suggested direction

Assert both halves over the real lines, not over a synthetic string. Lift the exemption regex out of
`it("finds none")` into a named constant the control can reach, then assert:

1. `workbenchMessagePaths(line)` is non-empty for `agents/orchestrator.md:418` and
   `skills/commit/SKILL.md:88` — the widening reaches them;
2. the exemption matches both of those lines — the exemption is what spares them;
3. the count of lines flagged-and-not-exempted is 0 — which is `it("finds none")` restated over the
   same two predicates, so a change to either one fails here with the dependency named.

Failing that, at minimum assert `EXEMPTION.test(realLine)` for the two lines, so removing `leftover`
fails a test whose message says why.

## Acceptance criteria

- [ ] A test fails, with a message naming the keyword exemption, if the exemption stops matching the
      lines the widened helper flags in `agents/` and `skills/`.
- [ ] The new assertion is made against lines read from the shipped prompts, not against a fixture
      string built in the test.
- [ ] `cd hooks && npm test` exits 0.
