# Which treatment do the stores and root-anchored files the nomenclature's migration table omits take?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`nomenclature.md` `### Fusion workbench migration` classifies fourteen paths. The layout tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` defines more, and these have no row: the record stores `forum/` (messages left for another checkout) and `discussions/` (the claim register `/fusion:discuss` writes), and the root-anchored surfaces `orchestrator-events.jsonl`, `.commit-lock/`, `.cadence-anchors`, `.session-marker`, `.checkout-id`, `.asset-provenance` and the `monitor` binary. Read against the ownership boundary, the two stores are Fusion record kinds the concept has not named and the seven root surfaces are runtime state, sessions and persistence that Prior owns. Part (2) needs a treatment for each, and the part (1) spec refuses to invent one; the gap is reported to the nomenclature's author instead. Filed so the report is citable.

## Options

1. **Ask the nomenclature's author to extend the table** with one row per omitted path, and treat every omitted path as Retain until then.
   - Pros: the table stays the single naming index; no name is invented in a workbench rule.
   - Cons: part (2) waits on the extension for these nine paths.
2. **Classify them in the part (2) spec by the boundary alone**: `forum/` and `discussions/` Retain as record kinds (naming rule 7, they are named for their records), the seven root surfaces to Prior's runtime records when that store exists and root-anchored until then (the same treatment `.guard-state/` takes).
   - Pros: part (2) proceeds; the classification follows a rule the nomenclature already states.
   - Cons: a treatment table with two authors.
3. **Rename `forum/` and `discussions/` now** to nouns the concept might prefer, and leave the root files.
   - Pros: none the other two lack.
   - Cons: names invented ahead of the concept, on every consumer's workbench.

## Constraints

- No file moves before the answer: the table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps every omitted path unchanged in name and content.
- The seven root-anchored surfaces are bound to fixed root-relative paths by consumers with no fallback (`## fusion-workbench Layout`, "The root-anchored surfaces are not negotiable"); any answer that moves one names every consumer and changes them in the same commit.
- The answer is realised by part (2), whose spec cites this record.

## The Prior builder's treatment table (260924, adopted by the user verbatim)

The nomenclature describes a naming direction, not a complete migration contract; paths it does not list are neither released for deletion nor already replaced. Until each entry carries an owner, retain-or-replace, the handling of existing content, and a checkable removal condition, the inventory stays untouched.

| Entry | Target and treatment |
|---|---|
| `forum/` | Retain first and classify by content. Durable posts and results stay Fusion content; pure message delivery belongs to Prior. A blanket rename without checking the old format would be wrong. |
| `discussions/` | Discussion results and their evidence stay durable Fusion records. Participant runs, messages, budgets and running state are Prior's. Old discussions do not become active Prior sessions by import alone. |
| `orchestrator-events.jsonl` | Retain as historical evidence. New runtime events go to the Prior journal; Fusion may derive views from it. Old events must not re-trigger actions or approvals on import. |
| `.commit-lock/` | Its function moves to Prior's git and lock service. An existing old lock is retired only after checking its holder and running operations; parallel operation needs an agreed locking strategy. |
| `.cadence-anchors` | The domain rules stay Fusion's (for example when a review is due). Execution counters and durable checkpoints belong to the state models meant for them. Anchors migrate with their meaning, so due reviews are not reset by accident. |
| `.session-marker` | Replaced by Prior's session and run management. An old marker stays diagnostic material; it is not sufficient evidence of a resumable session. |
| `.checkout-id` | Replaced by Prior's local checkout binding. The old identifier must be mapped for existing references; it must not carry rights or local bindings over to copied checkouts. |
| `.asset-provenance` | Retain until a replacement exists. It holds the checksums of copied assets, the monitor included, the baseline for detecting local changes on update; it belongs to install and update management, not to the event journal. |
| `monitor` | Its function stays required: a read-only view of Fusion and Prior state. The copied monitor is adapted or functionally replaced; an existing Prior CLI is not yet a full replacement. |

The builder's note that `forum/`, `discussions/`, `.commit-lock/` and `.cadence-anchors` are absent holds for its checkout, not for this repository's workbench, where all four exist.

---
Answered: 260922-1059_*_which-treatment-do-the-stores-and-root-files-the-nomenclature-table-omits-take.md `## The Prior builder's treatment table (260924, adopted by the user verbatim)` — option 1 in substance, with the table above as the direction: the inventory stays untouched until the nomenclature gives each omitted entry an owner, retain-or-replace, the handling of existing content and a checkable removal condition; that completion is the nomenclature author's (the Prior side); ruled by user, Kai Stalmann <ks@qantr.com>
