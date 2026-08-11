# The ontocoder prompt still claims every `.toml`, three times, after `Cargo.toml` was given to the coder

---
**Severity:** Medium — two agent prompts now answer the same ownership question differently, and sub-agents share no memory, so whichever prompt is loaded decides
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `619dfb7`, task 35)
**Affects:** `agents/ontocoder.md:2`, `:7`, `:24`
**Cross-references:** `shared/issues/260811-1301_o_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` (the routing-table half of the same edit, already filed); `agents/coder.md:2`, `:24`; `README-agents.md` ontocoder row

---

## The defect

Commit `619dfb7` settled `Cargo.toml` on the coder and updated two surfaces:

- `agents/coder.md:24` — *"The one `.toml` that is yours is the build manifest — `Cargo.toml` is
  the coder's for the same reason `Makefile`, `go.mod` and `package.json` are"*
- `README-agents.md` ontocoder row — *"`.toml` (except build manifests such as `Cargo.toml`,
  which are the `coder`'s)"*

`agents/ontocoder.md` was not touched, and it claims `.toml` unconditionally in three places:

| Line | Text |
|---|---|
| `:2` (frontmatter `description`) | `Use this agent to edit structured data and ontology files (YAML, JSON, TOML, CSV, schemas, manifests, term mappings, stats).` |
| `:7` (body lede) | `You read, modify, and validate **data files** (YAML, JSON, CSV, TOML, XML, ontology files, manifests, schemas, fixture data).` |
| `:24` (owned file types) | `- Structured data files: `.yaml`, `.yml`, `.json`, `.toml`, `.csv`, `.tsv`, `.xml`, `.ndjson`` |

So `README-agents.md` and `agents/ontocoder.md` now directly contradict each other about the
ontocoder's own scope, and `agents/coder.md` and `agents/ontocoder.md` each claim `Cargo.toml`.

## Why it matters more than a doc mismatch

The `:2` line is the frontmatter description, which is what a dispatcher reads when choosing an
agent. Sub-agents share no memory, so a coder and an ontocoder dispatched in the same session each
hold only their own prompt, and each is told the file is theirs. `agents/coder.md:24` instructs
the coder to *"stop and file an issue for `ontocoder`"* on a data file; the ontocoder receiving
that issue has no text telling it to hand a `Cargo.toml` back.

Record `260811-1301` covers the orchestrator's routing table and correctly calls that one *"a gap,
not a contradiction"* — the ontocoder row there is already scoped to `ontology/`, `manifests/` and
schema directories. This is the contradiction the routing-table record explicitly is not.

## Why it survived

The task's file set was `agents/coder.md` and `README-agents.md`, disjoint from the other three
tasks in that batch. The ontocoder prompt was out of it, the same way the orchestrator prompt was.
The record for the orchestrator half was filed; this half was not.

## Fix direction

Make the three ontocoder lines say what `README-agents.md` already says: `.toml` except build
manifests. `:2` is the load-bearing one. Keep the phrasing to the same role-not-extension rule
`agents/coder.md:24` states, so a fourth build manifest needs no fourth edit.
