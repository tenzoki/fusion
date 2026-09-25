# Coder — Turn 2 task T5: the seven Turn-1 review findings

**Date:** 2026-08-14 10:51
**Status:** Complete
**Circle:** `260801-1244-curator`
**Review:** `260814-1023-coderev-curator-turn-1.md`
**HEAD at start:** `249e606`
**Agent:** coder

## What was implemented

All seven defects filed by `coderev` against Turn 1 were resolved as filed. None was left open.

### The high one — registration (finding 1)

`agents/curator.md` describes three invocation shapes and the orchestrator's allowlist reached
only one of them. The record offered two resolutions: register the agent, or delete the third
shape and record the exclusion against the spec's C7. Registration was taken, because C7 states
the requirement in the words "for a user **or an orchestrator** that wants it mid-session"; the
other option would have needed the spec amended, which is not this task's to do.

Four sites in `agents/orchestrator.md`:

1. `tools:` — `fusion:curator` appended to the `Agent(...)` allowlist.
2. `description:` — appended to the enumeration the model routes on.
3. `## Scope`, the "Invoke sub-agents" line — the same list in a third spelling.
4. `## Agents the Orchestrator Invokes` — a new row, plus a paragraph under the table.

**Where it belongs in the surrounding text, and why.** The curator is *not* in the Agent Routing
Table: that table routes queue tasks to executors by the file a task touches, and a curator run is
not a queue task. It is *not* in the never-invokes list either: that list is for agents whose only
caller is the user, and the third shape in `## Tool Discipline` is written for a dispatching agent,
of which the orchestrator is the only one. It sits in the invocation table with a When column
reading "outside every phase, only when the user asks mid-session", which is the one placement that
matches both facts. The paragraph under the table carries the proxy obligation the third shape
implies: dispatch survey, put the returned gate question to the user, re-dispatch apply with
`**Ledger:**` and `**Approved:**`, never approve on the user's behalf, and dispatch nothing at all
on an empty approval set.

**The record's `inference:` is now measured.** A headless smoke run in a scratch directory, with
permissions *not* skipped, dispatched `Agent(fusion:curator)` from an orchestrator session and got
the sub-agent's reply back. The control dispatch of `fusion:consultant`, deliberately not
allowlisted, failed with "Agent type 'fusion:consultant' not found" and listed 14 available
`fusion:*` agents with `curator` among them. So the allowlist grants the dispatch, and the v2.8.1
fleet-loading failure did not recur.

### The three medium ones

- **Finding 2, the provenance citation.** Setup step 5 now reads
  `$FUSION_PLUGIN_ROOT/rules/rule-file-provenance.md`, per the precedent at
  `agents/investigator.md:17`, and states both why the prefix is load-bearing and the
  installed-copy residual it carries. The milder instance at `## Preserve list` was left as filed:
  the same sentence inlines the five categories, so it degrades gracefully.
- **Finding 3, the survey return contract.** Stated once, above the three bullets, as a property of
  the pass: run file path, per-group counts, candidate count, blast-radius verdict. Bullet 3 now
  cites it instead of re-listing three of the four. The candidate count was added to `## The gate`
  as well, so the top-level path renders the same question `/fusion:curate` does.
- **Finding 4, the gate-rule overlap.** Split on the axis the author meant: a change to an
  *existing* statement is gated, creating a new file is not, and `## Scope` names the three
  creations. Two further sites carried the same unqualified absolute and would have re-opened the
  overlap — `## The two passes and the gate`'s opening sentence and Pass 1's "That is the only file
  this pass creates" — and both were corrected in the same pass.

### The three minor ones

- **Finding 5.** `**Status:**` added to item 1 of the run file's head schema, with its two values.
- **Finding 6.** A fourth bullet in `## Reporting work you may not do` for an approved in-remit
  edit that invalidates a pinned fixture: name the test, name the regeneration command, mark it
  coder work, do not run it.
- **Finding 7.** The 130-character comment line re-wrapped to three lines of 75, 72 and 50.

## Verification

`cd hooks && npm test` — exit 0, 49 files, 1024 tests. Two intervening runs were red and neither
was a real failure: one lost a tinypool worker ("Worker exited unexpectedly", 1019 of 1024 reported)
and one failed the timing-sensitive `fusion-commit-lock` reaped-creator race, which passes in
isolation (10 of 10). Both are load flakes on a machine that was also running the smoke session.

`claude plugin validate .` — passed, with the pre-existing "CLAUDE.md at the plugin root is not
loaded as project context" warning and nothing else.

Smoke dispatch — described above.

`./bin/fusion-paths curator`, `./bin/fusion-paths orchestrator`, `./bin/fusion-rules curator` —
each exit 0 after the prompt edits.

## What this task deliberately did not touch

- **`RULE_BASELINE` and the growth bound.** Plan step 5, and the next task. No edit here changed
  the byte size of any file under `rules/`, so the arming baseline is exactly where step 5 finds it
  and no compensation was made or needed.
- **The golden fixture.** Follows from the line above: the three files changed are two agent
  prompts and one test file, none of them pinned by `rules-emission.golden`.
- **Counts.** The enumerations this task extended are name lists, not digits. The five lint-derived
  digit claims are about the agent tree, which is unchanged at seventeen.
- **`skills/curate/SKILL.md`.** Finding 3's fix direction was agent-side; the skill's Step 3
  already asked for the set the agent now promises.

## One thing found and not fixed

`rules/circle-records.md:14` reads "The other thirteen agents work inside a Circle without ever
transitioning one". Seventeen agents minus the three named in the sentence above it is fourteen,
so the figure is stale, and it went stale when this Circle's Turn 1 added the curator. Turn 1's
count pass could not have caught it: decision
`260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md` surveyed occurrences of
"sixteen" and "seventeen", and this sentence spells a derived number instead. Filed as
`260814-1051_*_the-circle-records-other-thirteen-agents-count-went-stale-when-the-curator-was-added.md`
rather than fixed here, because it is outside the seven this task was dispatched for and because
correcting it edits an emitted rule file, which moves a golden-fixture byte pin next door to the
arming task.

## Files written

- `agents/orchestrator.md`
- `agents/curator.md`
- `hooks/lib/__tests__/rules-emission-golden.test.ts`
- the seven review records, each with a `Resolved:` note and its marker moved from `_o_` to `_c_`
- one new open defect record (above)
- this history file
