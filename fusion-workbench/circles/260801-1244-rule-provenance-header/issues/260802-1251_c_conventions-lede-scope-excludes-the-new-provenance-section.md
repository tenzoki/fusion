The conventions file's own scope statement excludes the section just added to it

---

**Severity: Medium.** A convention that contradicts its host document's stated remit.
Small, exact fix.

**Evidence.**

`rules/fusion-workbench-conventions.md:5`, unchanged by this Circle:

> Shared conventions for all agents operating on `fusion-workbench/`. This file is
> auto-loaded by the plugin system into every agent's context. Single source of truth for
> the workbench layout, the origin rule, path resolution, state markers, issue and
> decision filing, inline tracking, history logging, and timestamps.

Two claims in that sentence, both now false for part of the file.

1. **Subject.** The new `## Provenance headers on rule files` (`:561-592`) governs the
   plugin's own `rules/` directory and, per `:586`, a consuming project's `./rules/` and
   `.claude/rules/`. None of those is `fusion-workbench/`. The section is the only part
   of a 700-line file that legislates over files outside the workbench.
2. **Enumeration.** The lede lists eight subjects the file is the single source of truth
   for. Rule-file provenance is a ninth and is not listed. `CLAUDE.md`'s own description
   of the file carries the same stale list ("the workbench layout, the Origin Rule, the
   `bin/fusion-paths` resolution contract, marker vocabularies, and the decision-record
   template").

A reader who takes the lede at its word concludes the section is misfiled. A reader who
takes the section at its word concludes the lede is stale. Nothing in the file resolves
which.

**Not fixable by relocation.** Spec acceptance criterion 1 requires the convention to be
documented in this file, and criterion 8 requires the `Binding decision:` note to sit in
this file's section. Both were met. The defect is in the lede, not in the placement.

**Fix.** Extend `rules/fusion-workbench-conventions.md:5` so its scope covers rule files
as well as the workbench, and add rule-file provenance to the enumeration. Then update
the `rules/fusion-workbench-conventions.md` row in `CLAUDE.md`'s layout table to match.
Roughly:

> Shared conventions for all agents operating on `fusion-workbench/`, and for the rule
> files agents load. ... Single source of truth for the workbench layout, the origin
> rule, path resolution, state markers, issue and decision filing, inline tracking,
> history logging, timestamps, and provenance headers on rule files.

Note for whoever picks this up: `circles/260801-1244-curator` C9 partitions this file
into shards. If the partition is close, the lede is rewritten there anyway and this fix
should be folded into it rather than applied twice.

---
Resolved: 7703330 — the lede now reads "and for the rule files those agents load" and lists provenance headers as a ninth subject. CLAUDE.md got the same addition plus a parenthetical naming it as the one subject governed outside fusion-workbench/.
