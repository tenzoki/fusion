# Depends-on edges are proposed from the prose and confirmed by the user

---
**Domain:** code
**Status:** claimed
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260917-2253
**Active spec/plan:** 260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md (the spec; no plan yet)
**Cross-references:** 260917-1338-depends-on-kanten-automatisch-erzeugen.md, 260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md, 260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md, 260911-0715_*_a-depends-on-entry-asserts-an-ordering-where-the-section-it-was-derived-from-asserts-a-conflict.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>
---

## Directive

A work item's `**Depends-on:**` field is written by hand today, and only one value has ever
been written into it. This item builds the pass that proposes them: it reads the prose
already standing in the workbench, proposes each edge with its reason and the citation it
was read from, puts the proposals to the user, and writes only what the user confirmed.
`bin/fusion-work-order` already computes order, depth, transitive blocked count, readiness
and cycles over the confirmed field, and ran through in September; it is missing nothing
but edges, and today it runs over one item and no edges at all.

Measured at `04a1ed8d`, one shape is already excluded: a skill body of its own does not
fit. `skills/*/SKILL.md` holds 174 bytes of head-room against 48 983 on `agents/*.md`
(`hooks/lib/__tests__/surface-growth-bound.test.ts`), so the proposal pass attaches to an
existing agent or to a `bin/` helper, which no bound measures. Six further points are
unsettled and named in
`260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md`:
who proposes, which surface carries the invocation, how finely the user confirms, which text
the pass reads, what a second run does with an already-confirmed edge, and who fills a
freshly filed item. One question stands in front of all of them, because it decides what
the pass is aiming at: two open defects
(`260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md`
and
`260911-0715_*_a-depends-on-entry-asserts-an-ordering-where-the-section-it-was-derived-from-asserts-a-conflict.md`)
record that the field's one live value asserts an ordering where the prose it was derived
from asserts a substantive conflict. The field carries one relation; the prose carried
three.

A reader knows this was reached when a run over the store as it stands proposes edges, the
user confirms them, the confirmed edges stand in the field, and `bin/fusion-work-order`
computes an order over more than one node from them.
