# Four low-priority corrections in four disjoint files

**Agent:** coder
**Date:** 2026-08-11 13:03
**Status:** Complete
**Directive context:** cleanup queue — close open findings before new work begins. No Circle active, so every store resolved into `shared/`.

## What was asked

Four independent fixes, batched only because their file sets are disjoint: tasks 30, 33, 35 and 38 of `fusion-workbench/tasklist.md`, each with its own source record.

## Task 30 — cadence frontmatter (`I:260731-2246-cadence-frontmatter`)

`skills/cadence/SKILL.md:2` and `:4`, both still at the line numbers the record gave.

Verified the tool question against the body rather than the record: discovery is `find` (`:114`, with the comment at `:109-113` arguing for it over globbing because it survives a missing directory under zsh), the log units and the chat-voice profile are read with `Read` (`:145`, `:237`), the digest is written with `Write` (`:175`). `Glob` and `Grep` are named nowhere. Dropped both — `allowed-tools: [Bash, Read, Write]`. Nothing is lost by dropping `Grep`: shell `grep` is still reachable under `Bash`, which is what an agent hunting the `## YYYY-MM-DD` day-sections would use anyway.

The description was cut from 891 characters of value to 250. House shape measured first across all 16 skills rather than assumed: the next-longest is `skills/migrate/SKILL.md` at 346, then `circle-stash` 286, `seed-from-plane` and `cleanup` 264, with the bulk between 109 and 220. 250 sits at the top of the 150-250 band the task named and keeps four trigger phrasings, including the three the record asked to keep. What was dropped is body material that does not help routing: the enumeration of the three lists, the source inventory, the `bin/fusion-paths` mention.

The value carries no `: ` sequence, so the unquoted plain scalar stays safe, and the frontmatter still parses to exactly `description`, `argument-hint`, `allowed-tools`.

## Task 33 — cascade reach sentence (`I:260810-2200-cascade-reach-sentence`)

`skills/cleanup/SKILL.md:125`, at the line number given.

Read `REACH` in `hooks/lib/domain-cascade.ts` as the authority: `fileSet` at `:840` is `["agents/*.md", "skills/*/SKILL.md", "rules/*.md"]`, three globs against the sentence's two. Took the record's stronger option rather than the minimal one — the sentence now cites instead of restating. It names `REACH.fileSet` as the file set, points at the `describeReach()` rendering that the suite compares byte-for-byte against `README-hooks.md`, and tells the reader to read the reach off that block rather than off a copy in the skill. A fourth entry in `fileSet` now needs no edit here, which is precisely the drift the record predicted for a restatement.

Nothing was written into `hooks/lib/domain-cascade.ts`; it was read-only for this task, as specified. The new wording contains no domain literal, so it cannot itself trip the gate that scans this file.

## Task 35 — Rust in the coder's description, and the `Cargo.toml` boundary (`I:260805-1830-coder-rust`)

`agents/coder.md:2` and `README-agents.md:27`.

Read `agents/orchestrator.md` `## Agent Routing Table` (`:344-358`) first, as instructed. Two things it already settles: `tsconfig.json` and friends go to `coder` because they are build config carrying a code extension (`:352`), and the ontocoder's `.toml` claim is qualified to `ontology/`, `manifests/` and schema directories (`:347`). The answer that agrees with both is that `Cargo.toml` is the coder's, decided by role in the build rather than by extension.

Written into three places in the two files:

- `agents/coder.md:2` — names Go, Rust, TypeScript, React, Python, Java; owns `.go`, `.rs`, `.ts`, `.tsx`, `.py`, `.js`, `.java`, tests and the build manifests `Makefile`, `go.mod`, `package.json`, `Cargo.toml`; excludes only those `.toml` files that are not build manifests. This puts the routing metadata back in agreement with the Scope list at `:19-20`, which the record correctly said had drifted apart inside one file.
- `agents/coder.md` `## Scope` — the boundary stated outright, citing the `tsconfig.json` precedent in the orchestrator's table by name so the two cannot be read as independent rulings.
- `README-agents.md:27` (coder row) and `:28` (ontocoder row). The ontocoder row had to move in the same edit: it claimed `.toml` unconditionally, and leaving it would have made the two adjacent rows contradict each other on `Cargo.toml`.

**Frontmatter caution honoured.** The description value contains no `: ` sequence; the block parses to exactly `name` and `description`; `claude plugin validate .` passes with only the pre-existing CLAUDE.md-at-plugin-root warning.

**Left open, filed rather than fixed.** `agents/orchestrator.md:346` lists the build manifests without `Cargo.toml`. It is a gap and not a contradiction — the ontocoder row does not claim a root `Cargo.toml`, and the table's tiebreaker at `:358` points at the coder — but the routing table is where the orchestrator actually decides this, and it should say so in a row. That file was outside this task's file set and the batch was dispatched on explicitly disjoint file sets, so the proposal went to `shared/issues/260811-1301_o_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md`.

**Noticed, not filed.** `README-agents.md:29` describes `coderev` as reviewing "Go / TS / Python code" — the same omission one row down, for the reviewer rather than the executor. It is outside both the record's claim and the task's site list, and it is mentioned here rather than filed because the coder row's fix does not depend on it.

## Task 38 — template provenance placeholder (`I:260802-1256-template-placeholder`)

`templates/investigator-capture-layout.md:3`, with `:7-8` deleted. Both at the line numbers given.

`:3` now reads `**Provenance:** <the record, Circle, or commit that motivated your project's capture layout>`, so the lede's own instruction — fill in every `<bracketed placeholder>` — reaches it. The sentence at `:7` that documented the hazard ("It carries no angle brackets, so it is easy to read past") and its `>` separator at `:8` are gone; the lede and the halt note are untouched.

Wording checked against `rules/rule-file-provenance.md`: the three legitimate citation forms are a decision record, a Circle directory, and the admission plus introducing commit. "record, Circle, or commit" names all three without pushing a consuming project toward fusion's own path shapes.

Checked what the lint has to say about templates before choosing wording, as instructed: nothing. `hooks/lib/__tests__/provenance-header-lint.test.ts` builds its file set from `gatedFiles()` at `:117-118`, which reads the plugin's own `rules/` only. No test constrains this file, and none had to be added — the copy a project makes lands in its own `./rules/`, which is in no test set fusion controls.

## Line numbers

Every site was where the record and the task said it was. No record's line numbers had moved, so nothing was edited by resemblance.

## Verification

`cd hooks && npm test` — exit 0, 48 files, 1246 tests passed. Run after all five source-file edits and before any workbench bookkeeping. Matches the stated baseline at HEAD `7749845`.

`claude plugin validate .` — exit 0, "Validation passed with warnings", the one warning being the pre-existing CLAUDE.md-at-plugin-root notice unrelated to this work.

## Bookkeeping

Four source records carry a `Resolved:` note and were renamed `_o_` → `_c_` in place; the two inside closed Circles stayed in their Circles, per the Origin Rule. The four tasks are ticked `[x] done` in `tasklist.md` and their `**Source:**` lines re-pointed at the renamed files.

The tasklist header counters (`**Open tasks:**`, `**Blocked:**`) were deliberately not recomputed: they belong to the taskplanner, and other executors were ticking tasks in the same window, so any number written here would have been stale on arrival.

## Files changed

- `skills/cadence/SKILL.md`
- `skills/cleanup/SKILL.md`
- `agents/coder.md`
- `README-agents.md`
- `templates/investigator-capture-layout.md`
- `fusion-workbench/shared/issues/260731-2246_c_…`, `260810-2200_c_…` (closed)
- `fusion-workbench/circles/260801-1244-guard-rules-write/issues/260805-1830_c_…` (closed in place)
- `fusion-workbench/circles/260801-1244-rule-provenance-header/issues/260802-1256_c_…` (closed in place)
- `fusion-workbench/shared/issues/260811-1301_o_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md` (new)
- `fusion-workbench/tasklist.md`
