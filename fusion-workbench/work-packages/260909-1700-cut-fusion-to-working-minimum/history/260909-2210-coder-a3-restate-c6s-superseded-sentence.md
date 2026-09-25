# A3 — restate C6's superseded sentence

---
**Agent:** coder
**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Status:** Complete
**Plan:** 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md, step A3
**Decision realised:** 260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md, option 3

---

## What was asked

Bring `### C6: The portfolio layer becomes a flat list` in the cut specification into line with the
ruling that the order over work items is computed rather than the user's to set. Two changes in C6
and nothing else anywhere in the spec.

## What was done

One file touched: `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`.

1. In C6's `What replaces it:` paragraph, `Order is the user's and is not computed.` became
   `Order is computed from confirmed prerequisite edges and reported; the user overrides it where he
   wants to.`
2. C6's `**Decisions made:**` list gained one entry recording that the work-item file carries a
   machine-readable dependency field from its first version, citing the decision record and its
   option. That is the constraint the record names as having to be specified before the migration
   rather than retrofitted over every item afterwards.

No helper was planned or built. That is a different unit of work and was out of scope.

## What was deliberately left alone

C6 still carries, further down: "The ranking rename between open and recommended goes entirely,
because it is computed order and C6 makes order the user's." Its conclusion survives the ruling —
the rename goes — but its stated reason no longer holds, since C6 no longer makes order the user's.
The dispatch forbade edits to neighbouring sentences, so it stands and is reported instead.

## Verification

`npx vitest run workbench-citation-lint` — exit 1. The single failure is the pre-existing basename
collision between `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md`
and `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md`, filed as
`260909-1455_*_an-analysis-and-its-history-file-share-one-basename-and-the-citation-gate-is-red.md`.
The twelve citation-resolution tests pass, so the citation added here resolves. No new violation.

`grep -c "is not computed"` on the spec returns 0.
