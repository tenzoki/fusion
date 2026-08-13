The dispatch-parameter roster calls itself the single authoring home and omits the two lines the /fusion:next relay carries

---
`README-agents.md` `## Dispatch parameters` declares itself "the roster's single authoring
home" and lists eleven parameters. `agents/playmaker.md:207-215` declares two more —
`**Confirmed operations:**` and `**Proposal source:**` — read off the dispatch prompt in
exactly the form the table's own preamble defines, and `skills/next/SKILL.md:170-176` passes
both. The roster is thirteen, or the two are excluded on a stated ground; it is currently
neither.
---

## Both sides read

**Documentation side**, `README-agents.md:54` (the section preamble):

> Six agents read run-time parameters off the dispatch prompt: plain markdown lines of the
> form `**<Keyword>:** <value>`, one per line, ahead of the directive body. **This table is
> the roster's single authoring home** — the agent rows above name no parameters, and
> `CLAUDE.md` cites this section rather than restating it.

The table under it has eleven data rows: `**Domain:**` ×3, `**Executors:**`, `**Circle:**`,
five `shaper` lines, `**Deliverable language:**`. Neither `**Confirmed operations:**` nor
`**Proposal source:**` appears in the table or in the two prose notes below it.

**Artifact side**, `agents/playmaker.md:207` and the block form at `:209-215`:

> A dispatch prompt carrying a `**Confirmed operations:**` block means: perform exactly the
> operations it lists and no others, propose nothing further, and stop. […]
> `**Proposal source:**` names where that analysis is written down

```
**Domain:** <detected-domain>
**Confirmed operations:**
- split <entry path> into: <slug> — <title>
- merge <entry path>, <entry path> into: <slug> — <title>
- close <entry path> — <reason>
- defer <entry path> until <target>
**Proposal source:** <portfolio> `## Backlog — ranked`, generated <stamp from the portfolio header>
```

`agents/playmaker.md:217` then makes `**Proposal source:**` load-bearing rather than
decorative: the run compares the stamp in that line against the portfolio's `**Generated:**`
header and, when they differ, "perform no operation, write no file at all, and return saying
so".

`skills/next/SKILL.md:163-176` is the passer: Step 3 dispatches playmaker a second time with
that exact block, and `:178` states the same stamp contract from the caller's side.

## Why the two are parameters by this table's own definition

- **Form.** Both are `**<Keyword>:** <value>` lines ahead of the directive body — the
  preamble's definition, verbatim.
- **Read off the dispatch prompt.** `agents/playmaker.md:207` and `:217` both act on them.
- **A multi-line value is no objection.** `**Draft:**` is in the table and its value "may span
  multiple lines" (`agents/shaper.md:57`). `**Confirmed operations:**` spans lines the same way.
- **The agent count is unaffected.** Both belong to `playmaker`, already one of the six. What
  the omission falsifies is the parameter count and the completeness claim, not the six.

The section already shows how a non-parameter is handled: `README-agents.md:76` names and
excludes the bugfixer's freeform "ontology edits pre-approved" pre-authorisation, on the
stated ground that it carries no `**<Keyword>:**` form. These two carry it.

## Why it matters

The roster was created this Turn to be the one place a dispatcher looks, and `CLAUDE.md` was
rewritten in the same commit to point at it instead of restating the list ("Do not restate it
here; a second copy is how the planner came to be listed as domain-parameterised in four
places"). A reader who takes the completeness claim at face value concludes the playmaker has
one parameter and that a confirmation cannot travel on a dispatch prompt — which is the exact
mechanism that authorises the four destructive backlog operations (split, merge, close,
defer). The Circle's own Directive is that a documented surface match the shipped prompts;
this surface is the newest one and does not.

## Scope

`README-agents.md` only. No prompt and no skill changes — both are correct as they ship.

## Recommended fix direction

Add two rows for `playmaker`, cited to `agents/playmaker.md:207-215` and `:217`, with
`skills/next/SKILL.md` Step 3 as the passer and "the relay performs nothing and writes
nothing" as the absent/stale behaviour — or, if the relay block is judged to be a different
kind of thing from a parameter, say so in a note under the table the way the bugfixer's
pre-authorisation is handled, and correct the count. Either resolves it; silence does not.

Filed by: coderev (review of Circle Turn 3, range `22f892e..8d87192`, commit `8d87192`).
