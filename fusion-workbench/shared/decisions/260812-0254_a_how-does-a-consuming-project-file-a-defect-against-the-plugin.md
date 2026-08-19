# How does a consuming project file a defect against the plugin?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (on the user's request)
**Cross-references:** `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md` finding 3 and recommendation (c); the three records transferred by hand from the KRK project on 260811 (`260811-0932`, `260810-1730`, and the witness merged into `260811-1915`)

---

## Question

An agent working in a consuming project notices a defect in fusion itself. Today it has nowhere to
put it. It files into that project's `issues/` store, where the record is correct, unreachable by
the people who could fix it, and noise in a backlog about something else. The user asked for a
`plugin-issues/` slot and a skill so agents can deposit observed or suspected plugin defects.

The evidence that this is real rather than tidy: on 260811 the user moved three such records by
hand, in a directory he created for the purpose and then deleted. One of them duplicated a record
this project had filed independently six hours later, and the duplication was only caught because a
human read both. And the analysis of 260812 found that in fusion's entire history **one** defect
record was filed by a user, which it read not as evidence that fusion works but as evidence that
nothing is listening.

## Options

1. **A `plugin-issues/` store in the consuming project's workbench, plus a skill that writes there.**
   The record stays where it was observed, under the reporter's control, and a transfer step moves
   it. Cheapest, and it matches how the three manual transfers actually went.
   - Cons: the transfer is manual, so the plugin still only learns what someone remembers to carry.
2. **The same store, plus a read on the plugin side.** `/fusion:cleanup` or a dedicated skill in
   the plugin repository reads the configured consuming projects' `plugin-issues/` stores and pulls
   what is new. Makes recommendation (c) of the analysis executable rather than aspirational.
   - Cons: the plugin has to know where its consumers are, which is a configuration surface that
     does not exist.
3. **Push into the plugin's own workbench directly**, by absolute path from the consuming project.
   - Cons: a consuming project writing into another repository's tracked workbench is a boundary
     violation with no precedent here, and it fails whenever the plugin is an installed copy rather
     than a checkout.
4. **Reuse the existing Plane mirror as the transport**, since it already exists.
   - Cons: the same analysis names the Plane mirror as removal candidate 1, with zero successful
     pushes ever. Building on it would reverse that decision by the back door.

## Constraints

- An agent in a consuming project must be able to file **without** knowing where the plugin lives.
- A suspected defect and an observed one both have to be filable; the reporter cannot always tell
  which it is, and demanding the distinction up front loses the report.
- Whatever is built must survive the plugin being an installed copy at `~/.fusion` with no git work
  tree, which is the normal case for every consumer.

## Recommendation

Option 1 now, option 2 as its second half once the store exists and has something in it. The
transfer being manual is not the weak point — the missing store is. Three records were carried by
hand this week and all three arrived.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: a `plugin-issues/` store in the consuming project plus a skill that writes there; transfer stays manual. User answered inline 2026-08-16.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. `grep -rln plugin-issues agents/ skills/ rules/ bin/ hooks/ *.md` returns nothing, and `ls skills/` holds twelve directories with no such skill. Neither the store nor the skill that writes to it exists.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; re-verified after 260817-1836 and still nothing exists.**

`grep -rln plugin-issues agents/ skills/ rules/ bin/ hooks/ *.md` is empty at HEAD, and `ls skills/`
holds no such skill. Neither the store nor its writer exists, three days after the last check and
three days after the user answered.

Two facts sharpen what the delay costs, both from this record's own evidence. The store is where a
consuming project's observation of a fusion defect would land, and the analysis it cites found that
in fusion's entire history **one** defect record was filed by a user — read there not as evidence
that fusion works but as evidence that nothing is listening. Meanwhile the alternative in use is the
one the record describes: three records carried by hand on 260811, in a directory created for the
purpose and then deleted, one of them a duplicate caught only because a human read both.

**What binds a deep change.** An agent working in a consuming project still has nowhere to put a
fusion defect, so any observation a deep change produces in a consumer will be filed into that
project's own `issues/` store and will not reach here. If the change is one whose failures show up
downstream rather than in this repository, that is the channel it will be reported through, and it
does not exist.
