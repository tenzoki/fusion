# Four prompts now defer to a routing table that still carries the gap `260811-1301` names

---

**Severity:** Medium — the boundary that four shipped prompts stopped stating for themselves is not stated by the file they now name as the authority
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `agents/coder.md:3,24`, `agents/ontocoder.md:3,7,24`, `agents/planner.md:45`, `README-agents.md:42`, against `agents/orchestrator.md:346-358`
**Cross-references:**
`shared/issues/260811-1301_o_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` (the gap, still open);
`archive/260817-1907-safe-cleanup-scoped/shared/issues/260811-1408_*_the-ontocoder-prompt-still-claims-every-toml-three-times-after-cargo-toml-was-given-to-the-coder.md` and `260811-1411_c_*` (the two records `3b30f5e` closed)

---

## What is wrong

`3b30f5e` replaced four enumerations of the `.toml` / `.json` split with one rule plus a pointer, and
the rule is right. What each of the four now says is that the pointer's target decides the question:

- `agents/coder.md:24` — *"**What decides is the file's role, not its extension**, exactly as
  `agents/orchestrator.md` `## Agent Routing Table` decides it: a `.json` or `.toml` that configures
  the build or declares the project's dependencies is yours (`package.json`, `Cargo.toml`,
  `tsconfig.json`)"*
- `agents/ontocoder.md:24` — *"**The file's role decides, not its extension**, the same rule
  `agents/orchestrator.md` `## Agent Routing Table` routes on"*
- `agents/planner.md:45` — *"`agents/orchestrator.md` `## Agent Routing Table` is the authority"*
- `README-agents.md:42` — *"`agents/orchestrator.md` `## Agent Routing Table` is the authority for
  it"*

The table, read at `agents/orchestrator.md:346-358`:

| Line | Row |
|---|---|
| `:346` | `.go`, `.ts`, `.tsx`, `.py`, `.js`, `.rs`, `.java`, `Makefile`, `go.mod`, `package.json`, build scripts, test files → `coder` — **no `Cargo.toml`** |
| `:347` | `.yaml`, `.json`, `.toml`, `.csv` **in `ontology/`, `manifests/`, or schema directories** → `ontocoder` |
| `:352` | `tsconfig.json`, `vite.config.ts`, `eslint.config.js` → `coder` |
| `:358` | the tiebreaker: *"prefer the agent whose primary domain matches the file's role in the system, not just its extension"* |

So of the three files the four prompts cite as decided there, `package.json` is decided by a row,
`tsconfig.json` is decided by a row, and **`Cargo.toml` is decided by nothing but the tiebreaker
sentence.** `260811-1301` measured exactly this and is still `_o_`.

Second-order: `agents/ontocoder.md:24` says the table "routes on" the file's role. The ontocoder row
routes on the file's **directory**. Directory is a serviceable proxy for role, but a reader sent to
the table to learn the rule finds a different rule stated there.

## Why this is worse than before the commit

Before `3b30f5e`, `agents/coder.md` stated the `Cargo.toml` boundary in its own body and
`260811-1301` was, in its own words, *"a gap, not a contradiction"* — the answer was written down
somewhere. Now four surfaces have dropped their own statement in favour of a pointer, and the
pointer's target does not carry it. Making a text load-bearing is a reason to check it, and it was
not checked.

`260811-1301`'s stated reason for being a record rather than a one-line edit was that
`agents/orchestrator.md` sat outside the dispatching task's disjoint file set. **That reason no
longer holds inside this Turn:** `41d8e2b` and `adaa545` both edit `agents/orchestrator.md`, in the
same three-commit range that rewrote the four siblings to point at it.

## Suggested direction

Close `260811-1301` in the same edit as any further work on this boundary — add `Cargo.toml` to the
`:346` row, or give it a row beside the `tsconfig.json` one at `:352`, which already settled the
identical case of a build configuration carrying another layer's extension. Then either restate the
role rule in the table's tiebreaker in the words the four prompts now quote, or soften the four
"authority" claims to "the routing rules in `agents/orchestrator.md`", so a reader is not sent to
find a sentence that is not there.

## Acceptance criteria

- [ ] `agents/orchestrator.md` `## Agent Routing Table` names `Cargo.toml`.
- [ ] Every file that calls that section "the authority" for the role-not-extension rule can be
      checked against it and finds the rule stated in the same terms.
- [ ] `260811-1301` is closed or its residual is restated.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: All four surfaces still defer to the table (`agents/coder.md:24`, `agents/ontocoder.md:24`, `agents/planner.md:45`, `README-agents.md:45`) and the table still has no `Cargo.toml` row, so the pointer resolves to nothing on the case it is cited for. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
