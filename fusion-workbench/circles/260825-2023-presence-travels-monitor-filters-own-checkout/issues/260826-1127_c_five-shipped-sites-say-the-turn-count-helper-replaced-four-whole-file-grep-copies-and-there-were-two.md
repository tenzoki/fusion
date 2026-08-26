# Five shipped sites say the Turn-count helper replaced four whole-file `grep -c` copies, and there were two

---

`bin/fusion-events turns` is documented in five places as replacing "four copies of a whole-file
`grep -c turn_start`". At the Circle's session anchor `8119fc2` the tree held exactly **two** such
copies. On the looser reading the sentence might have meant — four *sites* that print or define the
count — the number is now **five**, because the Turn 2 review found a fifth at `agents/reconciler.md`
and `6deeb33` converted it. The sentence is wrong on both readings and it is wrong in the plugin's
own `CLAUDE.md`.

---

**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. No behaviour depends on it. It is a factual claim about the tree, in shipped
documentation, in the one Circle whose declared subject is counts that are right when written and
wrong two commits later — and the correction the Circle already made to acceptance criterion 5 did
not reach it.

**Evidence.** Measured at HEAD `7774d56`. The five sites, `grep -rn "four copies"`:

- `CLAUDE.md:43`, the `bin/fusion-events` Layout row: "replacing four copies of a whole-file
  `grep -c turn_start` that counted every checkout's Turns and every previous session's"
- `bin/fusion-events:202`, the authoritative header: "`turns` also replaces four copies of a
  whole-file `grep -c turn_start`"
- `hooks/lib/events-query.ts:374`, the `countTurns` docstring: "It replaces four copies of
  `grep -c turn_start` over the whole file"
- `hooks/dist/lib/events-query.js:240` and `hooks/dist/lib/events-query.d.ts:206`, the compiled
  copies of the same docstring, which follow from `npm run build`

The ground truth for the literal reading, at the session anchor:

```
$ git show 8119fc2:agents/orchestrator.md | grep -n "grep -c"
99:     T=$(grep -c '"event":"turn_start"' fusion-workbench/orchestrator-events.jsonl 2>/dev/null)
$ git show 8119fc2:skills/setup/SKILL.md | grep -n "grep -c"
377:     T=$(grep -c '"event":"turn_start"' ./fusion-workbench/orchestrator-events.jsonl 2>/dev/null)
```

Two, not four. The other two of the four sites the plan named — `agents/orchestrator.md` Phase 2
step 3 and the Persistent-State derivation table — were **prose definitions**, not `grep -c` copies,
and the plan says so in `## Current State`: "Phase 2 step 3 and the Persistent-State derivation table
both define the figure as the events since this session's `session_start`".

The ground truth for the site reading, at HEAD: five call sites read the helper, which is exactly
what corrected acceptance criterion 5 now says (`agents/orchestrator.md:101`, `:558`, `:1122`,
`skills/setup/SKILL.md:388`, `agents/reconciler.md:21`).

**Why one sentence is wrong twice.** It conflates two different counts — how many literal shell
blocks were deleted, and how many sites now read one implementation — and gives a number that
belongs to neither. The plan's `## Approach` has the accurate form and it uses no number for the
`grep`: "The Turn count becomes a program rather than four pieces of prose."

**Fix direction.** State the two facts separately and state each correctly, in the header first,
since it is authoritative, and then in the three copies of it. Something of the shape: it replaces
two whole-file `grep -c turn_start` blocks and two further prose derivations, and five sites now read
the one implementation. Rebuild `hooks/dist/` so the committed compilation matches
(`committed-dist.test.ts`). `CLAUDE.md`'s Layout row is prose about a `bin/` helper and stands on no
bounded surface; `bin/` and `hooks/lib/*.ts` stand on none either.

**Scope.** `CLAUDE.md`, `bin/fusion-events`, `hooks/lib/events-query.ts`, and `hooks/dist/` by
rebuild. No behaviour changes.

---
Resolved: all five sites now state the two quantities separately and give each the number it was measured at. The literal count is **two**: `git grep -n 'grep -c.*turn_start' 8119fc2 -- agents/ skills/ bin/ hooks/ rules/ CLAUDE.md 'README*'` returns exactly `agents/orchestrator.md:99` and `skills/setup/SKILL.md:377` — the other hits `git grep` finds at that revision are workbench records quoting the block, which ship with nothing. The site count is **five**, and it is the same five on both sides of the change: at `8119fc2` the two literal blocks plus three prose derivations (`agents/orchestrator.md:547` Phase 2 step 3, `agents/orchestrator.md:1111` the `progress.turn` row, `agents/reconciler.md:21`), and at HEAD the five call sites corrected acceptance criterion 5 names (`agents/orchestrator.md:101`, `:558`, `:1122`, `skills/setup/SKILL.md:388`, `agents/reconciler.md:21`). This record's own fix direction estimated **two** prose derivations from what the plan's `## Current State` enumerated; there are three, because the plan predates the Turn 2 review that found `agents/reconciler.md`. The number written is the measured one.

The authoritative header (`bin/fusion-events`) carries the full form and says in its own words that the two quantities are different numbers rather than one; `hooks/lib/events-query.ts` `countTurns` and `CLAUDE.md`'s Layout row carry the same two figures, and the two `hooks/dist/` copies followed from `cd hooks && npm run build`. `grep -rn "four copies"` over `hooks/dist bin CLAUDE.md rules agents skills README*.md docs` now returns nothing. No behaviour changed and no bounded surface moved: `bin/`, `hooks/lib/*.ts`, `hooks/dist/` and `CLAUDE.md` each stand on none.
