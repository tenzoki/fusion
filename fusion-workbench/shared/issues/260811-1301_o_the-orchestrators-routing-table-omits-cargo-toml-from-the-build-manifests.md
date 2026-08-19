The orchestrator's routing table omits `Cargo.toml` from the build manifests

---

`agents/orchestrator.md:346` routes to `coder` anything touching `.go`, `.ts`, `.tsx`, `.py`, `.js`, `.rs`, `.java`, `Makefile`, `go.mod`, `package.json`, build scripts or test files. `Cargo.toml` is absent from that list even though `.rs` sits in it: the language is routed, its build manifest is not.

---

**A gap, not a contradiction.** The ontocoder row at `:347` restricts its `.toml` to `ontology/`, `manifests/` and schema directories, so a `Cargo.toml` at a workspace root falls under neither row, and the tiebreaker below the table (`:358`, "prefer the agent whose primary domain matches the file's role in the system, not just its extension") points at `coder`. The table already yields the right answer today, but by way of its catch-all sentence rather than by a row.

Since 260811 `agents/coder.md:2` and the `## Scope` section of that same file state explicitly that `Cargo.toml` is the coder's, for the same reason `Makefile`, `go.mod` and `package.json` are. The routing table is where the orchestrator actually decides this question; while it does not name the manifest, the boundary is stated only in the executor's self-description.

**Proposal.** Add `Cargo.toml` to the coder row at `:346`, beside `go.mod` and `package.json`. Alternatively give it a row of its own in the shape of the existing `tsconfig.json` row at `:352`, which already settled exactly this case: a build configuration carrying another layer's extension.

**Why this is a record rather than a passing edit.** `agents/orchestrator.md` was outside the file set of the task this was found under (Task 35, the coder-Rust task on `circles/260801-1244-guard-rules-write/issues/260805-1830_*_die-coder-beschreibung-nennt-rust-nicht-die-sprache-des-groessten-beobachteten-einsatzes.md`, whose files are `agents/coder.md` and `README-agents.md`). The four tasks in that batch were dispatched on explicitly disjoint file sets, and editing the orchestrator prompt would have broken that guarantee.

**Severity:** Low. No routing failure is observed or predicted; the tiebreaker covers the case.

**Filed by:** coder, while closing `circles/260801-1244-guard-rules-write/issues/260805-1830_c_die-coder-beschreibung-nennt-rust-nicht-die-sprache-des-groessten-beobachteten-einsatzes.md`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The coder row of `agents/orchestrator.md` `## Agent Routing Table` still lists build manifests without `Cargo.toml`, and no dedicated row exists beside the `tsconfig.json` one. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
