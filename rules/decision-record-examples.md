# Decision Record: Worked Examples

**Provenance:** No motivating record recoverable; introduced in `git:b05b423`.

Companion to `fusion-workbench-conventions.md`, which is normative. Three end-to-end examples of a decision's `control.state` moving `open → answered → implemented → superseded`, and once `open → deferred`, each move one `transition` of `"$FUSION_PLUGIN_ROOT/bin/fusion-write"` (`W` below) beside the narrative line its `### Decision files` spells.

---

## Example 1: Happy path: `open → answered → implemented`

**Filed by requirements-designer after the user said "we'll need to pick a vector store, but not now".** No package is claimed, so `$OUT_DECISION` is the shared store; the narrative `260501-1430-vector-store-pick.md` is written first, then `W create --kind decision --narrative-file <it> --origin user-request --actor requirements-designer` writes `260501-1430-vector-store-pick.record.json` beside it at `open`. `D` below is that control path.

```markdown
# Which vector store for v1?

---
**Domain:** code
**Filed by:** requirements-designer, Ada Lovelace <ada@example.com>
**Cross-references:** 260430-1900_*_rag-sanitisation.md

---

## Question

The RAG pipeline needs a vector store for chunk retrieval. Open at v1: which library / service?

## Options

1. **sqlite-vss** — embedded, single-file, no extra service. Pros: zero ops. Cons: limited scaling beyond ~1M vectors.
2. **pgvector** — PostgreSQL extension. Pros: SQL semantics, mature ops. Cons: requires Postgres.
3. **Pinecone (managed)** — hosted. Pros: scales freely. Cons: vendor lock-in, egress costs.

## Constraints

- Must run offline (no internet at customer site).

## Recommendation

sqlite-vss for v1; revisit if a customer crosses 1M vectors.
```

**The state-auditor's next pass** (an analyst report selected sqlite-vss) reports where the answer sits and transitions nothing. Only the orchestrator moves a decision to `answered`, and only to relay a ruling the user gave. **Once the user has ruled**, it appends

```markdown
---
Answered: 260501-1730-vector-store-comparative.md `## Recommendation` — sqlite-vss for v1; ruled by user, Ada Lovelace <ada@example.com>.
```

and runs `W transition --actor orchestrator --record "$D" --to answered --reason "user ruled" --answer-ref '"260501-1730-vector-store-comparative.md"'`.

**The code-implementer integrates it** and appends `Implemented: pkg/vector/sqlite_vss.go — added; loader wired in pkg/rag/retriever.go.`; the orchestrator, its `Verification:` line read, commits (`a3f7c2e`) and runs `--to implemented --implementation-ref '"a3f7c2e"'`. Terminal.

---

## Example 2: Supersession: `implemented → superseded`

Six months later a customer crosses 5M vectors. `261107-0915-vector-store-revisit.md` is filed and, once the user picks pgvector, moves as in Example 1. The original then gains `Superseded by: 261107-0915-vector-store-revisit.md — replaced by pgvector after a customer crossed 5M vectors; correct for v1's constraints.` and `--to superseded --superseded-by '{"workbench_id":"<w>","record_id":"<r>","display":"261107-0915-vector-store-revisit.md"}'`, the two ids from `bin/fusion-record` `show` of the new record.

**`implemented` and `superseded` are both terminal.** The edge between them is the one allowed terminal-to-terminal transition.

---

## Example 3: User defers: `open → deferred`

The user reads the open decision and says "not now". The narrative gains `Deferred: v1.x — pilot customers expected below 1M vectors; revisit at 500k; ruled by user, Ada Lovelace <ada@example.com>.` and the record `--to deferred --deferral '{"target":{"kind":"external","name":"v1.x"},"ruled_by":{"actor":"user","person":"Ada Lovelace <ada@example.com>"}}'`. Skipping `answered` is fine: the deferral is the answer.

---

## Anti-patterns

- **Don't "reopen" an implemented decision.** No edge leads back; file a new decision, which may supersede the old one.
- **Don't omit the cited path** in `Answered:` / `Implemented:` / `Superseded by:` lines or their refs. Cite a heading anchor, never `path:line`, and **don't omit `ruled by`** on `Answered:` / `Deferred:`: only those two record a ruling nothing on disk confirms.
- **Don't use `Resolved:`** or an issue's `closed` in decision files. Decisions never close: they answer, implement, defer, or get superseded.
- **Don't edit the control file or rename the narrative.** The state is `control.state`, written by the codec alone.
