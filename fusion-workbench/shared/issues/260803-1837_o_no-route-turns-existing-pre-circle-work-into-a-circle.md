# fusion cannot turn existing pre-Circle work into a Circle

**Filed:** 260803-1837
**Severity:** Medium-High
**Domain:** code
**Filed by:** consultant (at Kai's request)
**Scope:** `agents/shaper.md` (anticipated-circle and portfolio-activation modes), `rules/fusion-workbench-conventions.md` `## Circle record template`

---

Circle creation accepts a raw one-line draft and nothing else. There is no route that
takes work already on disk (a finished spec, a reviewed plan, its issues and its answered
decisions) and makes a Circle out of it. The pre-Circle case is routine, the conventions
say so themselves, and the record the shaper writes always claims there is no spec or plan.

The result is a manual edit that no agent's prompt licenses, on a field whose consumers
fail silently when it is wrong.

---

## Problem

Two shaper modes touch a Circle record, and neither covers this case.

**Anticipated-circle mode** (`agents/shaper.md:57-74`) creates the Circle from a
`**Draft:**` string. Its frontmatter fill is fixed: "`**Active spec/plan:**` and
`**Active session history:**` are `(none yet)`" (`agents/shaper.md:65`). No input lets a
caller name an existing plan, and the mode "**does NOT write a spec at `$OUT_PLAN`**"
(`:62`), so the record is the whole artifact. The same mode is barred from touching
anything that already exists: "No existing Circle may be modified in anticipated-circle
mode" (`:28`).

Two skills reach that mode, not one. `/fusion:direct` is the documented route, and
`/fusion:seed-from-plane` dispatches the identical `**Mode:** anticipated-circle` contract
(`skills/seed-from-plane/SKILL.md:85-92`). Both inherit the hardcoded `(none yet)`.

**Portfolio-activation mode** (`agents/shaper.md:47-55`) does set the field (`:53`), but it
produces a new spec at `$OUT_PLAN` in the same run (`:52`). Pointing it at a Circle whose
work is already shaped and planned yields a second spec and repoints
`**Active spec/plan:**` away from the reviewed plan. That is worse than the gap.

So the only way to attach existing work to a new Circle is to edit
`circles/<stamp>-<slug>/_a_circle.md` by hand, replacing the literal

    **Active spec/plan:** (none yet)

with a workbench-relative path. No prompt in `agents/` authorises setting that field to an
*existing* spec or plan without minting a new one in the same run. Playmaker writes into
Circle records but only appends its three advisory sections (`agents/playmaker.md:53`) and
never touches the frontmatter.

## Impact

The conventions treat the cross-store case as normal, not exceptional
(`rules/fusion-workbench-conventions.md:394`): "A spec written before the Circle existed
lands in `shared/planning/` — every `/fusion:direct` run and every shaper run in
anticipated-circle mode produces one." The field is specified to hold a path rather than a
filename precisely so it can point across stores. The framework anticipated the situation
and then left no mechanism to express it.

The failure mode is silent. The same passage (`:397`) names the three consumers that read
the field, `/fusion:circle-stash`'s lookup, playmaker's `portfolio.md` rendering, and the
orchestrator's resume, and records that all three "degrade without announcing it". A Circle
left at `(none yet)` therefore looks healthy in the portfolio briefing while its plan is
invisible to every consumer that would surface it.

The clarification round is also wasted work. Anticipated-circle mode "runs the same
clarification-with-user flow as user-direct mode" (`agents/shaper.md:61`). When a spec
already exists, that flow re-asks questions the spec answered and recorded.

## What a fix has to do

At minimum, a route that takes an existing plan or spec and produces an `_a_` Circle whose
`**Active spec/plan:**` names it, whose `## Grounding snapshot` carries the decisions the
plan realises, and whose `## Dependencies` cites the issues it closes. The material to fill
all three is already in a hardened plan: the reporting project's plan carries a
`## Cross-references` block naming its spec, its consolidated issue, its investigation, its
diagram review, three decisions it realises, three issues it closes, one it leaves open by
design, and one decision it must not disturb.

Activation then has to skip the shaping pass rather than mint a second spec, which is a
change to portfolio-activation mode as well: it needs a branch for "this Circle already
names a spec".

## Second question, to be decided and not assumed: should files move?

Kai asks that an option to **collect or move certain files into the Circle** be considered
alongside the pointer-only approach. It is a real option and it is not obviously the right
one, so it needs deciding rather than designing.

Against moving, three things:

- **The Origin Rule forbids it as stated** (`rules/fusion-workbench-conventions.md:70,83`).
  "An artifact belongs to the Circle whose Directive caused it to come into existence. With
  no active Circle, it goes to `shared/`." Work produced before the Circle existed has, by
  definition, no Circle affiliation. Corollary 2 is explicit: "Reach is cited, never placed
  … Do not copy it, do not move it, do not file a duplicate in `shared/`. One record, one
  location, many citations."
- **The escape hatch runs the other way** (`:85`). The conventions do contemplate a
  promotion step, and they name its direction: "an explicit, recorded move from a Circle to
  `shared/`". Nothing contemplates `shared/` into a Circle. The warning attached is the
  reason to be careful: "Two placement rules is how the definition scatters again."
- **It breaks citations that already exist.** The artifacts of one piece of pre-Circle work
  cross-reference each other by `shared/...` paths, and are cited from outside by the same
  paths. A move invalidates every one of them unless the move also rewrites them, which
  turns a convenience into a refactor with its own failure modes.

For moving, one thing, and it is Kai's actual complaint: a Circle is defined as a container
(`:9`), "A Circle is a directory, not a file. Everything a unit of work produces lives
inside it", and a Circle whose entire working set sits elsewhere is a container in name
only. Citation preserves correctness but not the property the container was built to give:
open the directory, see the work.

Three shapes worth weighing, listed without a recommendation because the choice is the
framework owner's:

1. **Pointer only.** The Circle record names the plan; nothing moves. Cheapest, consistent
   with the Origin Rule as written, and leaves the container property unmet.
2. **Adoption with citation rewrite.** Named artifacts move into the Circle and every
   inbound citation is rewritten in the same recorded step. Delivers the container
   property; needs a second placement rule and a reliable citation-rewrite pass, which is
   the thing corollary 2 warns against.
3. **A working-set section on the record.** A new `## Working set` block listing every
   artifact with its path, filled at Circle creation from the plan's own cross-references.
   Nothing moves, and one place answers "what belongs to this Circle". A view rather than a
   placement, so it needs no change to the Origin Rule.

If option 2 or 3 is taken up, it is a choice point and belongs in a decision record rather
than being settled inside this issue.

## Evidence

Verified in this repository at filing time.

| Claim | Source |
|---|---|
| `Active spec/plan:` is hardcoded to `(none yet)` | `agents/shaper.md:65` |
| Anticipated-circle mode may not modify an existing Circle | `agents/shaper.md:28` |
| Anticipated-circle mode writes no spec | `agents/shaper.md:62` |
| Portfolio-activation writes a new spec and repoints the field | `agents/shaper.md:52-53` |
| A second skill reaches the same mode | `skills/seed-from-plane/SKILL.md:85-92` |
| Playmaker appends only, never the frontmatter | `agents/playmaker.md:53` |
| The pre-Circle case is expected and routine | `rules/fusion-workbench-conventions.md:394` |
| The three consumers degrade silently on a bad value | `rules/fusion-workbench-conventions.md:397` |
| Reach is cited, never placed | `rules/fusion-workbench-conventions.md:83` |
| Promotion, if ever added, runs Circle → `shared/` | `rules/fusion-workbench-conventions.md:85` |
| A Circle is a container | `rules/fusion-workbench-conventions.md:9` |

Not verified here: the report as received cited two Circle records it called live — stamped
`260802-2220` and `260730-1615` in that project, under the slugs *throwaway-plane-bridge-smoke-test*
and *phase-header-process-flows* — and a spec/plan pair timestamped `260803-1346` / `260803-1524`.
None of the five files
exists in this repository's workbench. They belong to the consuming project where the gap
was found, and the claims resting on them stand unchecked here.

## Cross-references

- `archive/260817-1907-safe-cleanup-scoped/shared/issues/260716-1958_*_migration-leaves-circle-record-fields-dangling.md` — the
  closed issue that established path-not-filename semantics for this same field, and the
  reason the cross-store case is documented at all.
- `rules/fusion-workbench-conventions.md` `## Circle record template`, `## Origin Rule
  (Herkunftsregel)`.
- Found while preparing the reporting project's durable-home-for-manual-plan-edits work for
  activation. Not caused by that work.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/shaper.md:82` still fills anticipated-circle frontmatter with `(none yet)` and `:28` still bars touching an existing Circle in that mode. One of the two routes the record named, `skills/seed-from-plane/`, no longer exists; the primary route `/fusion:direct` reproduces the defect unchanged. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
