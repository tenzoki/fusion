# Where does the `bin/` helper roster belong, when a third of `CLAUDE.md` is pointers charged eleven times?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260911-2141_*_is-the-order-helper-built-now-against-a-one-node-zero-edge-store-or-deferred-until-the-backlog-carries-one.md, 260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md, 260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md

---

## Question

An implementation step of the ordering work is blocked over 60 bytes. A new `bin/` helper must
carry a row in `CLAUDE.md`'s Layout table, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`
section 7 fails the suite in both directions if it does not, and `CLAUDE.md` is charged to all
eleven dispatch paths at zero head-room. The shortest existing row is 291 bytes and the tightest
path holds 591, against a minimal grammar draft of 360 for the same step.

The question this record asks is not that step's. It is whether the roster belongs in `CLAUDE.md`
at all.

## What is measured

Taken at `bd2fc6e5` with the commands beside each figure.

- **22 rows**, `awk` over lines opening `` | `bin/ ``, totalling **29 660 bytes**.
- `CLAUDE.md` is **91 277 bytes** (`wc -c`). The roster is a third of the file.
- **12 of the 22** rows contain the phrase "authoritative documentation", each saying in its own
  text that the helper's own header is where the documentation actually lives.
- The file is loaded into every agent dispatch. `hooks/lib/__tests__/fixtures/dispatch-path.baseline`
  charges it to all eleven paths at zero head-room, so its weight is paid eleven times per dispatch
  and no byte may be added without a removal of equal size on the same path.

## What the lint's own comment claims, and what stands against it

The comment at `derivable-enumerations-lint.test.ts` section 7 states the reason: "CLAUDE.md's
Layout table is where a reader looks up what a helper is for, and a helper with no row is invisible
there (five were, until the Circle that added this check)." The check is therefore the enforcer of a
claim about a human reader, not the reason itself.

**Against the claim, in this repository specifically.** `CLAUDE.md` is fusion's own, not a consuming
project's: the installer copies no `CLAUDE.md`, so the roster reaches no consumer and every byte of
it is paid by fusion's own development sessions. A developer working on fusion has the helper in the
tree; `ls bin/` and the file's own header answer the question more precisely than a table row, and
more than half the rows say exactly that. `README-hooks.md` already carries the equivalent roster for
`hooks/lib/` and sits on no dispatch path. So the certain reader here is the model, eleven times per
dispatch, and the asserted reader is a human with a shorter route.

**For the claim, and it is thin but real.** Somebody new to the plugin sees from `CLAUDE.md` what
exists at all, without knowing to run `ls`. Five helpers were invisible before the check existed,
which is evidence that absence is a real failure mode and not a hypothetical one.

**The convention fusion ships already resolves this tension.** `rules/context-lean-claude-md.md`
says a project's `CLAUDE.md` keeps its identity, its language declarations, the few rules that bind
every session, and **a short pointer table** naming where detail lives; everything topic-specific
moves behind the manifest or into a skill. A one-line pointer preserves discoverability, which is
the whole of the "for" argument, at a fraction of 29 660 bytes. fusion does not follow its own
convention here, and the lint holds it in place.

## Options

1. **Move the roster to `README-hooks.md`** (or a sibling off every dispatch path), leaving one
   pointer line in `CLAUDE.md`. Retarget the lint at the new home, keeping it closed in both
   directions.
   - Pros: takes about 29 400 bytes off all eleven dispatch paths at once. Preserves the
     discoverability the check was built for. Follows the convention fusion ships. Uses the
     precedent already in the tree, since `hooks/lib`'s roster lives there.
   - Cons: every citation of the Layout table's helper rows has to move with it, and there are many.
     One release where a reader looks in the old place.
2. **Keep the roster in `CLAUDE.md` and shorten every row** to a fixed one-line form: name, one
   clause, and the standing statement that the header is authoritative.
   - Pros: no citation churn, no lint change, the lookup place stays. Could plausibly take two
     thirds off the roster's weight.
   - Cons: a third of `CLAUDE.md` becomes a smaller third and stays on every path; the 12 rows that
     already say "read the header" show the long form was not carrying its weight, and nothing stops
     the rows growing back, which is how they arrived.
3. **Delete the roster and the lint**, leaving `ls bin/` and the file headers as the answer.
   - Pros: largest and simplest reduction; the headers are already mandated as authoritative.
   - Cons: reintroduces exactly the failure the check was added to fix, with five measured
     instances. No enumeration means nothing notices a helper that ships undocumented.
4. **Change nothing here**, and pay the 60 bytes inside the ordering work by finding a removal on
   the `reviewer` path.
   - Pros: the ordering work proceeds without opening a second front.
   - Cons: the next helper meets the same wall with less room, and the reason it is a wall stays
     unexamined.

## Constraints

- Whatever is chosen leaves the enumeration closed in both directions, or accepts option 3's cost
  explicitly. A roster nothing checks is how five helpers went missing.
- Head-room is not raisable to make room. A dispatch-path addition is offset from the same path's
  total, and a re-baseline is none of the events `hooks/lib/__tests__/helpers/growth-bound.ts`
  `## Re-baselining` names.
- The user files work items; this record proposes none.

## Recommendation

Option 1, and it is a recommendation about the direction rather than about the schedule. It is the
only option that reduces the weight substantially, keeps the property the check defends, and brings
fusion into line with a convention it already ships to other projects. The citation churn is the
real cost and should be measured before the work is scheduled, not estimated here.

Whether it runs before, after, or instead of the 60-byte removal inside the ordering work is a
separate question and is deliberately not answered in this record.

---
Answered: 260911-2237_*_where-does-the-bin-helper-roster-belong-when-a-third-of-claude-md-is-pointers-charged-eleven-times.md `## Options` — option 1: the roster moves to `README-hooks.md`, `CLAUDE.md` keeps one pointer line, and the enumeration lint is retargeted at the new home so it stays closed in both directions. Sequenced ahead of the order helper by the same ruling, so the helper's Layout row lands in the new home and the 60-byte deficit on the `reviewer` path never has to be paid.

The citation churn this record named as the real cost was measured before scheduling rather than estimated, which is what the record asked for. `grep -rn "Layout table"` over the tree at `ae172380`, excluding `node_modules` and `archive/`, returns exactly one shipped-code site, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, which is the file being retargeted anyway. No agent prompt, no rule file, no skill body, no README and no `bin/` helper cites the table. Every other hit is a workbench record, and all but four carry a terminal marker or sit in a closed store, so they are history and are not edited back (`rules/fusion-workbench-conventions.md` `## Terminal states are history`). The four live ones are this item's own plan and this record, one `_o_` issue and one `_p_` plan in other containers. The churn is therefore roughly one code site and four records, against the "there are many" the record's own option 1 warned of; ruled by user, Kai Stalmann <ks@qantr.com>.
