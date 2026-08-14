# Code review — Turn 1 of Circle `260801-1244-curator`: the curator agent, its skill, and the fleet registration

**Date:** 2026-08-14 10:23
**Sender:** coderev
**Circle:** `260801-1244-curator`
**Reviewed-range:** `d7786eb..5b81f5a`
**Not-opened:** `fusion-workbench/circles/260801-1244-curator/_t_circle.md`, `fusion-workbench/circles/260801-1244-curator/_a_circle.md`, `fusion-workbench/circles/260801-1244-curator/decisions/260814-0738_a_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`, `fusion-workbench/circles/260801-1244-curator/history/260814-0738-shaper-curator.md`, `fusion-workbench/circles/260801-1244-curator/history/260814-0845-planner-curator.md`, `fusion-workbench/circles/260801-1244-curator/reviews/260814-0857-conceptrev-plan-curator.md`, `fusion-workbench/circles/260801-1244-curator/issues/260814-0813_o_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`, `fusion-workbench/circles/260801-1244-curator/issues/260814-0828_o_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`, `fusion-workbench/circles/260801-1244-curator/issues/260814-0920_o_the-turn-log-drift-row-reports-drift-for-the-whole-duration-of-every-turn.md`, `fusion-workbench/circles/260801-1244-curator/planning/260814-0738_o_spec-curator.md`, `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/portfolio.md`, `fusion-workbench/shared/history/260813-2345-orchestrator-session.md`, `fusion-workbench/shared/history/260813-2346-playmaker-direct-dispatch.md`, `fusion-workbench/shared/history/260814-0823-playmaker-direct-dispatch.md`, `fusion-workbench/shared/issues/260814-1001_o_the-skills-array-in-fusion-paths-test-is-hand-written-and-omits-two-skills.md`, `fusion-workbench/shared/issues/260814-1001_o_three-skill-bodies-embed-german-while-skill-bodies-are-an-english-surface.md`

**On that list:** every shipped source and documentation file in the range was opened, in full or as its complete diff. The unopened set is workbench records only. `_a_circle.md` is the deleted half of the activation rename; the growth-bound decision was context-only per the dispatch; the three Circle issues and the two shared issues were read as titles, since the dispatch named them as already filed; the spec was searched rather than read end to end.

---

## Summary

Plan steps 1 to 4 landed as written, and the three mechanical claims this review was asked to check
independently all hold: the five lint-derived count claims equal the tree at seventeen, the figure is
removed rather than refreshed in the unasserted occurrences, the cut log's historical measurements
are untouched, and the golden fixture moved in exactly the three ways the coder reported. The suite
is green — 49 files, 1024 tests, exit 0 — and `claude plugin validate .` passes with the one
pre-existing warning.

Seven defects, all in shipped text rather than in behaviour, and one of them blocks a spec acceptance
criterion: the curator is not in the orchestrator's dispatch allowlist, so the third invocation shape
its own prompt describes has no possible caller.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 3 |

All seven are filed under `circles/260801-1244-curator/issues/` with the stamp `260814-1023`.

## What was verified, and how

- **The suite.** `cd hooks && npm test` — exit 0, 49 files, 1024 tests passed.
- **The plugin manifest.** `claude plugin validate .` — passed with the pre-existing "CLAUDE.md at the plugin root is not loaded as project context" warning. The new frontmatter parses; the curator declares `name` and `description` only, which is the documented-safe set.
- **The three registrations that resolve at run time.** `./bin/fusion-rules curator` emits the five always-on files plus both voice profiles and nothing else. `./bin/fusion-paths curator` exits 0 and values all ten keys the prompt names. `./bin/fusion-paths curate` and `./bin/fusion-paths cleanup` exit 0, and cleanup now emits `SCAN_HISTORY` and `SCAN_DECISIONS` as plan step 4 required.
- **The golden fixture's three movements**, checked against the files rather than against the report: `rules/fusion-workbench-conventions.md` 51 920 → 52 027 (+107) and `rules/workbench-stash-and-lock.md` 12 957 → 12 952 (−5) measured with `git show d7786eb:<path> | wc -c` against `wc -c`, plus one new `[curator]` block. No other line of the fixture moved.
- **The count decision.** `grep -rEi '(sixteen|seventeen|\b16\b|\b17\b)'` over `agents/`, `rules/`, `skills/`, `hooks/lib/__tests__/`, `bin/`, `docs/`, `README*.md`, `CLAUDE.md` and the manifest. The five asserted claims read seventeen. The five surviving "sixteen"s in `rules-emission-golden.test.ts` are at lines 247, 299, 308, 316 and 334, all inside the dated cut-log entries, which is what the decision's constraints require. The one in `CLAUDE.md:65` is inside the 2026-08-12 removal measurement and is the same class.
- **The cleanup staleness snippet**, executed against this workbench with the resolver's real values: it returns an empty `$LAST_RUN` (no curator run has happened yet), and byte totals for the three surfaces. The empty-`$LAST_RUN` branch is the one the skill body calls out in bold, and it is reached.

## Findings by theme

### Registration and reachability

**1. The curator is not in the orchestrator's dispatch allowlist, so two of its three invocation shapes cannot be reached. (High)**
`agents/orchestrator.md:4` names thirteen sub-agents and not `fusion:curator`, while `agents/curator.md` `## Tool Discipline` describes a "dispatched by another agent" shape in full and `README-agents.md` `## Dispatch parameters` names "an agent that proxied the gate question" as a passer. The spec's C7 criterion (`planning/260814-0738_o_spec-curator.md:245`) requires dispatchability "for a user **or an orchestrator** that wants it mid-session". Plan step 2's file list does not name `agents/orchestrator.md`, so the omission entered at planning time and the implementation followed the plan.
A second consequence is `inference:` and worth settling before release: the `fusion` launcher starts the session as the orchestrator agent, and `/fusion:curate` is the first agent-dispatching skill in the tree whose target is not in that allowlist (verified by grep: `/fusion:cleanup` → reconciler, `/fusion:direct` and `/fusion:seed-from-plane` → shaper, `/fusion:next` → playmaker, all allowlisted). Whether a skill's own `allowed-tools` grant overrides the agent allowlist is exactly what `CLAUDE.md`'s release step 0 says to test end to end rather than infer.
Issue: `260814-1023_o_the-curator-is-not-in-the-orchestrators-dispatch-allowlist-…`

**2. Setup step 5 cites the provenance rule by a path that resolves only in this repo. (Medium)**
`agents/curator.md` Setup step 5 says "Read `rules/rule-file-provenance.md`". In a consuming project that is the project's own `./rules/`, where the file does not exist; the plugin's copy is at `$FUSION_PLUGIN_ROOT/rules/`. Two rule files now assert that this citation is the mechanism by which the one agent that needs the file gets it (`rules/fusion-workbench-conventions.md` `## Rule-file provenance`, `rules/rule-file-provenance.md`). The reference-resolution lint resolves the token against this repo's tree, so it passes while the runtime read fails. Precedent for the fix is in the tree at `agents/investigator.md:17`.
Issue: `260814-1023_o_the-curators-setup-cites-the-provenance-rule-…`

### Two-file agreement between the agent and its skill

**3. The survey pass's return contract is written only for the agent-dispatched shape. (Medium)**
`skills/curate/SKILL.md` Step 3 requires the run file's path, the per-group counts, the candidate count and the blast-radius verdict back from the survey dispatch. `agents/curator.md` `## Tool Discipline` obliges exactly that in bullet 3 ("dispatched by another agent") and says nothing of it in bullet 2, the one that governs the skill path. The section's own opening claims the three shapes differ in one thing only, which this contradicts, and the candidate count is asked for on the skill's side alone.
Issue: `260814-1023_o_the-surveys-return-contract-is-written-only-for-the-agent-dispatched-shape-…`

Everything else in that pairing checks out. The three dispatch parameters agree in name, order, values and absent-behaviour across `agents/curator.md` `## Dispatch parameters`, `skills/curate/SKILL.md` Step 6 and the three new `README-agents.md` rows. The two apply-mode refusals the skill attributes to the agent ("a ledger path that does not resolve is a halt, and an id the ledger does not carry is a halt naming that id") are both present in the agent prompt. The `$OUT_HISTORY` guard in Step 3 works because both consumers resolve the key off the same active Circle. The preserve-list categories the prompt inlines match `skills/revise-claude-md/SKILL.md` `## Pass guard — what to PRESERVE` exactly.

### Precision inside the new prompt

**4. The gate rule and the ungated-write list overlap on the decision store. (Medium)**
Surface 1 is "everything under `$SCAN_DECISIONS`" and the gate rule is absolute; `## Scope` then permits an ungated open record at `$OUT_DECISION`, which resolves inside `$SCAN_DECISIONS`. The intended split — create ungated, edit gated — is never written. `rules/critical-stance.md` §4 calls an overlapping case split a defect of the same kind as a wrong result, and this is the one place the agent's single safety property is stated and then contradicted.
Issue: `260814-1023_o_the-gate-rule-and-the-ungated-write-list-overlap-on-the-decision-store.md`

**5. The run file's head schema omits the status line the same section requires be updated. (Low)**
Issue: `260814-1023_o_the-run-files-head-schema-omits-the-status-line-…`

### Consequences of running the curator in this repository

**6. An applied rule-file edit here leaves the golden fixture stale, and nothing names the owner of the regeneration. (Low)**
The spec deliberately puts the plugin's shipped `rules/` inside the curator's remit when it runs here, which is where C11's validation run happens. Those files' byte sizes are pinned by the golden fixture, and regenerating it is `hooks/` work exclusion 6 forbids. `## Reporting work you may not do` covers a derivation needing code and a change to a file outside the remit; a fixture that goes stale as a side effect of an in-remit edit is neither.
Issue: `260814-1023_o_an-approved-rule-file-edit-in-this-repo-leaves-the-golden-fixture-stale-…`

**7. One comment line left unwrapped at 130 characters. (Low)**
`hooks/lib/__tests__/rules-emission-golden.test.ts:173`, from the count removal joining two wrapped lines.
Issue: `260814-1023_o_one-comment-line-in-the-golden-test-was-left-unwrapped-…`

## Cross-cutting observations

**Two of the seven are the same shape: a plugin-shipped file cited to an agent by a bare relative
path.** Finding 2 is the load-bearing instance and the preserve-list citation is the mild one. The
project already owns this problem for skills — `bin/fusion-source-root` exists precisely to answer
"which root does a citation of a plugin-shipped file open against", and its `CLAUDE.md` row records
that a correction to one of two copies once left two standing. Agents were never brought under that
helper, and the curator is the first agent told to *read* a plugin file that `bin/fusion-rules` does
not emit. Whether agents get the same treatment as skills, or simply the `$FUSION_PLUGIN_ROOT`
prefix, is a small design question worth answering once rather than per prompt.

**Three of the seven are gaps between two texts written in the same Turn** (findings 1, 3 and 5 in
its weaker form): the orchestrator's allowlist against the curator's Tool Discipline, the skill's
Step 3 against the agent's bullet 2, and the run-file schema against its own update instruction. No
lint reads any of those pairs, which is what the dispatch predicted. They are cheap to fix and cheap
to re-check by eye; there is no mechanical gate worth building for them yet.

**What the mechanical gates did carry** is worth stating in the other direction, because it is most
of the work: the five enumeration claims, the skill roster in both directions, the README skill
table's row-per-directory, the path-literal ban, the reference-resolution of every citation the new
files added, the key-set completeness for two new consumers, and the golden fixture's per-file byte
pin. Seventeen files changed and the suite proved most of them.

## Recommended sequencing

1. **Before the release tag:** finding 1. It is an unmet acceptance criterion and it carries an
   unmeasured question about whether `/fusion:curate` works at all from the default session. One
   allowlist edit plus one end-to-end dispatch settles both, and `CLAUDE.md`'s release step 0 already
   demands that test for frontmatter and dispatch changes.
2. **Before C11's validation run:** findings 2, 4 and 6. The validation run is a real curator pass
   over this project, so a Setup read that fails, an ambiguous gate rule and an unowned fixture
   regeneration all land in it.
3. **Ordinary cleanup, any time:** findings 3, 5 and 7.

Step 5 of the plan is out of this range by design, so `RULE_BASELINE` standing unchanged and the
budget report firing for every role are expected and are not reported here.
