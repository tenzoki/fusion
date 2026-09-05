# /fusion:cadence declares its scope: a project digest saved per checkout

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Task:** repair `260904-1058_*_cadence-names-its-report-after-one-person-and-reports-every-persons-work.md`

## What was wrong

`skills/cadence/SKILL.md` wrote a digest keyed to one identity and gathered every session history in
`$SCAN_HISTORY` with no author filter and no per-person grouping. `e1e72f77` rekeyed the filename
from `$USER` to the checkout, which moved the ambiguity one level over rather than settling it: the
file is named after a checkout and digests every checkout's sessions, and step 7b's event metrics are
checkout-scoped while the three ranked lists beside them are not, so one document carried two scopes
without saying so.

## What was changed

`skills/cadence/SKILL.md`, and nothing else.

The record's acceptance offers two branches. The **project-wide** branch was taken, because the
filename pattern `cadence-<checkout>.md` is settled in `rules/fusion-workbench-conventions.md`
`## Filename Patterns` and is out of this task's scope, and because the analysis
(`260904-1058-identity-per-instance-and-the-checkout-registry.md` `### 2. /fusion:cadence aggregates
nothing per person today`) prices per-person aggregation as new capability for a separate Circle
rather than as this repair.

- A **Scope** paragraph after the three-list summary states what the digest is: a project digest
  saved per checkout, covering every history whoever wrote it, with the `-$CO` suffix naming the
  checkout that ran it and not the author. It says explicitly not to filter the gathering step, and
  names step 7b as the one section that is not project-wide.
- Step 1 resolves `$CO_LABEL` through a guarded `bin/fusion-checkout-name resolve "$CO"`. Exit 3
  (unregistered) and the `[ -x ]` miss both fall back to the hex; no name is ever substituted.
- Step 3's source legend marks `h` as "every writer's, unfiltered", and a new paragraph collects the
  distinct writers from each history's `**Filed by:**` person half. A history with no person half is
  `unattributed` and never counted as this checkout's.
- Step 7b says it is the one non-project-wide section and that its report line says so.
- The report template's title becomes `# Cadence — project digest`; the checkout moves to a
  `**Digested by:**` field that states it is not the author; a new `**Covers:**` line names the
  writers; the session-flow field becomes `**Session flow (7d, this checkout only):**`.
- `## What this skill is NOT` gains one bullet: not a personal digest, no grouping or ranking by
  author.

Net effect: the digest **filters nothing and groups nothing**. It now states its scope and names
whose work it covers, which is the project-wide branch of the acceptance.

## Verification

`npx vitest run lib/__tests__/surface-growth-bound.test.ts -t "head-room"` from `hooks/` — exit 0,
4 passed. `skills/cadence/SKILL.md` grew 16 923 → 19 057 bytes; the `skills/` surface stands at
246 466 against the 2026-09-05 merge baseline of 240 614, so 5 852 of its 20 000 head-room is spent,
including a sibling's in-flight `setup/SKILL.md` edit.

The full file exits 1 on `matches the checked-in golden, surface by surface`. That is the shared
golden fixture, not a bound, and it was **already red before this task's first edit** on the
sibling's `setup/SKILL.md` (50 309 → 50 954). It is left for the orchestrator to regenerate once
after every skill edit in this batch has landed; regenerating it here would bake in a sibling's
half-finished state and go red again on their next keystroke.

## Not done

Nothing in `bin/`, `rules/`, the hooks or another skill was touched, and the defect record was left
for the orchestrator to close.
