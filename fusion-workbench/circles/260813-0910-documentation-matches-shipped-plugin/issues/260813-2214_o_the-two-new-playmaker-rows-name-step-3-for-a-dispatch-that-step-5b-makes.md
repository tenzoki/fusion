The two new playmaker rows name `/fusion:next` Step 3 for a dispatch that Step 5b makes, and Step 3 says it carries no other parameter

---
`README-agents.md:61` and `:62` both give the `Passed by` cell as "`/fusion:next` Step 3's second
dispatch". The line citations beside it are right — `skills/next/SKILL.md:167-176`, `:176`, `:179`
— and those lines sit under `## Step 5b — Put the backlog proposals to the user, and relay the
answer back` (`skills/next/SKILL.md:153`), not under Step 3. Step 3 (`:96-108`) makes exactly one
dispatch, and `:106` says of it: "No other parameters." The same column uses "Step 3" in its
skill-step sense two rows earlier, so the two readings collide inside one table.
---

## Both sides read

**Documentation side**, `README-agents.md`, three `Passed by` cells in the playmaker block:

| Row | Cell |
|---|---|
| `**Domain:**` (`:60`) | "orchestrator at Phase 4 (`agents/orchestrator.md:850`), `/fusion:next` **Step 3** (`skills/next/SKILL.md:103`), or a direct user dispatch" |
| `**Confirmed operations:**` (`:61`) | "`/fusion:next` **Step 3's second dispatch** (`skills/next/SKILL.md:167-176`)" |
| `**Proposal source:**` (`:62`) | "`/fusion:next` **Step 3's second dispatch** (`skills/next/SKILL.md:176`, contract restated at `:179`)" |

The first is correct: `skills/next/SKILL.md:96` is `## Step 3 — Dispatch playmaker` and `:103` is
the `**Domain:**` line in its prompt block.

**Artifact side**, `skills/next/SKILL.md` section headings, read in order:

```
 96  ## Step 3 — Dispatch playmaker
110  ## Step 4 — Read the portfolio
118  ## Step 5 — Render inline to the user
153  ## Step 5b — Put the backlog proposals to the user, and relay the answer back
167  **3. Dispatch playmaker a second time** — target `fusion:playmaker`, as in Step 3 …
197  ## Step 6 — Interactive activation
```

The cited lines 167-179 are numbered item **3 inside Step 5b**, four sections after Step 3. What
Step 3 itself says, at `:98` and `:106`:

> The dispatch prompt's first non-empty content line MUST be the domain parameter; the rest of the
> prompt is empty for the default invocation …
>
> No other parameters.

So a reader who follows the step name lands on the one dispatch in the skill that is documented to
carry neither of these two parameters, and reads a sentence that denies them.

## Where the ambiguity comes from

The body at `:167` says "as in Step 3", meaning *the same dispatch target*, and that phrasing is
the likely source of the cell. It does not make the dispatch part of Step 3: `:297` describes the
same thing as "Step 5b adds no write of its own — it asks and it dispatches", and `:195` calls the
whole mechanism "this relay" under the Step 5b heading.

## Why it matters

These two rows were added this Turn to close
`260813-2052_c_the-dispatch-parameter-roster-omits-the-two-lines-the-playmaker-relay-carries.md`,
whose point was that a dispatcher reading the roster could not find the mechanism that authorises
the four destructive backlog operations. The rows now exist, and the coordinate they hand that
dispatcher is off by four sections into the one dispatch that must not carry these lines. The prose
note at `:72` describes the relay correctly and names no step at all, so the wrong coordinate
appears only in the two cells, where it is cheapest to correct and easiest to trust.

## Scope

`README-agents.md` only, two cells. `skills/next/SKILL.md` is correct and internally consistent.

## Recommended fix direction

Name Step 5b in both cells — "`/fusion:next` Step 5b's dispatch (`skills/next/SKILL.md:167-176`)"
— keeping the line citations, which are already right. Check the `**Domain:**` cell in the same
pass: `skills/next/SKILL.md:168` carries `**Domain:**` in the Step 5b block too, so that parameter
has two passing sites in the same skill and the cell names one.

Filed by: coderev (review of Circle Turn 4, range `93388bc..c663a1f`, commit `c663a1f`).
