# Orchestrator Session — 260813-0806

**Directive:** (not yet stated — Setup only; awaiting the user's task)
**Mode:** (not yet resolved)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| Workspace | /Users/k1/Projects/productive/fusion |
| Plugin version | 8.1.0 |
| Source root | work tree (this is the fusion plugin repo) |
| Git HEAD at start | 1c2d555 |
| Turn budget | max_turns=5 (resolved) |
| Domain | code (code_files=124, data_files=21, counted_by=git-ls-files) |
| Active Circle | none — all OUT_* resolve into shared/ |
| Open defect records | 83 of 268 in shared/issues |
| Open plan/spec files | 1 of 8 in shared/planning |
| Open decision records | 8 of 43 in shared/decisions |
| Backlog entries | 1 in shared/backlog |
| Analyses | 13 |
| Circles | 1 anticipated, 10 closed, 1 superseded |
| Work queue | current — unaffiliated backlog (no Circle active, head names none) |
| Guard | OK, haltActive false (last block 2026-08-09, cleared same day) |
| Session marker | prior marker was stale (heartbeat 8.8 h old); fresh marker written |
| Portfolio hint | emitted — 1 anticipated Circle, /fusion:next offered |
| Interrupted session | none — no agentstate.yaml present |

## Churn (top 5, from bin/fusion-churn-rank; 451 entries, 223 absent, 2 noise, 10 ranked)

- 51 hooks/lib/__tests__/rules-emission-golden.test.ts
- 31 hooks/lib/domain-cascade.ts
- 27 hooks/lib/__tests__/domain-cascade.test.ts
- 24 README-hooks.md
- 24 hooks/lib/__tests__/provenance-header-lint.test.ts

## Setup notes

- Pre-v4 layout check: OLD=0, container layout intact.
- Monitor binary refreshed from the installed plugin.
- Stylometric profiles present: chat-voice-de.yaml (chat), default-voice-en.yaml (long-form writing).
- fusion-guard.json present at the project root; not overwritten.

## Decision answered — the playmaker maintains the backlog

**Record:** `shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`
**Answered by:** the user, in this session, at the Setup-to-scope gate.
**Chosen:** option 2 — give the playmaker the write, and give it wider than the record framed it.

The record asked only who writes `_p_` on a backlog entry and recommended declining option 2, on
the ground that the playmaker's no-write boundary was the reason the backlog job went to an
existing agent rather than to a seventeenth one. The user overrode that reasoning and widened the
scope in the same breath: the playmaker is to perform **full maintenance** of the backlog store.

Full maintenance, as the user defined it when asked:

- rename an entry's marker across the whole vocabulary — `_o_` to `_p_` to `_c_` to `_d_`;
- split an entry carrying several ideas into one entry per idea;
- merge duplicate entries;
- close entries that are no longer live.

Filing remains outside it. The conventions rule that no agent files a backlog entry
(`rules/fusion-workbench-conventions.md` `## Backlog entries`) was not put to the user and is not
answered here. An implementation that lets the playmaker maintain entries but not originate them
is consistent with both this answer and that rule; one that lets it file is not, and would need
its own decision.

**What this costs, stated rather than discovered later.** The playmaker's `## Scope` currently
forbids exactly these renames (`agents/playmaker.md:65`), its own description advertises the
no-write boundary, and `bin/fusion-paths` withholds `OUT_BACKLOG` from it by derivation from that
prompt. All three move together or the change is half-made. The boundary argument in the record is
not refuted by this answer, it is overruled: the user judged a store nobody can tend worse than an
agent whose write-narrowness has one exception. Whether that exception stays one is the thing to
watch on the next backlog-shaped request.

**Consequence for the record itself:** answered, not implemented. The realising work is the Circle
opened in this session; `_a_` to `_i_` follows that Circle's commits.
