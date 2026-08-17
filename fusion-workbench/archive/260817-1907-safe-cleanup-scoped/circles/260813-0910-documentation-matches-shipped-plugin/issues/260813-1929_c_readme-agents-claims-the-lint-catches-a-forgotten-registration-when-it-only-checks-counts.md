README-agents step 5 claims the lint catches a forgotten registration; it only checks four digit counts

---
The sentence added at `README-agents.md:268` ("Both `CLAUDE.md` counts are checked against `agents/*.md` by `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, so a forgotten registration fails the test suite") states a stronger guarantee than the test provides. The gate compares **counts**, not registrations, and the third item of the list it sits under is not checked at all.
---

## Both sides read

**Documentation side.** `README-agents.md:262-268`, step 5 of "Adding a new agent", lists three registration surfaces:

```
   - The agent listing bullet under `## What this is` in `CLAUDE.md` — it names every agent and states the count
   - The `## Layout` table in `CLAUDE.md` — its `agents/*.md` row states how many prompts ship
   - The agent table at the top of this README

   Both `CLAUDE.md` counts are checked against `agents/*.md` by `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, so a forgotten registration fails the test suite.
```

**Artifact side.** `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:146-152`, the `CLAIMS` array, is five digit-count regexes and nothing else:

```ts
{ rel: "CLAUDE.md", re: /\b(\d+) specialized agents\b/g, expected: n, ... },
{ rel: "CLAUDE.md", re: /\bThe (\d+) agent prompts\b/g, expected: n, ... },
{ rel: "CLAUDE.md", re: /\bthe other (\d+) inherit\b/g, expected: n - 1, ... },
{ rel: "README.md",        re: /\b(\d+) specialized agents\b/g, expected: n, ... },
{ rel: "README-agents.md", re: /\bof the (\d+) prompts\b/g,     expected: n, ... },
```

No test enumerates the agent *names* in the listing bullet, and no test enumerates the rows of README-agents' own agent table at `:23-40`. The skill roster gets both treatments (section 1, `:112-122`, "README-agents' skill table has exactly one row per skill directory"); the agent roster gets neither.

## Verified by mutation, not inferred

In a scratch copy of the tree (`/private/tmp/.../scratchpad/fx`):

1. added `agents/scratchagent.md` with valid frontmatter;
2. bumped the four digit claims (`16 specialized agents` → 17 in `CLAUDE.md` and `README.md`, `The 16 agent prompts` → 17, `the other 15 inherit` → 16, `of the 16 prompts` → 17);
3. registered the name **nowhere** — not in the listing bullet, not in any Layout row, not in README-agents' agent table.

`npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` → **21 passed, 0 failed.**

So an agent can ship unnamed in all three surfaces the step lists, as long as the counts are bumped — and bumping a digit is a different edit from adding a name to a comma-separated list, which is exactly how the two come apart.

## Scope

`README-agents.md` only (shipped doc). No code behaviour is affected.

## Recommended fix direction

Either narrow the sentence to what the gate does — the two `CLAUDE.md` **counts** are checked, so an agent added without bumping them fails the suite — or widen the gate: a per-name check on the listing bullet, and a one-row-per-agent check on README-agents' table, both modelled on section 1's skill-roster checks. Widening is the better fix if the sentence is to stay as written; the parsers already exist one section up.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`, commit `90037eb`).

---
Resolved: The sentence at `README-agents.md:268` was narrowed to what the gate checks. It now says the lint holds the digit counts in the two `CLAUDE.md` surfaces to `agents/*.md`, names the three claims it parses, and states plainly that no test enumerates names — not the listing bullet's, not this README's own table rows — so registration is the author's to get right. Checked against `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:146-152` (the `CLAIMS` array, five digit regexes) and against every `agentNames()` call site in that file (`:145`, `:169`, `:263`); the only one outside the count block is the conditional-emission check, which verifies derived agents are real rather than that an agent is registered.
