# Decision Record — Worked Examples

Companion to `fusion-workbench-conventions.md`. Three end-to-end examples showing how a decision file moves through the marker vocabulary `[o] → [a] → [i] → [s]` (and one `[o] → [d]`). Optional reading; the conventions file is normative.

---

## Example 1 — Happy path: `[o] → [a] → [i]`

**Initial state — filed by shaper after the user said "we'll need to pick a vector store, but not now":**

`fusion-workbench/decisions/0501-1430[o]-vector-store-pick.md`:

```markdown
# Which vector store for v1?

---
**Domain:** code
**Status:** open
**Filed by:** shaper
**Cross-references:** issues/0430-1900[o]-rag-sanitisation.md

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
Answered: analyses/0501-1730-vector-store-comparative.md §5 — sqlite-vss selected for v1 (matches recommendation; pgvector kept as v1.x escape hatch).
```

Rename file: `0501-1430[o]-vector-store-pick.md` → `0501-1430[a]-vector-store-pick.md`.

**Coder commits the integration — `pkg/vector/sqlite_vss.go` lands:**

Append to file body:

```markdown
---
Implemented: a3f7c2e — pkg/vector/sqlite_vss.go added; loader wired in pkg/rag/retriever.go.
```

Rename file: `0501-1430[a]-vector-store-pick.md` → `0501-1430[i]-vector-store-pick.md`. Terminal state.

---

## Example 2 — Supersession: `[a] → [s]`

Six months later, a customer crosses 5M vectors and sqlite-vss thrashes. A new decision is filed:

`fusion-workbench/decisions/1107-0915[o]-vector-store-revisit.md` is created (with its own Options, Recommendation, etc.). After the user picks pgvector, it transitions `[o] → [a] → [i]` per Example 1.

The original decision file is then updated:

Append to body of `0501-1430[i]-vector-store-pick.md`:

```markdown
---
Superseded by: decisions/1107-0915[i]-vector-store-revisit.md — sqlite-vss replaced with pgvector after first customer crossed 5M vectors. Original choice was correct for the constraints known at v1; superseded by scale change.
```

Rename: `0501-1430[i]-vector-store-pick.md` → `0501-1430[s]-vector-store-pick.md`.

**`[i]` and `[s]` are both terminal.** Going `[i] → [s]` is the one allowed terminal-to-terminal transition because it records the historical fact that a previously-implemented decision has been overridden.

---

## Example 3 — User defers: `[o] → [d]`

The user reads the open decision, decides "not now":

Append to body of `0501-1430[o]-vector-store-pick.md`:

```markdown
---
Deferred: v1.x — pilot customers expected at <1M vectors; revisit when first customer crosses 500k. Deferred per user 2026-05-12.
```

Rename: `0501-1430[o]-vector-store-pick.md` → `0501-1430[d]-vector-store-pick.md`.

Skipping `[a]` is fine — the deferral itself is the answer.

---

## Anti-patterns

- **Don't rename `[i]` back to `[o]` or `[a]`** to "reopen" an implemented decision. File a new decision (which can `Supersede` the old one).
- **Don't omit the cited path** in `Answered:` / `Implemented:` / `Superseded by:` lines. The whole point of the vocabulary is traceability.
- **Don't use `Resolved:`** in decision files — that footer is for `issues/` only. Use the marker-specific footer.
- **Don't use the issue-state vocabulary `[c]`** in decisions. Decisions never close — they answer, implement, defer, or get superseded.
