# The coder scope sentence carves `.toml` out of its own exclusion list and leaves `.json` standing

---
**Severity:** Low — the same contradiction in the same sentence, half resolved
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `619dfb7`, task 35)
**Affects:** `agents/coder.md:19-24`
**Cross-references:** `260811-1408_*_the-ontocoder-prompt-still-claims-every-toml-…` ; `260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-…`

---

## The defect

`agents/coder.md` lists what the coder owns:

```
- `.go`, `.ts`, `.tsx`, `.py`, `.js`, `.rs`, `.java`
- `Makefile`, `package.json`, `go.mod`, `Cargo.toml`, build scripts
```

and then what it does not:

> You do NOT edit structured data files (`.yaml`, `.json`, `.csv`, ontology, manifests, schemas,
> fixtures, and every `.toml` that is not a build manifest).

`.json` is in the exclusion list while `package.json` is in the ownership list two lines above,
and the sentence goes on to cite `tsconfig.json` as *"the coder's"* one clause later. So the file
excludes `.json`, claims two named `.json` files, and cites a third as precedent for the rule it
just applied to `.toml` only.

Before `619dfb7` the sentence had the same shape for both extensions: `.toml` and `.json` were
both excluded and `package.json` was both excluded and owned. The commit resolved the `.toml`
half — correctly, and with the right principle stated (*"it is the file's role in the build rather
than its extension that decides"*) — and left the `.json` half exactly as it was.

## Why it is worth a record rather than a shrug

The principle the commit added is general and is stated in the same sentence as the contradiction
it does not resolve. A reader who takes the principle at face value has to decide whether the
`.json` exclusion means what it says or means what `.toml`'s now means, and the file gives both
answers within four lines.

## Fix direction

One edit: apply the principle to the extension list rather than to one extension.

> You do NOT edit structured data files (`.yaml`, `.csv`, ontology, manifests, schemas, fixtures,
> and every `.json` or `.toml` that is not a build manifest or build configuration).

That is the same rule `README-agents.md`'s ontocoder row now states for `.toml`, and it makes a
fourth manifest need no further edit.

---
Resolved: The sentence now states the rule instead of the exception, and takes its formulation from
`agents/orchestrator.md` `## Agent Routing Table` rather than inventing a third one. `agents/coder.md:24`
reads: what the coder does not edit is ontology, manifest, schema or fixture data — the `.yaml`,
`.json`, `.toml` and `.csv` files that carry it, wherever they live — and **what decides is the
file's role, not its extension**, with `package.json` / `Cargo.toml` / `tsconfig.json` named as the
build side and "the same extension holding ontology entries or manifest data" as the ontocoder's.
No extension is now both claimed and excluded. `tsconfig.json` joined the ownership list two lines
above, since the sentence had been citing it as precedent without the file listing it.

The frontmatter `description` at `:3` carried the identical asymmetry (`.json` excluded, `.toml`
carved out) and was corrected with it — the record scoped itself to `:19-24`, but leaving the
description in the old shape would have been the fifth instance this dispatch exists to prevent.

One measured side effect, not a defect: the pinned false-positive count in
`hooks/lib/domain-cascade.ts` `REACH.holes[0].cost` moved 14 → 13, and the generated paragraph in
`README-hooks.md` was regenerated to match. The old sentence contained the adjacent words "data
files", which made it one of the honest-prose lines a bare-word widening of the domain-cascade gate
would falsely select; the new wording separates them. `domain-cascade.test.ts` re-measures both
numbers, which is how the change announced itself.
