The "other thirteen agents" count in circle-records.md went stale when the curator was added

---
`rules/circle-records.md:14` reads "The other **thirteen** agents work inside a Circle without ever
transitioning one, and reach this file through the pointer in
`rules/fusion-workbench-conventions.md`." The sentence above it names the three agents that do
transition a Circle — `orchestrator`, `playmaker`, `shaper`. The tree holds seventeen agents, so
the complement is **fourteen**, not thirteen.

---
**What is verified.** `ls agents/*.md | wc -l` prints 17 on 2026-08-14. The three named agents are
named in the immediately preceding sentence of the same paragraph, so the derivation is unambiguous:
17 − 3 = 14. The claim was correct for a sixteen-agent fleet and was falsified by this Circle's
Turn 1, which added `agents/curator.md`.

**Why Turn 1's count pass did not catch it.** Decision
`circles/260801-1244-curator/decisions/260814-0845_i_are-the-sixteen-agent-claims-corrected-or-derived-away.md`
surveyed the thirty-two claims by grepping for `sixteen`, `seventeen`, `16` and `17`. This sentence
states a *derived* figure, spelled out, in a word none of those patterns match, so it never entered
the survey and is not among the twenty-seven the decision disposed of. It is the same failure class
the decision was written about, arriving through the one hole in the search that found the others.

**Why it is filed rather than fixed.** It is outside the seven findings of
`reviews/260814-1023-coderev-curator-turn-1.md`, which is what the fixing task was dispatched for.
It also has a consequence that task was told to keep clear of: `rules/circle-records.md` is emitted
to three agents and its byte size is pinned by `hooks/lib/__tests__/fixtures/rules-emission.golden`,
so correcting it turns the suite red until the fixture is regenerated, immediately next to the
growth-bound arming step that owns the neighbouring baseline.

**Fix direction, and the decision that constrains it.** The binding answer to
`260814-0845` is option 2: the five lint-derived digit claims are corrected to the tree, and in the
unasserted occurrences the figure is **removed** where the sentence does not need it rather than
refreshed. This occurrence is unasserted — the enumeration lint checks digit claims only and its
own header excludes spelled-out word counts by name. So the fix is to drop the number, not to write
"fourteen": *"The other agents work inside a Circle without ever transitioning one"* carries
everything the sentence needs, and "the other" already means the complement of the three just named.
Regenerating the golden fixture in the same commit is part of the change.

**Route:** coder — the file is a rule file in the plugin's own source, and the same change touches a
fixture under `hooks/`.

**Filed by:** coder, while resolving the seven findings of the Turn 1 review.
