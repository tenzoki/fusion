The playmaker is charged with backlog upkeep and holds no write key to the store

---
The playmaker's job description says it consolidates the shared backlog store. Its scope rule
forbids it every write into that store, and `bin/fusion-paths` withholds `OUT_BACKLOG` from it
accordingly. So the one agent responsible for the backlog cannot change anything in it, and the
store's `_p_` marker has no writer anywhere in the system.

---

## What is wrong

Three surfaces state the no-write boundary, consistently, which is why this is a design defect
rather than a bug in one of them:

- `bin/fusion-paths playmaker` emits `SCAN_BACKLOG=shared/backlog` and no `OUT_BACKLOG`. Verified
  by running it in this session. The key set is *derived* by grepping the agent's own prompt
  (`rules/workbench-path-resolution.md`), so the missing key is an effect, not an oversight.
- `agents/playmaker.md:65` — "Create, rename or edit a **backlog entry** — not its marker, not its
  body, not a new entry split out of an old one."
- `agents/playmaker.md:10` — "never write or rename a backlog entry".
- `agents/playmaker.md:108` (Step 2b) — "Consolidation is **naming what is there**; you write no
  entry."

Meanwhile `agents/playmaker.md:3` (the dispatch description) and `:8` advertise the agent as the
one that "consolidates the shared backlog store", and `CLAUDE.md` repeats it: "the playmaker
consolidates and ranks them". A reader of either takes that for maintenance. What the agent
actually performs is ranking plus a written recommendation in `portfolio.md`, which the next run
overwrites.

The concrete dead end is the `_p_` marker. `rules/fusion-workbench-conventions.md`
`## Backlog entries` defines it for this kind as "recommended for promotion and not yet acted on".
The shaper consumes `_o_` or `_p_` (`agents/shaper.md:57` ff.). Nothing produces `_p_`.

## Why it is filed now rather than left as the open question it was

`260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md` asked
who writes `_p_`, offered four options, and recommended declining the one that gives the write to
the playmaker. The user answered it in this session by choosing exactly that option and widening
it: the playmaker is to perform full maintenance — marker renames across `_o_`/`_p_`/`_c_`/`_d_`,
splitting multi-idea entries, merging duplicates, closing dead ones. Filing stays outside it.

That answer turns a standing design question into a defect with a known fix direction, which is
what this record is for. The decision record carries the reasoning and the cost; this record
carries the surfaces that have to move.

## Surfaces the fix has to reach

All of them, or the change is half-made and the derived key set will contradict the prompt:

1. `agents/playmaker.md` — the `## Scope` prohibition at `:65`, the write-narrow statement at
   `:10`, the Step 2b "you write no entry" at `:108`, and the frontmatter description at `:3`.
2. The same prompt must then *name* an `$OUT_BACKLOG` write, or `bin/fusion-paths` will keep
   withholding the key — the derivation is from the prompt text.
3. `rules/fusion-workbench-conventions.md` `## Backlog entries` — the marker table's `_p_` reading
   needs its writer named, per that decision record's own constraint.
4. `CLAUDE.md`'s agent inventory line for the playmaker.
5. `hooks/lib/__tests__/rules-emission-golden.test.ts` and any path-lint or key-set test that pins
   the playmaker's emitted keys.

## Acceptance

- `bin/fusion-paths playmaker` emits `OUT_BACKLOG`.
- A playmaker run can rename a backlog entry's marker, split a multi-idea entry into one entry per
  idea, merge duplicates, and close a dead entry — and its prompt says so in the same words its
  description uses.
- The filing prohibition survives: no agent, playmaker included, originates a backlog entry.
- The `_p_` marker has exactly one named writer, and `rules/fusion-workbench-conventions.md`
  `## Backlog entries` names it.

## Not in scope

Whether `taskplanner` and `$TASKLIST` retire into the backlog. That is option 4 of
`260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`
and the user left it undecided in both directions.

---
Resolved: Landed in b995049: bin/fusion-paths playmaker now emits OUT_BACKLOG, agents/playmaker.md names the write, the conventions file's "Backlog entries" section names the playmaker as the sole _p_ writer, and the no-filing bound survives — all four acceptance items met.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
