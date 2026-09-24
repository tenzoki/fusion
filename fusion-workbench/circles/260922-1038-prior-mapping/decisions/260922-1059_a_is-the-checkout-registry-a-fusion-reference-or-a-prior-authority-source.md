# Is the checkout registry in `checkouts/` a Fusion module reference or a Prior authority source?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`shared/checkouts/` holds one entry per checkout, written by `bin/fusion-checkout-name` and nothing else, and joins a checkout's eight hex characters to a person and an alias for `bin/fusion-events presence` and `/fusion:news`. The nomenclature marks it Review: "checkout identity belongs to Prior; retain Fusion files only when they are module references rather than an authority source". Whether the registry asserts who a checkout is (authority) or merely names one for display (reference) decides whether it stays in the workbench. Filed so part (2) rules on it.

## Options

1. **Keep the store as reference data** (a display alias per checkout, no authority), and say so in its helper's header.
   - Pros: nothing in fusion decides permission or ownership from it today; the claim on a work package compares the checkout identifier alone (`## Backlog entries`), never the registry.
   - Cons: the registry also carries the person, which is the join `bin/fusion-events presence` counts by, and a reader could take that as authority.
2. **Move checkout identity to Prior** and keep only a reference file per checkout that points at Prior's record.
   - Pros: the ownership boundary as the nomenclature draws it.
   - Cons: Prior's registry does not exist yet, and the entry grammar is a fusion helper's contract today.
3. **Retire the store** and resolve names from git identity alone.
   - Pros: one store fewer.
   - Cons: two checkouts of one person share one git identity, which is the case the registry exists to separate.

## Constraints

- No file moves before the answer: `nomenclature.md` `### Fusion workbench migration` says its table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps this store unchanged in name and content.
- The answer is realised by part (2), the consumer migration, and its spec cites this record; part (1) reads and writes the store where it stands today.
- Every citation of a record in this store keeps resolving through the move, whatever the answer: the basename is the citation, the store is not (`rules/fusion-workbench-conventions.md` `## Filename Patterns`).

---
Answered: 260922-1059_*_is-the-checkout-registry-a-fusion-reference-or-a-prior-authority-source.md `## Options` — a split, closest to option 2: Prior owns the project ID, the checkout ID and its own workspaces (it partly manages them already); Fusion keeps the person, the checkout alias and the git identity for now, in `shared/checkouts/`, `bin/fusion-checkout-name` and `bin/fusion-identity`. The eight hex characters `bin/fusion-identity` mints today are taken from Prior once Prior supplies a checkout ID, and the registry keeps joining them to person and alias; ruled by user, Kai Stalmann <ks@qantr.com>
