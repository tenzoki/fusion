The dispatch-parameters section describes three retired parameters as live, and five of its line citations are stale
---
`README-agents.md` `## Dispatch parameters` opens (line 53) by saying "the three that do [run past their own line] are bounded differently. `**Draft:**` and `**Answers:**` each end at the next `**<Keyword>:**` line … (`agents/shaper.md:70`). `**Initiated by:**` is a quotation and may wrap". Nineteen lines below, the same section (line 72) says those three went at v11 with the shaper's record-editing modes and "a dispatch still carrying one is dispatching against a version that no longer exists". No prompt or skill body carries any of the three (`grep -rn 'Draft:\*\*\|Answers:\*\*\|Initiated by:\*\*' agents skills` returns nothing). The section that calls itself "the roster's single authoring home" states in the present tense a bound on parameters it retires two paragraphs later. Separately, the `path:line` citations the table carries have moved under it: of the twelve entries the table below enumerates, five no longer point at what the cell says, and one of those five names a line number past the end of its file.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260916-2206_*_the-relocated-dispatch-parameters-bullet-names-its-own-section-as-the-roster-it-must-not-restate.md` (the fix in this range that edited the section's `reconciler` row and closing bullet and left both of these standing)

**Route:** `coder` — README text.

**Evidence, at `f7545a4c`.**

The retired-parameter sentence: `README-agents.md:53` (quoted above) against `README-agents.md:72` ("The seven were the shaper's two record-editing modes (`**Mode:**`, `**Circle file:**`, `**Scope:**`, `**Initiated by:**`, `**Draft:**`, `**Domain:**`, `**Answers:**`) … there is no such record and no such mode") and `agents/shaper.md:55` ("Two modes stood here until v11 and both went with the unit-of-work record they edited"). `agents/shaper.md:70` at HEAD is the "Dispatched as a sub-agent" bullet and states no bound.

The line citations, every `agents/<x>.md:N` token in the section (`grep -nE 'agents/[a-z]+\.md:[0-9]' README-agents.md` returns lines 53, 57, 59, 63 and 70):

| Cell | Says | At HEAD |
|---|---|---|
| line 53, intro | `agents/shaper.md:70` | states no bound; the parameters it bounded are retired (above) |
| `reconciler` row, `Declared at` | `agents/reconciler.md:28-30`, `:41-43` | the `**Domain:**` parse is line 40, under `### Parameter parsing`; 28-30 and 41-43 are the Coherence paragraph and `## Scope` |
| `planner` row, `Passed by` | `agents/orchestrator.md:434` | line 434 is the `uncovered 0` bullet of `## Closing a work item`; the `**Executors:**` prefix rule is line 230, under `### Shaping and planning, when the task needs them` |
| `planner` row, `Declared at` | `agents/planner.md:47-51` | true: `## Parameter parsing`, lines 47-51 |
| `editor` row, `Passed by` | `agents/orchestrator.md:485`, `:1321` | the file has 617 lines; the `**Deliverable language:**` prefix rule is line 201 and the routing-table row is line 598 |
| `editor` row, `Declared at` | `agents/editor.md:18-30` | true: `## Deliverable language — named in the dispatch, or you halt` |
| `**Audience:**` row, `Declared at` | `agents/planner.md:13`, `agents/analyst.md:15`, `agents/coder.md:13`, `agents/ontocoder.md:13`, `agents/reconciler.md:13`, `agents/reviewer.md:15` | five true (each is that prompt's Setup step 2); `agents/reviewer.md:15` is not — the reviewer's step 2 is line 24 |

The section's own intro says "`Declared at` names the prompt lines each row was read against", so the column was designed as a read-against attribution. `rules/fusion-workbench-conventions.md` `## Filename Patterns` says living text cites "by heading anchor, never by line number: an edit above the line moves it silently, and no gate resolves `path:N`", and the five moved cells are that sentence's case. `reference-resolution-lint` resolves the path half and ignores `:N`, so `:1321` on a 617-line file passes.

**Acceptance.** `README-agents.md:53` names no parameter the section's own v11 paragraph retires, or names them in the past tense beside that paragraph; every `Declared at` and `Passed by` cell cites a heading anchor (`agents/reconciler.md` `### Parameter parsing`, `agents/orchestrator.md` `### Shaping and planning, when the task needs them`, `agents/orchestrator.md` `## Agent Routing Table` for the editor prefix rule at line 201, and each Setup step 2 by its `## Setup` heading), so `grep -nE 'agents/[a-z]+\.md:[0-9]' README-agents.md` returns nothing; `cd hooks && npm test` exits 0, with a re-approval entry on `reference-resolution-lint`'s pin for whatever anchor tokens the rewrite adds. The paragraph at line 72 is not touched: it is the true statement.

---

Resolved: the intro of `README-agents.md` `## Dispatch parameters` names no retired parameter — the v11 paragraph below the table stays the one statement of `**Draft:**`, `**Answers:**` and `**Initiated by:**`; the five line citations became heading anchors (`agents/reconciler.md` `### Parameter parsing`, `agents/orchestrator.md` `### Shaping and planning, when the task needs them`, `agents/planner.md` `## Parameter parsing`, `agents/editor.md` `## Deliverable language — named in the dispatch, or you halt`, each `## Setup` in the Audience cell), with the editor's routing row cited under `agents/orchestrator.md` `## Agents the Orchestrator Invokes` where it sits; the intro's agent count is dropped rather than corrected, the table beneath enumerating them; `reference-resolution-lint`'s pin re-approved at the measured 1680/305/11 (HEAD's file written over the working file reads 1681/294/11); concept accepted by a consultant read; fixed in the commit that carries this line.
