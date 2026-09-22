# Depends-on edges are proposed from the prose and confirmed by the user

---
**Domain:** code
**Status:** claimed
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260922-0700
**Active spec/plan:** 260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md (the spec), 260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md (the plan drawn from it, and the one carrying the stopping section)
**Depends-on:** 260918-0706-strike-unconfirmed-depends-on-entry.md
**Cross-references:** 260917-1338-depends-on-kanten-automatisch-erzeugen.md, 260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md, 260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md, 260911-0715_*_a-depends-on-entry-asserts-an-ordering-where-the-section-it-was-derived-from-asserts-a-conflict.md, 260908-2018-prerequisites-confirmed-once-order-computed.md, 260909-1700-cut-fusion-to-working-minimum.md, 260912-0438-human-facing-docs-leave-claude-md.md
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

---
Split 260918-0706. The correction half left as
`260918-0706-strike-unconfirmed-depends-on-entry.md`, which this item now names as its
prerequisite: two jobs with different blockers, one of them none. The user ruled the split
required — a work item carrying two colliding dependencies must be split — and struck the
spec's three-candidate-edge stopping condition in the same breath, as a rule this project
wrote itself that forbids building the very feature that would produce the edges it demands.


---
Released 260918-1042, on the user's word, by the checkout that built it. **The item stays open
because the job is not finished, not because it stalled.** What it asked for is shipped: a run
over the store proposes edges, the gate is the user's, and confirmed entries reach the field.
That went out as `v11.7.0` and, with the two rulings that followed, as `v11.8.0`.

What the next party takes on, all three of them the user's to settle rather than anyone's to
implement:

- **The yield has no upper bound.** Nothing in the prompt limits how many proposals one run can
  put at the gate. What holds it today is a seven-item store and the legacy-status exclusion, and
  neither scales. Open at `260918-0824_*_the-container-hop-voided-the-only-stated-mitigation-for-flooding-the-gate.md`.
- **A fresh survey is owed.** The only ledger a run has ever produced is
  `260918-0738-curator-run.md`, written against text that has since been repaired five times. Its
  two entries are not judgeable as they stand: both lack the per-endpoint provenance the current
  text requires, and one is labelled for a group the current text would route differently. The run
  writes nothing, so it costs a dispatch and no risk.
- **The acceptance's last quarter is unmet by construction.** Three of its four halves hold. The
  fourth asks for an order over more than one node, and the store holds one live item, so it is
  reachable only once the backlog grows — which is the user's act and nobody else's.

Two open decisions carry the rest: whether a proposal may point at an item whose text it never
read is answered and implemented, and so is how a rejection is remembered. Neither is a blocker
for whoever picks this up.
