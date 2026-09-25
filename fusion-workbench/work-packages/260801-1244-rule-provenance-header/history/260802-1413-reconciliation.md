# Reconciliation — 260802-1413-reconciliation.md

**Agent:** reconciler
**Domain:** `code`
**Circle:** `260801-1244-rule-provenance-header` (`_t_`)
**Range verified:** `e8988d9..b568ad9`, eight commits
**Trigger:** end-of-session reconciliation after a three-Turn orchestrator session

## What this pass verified, and how

Nothing below was taken from a status marker, a `[DONE]` tag, or a coder's own report. Every claim was re-derived against the tree at `b568ad9` or against a command re-run by the reconciler.

The one thing re-run in full rather than sampled: `npm test` from `hooks/`. **17 files, 780 tests, 0 failures**, at 260802-1411.

## Counts

| | Reviewed | Updated |
|---|---|---|
| Plans and specs | 2 | 2 (both `_o_` → `_c_`, both `Status: Draft` → `Complete`) |
| Issues (Circle store) | 10 | 0 marker changes — 7 already `_c_`, all 7 closures verified; 3 `_o_` by decision, all 3 re-verified live |
| Issues (shared store) | 42 listed, 19 open | 2 annotated (`260717-0107_*_prompt-gaps-surfaced-by-fusion-paths-key-set-derivation.md`, `260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`) |
| Decisions (Circle store) | 1 | 1 (`_a_` → `_i_`) |
| Decisions (shared store) | 9 | 1 (`_a_` → `_i_`), 2 re-checked and held at `_a_` |
| Reviews | 4 | 2 annotated (both coderev passes) |

## Key findings

### 1. The work is real, and the seven closures survive independent checking

The seven `_c_` issues were checked against their cited commits rather than against their resolution notes. All seven hold. Two are worth naming because the fix was not the obvious one:

- `260802-1250_*_provenance-gate-does-not-recurse-so-rules-shards-would-escape-it.md` (gate does not recurse) — the note claims verification by mutation, that removing `recursive` fails 3 of 27 tests while the corpus test stays green. The code at `provenance-header-lint.test.ts:105-118` matches the described fix, and the reasoning behind the mutation test is sound: the real corpus is flat, so it cannot distinguish the two behaviours, and the traversal had to be driven through a temp tree to be provable at all.
- `260802-1254_*_the-corpus-prose-test-asserts-a-fact-about-the-corpus-not-about-the-gate.md` (corpus-prose test) — the fix was a *deletion*, and the deleted test left a comment at `:318` recording what stood there and why. That is the right disposal for an assertion that could fail without a defect existing.

### 2. The three open issues are open by decision, and all three are still live

Re-verified rather than trusted:

- `260802-1252_*_binding-decision-formalised-while-both-existing-instances-are-dead.md` — both pre-existing `Binding decision:` citations are still dead. `rules/fusion-workbench-conventions.md:328` uses a pre-v4 root type-folder path; `:688` names `260519-1100_*_circle-stash-pop-design.md`, which `find` locates nowhere in the workbench. This one is the sharpest of the three: the file that now *defines* the `Binding decision:` mechanism carries two examples of it a reader cannot follow.
- `260802-1255_*_five-message-assertions-interpolate-header-window-on-both-sides.md` — all five assertions still interpolate `HEADER_WINDOW` on both sides, at `:267`, `:348`, `:362`, `:383`, `:404`.
- `260802-1256_*_template-placeholder-opts-out-of-the-templates-own-fill-in-convention.md` — `templates/investigator-capture-layout.md:3` still carries the unbracketed placeholder and `:7` the sentence that documents the hazard instead of removing it.

### 3. Scope drift: fourteen non-workbench paths delivered against a plan that bounded itself to eleven

`git diff --stat e8988d9..HEAD -- . ':!fusion-workbench'` returns fourteen paths. The plan's Step 4 acceptance sweep declares eleven and says anything else "means something drifted". The three extra:

| Path | Commit | Standing |
|---|---|---|
| `hooks/package.json` | `b568ad9` | Legitimate. Closes review issue `260802-1345`. |
| `CLAUDE.md` | `7703330`, `b568ad9` | Departs from the plan's own recommendation. Plan Open Question 2 recommended deferring `CLAUDE.md` to session close; it was done mid-Circle as the second half of a review-finding fix. |
| `templates/investigator-capture-layout.md` | `482e9c3` | **Unplanned.** `grep -n 'templates/'` across both the spec and the plan returns nothing. This commit has no step behind it. |

The templates commit is defensible on the merits — a template becomes a rule file in a consuming project, where the gate cannot reach — and it is four insertions. But it is also the only piece of the Circle that no governing document authorised, and it is the piece that generated an open review finding. Recorded as drift, not as a defect.

### 4. Two decision records reached `_i_`, and both promotions are on realisation rather than on activity

- `circles/…/260802-1018_*_what-a-rule-file-with-no-recoverable-record-cites.md` — promoted on `929dbf5`. Six rule files carry the chosen admission form character for character, and a test fails if any of them loses it.
- `260801-1020_*_provenance-header-on-rule-files.md` (**D3**) — promoted on `929dbf5`, `c2c2a04`, `de9d5aa`, the three commits realising the answer's three named parts. This reverses the hold placed by the 260801-2029 reconciliation, and it reverses it for exactly the reason the hold was placed: that pass found zero of ten rule files carrying a header and no gate. Both conditions are now the opposite.

The 260801-2029 hold also recorded the decay this decision predicted, arriving early: `rules/protected-path-discipline.md` was authored hours after D3 was answered and shipped with no header. That file now carries one at line 3, and the gate makes the same omission impossible to repeat silently.

`260801-1020_*_where-does-normative-consistency-live.md` (D1) and `…_a_may-any-fusion-writer-touch-rules.md` (D2) were re-checked and **held at `_a_`**: `agents/curator.md` does not exist, and `FUSION_ALLOW_RULES_WRITE` matches nothing anywhere in the tree. Realisation belongs to the two sibling Circles that are still `_a_`.

### 5. Live corroboration for an old shared issue, from a session that was not looking for it

The planner reported that `bin/fusion-paths planner` emits no `OUT_DECISION` key. The reconciler re-ran the resolver rather than taking the report, and the output corroborates **four** rows of `260717-0107`, not one: `planner` → `$OUT_ISSUE`, `$OUT_DECISION`, `$SCAN_ANALYSES`, and `shaper` → `$SCAN_PLANS`.

This is evidence of a different kind from what the 260731-2324-reconciliation.md pass had. That pass distinguished a gap from a decided absence by reading prompts for a named `$KEY`, which is the right test but says nothing about what an agent receives at run time. Running the resolver closes the loop from the other end: these keys are not in the emitted environment, and under the derivation design the prompt is the only thing that could put them there.

### 6. The Circle-record `**Status:**` field defect is broader than filed, and differently shaped

Surveyed all nine Circle records. **Two of nine disagree** with their own filename marker:

- `260801-1244-rule-provenance-header` — `_t_` / `anticipated` (the originating instance, unchanged after three Turns)
- `260718-1924-v5x-overhaul` — `_c_` / `active`

The second one inverts the issue's premise. Its field *was* updated at activation and then missed at closure, while five of the six other closed Circles say `closed`. So the field is not systematically ignored at every transition; it is updated whenever a writer happens to notice and skipped whenever nobody does, because no prompt or skill step requires it. Recorded on `260802-0920`, which stays `_o_`.

The live instance was **left uncorrected on purpose**, so the defect survives to be fixed at its source rather than being hand-patched out of the one record that demonstrates it.

### 7. The Circle record's `## Turn log` is empty after three Turns

`260801-1244-rule-provenance-header:54-55` — the heading exists, the section is empty. The orchestrator's session history file is in the same state: its `## Per-Turn Log` still reads "(No Turn started yet.)" at Setup-time content. Both are the orchestrator's to fill at Phase 4, not the reconciler's — recorded here as state, not filed as an issue, because the session is still open at the time of this pass.

## New issues filed

**None.** Everything this pass found was either already filed (`260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`, `260717-0107_*_prompt-gaps-surfaced-by-fusion-paths-key-set-derivation.md`, the ten Circle issues) or is a tracking-file observation belonging in this log. The scope drift in finding 3 is recorded rather than filed: the work it names is landed, reviewed, and correct, and an issue asking someone to un-drift a merged four-line template edit would be process for its own sake.

## Coherence verdict

Computed in full and written to `260802-0848-orchestrator-session.md` `## Coherence`. Summary: **review-needed**, recommendation **revise Directive**. The flag is on the Directive's wording, not on the work — no commit in the range moves away from it. See that section for the three edges and their evidence.
