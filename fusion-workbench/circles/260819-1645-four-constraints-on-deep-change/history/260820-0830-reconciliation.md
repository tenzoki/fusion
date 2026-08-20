# Reconciliation — Circle 260819-1645-four-constraints-on-deep-change

**Date:** 2026-08-20
**Agent:** reconciler
**Domain:** code
**HEAD:** `04db0b0` (working tree clean; nothing uncommitted before this pass)
**Range reconciled:** `b91c01c..04db0b0`, eleven commits
**Scope:** this Circle's stores, plus the four records elsewhere the range transitioned. The rest of
the workbench was deliberately not swept — three passes did that on 2026-08-19 and their logs are in
`shared/history/`.

## What this pass did

| | Reviewed | Updated |
|---|---|---|
| Plans | 1 | 1 — one inline marker corrected, `## Reconciliation Log` appended |
| Issues | 18 in this Circle, 2 elsewhere | 12 annotated; 3 new filed; no marker moved |
| Decisions | 2 in this Circle, 2 elsewhere | 1 annotated; no marker moved |
| Reviews | 1 | 1 annotated |
| Circle record | 1 | not modified — see below |

**No marker was moved by this pass.** Every transition the range made was verified as correct, and
nothing was found that had landed without its marker following.

## 1. The transitions this range made

Measured from `git log --diff-filter=R`, plus the files born closed. The dispatch's counts differ
slightly from what the tree holds, so both are given.

**Four decisions `_a_` → `_i_`**, all with resolving `Implemented:` citations, all verified on disk:

- `shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
  → `hooks/lib/__tests__/committed-dist.test.ts` exists, 3 cases, green in 3.7 s. The footer's
  correction to the plan's premise (the lockfile is gitignored, the committed literal carries the
  pin) is accurate and is the sharper reading of the two.
- `circles/260801-1244-guard-rules-write/decisions/260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`
  → `rules/circle-records.md:67` carries the section; the cited line number is exact.
- `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
  → `hooks/lib/__tests__/workbench-citation-lint.test.ts`, corpus written as a marker predicate,
  no baseline and no count of any kind. Option 1 as answered.
- `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
  → `GATE_KINDS` at `hooks/lib/__tests__/helpers/citation-scan.ts:443-449` carries five kinds
  including `stamp-name`. The consequence the record predicted between the two answers — the sibling
  lint's pins moving — is visible in that file's re-approval notes.

**Ten defects closed.** Five renamed `_o_` → `_c_` (`260819-2213`, `260819-2321`, `260820-0530` in
this Circle; `260816-2320` in the observation-only Circle; `260819-0001` in `shared/`), and five born
`_c_` in `04db0b0` because the orchestrator filed and fixed them in one commit. All ten carry a
`Resolved:` footer and all ten fixes are on disk.

**One plan closed**, `260819-2016_*_four-constraints-on-deep-change.md`, `**Status:** Complete`, nine
steps `[DONE]` and step 10 struck.

**Two counts in the dispatch do not match the tree**, which matters only because both are used as
the size of what to check: the range transitioned **four** decisions, not two, and closed **ten**
defects, not seven. This Circle's issue store holds **ten** open records before this pass, not
eleven — eight filed by the review and two filed during the work.

## 2. The eleven — actually ten — open defects

Every one of them reproduces at HEAD. Each carries its evidence in its own file under a
`Reconciliation 260820-0830` block; the table is the index.

| Record | Reproduces? | Checked by |
|---|---|---|
| `260819-2250` a cross-reference names a record never filed | yes | the repaired line at `:7` and the untouched copy at `shared/analyses/260813-0831-…:234` |
| `260819-2300` `circleDirs()` has no archive prefix | yes | `citation-scan.ts:286-294` against `anchoredUnder` at `:367` |
| `260820-0805` artifact case has no toolchain guard | yes | three `it()` cases at `:177`, `:209`, `:217`; compile in `beforeAll` at `:100` |
| `260820-0805` corpus excludes only `archive/` | yes, latent | `markdownFilesUnder:752-761` walks everything; neither frozen tree exists here today |
| `260820-0805` "re-approved four times" | yes | 14 such notes in the sibling file |
| `260820-0805` `GATE_KINDS` restated as a literal | yes | five and five, in agreement today, held by nothing |
| `260820-0805` gitignored lockfile | yes | `git ls-files hooks/package-lock.json` returns nothing |
| `260820-0805` `node:` grep does not reproduce | yes | 18 hits across 11 files, and the review's 17/10 does not reproduce either |
| `260820-0805` always-on budget reported without the figure | yes | both bound tests green; the set measures 99 720 bytes |
| `260820-0805` neither gate named on a shipped surface | yes | grep over `README*.md`, `CLAUDE.md`, `docs/` returns nothing |

**The one the dispatch singled out.** `260819-2250` names a target in
`shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md:234` that no
repair corpus covers, and the reading is confirmed twice over: the citation gate's corpus has no
`analyses/` clause, and the token there is spelled with a `fusion-workbench/` prefix that no scanner
reads as a record citation. It is unreachable by mechanism and closable only by somebody who knows
what was meant.

## 3. The five delivery claims, checked against the tree rather than the account

| Claim | Verdict | Evidence at HEAD |
|---|---|---|
| gate on the compiled artifact | **delivered**, demonstration historical | `hooks/package.json:17` pins `5.9.3`; the test is green. Re-verified independently: `git archive HEAD` into a temp tree, compile with the pinned `tsc` (exit 0), 36 files byte-identical; perturbing one byte of the temp `dist/guard.js` makes the comparison differ |
| four write tools reach the hook | **delivered** | describe at `guard-bash-integration.test.ts:113`, cases at `:165` and `:182`, each asserting `tool` and `file`; `notebook_path` branch live at `hooks/guard.ts:104`; 16 cases green |
| whole-tree git prohibition at dispatch | **delivered as text, no enforcement claimed** | `agents/orchestrator.md:522` (324 bytes) and `:546` (bugfixer clause); 395 bytes total against the 600 allowed, which is what the commit message claims and what the diff measures |
| citation gate and its corpus | **delivered** | 195 corpus files, **0 violations**; predicate written out; 8 cases green |
| deletion annotation form | **delivered, and not applied to its own subject** | `rules/circle-records.md:67`, `:97`, `:103` — and the record it realises still spells the deleted Circle as a bare token |

**On the demonstrations, which the dispatch asked to be separated from the tree as it stands.** No
commit in `b91c01c..04db0b0` touched `hooks/dist`; the last that did is `06ab15b`, before the range
opened. So the recorded demonstration of the dist gate — revert `hooks/dist` one commit, watch the
artifact case redden naming `staging-drift.d.ts` and `.js` — is not re-runnable at HEAD in that form,
because there is nothing one commit back to revert to. The demonstration is history. The mechanism
was re-established here from scratch instead, and it holds.

**The citation gate's demonstration, by contrast, re-ran itself during this pass.** Three new defect
records written by this reconciler entered the corpus the moment they were saved, and the gate went
red on four citations in them — three verbatim quotations of the dangling tokens under discussion,
one verbatim quotation of a dead `agentstate.yaml` field. All four were fenced, per the
statement-versus-pointer convention at `rules/fusion-workbench-conventions.md:355`; nothing was
exempted and no file was allowlisted. That is the second live catch the gate has made since arming,
and the first on a party that was not the orchestrator.

## 4. The Circle record

Checked against the template in `rules/circle-records.md`.

- **Head fields** — `**Domain:**`, `**Filed by:**`, `**Active spec/plan:**`, `**Active session
  history:**` all present. The spec/plan field spells the marker position `_*_`, which is the repair
  that closed finding 10, and both cited paths resolve.
- **`## Directive`** — still the pointer literal, exactly as
  `rules/circle-records.md` `### The Directive is a pointer once a spec exists` requires: ``See
  `**Active spec/plan:**` above.`` and nothing more. It is correct, not stale.
- **`## Turn log`** — present and empty. **Not filed as drift.** Phase 4 has not run, and the Turn
  log is written at the Turn boundary, which is where Phase 4 begins. The same holds for the session
  history file's `## Turns` section and its `**Status:** In progress`.
- **`## Closure note`** — absent, correctly: the template fills it at the terminal transition.
- One stale field worth naming and not worth filing: the session history's Setup snapshot cites the
  corpus decision with an exact `_o_` marker, and the record is now `_i_`. It is a snapshot of what
  was true at session start, it sits in a history file outside every corpus, and correcting it would
  falsify the snapshot.

## 5. New defects filed by this pass

All three in this Circle's store, per the Origin Rule — each arose from this Circle's Directive.

1. `260820-0906_*_the-deletion-annotation-form-was-not-applied-to-the-surviving-reference-of-the-circle-it-uses-as-its-worked-example.md`
   — the rule written at plan step 4 uses Circle `260802-2220` as its worked example, and the
   decision record that motivated the rule still names that Circle as a bare token. Two sibling
   tokens on the same record name files in **another repository**, which the record states in prose
   and the parser cannot see; had the record stayed `_a_`, the gate would have reddened on two
   citations that are correct as written. The record left the corpus in the same commit that armed
   the work.
2. `260820-0906_*_the-citation-gates-corpus-has-no-planning-clause-so-an-open-plan-is-a-live-surface-outside-the-gate.md`
   — the opposite direction of the constant that finding 4 is about. Measured: 0 open plans exist
   today, so the class is empty and nothing dangles; 24 closed plans carry 170 violations between
   them.
3. `260820-0906_*_the-three-per-task-surfaces-disagree-with-each-other-and-one-field-re-dangled-at-the-plan-transition.md`
   — `agentstate.yaml`'s `current_task.source_file` names the plan's pre-transition marker and
   resolves to nothing; the event log carries **zero** `task_start` and `task_done` events for a
   session with fourteen executor tasks; and the dashboard counter (11), the dashboard list (14) and
   the queue (9) give three counts of one quantity.

## 6. Misfiled — should be a decision

None. Every open record in this Circle's store resolves to "go fix it" rather than "decide and
record". Two carry a decision inside them and say so in their own text — the corpus question in
`260820-0906` #2 and the external-reference question in #1 — and both name it as the user's to
answer rather than proposing an answer.

## 7. Gates run

Single files only, per the dispatch. `committed-dist` (3), `workbench-citation-lint` (8, twice — red
in between, on this pass's own records), `guard-bash-integration` (16), `reference-resolution-lint`
(35), `rules-emission-golden` (15), `surface-growth-bound` (12). All green at the end of the pass.
The full suite was not run.

`bin/fusion-review-coverage` over `b91c01c..HEAD`: `commits=11`, `reviews=1`, `uncovered=1`,
`verdict=uncovered`. The uncovered commit is `04db0b0`, which touches `fusion-workbench/` only.
