# fusion-paths key sets miss reads agents actually perform; conceptrev gets an OUT_* for a read

**Filed:** 260716-1957_*_fusion-paths-key-sets-miss-reads-agents-perform.md
**Severity:** High
**Domain:** code
**Filed by:** coderev
**Scope:** `bin/fusion-paths`, `rules/fusion-workbench-conventions.md`

## Problem

`bin/fusion-paths` (commit `114103f`) emits per-agent key sets that are meant to cover
"what each agent's prompt actually reads and writes" (script header comment). Compared
against the 15 agent prompts as they stand today, four agents are handed a key set that
cannot express a directory their prompt demonstrably reads.

Derived from the prompts (`grep -o "fusion-workbench/[a-z]*/" agents/<agent>.md`):

| Agent | Prompt reads | Key set offers | Gap |
|---|---|---|---|
| `consultant` | `planning/ decisions/ issues/ history/ consult/` | `SCAN_PLANS SCAN_DECISIONS` | no `SCAN_ISSUES` |
| `shaper` | `planning/ decisions/ issues/ history/ circles/` | `SCAN_PLANS SCAN_DECISIONS SCAN_CIRCLES` | no `SCAN_ISSUES` |
| `playmaker` | `planning/ decisions/ issues/ analyses/ consult/ history/ circles/` | `SCAN_CIRCLES SCAN_PLANS SCAN_DECISIONS SCAN_ANALYSES SCAN_HISTORY` | no `SCAN_ISSUES`, no scan key for `consult/` |
| `conceptrev` | `planning/ analyses/ investigations/` (+ writes `conceptreview/`) | `OUT_REVIEW OUT_INVESTIGATION SCAN_PLANS SCAN_ANALYSES TASKLIST` | `OUT_INVESTIGATION` is the wrong direction |

Two distinct defects underneath:

**1. Missing `SCAN_*` keys.** Three agents read defects, two read consultations, and the
contract has no key for either read. There is no `SCAN_INVESTIGATIONS`, no `SCAN_CONSULT`,
no `SCAN_MEMOS` at all — the three unconditionally-shared kinds are emitted as `OUT_*`
only, as if nothing ever reads them.

**2. `conceptrev` is handed `OUT_INVESTIGATION` for a read it performs.** `agents/conceptrev.md:42`
lists "An investigation at `fusion-workbench/investigations/*.md`" among its *input*
documents; the agent is described as "Read-only — never edits documents, never files
issues" and `agents/conceptrev.md:32` states "Your one written artifact is the assessment
file". conceptrev never writes an investigation. The conventions table defines
`OUT_INVESTIGATION` as "Always shared — never Circle-bound" under a column headed by
`OUT_*` = write targets. Handing a read-only agent a write key for a directory it only
reads inverts the contract's own semantics.

## Impact

This blocks Turn 2 rather than breaking Turn 1. The restructure's whole premise is that
P-4..P-7 strip every path literal out of the 26 prompts and replace it with a `$OUT_*` /
`$SCAN_*` reference. An agent whose key set has no name for a read it performs leaves the
conversion two bad options: re-introduce the path literal (defeating the restructure, and
tripping P-8's lint gate), or silently drop the read (a consultant that stops reading open
issues, a playmaker that ranks a portfolio without seeing the defect backlog). Neither is
visible at conversion time — both surface later as an agent that quietly knows less than
it used to.

`conceptrev`'s inverted key is the more corrosive one: it is not a gap the converter will
notice, it is a *plausible-looking* key that means the opposite of what the agent needs.
The prompt will read "write to `$OUT_INVESTIGATION`" and either write there (violating
read-only) or ignore it.

## Recommendation

Settle this together with the already-open argument-namespace decision
(`260716-1940[o]-fusion-paths-argument-namespace-agents-vs-skills.md`),
since both are "what is the key vocabulary and who gets which key".

1. Add `SCAN_ISSUES` to `consultant`, `shaper`, `playmaker`.
2. Add `SCAN_INVESTIGATIONS`, `SCAN_CONSULT` to the contract; give `SCAN_INVESTIGATIONS`
   to `conceptrev` and `investigator`, `SCAN_CONSULT` to `playmaker`. Both resolve to the
   shared store alone — they have no Circle counterpart, so the "both stores" invariant
   collapses trivially, which is worth stating in the conventions' invariant 2 so the
   asymmetry reads as intentional rather than as an oversight.
3. Drop `OUT_INVESTIGATION` from `conceptrev`.
4. Consider deriving the key sets mechanically during P-4..P-7 rather than by hand: each
   prompt's converted `$OUT_*`/`$SCAN_*` references *are* the key set, and a test that
   greps the converted prompts and asserts every referenced key is emitted for that agent
   would make this class of drift impossible. The existing suite tests the resolver
   against itself (`hooks/lib/__tests__/fusion-paths.test.ts` — 19 cases, all passing);
   nothing tests the resolver against its consumers, which is exactly where this defect
   lives.

## Cross-references

- `bin/fusion-paths` §1 "Per-agent key sets"
- `rules/fusion-workbench-conventions.md` `## Path Resolution (Pfadauflösung)` → Contract table
- `agents/conceptrev.md:32,42`
- Open decision: `260716-1940[o]-fusion-paths-argument-namespace-agents-vs-skills.md`

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
