# Coder session — tasks 4, 5 and 6: one source-root helper, the guard log's archive case, the editor's deliverable language

**Agent:** coder
**Started:** 2026-08-11 18:26
**Status:** Complete
**Git HEAD at start:** `36984d7`
**Verification:** `cd hooks && npm test` — exit 0, 1293 passed (baseline at HEAD was 1284; +9 from two new test files)

---

## What the dispatch was

Three queue entries from `tasklist.md`, each realising a decision the user answered on 260811-0752.
Disjoint file sets, three independent fixes. Each defect record and the decision it cites were read
before any edit, because in all three cases the record repeats a bound the decision carries.

## Task 4 — `bin/fusion-source-root`, and four skill bodies onto it

Realises `shared/decisions/260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper…`,
option 1. Closes `shared/issues/260811-1733`, and with it `260810-2030` and `260811-0109`.

**The helper.** `bin/fusion-source-root` prints one line: `$PWD` when `bin/fusion-plugin-cwd` says
cwd is the plugin's own repository, `$FUSION_PLUGIN_ROOT` otherwise. Exit 2 printing nothing when
neither is available, which is the `UNRESOLVED` case the decision's constraints required to
survive; exit 1 on a usage error. All four behaviours were exercised by hand before anything
called it. It resolves `fusion-plugin-cwd` as its own sibling rather than through
`$FUSION_PLUGIN_ROOT` — the precedent is `bin/fusion-churn-rank` resolving its own entry point —
so an install copy and a work tree each ask their own criterion; called the documented way the two
are the same directory. The no-upward-walk bound is inherited, not re-decided: the script adds no
walk of its own. `.gitignore` gained `!bin/fusion-source-root`, per the WARNING in that file, and
`git status --porcelain bin/` confirms it is untracked rather than ignored.

**One documented divergence.** The inline snippet tested `-z FUSION_PLUGIN_ROOT` *first*, so an
unset variable produced the empty root even inside the plugin's repository. The script answers the
plugin-cwd branch first, because that answer needs no install to be true. The difference is
unreachable from the call sites — their guard is `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ]`,
which an unset variable already fails — and it is written into the script's header rather than left
to be discovered.

**Six guarded calls across four skill bodies.** `setup` and `next` carry two each (the announcing
block, plus the inline re-resolution a later fresh shell needs); `cleanup` and `help` carry one
each, newly added, with their citations of shipped files moved from `$FUSION_PLUGIN_ROOT` to
`$FUSION_SRC`. One shape at all six sites, in the vocabulary the churn-ranking and drift-check
calls already use: `[ -x ]`, an `elif` falling back to the install copy and naming the absence on
stderr, an `else` yielding the empty root. Three branches, disjoint and complete, every branch
ending in an assignment so no `set -e` shell can trip on a trailing false test.

**The split this makes explicit, and did not exist before.** *Read shipped text* → `$FUSION_SRC`;
*run or copy an installed artefact* → `$FUSION_PLUGIN_ROOT`. So `cleanup`'s four `bin/`
invocations and `help`'s `fusion-paths` and `templates/` reference all stay on the install root.
That is not a judgement call taken here: part (c) of `260810-1544` — whether the work-tree
preference reaches helper resolution — is explicitly unanswered, and the task's own bound says it
must not be assumed. The split is stated at all four sites and in the helper's header.

**The acceptance's arithmetic does not close, and the choice is recorded.** `260811-1733` asks for
"four guarded calls" *and* for the two skills still citing the install copy to be corrected; those
cannot both hold literally. `tasklist.md` task 4 is the more explicit statement — "the call-site
count is **four, not two**", enumerating setup, next, cleanup and help — so "four" was read as four
skill *bodies*. The alternative reading (four inline copies, leave cleanup and help) would have
left `260811-0109`'s named behavioural defect standing: `cleanup:125` sending a reader to the
*installed* orchestrator prompt for the domain cascade, in a session editing the work tree.

**Siblings, from the standing grep.** Three surfaces enumerated the work-tree preference's
consumers and had to move with it: `bin/fusion-plugin-cwd`'s own `Consumers:` header,
`hooks/session-start.ts`'s no-upward-walk comment, and `CLAUDE.md` twice — a Layout row for the new
helper, and the Release-process paragraph, which now says the preference covers three helpers and
that the third roots *documents*, never helper resolution. `grep -rn 'fusion-plugin-cwd' agents/
skills/ rules/` is empty: no fifth copy of the criterion survives.

**Untouched, per the bound:** the domain-capture snippet (task 41).

## Task 5 — the guard event log gets its archive case

Realises `shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound…`, option 1.
Closes `shared/issues/260811-1731`.

`skills/archive/SKILL.md`: safety filter 1 narrows to "`.guard-state/` **apart from
`events.jsonl`**"; a new `### Rolling the guard event log` subsection carries the classification,
the no-ceiling bound and its reason; Tier 1 gained the row, so all three tiers roll it and
`/fusion:cleanup`'s autonomous tier-1 run does too; Step 5 lists it in the proposal, Step 7
performs the roll, the manifest gained a `## Guard event log` section, and the guardrails gained an
explicit prohibition on truncating without archiving or adding a ceiling anywhere.

**Why it is the one target rolled rather than selected.** It carries no state marker and no age —
its lines have dates, the file does not — so no tier survey produces it as a candidate. It is
included whenever the live log is non-empty and skipped silently when absent or empty, because an
archived empty log is noise.

**The roll is `mv` then `: > "$EV"`, never copy-then-truncate.** The move is what guarantees no line
exists in two places. `emitEvent` opens, appends and closes per call rather than holding a
descriptor, so nothing keeps writing into the moved inode; an event emitted between the two
commands lands in the archived log, where it is still readable. Destination
`<archive>/<stamp>-<slug>/.guard-state/events-<stamp>.jsonl` — original path preserved relative to
`$WORKBENCH`, dated name as the answer asks, stamp taken from the archive folder rather than a
second `date` reading.

`rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`: the log
moves to the records side, `.guard-state/` on the live-state side is narrowed, and two paragraphs
say why the directory is the wrong unit to classify (a past `churn.json` answers nothing; a past
log answers when the guard stopped somebody).

**One reading that extends the decision rather than quoting it, and is flagged as such.** The
records side says "track them", and this repository's `.gitignore` ignores `.guard-state/*`
wholesale. Rather than start tracking a 7.8 MB append-only file, the conventions file states that
what preserves this record is the archive roll: the rolled copies land under `archive/`, which is
tracked here, so the evidence reaches git without the live log producing a diff on every tool call.
`.gitignore` carries the matching note beside its own line, so the two do not read as a
contradiction. The decision settled the *classification*; this is the consequence drawn from it,
and a reader who disagrees should see the reasoning rather than a silent divergence.

**No ceiling was added.** `hooks/lib/events.ts` gained a doc comment on `emitEvent` forbidding one
outright, naming the 0.6 % of lines every ceiling discards first, pointing at the roll as what
bounds the file instead, and recording that a roll moving the file between calls is safe by
construction.

**`bin/monitor` needed no change, and three new cases pin why** rather than leaving that as an
assertion in prose: a byte-empty log (what a roll leaves), an absent log (the window between the
`mv` and the re-create) and a log holding only post-roll events all render correctly — empty panel,
empty panel, and the new events only. `_read_warnings` treats absent and empty identically, so no
ordering of the two roll commands can break the dashboard.

**Not folded in, per the answer:** dropping `guard_allow`.

## Task 6 — the editor's deliverable language

Realises `shared/decisions/260807-2131_*_which-language-governs-a-customer-deliverable.md`,
option 3. Closes `shared/issues/260811-1732`.

`agents/editor.md` gained `## Deliverable language — named in the dispatch, or you halt`: the
language comes from the dispatching task and from nothing else, and without one the agent halts
before producing anything, reporting a fixed message naming what to pass. It forbids inferring the
language from the source document, the project's declarations, the customer's name or the
conversation's own language, and it covers translations (an untargeted translation request is a
halt, not a guess at the direction). Setup step 3 no longer reads a declaration for this purpose,
Production step 2 reads the dispatch, and Tool Discipline now says the language is the one decision
never handed back as a recommendation, because it has no default to recommend. Frontmatter
untouched.

**The prompt now names neither declaration token anywhere**, and that is what makes the absence of
a fallback *checkable*: a project-wide default can only be reintroduced by the prompt naming one of
them. `hooks/lib/__tests__/deliverable-language-lint.test.ts` (6 cases) asserts that, plus the
section's presence and uniqueness, its naming of the dispatch, its halt wording, its no-fallback
statement, and its citation of the authoring home rather than a competing definition — and over the
conventions file, that the split reads four-way and carries the case with both persisted branches
named. Written in `executor-verification-report-lint.test.ts`'s shape, with the same honest
preamble: it checks the contract is present in the prompt, not that any dispatched run obeyed it.

**Keeping the split disjoint and complete.** The record asked where a deliverable sits relative to
the persisted-file case it would otherwise fall into. The answer taken was to cut that case in two
on *who the file is for*: "persists as a file for the project's own use" → artifact language;
"persists as a file for a reader outside the project" → the dispatch's language. Every persisted
file is in exactly one branch, and nothing else moved. Three paragraphs follow: why the deliverable
is carved out, why the source is the dispatch rather than a third `CLAUDE.md` line, and that a
single-declaration project is unchanged in the other three cases and **not** exempt from this one.

**One consequence the record did not name and the split would otherwise leak.** The writing profile
resolves from the language of the surface it governs. So a deliverable's prose takes the profile of
the language the dispatch named, not the artifact language — `default-voice-de.yaml` for a German
deliverable in an `en`-artifact project. Added to the profile paragraph as an application of the
new case, not an exception to it.

**Siblings, from the standing grep.** The orchestrator dispatches `editor` and would now meet a
halt on every such task: its routing table row carries the dispatch obligation and says to ask the
user rather than choose, and the Phase-2 dispatch table repeats the parameter. `CLAUDE.md`'s
dispatch-parameter bullet is now four agents, with `editor` named as the one parameter with **no
default**. `README-agents.md`'s `editor` row says the same.

## Verification

`cd hooks && npm test` — **exit 0, 1293 passed, 50 files.** Baseline at HEAD `36984d7` was 1284;
the 9 new cases are 3 in `monitor-warnings-panel.test.ts` and 6 in the new
`deliverable-language-lint.test.ts`.

One gate had to be regenerated deliberately. `rules-emission-golden.test.ts` pins the byte size of
every always-on rule file, and `fusion-workbench-conventions.md` grew 41 680 → 46 119 bytes across
tasks 5 and 6. Regenerated with `UPDATE_RULES_GOLDEN=1` per that file's own procedure, the fixture
diff read (one file, one number, in both the per-agent blocks and the totals — nothing else moved),
then re-run without the flag. The growth budget did not fire, so no cleanup is due by that
instrument's own reckoning. It is still 4 439 bytes paid by all sixteen agents on every dispatch,
and that is worth knowing when task 11 (reduce the surface) is taken up.

## Bookkeeping

- Issues `_o_` → `_c_`, each with a `Resolved:` note: `260811-1733`, `260811-1731`, `260811-1732`,
  plus the two `260811-1733` subsumes — `260810-2030` and `260811-0109`.
- Decisions `_a_` → `_i_` with `Implemented:` notes: `260811-1534`, `260807-2131`. Both realise the
  whole of what they answered; the halves each explicitly declined (dropping `guard_allow`; a
  project-wide default) are not unfinished work.
- Decision `260810-2145` **stays `_a_`**, with an `Implemented:` note recording option 1's landing
  and why the marker did not move: its second half — a home for the domain capture — is held in
  reserve by that very answer and still carried by `260810-2110` and task 41. `_i_` is terminal, so
  moving it would close a record whose second half nobody has decided. That is the reasoning
  `260810-1544` was written out of, applied to itself; the note says to split the record when the
  domain-capture call is taken up.
- Tasklist: tasks 4, 5 and 6 ticked with their outcomes. Four decision citations in that file moved
  to the wildcard marker form so the ticks do not immediately go stale, and two live records citing
  a marker this session moved (`260810-2110`, and the new note in `260810-2145`) were corrected the
  same way. History files, reviews and closed records were left alone — they record what was true
  when they were written.
