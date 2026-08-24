# Code review: Turn 2 of Circle `260824-1853-close-every-open-defect`

**Sender:** coderev
**Date:** 2026-08-24
**Reviewed-range:** `01964e4..13aaa85`
**Not-opened:** none
**Scope:** every file outside `fusion-workbench/` the three code-bearing commits changed, minus the three `stilwerk/*.yaml` (ontorev's). Each `Resolved:` note under this Circle's `issues/` (stamps 2056, 2058, 2059, 2100, 2101, 2136) was read against the diff it cites. `hooks/dist/` is untouched in this range (no `hooks/` source changed), so no rebuild comparison was needed.

## Summary

Fifteen of the seventeen closure notes hold as written, including the High from Turn 1: `bin/fusion-paths:262` now prints its placeholder (run against an empty pointer: exit 3, the message intact, no syntax error) and the test pins it. The `state Directive` routing was fixed in the two places the record named and left stale in three neighbours, so the gate that step 3 says fires is still defined by a section that says it does not. The rest is Low: a completeness gap the narrowed row leaves, a header wider than its `sed`, an executor rule the orchestrator's own held command now contradicts, and a pre-existing gap in the pin chain the roll made visible.

## Totals

Critical 0 / High 0 / Medium 1 / Low 4. Four records in `$OUT_ISSUE`, one in `shared/issues/` (Origin Rule: it arose in the C3 Circle). Person half absent on all five: the installed plugin carries no `bin/fusion-identity`.

## `Resolved:` notes read against their diffs

| Record | Holds? | Evidence |
|---|---|---|
| 2056 fusion-paths backticks | yes | `bin/fusion-paths:262` bare placeholder; ran it: exit 3, stderr carries `<YYMMDD-HHMM>-<slug>`; `fusion-paths.test.ts:465` asserts it |
| 2056 reconciler `state Directive` | partly | `reconciler.md:176,181`, `orchestrator.md:754,975` as claimed; `orchestrator.md:992-997` and `reconciler.md:103` not updated (Medium below) |
| 2056 session-domain untested | yes | `fusion-session-domain.test.ts` (80 lines): quoted/bare, five fallback rows, first-two-space bound, exit 3 empty stdout, exit 2; all match the header. Probed beyond it: a second `domain:` in the same block takes the first; `domain: ""` reads as "no session.domain"; a `# comment` after the value is ignored |
| 2056 session-domain header | yes, one residual | true bound stated at `:38-43`; `helper-missing` defined at `:16,25-28` and in the `CLAUDE.md` row; `sed` names `Code` as itself. Residual: "quoted" still over-promises (Low below) |
| 2056 identity no-git branch | yes | test on a PATH holding `bash` and `dirname` only, exit 1, empty stdout, nothing minted; `conventions.md:496` and the `CLAUDE.md` row name the second way in; rule edit -11 bytes, matches the golden |
| 2056 CLAUDE.md three keys | yes | both rows and `docs/upgrading-to-v10.md:65-66` name `churn` and point at `RETIRED_TOP_LEVEL_KEYS`; "since 260824" is right (`git log -S'churn:' -- hooks/lib/config.ts` → `e31a73d`, 2026-08-24) |
| 2056 README-agents cites | yes | `skills/next/SKILL.md` at HEAD: `**Domain:**` :138, block :139-146, `**Proposal source:**` :146, restatement :148 |
| 2056 resume paragraph | yes | `orchestrator.md:119` states the three cases, disjoint and complete |
| 2056 unheld index comparison | yes, one residual | `git reset -q` is first inside the held `bash -c`; the pre-lock read is named advisory. Residual: `:574` (Low below) |
| 2058 ×2 (stilwerk) | not judged | ontorev's; the Circle-side notes cite line numbers I did not verify |
| 2059 histories cite by open marker | yes | the `grep -c` in the note prints 0 for both files; `_t_circle.md:32` starred |
| 2059 closure notes one line off | yes | `Corrected:` lines appended, originals untouched, as the note says |
| 2100 history filename | yes | `history/260824-2042-coder-p-7b-session-domain-layout-row.md` exists in the pattern form |
| 2100 backlog referrals | as claimed | `referred (backlog)`, seven paths listed for the user; no agent filed an entry, per `## Backlog entries` |
| 2101 triage row 66 | yes | `moot`; `grep -c 'Those belong' rules/user-facing-output.md` = 0 |
| 2136 citation-lint positive control | yes | `corpusFiles(root = workbenchRoot)` → `markdownFilesUnder(root)` → `inCorpus()` → `OPEN_ISSUE_RE` at `:174`: the scratch-workbench control at `:288-297` runs the production selector end to end and asserts the `_c_` sibling is excluded. It still controls the selector. |

## Findings by theme

### The `state Directive` fix reached two of five surfaces

- **Medium.** `agents/orchestrator.md:992` (`### Rebalance Gate`) still triggers on "per-Circle verdict other than `coherent`" and carries none of the gate text `:754` says it carries (`grep -n 'states one'` hits `:754` only); `agents/reconciler.md:103` still says the gate fires only when not `coherent`; the Revise Directive bullet (`:996`) assumes a spec exists, and `:1009` spends the once-per-session cap on stating one. Record: `260824-2145_*_the-rebalance-gate-section-and-the-reconcilers-cadence-note-still-fire-only-off-coherent...`.
- **Low.** The narrowed row "`coherent` with every edge evaluable → `none`" leaves `coherent` with an edge `not evaluable` for a non-Directive reason (no commits, `:111,114`) matching no row. Record: `260824-2145_*_the-narrowed-coherent-row-is-still-not-complete...`.

### The new helper and its test

- **Low.** Header says "quoted or bare"; the `sed` at `:75` takes double quotes only (single-quoted `'data'` reproduced as a fallback). No shipped writer emits single quotes. The test comment says "four-way" for a three-branch `case`. Record: `260824-2145_*_the-session-domain-header-says-quoted...`.

### The held commit against the executor rule

- **Low.** `:574` tells every executor `git reset` "rewrite[s] files outside the named scope"; `:623` now runs it inside the lock on the premise that it does not. Record: `260824-2145_*_the-orchestrators-held-commit-now-runs-git-reset...`.

### The rolled re-approval log

The roll is faithful: the 92 lines deleted at `reference-resolution-lint.test.ts:456-547` (at `01964e4`) are the 15 entries in `shared/analyses/260824-2121-*` verbatim, the pointer line at `:285-286` names the file, the log's header names the decision and the first roll, and `BASELINE` moved 1353→1357 / 189→190 with the four tokens accounted on the constant's line. The line arithmetic in the histories reconciles: -90 (ref-lint) +16 (identity) +80 (session-domain) +2 (paths) +2 (citation) = +10, head-room 10 → 0.

- **Low, pre-existing, filed in `shared/`.** The chain closes at paths 1294 in the rolled log and the next surviving entry opens at 1295 (`:459`, written by `5b88eb9` before this range). Record: `shared/issues/260824-2145_*_the-reference-resolution-pin-chain-has-an-unaccounted-plus-one...`.

### No finding

`fusion-identity.test.ts`'s `run(f, env, ...args)` signature change and the `--help` call site updated with it; the `#!/usr/bin/env bash` shebang resolves `bash` through the fixture PATH so the exit-1 case is what it claims. Both goldens match the surfaces (`npm test` green, 760). `README-agents.md` line cites verified. `docs/upgrading-to-v10.md` wording matches `config.ts:95-97`.

## Cross-cutting observations

1. **A fix stated in one paragraph and contradicted by the section that defines the mechanism.** Phase 3 step 3, the gate-rules row and the reconciler mapping were edited; the `### Rebalance Gate` section and the reconciler's cadence note were not. Same shape as Turn 1's finding that the docs step moved "a second too early": the surfaces that name a rule outnumber the ones the record cited.
2. **Head-room at zero moves defects into comments.** Two of the five findings need a test line to pin (single-quote row, pin-chain accounting) and both are stated as prose-fixable alternatives because the hook-test surface has 0 lines of head-room. Any fix that adds a line needs a cut first.

## Recommended sequencing

1. The Medium (three prose edits in two agent prompts, `agents/` head-room 3 675 bytes). Before the Circle closes: the record it follows was closed as `fixed`.
2. The reconciler completeness row, the `:574` wording, the session-domain header: same pass, prose only.
3. The pin-chain accounting: whoever next re-approves the constant writes the retrospective line and pays for it.
