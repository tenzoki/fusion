The Circle record's title and Dependencies section still name the conventions file as the validation case

---
The re-sharpening on 2026-08-14 replaced this Circle's `## Directive` and `## Grounding snapshot`,
moving the validation case from capability C9 (reconcile, compact, partition and scope
`rules/fusion-workbench-conventions.md`) to the project's decision corpus. Two places in the same
record still describe the old scope and now contradict the Directive above them.

---
**Where.** `circles/260801-1244-curator/_a_circle.md`:

- Line 1, the title: "The curator reconciles the three normative surfaces, and proves it on
  fusion's own conventions file". The proof is now the decision corpus: 82 records, none marked
  superseded.
- `## Dependencies`: the hard dependency on `260801-1244-rule-provenance-header` is justified by
  the shards the partition would produce, and the embedded Mermaid diagram carries the same
  reasoning. C9 is out by user direction, so no partition happens in this Circle and the stated
  justification no longer holds. Whether the dependency itself survives on other grounds is not
  settled here.

**Why it was left.** The shaper's portfolio-activation mode may edit exactly two sections of a
Circle record, `## Directive` and `## Grounding snapshot`, plus the `**Active spec/plan:**` head
field. It reported both spots rather than exceeding that scope, which is correct behaviour. The
orchestrator's own write access to a Circle record is the Closure note, the Turn log and the three
head fields, so neither party in the session that caused the contradiction was permitted to
resolve it.

**Consequence if it stands.** The title is what `portfolio.md` renders and what `/fusion:next`
reads out, so the portfolio will advertise a validation case this Circle no longer has. A reader
who stops at the title gets the retired scope.

**Not blocking activation.** The Directive and the Grounding are current, and the spec at
`planning/260814-0738_o_spec-curator.md` is the single source of detail. This is a record that
contradicts itself, not a Circle that is mis-scoped.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`.
