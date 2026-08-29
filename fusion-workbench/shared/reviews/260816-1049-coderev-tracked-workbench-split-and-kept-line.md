# Code review — the tracked-workbench split, the KEPT line, and the golden regeneration

**Sender:** coderev
**Date:** 2026-08-16 10:49
**Reviewed-range:** `433e206..b18a8cf`
**Not-opened:** none
**Carried scope:** **unknown, not empty.** `bin/fusion-review-coverage --since 433e206` reported `carried=(not recorded)` before this file landed: no earlier review recorded a `**Not-opened:**` field, so there was no carried list to add and none may be assumed empty. The `none` above is a statement about `433e206..b18a8cf` alone — every file the commit touches was opened — and asserts nothing about ranges before `433e206`.
**Commit under review:** `b18a8cf` docs(rules): the tracked-workbench split names the legacy stores, and the KEPT line names what is kept

---

## Summary

Every one of the four things the dispatch asked to be checked holds. The scope clause at
`rules/fusion-workbench-conventions.md:74` tiles the ten non-artifact root entries exactly, verified
against the layout tree rather than against the resolution note. The `.gitignore` block agrees with
itself and with the rule, with no residue of the reverted intermediate version, and all three `KEPT`
entries are genuinely tracked. The golden regeneration moved nothing but the one file size and the
15 stanza totals, `RULE_BASELINE` was not touched, and the universal-core bound is armed and cannot
be masked by a regeneration. The discharge line on `260815-1633` is accurate and its `_o_` marker is
correct.

Four findings, none of them a defect the commit introduced. Two are false or unexercised claims that
sit in the exact text this commit re-certified and that three passes over this section have now
walked past; one is a stale qualifier four lines above the block the commit rewrote; one is a
session history that describes a reverted state as landed.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

---

## What was verified, and how

### 1. The scope clause at `:74` is exact

Derived independently from the layout tree at `:26-61` rather than from the resolution note.

The tree names fourteen root entries. The clause excludes the four artifact stores (`circles/`,
`shared/`, `archive/`, `stilwerk/`) and the two legacy stores, leaving ten in scope:

| Root entry | Group | Where it is named |
|---|---|---|
| `orchestrator-events.jsonl` | records | `:76` |
| `portfolio.md` | records | `:76` |
| `.fusion-setup` | records | `:76` |
| `.guard-state/events.jsonl` | records | `:76`, split by the rule at `:79` |
| `.guard-state/` (rest) | live | `:77` |
| `agentstate.yaml` | live | `:77` |
| `orchestrator-live.md` | live | `:77` |
| `.commit-lock/` | live | `:77` |
| `.session-marker` | live | `:77` |
| `.active-circle` | live | `:77` |
| `monitor` | live | `:77`, trailing sentence |

Ten entries, no overlap, no remainder, with `.guard-state/` deliberately split across both by `:79`.
The clause's `legacy stores` has a defined antecedent ten lines above it at `:64` ("Two legacy stores
are absent from this tree on purpose"), so the exclusion is readable where it is written.

The improvement over the first fix is real rather than cosmetic, though the *outcome* for a workbench
carrying either store is unchanged: `archive/` is in the "all simply tracked" list, so "follow
`archive/`" resolves to simply tracked, which is what "and the two above, all simply tracked" already
said. What changed is the kind of statement — an unconditional assertion about stores that exist
nowhere became a conditional rule with a stated ground, which is exactly the `Also seen:` objection
appended to the record on 260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md.

**One observation, not a finding.** `monitor`'s membership rides on the bullet's trailing sentence
rather than on its enumerated list, whose subject clause is "each describe *now*" — which `monitor`
does not do. The tiling holds because the sentence is inside the bullet and carries its own reason
(`/fusion:setup` re-creates it), but a reader counting the enumerated list gets six of the seven live
entries. Not worth an edit on its own; worth knowing if the bullet is ever rewritten.

### 2. The `.gitignore` block agrees with itself and with the rule

No residue of the reverted intermediate version. `.gitignore:67` names three entries; `.guard-state/events.jsonl`
appears only at `:68`, inside the sentence that says it is not excepted.

Each entry measured rather than assumed:

| Path | `git check-ignore` | `git ls-files` |
|---|---|---|
| `fusion-workbench/orchestrator-events.jsonl` | not ignored | tracked |
| `fusion-workbench/portfolio.md` | not ignored | tracked |
| `fusion-workbench/.fusion-setup` | not ignored | tracked |
| `fusion-workbench/.guard-state/events.jsonl` | ignored by `.gitignore:78` | untracked |

The `KEPT` line is also *complete*, which the dispatch did not ask about: the non-artifact-store root
entries that are actually tracked in this repository are exactly those three. Checked by walking the
whole workbench root, not by re-reading the line.

The `/fusion:archive` → "the archive step of `/fusion:cleanup`" rewrite at `:69-70` matches
`rules/fusion-workbench-conventions.md:81` verbatim in substance.

### 3. The golden regeneration recorded growth and did not mask it

The fixture diff is 30 insertions and 30 deletions in one hunk. Two lines moved in each of the 15
agent stanzas and nowhere else: `fusion-workbench-conventions.md 55104 → 55184`, and that stanza's
`total` by the same +80. Confirmed independently against the working tree
(`wc -c rules/fusion-workbench-conventions.md` = 55 184) and against `433e206` (= 55 104). No other
rule file's size moved, no stanza gained or lost an entry, the fixture's first 14 lines are untouched.

**The bound is genuinely armed, and a regeneration cannot side-step it.** The hard assertion at
`rules-emission-golden.test.ts:954` reads `ruleGrowth(coreFiles)`, and `ruleGrowth` at `:629-630` is
`growth(files, RULE_BASELINE, GROWTH_BUDGET)`. The golden fixture is not an input to it. `RULE_BASELINE`
is a hand-edited constant at `:460-471` and the commit does not touch that file at all — the diff's
file list carries no `.test.ts`. Measured:

| | bytes |
|---|---|
| core floor (`RULE_BASELINE` over the five always-on files) | 86 573 |
| core emitted after the edit | 89 703 |
| budget (floor + `GROWTH_BUDGET` 12 000) | 98 573 |
| head-room remaining | 8 870 |

This matches the commit message's figure. The test's own header states the property at `:184`
("Regenerating the golden does not move `RULE_BASELINE` and therefore never clears the bound") and
the code holds it. **No record is warranted here** — the masking failure the dispatch asked about
does not exist.

Suite re-run independently: `cd hooks && npm test` — exit 0, 40 files, 764 tests.

### 4. The `260815-1633` discharge line is accurate and the `_o_` marker is right

The appended paragraph claims the `.gitignore` half is done and that two other sources still write the
old form. Re-grepped rather than re-read:

```
grep -rn -E '/fusion:(archive|log-activity|curate)\b' --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=fusion-workbench .
```

Eight hits. Four are the deliberately-correct set (`CLAUDE.md:21`, `README-agents.md:239`, `:240`,
`:246`). Four are the residual: `hooks/lib/events.ts:70` plus its two compiled mirrors
(`hooks/dist/lib/events.js:31`, `hooks/dist/lib/events.d.ts:47`), and
`hooks/lib/__tests__/monitor-warnings-panel.test.ts:508`. That is exactly the set the discharge line
names. `.gitignore` is gone from the list. The record's thesis is undischarged while three sources
stand, so `_o_` is correct.

---

## Findings

### Theme: a classification whose stated ground is false

#### F1 — the split justifies tracking `portfolio.md` as "not machine-refreshed", and the playmaker regenerates it in full on every run — **Medium**

`rules/fusion-workbench-conventions.md:76` (always-on rule, every agent, every dispatch):

> `portfolio.md` (authored text, not machine-refreshed)

Three sources in the tree contradict it, one of them nine lines above in the same file:

- `rules/fusion-workbench-conventions.md:49` — the layout tree: `portfolio.md  # playmaker output`
- `agents/playmaker.md:151` — "Regenerate `$PORTFOLIO` in full on every run (overwrite)."
- `fusion-workbench/portfolio.md:3` — the live file's own header: `**Generated:** 260815-2116-playmaker-orchestrator-phase4.md (by
  playmaker session 260815-2116-playmaker-orchestrator-phase4)`, and at `:13` "Every figure here was
  measured against disk on this run; nothing is carried forward from the previous portfolio."

**Where the false half came from, and why it is now the only half.** The clause was written in
`65f7c3b` as a *joint* parenthetical for two files: "`tasklist.md` and `portfolio.md` (authored text,
not machine-refreshed)". That commit's own message states the real ground for each, and they are
different: "tasklist.md is written prose with reasoning and acceptance wording; **portfolio.md is
regenerated whole** but each version is a complete briefing, and the arguable case was left tracked
rather than guessed at." So the parenthetical described `tasklist.md` and never described
`portfolio.md`; the author knew this and recorded the correct ground in the commit message instead.
`tasklist.md` was removed on 2026-08-15 and the parenthetical stayed attached to the file it was
never true of.

**The classification is probably right; the ground given for it is not.** 17 commits have touched
`portfolio.md` across its life, not one per Turn, so the diff-noise argument that puts
`orchestrator-live.md` in the live group does not carry here. `65f7c3b` already supplies the correct
clause: each version is a complete briefing, so a past version answers something.

This matters more than a wording nit because the sentence is the *criterion text* a consuming project
reads to decide its own `.gitignore`, and it hands that project a test ("is it machine-refreshed?")
that gives the wrong answer on the one entry it is attached to. Three passes over these two bullets
in three days — `0a514e6`, `d83c1b4`, `b18a8cf` — each certified the section as tiling with no
remainder and none read the parentheticals.

Filed: `260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md`

### Theme: a preservation mechanism asserted and never exercised

#### F2 — the guard log's preservation half has never run, and `archive/` has no commit in the repository's entire history — **Medium**

Both texts the commit is responsible for keeping true rest on the archive roll:

- `.gitignore:70-72` (rewritten by this commit) — "what preserves it is the archive step of
  `/fusion:cleanup`, which rolls it into `fusion-workbench/archive/` under a dated name, and the
  archive store is tracked. So the evidence lands in git without the live log producing a diff on
  every tool call."
- `rules/fusion-workbench-conventions.md:81` — "the record side of the split is satisfied by the
  rolled copies. That is the one entry above where 'track them' reads as 'keep what the roll
  produces', and **it is the configuration this repository runs**."

Measured:

| | |
|---|---|
| `fusion-workbench/archive/` on disk | empty (0 entries) |
| `git log --all -- fusion-workbench/archive` | **0 commits, in the repository's whole history** |
| `fusion-workbench/.guard-state/events.jsonl` | 18 128 lines, ignored by `.gitignore:78`, untracked |

`skills/archive/SKILL.md:130` states the roll "is the **only** thing that bounds its size". So every
guard block, halt, cleared halt, advisory override and fail-open this project has ever emitted sits
in one ignored, untracked, unbounded file that a fresh clone drops and `git clean -xdf` deletes —
which is precisely the outcome that classifying the log as a *record* was meant to prevent
(decision `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`).

The two sentences are not false — they describe a mechanism that exists and would do what they say.
What is false is the implicature of `:81`'s closing clause: the configuration this repository runs is
the *untracked* half of that pair and not yet the *preserving* half, and it has been that way for the
whole life of the store.

Filed: `260816-1050_*_the-guard-logs-preservation-half-has-never-run-and-the-archive-store-has-no-commit-in-the-repositorys-history.md`

### Theme: comment text left behind by the block's rewrite

#### F3 — `.gitignore:65` still attributes both consequences to the lifecycle skills, and one lost its consumer — **Low**

`.gitignore:65-66`:

> The split and its two consequences **for the lifecycle skills** are stated in
> rules/fusion-workbench-conventions.md, "Which of them a tracked workbench tracks".

`rules/fusion-workbench-conventions.md:83` says otherwise for one of the two: the first consequence
still binds skills ("no skill may promise that git holds its bytes"), while the second — the
`git stash --include-untracked` asymmetry — "had its consumer in the two stash-and-restore skills and
lost it when they were removed on 2026-08-15; it is kept because it governs any command that sweeps
the tree, **not because a skill reads it today**."

This commit rewrote `:67-72` of the block and left `:61-66`. A three-word fix.

Filed: `260816-1051_*_the-gitignore-block-still-calls-both-consequences-lifecycle-skill-consequences-and-one-lost-its-consumer.md`

#### F4 — session history `260816-1030-coder-tracked-workbench-split-remainder.md` states the reverted four-entry KEPT line as what landed — **Low**

`260816-1030-coder-tracked-workbench-split-remainder.md`, under
"What changed", item 1:

> **1. `.gitignore:67`** — the KEPT list now names the records group exactly as
> `rules/fusion-workbench-conventions.md:76` states it: `orchestrator-events.jsonl`,
> `.guard-state/events.jsonl`, `portfolio.md`, `.fusion-setup`.

Four entries. The landed line has three, and the fourth is the one the commit message says was
"Reverted before commit". The reversal is documented — in a *different* file,
`260816-1040-coder-gitignore-kept-line.md`, committed in the same commit — and nothing in `1030`
points at it. `1030` was edited after the fact (it carries a 10:35 addendum on the golden
regeneration), so the file was reopened and the stale sentence was left standing.

The committed record set therefore says two different things about what one line contains, and the
one that describes it wrongly is the one a reader reaches first, since it is the pass's main history
file and `1040` reads as a sub-note.

Filed: `260816-1051_*_the-main-session-history-states-the-reverted-four-entry-kept-line-as-what-landed.md`

---

## Cross-cutting observation

F1 and F4 are the same failure at two scales, and the section under review has now produced it twice
in one week. A statement is written as a *joint* claim about two things (a shared parenthetical
covering `tasklist.md` and `portfolio.md`; a shared history file covering two edits), one half of the
pair is later removed or reverted, and the surviving text keeps the framing that only ever fitted the
departed half. Neither lint gate can see it: `reference-resolution-lint` has no path to resolve and
`derivable-enumerations-lint` has no enumeration to match. What catches it is reading the
justification and not only the list — which is the reading three consecutive passes over
`:74-77` did not perform.

The `.gitignore` block is worth one deliberate pass in full rather than a fifth line-by-line
correction. F3 and F1 are both inside it or one line from it, and each of the last three commits to
touch it fixed a different sentence and left its neighbours.

## Recommended sequencing

1. **F1** — an always-on rule that hands consuming projects a criterion giving the wrong answer on
   the entry it is attached to. `65f7c3b`'s commit message already contains the replacement clause.
2. **F2** — no text change is obviously right here; it may be an operational act (run the roll) or a
   softening of `:81`'s closing clause, or both. Worth deciding rather than editing.
3. **F3** and **F4** — cleanup, and F3 rides naturally with F1 since both are in text this session
   already opened.

Nothing here blocks a release.

## References

- Commit under review: `b18a8cf`, range `433e206..b18a8cf`
- Source record: `260816-0136_*_the-tracked-workbench-splits-declared-scope-reaches-two-legacy-stores-neither-group-classifies.md`
- Second record touched: `260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
- Originating commit of the `portfolio.md` clause: `65f7c3b`
- Coverage: `bin/fusion-review-coverage --since 433e206` reported `uncovered=1` before this file
