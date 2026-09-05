# The conventions still say the citation gate exempts a fence, after the shape verdict stopped being exempted

---
`rules/fusion-workbench-conventions.md` `## Marker globs` ends by telling every agent that a fenced
code block is the exception for a verbatim citation and that "the citation gate exempts a fence for
exactly that". Since the shape-verdict narrowing, the fence no longer silences `store-prefixed`, so
an agent that follows the rule as written files a record the gate then reports.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## Evidence

The rule text is in `rules/fusion-workbench-conventions.md` `## Marker globs`, last paragraph. The
code that contradicts it is `RESOLUTION_PREMISED_EXEMPTIONS` and `SHAPE_DECIDED_KINDS` in
`hooks/lib/citation-scan.ts`, landed by `ff52dd4a`. The gate's own failure message in
`hooks/lib/__tests__/workbench-citation-lint.test.ts` already carries the correction it needs
("ONE VERDICT THE FENCE DOES NOT COVER: `store-prefixed`"), so the two surfaces disagree with the
rule sitting on the always-on floor and the correction sitting where only a failing run shows it.

The cost is measured rather than hypothetical: merging `origin/main` at `420b022b` brought in four
live records that had fenced a store-prefixed token on the strength of this rule, and the gate
reported ten rows across them.

## The acceptance test

That paragraph names the one verdict the fence does not cover and the remedy for it — the store
segment stated in words — and no agent reading only the always-on rule can file the record this
merge had to repair four times.

---
Resolved: 260905-1839-coder-the-third-re-baselining-event-and-the-fence-correction.md `## What changed` — `rules/fusion-workbench-conventions.md` `## Marker globs` now names the verdicts the fence covers (the ones a lookup decides) against the one it does not (`store-prefixed`, settled from the token's shape, `git:ff52dd4a`), says the fence still holds the sweep off an exhibit, and gives the remedy: name the store in words rather than spelling it into the token. An agent reading only the always-on rule can no longer file the record this merge had to repair four times.
