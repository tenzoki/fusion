# Step 8 — fold `investigator` into `analyst`

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Plan:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 8
**HEAD at start:** `a17cc8c`
**Verification:** `cd hooks && npm test` — exit 0, 45 files, 827 tests (828 before)

The one fewer test is not a case that was dropped. `fusion-paths.test.ts` generates one
key-set case per consumer from its `AGENTS` list, so removing an agent removes one generated
case. Two hand-written cases were rewritten and one was replaced with a stronger one; that half
nets to zero.

## What the fold carried into `agents/analyst.md`

A ninth analysis type, **Failure Investigation**, and nothing else. The judgement behind that
list is the point of this entry, because copying the investigator's prompt wholesale would have
been the easy version and the wrong one.

**Carried, because the analyst's eight existing types do not reach it.** Every one of those
eight studies something that exists or something proposed: document study, comparative, gap,
risk, feasibility, impact, decision record, architectural snapshot. None of them is
retrospective. Reconstructing what already broke is a genuinely different object of study, and
four things follow from it that the analyst had no words for:

1. **The capture as the object** — a directory of evidence rather than a document set, and the
   refusal to edit it. The analyst's Scope already forbids the edit generically; the refusal is
   restated in the type because the temptation is different in kind. Normalising a log to read
   it more easily destroys the artefact you were asked to read, and a generic read-only rule
   does not feel like it covers tidying.
2. **The evidence inventory taken before anything is read.** This is the step that stops an
   investigation from following the first suggestive log file and never opening the other nine.
3. **The timeline in chronological order, with the derail point marked**, and reading LLM
   transcripts verbatim rather than reasoning about what should have been in the prompt.
4. **Primary cause separated from contributing factors, and cause from symptom** — walking the
   chain to its origin, and listing candidate hypotheses with the evidence for and against each
   when the chain does not resolve to one.

**Deliberately not carried, each for a stated reason:**

- **The project-supplied capture layout and the halt at Setup.** The plan requires the template
  deleted, and with it goes the behaviour that made the agent unrunnable in a project which had
  not copied it. The analyst reads what the user points it at, which is what it already does for
  external documents, and the type says so explicitly: the prompt hardcodes no layout.
- **The 14-step Investigation Process.** The analyst has its own 8-step `## Analysis Process`
  that every type routes through. A second parallel procedure beside it is the duplicate
  `rules/critical-stance.md` §2 warns about; the type's process is 8 steps that hand off to the
  generic one for issue filing and history logging.
- **The separate report template** (`## Symptom / Capture Inventory / Timeline / Evidence /
  Root Cause / Affected Areas / Recommendations / Filed Issues / Cross-References / Open
  Questions`). The analyst's template already carries Question, Scope, Findings, Implications,
  Recommendations, Filed Issues, Sources and Open Questions. Each of the other eight types gets
  **one line** under `## Findings` saying what its findings look like; the ninth got one line on
  the same footing rather than a second whole template.
- **The `## Image analysis (vision)` section.** `## Tools` already says vision is for
  "images, diagrams, screenshots, and visual documents". The one thing it did not say is carried
  into the type's step 5: an annotated screenshot names the symptom in the user's own terms.
- **The Investigation Standards block.** Forensic-not-speculative is the analyst's
  "Evidence-based". Respect-the-existing-record is its "No duplication". Honest-about-uncertainty
  and no-fixes are already there verbatim. Cause-versus-symptom and cross-layer thinking moved
  into the type's steps 6 and 7, where they are procedure rather than exhortation.
- **`$OUT_INVESTIGATION`.** See the key decision below.

**One consequence worth naming, because nobody asked for it explicitly.** The investigator was
user-initiated by design, and `agents/orchestrator.md` carried that twice: a *"Launch
`investigator`"* line in its may-NOT list and an `investigator` row in **Never invokes**. Both
are gone, and the remit now sits in an agent the orchestrator dispatches in Phase 0b and Phase 2.
So a failure investigation became dispatchable. The alternative was a carve-out in the analyst
prompt saying the ninth type is user-initiated only, which is the special case §2 warns against,
and the Circle's own measurement argues against it too: the heavy diagnostics had already gone to
the analyst, dispatchable, one of them typed *"Forensic investigation (4 sim runs)"*.
`agents/orchestrator.md`'s routing table row for `analyst` was widened to say so.

## The investigations resolver arms: both retired

**Measured, not assumed.** The plan's open question said the `OUT_INVESTIGATION` arm goes only
if no prompt names it, and asserted `SCAN_INVESTIGATIONS` stays "either way" because
`/fusion:archive` names it. Step 7 measured that premise false and left the arm standing for this
step to decide
(`260815-1339_*_step-7-named-a-review-coverage-sender-set-that-does-not-exist-and-orphaned-scan-investigations.md`).

The measurement, taken over the whole key table rather than one key, with the resolver's own
derivation grep (`grep -oE '\$(OUT|SCAN)_[A-Z][A-Z_]*'`) across `agents/*.md` and
`skills/*/SKILL.md`, discounting the investigator prompt:

| Key | Shipped prompts naming it |
|---|---|
| `OUT_INVESTIGATION` | 0 |
| `SCAN_INVESTIGATIONS` | 0 |
| every one of the other 21 keys | at least 1 (`SCAN_DECISIONS` 17, `OUT_HISTORY` 15, `OUT_ANALYSIS` 1) |

Those two are the **only** keys at zero. Orphaning is not a normal state in this resolver, so
"it costs nothing to keep" is not a description of how the table is maintained — it is an
exception argued for two keys.

**Decision: both arms removed**, from `value_for()` and from `ORDER`, together. Three grounds:

1. `rules/workbench-path-resolution.md` already states the criterion: *"A key set is not a fact;
   it is a restatement of the prompt."* A key no prompt names restates nothing. Applying that
   rule is not a new policy, it is the rule.
2. **Removal is loud, not silent.** I checked the resolver rather than trusting the comment above
   the emission loop, which describes an unknown key "simply vanishing". It does not: the
   ORDER-membership check that follows exits 4 naming the prompt, the key, and both places to add
   it back. So a future investigating agent fails at its first Setup with an actionable message
   rather than writing to the workbench root. Pinned by `fusion-paths.test.ts` *"exits 4 naming
   the prompt, the key and the fix"*.
3. Splitting the pair would be worse than either choice. `SCAN_INVESTIGATIONS` is defined in the
   key table as *"read counterpart of `OUT_INVESTIGATION`"*; keeping one without the other leaves
   a dangling half whose own row cites a row that no longer exists.

**What the store's survival does and does not argue.** `shared/investigations/` stays,
`/fusion:setup` still creates it, `/fusion:archive` still keeps it out of tier scope by safety
filter 4, and consuming projects still hold reports there. That was the reasoning that kept
`SCAN_INVESTIGATIONS` standing for a week after its last reader left, and it confuses "the
directory holds files" with "a consumer writes or reads them". The store is a place; a key is a
statement that some prompt goes there. Only the second one became false.

The retirement is written up as the worked case in `rules/workbench-path-resolution.md`
`### The three unconditionally-shared kinds` — the section that had said four — so the next
person retiring a key has a procedure rather than this entry.

**Test change, and it is stronger than what it replaced.** The old case asserted a single agent
got `OUT_INVESTIGATION` and not `SCAN_INVESTIGATIONS`. The new one, *"emits no investigation key
to anyone"*, iterates every agent and every skill and asserts neither key is emitted to any of
them. Re-adding an arm without a prompt to name it now fails.

## The decision record: `_o_` → `_s_`, not `_c_`

`260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`
was renamed with `git mv` and carries a `Superseded by:` footer. `_c_` was not used and
`shared/issues/` was not touched — both were the errors
`260815-0029_*_the-circle-record-cites-the-investigator-case-folder-record-as-an-issue-…`
was filed about, and that record is now `_c_` with a `Resolved:` footer.

The footer is longer than the one that defect record drafted, for the reason the same record
identifies as why it filed rather than fixing in passing: the superseded decision had
**withdrawn** the removal recommendation, on the user's own testimony that he had used the
investigator several times, and reasoned that the earlier measurement had counted orchestrator
dispatches while the agent is user-initiated. Superseding it with a bare pointer would leave it
reading as if its evidence had been overruled without being answered. So the footer states how
the disagreement was settled: the Circle re-took the measurement on the user-initiated population
the first one missed, and the two agree once it is included — four dispatches, all on two days,
none in the eight weeks since, and the capture input surface deleted in July. The runs the user
remembers are real. They stopped.

The Circle record's Dependencies bullet was **not** edited. That is the second plan-local open
question, and it is answered the way that defect record's own last paragraph leans: a Circle
record states what was known at activation, the plan now carries the corrected instruction, and
the closed defect record is the citation for anyone who reads the bullet later.

## Judgements the step's file list did not pre-authorise

The plan's scope rule allows these: the change makes a statement false, and no gate can see it.

1. **`.claude-plugin/plugin.json`'s description** named the investigator as "parameterised by a
   project-supplied capture-layout rule". Not in step 8's file list, not path-shaped, not a digit
   claim. Left standing it would have shipped a manifest advertising an agent the package does not
   contain. Removed. The version was **not** bumped; step 15 owns that.
2. **`rules/critical-stance.md`** and **`CLAUDE.md`**'s critical-stance bullet both listed
   `investigator` among the agents whose prompts "already carried" honesty lines. Arguably
   historical, and the historical block in `rules-emission-golden.test.ts:304` keeps its
   `conceptrev` mention for exactly that reason. The difference is tense and audience: that block
   is a dated event log, while these two read as present claims about prompts that exist, and the
   rule file is loaded by every agent on every dispatch. Both corrected.
3. **`rules/agent-setup.md`** listed `investigator` among the pattern-matched rule kinds
   `bin/fusion-rules` emits. It emits no such pattern any more. Always-on rule, no gate. Corrected.
4. **`rules/design-diagrams.md`** named `investigator` in its own audience line. The
   conditional-emission lint checks `README-agents.md` against the script, not this file, so the
   line was unguarded and false. Corrected.
5. **`README-agents.md`'s "Two side loops" section** lost the investigator bullet, and its
   *"never invokes `investigator`"* sentence was re-pointed at `consultant`, which is the other
   user-initiated agent and the one the sentence is still true of.
6. **`agents/bugfixer.md`** deferred to `investigator` as the owner of the don't-touch-a-capture
   refusal. Re-pointed at the analyst's new type, so the refusal keeps an owner.

**One judgement deliberately not taken.** `CLAUDE.md:50`'s `templates/` row now names two
phantom files: `plane.config.yaml` (step 2) and `investigator-capture-layout.md` (this step).
`templates/` holds exactly one file. The plan assigns that row to gate G1 *knowing* it was
already stale, because it spells the filename bare and no lint can resolve it, and it names
`260815-0803_*_two-claude-md-inventory-rows-went-stale-…` as the reason. Overriding a call
the plan made with the facts in hand is not the same as making one it never considered, so the
row was left and the defect record updated with the current count instead. The row's gate-forced
sibling — the *"Where to look when something breaks"* row that spelled
`templates/investigator-capture-layout.md` as a path — left in this commit, as the plan requires.

## What the twice-corrected step still missed

Eight files carried a reference the step's file list did not name. None was optional.

- **`.claude-plugin/plugin.json`** — the description, judgement 1 above.
- **`hooks/lib/__tests__/path-literal-lint.test.ts`** — *not* an edit, and worth recording as a
  near miss. Its `TYPE_FOLDERS` contains `investigations`, and it caught a draft of the new
  analyst section that wrote `shared/investigations/` as a literal in an agent prompt. The gate
  did its job; the sentence was rewritten to name the store without a path.
- **`skills/help/SKILL.md`** was in the list, but the plan named it for one mention and it
  carried three: the entry-point routing line, the `./rules/` example, and a whole
  *"Investigator capture layout"* configuration bullet telling users to copy a template that no
  longer ships.
- **`agents/orchestrator.md`** was in the list; the plan did not say the analyst's routing-table
  row would have to widen, which is where the dispatchability consequence above became visible.
- **`bin/monitor`, `hooks/lib/staging-drift.ts`, `hooks/lib/__tests__/helpers/citation-scan.ts`,
  `skills/{log-activity,migrate,setup}/SKILL.md`** each match `investigat` and each was checked
  and **left alone**: every one of them names the *store*, which stays, or uses the English word.
  Recorded so the next reader does not re-open them.
- **The five agent-count digit claims** are in the plan and all five moved: `CLAUDE.md` 16 → 15
  (`N specialized agents`), 16 → 15 (`The N agent prompts`), 15 → 14 (`the other N inherit`);
  `README.md:3` 16 → 15; `README-agents.md` 16 → 15 (`of the N prompts`). The last one now sits
  in the always-on-core bullet rather than at the old line number.

## Byte effect on the always-on core

Core role 86 838 → 86 979, **+141 bytes** per dispatch for all fifteen agents.
`rules/fusion-workbench-conventions.md` 52 292 → 52 460 (+168) is the whole of the increase;
`agent-setup.md` −14, `critical-stance.md` −17 and `user-facing-output.md` +4 net to −27.

The +168 was **+750 in the first draft** and was cut back after reading the regenerated golden.
Two paragraphs had been added: one saying the investigations store is write-frozen, one explaining
the row that had just left the Filename Patterns table. The second was deleted outright. Its
model was step 7's `conceptrev` clause on `<sender>`, and the analogy fails: a reviewer still
*meets* `conceptrev` files while scanning `$SCAN_REVIEWS`, so that clause is operative, whereas
no agent scans the investigation store any more — the key is gone — so no agent will ever meet
those filenames. That paragraph was archaeology charged to every dispatch. The first was cut to
one sentence appended to the paragraph that already lists the shared-only kinds.

`rules/design-diagrams.md` 4 850 → 4 834 (−16), conditional, charged to four producers now
instead of five. The golden was regenerated by the documented one command and `RULE_BASELINE` was
not re-cut, so the shrink is recorded as growth these roles are credited with rather than
absolved of.

## Files changed

Deleted with `git rm`: `agents/investigator.md`, `templates/investigator-capture-layout.md`.

Renamed with `git mv`:
`260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`
→ `…/260812-0254_s_…`;
`260815-0029_*_the-circle-record-cites-the-investigator-case-folder-record-as-an-issue-and-asks-for-a-transition-that-vocabulary-has-no.md`
→ `…/260815-0029_c_…`.

Edited: `agents/analyst.md`, `agents/bugfixer.md`, `agents/consultant.md`,
`agents/orchestrator.md`; `bin/fusion-rules`, `bin/fusion-paths`;
`rules/agent-setup.md`, `rules/critical-stance.md`, `rules/design-diagrams.md`,
`rules/fusion-workbench-conventions.md`, `rules/user-facing-output.md`,
`rules/workbench-path-resolution.md`; `skills/archive/SKILL.md`, `skills/help/SKILL.md`;
`hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/__tests__/context-manifest.test.ts`,
`hooks/lib/__tests__/fixtures/rules-emission.golden` (regenerated, `RULE_BASELINE` untouched);
`README.md`, `README-agents.md`, `docs/philosophy.md`, `CLAUDE.md`,
`.claude-plugin/plugin.json`.

Workbench records: the plan (step 8 `[DONE]`, the `OUT_INVESTIGATION` open question answered and
ticked), `260815-1339_*_…` (appended, stays open for its other two fix directions),
`260815-0803_*_two-claude-md-inventory-rows-went-stale-…` (appended).
