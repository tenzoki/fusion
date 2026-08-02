The `user-facing-output.md` prose test asserts a fact about the corpus, not about the gate

---

**Severity: Low.** No false pass. One assertion can fail without a defect existing, and
its comment describes work the fixture does not do.

**Evidence.** `hooks/lib/__tests__/provenance-header-lint.test.ts:206-221`.

**(a) The comment is wrong about what the fixture proves.** Lines 207-210:

> The line above is rejected on three independent grounds — case, the missing colon, and
> position. The first two are asserted by the fixture; this asserts the third against the
> real file.

The fixture is the `REJECTED` entry at `:190-197`, which begins:

```
> The next orchestrator session will pick up the Turn loop against this Circle's ...
```

`HEADER` is `/^ {0,3}(?:> ?)?(?:\*\*)?Provenance:(?:\*\*)?(?=\s|$)/`. After the optional
`> `, the pattern requires the literal keyword and finds `The`. The match dies at the
anchor. Case and the colon are never reached: rewrite `provenance markers` mid-line as
`Provenance: markers` and the fixture still returns `null`, for the same reason.

Case and the missing colon *are* covered, by the two dedicated one-line fixtures at
`:186-187`. Anchor rejection is covered at `:189` ("the keyword mid-sentence"). The
corpus-prose fixture is a third copy of the `:189` case wearing a longer string.

**(b) The surviving assertion is about the corpus.** Line 219:

```ts
expect(at + 1).toBeGreaterThan(HEADER_WINDOW);
```

`at` is the index of the prose in the real `rules/user-facing-output.md` (currently line
180). The assertion says that file's quoted example sits below line 10. That is a property
of a style rule's illustrative prose, not of `headerLine`. Move the example above line 10
and the test fails while the gate remains exactly correct, because the anchor rejects the
line at any position. A test that fails on a correct change is a maintenance tax the gate
does not need.

**What already does this job properly.** The conventions-file test at `:300-329`. Its
decoy is `rules/fusion-workbench-conventions.md:569`, `**Provenance:** <citation>`, which
genuinely matches `HEADER` and is excluded by position alone. That test also guards
against going vacuous (`:318-323`). It proves the position rule; the
`user-facing-output.md` test does not add to it.

**Fix.** Keep the drift guard, drop the corpus assertion, correct the comment:

- Keep `expect(at).toBeGreaterThanOrEqual(0)` at `:214-218`. It stops the `REJECTED`
  fixture claiming to be "the real corpus prose" after the corpus stops containing it.
  That value is real.
- Delete `:219`.
- Keep `:220` (`headerLine(...) === 3`) or drop it; the corpus test at `:121` already
  covers every file's header.
- Rewrite `:207-210` to say what is true: the line is rejected because the keyword does
  not open it. Case and the colon are covered by the fixtures at `:186-187`.
