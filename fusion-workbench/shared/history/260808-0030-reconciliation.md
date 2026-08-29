# Reconciliation — session 260807-2020-orchestrator-session.md, the two-language-declaration split

**Date:** 260808-0030
**Agent:** reconciler
**Domain:** code
**Tree verified at:** `c54ead9`
**Session-start anchor:** `b246996` (from `agentstate.yaml` `session.git_head_at_start`)
**Active Circle:** none (`.active-circle` absent), so every `SCAN_*` resolved to `shared/` alone

---

## What was reviewed

| Store | Read | Changed |
|---|---|---|
| `shared/planning/` | 5 | 1 (reconciliation log appended) |
| `shared/issues/` | 67 | 3 annotated, 2 filed |
| `shared/decisions/` | 13 | 2 annotated |
| `shared/reviews/` | 8 | 2 annotated |
| `shared/history/` | 57 | this file |

No marker was renamed. Every record the session moved was already in its correct state, and the
two decisions this pass touched are terminal or blocked on work explicitly out of scope.

## The plan: twelve steps, twelve verified

`260807-2024_*_two-language-declarations.md` claims `**Status:** Complete` with all
twelve steps `[DONE]`. Each was re-derived from the file it names rather than read off its marker.
The per-step evidence table is appended to the plan itself as `## Reconciliation Log`; the summary
is that all twelve hold, and that two of them were re-executed rather than inspected.

**S2 re-executed.** The step's load-bearing claim is that the regression lock ran green against the
*unmodified* script — a lock written afterwards being a description rather than a lock. Git cannot
show this, because the test and the change landed in one commit (`73c52b4`). So it was measured:
`git show 73c52b4~1:bin/fusion-rules`, run in a temp project declaring only `**Language:** de`,
emits `chat-voice-de.yaml` + `default-voice-de.yaml` for `planner` and `chat-voice-de.yaml` alone
for `coder` — byte-identical to today's script on the same input. The backwards-compatibility
promise is discharged by measurement.

**The split re-executed, including the Turn 2 fix.** Against today's script: `de`/`en` routes to
`chat-voice-de` + `default-voice-en`; `en`/`de` routes to the mirror, which is what rules out a
hard-coded "artifacts are always English"; `en`/`de-DE` resolves to `default-voice-en`, where
`git show 4992ffb~1:bin/fusion-rules` emits `default-voice-de` for the same input. The prefix-match
defect was real, the fix is real, and `260807-2152_*_…` is correctly closed.

**The suite.** `cd hooks && npm test` — 33 files, 1030 tests, all green, including the regenerated
emission golden and the three lint gates S10 names.

## The decision: `_i_` is earned

`260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` set its
own condition in its 260807-1941 reconciliation note: it moves to `_i_` when the rule text carries
the exempt-surface list, the `**Decidability:**` resolution, and the "direct user interaction"
wording. Checked against `## Project language` as it stands after Turn 2 also edited it, all three
are met — the exempt list at `:204-213` with its worked case, the label resolution in both
`rules/critical-stance.md:65` and `agents/planner.md:146`, and a boundary drawn by surface at
`:178-182` that is stricter than the phrase the condition asked for. `**Entscheidbarkeit:**` is
gone from `rules/` and `agents/`; the old "prose output" scoping clause is gone from the corpus.

One defect in the `Implemented:` line, appended to the record and left for the user: it cites the
range `def9d13..cd48540` while its own prose names `def9d13` as where S1 landed. Git's two-dot
notation excludes the left endpoint, so the cited range omits the commit the sentence describes.
Substance right, notation wrong; not corrected here, because `_i_` is terminal and the reconciler's
licence on a terminal record is to append evidence rather than rewrite its annotations.

## The three open findings: all three still accurate, two carry stale line numbers

Each was re-read against the files it describes, after Turn 2 changed several of them.

**`260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` — the exempt-surface list is plugin-repo-shaped.** Substance unchanged and
still live: the quoted block is verbatim at `rules/fusion-workbench-conventions.md:204-213`,
including the reason clause, and Turn 2 touched exactly one other line of that section. Two
citations are now wrong, both staled by Turn 2's own `4992ffb`, which added 17 comment lines to
`declared_lang()`: `bin/fusion-rules:387` is now `:404`, and `:464` is now `:481`. Corrected in an
appended note.

**`260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer`.** Accurate as
written. The four skill citations hold (`setup:135-138`, `migrate:114`, `archive:91`), the
`grep -rn "stilwerk" skills/` claim holds, `rules/agent-setup.md:52-56` still resolves, and the
stale German line the failure scenario quotes is correctly attributed to a pre-v6.1.0 consumer's
own copy rather than to this tree. One number off by one: the "existing files are left untouched"
sentence is at `skills/setup/SKILL.md:141`, not `:140`, and was already off at filing.

**`260807-2154_*_the-writing-profile-carries-no-handle…`.** Every citation exact; nothing under
`stilwerk/` moved after Turn 1. Re-verified mechanically: no `scope:` key in either writing
profile, and no `chat`/`kurzform`/`short-form` token in either. Turn 2's addition to
`rules/agent-setup.md:58-61` addresses a different gap — the seven agents holding no writing
profile at all — and adds no handle to the writing profile itself.

## Staging: clean

The earlier defect in this workbench (`260807-1941_*_marker-renames-landed-add-only-so-head-carries-each-of-three-records-twice.md`)
did not recur. Both renames this session performed landed as renames with their deletions:

- `260807-2024_*_…` → `_c_…` (`R099`)
- `260807-1515_*_…` → `_i_…` (`R092`)

Swept wider than the two: every tracked path under `fusion-workbench/` at HEAD was reduced to
`<dir>/<stamp>_<slug>` with the marker stripped, and the result has no duplicates. No record exists
at HEAD under two markers.

Working tree carries only runtime state (`.guard-state/`, `orchestrator-events.jsonl`,
`orchestrator-live.md`, `.session-marker`, the released `.commit-lock/holder`).

## Release surfaces: coherent

`.claude-plugin/plugin.json` `6.1.0`; marketplace entry `6.1.0` at `tenzoki/claude-plugins@0c091d9`,
whose working clone matches its remote exactly; tag `v6.1.0` present locally and on the remote,
resolving to `fd74b89`; both pin examples (`install.sh:27`, `README.md:26`) name `tags/v6.1.0`.
All four version surfaces agree.

**One observation for Phase 4, not a defect.** `origin/main` is at `fd74b89`; local HEAD `c54ead9`
is one commit ahead and unpushed. That commit is the workbench bookkeeping that closed four review
findings and recorded the release on the decision it answers — it landed after the release push, so
nothing about the release is incomplete. It simply has not been pushed yet.

## New issues filed

1. `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`
   — Low. A record citing a rule file by `file.md:NNN` is correct on the day it is written and
   silently wrong afterwards, and `reference-resolution-lint` reads paths, heading anchors and
   record citations but never a line number. Three live instances measured, two of them staled by
   this session's own second Turn within about two hours of being filed. The record-citation class
   was solved by ratifying a stable citation form (`260806-0015_*_zitierform-fuer-workbench-records`);
   this class has no equivalent.

2. `260808-0030_*_the-coderev-pass-filed-four-issues-and-left-no-review-file.md`
   — Low. Four issues carry `**Filed by:** coderev, review of b246996..HEAD`, and no review
   document exists; `git log --diff-filter=A` over the session confirms it was never written rather
   than lost. `agents/coderev.md:69` makes that file the pass's only durable record and waives the
   history entry on that ground, so the pass left no statement of its own scope or clean-surface
   coverage. The findings themselves are intact.

## Not filed — known and deliberate

Confirmed present, and each already has a home: the untranslated German artifacts (consequence 2 of
the answered decision); `agents/editor.md` still reading `**Language:**`, filed as open decision
`260807-2131_*_which-language-governs-a-customer-deliverable.md`; the
`## Filename Patterns` citation rule, out of scope by the plan's own `## Out of Scope` and still
the blocker on `260807-0158_*_…`; the absent marketplace cache clone.

## Open-decision surface — `shared/decisions/`, 13 records

Two open, three answered-awaiting-realisation, eight implemented.

### HIGH — shapes work that is queued or in reach

**`260807-2131_*_which-language-governs-a-customer-deliverable.md`** (Domain `knowledge`). Opened
by this session, at a user gate, and correctly left open. The boundary now has three cases; a
customer deliverable written by `agents/editor.md` fits none of them cleanly, and the agent still
reads `**Language:**` at `:16,62`. Every project that adopts the second declaration and produces
deliverables meets this immediately, and the record itself labels its own leaning as speculation
rather than measurement. This is the one open decision the session's own work created, and it is
the next thing a user can answer cheaply.

### MEDIUM — real, bounded, not blocking

**`260807-0158_*_how-is-a-unique-record-filename-obtained.md`**. Answered; the operative half is a
citation rule that is not yet in `rules/fusion-workbench-conventions.md` `## Filename Patterns`,
deferred by the user in the answering session ("nur festschreiben"). Re-checked: the section still
carries no citation rule, so the record stays `_a_`. Its own line citation into that section went
stale by this session's S1 and is now the first measured instance of the new issue above.

**`260801-1020_*_where-does-normative-consistency-live.md`**. Answered — a writing consolidation
agent across all three normative surfaces. `agents/` still holds the same sixteen prompts and no
`agents/curator.md`. Realisation belongs to `260801-1244-curator`, which is the sole `_a_`
Circle in the portfolio. Unchanged since the 260802-1413-reconciliation.md pass; stays `_a_`.

**`260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md`**. Open, unchanged, and
genuinely a choice rather than a defect: keep two fields that always agree, or drop one and touch
the schema plus both stash skills. Nothing depends on it.

### LOW — recorded, no action pending

**`260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`**. Answered Option 3 —
fusion does not support concurrency. The 260731-2324-reconciliation.md pass left it `_a_` deliberately, on the
ground that the realisation of a non-feature has nothing to cite and `_i_` is terminal, and set out
the two defensible outcomes for the user. That reasoning is untouched by this session and the call
remains the user's.

**Scope note, stated rather than glossed.** With no active Circle, `$SCAN_DECISIONS` collapses to
`shared/decisions/` alone, so this surface excludes two Circle-local active decisions —
`260805-1548_*_…` and
`260807-0945_*_…` — and everything under
`archive/`, which no `SCAN_*` key reaches
(`260801-1020_*_scan-keys-never-reach-the-archive-store.md`). Both residuals are
known and neither bears on this session's Directive.

---

## Coherence

**Verdict:** coherent

**Edges:**

- **Artifact↔Grounding:** 12 of 12 plan steps verified against the tree, 0 false `[DONE]`; 1030
  tests green across 33 files; two steps re-executed independently (the S2 backwards-compatibility
  lock against `73c52b4~1`, and the split behaviour against `4992ffb~1`); 4 version surfaces
  coherent at `6.1.0`; 2 marker renames both staged with their deletions and no path duplicated at
  HEAD; 3 of 7 reviewer findings open, all three re-verified as accurately stated and all three
  open by deliberate choice. Drift: 3 stale line citations inside otherwise-accurate records
  (`260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` ×2, `260807-0158_a_` ×1) and 1 range-notation defect in the `Implemented:` line
  of `260807-1515_i_`. All four are citation precision inside tracking records, repaired or
  annotated in this pass; none contradicts an artifact.
- **Artifact↔Directive:** all 14 commits in `b246996..c54ead9` move toward the stated Directive,
  none orthogonal, none away. Turn 1 (`c1b72fc..0e9e39f`) establishes the split — the rule text
  (`def9d13`), the two-code resolution with its regression lock (`73c52b4`), the declaration itself
  (`3c77e33`), the golden (`cd48540`), the release and the decision transition (`0e9e39f`). Turn 2
  (`4992ffb..c54ead9`) corrects and completes it — the prefix-match fix (`4992ffb`), the three
  stale claims and the chat-only-profile exemption (`22b0ba8`), the golden again (`fd74b89`), the
  bookkeeping (`c54ead9`). The one commit that could read as off-Directive, `4d9ecd5`, files the
  customer-deliverable question as an open decision instead of answering it inside the Directive's
  scope, which is the Directive respected rather than exceeded.
- **Grounding↔Directive:** 5 active decisions across `shared/decisions/` (2 `_o_`, 3 `_a_`), 5
  consistent with the Directive, 0 conflicting. `260807-2131_*_which-language-governs-a-customer-deliverable.md` is a gap the Directive opened and
  deliberately left open rather than a contradiction of it; the other four are unrelated to the
  language boundary. `260807-1515_i_`, the decision the Directive existed to realise, is now
  implemented and its own stated condition is met.

**Rebalance recommendation:** none

The Directive is reached and verified. The drift on the Artifact↔Grounding edge is line-number
precision in four tracking records — repaired in this pass, with the systemic cause filed as its
own issue — and does not reach the threshold where revising Artifact, Grounding or Directive would
be the right response.
