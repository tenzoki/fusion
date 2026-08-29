# Step 4 of plan C0 — `skills/*/SKILL.md` gives back 4 340 bytes

**Date:** 2026-08-22
**Agent:** coder
**Status:** Complete
**Source:** `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`, step 4
**Ledger:** `260822-1226-cut-ledger-for-three-bounded-surfaces.md`, its `skills/` section
**Correction the step ran under:** `260822-1227_*_plan-step-4-names-a-duplication-record-whose-own-fix-direction-forbids-the-cut-the-step-asks-for.md`

## What changed

The ledger's two `skills/` rows, and nothing else. Both are restatement: each removed passage
leaves a citation of the file that authors the claim.

| Row | What left | Where the claim is authored now |
|---|---|---|
| S1 | The "Why the branch, and why it is a call" paragraph in `setup`, `next`, `cleanup`, `help` | `bin/fusion-source-root`'s own header, which carries the criterion, the four-copies history and the decision behind it |
| S2 | The Exit 3 and Exit 4 bullets in `cadence`, `curate`, `direct`, `memo`, `next`, `setup` | `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes, already cited in the sentence directly above the bullets in all six |

Each of the four S1 sites keeps an 81-byte pointer, so the citation stands where the paragraph
stood. The Exit 1 bullets are untouched in all six S2 sites: they carry the halt wording and the
"do not bootstrap a workbench from here" instruction, which is behaviour rather than reference.
Every shell block is untouched — a skill body's snippets are run, not read.

## Bytes removed, per body

| Body | S1 | S2 | Total |
|---|---|---|---|
| `skills/setup/SKILL.md` | 707 | 335 | 1 042 |
| `skills/next/SKILL.md` | 708 | 375 | 1 083 |
| `skills/help/SKILL.md` | 468 | — | 468 |
| `skills/cleanup/SKILL.md` | 455 | — | 455 |
| `skills/curate/SKILL.md` | — | 330 | 330 |
| `skills/direct/SKILL.md` | — | 330 | 330 |
| `skills/cadence/SKILL.md` | — | 316 | 316 |
| `skills/memo/SKILL.md` | — | 316 | 316 |
| **Total** | **2 338** | **2 002** | **4 340** |

The ledger predicted 2 298 and 1 992. S1 came in 40 above because the replacement pointer is 81
bytes rather than the ledger's assumed 90; S2 came in 10 above because three of the six bodies
separate their bullets with blank lines, which the ledger counted as content only.

## Measurements

Measured the way `hooks/lib/__tests__/surface-growth-bound.test.ts` measures — `statSync` byte size
over `skills/*/SKILL.md`, floor from `SKILL_BASELINE` summed over the files present (220 439), plus
the 20 000 head-room constant:

```
node -e "const {statSync,readdirSync,existsSync}=require('fs');const p=require('path');
let t=0;for(const d of readdirSync('skills'))
{const f=p.join('skills',d,'SKILL.md');if(existsSync(f))t+=statSync(f).size;}
console.log(t, 220439+20000-t);"
```

| Surface | Before | After |
|---|---|---|
| `skills/*/SKILL.md` total | 240 409 | 236 069 |
| `skills/*/SKILL.md` head-room | 30 bytes | 4 370 bytes |
| Hook test suite | 19 903 lines | 19 911 lines (head-room 472 → 464) |

The eight lines the hook test suite gained are the single `BASELINE` attribution block in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` — one block for the whole step, as the plan
requires. Step 7 needs up to 200 of the remaining 464.

## The pin

`BASELINE` moved `paths: 1277 → 1269`, `records: 117 → 115`, `anchors` unmoved. The four removed S1
paragraphs together carried three `bin/…` spellings and one `$FUSION_SRC/skills/…` that the pointer
does not, and two of them cited decision `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`. The S2 bullets name no path, so they move
nothing. No baseline map moved: `SKILL_BASELINE`, `AGENT_BASELINE`, `TEST_LINE_BASELINE` and
`RULE_BASELINE` are byte-identical to HEAD `181dd8a`, confirmed by hashing each map's text out of
`git show HEAD:<path>` and out of the working tree.

## Duplication records

**None closed.** All three the plan named stay as they are, and each for its own reason.

- `260816-0133_*_the-setup-and-migrate-probes-are-byte-identical-in-three-copies…` —
  left open deliberately. Its own fix direction forbids factoring and prescribes a test; discharging
  it yields zero `skills/` bytes and costs hook-test lines. That is
  `260822-1227_*_plan-step-4-names-a-duplication-record-whose-own-fix-direction-forbids-the-cut-the-step-asks-for.md`,
  and this step did not attempt the row.
- `260810-2110_*_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body…` —
  left open. Its fix direction is a new `bin/` helper, which is a mechanism change outside this
  step's Files list.
- The `bin/fusion-source-root` instance has no open record to close:
  `260811-0109_*_the-source-root-rooting-reached-two-skills-and-two-more-still-cite-the-install-copy.md`
  closed on the helper landing. Row S1 is a further cut on the same subject, not a reopening of it.

The umbrella `260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`
stays open: its acceptance is per instance, and its one remaining named instance is the routing
table, which this step does not touch.

## Verification

`cd hooks && npm test` — exit 0. 40 files, 715 tests. The surface golden was regenerated with
`UPDATE_SURFACE_GOLDEN=1`, its diff read (the eight `skills/` sizes above plus
`reference-resolution-lint.test.ts` 1022 → 1030), and the suite re-run without the flag. The
rules-emission golden was not regenerated and did not need to be: this step touches no rule file
and no emission, and `rules-emission-golden.test.ts` passes unchanged.
