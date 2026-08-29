`rulesWriteDetail` writes "a protected rule paths" when the exemption covers more than one path
---
`rulesWriteDetail` (`hooks/lib/rules-write-exemption.ts:139-146`) picks a plural label for a
multi-path list but leaves the singular article in the surrounding sentence, so the advisory
message and the escalation entry both read:

```
Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule paths: rules/x.md, rules/retired/
```

Expected: "to protected rule paths: …" for a list, "to a protected rule path: …" for one.
---
Cosmetic, in user-visible text. It reaches `.guard-state/events.jsonl`, the escalation
record, and — once Step 5 lands — the monitor's warnings panel, so it ships in the first
thing a user reads about the new flag.

Not visible before Step 4. The write-tool caller (`hooks/guard.ts` CHECK 2) always passes
exactly one path, and the singular branch is grammatical. The Bash path is the first caller
that can pass several: `mv rules/x.md rules/retired/` exempts the source and the destination
directory, and the plural branch is reached for the first time.

Observed with the real predicate against a throwaway project root during Step 4
(`260802-2213-step4-bash-path-exemption.md`,
`## Measured results`).

Not fixed in Step 4: that step's scope explicitly excludes `hooks/lib/rules-write-exemption.ts`,
which Step 2 settled. The fix is one line — carry the article in the label
(`"a protected rule path"` / `"protected rule paths"`) — plus the assertion in
`hooks/lib/__tests__/rules-write-exemption.test.ts`, whose multi-path case asserts the paths
are joined but not the sentence around them.

---
Resolved: the article now travels with the label in `rulesWriteDetail`
(`hooks/lib/rules-write-exemption.ts`) — `"a protected rule path"` for one path,
`"protected rule paths"` for several — so the sentence is grammatical in both branches:

```
… allowed a normally-denied write to a protected rule path: rules/x.md
… allowed a normally-denied write to protected rule paths: rules/x.md, rules/retired/
```

The test gap the issue names is closed the way it describes. The two assertions in
`hooks/lib/__tests__/rules-write-exemption.test.ts` that checked only that the paths were
joined now compare the WHOLE string, plus a third asserting `"a protected rule paths"` never
appears. Comparing substrings is how a grammatical category went unnoticed in the first place.

Session: `260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
