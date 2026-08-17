# Code review — Turn 3: the sixteen agent rows and the dispatch-parameter roster

**Date:** 2026-08-13
**Sender:** coderev
**Reviewed-range:** `22f892e..8d87192`
**Not-opened:** none
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Files as dispatched:** `README-agents.md`, `CLAUDE.md`, `docs/philosophy.md`

## Summary

The row-by-row reading happened and the sample proves it: nine rows re-verified independently
against their prompts and their `bin/fusion-paths` key sets, and every corrected claim in the
sample holds. The two judgements the dispatch named are both sound — the manifest's bare count
of three survives the membership correction, and filing the orchestrator prompt's fifth carrier
rather than editing it was right. Six new findings, none in the row corrections themselves:
one in the new `## Dispatch parameters` table's completeness claim, three in its `Passed by`
column and its shaper cells, one in the orchestrator row's root-anchored enumeration, and one
in the step's own evidence records, whose "twelve corrected, four standing" contradicts the
diff (fifteen and one) and the history record's own per-row table.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

## The spot-check: nine rows re-read independently

Method: for each sampled row, open the agent prompt at its Scope and output sections, run
`bin/fusion-paths <name>`, and compare both against the row as it now stands. No claim below
is carried from the executor's table.

**Rows the executor reports as corrected — all seven hold.**

| Row | Re-verified against | Verdict |
|---|---|---|
| `orchestrator` | `agents/orchestrator.md:230-250` (Scope), `:111`, `:842`, `:983-984`; `fusion-paths orchestrator` | Holds. Reads "Anything except `.secret`" is `:230` verbatim. The issue write is `:111` (exit-4 fusion bug) and `:479` (out-of-scope reverts); the decision write is `:983-984`; the retired queue into `planning/` is `:842`, and `OUT_PLAN` is emitted. One gap, filed Low — see below. |
| `playmaker` | `agents/playmaker.md:40-72`; `fusion-paths playmaker` | Holds in all three columns. The merge-under-confirmation wording matches `:72`, the frozen-store exclusion matches `:63`, and `OUT_BACKLOG`, `OUT_CIRCLE`, `PORTFOLIO`, `OUT_HISTORY` are all emitted. |
| `analyst` | `agents/analyst.md:29-34`, the report `**Type:**` list at `:214`; `fusion-paths analyst` | Holds. Eight analysis types in the row, eight in the prompt's Type line. Four write targets, four `OUT_*` keys. |
| `ontocoder` | `agents/ontocoder.md` `## Scope`; `fusion-paths ontocoder` | Holds. Eight extensions in the row, the same eight in the prompt, in the same order. |
| `taskplanner` | `agents/taskplanner.md:55-66`, `:87-90`; `fusion-paths taskplanner` | Holds. Four queue sources, and the `_a_`-decision clause matches "A decision in state `_a_` … MAY yield an implementation task". |
| `coderev` / `ontorev` / `conceptrev` | `agents/coderev.md:3`, `:69`; `agents/ontorev.md:62`; `agents/conceptrev.md:32`; the resolver for all three | Holds, and this is the largest of the ten defects. All three prompts refuse a session history in their own words, and `fusion-paths` emits no `OUT_HISTORY` for any of them. The group note under the table states exactly that. |
| `consultant` | `agents/consultant.md:36-52`; `fusion-paths consultant` | Holds. `OUT_DECISION` is emitted and `:52` carries the conditional history clause ("Add history entries automatically — only when explicitly asked"). |

**Rows the executor reports as standing unchanged — one exists, and it holds.**

The dispatch asked for at least two. Only one row is byte-identical between `22f892e` and
`8d87192`:

| Row | Re-verified against | Verdict |
|---|---|---|
| `bugfixer` | `agents/bugfixer.md:20-38`, `:146`; `fusion-paths bugfixer` | Holds unchanged. "Any file type" matches `:20`, the ontology human gate is in the prose paragraph under the table rather than the row, and the three emitted keys are `OUT_HISTORY`, `OUT_ISSUE`, `SCAN_ISSUES`. |

The other three rows the completion note names as standing — `shaper`, `planner`, `editor` —
all changed, substantively. That is finding 6.

**Two group notes, both checked mechanically.**

- "Ten of the sixteen prompts state that exclusion" — `grep -c '\.secret' agents/*.md` returns
  a hit in exactly ten files, and they are the ten the note names. The six it says are silent
  are silent.
- "The three reviewers write no session history … `bin/fusion-paths` values them no
  `OUT_HISTORY` key" — verified above, both halves.

## The two judgements

**1. `.claude-plugin/plugin.json:3`, read and deliberately left alone — the judgement holds.**

The manifest says "16 project-agnostic specialized agents (3 parameterised by domain —
code/data/strategic/knowledge; investigator parameterised by a project-supplied capture-layout
rule)". It names no member, and the behaviour-changing `**Domain:**` parameter is read by
`taskplanner` (`:19`, `:34-36`), `reconciler` (`:28-30`, `:45-47`) and `playmaker` (`:25-27`,
`:36-38`) — three, both before and after the membership correction. Editing it would have
changed 3 to 3, and would have forced a version bump on a file whose content did not change,
against a release process that keeps four version surfaces coherent.

The one residual: `shaper` also accepts a `**Domain:**` line (`:57`, `:80`), so a reader who
counts "accepts the line" rather than "changes behaviour on it" gets four. That reading is
available from the manifest alone, because the manifest names no members — and it is closed
by the README section, which distinguishes the two in its own words. The residual is bounded
by the same property that makes the sentence survive: a bare count cannot mislead about
membership.

**2. `agents/orchestrator.md:153`, filed rather than edited — filing was right.**

The claim is real: `:153` names `planner` among the agents receiving the domain parameter and
omits `playmaker`, and the same prompt contradicts it at `:200` ("pass it as the `executors`
selection cue to `planner`") and at `:850` (which passes `**Domain:**` to playmaker). The
filed issue, `issues/260813-2045_o_…`, cites both sides accurately and states the one-line fix.

Three reasons the filing is right rather than cautious. The step's file scope was three
documentation files, and an agent prompt is the plugin's executable surface — an edit there
during a documentation pass is unreviewed behaviour change. The fix is not purely mechanical:
`:153` and `:200` disagree with each other, so correcting one without reading the Setup-Step-5
cascade around it risks fixing the wrong half. And the open design question — whether the
planner *should* take a domain parameter — is already filed as a decision record, so the
prompt edit has a dependency the documentation edits did not.

The cost is that the Circle's Directive is not satisfied while `:153` stands, since the
orchestrator prompt is a shipped surface carrying a claim the prompts contradict. That is
visible in the Circle's own issue store rather than lost, which is what filing is for.

## Findings

### 1. The roster omits the two lines the `/fusion:next` relay carries — High

`README-agents.md:54` declares the table "the roster's single authoring home" and lists eleven
parameters. `agents/playmaker.md:207-215` declares `**Confirmed operations:**` and
`**Proposal source:**`, read off the dispatch prompt in exactly the form the preamble defines,
and `skills/next/SKILL.md:170-176` passes both. `**Proposal source:**` is load-bearing: the
run compares its stamp against the portfolio header and, on a mismatch, performs nothing and
writes nothing (`agents/playmaker.md:217`).

The agent count of six is unaffected — playmaker is already in it. What is falsified is the
parameter count and the completeness claim, on the newest surface in the repository, about the
mechanism that authorises the four destructive backlog operations. The section already shows
how a non-parameter is excluded (the bugfixer's freeform pre-authorisation, `:76`); these two
carry the `**<Keyword>:**` form that exclusion turns on.

Filed: `issues/260813-2052_o_the-dispatch-parameter-roster-omits-the-two-lines-the-playmaker-relay-carries.md`

### 2. The `Passed by` column was read against the agent prompts only — Medium

Four cells name fewer passers than ship. `skills/cleanup/SKILL.md:147` passes `**Domain:**` to
the reconciler; `skills/seed-from-plane/SKILL.md:87-93` passes `**Mode:**`, `**Draft:**` and
`**Domain:**` to the shaper. Neither skill appears in the section.

The cause is structural rather than careless: the `Declared at` column cites `agents/*.md`, the
step's history record lists sixteen prompts and the resolver as what each row was read
against, and no skill body is in that list. `Passed by` is the one column whose ground truth
lives outside the agent prompts, and it was populated from them anyway — the passers it names
are the ones a prompt happens to mention.

Filed: `issues/260813-2052_o_the-passed-by-column-was-read-against-the-agent-prompts-only-so-two-skills-that-pass-parameters-are-missing.md`

### 3. The planner's `**Circle:**` row names a passer that does not exist — Medium

The cell says "orchestrator or user". `grep -rn '\*\*Circle:\*\*' agents/*.md skills/*/SKILL.md`
returns `agents/planner.md:13`, `:53`, `:55` and two unrelated hits in
`skills/circle-stash/SKILL.md`. The orchestrator's only planner dispatch, `:377`, passes
`**Executors:**` and nothing else. Everything else in the row is `agents/planner.md:53-55`
verbatim, including the exit-1 halt.

This is the same class of defect the step corrected elsewhere in the same commit — a surface
describing a mechanism the prompts do not have — one column over.

Filed: `issues/260813-2052_o_the-planner-circle-row-names-the-orchestrator-as-a-passer-and-nothing-in-the-orchestrator-prompt-passes-it.md`

### 4. The shaper's `**Mode:**` row reads an absent line as user-direct — Low

`agents/shaper.md:43` and `:45` are the two modes that carry no `**Mode:**` line: user-direct
and in-Circle clarification. The prompt at `:47` says absence "defaults to the existing
mode-detection heuristic" and stops there; the table adds "i.e. user-direct", which collapses
the heuristic into one of its two outcomes — and the same table's `**Parent task:**` row states
the other one.

Filed: `issues/260813-2052_o_the-shaper-mode-row-reads-an-absent-mode-line-as-user-direct-while-a-second-mode-carries-no-mode-line.md`

### 5. The orchestrator's Writes cell calls four files the root-anchored set — Low

The cell says "the four root-anchored session files". The orchestrator also refreshes
`.session-marker` every Turn (`:637`) and clears it at Phase 4 (`:916`), and takes and releases
`.commit-lock/` at every commit (`:398`, `:520`). Its own Setup at `:112` enumerates six
root-anchored surfaces, and `rules/fusion-workbench-conventions.md` lists the same six.

Stated as a judgement rather than a certainty: both writes go through a `bin/` helper, and
`.commit-lock/` is a lock directory rather than a session file, so a reading exists on which
the cell is defensible. `.session-marker` is harder to place outside a set the definite article
closes. This enumeration is what the step's "ten write targets" count rests on.

Filed: `issues/260813-2052_o_the-orchestrator-writes-cell-calls-four-files-the-root-anchored-set-while-the-prompt-writes-two-more.md`

### 6. The step's own evidence says twelve corrected where fifteen changed — Medium

The plan file's completion note and `history/260813-2043-coder-…:15` both say "twelve
corrected, four left standing after a reading", and the note names the four as `shaper`,
`planner`, `bugfixer`, `editor`. Row-by-row diff of `22f892e` against `8d87192`: fifteen rows
changed, `bugfixer` alone is byte-identical. Three of the four named rows are in the changed
set, with substantive changes — `shaper` gained `**Active spec/plan:**` and the conditional
promotion clause, `planner` gained the defect store in Reads, `editor` gained the produce-only
bound. The history record's own per-row table agrees with the diff and not with its summary.

Twelve and four are the *input* split from `_t_circle.md:89-90` (twelve rows unread, four
survey-confirmed), reused as the *output* split. The two do not coincide.

It matters because reading each row was the acceptance condition and these records are the
evidence. An auditor reads "four stand as they were" as four rows verified and found correct,
and three of the four names are rows the pass rewrote. The same sentence is in the commit
message, which is immutable; the two workbench records are not.

Filed: `issues/260813-2052_o_the-step-6-completion-note-says-twelve-rows-corrected-and-names-three-that-changed.md`

## Cross-cutting observations

**The new table's three defects all sit in what it could not read from an agent prompt.** The
eleven rows' `Parameter line`, `Accepted values`, `If absent` and `Declared at` columns are
accurate everywhere I checked — I verified all eleven `Declared at` citations by line number
and every one lands on the section it claims. The `Passed by` column, which lives in skill
bodies and orchestrator phase steps, has three defects across four cells, and the roster's
completeness claim is falsified by a skill body too. The step read the sixteen agent prompts
exhaustively and the seventeen skill bodies not at all, and every finding in this table follows
that line. A pass over `skills/*/SKILL.md` for dispatch blocks would close findings 1 to 3
together.

**The correction pass itself is clean.** Nine rows re-read, no residual defect in any of them.
The four claims I could check mechanically rather than by reading — the `.secret` count, the
three reviewers' missing `OUT_HISTORY`, the eight ontocoder extensions, the eight analyst types
— all hold exactly. The two derived surfaces corrected in the same commit (`CLAUDE.md:14` and
its dispatch bullet, `docs/philosophy.md:19`) are accurate against the three domain-parameterised
prompts, and `CLAUDE.md`'s new bullet correctly separates shaper's pass-through from the three
behaviour-changing readers.

**The evidence record is the one surface nobody read back.** Finding 6 is not about the plugin
at all — it is the step's own account of itself, and it is the only artifact in this Turn whose
summary contradicts its own table. The Circle exists because documentation surfaces drift from
what ships; the same drift reached the record written to prove it had not.

## Recommended sequencing

1. **Finding 1** before this Circle closes. The roster is the surface `CLAUDE.md` now points at
   instead of restating, so an incomplete roster is the drift this Circle was convened to remove,
   in the file that replaced four copies of it.
2. **Findings 2 and 3** with it — one pass over the `Passed by` column against the skill bodies
   closes both, and the same pass finds finding 1's two rows.
3. **Finding 6** before the Turn's reconciliation, so the Coherence verdict is computed against
   a record that matches the diff.
4. **Findings 4 and 5** as cleanup, any time before release.

None is a release blocker: nothing here changes agent behaviour, and no shipped mechanism is
broken.

---

**Reconciled 260813-2258.** Six findings filed, three closed and three still open. The three closures were re-checked at HEAD `c0e4219`: `README-agents.md:61-62` carry the two playmaker relay rows with `/fusion:next` Step 5b as the passer, `:59` and `:65-68` carry the two skill passers the agent-prompt-only reading had missed, and `:64` no longer names the orchestrator as a passer of `**Circle:**`. The three open findings were re-verified as still present, and the third of them — the step-6 completion note — was confirmed independently: fifteen of the sixteen agent rows differ between `22f892e` and `8d87192`, `bugfixer` alone is byte-identical.
