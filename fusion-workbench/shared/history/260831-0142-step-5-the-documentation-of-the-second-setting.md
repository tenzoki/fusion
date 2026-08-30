# Step 5 — the documentation of the second setting, and four claims the previous plan left false

**Status:** Complete
**Agent:** coder
**Plan:** `260831-0024_*_a-project-declares-its-citation-bearing-paths.md`, step 5
**Closes:** `260831-0031_*_four-documented-surfaces-still-describe-the-citation-corpus-and-sweep-guard-the-repair-replaced.md`

Documentation only. No behaviour moved, and no file under `hooks/lib/` was touched
except the one baseline this change had to re-approve.

## Group one — the configuration has two settings, and both are named

The plan's own grep was run rather than trusted, and it returned one site the plan
did not predict plus one the plan named that turned out to be two paragraphs rather
than one. Sites changed, all outside `fusion-workbench/`, `hooks/dist/` and the
activity log:

| file | what it said | what it says |
|---|---|---|
| `README-hooks.md` (the settings paragraph, line 142) | "There is one setting, and the guard is not it" | both settings named, the guard neither |
| `README-hooks.md` (`turn-budget.ts` row) | "the only setting fusion still resolves" | "one of the settings fusion resolves; `citations.extraPaths` is the other" |
| `README-hooks.md` (`lib/config.ts` row) | "One setting (`orchestrator.maxTurns`)" | both leaf names |
| `README-hooks.md` (`## Per-project configuration`) | "It configures exactly one thing" | both named, plus a new `#### citations.extraPaths` subsection |
| `README.md` (the observation-only bullet) | "the one setting that is left" | "what the file still sets" |
| `README.md` (Configuration) | "It configures exactly one thing today" | both named, plus a Settings-table row for the new leaf |
| `README-agents.md` (Turn-budget paragraph) | "this is the only setting fusion still resolves" | "one of the settings … the other is `citations.extraPaths`" |
| `CLAUDE.md` (the `fusion.json` + `templates/fusion.json` row) | "the one key that constant names … the loader's only live leaf" | both keys named, matching `PROJECT_SET_KEYS = ["orchestrator", "citations"]` |
| `agents/orchestrator.md` (Turn budget, Setup) | "it is the only setting fusion resolves" | the other setting named as the citation helpers' and never the orchestrator's |
| `skills/help/SKILL.md` (configure topic) | "There is exactly one setting" | both named |
| `hooks/turn-budget.ts` (docstring) | "the one setting the file carries" | "one of the settings the file carries", `citations.extraPaths` named |

**The site the plan did not predict:** `README-hooks.md:142`, a settings paragraph
in the hook-behaviour section, distinct from the `## Per-project configuration`
section the plan named. Without it the grep would still have returned a live
cardinality-of-one claim after the step.

**One site was found and deliberately not changed.** `CLAUDE.md:38`, the
`bin/fusion-turn-budget` Layout row, says "since 260816 that is the loader's only
live setting", which this work makes false. Step 5's dispatch bounds the `CLAUDE.md`
edit to two rows and says "Nothing else in that file", so the row stands and is
reported to the user as a residual rather than fixed here. It is a factual
correction of the same class as the two that were made, not a normative
reconciliation, so it is a candidate for the next pass over that file.

**One grep hit is not a site.** `skills/curate/SKILL.md:12` says the curator's three
invocation shapes "differ in exactly one thing, who holds the prompt". That is a
cardinality about invocation shapes, not about configuration settings, and it is
still true.

Every rewrite names both settings instead of counting to two, per
`rules/critical-stance.md` §5.

## Group two — the four false claims

All four corrected, and the record for them renamed `_o_` → `_c_` with a `Resolved:`
note in the same change.

- `bin/fusion-citation-check`'s corpus block: the frozen stores are stated as read
  exactly like the live tree since `32fe0d49`, and the three store names are gone,
  which is what the record's own acceptance test greps for. The block gains the
  declared corpus and the reason a declaration exists at all, and the sample
  `KEY=value` output gains `declared-patterns=` and `declared-files=`, the second
  annotated as reading `unavailable` where git will not answer.
- `CLAUDE.md`'s `bin/fusion-citation-check` row: the same corpus, cited to the
  commit that deleted the exclusion, plus the shared-corpus rule and the blocking
  gate that deliberately does not read the declaration.
- `README-hooks.md`'s `citation-check.ts` row: the corpus named without the word
  "live".
- `README-hooks.md`'s `citation-sweep.ts` row: guard (a) stated as its three
  conditions — a tracked workbench, no uncommitted change naming a file the run will
  read, and every extra `<path>` inside the work tree and tracked by it — rather than
  as a clean tree.

`bin/fusion-citation-sweep`'s header gains the declared corpus, as the step asked.
It also carried the same clean-tree claim the README row did, and that was corrected
in the same pass: an authoritative helper header stating a guard that no longer
exists is exactly the defect this record is about, and leaving it while editing the
file around it would have re-filed the record on the way out.

## The two baselines this change had to re-approve

Neither is a behaviour change and both are the documented response their own gate
prints. They are named here because the step's file list did not anticipate them.

- `hooks/lib/__tests__/fixtures/surface-growth.golden`, regenerated with
  `UPDATE_SURFACE_GOLDEN=1` and the diff read: `orchestrator.md` +73 bytes,
  `help/SKILL.md` −4, nothing else moved. Regenerating the golden does not move a
  baseline, and the head-room assertions still pass.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE`, paths
  1552 → 1563, anchors and stampBare unmoved. This is inside a test file, which the
  dispatch told the executor not to touch; only the baseline constant and its
  provenance comment were edited, no assertion and no logic. The shares were measured
  by single-file revert against the rest of the dirty tree, and they are disjoint and
  sum to the whole: `README-hooks.md` +3, `CLAUDE.md` +2, `README.md` +2,
  `bin/fusion-citation-check` +2, `bin/fusion-citation-sweep` +2, and 0 each from
  `README-agents.md`, `agents/orchestrator.md`, `skills/help/SKILL.md` and
  `hooks/turn-budget.ts`.

## Byte budgets

- `skills/help/SKILL.md`: **−4 bytes** against a ceiling of net zero. The configure
  topic states both settings; the room came out of the same bullet — "in its own
  notes", "tool" in "guarded tool call", and "the Turn budget has to be copied
  across first" compressed to "copy the budget across first". No halt was needed.
- `agents/orchestrator.md`: **+73 bytes** against 300 allowed.
- `README-hooks.md`, `README.md`, `README-agents.md` and `CLAUDE.md` are bounded by
  nothing.

## Acceptance, each run and its output read

1. `cd hooks && npm test` → **exit 0**, 47 files, 818 tests, `surface-growth-bound`
   and `derivable-enumerations-lint` included.
2. `grep -rn 'migration-v2-backup' bin/fusion-citation-check` → nothing, exit 1.
3. `skills/help/SKILL.md` 16 923 → 16 919 bytes, **−4**.
4. `agents/orchestrator.md` 150 287 → 150 360 bytes, **+73**.
5. The group-one grep returns two hits outside the exclusions: `CLAUDE.md:38`, held
   out by the dispatch's two-row boundary and reported, and
   `skills/curate/SKILL.md:12`, which is not a claim about configuration.
6. `bin/fusion-citation-sweep --dry-run` → `files=0 rewrites=0 residual=2819
   record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=dry-run`.
   `residual` moved from the plan's 2804 with the records this session filed, and is
   pinned by nothing; `rewrites=0` is the pinned figure and it holds.
7. The issue carries `_c_` and a `Resolved:` note.

`bin/fusion-citation-check` at the end of the step: `files=2408 declared-patterns=3
declared-files=45 tokens=22523 judged=17933 resolved=17248 dangling=313
store-prefixed=0 undecidable=3193 exempt=1769 verdict=violations`. Against the
step-4 reading, `tokens` and `resolved` each rose by 1 — the plan citation in the
`Resolved:` note appended to the closed issue — and `dangling` and `store-prefixed`
did not move, so nothing this step wrote is a broken pointer.

Not committed: the orchestrator commits.
