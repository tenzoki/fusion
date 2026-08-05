# Session: Step 4 — `## Stashes` and `## Commit lock` out of the conventions file

**Date:** 2026-08-05
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260801-1244-guard-rules-write`
**Plan:** `planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`, Step 4
**Predecessor:** `history/260805-0821-coder-step3-eighteen-findings-one-rule.md` (which left the suite red)
**Baseline:** `c9bf59e`. Not committed — the orchestrator commits.

**Voice profiles:** `bin/fusion-rules coder` emitted `./fusion-workbench/stilwerk/chat-voice-en.yaml`.
The dispatch asked for a German report, so `chat-voice-de.yaml` was read directly and applied to the
chat reply. `CLAUDE.md` carries no `**Language:**` line, so the helper resolved its documented `en`
default — the third session file in a row to record this.

---

## The three sentences

**The concatenation check comes out clean.** `head -n 603` of the rewritten conventions file plus
`tail -n +14` of the new rule file is byte-for-byte `git show HEAD:rules/fusion-workbench-conventions.md`.
Nothing lost, nothing duplicated.

**The grep finds nothing pointing at the conventions file — after five redirects, not one.** The plan
knew of a single citation (`skills/circle-stash/SKILL.md:365`) and explicitly recorded that
`## Commit lock` had none. Both statements were wrong.

**The suite is green again: 27 files, 1543 tests, 0 failures**, and both ceiling assertions that
step 3 left red are back. Bytes per agent group afterwards: six plain agents 106 658, six diagram
agents 112 331, `coder`/`coderev`/`bugfixer` 128 555, orchestrator 115 908 on its own.

---

## What moved, and how the move was made verifiable

The two sections were the tail of the file — `## Stashes` at line 604 through `## Commit lock` to
EOF at 733, 8 484 bytes, contiguous. That made the split mechanical rather than a judgement about
where a section ends:

```
conventions.md @ HEAD          new layout
┌──────────────────┐           ┌──────────────────────────────┐
│ lines 1..603     │──────────>│ conventions.md 1..603         │  unchanged
│                  │           │  + pointer block (597 B)      │  appended
├──────────────────┤           ├──────────────────────────────┤
│ lines 604..EOF   │──────────>│ workbench-stash-and-lock.md   │
│  ## Stashes      │           │  header block (766 B)         │  prepended
│  ## Commit lock  │           │  + lines 604..EOF verbatim    │  untouched
└──────────────────┘           └──────────────────────────────┘
```

Neither half was retyped. The moved text was cut with `sed -n '604,$p'` and the new file assembled
with `cat header moving > rules/workbench-stash-and-lock.md`; the conventions file was rebuilt as
`cat staying pointers > rules/fusion-workbench-conventions.md`. "Unchanged" is therefore a property
of how the file was produced, not a claim to be checked afterwards — and it was checked afterwards
anyway.

**Falsifikat 1, run rather than assumed:**

```
$ cmp <(cat <(head -n 603 rules/fusion-workbench-conventions.md) \
             <(tail -n +14 rules/workbench-stash-and-lock.md)) \
      <(git show HEAD:rules/fusion-workbench-conventions.md)
CONCAT-CLEAN
```

The two constants are the only thing an editor has to keep true: 603 is the last line before
`## Stashes`, 13 is the header block's line count, so the body starts at 14.

## The audience, and why one `if` and not a flag

`bin/fusion-rules` grew a `1e` block beside the `1d` guard-internals block:

```bash
if [ "$AGENT" = "orchestrator" ]; then
  emit_if_exists "$PLUGIN_RULES_DIR/workbench-stash-and-lock.md"
fi
```

Step 2 established the `IS_*_AGENT` flag pattern for a three-agent audience and argued in its
comment why a named `case` beats a filename pattern. Here the audience is one agent, and a `case`
block would restate a literal comparison in five lines. The reason the audience *is* one agent is a
mechanism, not a guess: `bin/fusion-rules` exits 2 on any non-agent name, so `/fusion:circle-stash`
and `/fusion:circle-pop` were never served by it and lose nothing; the commit lock is the
orchestrator's to take; and the three agents that may commit directly (`coder`, `ontocoder`,
`bugfixer`) carry the lock instruction inline in their own prompts already — verified, they do, at
`coder.md:26`, `ontocoder.md:43`, `bugfixer.md:33`.

Verified per agent: `orchestrator` emits it, `coder` and `shaper` do not.

## The five redirects

The plan's falsifikat asks that no line in `agents/ skills/ bin/ docs/ README*.md` still point at
the conventions file for a moved section. The plan expected one such line. There were five:

| Site | Section | Was |
|---|---|---|
| `agents/orchestrator.md:356` | `## Commit lock` | the plan states this section is cited nowhere |
| `skills/circle-stash/SKILL.md:14` | `## Stashes` → What stash does NOT touch | not in the plan |
| `skills/circle-stash/SKILL.md:220` | `## Stashes` → What stash does NOT touch | not in the plan |
| `skills/circle-stash/SKILL.md:365` | `## Stashes` → Manifest schema | the one the plan knew |
| `skills/circle-pop/SKILL.md:146` | `## Stashes` → Manifest schema | not in the plan |

Each redirect keeps its section anchor (`` `rules/workbench-stash-and-lock.md` `## Stashes` → … ``)
and each was anchored on enough surrounding text to grip exactly once — the discipline step 2 set
for its ten redirects.

`skills/circle-pop/SKILL.md` and `agents/orchestrator.md` were outside the file list the plan gave
for this step. The falsifikat is what widened it: a redirect list that stops at the plan's inventory
leaves the citation broken and passes the step anyway.

**Nothing needed redirecting in the other direction.** The moved text cites no section of the
conventions file, and the part that stays cites no section of the moved text — checked, not assumed.
The only `##` reference inside the moved text is `## Stashed Circle`, a section
`/fusion:circle-stash` *writes into a history file*, not a citation. That is the one way this move
was cheaper than step 2's.

## The measurement

| Group | Agents | Before | After | Δ |
|---|---|---|---|---|
| plain | consultant, editor, ontocoder, ontorev, playmaker, reconciler | 114 545 | 106 658 | −7 887 |
| diagram | analyst, conceptrev, investigator, planner, shaper, taskplanner | 120 218 | 112 331 | −7 887 |
| guard-internals | bugfixer, coder, coderev | 136 442 | 128 555 | −7 887 |
| orchestrator | orchestrator | 114 545 | 115 908 | **+1 363** |

`CEILING` lowered 131 685 → 128 555 with a history entry naming this cut. Lowered, never raised.
The golden fixture was regenerated with `UPDATE_RULES_GOLDEN=1` and its diff read line by line: 16
blocks show `fusion-workbench-conventions.md 59303 → 51416`, exactly one block (`[orchestrator]`)
gains `workbench-stash-and-lock.md 9250`, and every total moves by the amount above. No path
disappeared anywhere it was not meant to.

### Finding: the cut is 597 bytes short of the dispatch's expectation, and the shortfall is the plan's own pointer block

The dispatch predicted 127 958 for the coding agents, from the sections' full 8 484 bytes. Measured:
128 555. The 597-byte gap is the pointer block the plan itself requires ("die Konventionsdatei
bekommt an beiden Stellen eine Zeigerzeile"). Two pointers, one line of prose each, naming what
moved, where it went, and who still loads it. They could be shortened to bare cross-references and
recover perhaps 300 bytes; that trades a line an agent can act on for a line it has to follow. Not
taken — but it is the dispatch's number that was optimistic, not the execution that overshot, and
the report says so rather than quietly matching the target.

### Finding: the orchestrator pays more than it saves

It is the only agent whose tax rises: it drops 7 887 with everyone else and takes on 9 250. The
9 250 is the 8 484 of moved text plus a 766-byte provenance header and lede. Sharding a file for a
single-agent audience cannot be free — the shard needs its own header, and the pointer block is paid
by everybody including the agent that also holds the shard.

The plan's Erfolgsmaß (line 173) projected 98 855 for the orchestrator, i.e. `96 116 + 2 739`, which
is the arithmetic of an orchestrator that keeps `## Commit lock` and loses `## Stashes`. Step 4's own
instruction is one file with both sections, emitted to `orchestrator`. Those two statements do not
agree. The step's instruction was followed. Splitting into two shards to satisfy line 173 would save
the orchestrator ~5 700 and cost a second header, a second pointer pair, and a second emission
branch — and the orchestrator is the agent that fields a `/fusion:circle-stash` interruption and
resumes after a pop, so the stash protocol is not obviously the half it does not need.

### Falsifikat 3 fires, as the dispatch predicted

> "Der Emissionsdeckel misst für irgendeinen Nicht-Orchestrator-Agenten mehr als 96 500 Byte."

Fifteen of sixteen. The best-off agent stands at 106 658, which is 10 158 over the plan's 96 500
target and 1 304 over `RELEASE_CAP` (105 354). The worst is 128 555, i.e. 23 201 over the cap. The
target was already out of reach when this step began — step 3 added text on top of a step-2 position
that never reached its own projection either.

What remains is arithmetic, not judgement: `fusion-workbench-conventions.md` still weighs 51 416
bytes and is 48 % of the 106 658 the leanest agent loads. Bringing any agent under `RELEASE_CAP`
means partitioning it, which is C9 step 3 and is on the plan's explicit "does not touch" list, with
its cost stated there — 32 headings, three templates a `^## ` cut would tear apart, and 131 citing
lines in 42 files. Step 6 is gated on the cap. As of this step the gate is shut, and no further step
in this plan opens it.

## What was noticed and deliberately not touched

The dispatch is explicit that a wrong sentence inside the moved sections is a finding for the
report, not an edit — step 3 tore the ceiling by correcting text in passing. One qualifies:

**The manifest schema says nine fields and lists ten.** `## Stashes` → Manifest schema opens with
"Nine fields, in this order:" and the YAML block below it lists ten: `stash_id`, `timestamp`,
`reason`, `original_circle_dirname`, `original_circle_record`, `active_circle_content`,
`head_short_hash`, `git_stash_ref`, `git_stash_sha`, `has_agentstate`. The layout diagram above
repeats the wrong count (`# nine-field index`). The paragraph that follows explains the schema went
*from* ten fields *to* nine when `has_spec_plan` was dropped — the drop happened, but `git_stash_sha`
was added later and nobody re-counted.

This is already filed: `shared/issues/260717-0032_o_stash-manifest-field-count-says-nine-lists-ten.md`,
open since 2026-07-17. It travelled into the new file unchanged, and its issue now cites a path that
no longer holds the text. Left alone deliberately: retargeting it is an issue edit, not part of this
step, and correcting the count is exactly the in-passing fix the dispatch forbids.

Two smaller observations, neither wrong, both now stale in their pointer:

- `shared/issues/260717-0030_o_git-stash-include-untracked-can-sweep-the-stash-directory.md` cites
  `rules/fusion-workbench-conventions.md` `## Stashes` in its Related line.
- `shared/issues/260716-2002_c_layout-tree-omits-two-root-anchored-surfaces.md` (closed) cites
  `## Commit lock` → Mechanism twice.

Workbench issue files are outside the falsifikat's grep surface (`agents/ skills/ bin/ docs/
README*.md`) and outside this step's file list. Named here so the next reconcile finds them rather
than the next confused reader.

`CLAUDE.md`'s table entry for the conventions file does not enumerate these sections, so it needs no
edit for this step. It also does not yet list `rules/workbench-stash-and-lock.md` — a `/fusion:revise-claude-md`
concern, not this step's.

## Files touched

- `rules/fusion-workbench-conventions.md` — 59 303 → 51 416 B. Lines 604..EOF removed; pointer block
  appended under the two original headings.
- `rules/workbench-stash-and-lock.md` — new, 9 250 B. Provenance header cites the Circle
  (form 2): no decision record exists for this cut, and the plan step is its whole motivation.
- `bin/fusion-rules` — `1e` emission block, orchestrator only.
- `agents/orchestrator.md`, `skills/circle-stash/SKILL.md` (×3), `skills/circle-pop/SKILL.md` — five
  citation redirects.
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated deliberately.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` — `CEILING` 131 685 → 128 555 plus its history
  entry.

Not touched, per the dispatch: `hooks/dist` (step 5), `.claude-plugin/plugin.json` (step 6), the 13
open findings, any classifier code.

## Verification

- `npx vitest run` (not `npm test` — that runs `tsc` and would rebuild `hooks/dist`, blurring step 5's
  finding that the checked-in build has lagged the source since 2026-08-01): **27 files, 1543 tests,
  all passed**, 162 s.
- Provenance lint: green; the new file carries its header on line 3.
- Path-literal lint: green. Worth recording why the new file cannot trip it — it contains the stash
  layout tree with `planning/`, `issues/`, `decisions/`, `history/`, `reviews/`, `analyses/`, which
  are exactly the flagged literals, but the gate's file set is `agents/*.md` plus non-exempt
  `skills/*/SKILL.md` and never reads `rules/`. The text was legal in the conventions file under the
  "single authoring home" exemption and is legal in the new file because the gate does not look
  there. That is an exemption by omission rather than by decision, and a rule file that names type
  folders now exists outside the two files CLAUDE.md says may name them.

## A note on the guard, since this session met it

The first command of the session was denied fail-closed: it built its paths from a `$S` shell
variable, and `cp`'s destination could not be proven outside the protected list. Documented behaviour,
and the deny message named the fix (write the path out literally). Rephrasing was not attempted and
`Write` was not reached for. Recorded because `rules/protected-path-discipline.md` exists to make
exactly this deny legible rather than something to route around — it was, and it took one retry.
