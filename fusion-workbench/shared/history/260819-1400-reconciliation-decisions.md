# Reconciliation — the answered-but-unrealised decision backlog

**Date:** 2026-08-19 14:00
**Agent:** reconciler, domain `code`
**Pass:** A of three. Siblings hold `shared/issues/` and `circles/*/`; neither was written to.
**Scope:** `fusion-workbench/shared/decisions/` — all 21 `_a_` records, plus a sweep of the 28 `_i_`
records for implementations later removed.
**Tree:** HEAD `e435f03`, tagged `v10.3.0`. Every finding below was verified against that tree, not
inherited from an earlier note.

---

## What this pass changed

| | Count |
|---|---|
| `_a_` records read and verified at HEAD | 21 |
| **Realised, and transitioned `_a_` → `_i_` by this pass** | **2** |
| **Overtaken by events — the answer can never be realised** | **2** |
| **Still binding and unrealised** | **17** |
| `_i_` records needing a `Retired:` line and lacking one | 0 |
| Records whose `**Status:**` head field was corrected | 0 — deliberately |

Every one of the 19 records still carrying `_a_` gained a dated reconciliation note stating the
HEAD verdict, the evidence, and the clause that binds a future change. Two records were renamed.
One stale citation inside the store was rewritten to the wildcard form.

**No `**Status:**` head field was touched, on any record.** All 21 carry one, and 7 of them
contradict their own filename marker. That is not drift to be tidied: it is the population
`260818-2212_*_should-the-decision-records-status-field-exist-at-all-…` measured, and that record's
answer is explicit that a record written before the field left the template keeps it, *because
hand-correcting one destroys the evidence the removal was decided on*. The two records this pass
renamed to `_i_` therefore now read `**Status:** open` above an `_i_` filename, and each carries a
sentence saying why.

---

## Bucket 1 — realised, and transitioned by this pass (2)

### `260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md`

**The Circle comes first.** Answered by the user 260812-1620, option 1. Realised in full and never
transitioned — nineteen plugin versions ago.

Both halves are on disk. *The mechanism*: `bin/fusion-paths <name> [<circle-dir>]` takes an existing
Circle as the **Circle in scope**, replacing the active Circle as the `OUT_*` base without reading
or writing `.active-circle` (`3c6ec4e`; `bin/fusion-paths:4-11`, `:58-65`, `:282-318`). The shaper
creates the Circle first and resolves against a named one (`406ec0d`; `agents/shaper.md:15`, `:28`).
The planner takes `**Circle:**` and passes it as the second argument (`agents/planner.md:13`, `:53`).
*The migration*: gated at 260812-2100 and answered **leave it** — the moving set measured at one
file, not fourteen, because each spec's sibling session history witnesses where `OUT_*` resolved when
it was written. Step 12 did not run; step 13 wrote the reason into the file itself (`0978e9a`).

**Why it was missed.** Plan step 13 said "walk both decision records from `_a_` to `_i_`". The
executor read "both" as the two **gate** records under stamp `260812-1720` and moved those. The two
**design** records under stamp `260812-0254` — this one and the backlog record the answer calls "one
design, neither implementable alone" — were not moved. The backlog half was picked up separately by
a reconciler at 260813-1545. This half was not.

**Side effect worth relaying to the sibling holding `shared/issues/`.** The open defect
`260812-1720_*_the-migration-premise-in-the-circle-placement-decision-does-not-match-the-workbench.md`
asks for exactly one thing: *"the decision record's own body should carry the corrected premise once
the gate is answered, so the two do not disagree in the archive."* The `Implemented:` block written
in this pass carries that corrected premise — one moving candidate rather than twelve migrated
Circles, with the measurement and the gate answer. That defect is now substantively addressed and is
that sibling's to close.

### `260818-1512_*_does-the-shapers-third-mode-keep-the-name-portfolio-activation-….md`

**Keep the wire value, widen the prose.** Answered by the user at a gate on 2026-08-18, option 1,
and realised the same day by `95bebe1`.

The value survives at all fourteen sites the record enumerated (`agents/shaper.md:3`, `:15`, `:28`,
`:47`, `:132`; `agents/orchestrator.md:305`, `:309`, `:315`, `:342`, `:1218-1219`;
`README-agents.md:25`, `:64`, `:65`, `:67`). The mode is widened in the same commit: shaper mode 3
now admits an `_a_` **or** a `_t_` record and refuses a terminal one. The accepted residual is
written where a reader meets it — `agents/orchestrator.md:322` states that the heading still says
"anticipated" because the mode's wire name does, and cites this record for the reason. Missed
because no step of that session's plan owned the marker: the plan's subject was the Directive
pointer, and this was a side question it had to settle before it could spell a parameter value.

---

## Bucket 2 — overtaken by events (2). These want a user decision.

**They share one cause, and it is not carelessness.** Both were answered while their subject existed,
and both had that subject deleted at a user gate weeks later. Both were correctly left at `_a_` by
earlier reconcilers rather than renamed, because renaming would pre-empt an open decision.

| Record | Answer | What removed the ground |
|---|---|---|
| `260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md` | keep both manifest fields, no schema change | `5d29b6d` deleted `skills/circle-stash/` and `skills/circle-pop/`; `rules/workbench-stash-and-lock.md` became `rules/commit-lock.md` with its `## Stashes` half removed. All three cross-references dangle. Nothing writes a stash manifest. |
| `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-….md` | pin the four sentences to an approved baseline, sequenced after a prompt task | `f45f76a` deleted `hooks/lib/state-drift.ts`, `hooks/state-drift.ts`, `hooks/lib/__tests__/state-drift-detection-lint.test.ts` and `bin/fusion-state-drift`. There is no drift check, no four sentences and no lint to pin. |

**The decision that owns their marker is still open.**
`260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
was filed on 2026-08-15 and is still `_o_` at HEAD. Its recommendation is option 2 (a new
`Realisation-removed:` annotation, no rename) at low-to-moderate confidence, and its own
`speculation:` paragraph says that if no third instance appears, option 4 — close it and leave the
two records as they are — is the honest choice.

**This pass supplies the measurement that record asked for: there is no third instance.** All 21
`_a_` records were read, and exactly the two above have had their subject removed. Answering
`260815-2056` now is a one-decision act that closes both.

*Do not read `Retired:` as the answer here.* `260814-1332` defined it against a removed
*implementation*, and neither of these was ever implemented — their `Implemented:` lines are empty,
which is what `_a_` says. Citing the removal of something never built is a citation a reader cannot
resolve.

### A separate, adjacent class this pass names for the first time

Two further records can never reach `_i_` either, for a different reason: **their answer was to build
nothing.**

- `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` — option 3, "fusion does not
  support concurrency". Flagged as a user judgement call by the reconciler at 260731-2324-reconciliation.md.
- `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-….md` — option 1, "nothing new;
  the reference lint remains the whole mechanism".

`rules/fusion-workbench-conventions.md` `### Decision files` defines `Implemented:` as a citation of
a commit or a `path:line`, and a decision to build nothing has neither. This is **not** the class
`260815-2056` asks about — there the ground was removed after the answer; here the answer was never a
thing to build — and conflating them would widen an open question while it is still open. Two
defensible outcomes, and they are the user's: promote on the pre-existing surfaces that express the
answer, or accept that a no-op answer never reaches implementation and stop counting these as
backlog.

---

## Bucket 3 — still binding and unrealised (17)

One clause each: what a deep change to fusion would have to respect, or would violate.

**Shipping and release**

1. `260816-0719` — **`hooks/dist` is not asserted to be the compilation of the committed source, and
   nothing can assert it in `npm test` by design.** A deep change to the hooks must rebuild and commit
   `hooks/dist` in the same commit as the source, every time; a green suite is not evidence that it
   did. Three `dist` files were hand-committed in `2552586..HEAD` with nothing checking the pairing.
2. `260816-1707` — **every commit on `main` is installable** (`install.sh:34` defaults to
   `heads/main`), so there is no release boundary protecting an intermediate state. The policy is
   answered and still written down nowhere; `CLAUDE.md:110` describes the default, which is what this
   record refused to accept as a statement of policy.

**Gates and tests**

3. `260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md` — **at most one commit of a multi-file Turn can stand green alone**, because the
   growth golden is a per-file inventory. A deep change is exactly that shape; anyone bisecting it
   meets a failure that means nothing and is documented nowhere. Regenerate once at Turn end, never
   per commit.
4. `260816-0711` — the convention (**probe first, count-pinning as fallback**) is answered and
   appears in no file. The record's own constraint is overdue: a fourth gate must not land before the
   answer is written, or it inherits its shape by copying — and the copy most likely to hand is the
   count pin, which is the fallback rather than the convention.
5. `260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md` — until `bin/fusion-count-sources` emits its own extension set, **every extension
   declaration in it must keep the variable name as the first token on the line.** `export`,
   `declare`, `printf -v`, a leading separator, an indented or `+=` form each leave bash computing one
   value while the test covers a smaller one, silently.
6. `260815-2109` — a Circle may close over an uncovered review range (settled), but the number a
   closure note quotes is still unfiltered: it counts workbench-only commits a reviewer has nothing to
   open in. A deep change producing many tracking commits inflates it exactly as option 3 was answered
   to prevent. `hooks/lib/review-coverage.ts:612` filters by coverage alone.

**Documentation surfaces**

7. `260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md` — **a claim is stated once and cited from every other site.** In force in practice,
   unrealised as a programme, and already cited as settled by later records. A deep change touching
   many surfaces at once is the precise shape this record predicts will leave false explanations
   standing next to correct code.
8. `260811-1522` — every row of the `README-hooks.md` lib table is a hand-written claim no gate reads.
   Redefining what a `hooks/lib/*.ts` module does means editing its row by hand or shipping a
   description of the old behaviour. The row *set* is checked; the row *text* is not.
9. `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md` — `/fusion:help` is still a 131-line router into shipped prose. A change that alters
   the roster, the skill surface, the store layout or the resolver keys leaves the in-session help
   surface wrong until a human rewrites it. **Read the `Answered:` line, not the record**: the
   analysis re-cut the seam and parted company with the record's own motivation.
10. `260816-0740` — **no gate measures a prose property, and none is authorised until a measurement
    runs.** The corpus half landed (`6049d3e` took `rules/user-facing-output.md` from 38 em-dashes to
    6, still 2.1 per 1000 against a ceiling of 1); the falsification pass has not. Adding prose to the
    always-on set weakens the pending measurement.
11. `260807-0158` — the `YYMMDD-HHMM_S_<topic>.md` pattern **stands**, and no minting helper is
    authorised: the collision premise was measured false. What is open is one sentence — cite a record
    by its full filename, never by the timestamp alone — which `## Filename Patterns` still does not
    carry.
12. `260812-0254` (absolute paths) — the capability exists and is unused: `WORKBENCH` is the one
    absolute key the resolver emits. Stored records keep relative paths; this workbench is git-tracked
    and an absolute path in a commit breaks for every clone.

**Structure and process**

13. `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` — **the one record whose transition is blocked by a missing file, not missing work.**
    Part (b) is realised in prose at nine sites, `CLAUDE.md:37` among them. Part (c) is unanswered and
    was never filed as its own record, while four shipped surfaces point at it by this record's name.
    One user action clears it: file part (c), then this moves to `_i_` on part (b) alone.
14. `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md` — the source-root half is settled and load-bearing (`bin/fusion-source-root`; no
    `fusion-plugin-cwd` call survives in `agents/`, `skills/` or `rules/`). The domain-capture half is
    open, and this pass re-measured it: **three copies, not four** (`next`, `direct`, `cleanup`), and
    `cleanup`'s already diverges by a line. Its `tasklist.md` citation dangles — that store went on
    2026-08-15 (`dd312eb`).
15. `260812-0254` (plugin defects) — an agent in a consuming project still has nowhere to file a fusion
    defect. If a deep change's failures show up downstream, that is the channel they would be reported
    through, and it does not exist.
16. `260719-2141` — **nothing may assume two orchestrators can run safely against one workbench.**
    `agentstate.yaml`, `.active-circle` and `orchestrator-events.jsonl` are root-anchored single-writer
    state and the only guard is a warning the user may ignore. (Also a no-op answer; see above.)
17. `260816-0119` — the reference lint is the whole mechanism for stale-marker citations, by decision
    rather than by accident. A rename carries its own grep; removing or narrowing the lint removes the
    only thing standing behind this answer. (Also a no-op answer; see above.)

---

## The single most important constraint on a deep change

**`hooks/dist` is what ships, `heads/main` is what users install, and nothing checks that the two
agree.**

The two records compose into one constraint neither states alone. `260816-0719` establishes that no
gate asserts the committed `hooks/dist` is the compilation of the committed source, and that
`npm test` cannot be that gate — `hooks/scripts/run-tests.mjs` compiles into a staging tree so
concurrent runs do not share build output, so a green suite is silent on the question by design.
`260816-1707` establishes that `heads/main` is the standard install path, which is precisely what
eliminated a release-step check as sufficient: **every intermediate commit is something an end user
can install.**

So a deep change to the hooks has no safe intermediate state. Every commit that touches
`hooks/lib/**` or `hooks/*.ts` must carry its rebuilt `hooks/dist` in the same commit, and the only
thing enforcing that is whoever remembers. This is the one unrealised answer in the store whose
failure mode reaches other people's machines rather than this repository, and it has already
happened once: between `f45f76a` and `71e97f4` the committed `dist` was the compilation of an older
source, and every release path in that window would have shipped a fix that was closed in the
repository and absent from the tarball. It was caught by a reconciliation pass and a review, both
after the fact and both, in the record's own words, *by accident of what they happened to grep*.

Runner-up, and the one that will cost more hours if less blast radius: `260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md`. A deep change
touching many shipped surfaces at once is the exact shape that record predicts will leave
authoritative-sounding false explanations standing beside correct code, and the answer that would
prevent it — one authoring home, citations everywhere else — is in force by habit and by nothing else.

---

## The `_i_` sweep

All 28 records that carried `_i_` before this pass were checked for an implementation later removed, by resolving every path cited
in their `Implemented:` blocks against the tree. Six cite a path that no longer exists, and all six
are correct as they stand:

- `260716-1847_*_offline-verhalten-bei-plane-ausfall.md`, `260716-1847_*_plane-rolle-source-of-truth.md`
  (`bin/fusion-plane`) and `260801-1020_*_may-any-fusion-writer-touch-rules.md` already carry
  `Retired:` lines naming the commit that removed them.
- `260812-1232_*_does-the-escalation-counter-…` and `260812-1232_*_does-the-write-guards-fusion-repo-stand-down-…`
  cite `hooks/lib/escalation.ts`, `hooks/clear-halt.ts` and `hooks/lib/self-detect.js` because **the
  implementation was the deletion**. Nothing to retire.
- `260801-1020_*_provenance-header-on-rule-files.md` mentions `rules/protected-path-discipline.md` in
  narrative only; its operative `Implemented:` line cites `929dbf5`, `c2c2a04`, `de9d5aa`, and
  `rules/rule-file-provenance.md` and `hooks/lib/__tests__/provenance-header-lint.test.ts` are both
  present.

**No `Retired:` line was added, and none is owed.**

---

## Housekeeping

- One stale-marker citation inside the store was rewritten to the wildcard form:
  `260812-0254_*_does-fusion-need-a-backlog-store-…:76` cited the placement record by its `_a_`
  marker.
- **No shipped-surface citation of either renamed record exists**, so neither rename reddens
  `hooks/lib/__tests__/reference-resolution-lint.test.ts`. Verified by grep over `rules/`, `agents/`,
  `skills/`, `docs/`, `bin/`, `hooks/` and the READMEs.
- Three files outside this pass's scope still cite the old `_a_` markers and are left for their
  owners: `260812-1720_*_the-migration-premise-…`,
  `260819-0836_*_the-status-field-closure-…`, and
  `260819-0840-reconciliation.md` (an earlier pass's log, correctly frozen).
- No issue was filed by this pass. Everything found is either an annotation on a record in scope or a
  question the two open decisions named above already own.
- The test suite was not run, per the dispatch. Every finding rests on targeted greps and file reads.

## Coherence

Not written here, and deliberately: this pass was dispatched with the session history closed and
committed, and instructed not to append a `## Coherence` section to any session history file. The
verdict for this store, stated for the record and nowhere else:

**Verdict:** `review-needed`, on the `Grounding↔Directive` edge alone.

- **Artifact↔Grounding** — OK. 2 of 21 answers were realised on disk and untransitioned; both are now
  cited and transitioned. No answer was found contradicted by the tree.
- **Artifact↔Directive** — not assessed. This pass has no session Directive; `agentstate.yaml` is
  absent, which is normal after a clean exit.
- **Grounding↔Directive** — **flagged.** Four records in active Grounding can never reach `_i_` under
  the vocabulary as it stands: two whose subject the Artifact removed
  (`260806-1152`, `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`) and two whose answer was to build nothing (`260719-2141`,
  `260816-0119`). One open decision covers the first pair and has been open four days; nothing covers
  the second pair. A third, `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`, is blocked only on a record nobody has filed.

**Rebalance recommendation:** revise Grounding — answer
`circles/260815-0007-…/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
(the measurement it asked for is in this log: no third instance), decide the no-op class beside it,
and file part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`. Those three acts take the unresolvable `_a_` count from four to
zero and unblock a fifth, leaving a backlog in which every remaining `_a_` is work someone could
actually do.
