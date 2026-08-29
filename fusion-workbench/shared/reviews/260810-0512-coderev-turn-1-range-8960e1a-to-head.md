# Code review — `8960e1a..HEAD`, session `260810-0241-orchestrator-session.md` Turn 1

**Sender:** coderev
**Range:** `8960e1a..HEAD`, 15 commits, 23 non-workbench files
**Origin:** Not Circle work. No Circle active — filed to `shared/`.
**Suite state at review time:** `npm test` **red** (1 failed / 961 passed, 37 files)

---

## Part 1 — The diagnosis asked for before any finding

The user's question, deferred from the human gate on
`260808-0030_*_the-coderev-pass-filed-four-issues-and-left-no-review-file.md`: reading
`agents/coderev.md` at HEAD, is the obligation to write the review file unambiguous, could a dispatch
suppress it, and does it survive a pass that finds nothing?

**The short answer: the prompt is not unambiguous, and the ambiguity has a specific shape. There are
two review-file obligations in it, only one is unconditional, and the sentence everyone quotes as the
obligation is not one.**

### 1. Where the obligation actually lives, quoted

Three passages carry it, and they are not equally binding.

**`agents/coderev.md:69` — descriptive, not imperative.** This is the line the defect record cites,
and it is the weakest of the three:

> You write no separate session-history entry — your review file under `$OUT_REVIEW` is this session's
> durable record, and a history log would only duplicate it.

Grammatically this is a statement of fact offered as the *reason* for a different instruction (do not
write a history entry). It contains no verb directed at the agent about the review file. An agent
reading for its obligations finds one here — "write no history entry" — and that one is satisfied by
inaction.

**`:76` — imperative, but scoped to a per-topic loop.** Under `### Per-topic session files`, opening
*"For each topic the user raises or each module you scope:"*, step 3 reads:

> Save result directly to `$OUT_REVIEW/YYMMDD-NN-coderev-<short-description>.md` […] the `coderev`
> sender segment is mandatory

This is unconditional **given** that the pass identified topics. Its filename shape is also wrong:
`YYMMDD-NN-…` contradicts `rules/fusion-workbench-conventions.md` `## Filename Patterns`, which
specifies `YYMMDD-HHMM-<sender>-<topic>.md` for a review. That mismatch matters here, because a
per-topic file written to the prompt's spelling does not look like a review file to anything scanning
the store.

**`:87` — imperative, and explicitly conditional.** Under `### Final consolidated review`:

> **When the user asks for the final review:** […] 5. Write to
> `$OUT_REVIEW/YYMMDD-HHMM-coderev-<topic>.md`

The trigger is the user asking. A dispatch that does not use those words does not fire it.

**`:33` — the conjunction, conditional on findings existing:**

> If you find issues, **report them** in your review and file each one as a separate file in
> `$OUT_ISSUE`

### 2. Can a pass satisfy the prompt while producing only issues? Yes.

The route is short and requires no misreading. A dispatch scoped as one topic ("review this range")
gives the per-topic loop a single iteration. Step 7 of the consolidated section then says the per-topic
files are working notes to be **deleted** once consolidated. So the pass's own reading is: per-topic
files are transient, the durable artefact is the consolidated review, and the consolidated review is
gated on *"when the user asks for the final review"*. If the dispatch asked for findings rather than
for "the final review", nothing in the prompt is violated by filing four issues and stopping.

That is consistent with what the record documents about `260807-2020-orchestrator-session.md`: four issues, well-evidenced,
correctly routed, and no review file. It is the behaviour of an agent following the conditional rather
than an agent skipping a step.

**A second, independent route: dispatch framing.** This dispatch is the counter-example that proves
it. The user wrote *"**Write your review file.** … This is not boilerplate in your dispatch"* — an
explicit instruction, added because the default was not trusted to produce one. A dispatch that says
"review X and file what you find" supplies the topic and the issue obligation, and never triggers `:87`.
Sub-agents receive their scope entirely through the dispatch prompt; nothing in `agents/coderev.md`
overrides a narrower framing, and nothing tells the agent that the review file is not negotiable by
the dispatcher.

### 3. Does the obligation survive a pass that finds nothing? No — that is where it breaks first.

`:33` is `If you find issues, report them in your review and file each one…`. With no findings the
antecedent is false and the whole sentence is discharged. `:76` still applies in principle, but its
step 5 defines the file's content as *"self-contained finding, evidence, recommendation, scope"* — a
finding-shaped artefact with no finding to put in it. `:87`'s output format is `Totals`, `Findings by
theme`, `Cross-cutting observations`, `Recommended sequencing`: four sections of which three are empty
in the clean case.

So the prompt describes the review file exclusively as a **container for findings**. A pass that finds
nothing has, by the prompt's own description, nothing to write — and yet that is exactly the pass whose
review file is most load-bearing, because the issues that would otherwise stand as the record do not
exist. The record's own framing names this precisely: *"The four issues are the findings; nothing
states they are all the findings."* In the clean case there is not even that.

### 4. What I cannot reconstruct, stated plainly

I cannot determine which of these routes the `260807-2020-orchestrator-session.md` pass actually took. I have the four issues
and git's confirmation that no file was written; I do not have that session's dispatch prompt, and the
pass wrote no history entry to say. So the honest position is: **the prompt admits at least two routes
to a review-less pass, both without violating anything written down, and I cannot say which one
happened.** The diagnosis establishes that the prompt is the plausible cause; it does not establish
that it was the cause in that instance.

### 5. What follows, if the user wants a change

Not proposed as a fix — the decision defers prompt edits, and I do not edit prompts in any case. Stated
so the decision has options:

1. **Make the review file the pass's exit condition rather than a step inside it.** One sentence near
   the top, in the imperative, unconditional, and not derived from whether findings exist: the pass
   ends when the review file exists.
2. **Give the clean case a shape.** The review's value in a no-findings pass is the coverage statement
   — what range, which files, what was read and found clean. That is the section the current output
   format has no slot for. Part 2 of this document opens with one, as a demonstration.
3. **Reconcile `:76` with `## Filename Patterns`.** Two spellings for one artefact kind in one store is
   its own small defect.
4. **Say that the dispatcher cannot waive it.** The prompt currently has nothing to that effect, and
   sub-agent scope arrives entirely by dispatch.

Option 1 is the one that closes both routes; 2 closes the empty case specifically.

---

## Part 2 — The review

### Coverage

Read in full: `bin/fusion-count-sources`, `bin/fusion-plane` (changed regions plus the key-derivation
and map paths end to end), `skills/circle-stash/SKILL.md` Step 1 and 7.6, `skills/cadence/SKILL.md`
diff, `skills/setup/SKILL.md` and `skills/next/SKILL.md` diffs, `agents/orchestrator.md` combined diff
across all seven commits plus surrounding context, `agents/coder.md` / `ontocoder.md` / `analyst.md` /
`planner.md` / `shaper.md` diffs, `rules/fusion-workbench-conventions.md` and
`rules/workbench-stash-and-lock.md` diffs, `.gitignore`, `CLAUDE.md`, and all seven new or changed test
files.

Executed rather than read: `bin/fusion-count-sources` against this repo and against a corrupt-index
fixture; `skills/circle-stash/SKILL.md` Step 7.6 verbatim against four scratch git repositories plus a
pre-fix control; the `git add --dry-run` probe across both ignore configurations and three `git add`
spellings; `npm test` in full and the seven new test files in isolation.

**Found clean and worth recording as clean:**

- **The `circle-stash` 7.6 fix is correct.** The stash directory survives in all four configurations;
  the pre-fix command destroys it. The probe's premise (`git add` refuses an ignored pathspec) is real
  on git 2.49.0, and `git status --porcelain` accepts the same pathspec in every configuration, as the
  skill claims. The documented residual behaves exactly as documented. This is the change where a
  mistake would have cost the user real work, and it does not contain one.
- **The domain cascade in `agents/orchestrator.md` Setup Step 5 is disjoint and complete** as written,
  with a terminating `else`. The reordering argument holds and the `counted_by == "none"` guard is in
  the right position.
- **`bin/fusion-count-sources` counts what it claims** — 93 code, 21 data here, and the
  `git ls-files` choice genuinely removes the prune-list problem the `find` walk had.
- **The `f320db2` marker-stripping claim is true and the file-side fix is complete** — all six
  composition sites route through `natural_key`; a create-then-rename-then-push cycle now yields
  `op=update` against the same `plane_id`.
- **`65f7c3b` actually untracked the six live-state files** (`git ls-files` returns nothing for them;
  `git check-ignore` confirms). The `dir/*` vs `dir/` convention is applied correctly and the patterns
  are root-anchored so stash copies stay tracked, as the commit claims.
- **Setup Step 1's renumbering is clean.** `9bad4d6` inserted a step and adjusted `Skip steps 2-5` →
  `2-6`; no other cross-reference in the tree names a numbered item in that block.
- **The four drift call points do not contradict each other** on which points exist — Phase 2, Step 3e,
  Cleanup and the event table all name the same four. (One prose claim about *reachability* does
  conflict; see F13.)
- **No secrets, keys or `.env` files** in the range.

### Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 6 |
| Low | 5 |
| **Total filed** | **14** |

All fourteen are in `shared/issues/` with `_o_` markers, timestamps `260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md` … `260810-0511_*_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`.

---

### Theme A — Release readiness

**F1 · High · `npm test` is red at HEAD.**
`260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md`

`rules-emission-golden.test.ts:704` fails: `fusion-workbench-conventions.md` grew 39 529 → 41 680
bytes across `65f7c3b` and `e99f0ef`, and the golden was never regenerated. The golden was correct at
`8960e1a`, so the range introduced this. This is the artefact whose entire job is to force the
per-dispatch byte cost of the always-on rule set to be re-approved; both authoring commits stated the
byte cost in their messages and neither carried it here.

**F14 · Low · no version bump across fifteen commits.**
`260810-0508_*_fifteen-commits-landed-with-no-plugin-version-bump.md`

`plugin.json` reads `7.0.0` and `v7.0.0` points at `8960e1a`, the range's own base. Not urgent on its
own; it is the other half of the already-open `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` (Setup calls a helper the installed copy
does not have).

---

### Theme B — Silent failure at a boundary

Three findings, one shape: a failure is converted into a plausible-looking success.

**F2 · High · `fusion-plane` dry runs rewrite the map, and can destroy a mapping.**
`260810-0456_*_fusion-plane-dry-run-rewrites-the-map-and-can-destroy-a-mapping.md`

`cmd_push` calls `map_ensure` at `bin/fusion-plane:1179`, before the dry-run gate at `:1190`.
`map_ensure` → `map_migrate_keys` → `mv "$tmp" "$MAP"`. So `push --plan`, `plan`, and the read-only
`map` command all rewrite `.plane-map.json`, and on a map carrying the legacy duplicates this commit
exists to repair, the migration's collision rule discards a Plane UUID permanently.

**F3 · High · `push --rebuild-map` drops a colliding UUID silently.**
`260810-0457_*_rebuild-map-drops-a-colliding-plane-uuid-silently-unlike-the-migration-beside-it.md`

`JQ_REBUILD_MAP` (`:1112`) assigns without the `has()` guard that `JQ_MIGRATE_MAP` (`:610`) carries,
and without the caller-side report. Winner decided by API result order; every rebuilt entry gets
`last_pushed:""`, so no recency tiebreak exists even in principle. `bin/fusion-plane:99-104` claims
rebuild "normalises the same way" — false at the one place a maintainer would check.

**F5 · Medium · `fusion-count-sources` reports a measured zero over a git failure.**
`260810-0459_*_fusion-count-sources-reports-a-measured-zero-when-git-fails-which-its-own-header-forbids.md`

`listing="$(git ls-files … | sort -u)"` — the pipe masks git's exit status and `2>/dev/null` removes
the trace. Reproduced against a corrupt index: `code_files=0 data_files=0 counted_by=git-ls-files`,
exit 0. The `counted_by=git-ls-files` is the helper asserting it counted, which defeats the
`counted_by == "none"` guard the orchestrator cascade was rebuilt around. The helper's own header
argues at length that a silent zero is worse than no number; this path produces one.

---

### Theme C — The empty-expansion class, established and then re-introduced

**F6 · Medium · the queue retirement writes through unchecked resolver values.**
`260810-0500_*_the-queue-retirement-writes-through-unchecked-resolver-values-and-can-move-the-queue-to-the-workbench-root.md`

The clearest cross-cutting finding in the range. Within one session:

| Commit | What it did |
|---|---|
| `6a69717` | Added an emptiness assertion to `/fusion:cadence`, naming the failure: an empty pair makes `mkdir -p "$WORKBENCH/$OUT_MEMO"` read as `mkdir -p "/"` |
| `fb0a5c6` | Closed six key-naming gaps across three agent prompts |
| `e99f0ef` | Wrote the rule into `rules/fusion-workbench-conventions.md`, loaded by every agent on every dispatch: *"An empty or unset value is never a default … the run halts naming the key."* |
| `ff70d3a` | Added a new consumer without the check |

The new snippet takes `P=$(fusion-paths orchestrator | sed -n 's/^OUT_PLAN=//p')` and writes through
it unguarded. An empty `$P` lands the work queue at the workbench root; an empty `$WORKBENCH` alongside
it aims at `/`. And this consumer **moves** the one artefact the same section argues is not
re-derivable from the records.

**F12 · Low · `/fusion:next` 6.3's activation write exits 1 when no queue exists.**
`260810-0506_*_the-activation-pointer-write-in-next-6-3-exits-non-zero-when-no-queue-exists.md`

`[ -f … ] && echo …` short-circuits to status 1, and the failing command is the one that wrote
`.active-circle`. Same site also bypasses `$TASKLIST` — the class `fb0a5c6` closed four commits
earlier.

---

### Theme D — Prompt-as-code: the new lint cohort

The user asked whether these constrain anything. Measured per file, with the negative-control claims
verified rather than taken from the commit messages.

| Lint | Verdict |
|---|---|
| `circle-stash-git-exclusion` | **Real gate.** Extracts the Step 7.6 bash out of the skill body and *runs* it against four real repositories, and drives the old command to show the defect. The only genuinely executable one. |
| `fusion-count-sources` | **Real gate** — not a lint at all; it runs the binary. Weaknesses are coverage gaps (case-insensitivity and the nested-subtree pathspec are asserted nowhere; ~50 of ~70 extensions untested). |
| `executor-verification-report-lint` | **Real gate**, one overstated fixture claim (F11). |
| `domain-cascade-order-lint` | **Half a gate** (F9). |
| `queue-ground-lint` | **Two-thirds decorative** (F11). |
| `state-drift-detection-lint` | **Weakest** (F8). |

**F8 · Medium · the state-drift lint anchors on the phrase it checks.**
`260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`

Its header states the design rule — *"The anchor is the EMISSION … never the drift check"* — and two of
its four anchors are the drift-check sentence itself. One negative control is a renamed duplicate of
the one above it (both fixtures open with the same line, so the helper throws before reaching the case
under test). Two of four "pre-fix" fixture lines are **invented** and presented as git history; checked
against `git show 9bad4d6^`, which contains no occurrence of "drift check" at all. A prompt reading
*"the drift check is deferred to Cleanup"* passes every assertion.

**F9 · Medium · the domain-cascade lint is defeated by a decoy branch.**
`260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`

`firstIndex` asks whether a branch *mentions* `code_files`, never whether it can fire. An unsatisfiable
`elif code_files < 0` as the second branch, with the entire pre-fix order restored beneath it, passes
both helpers. So do an inverted condition and a dead threshold. Its second helper,
`assertAbsentCountFirst`, has no negative control at all — the test named as one is a second positive
assertion. Its fixture claim, unlike the state-drift one, is **true**.

**F11 · Low · two queue-ground controls re-implement the logic; one executor fixture claim is
overstated.**
`260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`

`queue-ground-lint.test.ts:223-234` asserts that a string it just built lacks a substring —
`assertRidesTheAct` is never called. `:236-256` copies the table-splitting logic inline rather than
invoking the real assertion. `executor-verification-report-lint.test.ts:180` claims its fixture is the
pre-fix text "exactly"; it omits step 2 and prepends a `### Report shape` heading that did not exist —
without which the parser, not the assertion under test, would have thrown.

---

### Theme E — Canonical-source discipline

**F7 · Medium · two skills cite a prompt section they have no route to read.**
`260810-0501_*_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`

`skills/setup/SKILL.md:242` and `skills/next/SKILL.md:104` delegate the whole check to
`agents/orchestrator.md` `### The queue's ground` by bare relative path, and both forbid restating the
branches — removing the inline fallback that made the older bare citations (`setup:227`,
`cleanup:114`) survivable. `skills/cleanup/SKILL.md:11` sets the correct precedent
(`$FUSION_PLUGIN_ROOT/skills/<name>/SKILL.md`). Verified: the installed copy at `$FUSION_PLUGIN_ROOT`
contains **zero** occurrences of `The queue's ground` or `Drift check`, so today the citation resolves
to a file that lacks the section — and unlike the already-filed `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` (exit 127), this one
fails silently.

**F10 · Medium · the tracked-workbench section re-enumerates a closed list and leaves one surface
unclassified.**
`260810-0504_*_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md`

Direct answer to the user's byte-cost question. Of the two new conventions sections:

- **The empty-key paragraph (`e99f0ef`) earns its place.** Every agent holds resolver keys, so every
  agent needs the rule. F6 above is the proof that it is needed.
- **`### Which of them a tracked workbench tracks` (`65f7c3b`) does not.** Its consumers are
  `/fusion:circle-stash`, `/fusion:cleanup` and whoever writes a `.gitignore` — three parties, not
  sixteen agents. `rules/workbench-stash-and-lock.md` already exists, is emitted to `orchestrator`
  alone, and is where it belongs. The file's own header table documents this partition and has applied
  it four times.

It is also a **second enumeration** of a closed list stated ten lines above, in the file whose own
paragraph warns that an incomplete list "invites exactly the reasoning-by-omission it exists to
prevent". The cost is already real: `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` (already open) records two Plane files missing from
the tree; they are missing from the new section too, so that issue now has two sites. And the split is
incomplete — `fusion-workbench/.fusion-setup` is in neither bucket, against
`rules/critical-stance.md` §4.

**F13 · Low · the queue-head parser is written twice inside the canonical file.**
`260810-0511_*_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`

The eight-stage extraction pipeline appears in Phase 4 step 4 and again in `#### Reading a queue`, and
already differs (`2>/dev/null` on one). `queue-ground-lint.test.ts:187-199` enforces "one canonical
implementation" against the two **skills** and cannot see the orchestrator's own duplicate. The rule
was applied outward and not inward.

---

### Theme F — Correctness residuals

**F4 · Medium · the natural key has two derivations that disagree.**
`260810-0458_*_the-natural-key-has-two-derivations-and-they-disagree-on-a-second-marker-shaped-segment.md`

`stable_basename` (sed, file side, `:574`) and `JQ_STABLE_KEY` (jq, map side, `:602`) both strip one
marker, but the jq runs once per invocation over keys the sed already produced. On
`<stamp>_<marker>_<letter>_<rest>.md` they diverge permanently and every push plans `op=create` — the
defect `f320db2` closed, re-entered through the migration. Latent: all 348 filenames in this workbench
were checked and none has the shape. Nothing enforces that. The header's idempotence claim at `:570-572`
is false as stated.

**F15 · Low · `circle-stash` 7.6 still swallows the push exit code.**
`260810-0505_*_circle-stash-step-7-6-still-swallows-the-push-exit-code-the-branch-exists-to-avoid.md`

Both branches end in `|| true`, so the defence against the failure the branch exists to avoid is
entirely the probe's accuracy — and the `STASH_COUNT` check cannot catch that failure mode, because in
it the entry *is* created while the tree is not freed. The probe is faithful today (verified: `git add
-n` and `git add -n --all` agree on an ignored pathspec), but the prose's stated mechanism is wrong:
`git stash push --include-untracked` runs `git add`, not `git add --all`, and `git add -n -u` exits 0.

**F16 · Low · `docs/plane-setup.md:251` documents the old key form.**
`260810-0507_*_plane-setup-doc-still-documents-the-marker-bearing-key-so-map-forget-fails-as-written.md`

**F17 · Low · the Cleanup drift bullet contradicts Phase 2.**
`260810-0509_*_the-cleanup-drift-call-point-claims-a-single-turn-session-reaches-no-other-which-phase-2-contradicts.md`

---

## Cross-cutting observations

**1. The dominant pattern is a rule applied outward but not inward.** Four separate instances, all in
one session:

- `e99f0ef` writes the empty-key rule; `ff70d3a` adds a consumer without it (F6).
- `fb0a5c6` closes key-naming gaps in three agents; `ff70d3a` opens one in `/fusion:next` (F12).
- `ff70d3a` forbids the two skills from restating the queue-head parser, and states it twice in the
  file that calls itself canonical (F13).
- `65f7c3b` writes a section warning against enumerating a closed list twice, as a second enumeration
  of a closed list (F10).

None of these is a careless commit. Each is the same author-agent unable to see the other's work, which
is the structural condition the dispatch flagged. The mitigation is not more prose: it is that the rule
each commit wrote should have arrived with the check that enforces it, in the same commit.

**2. "A convention with a reader, not an enforcement" was said four times, and it is honest — but it
now does two different jobs.** In `1f2faaf` and in the drift section it is a *limit* on the claim, which
is `rules/critical-stance.md` §3 working correctly. In the lint headers it starts doing something else:
it pre-absolves the gate of weaknesses that are not inherent to prompt-linting at all. `state-drift`
and `domain-cascade` are not weak because prompts are unenforceable; they are weak because their
anchors are tautologies and their token matches ignore satisfiability. Those are fixable. The honesty
clause should not be allowed to cover them.

**3. Two of the six lints show the way out.** `circle-stash-git-exclusion` and `fusion-count-sources`
extract the logic out of the prose and **run** it. That is the difference between a change-detector and
a gate, and it is available for the domain cascade too — six lines of decision logic over five integers,
with six measured projects already in the commit message as test cases.

**4. `agents/orchestrator.md` is accumulating canonical sections that are not rules.** Two sections
added tonight (`### The queue's ground`, `### Drift check`) are cited by three other consumers as
canonical implementations, and one is lodged under `## Phase 4: Report` — a closure phase — while being
read at Setup and at the portfolio briefing. The project already has the right mechanism for a
procedure that several consumers must run verbatim: a rule file with a derived audience, which is what
`rules/circle-records.md` is. Worth deciding before a fourth such section lands.

---

## Recommended sequencing

**Before any release or tag**

1. F1 — regenerate the golden and confirm the new totals are the intended cost (blocked on the F10
   decision if the section moves).
2. F2, F3 — the two `bin/fusion-plane` data-loss paths. Both destroy a Plane UUID with no route back,
   and F2 does it from a command documented as changing nothing.
3. F6 — the queue retirement's unchecked write. Cheap, and it moves an irreplaceable file.

**Next Turn, before more prompt-as-code lands**

4. F10 — decide where the tracked-workbench section lives. It gates F1's regeneration.
5. F7 — give the two skill citations a root, or move the section to a rule file. Currently broken
   against the installed copy, silently.
6. F5 — the count helper's silent zero.
7. F8, F9 — the two weak lints. Do these before the next lint is written, so the pattern is not copied
   a seventh time.

**Cleanup**

8. F4 (latent — pair it with whichever plane fix lands first), F11, F12, F13, F15, F16, F17, F14.

**Do not sequence F14 (version bump) ahead of F1.** Release step 0 is "Validate first."

---
**Correction appended 260824** (ontocoder, plan step 5 of `260824-1905_*_plan-close-every-open-defect.md`). The `### Totals` table and the sentence beneath it are left as
written. Tallied from the seventeen finding headings this file carries (`grep -cE '^\*\*F[0-9]+ · '`
returns 17), the counts are High 3, Medium 7, Low 7, seventeen in all, and the sentence should read
seventeen; the stamp range `260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md` to `260810-0511_*_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md` is right and every record in it is real.
The totals stay typed rather than derived: no gate reads a review's count, and a reader who needs the
number recounts the `**F<n> ·` headings. Filed as
`260810-0820_*_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md`.
