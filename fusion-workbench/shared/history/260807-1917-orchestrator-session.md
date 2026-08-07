# Orchestrator Session — 260807-1917

**Directive:** Record the user's answers to two open decisions (how far the project-language declaration reaches, and how a unique record filename is obtained), correct the mis-titled filename-collision defect with an actual measurement, and switch persisted artifacts to English.
**Mode:** custom
**Status:** Complete

> **Note on this file's language.** It was first written in German and rewritten in English as
> task T4 of this session, because T1 answered the language decision by scoping German to direct
> user interaction only. Session histories persist as files, so they are English from here on.

## Setup snapshot

| Field | Value |
|---|---|
| Workspace | `/Users/k1/Projects/productive/fusion` |
| Plugin version | 6.0.1 |
| Plugin root | `/Users/k1/.fusion` |
| Git HEAD at start | `f910f1e` |
| Active Circle | none (`.active-circle` absent) |
| Interrupted session | none (`agentstate.yaml` absent) |
| Concurrent session | none (`fusion-session-mark check` returned `none`) |
| Guard | not halted (`haltActive: false`, 0 consecutive blocks) |

### Open state at Setup

- Open defects (`shared/issues`, `_o_` plus `_p_`): 23
- Open plans (`shared/planning`, `_o_` plus `_p_`): 1 — the normative-consolidation spec
- Open decisions (`shared/decisions`, `_o_`): 3
- Analyses (`shared/analyses`): 7
- `tasklist.md`: absent
- `portfolio.md`: present

### Circles

| Marker | Count |
|---|---|
| `_a_` anticipated | 1 (`260801-1244-curator`) |
| `_c_` closed | 10 |
| `_s_` superseded | 1 |
| `_t_` active | 0 |

Portfolio hint emitted: yes (1 anticipated, 0 active, pointing at `/fusion:next`).

### Domain detection

Result: **code**, via the fallback branch.

| Input | Value |
|---|---|
| `commits` on `fusion-workbench/` | 105 |
| `analyses_count` | 7 |
| `issues_count` | 23 |
| `decisions_count` | 3 |
| `code_files` | 4 |
| `data_files` | 0 |

No preconditions fire: `decisions_count` (3) is below `issues_count` (23), `commits` is not 0,
`code_files` is not 0, and `data_files` does not exceed `code_files * 2`. Fallback applies.

### Style profiles

`chat-voice-de.yaml` and `default-voice-de.yaml` loaded, per `**Language:** de` in `CLAUDE.md`.
No fallback needed. The T1 answer narrows what that declaration governs; the profiles themselves
are unchanged.

## Decisions answered

### D1 — How far does the project language reach into the rule corpus? (`260807-1515`)

`shared/decisions/260807-1515_a_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`

**Answer (user):** the declaration reaches direct user interaction and nothing else. German applies
to the chat stream, gate prompts, `AskUserQuestion` text, and reports the user reads in the
terminal. Every artifact that persists as a file is English: decision records, defect records,
specs and plans, session histories, commit messages, and the already-English rule corpus, agent
prompts, skill bodies, code comments and READMEs.

This is the filed option 1 with a tighter boundary. Option 1 exempted the delivered rule corpus and
left workbench prose German; the answer moves workbench prose to English too, leaving the terminal
as the only German surface.

Three consequences recorded on the record itself: the head-label claim in `rules/critical-stance.md`
is now false and `**Decidability:**` is the label in every project; existing German artifacts are
not translated, the boundary applies going forward; and the bilingual-rule-file question (point 2
of the filed question) is untouched, since a marked German example inside an English rule file was
always legitimate.

### D2 — How is a unique record filename obtained? (`260807-0158`)

`shared/decisions/260807-0158_a_how-is-a-unique-record-filename-obtained.md`

**Answer (user):** none of the three options. The existing pattern stands, `YYMMDD-HHMM` plus a
topic slug. No minting helper, no second resolution, no ordinal suffix.

The user disputed the measurement the question rested on, and the dispute holds. Re-measured over
the 579 record files outside `archive/`, `stashes/` and `.migration-v2-backup/`:

| Check | Result |
|---|---|
| Files sharing a full basename, state marker normalised | 0 |
| Files sharing a full basename within one directory | 0 |
| `YYMMDD-HHMM` stamps carried by two or more files | 84 |

Filenames carry a topic slug, so two records minted in the same minute collide only when their
slugs also match. None ever have. The "238 of 556" figure in the filed defect counts files sharing
a *timestamp*, not files sharing a *name*.

What survives is a citation rule rather than a naming mechanism: cite a record by its full
filename, never by the timestamp alone. The marker may be wildcarded, the form `CLAUDE.md` already
uses. All five bare-stamp citations in this repository were checked by the original filing agent
and each still resolves to exactly one file, so nothing is currently broken.

**Orchestrator error owned:** the Setup report passed the defect's "238 of 556" figure to the user
without re-deriving it. The measurement above is what should have accompanied it.

## Per-Turn Log

### Turn 1

- Tasks attempted: T1, T2, T3, T4
- Tasks completed: T1, T2, T3, T4
- Executor: orchestrator only (workbench bookkeeping; no code, data or rule file touched)
- Review findings: none (no code or data changed, so `coderev` and `ontorev` did not run)
- Circuit breaker status: OK

| Task | What it did | Transition |
|---|---|---|
| T1 | Answered the project-language decision | `_o_` → `_a_` |
| T2 | Answered the record-filename decision | `_o_` → `_a_` |
| T3 | Corrected and closed the filename-collision defect | `_o_` → `_c_` |
| T4 | Rewrote this history file in English | — |

## Coherence

<!-- RECONCILER-OWNED — appended at Phase 3 step 3. Format defined in agents/reconciler.md Step 4. Do not overwrite or modify. -->

## Remaining Work

**One decision still open**, deliberately, because the user asked for the underlying mechanics
before choosing: `shared/decisions/260806-1152_o_stash-manifest-dirname-and-pointer-content-duplicate.md`.
Do `original_circle_dirname` and `active_circle_content` both need to exist in the stash manifest,
given that both hold the active Circle's directory name at stash time?

**Three rule-text edits deferred by explicit user choice** ("nur festschreiben"), each implied by
an answer recorded above:

1. `rules/fusion-workbench-conventions.md` `## Project language` needs the exempt-surface list, and
   its scoping wording should say "direct user interaction" rather than "prose output".
2. `rules/critical-stance.md` needs the `**Entscheidbarkeit:**` head-label line resolved to
   `**Decidability:**` in every project.
3. `rules/fusion-workbench-conventions.md` `## Filename Patterns` needs the citation rule: cite a
   record by its full filename, never by the timestamp alone.

**Portfolio:** one anticipated Circle, `circles/260801-1244-curator`, whose three dependency
Circles (`260801-1244-rule-provenance-header`, `260801-1244-guard-rules-write`,
`260801-1244-guard-bash-inspection`) are all closed. It is unblocked and activatable via
`/fusion:next`. Note that the three deferred rule-text edits above fall inside that Circle's own
remit, since its stated first job is reconciling this repository's conventions file.

**Open defects:** 22 remaining in `shared/issues` after T3 closed one.

## Commits

| Hash | Message | Task |
|------|---------|------|
| (see below) | chore(workbench): two decisions answered, the collision defect is corrected | T1–T4 |
