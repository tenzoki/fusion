# Decision Record — Worked Examples

Companion to `fusion-workbench-conventions.md`. Three end-to-end examples showing how a decision file moves through the marker vocabulary `_o_ → _a_ → _i_ → _s_` (and one `_o_ → _d_`). Optional reading; the conventions file is normative.

---

## Example 1 — Happy path: `_o_ → _a_ → _i_`

**Initial state — filed by shaper after the user said "we'll need to pick a vector store, but not now":**

`fusion-workbench/decisions/260501-1430_o_vector-store-pick.md`:

```markdown
# Which vector store for v1?

---
**Domain:** code
**Status:** open
**Filed by:** shaper
**Cross-references:** issues/260430-1900_o_rag-sanitisation.md

---

## Question

The RAG pipeline needs a vector store for chunk retrieval. Open at v1: which library / service?

## Options

1. **sqlite-vss** — embedded, single-file, no extra service. Pros: zero ops, ships in app binary. Cons: limited scaling beyond ~1M vectors.
2. **pgvector** — PostgreSQL extension. Pros: SQL semantics, mature ops. Cons: requires Postgres deployment.
3. **Pinecone (managed)** — hosted service. Pros: scales freely. Cons: vendor lock-in, egress costs.

## Constraints

- Must run offline (no internet at customer site).
- Must support per-tenant isolation.

## Recommendation

sqlite-vss for v1; revisit if a customer crosses 1M vectors.
```

**Reconciler's next pass — analyst has authored a comparative-analysis report selecting sqlite-vss:**

Append to file body:

```markdown
---
Answered: analyses/260501-1730-vector-store-comparative.md §5 — sqlite-vss selected for v1 (matches recommendation; pgvector kept as v1.x escape hatch).
```

Rename file: `260501-1430_o_vector-store-pick.md` → `260501-1430_a_vector-store-pick.md`.

**Coder commits the integration — `pkg/vector/sqlite_vss.go` lands:**

Append to file body:

```markdown
---
Implemented: a3f7c2e — pkg/vector/sqlite_vss.go added; loader wired in pkg/rag/retriever.go.
```

Rename file: `260501-1430_a_vector-store-pick.md` → `260501-1430_i_vector-store-pick.md`. Terminal state.

---

## Example 2 — Supersession: `_a_ → _s_`

Six months later, a customer crosses 5M vectors and sqlite-vss thrashes. A new decision is filed:

`fusion-workbench/decisions/261107-0915_o_vector-store-revisit.md` is created (with its own Options, Recommendation, etc.). After the user picks pgvector, it transitions `_o_ → _a_ → _i_` per Example 1.

The original decision file is then updated:

Append to body of `260501-1430_i_vector-store-pick.md`:

```markdown
---
Superseded by: decisions/261107-0915_i_vector-store-revisit.md — sqlite-vss replaced with pgvector after first customer crossed 5M vectors. Original choice was correct for the constraints known at v1; superseded by scale change.
```

Rename: `260501-1430_i_vector-store-pick.md` → `260501-1430_s_vector-store-pick.md`.

**`_i_` and `_s_` are both terminal.** Going `_i_ → _s_` is the one allowed terminal-to-terminal transition because it records the historical fact that a previously-implemented decision has been overridden.

---

## Example 3 — User defers: `_o_ → _d_`

The user reads the open decision, decides "not now":

Append to body of `260501-1430_o_vector-store-pick.md`:

```markdown
---
Deferred: v1.x — pilot customers expected at <1M vectors; revisit when first customer crosses 500k. Deferred per user 2026-05-12.
```

Rename: `260501-1430_o_vector-store-pick.md` → `260501-1430_d_vector-store-pick.md`.

Skipping `_a_` is fine — the deferral itself is the answer.

---

## Anti-patterns

- **Don't rename `_i_` back to `_o_` or `_a_`** to "reopen" an implemented decision. File a new decision (which can `Supersede` the old one).
- **Don't omit the cited path** in `Answered:` / `Implemented:` / `Superseded by:` lines. The whole point of the vocabulary is traceability.
- **Don't use `Resolved:`** in decision files — that footer is for `issues/` only. Use the marker-specific footer.
- **Don't use the issue-state vocabulary `_c_`** in decisions. Decisions never close — they answer, implement, defer, or get superseded.
