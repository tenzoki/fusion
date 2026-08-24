The Circle record's title and Dependencies section still name the conventions file as the validation case

---
The re-sharpening on 2026-08-14 replaced this Circle's `## Directive` and `## Grounding snapshot`,
moving the validation case from capability C9 (reconcile, compact, partition and scope
`rules/fusion-workbench-conventions.md`) to the project's decision corpus. Two places in the same
record still describe the old scope and now contradict the Directive above them.

---
**Where.** `circles/260801-1244-curator/_*_circle.md`:

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
`planning/260814-0738_*_spec-curator.md` is the single source of detail. This is a record that
contradicts itself, not a Circle that is mis-scoped.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`.

---
**Reconciliation, 2026-08-14 (reconciler, verified at HEAD `18173e1`). Still open, both spots
unchanged.**

`circles/260801-1244-curator/_*_circle.md` line 1 still reads "…and proves it on fusion's own
conventions file", and `## Dependencies` still justifies the hard dependency on
`260801-1244-rule-provenance-header` by the shards a partition would produce. The embedded Mermaid
edge label still carries the same reasoning.

The contradiction is now sharper than when this was filed, because the validation case has actually
run: `circles/260801-1244-curator/history/260814-1332-curator-run.md` proved the agent on the
decision corpus, not on the conventions file, and the Turn-3 review judged both halves of the
Directive met. So the title is not merely lagging a re-shape; it names a proof that a different
artifact has since delivered.

A Circle record is outside the reconciler's write set. This stays for the orchestrator's Phase-4
closure write or a shaper pass. The plan's own second open question — whether the hard dependency
survives on other grounds — is the part this record explicitly declined to settle, and it is still
unsettled.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Byte-unchanged in all three places.**

`_c_circle.md` line 1 still reads *"…and proves it on fusion's own conventions file"*; the `## Dependencies` prose still calls the partition "the first real exercise of that gate"; the Mermaid edge at `:71` still labels it `"lint gate checks the shards"`. The Circle closed `_c_` with the contradiction in it, and a terminal record is not edited — so this record is the correction, and it is where a reader of that title has to arrive. Nothing in the tree points them here.

---
Resolved: moot — a terminal Circle record is not edited, and this record is the correction beside it; `circles/260801-1244-curator/_*_circle.md`.
