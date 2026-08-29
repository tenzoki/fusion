# Coder — step 9 of the protected-path removal

**Date:** 2026-08-12 15:00
**Agent:** coder
**Status:** Complete
**Dispatched by:** orchestrator
**Plan:** `260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`, step 9

---

## What was asked

The step the plan says cannot be split: delete `rules/protected-path-discipline.md`, its
`emit_if_exists` line, its golden entry, its budget entry and every prose citation, in one
commit, because `reference-resolution-lint` fails if the file goes while a citation stands and
`derivable-enumerations-lint` fails if the documented always-on list stops matching the
emission. Plus three additions the previous four executors found and handed over —
`README-hooks.md` left more internally inconsistent than before, `hooks/lib/project-relative.ts`
justifying itself by the deleted configuration key, and `skills/` absent from the plan's file
list.

## Verification

`cd hooks && npm test` — **exit 0.** 48 files, 986 tests. Identical to the baseline at
`b77675d`: no test added, none lost, none re-pointed away from its subject.

Two intermediate runs are worth recording because each was a gate doing its job rather than a
nuisance:

1. The first full run failed on ONE case — `reference-resolution-lint`, `CLAUDE.md:64`, a
   citation of `rules/protected-path-discipline.md` in the very sentence explaining that the
   file had been deleted. Fixed by naming the file without a resolvable path token.
2. The regeneration run failed on purpose, as designed, and had to be repeated clean.

## The number, which is the point of the step

| | Shipped rule text | + chat voice profile | Total per dispatch |
|---|---|---|---|
| Before (`b77675d`) | 91 090 | 7 353 | **98 443** |
| After | 80 670 | 7 353 | **88 023** |
| Saving | 10 420 | — | **10 420 per dispatch, every agent** |

Per role, from the regenerated golden:

| Role | Agents | Before | After |
|---|---|---|---|
| core only | bugfixer, coder, coderev, consultant, editor, ontocoder, ontorev, reconciler | 91 090 | 80 670 |
| + `design-diagrams.md` | analyst, conceptrev, investigator, planner, taskplanner | 96 763 | 86 343 |
| + `circle-records.md` | playmaker | 101 984 | 91 564 |
| + `circle-records.md` + `design-diagrams.md` | shaper | 107 657 | 97 237 |
| + `circle-records.md` + `workbench-stash-and-lock.md` | orchestrator | 114 941 | 104 521 |

Every role falls by exactly 10 420, and the chat voice profile is unchanged, so the
per-dispatch saving is the same figure for all sixteen agents. The rule weighed 10 541; the
difference is stated below.

## The golden diff is NOT the uniform 10 541 the dispatch predicted, and why

The dispatch said the fixture diff should show one file leaving each role's set and every
total falling by 10 541, and that anything else is a finding. It shows one more thing:

```
16 +  critical-stance.md 9958
16 -  critical-stance.md 9837
16 -  protected-path-discipline.md 10541
```

**`rules/critical-stance.md` grew by 121 bytes, and I grew it.** Its worked case — the one
the whole "no premature solutions" section is argued from — said in the present tense that
"the guard **now** compares a fingerprint of the protected paths taken before the command with
one taken after". This step made that false. An always-on rule read by all sixteen agents on
every dispatch, carrying a false claim about the mechanism the same commit deletes, is the one
thing I was not willing to leave standing to protect a headline figure.

It was written three times and cut twice to get the cost down: the first version was +442, the
second +257, the shipped one +121. It reads:

> The fix was not a better classifier: the guard stopped predicting and compared a fingerprint
> of those files taken before the command with one taken after, a decided question rather than
> a predicted one. (That measurement has since been removed as well, on its own measurement: it
> never once caught what it was built to catch.)

The case now carries both halves, which is a better rule than it was: an undecidable question
is not answered by building harder at it, and a mechanism that answers a decidable one
correctly can still be the wrong mechanism to have.

Net: −10 541 + 121 = **−10 420**. Nothing else moved in the fixture.

## The budget report now fires for every role, and that is correct

`RULE_BASELINE` carried `"protected-path-discipline.md": 19_943` against a 10 541-byte file —
the entry was last cut on 2026-08-05, when the file really was that size. Dropping it lowers
every role's floor by 19 943 while the emission drops by 10 420, so the report crosses its
12 000-byte head-room for all five roles at once:

| Role | Emitted | Floor | Budget | Over |
|---|---|---|---|---|
| core only | 80 670 | 63 654 | 75 654 | 5 016 |
| design-diagrams | 86 343 | 69 327 | 81 327 | 5 016 |
| circle-records | 91 564 | 72 956 | 84 956 | 6 608 |
| circle-records + design-diagrams | 97 237 | 78 629 | 90 629 | 6 608 |
| circle-records + stash-and-lock | 104 521 | 82 206 | 94 206 | 10 315 |

It names the growth: `fusion-workbench-conventions.md` +11 453, `critical-stance.md` +4 641,
`agent-setup.md` +721, `user-facing-output.md` +101, `decision-record-examples.md` +100 —
17 016 bytes across the five surviving core files, of which the oversized
`protected-path-discipline.md` entry had been masking 9 402.

**I did not re-baseline, and that is the substantive judgement of this step.** The file's own
doctrine says `RULE_BASELINE` is re-cut at a cleanup, and this is one, so re-baselining was
available and defensible. It was the wrong call: this cut removed 10 541 bytes and cut none of
the 17 016 that grew, and re-baselining would have absolved that growth in the same edit that
removed the thing hiding it — the exact failure mode ("a number nothing asserts is a number
nobody notices moving") the instrument was built for. The report fails nothing; it is a
`console.warn` and the suite is green. The reasoning is written into the file at the new
2026-08-12 history entry so the next reader does not re-derive it.

Note for the record: the report was ALREADY firing before this step, for the orchestrator
alone, by 792 bytes. It was not silent and then loud; it went from one role to five.

## What was removed, exactly

- `rules/protected-path-discipline.md` — deleted (`git rm`).
- `bin/fusion-rules` — the `emit_if_exists` line and the seven-line comment above it.
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated from live measurement,
  never hand-edited. Sixteen blocks, one file gone from each.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` — the `RULE_BASELINE` entry.
- Prose citations: `README-agents.md` (always-on core bullet), `CLAUDE.md` (opening paragraph,
  the guard bullet, the `hooks/` layout row, the `fusion-guard.json` row, the guard-rule
  convention, the troubleshooting row), `README.md` (guard bullet, tuning table, the
  "three things" line), `README-hooks.md` (below), `docs/philosophy.md`, `docs/working-model.md`.

**The golden's three HISTORY citations at `:26`, `:246` and `:316` were KEPT**, against the
plan's inventory, which lists them for removal. They are dated entries in a changelog of how
the fleet number moved, cut by cut, and the file's own established practice is that such
entries keep naming files that were later deleted — `:316` already names
`protected-path-internals.md`, gone since v6.0.0, and `:246` names it too. Deleting the record
of a cut is a loss the instrument cannot afford; a new dated entry for THIS cut was added
instead. Reference-resolution-lint does not scan the test tree, so nothing forced the choice
either way.

## The "three things cause a block" sentence, and the fourth surface

Three surfaces carried it and all three now say two: `README-hooks.md:238`, `README.md:113`,
`docs/working-model.md:84`.

The dispatch asked whether a fourth says it too. **Grepped the whole shipped surface for
`three things`, `only three`, `Three things` and `Only three`, plus every occurrence of
`protected path` outside the two files being rewritten. There is no fourth statement of the
block enumeration.** Seven other hits exist and none of them is the sentence: three Circle
components, three items in an unrelated list, the three Circle-key agents. The
`hooks/guard.ts` header already said "TWO things" — step 6 corrected it there.

Both remaining statements name the halt and the decision-governed path, and both say what the
third was, because a reader upgrading from an older tree needs the subtraction rather than a
silently shorter list.

## README-hooks.md — the file step 6 left half-done

Step 6 changed six lines under lint duress and said explicitly that the file was now MORE
internally inconsistent, not less. That is what it was: a full section describing the
measurement in detail, above a file table that no longer listed any of its modules. Rewritten
here:

- **Concept** — three layers to two, with the third named as removed and linked forward.
- **The architecture diagram** — the two `lib/protected-snapshot.ts` legs, the
  `protected-snapshot.json` state file and the "fingerprints again, restores, raises the halt"
  line are gone; the `Bash` leg now says it allows immediately and writes no state.
- **Churn Detection** — "a halt now has two sources" is one source again.
- **Configuration bullets** — the Protected-paths bullet.
- **The subdirectory warning** — the cwd-anchored list now names CHECK 3 rather than the
  write-tool deny (the deny it named is gone; `project-relative.ts` is still cwd-anchored for
  CHECK 3, which is why the warning still matters). The "measurement is not among them"
  paragraph is replaced by the churn heatmap, which is the surviving root-anchored mechanism.
- **The files table** — the `guard.ts`, `tracker.ts`, `lib/project-relative.ts`,
  `lib/guard-state-file.ts`, `lib/churn.ts` and `lib/self-detect.ts` rows.
- **The tuning table** — three of five rows. "Advisory-only (blocks only the guard-config
  floor)" is now "Advisory-only (warns, never blocks)", which it finally is; the
  `FUSION_ALLOW_RULES_WRITE` row is gone; "plus two session env vars" is gone, because the
  hooks read exactly one environment variable now and it is `CLAUDE_PLUGIN_ROOT` (grepped, not
  assumed).
- **Case folding** — both paragraphs. The fold was the protected list's; `foldCase` has one
  caller left and it is the review-coverage store comparison. The section now says the match is
  case-SENSITIVE and points at the open decision `260804-1632_*_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md`, one of whose two grounds ("this
  is CHECK 3, not CHECK 2; `guard.protectedPaths` is matched folded and is unaffected either
  way") has no other side left. That is the same residual step 6 recorded in `paths.ts`, now
  visible to a user rather than only to a reader of the module.
- **Both rule roots are protected** — gone.
- **The halt's reach and the event-log prefixes** — two prefixes are still written, two appear
  only in history, and the row says a legacy halt still blocks and still clears.
- **Per-project configuration** — the git-tracked paragraph, the merge example, the "declared
  list does not grow" paragraph, the self-protection floor and the flag-precedence paragraph.
  **One paragraph was ADDED**: the retired-key advisory. Step 7 built the diagnostic and step 8
  put it in the seeded template; nothing put it in the file a user reads to understand the
  guard, and it is the only thing that reaches a project already set up.
- **"Protected paths are measured, not predicted"** → **"The protected-path half, and why it
  was removed"**, four paragraphs where there were nine. It is kept rather than deleted for the
  reason `guard.ts`'s header is: its absence is what a reader of an older tree, an older README
  or an existing `events.jsonl` comes looking for. It carries both generations (classifier,
  then measurement), why the whole half went anyway with the two measurements that decided it,
  what went by name, and what survives — the legacy-halt migration path, the retired-key
  advisory, and the stand-down rule.

The anchor moved with the heading, and both inbound links were updated.

## The two survivors, rewritten rather than cut

Both describe a real defect class, and in both the citation dies while the fact does not.

**`hooks/lib/churn.ts`** — four sites, not the one the plan lists:

- `:214` (`coerceChurn`) — cited `rules/protected-path-discipline.md` as "the silent-revert
  failure this was written against". Rewritten to state the class without the revert: a throw
  in the state load discards whatever the hook was about to tell the model, and an agent that
  is acted upon and not told works around the effect because from inside the session nothing
  happened. It now names the four reporters that still leave through that same `respond()`.
- `:51` (`KEY_ANCHOR`) — justified the workbench-root anchor by agreeing with the measurement.
  The measurement is gone; the anchor is not, and the rewrite says the ground was always the
  root itself, with the agreement a benefit rather than the reason.
- `:104` (`TRACKER_NOISE_FILES`) — said `guard.ts` "now writes a fresh snapshot file into
  `.guard-state/` on every guarded call". It does not. The entry survives on the escalation
  counter, the event log and the throttle records, which is stated.
- `:272` (`churnKey`) — cited `narrowingTarget` in `tracker.ts`, deleted in step 6.

**`hooks/lib/guard-state-file.ts:15`** — cited "the protected-path halt message" as what the
`as`-cast defect discarded. Rewritten the same way: measured on that message, not specific to
it, and the hook still has several things to say.

**`hooks/lib/project-relative.ts`** (the previous executor's handover, not on any step's list)
— the module justified its own existence by `guard.protectedPaths` in two places and by the
self-protection floor in a third. It is live: `guard.ts` CHECK 3 and `churn.ts` both call it.
The header now opens with a "who asks, and against which directory" section naming both callers
and why each passes a different directory, the function docstring names `guard.categoryPaths`
and the churn key instead of the deleted list, and the "direction this moves the guard"
argument is kept — with the floor named as gone and the argument restated as the reason the
middle case may resolve at all, since resolving can only add denials and whoever adds the next
caller has to be able to check that.

## `skills/`, which no step listed

Grepped the whole directory rather than fixing the one line the dispatch named.

- `skills/help/SKILL.md:104` — sent a user to `hooks/config.example.json` for "Categories,
  protected paths, churn thresholds, escalation behavior". That file has had no protected paths
  since step 8. Now names the decision categories and their sensitivities.
- `skills/setup/SKILL.md` Step 0f — **three false claims, and one of them is procedural.** The
  step said this file "is where a project narrows or widens what the guard protects" and "it
  decides what the guard protects"; both are gone. The third is the interesting one: the step
  runs two commands instead of one, and its stated reason is that `fusion-guard.json` "is the
  only file Setup seeds that the guard protects once it exists, so the plain one-command form
  is denied on every later Setup run" — measured against the guard, and no longer true. **The
  probe is kept and its reason rewritten**: it is no longer denied, and reporting `present` is
  still a better answer for a user than a silent no-op. Changing the procedure on top of a
  removal would have been a second change riding a first. The `present` branch's "do not run
  the copy anyway" advice is kept with a true reason — the template declares nothing, so
  copying it over a filled-in file would replace real settings with an empty inheritance.
- `skills/commit/SKILL.md:27` and `skills/archive/SKILL.md:129` — checked and left. The first is
  about the git index, not the guard; the second is about `guard_block`/`guard_halt` events,
  which still exist and whose oldest rows are exactly what it argues must never be truncated.

## What the plan got wrong, or did not know

Six things. The first three are the ones that would have turned the suite red.

1. **`hooks/lib/__tests__/context-manifest.test.ts` asserts the emission of the rule file,
   twice, and is on no step's list.** Its "a missing always-on rule file is skipped silently"
   suite builds a stripped plugin copy and asserts every always-on file after the stripped one
   is still emitted; `protected-path-discipline.md` was in that list, and a second case used it
   as the witness that the emission ran to the end. Re-pointed at `critical-stance.md`, which is
   now the last always-on emission and is therefore a STRONGER witness for the second case —
   noted in a comment so the next editor knows the choice was not arbitrary.

2. **Deleting the rule file kills the last citation of three `EXAMPLE_PATHS` entries in
   `reference-resolution-lint.test.ts`**, and that file has a "no dead weight" test that fails
   on an exemption nothing cites. `rules/x.md`, `rules/old.md` and `rules/retired/old.md` were
   the guard docs' fabricated operands, and every citation of them lived in the rule file or in
   the README-hooks sections this step rewrote. All three entries removed, with a comment
   recording what caught it. `rules/relevant-file.md` survives (README-hooks' event-JSON
   example) and `bin/fu` survives trivially, being a substring of every `bin/fusion-*` path in
   the corpus.

   Removing them required one further edit: `hooks/lib/project-relative.ts:139` carried
   `mv rules/x.md rules/retired/` as "the flag's headline use", which was the last citation
   keeping `rules/x.md` alive. The paragraph documented a flag that no longer exists; the
   trailing-separator argument above it was generalised from `agents/**` to a bare `dir/**` and
   kept, because `guard.categoryPaths` compiles through the same glob compiler and the
   asymmetry is unchanged.

3. **`rules/critical-stance.md:57` states the measurement as current fact, in the present
   tense, and is on no step's list.** It is an always-on rule. See the golden-diff section
   above.

4. **`bin/monitor:139` justifies the advisory cap by `FUSION_ALLOW_RULES_WRITE`** — "an advisory
   is emitted once per exempted write, so a curation session with the flag set emits one per
   file it rewrites". The flag is gone and the argument got STRONGER rather than weaker: the
   retired-key advisory and every wrong-typed-key diagnostic emit once per guarded tool call,
   unbounded, until the line is edited. Rewritten to say that, together with the matching
   comment in `monitor-warnings-panel.test.ts`. The test's thirty-advisory fixture keeps its
   old detail strings, deliberately — the panel must still render an advisory a consuming
   project logged before it upgraded.

5. **`CLAUDE.md`'s opening paragraph was the largest single citation and the plan's inventory
   counts it as one line.** It is a whole argument about which directory each stand-down asks
   about, built entirely on the protected paths. Rewritten into three paragraphs: what stands
   down now (the write-tool branch and the churn heatmap), the rule the two follow (evaluate a
   stand-down in the space the mechanism keys its state by) with the measurement named as where
   both halves of that were measured, and the branch policy that was never covered by it.

6. **The plan's step-9 list names `hooks/lib/guard-state-file.ts:15` as citing the RULE.** It
   does not; it cites the protected-path halt MESSAGE. The correction needed was the same either
   way, so this cost nothing, but the inventory is one file out.

## The consequence this step creates, stated rather than left to be met

**No rule now tells a sub-agent what a halt is or how it is cleared.** Grepped: `clear-halt`,
`HALTED` and `haltActive` appear in `agents/orchestrator.md` and `skills/setup/SKILL.md` and,
until today, `rules/protected-path-discipline.md`. Nowhere else, and neither of the survivors
is loaded by a sub-agent.

A halt is still reachable — three consecutive CHECK 3 blocks — and a legacy halt carried
through an upgrade still blocks. What an agent has left is the block message itself, which
names the full `cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js` command and
is pinned by `legacy-halt-clearing.test.ts`. That may well be enough; it is a smaller surface
than a rule, and this step's whole point is subtraction. **It is not my call to add an always-on
rule back in the commit that removes one**, so it is recorded here and in `CLAUDE.md`'s
guard-rule bullet rather than acted on. If it is wanted, it is a decision, and it belongs to
whoever weighs 10 420 bytes a dispatch against it.

## Two stale queue entries, for the taskplanner or the reconciler

`fusion-workbench/tasklist.md:811` and `:882` are open tasks whose instructions cite
`rules/protected-path-discipline.md` — one as the rule that governs editing a protected rule
file, one as the site at which a halt's self-clearing exposure must be written down. Both
instructions are now unexecutable as written. The tasklist is the taskplanner's file and I have
no task in it, so I have not edited it.

## Not done, and deliberately

- **Step 10.** No verification against a project root that is not this repository. The release
  process requires it before any guard change ships.
- **No re-baseline of `RULE_BASELINE`.** Reasoned above.
- **No commit.** The orchestrator commits.
