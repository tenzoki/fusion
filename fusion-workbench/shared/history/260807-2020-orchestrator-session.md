# Orchestrator Session — 260807-2020-orchestrator-session.md

**Directive:** Split fusion's single language declaration into two, so chat language and persisted-artifact language resolve independently, and make `bin/fusion-rules` honour the split.
**Mode:** custom (planned, then executed)
**Status:** Complete

## Why this session existed

An earlier session the same evening (`260807-1917-orchestrator-session.md`) answered
decision `260807-1515`: the language declaration reaches direct user interaction only, and every
artifact that persists as a file is English. Recording that answer exposed a mechanism problem the
answer could not solve on its own.

`CLAUDE.md` carried one line, `**Language:** de`, and `bin/fusion-rules` fed it to both stylometric
profile families. Every surface the long-form writing profile governs is a file that persists, so the
answer put all of them in English while the chat stayed German. One declaration could no longer serve
both, and a prose agent in this repository was receiving `default-voice-de.yaml` while being expected
to write English.

## What was decided before any work started

Two user decisions bounded the design, and neither was reopened:

1. **The mechanism.** A second declaration line in `CLAUDE.md`, with the first governing both when the
   second is absent. That backwards-compatibility clause is binding rather than polite: the plugin
   ships to consumers whose `CLAUDE.md` nobody here controls.
2. **The dashboard.** `orchestrator-live.md` and the monitor strings persist as files but are a live
   display. It is the one surface where "persists as a file" and "direct user interaction" genuinely
   overlap. The user chose the artifact-language reading, on the ground that commit messages are the
   same class of persisted-but-user-facing surface and the answered decision names them English
   explicitly. The rule text records that it was settled rather than derived.

## Budget

| Metric | Count |
|--------|-------|
| Turns | 2 |
| Tasks resolved | 18 |
| Tasks skipped or deferred | 0 |
| Issues created | 9 (7 by the reviewers, 2 by the reconciler) |
| Issues resolved | 4 |
| Decisions implemented (`_a_`→`_i_`) | 1 |
| Decisions filed (`_o_`) | 1 |
| Commits | 14 |
| Agent errors | 0 |
| Human gates hit | 5 |

## Per-Turn Log

### Turn 1 — build the split

Thirteen tasks, nine commits (`c1b72fc..0e9e39f`), executed as nine dispatches so that each unit was
coherent rather than each step separate.

- **Planning.** `planner` produced a twelve-step plan. `conceptrev` evaluated its two Mermaid diagrams
  and returned `acceptable` with three corrections, one of them a real defect: `S7` and `S8` had no
  path to `S12`, although `S12` must cite a commit containing both. All three were applied before any
  step ran.
- **The authoring home first.** `## Project language` in `rules/fusion-workbench-conventions.md` was
  rewritten to state the boundary by surface before any mechanism, so the profile routing follows as a
  consequence rather than as a second definition.
- **The lock before the change.** `S2` wrote the backwards-compatibility test and ran it green against
  the unmodified `bin/fusion-rules`; `S3` made the change; `S2` ran green again, unmodified. That is
  the byte-identical guarantee for a single-declaration project discharged rather than asserted.
- **The declaration last.** `CLAUDE.md` gained `**Artifact language:** en` only after the code could
  read it, so no window existed in which the file promised behaviour the code lacked. Verified live:
  `bin/fusion-rules planner` emitted `chat-voice-de.yaml` beside `default-voice-en.yaml`, where the
  same command emitted `default-voice-de.yaml` before.
- **Reviews.** `coderev` filed 4 findings, `ontorev` 3. None critical, none high.

| Task | What it did | Commit |
|---|---|---|
| T0 | Three diagram corrections from the `conceptrev` pass | `c1b72fc` |
| S1 | `## Project language` as the authoring home for both declarations | `def9d13` |
| S2, S3, S4 | Regression lock, two-code resolution, 12 test cases | `73c52b4` |
| S5, S6 | Head-label claim in two files, pointers in two more | `c3b74b9` |
| S9 | `README.md` and `context-lean-claude-md.md` | `76eddbb` |
| S7 | `CLAUDE.md` second declaration, profile bullet | `3c77e33` |
| S8 | Four `stilwerk/` chat profiles repointed by role | `b6bca62` |
| — | The customer-deliverable question filed as an open decision | `4d9ecd5` |
| S10 | Emission golden regenerated, 1026 tests green | `cd48540` |
| S11, S12 | v6.1.0, decision `260807-1515` walked `_a_` → `_i_` | `0e9e39f` |

**Coherence gate: review-needed.** Two of the seven findings were real gaps in the work itself rather
than neighbouring defects. The user chose to revise the Artifact.

### Turn 2 — close the gaps, then release

Five tasks, five commits (`4992ffb..c54ead9`).

- **The prefix match.** `declared_lang` extracted the value with `([a-z]{2}).*`, so `deutsch` resolved
  to `de`, and so did `denmark` and `de-DE`. The expression predates the split; what the split changed
  is the cost, because a bad artifact value now overrode the chat language instead of degrading toward
  the shared default, while `## Project language` promised the opposite. The fix took the decision away
  from the extraction rather than teaching it the supported set a second time, so the `case` that was
  already there became the single place the set lives. Four new test cases, each verified red against a
  scratch copy carrying the old extraction.
- **Nine agents mechanised, sixteen asserted.** `ARTIFACT_LANG` reaches one call site, gated on
  `IS_PROSE_AGENT`. The other seven agents write reviews, defect records, the task queue and their own
  histories, all of which the rule assigns to the artifact language, and none of them received a signal
  saying so. Closed in `rules/agent-setup.md` as rule text. Widening `IS_PROSE_AGENT` was rejected and
  the reason checked rather than assumed: the long-form register is wrong for a task queue.
- **Three stale claims** outside the authoring home, including one circular justification inside
  `## Project language` itself and a `README.md` opening clause a reader could stop at and take away
  the pre-split rule.
- **The release.** All four version surfaces at 6.1.0, tag `v6.1.0` on `fd74b89`, marketplace entry
  pushed as `tenzoki/claude-plugins@0c091d9`. Pre-checks first: `claude plugin validate .` passed with
  the one expected `CLAUDE.md` warning, the default-agent smoke test returned `SMOKE-OK`, the suite was
  green at 1030 tests, and `hooks/dist/` rebuilt with no diff, so the tarball an HTTPS install unpacks
  needs no npm step.

| Task | What it did | Commit |
|---|---|---|
| R1 | Language value compared whole, 16 test cases | `4992ffb` |
| R2, R3 | Chat-only-profile exemption, three stale claims, two version pins | `22b0ba8` |
| R4 | Golden regenerated, 1030 tests green, release pre-checks | `fd74b89` |
| R5 | Four findings closed, release recorded | `c54ead9` |

**Coherence gate: ok.**

## Coherence

<!-- RECONCILER-OWNED — appended at Phase 3 step 3. Format defined in agents/reconciler.md Step 4. Do not overwrite or modify. -->

**Verdict:** coherent

**Edges:**
- Artifact↔Grounding: 12 of 12 plan steps verified against the tree, 0 false `[DONE]`; 1030 tests green across 33 files; two steps re-executed independently (the S2 backwards-compatibility lock against `73c52b4~1`, and the split behaviour against `4992ffb~1`); 4 version surfaces coherent at `6.1.0`; 2 marker renames both staged with their deletions and no path duplicated at HEAD; 3 of 7 reviewer findings open, all three re-verified as accurately stated and all three open by deliberate choice. Drift: 3 stale line citations inside otherwise-accurate records (`260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` ×2, `260807-0158_a_` ×1) and 1 range-notation defect in the `Implemented:` line of `260807-1515_i_`. All four are citation precision inside tracking records, repaired or annotated in this pass; none contradicts an artifact.
- Artifact↔Directive: all 14 commits in `b246996..c54ead9` move toward the stated Directive, none orthogonal, none away. Turn 1 (`c1b72fc..0e9e39f`) establishes the split — the rule text (`def9d13`), the two-code resolution with its regression lock (`73c52b4`), the declaration itself (`3c77e33`), the golden (`cd48540`), the release and the decision transition (`0e9e39f`). Turn 2 (`4992ffb..c54ead9`) corrects and completes it — the prefix-match fix (`4992ffb`), the three stale claims and the chat-only-profile exemption (`22b0ba8`), the golden again (`fd74b89`), the bookkeeping (`c54ead9`). The one commit that could read as off-Directive, `4d9ecd5`, files the customer-deliverable question as an open decision instead of answering it inside the Directive's scope, which is the Directive respected rather than exceeded.
- Grounding↔Directive: 5 active decisions across `shared/decisions/` (2 `_o_`, 3 `_a_`), 5 consistent with the Directive, 0 conflicting. `260807-2131_*_which-language-governs-a-customer-deliverable.md` is a gap the Directive opened and deliberately left open rather than a contradiction of it; the other four are unrelated to the language boundary. `260807-1515_i_`, the decision the Directive existed to realise, is now implemented and its own stated condition is met.

**Rebalance recommendation:** none

**Reconciliation log:** `260808-0030-reconciliation.md`

## Remaining Work

**Five open defects touching this work**, none blocking:

1. `260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` — the
   list declares `rules/`, `agents/`, `skills/`, `README.md` and `docs/` English "in every project" on
   the ground that they ship to consumers of every language. In a consuming project they ship nowhere,
   so a German consumer is told its own README must be English for a reason that does not hold there.
   Decision `260807-1515` asked the answer to name this repository's double role; the text universalises
   its exemptions instead. This is the substantive one.
2. `260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md` — `/fusion:setup`
   copies a profile only when absent, so a pre-6.1.0 project adopting the second declaration keeps a
   chat profile naming the file the split stopped emitting.
3. `260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md` —
   the chat profiles now reference the long-form profile by role, and the long-form profile declares no
   `scope:` to answer to. Closing it means a schema change to a file every consumer holds.
4. `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md` — three
   live instances, two staled by this session's own second Turn within about two hours.
   `reference-resolution-lint` reads paths, headings and record citations, never a line number.
5. `260808-0030_*_the-coderev-pass-filed-four-issues-and-left-no-review-file.md` — the review file is
   the durable record that `agents/coderev.md` waives the history entry for, and this pass wrote
   neither.

**One open decision this Directive opened:**
`260807-2131_*_which-language-governs-a-customer-deliverable.md`. `agents/editor.md` reads the chat
declaration to set the language of a customer deliverable. Under the new boundary a deliverable is a
file that persists, so the artifact language would govern and make deliverables English here, which is
consistent and quite possibly useless. Four options, no recommendation, because the choice turns on how
the user actually uses `editor` and no agent here has evidence about that.

**Inherited from the earlier session, untouched by this Directive:** the `## Filename Patterns`
citation rule (cite a record by its full filename, never by the bare timestamp), the stash-manifest
duplication decision, and the anticipated Circle `260801-1244-curator`, which remains unblocked
and whose remit covers the conventions file this session grew by roughly 3.9 kB.

**Local state:** `origin/main` is at `fd74b89`; HEAD carries the bookkeeping commits that landed after
the release push. Nothing about the release is incomplete. The marketplace cache clone at
`~/.claude/plugins/marketplaces/tenzoki-plugins` does not exist, so `/plugin install` cannot see v6.1.0
locally; `install.sh` reads the GitHub tarball directly and is unaffected.

## Commits

| Hash | What it did |
|------|-------------|
| `c1b72fc` | Plan and its diagram corrections |
| `def9d13` | `## Project language` as the authoring home |
| `73c52b4` | Two language codes in `bin/fusion-rules`, behind a lock |
| `c3b74b9` | Head label English everywhere, differing profile pair intended |
| `76eddbb` | The second declaration is optional, README first |
| `3c77e33` | This repository declares two languages, split goes live |
| `b6bca62` | Chat profiles name their sibling by role |
| `4d9ecd5` | Customer-deliverable question filed as open decision |
| `cd48540` | Golden for the four rule files, one wrong claim removed |
| `0e9e39f` | v6.1.0, language decision implemented |
| `4992ffb` | Language value compared whole |
| `22b0ba8` | Chat-only profile is not an exemption, three stale claims |
| `fd74b89` | Golden for the two rule files Turn 2 grew |
| `c54ead9` | Four findings closed, release recorded |

## Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant P as Planner
    participant CV as Conceptrev
    participant C as Coder
    participant OC as Ontocoder
    participant CR as Coderev
    participant OR as Ontorev
    participant R as Reconciler

    U-->>O: solve the language problem in CLAUDE.md
    O->>O: measure — one declaration feeds both profile families
    O->>U: two declarations, or a rule without a mechanism?
    U-->>O: second declaration; use the planner

    O->>P: plan the split
    P-->>O: 12 steps, 1 human gate
    O->>CV: evaluate the two diagrams
    CV-->>O: acceptable — 2 missing edges, caption defects
    O->>U: plan gate + dashboard language
    U-->>O: approve with corrections; dashboard is artifact language

    Note over O: Turn 1
    O->>C: T0 diagram corrections
    C-->>O: done (c1b72fc)
    O->>C: S1 authoring home
    C-->>O: done (def9d13)
    O->>C: S2+S3+S4 lock, split, cases
    C-->>O: lock green before and after (73c52b4)
    O->>C: S5+S6 head label and pointers
    C-->>O: done (c3b74b9)
    O->>C: S9 README and lean rule
    C-->>O: done, found editor.md (76eddbb)
    O->>C: S7 CLAUDE.md declaration
    C-->>O: split live (3c77e33)
    O->>U: GATE S8 ontocoder + editor.md question
    U-->>O: proceed; file the editor question
    O->>OC: S8 chat profiles
    OC-->>O: done (b6bca62)
    O->>C: S10 golden, full suite
    C-->>O: 1026 green (cd48540)
    O->>C: S11+S12 version, decision
    C-->>O: v6.1.0 (0e9e39f)
    O->>CR: review the code and rule text
    CR-->>O: 4 findings
    O->>OR: review the profiles and manifest
    OR-->>O: 3 findings
    O->>U: Coherence gate — 2 real gaps
    U-->>O: revise Artifact; do the release

    Note over O: Turn 2
    O->>C: R1 exact value match
    C-->>O: 16 cases (4992ffb)
    O->>C: R2+R3 exemption, stale claims, pins
    C-->>O: done (22b0ba8)
    O->>C: R4 golden, release pre-checks
    C-->>O: 1030 green, validate passed (fd74b89)
    O->>OC: marketplace version
    OC-->>O: 6.1.0, one line
    O->>O: push both repos, tag v6.1.0

    Note over O: Converged
    O->>R: final reconciliation (domain=code)
    R-->>O: coherent, 0 false [DONE], 2 new issues
```
