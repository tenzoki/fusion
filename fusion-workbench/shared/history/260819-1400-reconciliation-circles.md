# Reconciliation — the Circle stores, pass C of three

**Date:** 2026-08-19 14:53
**Agent:** reconciler, Domain `code`
**Scope:** `fusion-workbench/circles/*/` — every Circle's `issues/`, `planning/`, `decisions/` and the `_S_circle.md` records
**Measured against:** HEAD `e435f03`, tag `v10.3.0`
**Out of scope, untouched:** `shared/issues/` and `shared/decisions/` (two sibling reconcilers ran concurrently on those), all shipped code and text, `archive/`
**Test suite:** not run, by instruction — two other agents were working in this tree

---

## What this pass was for

All eleven Circles are terminal — nine `_c_`, one `_s_`, one `_b_`. Their stores held 66 open
defect records and 4 open-or-answered decisions, filed under units of work that are finished.
That placement is correct under the Origin Rule and it also means a large body of open work sits
where nobody looks. The user is about to make a deep change to fusion and asked for a baseline
that can be relied on.

One question was put to every open record: **does it still reproduce against the tree at HEAD?**

## Result

| | Before | Closed | After |
|---|---|---|---|
| Open defect records (`_o_`) | 66 | 9 | 57 |
| Open plan records (`_o_`/`_p_`) | 0 | — | 0 |
| Open-or-answered decisions (`_o_`/`_a_`) | 4 | 0 | 4 |

Every one of the 57 that stand was re-measured at HEAD and carries a dated annotation naming the
command and its output. No marker was moved on a guess. No Circle's state marker was touched —
all eleven are terminal and terminal is terminal.

### Per Circle

| Circle | Open before | Closed | Open after | Decisions |
|---|---|---|---|---|
| `260815-0007-remove-eight-mechanisms-and-cap-growth` | 30 | 6 | 24 | 2 open |
| `260801-1244-curator` | 19 | 1 | 18 | 1 open |
| `260816-1741-guard-becomes-observation-only` (`_b_`) | 8 | 0 | 8 | — |
| `260813-0858-playmaker-maintains-backlog-store` | 5 | 1 | 4 | — |
| `260801-1244-guard-rules-write` | 3 | 1 | 2 | 1 answered |
| `260807-0923-guard-misst-statt-orakelt` | 1 | 0 | 1 | — |

The dispatch brief gave 69 / 32 / 20 and this pass measured 66 / 30 / 19. The difference is three
records and it is a counting difference, not a discrepancy in the tree — the glob used here is
`_o_`/`_p_` under `issues/` and `planning/` only. Nothing is missing.

### The expected high yield in the two guard Circles did not arrive

The brief predicted it, and the prediction was reasonable: the protected-path half went on
2026-08-12, the churn heatmap on 2026-08-15, the guard's last verdict and the escalation module on
2026-08-16. **Exactly one record closed on those removals** —
`260801-1244-guard-rules-write/issues/260804-2100_*`, whose subject was deleted three times over.
The other three open records in the two guard Circles are not about the guard at all: a resolver
key set derived from prompt text, a `LICENSE` the installer copies and the tree has never had, and
a measurement owed on an unreachable machine. The removals were surgical, and the residue they
left was already recorded and already closed.

---

## The bounded Circle — `260816-1741-guard-becomes-observation-only`

Closed `_b_` on 2026-08-17: the Directive was judged reachable and deliberately not reached, and
what was learned became the Artifact. Eight records are open. All eight still reproduce at HEAD;
none closed.

### Did the Bounded Closure leave live obligations?

**Seven of the eight are live obligations. One is half-abandoned by construction.** The closure
note's phrase for six of them is *"stay open by user decision"*, and a deliberate deferral is not
an abandonment — it is a scheduling choice with no carrier, which is precisely the failure this
Circle's own Bounded-Closure Artifact records as point 2 (*a plan-stated precondition with no
mechanism is not a precondition*).

| Record | Live or abandoned | Why |
|---|---|---|
| `260817-1505` the curator and its skill still say a guard configuration can deny a write | **Live — the obligation the `_b_` is made of** | This is the one unmet clause of the Directive. `agents/curator.md:212` and `skills/curate/SKILL.md:110` are byte-unchanged and neither file has been opened since the closure, across four releases. Every other Directive clause verifies at HEAD. |
| `260816-2320` two of the write trace's four tools reach no integration case | **Live, and the one that most binds a deep change** | `MultiEdit`/`NotebookEdit`/`notebook_path` appear in the test tree once, as matcher entries. The `guard_allow` row is now the released product's only output on the write path, named to users as covering all four tools. `guard-harness.ts` was edited twice since without the four cases being added. |
| `260817-1507` the Turn-budget helper's authoritative header scopes its stderr to dropped keys | **Live** | `bin/fusion-turn-budget:13-15` unchanged. Its two siblings were widened by `01932d6` and kept the widening through a later rewrite; this is the one left behind, and `CLAUDE.md` designates it authoritative. |
| `260817-1508` the archive skill names three retired event types and omits both live ones | **Live, and now a second miss** | `skills/archive/SKILL.md:136` unchanged. `06ab15b` opened the file two days after closure from another direction and stopped short of the same line, as `1fb3f32` had. |
| `260816-2319` the `answer`-site case cannot fail on the violation its describe names | **Live, cheapest of the set** | Unchanged; no commit has touched the file. The remedy is a comment, and the record already contains the `inference:`-marked reasoning it would state. |
| `260817-1509` no test pins the repeat-to-the-user mandate | **Live, preventive, lowest priority** | `turn-budget-lint.test.ts` still returns zero hits for `diagnostic`/`stderr`/`repeat`. The prompt text at HEAD is correct; nothing holds it correct. |
| `260817-1502` a sub-agent left renames staged and the next commit absorbed them | **Live, widest blast radius** | A defect in fusion's own commit protocol, not in a run. Filed twice independently and both filings open. Its remedy is undecided among three options, one of which changes what sub-agents may do — so it wants a decision record before a fix. |
| `260817-1417` one commit in the range is written in German | **Repair abandoned by construction; the convention question is live and unowned** | `9ae7974` is published under three tags and will not be rewritten; all 38 commits since are English. What stays open is whether anything should catch the next one, which is a decision misfiled as a defect — see below. |

### Is anything the Closure note claims now false?

It was written at v10.0.1; v10.0.2, v10.1.0, v10.2.0 and v10.3.0 have shipped since. The record is
terminal and **nothing in it was edited**. Four things a reader should not take at face value:

1. **Two citations no longer resolve, and one of them is load-bearing.** The Grounding snapshot
   names three decisions *"this Circle executes"*. One of them,
   `shared/decisions/260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md`,
   is not in the live store — it was archived on **2026-08-17**, the same day the Circle closed,
   by the `260817-1907-safe-cleanup-scoped` pass, and now sits at
   `archive/260817-1907-safe-cleanup-scoped/shared/decisions/260809-1224_i_…`. It is cited three
   times in the record. The `## Dependencies` lineage citation
   `circles/260801-1244-guard-bash-inspection` was archived in the same pass.
2. **The activation proposal asserts something that stopped being true a day later.** It states
   *"Dependencies: all closed … Each was resolved to an existing directory"* and names the three,
   one of which no longer resolves. That was a measurement taken on 2026-08-16 and correct then;
   a reader treating it as a present-tense claim is misled.
3. **`"npm test` is green at 35 files and 653 tests"` is stale as a present-tense statement.**
   `ls hooks/lib/__tests__/*.test.ts` returns 36 at HEAD;
   `hooks/lib/__tests__/sentence-identifier-containment.test.ts` was added in v10.1.0. The suite
   was not run in this pass, so the pass/fail half is not re-asserted either way.
4. **"Six defects stay open by user decision" undercounts the store, and one stamp is ambiguous.**
   Eight records are open. `260817-1502` is named elsewhere in the note (Artifact point 3), but
   `260817-1417` (German commit) is named nowhere in the closure note — and the `## Turn log`
   writes *"Filed as `260817-1417`, closed in Turn 4"* against the bare stamp, which two records in
   this store carry. A reader resolving that citation lands on the closed twin
   (`260817-1417_c_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md`)
   and concludes the stamp is disposed of.

Everything else in the note verifies: `hooks/guard.ts` is 223 lines and reaches no verdict on any
path (no `permissionDecision`, no `"deny"`, no `hookSpecificOutput`; `allow()` at `:124`, `:132`,
`:145`, `:193`); the loader is down to the single leaf `orchestrator.maxTurns` reading
`fusion.json`; the plan's 18 tasks (1, 2, 3, 4, 5a, 5b, 6, 7a, 7b, 8–16) all carry `[DONE]` and the
plan header reads `**Status:** Complete`; `agents/curator.md:212` and `skills/curate/SKILL.md:110`
are still exactly where and what the note says they are.

**One thing that looks like drift and is not.** The record carries prose in `## Directive` while
its `Active spec/plan:` field cites a file — the combination `rules/circle-records.md` forbade on
2026-08-18. That rule exempts terminal records explicitly (*"A terminal record is history and is
never edited, which removes every closed Circle from any migration set"*). Do not "fix" it.

### Does anything in it bind a deep change to fusion?

Four things, in the order they would bite.

1. **The guard's only remaining product is untested on half its inputs.** `260816-2320`. Any change
   to `extractFilePath` or the `answer` call around it is verified by a suite that exercises `Edit`
   and Bash and nothing else, while four tools are documented as covered.
2. **The one unreached Directive clause is still unreached.** `260817-1505`. If a deep change
   rewrites agent prompts, these two sentences are already known-wrong and already scoped; fixing
   them there costs nothing and closes the `_b_`'s stated shortfall.
3. **The staged-index defect will fire during the change itself.** `260817-1502`. Reconcilers and
   coders stage renames as ordinary work; the orchestrator's next commit absorbs them. This pass
   used plain `mv` throughout for exactly that reason. A long session with many sub-agent dispatches
   is the condition, not the exception.
4. **The growth bounds are the only mechanism pricing additions to shipped text, and a baseline
   raise is undetectable.** `260815-1942`, in the sibling Circle. A deep change that adds prompt or
   rule text meets these bounds; the way out of a red bound is a cut, and nothing distinguishes a
   cut from a raised baseline in a diff.

And one fact about the guard itself, which is not a defect: **it decides nothing and cannot be made
to decide something by configuration.** The PreToolUse hook receives the four write tools and Bash,
allows every one, and writes `guard_allow` on the write path only. `guard`, `decisions` and
`escalation` are retired top-level keys the loader names and drops. A change that wants a gate has
to build one; there is no dormant switch.

---

## Dangling citations from live Circle records — a finding of this pass

Every path citation in all eleven `_S_circle.md` records was resolved against the tree. Eighteen do
not resolve, in three classes:

**Marker drift (11).** A citation written with a literal marker whose target has since transitioned
— `shared/decisions/260807-1515_o_…` now `_i_`, `shared/backlog/260811-0826_o_…` now `_c_`, and nine
more. The correct form is the wildcard `_*_`; `rules/fusion-workbench-conventions.md` `## Marker
globs` explains why the underscore makes it safe. Three open records in the Circle stores already
carry this class (`260814-1419`, `260815-0804`, `260815-1247`) and all three stay open.

**Broken by the archive sweep (6).** The `260817-1907-safe-cleanup-scoped` pass kept a record in the
live store when its stamp appeared in **shipped text** — `bin/`, `rules/`, `agents/`, `skills/`,
`hooks/`, `docs/`, `CLAUDE.md`, `README*.md`, `install.sh`. It never read the workbench's own
records. Six citations from live Circle records were broken as a result, including the bounded
Circle's citation of one of the three decisions it exists to execute. The manifest is candid about
the two passes it took to satisfy the *shipped-text* citation lint; the workbench-to-workbench half
was never in scope.

**Wrong store (1).** `circles/260815-0007-…/_c_circle.md` cites
`shared/issues/260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`.
The record exists, in `shared/decisions/`, at `_s_`.

**Why no gate sees any of this.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans the
shipped text and resolves its citations *against* the workbench. Its own header states the gap in as
many words — *"a second caller needs the same grammar over a corpus this gate does not scan: the
workbench itself, where the citations are densest and where nobody had counted the dangling ones"* —
and `scanRecordCitations` was factored into `helpers/citation-scan.ts` for that caller. Measured:
**the second caller does not exist.** Only the lint imports it.

---

## Misfiled — should be a decision

One record, surfaced rather than moved. A relocation between stores is the user's `mv`: the marker
vocabulary changes with the store (`_o_/_p_/_c_/_d_` → `_o_/_a_/_i_/_d_/_s_`), and this pass does
not perform it.

- `circles/260816-1741-guard-becomes-observation-only/issues/260817-1417_o_one-commit-in-this-circles-range-is-written-in-german-while-the-artifact-language-is-en.md`
  — its own `## What to do` reads *"Nothing to this commit. What is worth deciding is whether
  anything should catch the next one"*, then names two candidate answers and chooses neither. That
  is decide-and-record, not go-fix-it. Under the Origin Rule it would land in that Circle's own
  `decisions/`, since the question arose from that Directive's commit range.

Two further records are defects whose *remedy* needs a decision first, and are correctly filed as
defects because each states a measured malfunction. Named here so nobody works them by picking an
option out of a defect record: `260817-1502` (three remedies, one of which changes what sub-agents
may do) and `260815-1633_o_eight-shipped-surfaces…` (its open question — is a code comment in scope
for a presentational collapse — is unanswered).

---

## Findings that want filing, and could not be filed here

This pass's write scope was `circles/*/` plus this log. `$OUT_ISSUE` resolves to `shared/issues/`,
which a sibling reconciler held. The three below are stated in filable form.

1. **The archive step's citation filter reads shipped text and never the workbench, so archiving
   dangles workbench-to-workbench citations invisibly.** Evidence: the six broken citations above;
   `archive/260817-1907-safe-cleanup-scoped/MANIFEST.md` `## The filter, and the two passes it took
   to get right`; `reference-resolution-lint.test.ts` header, which names the missing second caller;
   `grep -rn scanRecordCitations` returning only the lint. Severity: Medium. Scope:
   `skills/archive/SKILL.md`, `hooks/lib/__tests__/helpers/citation-scan.ts`.
2. **A bare stamp citation is ambiguous when two records share it, and the bounded Circle's Turn log
   resolves to the wrong one.** Evidence: two records at stamp `260817-1417` in one store, one `_c_`
   one `_o_`; `_b_circle.md` `## Turn log` Turn 3 cites the bare stamp. Severity: Low. Scope: the
   citation grammar in `rules/fusion-workbench-conventions.md` and `helpers/citation-scan.ts`.
3. **A session history file left at `**Status:** In progress` after the session ended.**
   `shared/history/260815-2147-orchestrator-session.md:5`. Found while closing
   `circles/260801-1244-curator/issues/260814-2017_*`, whose part 1 was the same class on a
   different file. Severity: Low. Scope: `shared/history/`.

---

## Coherence verdict

Recorded here by instruction; **no `## Coherence` section was appended to any session history
file** — this session's history is closed and committed.

**Verdict:** `review-needed`

**Edges:**

- **Artifact↔Grounding** — 66 open defect claims re-measured against the tree; 9 no longer
  reproduce and were closed with evidence; 57 reproduce and are annotated; 1 of the 57 is
  undecidable from this tree and says so. 4 decisions re-checked, none answered on disk, none
  transitioned. 18 dangling citations found across the eleven Circle records, 6 of them created by
  the archive sweep and seen by no gate.
- **Artifact↔Directive** — the eleven Circles' Directives are all terminal and none is contradicted
  by the tree at HEAD. One Directive clause remains deliberately unreached
  (`260816-1741-guard-becomes-observation-only`, record `260817-1505`), which is what its Bounded
  Closure is for, and four releases have shipped over it since without it being taken. Commits
  `d0f13fa..e435f03` move consistently with the closed Directives; none is orthogonal or contrary.
- **Grounding↔Directive** — 4 active decisions across the Circle stores (`_o_`×3, `_a_`×1). None
  conflicts with any Directive. One is blocking three open defects in its own Circle
  (`circles/260801-1244-curator/decisions/260814-1915_*`, cited by `260814-1850`, `260814-2022` and
  `260814-2017` as their closing condition). One is answered and unrealised, with its operative half
  — the obligation on whoever deletes a Circle to annotate the surviving references — written into
  no rule file, prompt or skill (`circles/260801-1244-guard-rules-write/decisions/260805-1548_a_…`).

**Rebalance recommendation:** `revise Grounding`

The flagged edge that resolves the most is Grounding↔Directive. Three of the four active decisions
are unanswered and one of them gates three defects; the fourth is answered and its answer reaches
nothing on disk. The Artifact↔Grounding drift is large in count and small in kind — 57 records that
reproduce exactly as filed, which is a backlog rather than a divergence.

**One judgement stated as a judgement.** These 57 records are not stale. They were filed accurately,
they still reproduce, and the reason they sit unworked is that they are filed under Circles that are
finished. The problem is placement, not truth. A deep change to fusion would be served by promoting
the ones it touches into whatever unit of work it becomes — the Origin Rule says citation carries
reach, and nothing here needs moving to be cited.

---

## Method

- Every closure names what fixed it in a `Resolved:` line and cites the commit or the deletion.
- Every record left open carries a dated annotation with the command and its output, and says what
  would settle it.
- Renames were performed with plain `mv`, never `git mv`, so nothing entered the git index — the
  defect at `circles/260816-1741-guard-becomes-observation-only/issues/260817-1502_*` is about
  exactly that hazard.
- No record's description, findings or reasoning were edited. Annotations are appended.
- Two read-only sub-agents verified the two largest stores (19 and 30 records) against HEAD; every
  verdict that caused a rename was independently re-measured before the rename.
- Nothing was committed.
