The skip-licence commit says eleven patterns, twelve were added, and the docstring calls eleven items "the eight forms"

---

Two count claims around `45d76f0` do not survive being counted.

1. The commit subject says *"eleven more licences are closed with witnesses"*, and the resolution
   note appended to `260810-1918_c_the-skip-licence-blacklist-…` says *"Eleven patterns added"* and
   *"Each of the eleven was spliced one at a time"*. **Twelve** new entries were added.
2. `hooks/lib/__tests__/state-drift-detection-lint.test.ts:202-206` reads: *"The eight forms from
   issue 260810-1918 are the contraction families, `not required`, `no longer`, `except when`,
   `provided that`, `as time allows`, `best effort`, `where practical`, `drop`, `sparingly` and `at
   most`."* That sentence equates the number eight with an enumeration of eleven items.

---

**Measured** by extracting the `re:` literals from the array at each end of the range:

| | `da8c9db` | `b3cc034` |
|---|---|---|
| entries in `SKIP_LICENCES` | 16 | 26 |

Five entries left (`\bdon't\b` and `\bmay be skipped\b` as dead, plus `skip`/`defer`/`omit` replaced
by widened spellings) and fifteen arrived, of which three are those widened re-spellings. The twelve
genuinely new patterns are: the auxiliary contraction family, the `won|can|shan't` family,
`not required|needed|necessary|mandatory`, `no longer`, `except when|where|if|for`,
`provid(ed|ing) that`, `as time (allows|permits)`, `best[ -]effort`, `(where|when|if) practical`,
`drop(s|ped|ping)`, `sparingly`, `at most`.

"Eleven" is reached only by counting the two contraction regexes as one bullet — which the control at
`:676-707` does not do: it requires each entry to be the first in the list matching **its own**
example, so both contraction entries are separately witnessed. The claim *"each of the eleven was
spliced one at a time"* is therefore one short of what was actually demonstrated.

**Item 2 is a separate confusion.** The issue's table has eight *rows*; those rows name eleven
*phrasings*. The resolution note in the record states the relationship correctly ("Eleven patterns
added for the eight forms in the table above"). The docstring dropped the "for", and now asserts that
eight forms *are* eleven things.

**Why file a counting nit.** This range's purpose is repairing false claims found in the previous
range's commit messages, and one of those was a count. A count in a commit message is the cheapest
thing in the repository to verify and the most expensive to disbelieve later.

**Fix.** Correct the docstring at `:202-206` to say "eleven phrasings, in eight forms, from issue
260810-1918", and append a correction line to the record's resolution note. Nothing executable
changes.

**Cross-references.** `hooks/lib/__tests__/state-drift-detection-lint.test.ts:190-245, 676-707`;
`shared/issues/260810-1918_c_the-skip-licence-blacklist-misses-every-negation-that-does-not-use-the-word-not.md`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.
