# Does the Plane mirror stay strictly push-only, or gain a bounded read path to converge with Martin's story-driven workflow?

---
**Domain:** code
**Status:** implemented
**Filed by:** analyst
**Cross-references:** shared/decisions/260716-1847_i_plane-rolle-source-of-truth.md (D1 — refined here, not superseded), shared/decisions/260716-1847_i_offline-verhalten-bei-plane-ausfall.md (D3), circles/260719-1536-plane-mirror-integration/_c_circle.md (the Circle this reshapes), shared/analyses/260719-2141-plane-mirror-martin-convergence-feasibility.md (the analysis that raised this), /Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator/MARTIN.md (the workflow to converge with)

---

## Question

Decision D1 answered "Plane's role = mirror, push-only; files + git = source of truth; never read back." That answer bundled two invariants that are in fact separable: (i) *files = source of truth* (nothing silently overrides the files) and (ii) *push-only* (fusion never reads anything from Plane). Martin — already a regular fusion user — runs a verified two-way, story-driven Plane workflow whose single most-used entry point, `/new-fe-feature <seq>`, **reads a Plane story once** and uses it as the work brief. A strictly push-only mirror gives him nothing over his own tooling, so he would not adopt regular fusion. The question, now that convergence with Martin is a goal: does the Plane Circle stay strictly push-only (a), or gain one bounded, command-driven seeding read (b), or go full bidirectional / Plane-as-driver (c)? It must be answered before the Circle is activated, because it sets the Circle's scope and it is Martin's adoption that hangs on it.

## Options

1. **(a) Strictly push-only mirror** — the current Directive, unchanged. fusion pushes Circles/issues/decisions to Plane and never reads.
   - Pros: preserves both invariants fully; smallest scope; no ID-mapping-for-read, no fallback for a failed read; ships fastest.
   - Cons: gives Martin nothing he does not already have — he cannot seed a Circle from a Plane story, his core habit. He keeps his bespoke `/new-fe-feature` / `/finish-fe-feature` setup and does not adopt regular fusion. Convergence goal unmet.

2. **(b) Bounded bridge — push-only continuous, plus one explicit-command one-shot seeding read** — the mirror backbone stays push-only (C3 + C4 unchanged); additionally, on explicit user command, fusion reads one named Plane issue's description once and writes it straight into the new Circle's Grounding/spec, after which files are authoritative and Plane is not consulted about it again.
   - Pros: preserves *files = source of truth* (the read is materialised into a file and then inert — it is an input event, not a competing authority) and preserves C4 (the continuous channel is unchanged; the seeding read is an explicit online action that fails loudly and falls back to manual paste, reusing Martin's own doctrine). Gives Martin the activate-from-story ergonomics that make Plane his work instrument, now inside regular fusion. No webhooks (reads on command, so Plane's double-webhook problem #7249 never arises). Small addition on top of the mirror — the file↔ID map it needs is already required for idempotent push.
   - Cons: relaxes the *push-only* invariant (not the SoT invariant). Introduces one read path with its own failure mode and a `sequence_id`→Circle mapping. Slightly larger scope than (a).

3. **(c) Full bidirectional / Plane-as-driver** — Plane holds the work queue authoritatively; fusion reads state, seeds work, and writes back continuously.
   - Pros: closest to Martin's running model; human edits in Plane take effect immediately.
   - Cons: breaks *files = source of truth* (work queue leaves git audit) and breaks C4 (the 60/min rate-limit gates the Turn loop; offline dies). This is exactly D1's declined Options 2/3. Requires a full conflict model and idempotency against double-webhooks. Rejected in the analysis.

## Constraints

- files + git = source of truth, and fusion works offline (C4), are protected core features (user, binding — D1/D3). Any answer must preserve the *source-of-truth* invariant; only the stricter *push-only* implementation choice is on the table.
- A failure must never be silent (C4; `HYG-NO-SILENT-FAIL` where the target project's coding-hygiene rules apply).
- Plane enforces 60 requests/min/client.
- The Pages API is unreachable on self-hosted; prose docs stay files (unchanged by this decision — it concerns the work queue only).
- The API key stays in an environment variable, never in a file an agent reads (conventions `## Security`).

## Recommendation

**Option (b), narrowly scoped.** It is the only option that serves both goals at once: it keeps C4 and *files = source of truth* intact while giving Martin the one thing that would make him switch — seed-a-Circle-from-a-Plane-issue. The key realisation is that "push-only" and "files = source of truth" are different invariants; a one-shot seeding read, materialised immediately into a file, violates only the former. This refines D1 rather than overturning it: the user's protected intent ("files are authoritative; Plane is for reading along and coordinating") is untouched. Keep the seeding read command-driven and one-shot — no continuous read-back, no webhooks, no conflict model — so the scope stays small and the invariant stays clean. If the user prefers to ship the pure mirror first and defer convergence, option (a) is the honest fallback and this decision becomes "defer to a later Circle."

---
Answered: circles/260719-1536-plane-mirror-integration/_c_circle.md (## Directive + ## Grounding snapshot, reshaped 2026-07-19) — user chose option (b), the bounded bridge: push-only continuous mirror (C3 + C4 unchanged) plus one explicit-command one-shot seeding read that materialises a named Plane issue into a new Circle's Grounding, after which files are the source of truth. Basis: shared/analyses/260719-2141-plane-mirror-martin-convergence-feasibility.md §5 (Variant B Directive) and §3 (the push-only vs source-of-truth invariant split). Refines D1 (shared/decisions/260716-1847_i_plane-rolle-source-of-truth.md), does not supersede it. The sibling concurrency decision (shared/decisions/260719-2141_a_concurrency-worktree-slots-vs-single-active-circle.md) stays open for the planner.
Implemented: `bd62bf1` — the bounded bridge shipped whole. Verified 260731-2324 (reconciler): `bin/fusion-plane seed <seq>` is "Bounded one-shot read: resolve sequence_id, GET the ..." (`:1511`) with its own `cmd_seed` dispatch (`:1544`); the user surface is `skills/seed-from-plane/SKILL.md`. The push side stayed push-only (C3 + C4 unchanged, per D1 above). The write-safety invariant the option turned on was hardened separately in `a7eccbe` ("never overwrite a seeded issue's story description — state-only writes") and is covered by the tests "a fresh create is full-scope — fusion authors the issue it POSTs" and "the seed flag survives a state sync" (`hooks/lib/__tests__/fusion-plane.test.ts`; suite green 316/316, run 260731-2324). Shipped in v5.5.0.
Deferred:
Superseded by:

---
Retired: `d0ddabb` (step 2 of circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md), with the seeding skill removed by `1e29572` (step 12) — both halves of the answer are gone: the push-only mirror and the one bounded read (`fusion-plane seed` / `/fusion:seed-from-plane`) it was widened by.
