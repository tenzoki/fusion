Four shipped documents say the container store went at v11 while the conventions define it as live

---

`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` defines `circles/` at HEAD as the live container store: one directory per work item, holding the item's record and that item's own copy of every artifact store. Three shipped documents state the opposite in prose, and four show a workbench tree that omits `circles/` and carries a `shared/backlog/` store the resolver does not name.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1128_*_four-user-facing-documents-place-a-work-item-in-shared-backlog-as-a-flat-file.md` (the six sentence-level sites, repaired; this record is what that repair uncovered); `260910-2020_*_the-two-existing-backlog-entries-keep-the-retired-marker-form-that-d1-migrates-into.md` (the two stranded entries in the orphaned store)

**The sites**, measured at HEAD `8e263dd2` with the repair of the record cross-referenced above applied to the working tree:

| site | what it says |
|---|---|
| `README.md:149` | tree: `backlog/  # the work items themselves — one file per unit of work`, and no `circles/` |
| `README.md:157` | "A per-unit-of-work container under `circles/` stood here from v4 until v11" |
| `README-agents.md:246` | tree: `backlog/  # the work items themselves, one file per item`, and no `circles/` |
| `README-agents.md:255` | "A per-unit-of-work container stood under `circles/` from v4 until v11, each directory holding its own copy of every store, with an Origin Rule to decide which copy an artifact belonged to" |
| `docs/fusion-intro.md:149` | tree: `backlog/  # die Work Items selbst, eine Datei je Item`, and no `circles/` |
| `docs/fusion-intro.md:96`, `:160` | "Bis v11 war die Arbeitseinheit ein *Circle*: ein Verzeichnis unter `circles/`… Diese Schicht ist entfallen"; "Bis v11 stand hier ein Verzeichnis je Arbeitseinheit unter `circles/` mit einer eigenen Kopie jedes Stores und einer Origin Rule" |
| `docs/philosophy.md:39` | "A unit of work is a **work item**: one file, carrying its Directive and its state, in the project's backlog" |

**What is actually true at HEAD.** The six-state Circle and the portfolio layer over it went at v11; the *container* did not. `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` shows `circles/<stamp>-<slug>/` holding the item record plus `planning/`, `issues/`, `decisions/`, `reviews/`, `analyses/` and `history/`, and `## Origin Rule` is live, not historical: it is the rule that decides container against `shared/`, and `bin/fusion-paths` executes it on every Setup call. `bin/fusion-paths` values `OUT_BACKLOG` and `SCAN_BACKLOG` as `circles`, and every `SCAN_*` key names the container store first and the shared one second.

**Why this is worse than the sentence-level defect it was found under.** The repaired record fixed six sentences that named the wrong path. These sites make a structural claim in the reader's first orientation: that the workbench has one flat set of stores and that per-item containers were a version-4 experiment since withdrawn. A reader who accepts it cannot account for what `ls fusion-workbench/circles/` returns, and cannot read the Origin Rule as binding. `README.md` and `docs/fusion-intro.md` are the two documents a new user is pointed at first.

**Evidence:** `grep -n 'circles/\|backlog/' README.md README-agents.md docs/fusion-intro.md docs/philosophy.md`, taken 260911-1258 against the working tree; `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` and `## Origin Rule`; `bin/fusion-paths` for the two `circles` values; `bin/fusion-paths orchestrator` at this session's Setup, which returned `OUT_BACKLOG=circles` and `SCAN_BACKLOG=circles`.

**Acceptance test:** the four workbench trees show `circles/<stamp>-<slug>/` beside `shared/`, and no tree carries a `backlog/` store. No document states that the container was removed at v11; where a document describes the v11 change it names what actually went, the six-state record and the ranking layer. `docs/philosophy.md:39` says directory rather than file. A reader of `README.md` alone can account for what `ls fusion-workbench/circles/` returns.

---
Resolved: six documents and twelve sentences, not the four this record named — `docs/working-model.md` and `skills/help/SKILL.md` carried the same claim. Every workbench tree now shows `circles/<stamp>-<slug>/` beside `shared/` and none carries a `backlog/` store; the Origin Rule is stated in the present tense wherever a document describes placement; and where a document describes the v11 change it names what actually went, the six-state record and the ranking layer. The two self-contradictions are gone: `README.md` withdrew the container and then filed into it, `docs/working-model.md` the same. Landed at `10e7cc15`. `skills/*/SKILL.md` began at exactly its byte budget and ends 172 bytes under it, with no baseline and no head-room constant moved.
