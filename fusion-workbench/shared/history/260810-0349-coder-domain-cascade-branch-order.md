# The domain cascade reads the code count before the artifact counts

**Agent:** coder
**Date:** 2026-08-10
**Status:** Complete
**Task:** T3 of session 260810-0241-orchestrator-session.md — reorder the workbench-domain cascade so a project full of
code cannot be classified `strategic` on artifact counts alone. Not committed: left in the
working tree by instruction.

**Source issue:** `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md`
**Depends on:** T2 (`2910cf6`), which made the counts trustworthy. This task only moves them.

**Base:** `2910cf6` plus T2's uncommitted follow-ups in the working tree.

---

## What changed

| File | Change |
|---|---|
| `agents/orchestrator.md` | Setup Step 5 only. The cascade is reordered into three regions and two prose paragraphs are added beside it. |
| `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` | New. 5 cases: three order/reachability assertions against the prompt, two against the pre-fix cascade as a negative control. |
| `fusion-workbench/shared/issues/260807-1942_*` | `Resolved:` section appended; marker `_o_` → `_c_`. |
| `fusion-workbench/tasklist.md` | Task 3 `[ ] open` → `[x] done`; source path updated to the new marker. |

`bin/fusion-count-sources` was **not** touched. The reorder needed nothing from it.

## The cascade

```
if counted_by == "none":                                      domain = "code"

elif code_files > 0 and data_files > code_files * 2:          domain = "data"
elif code_files > 0:                                          domain = "code"

elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"
elif analyses_count > 0 and commits == 0:                     domain = "strategic"
elif analyses_count > 0:                                      domain = "knowledge"
elif data_files > 0:                                          domain = "data"
else:                                                         domain = "code"
```

Three regions: the absent count, then the project tree, then the artifacts. The middle region is
the fix.

## The form, since the record said the form was the question

The record's closing section warned that "code volume decides first" might not be the right
*form*. What landed is not a new rule but the removal of a duplicated one.

`strategic` and `knowledge` are both claims that this workbench governs **no build**. The
`knowledge` branch already said so — it carried `and code_files == 0` as a conjunct. The two
`strategic` branches made the same claim and did not check it. Hoisting the conjunct out of
`knowledge` and into a region guard (`code_files > 0 → code`, standing above all three) states it
once, for all three branches, and the `knowledge` branch stops repeating it. That is why the
`knowledge` condition in the new cascade is shorter, not weaker.

The record's other, prior question — whether the domain should be declared once per project
rather than detected at all — is untouched here and remains open. Decision `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`'s
`Answered:` block already records that a `CLAUDE.md` domain declaration was proposed, was not the
question the user answered, and is not authorised. Nothing in this task widens that.

## Reachability, re-derived against T2's counts

The dispatch asked for this explicitly: with `code_files` returning real values rather than
structural zeros, which branch does each domain actually come through?

- **`code`** — the `code_files > 0` branch, for any tree with source in it. This repository counts
  88, KRK 108. Also the two no-evidence exits: absent count, and the final fallback.
- **`data`** — the ratio branch, for a tree where data outweighs source better than two to one
  (ontology fixture: 2 source files against 30 data files). Before T2 this branch was
  near-unreachable because its left side was depth-bounded and its right side was not; it is now
  the ordinary way an ontology project is recognised. Also the sourceless `data_files > 0` line.
- **`strategic`** — region 3 only, so a source tree of any size now blocks it. A strategy or
  consulting workbench's material is Markdown, which is on neither extension list, so such a
  project genuinely counts 0 and 0 and reaches the branch honestly.
- **`knowledge`** — region 3, analyses present, no `strategic` condition met.

The change in reachability is the whole point: `strategic` used to be reachable by *every*
project, including a 108-file Rust repository. It is now reachable only by a project with no
source at all.

One branch changed meaning rather than position. `analyses_count > 0 and commits == 0` was
criticised in the record for being trivially satisfiable — a workbench never committed stands at
0. In region 3 it no longer decides whether the project is a build project; it only picks between
`strategic` and `knowledge` for a project already known to have no source. That is the most that
conjunct was ever evidence for.

## Two judgements, both written into the prompt

**The ratio branch cannot serve the sourceless case.** `data_files > code_files * 2` degenerates
to `data_files > 0` when the denominator is zero — it is not a ratio there, it is a presence test.
Putting it at the top of the cascade would have handed a documents-only repository with one CI
`.yml` to `data`. So the sourceless case gets its own `data_files > 0` line at the *bottom*,
below the artifact branches. The cost is that a pure ontology tree with more open decisions than
open issues still reports `strategic`; that is the pre-existing behaviour for zero-source trees,
and every such tree I can construct has at least one `.sh` or `.py` in it, which lifts it into
region 2. The residual is named in the prompt as a chosen trade, not left implicit.

**The absent count resolves to `code` and does not fall through.** The dispatch asked which branch
the `counted_by == "none"` case lands in and why. It lands in its own branch at the very top, and
returns `code`.

Two things it must not do, and neither is satisfied by accident:

- It must not fall into `code` *merely because the count is absent*. It does not: `code` is this
  cascade's own no-evidence fallback, the value returned when no branch has positive evidence
  either way. An unmeasurable project takes the same default as an unremarkable one rather than
  a verdict of its own, and the orchestrator is told to say out loud that the count could not be
  taken, in the Setup summary and in the history file, so the user knows to override it.
- It must not fall into `strategic` merely because the count is absent. It cannot: it never
  reaches the artifact branches. Letting it fall through would hand a `strategic` verdict to a
  project whose code volume is precisely what nobody could measure — this defect with the
  evidence removed.

Its position also satisfies T2's own instruction, written into the prompt at `2910cf6`: the line
"must come before every branch that reads `code_files` or `data_files`, so if the branch order is
ever changed it moves with them". It moved with them, to the top.

Behaviour note: at `2910cf6` the `none` branch stood *third*, so the two `strategic` branches ran
ahead of it and a no-git project with open decisions reported `strategic`. That is a behaviour
change, and it is deliberate — the helper's own header states the caller's contract as "skip every
branch that reads these counts, fall back to domain `code`", which is what the new position
actually delivers and the old position did not.

## Verification

The cascade run against concrete inputs, old order against new. Counts for the ontology and no-git
rows were taken by running `bin/fusion-count-sources` against purpose-built fixtures (2 `.py` and
30 `.yaml`/`.ttl` under `ontology/terms/`; a `src/main.rs` in a directory with no git repository);
the rest are measured or recorded values.

| project | inputs | before | after |
|---|---|---|---|
| this repository | commits 158, analyses 9, issues 29, decisions 3, code 88, data 21 | `code` | `code` |
| KRK, the reported case | commits 0, analyses 0, issues 1, decisions 3, code 108, data 11 | `strategic` | **`code`** |
| ontology tree | code 2, data 30, no open decisions | `data` | `data` |
| ontology tree, 2 open decisions against 0 open issues | code 2, data 30 | `strategic` | **`data`** |
| no git repository | `counted_by=none`, both counts `unavailable` | `code` | `code` |
| strategy workbench | code 0, data 0, decisions 6, issues 0 | `strategic` | `strategic` |
| knowledge project | code 0, data 0, analyses 9, issues 4, decisions 1, commits 12 | `knowledge` | `knowledge` |
| sourceless data tree | code 0, data 30, no artifacts | `data` | `data` |
| docs repo with one CI `.yml` | code 0, data 1, decisions 3, issues 0 | `strategic` | `strategic` |

Two rows change and both are the defect. All four domains remain reachable.

`cd hooks && npm test`: **922 passed, 1 failed** across 33 files. The one failure is
`rules-emission-golden`, red for the known reason — `rules/fusion-workbench-conventions.md` grew
in `e99f0ef` (39529 → 40199 bytes) and the fixture is regenerated deliberately at the end of the
session. No other test moved, and nothing this task touched is a rule file.

## The gate

`hooks/lib/__tests__/domain-cascade-order-lint.test.ts` parses the branch lines out of the fenced
cascade in `agents/orchestrator.md` and asserts three things: every `strategic`/`knowledge` branch
sits below the first branch reading `code_files`; the `counted_by == "none"` branch sits above
every branch reading either count; all four domains are still assigned somewhere.

It is fed the pre-fix cascade verbatim as a negative control, and the first assertion is required
to fail on it. A gate that only ever sees the fixed text proves nothing about what it would catch.

The cascade is prompt text — nothing executes it, so nothing but this gate notices a reorder. That
is the same reason `path-literal-lint` and `provenance-header-lint` exist.

## One thing found, not fixed

`"$FUSION_PLUGIN_ROOT/bin/fusion-count-sources"` — the exact invocation Setup Step 5 tells the
orchestrator to run — does not exist in the installed copy at `~/.fusion`, because T2 is still
uncommitted and the install predates it. An orchestrator starting a session in this repository
right now would get exit 127 from that line. This is the documented `fusion --update` residual in
`CLAUDE.md` ("the hooks themselves always run from the installed copy"), widened by T2 from rules
to a helper binary. Not this task's to fix; worth one line in the session log.
