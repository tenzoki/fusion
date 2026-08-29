# Reconciliation — Circle `260801-1244-guard-bash-inspection`

**Date:** 260801-2038
**Agent:** reconciler
**Domain:** code
**Verified against:** HEAD `9ab5a2a`, `git log 17730b8..HEAD` (16 commits), `npm test` in `hooks/` (753 passed, 16 files, exit 0)
**Status:** Complete

---

## Counts

| | Reviewed | Updated |
|---|---:|---:|
| Plans (incl. the shared spec) | 2 | 2 |
| Issues (Circle + shared stores) | 53 | 6 |
| Decisions (Circle + shared stores) | 9 | 3 |
| Reviews | 3 | 3 |
| New issues filed | — | 2 |

Nothing was verified from a file header. Every status change below cites a commit hash, a file:line, or a command output.

---

## Key findings

### 1. The plan was three-eighths marked and eight-eighths done

`260801-1253_*_plan-guard-bash-inspection.md` carried `[DONE]` on steps 1-3 and `**Status:** Draft`. All eight steps are complete. Every coder in the Circle was instructed not to edit the plan, to avoid concurrent-write races, and nothing caught the markers up afterwards — so the file understated the work by five steps for four hours.

Marked steps 4-8 `[DONE]` from commit evidence (`59a1cd9`, `5b8430c`, `85c043c`, `3806a49`, `e31c0f3`), set `**Status:** Complete`, ticked open questions Q1-Q4 with their resolutions, added a Reconciliation Log, renamed `_o_` → `_c_`.

### 2. Sixteen commits against eight planned steps

Eight commits are plan steps. Eight are not, and none is scope creep — each traces to a filed issue or to a recorded user gate. The full mapping is in the plan's Reconciliation Log. The shape of it:

- One out-of-band prompt edit found in `git status` (`a342e9b`, issue `260801-1410_*_unattributed-edit-to-ontocoder-prompt-during-session.md`).
- One gate answer applied (`7105f21` — the three widenings the user approved at Q3).
- Six defect fixes, of which **four closed pre-existing holes in the shipped git branch classifier** the Circle was only supposed to borrow a parser from (`1b4e828`, `3177e65`, `2a29c90`, `5d9bbcc`).
- Two of those fixes introduced regressions that the second review caught and a third Turn closed (`260801-1955_*_value-letter-truncation-loses-the-in-place-flag-for-perl-lpi.md`, `260801-1956_*_the-git-stash-row-reads-its-sub-subcommand-and-refs-as-written-paths.md`).

The Circle's actual reach is therefore wider than its Directive states. That is worth recording because the Circle record's Directive will be read later as the description of what changed, and it under-describes it.

### 3. Two shared issues were closed in fact and open on disk

- `260801-1156_*_bash-bypasses-the-protected-path-check-entirely.md` — the defect this whole Circle exists to close, still `_o_`. Closed, with the verification read from the code and the suite rather than from the Circle's own reports: `hooks/guard.ts:249` runs the mutation check inside `guardBashCommand` gated on `!isFusionPluginCwd()`, every command in the issue's own reproduction block blocks end to end (`guard-bash-integration.test.ts:77-153`), and the residual it predicted is stated in the shipped documentation.
- `260707-1006_*_pin-bash-allow-path-no-writeguard-side-effects-with-test.md` — open since 260707, asking for exactly the tmpdir subprocess harness this Circle built for its own purposes. Both its acceptance bullets are met at `guard-bash-integration.test.ts:301-343` and `:412-427`. Closed. Neither the Circle nor the reviews noticed they had satisfied it.

### 4. One issue is genuinely open, and it is the right one

`260801-1904_*_four-classifier-behaviours-are-deletable-with-a-green-suite.md` (Low, coderev, mutation-testing finding). Re-checked mechanically at HEAD rather than trusted: `rm -- -rf`, the command the issue names as discriminating for survivor 1, appears nowhere in the suite; the `normalize` stub at `bash-mutation-guard.test.ts:39-53` is still unpinned against `guard.ts`'s `normalizeToRelative` while its sibling `PROTECTED` fixture is pinned against `hooks/config.json`. Left `_o_` with that evidence appended.

Fourteen of the fifteen Circle issues are `_c_` with substantive `Resolved:` notes. Every note was spot-checked against the code for the claim it makes; all held. One (`260801-1821`) had its resolution narrative but not the `Resolved:` label the conventions ask for — label added, claim independently re-verified.

### 5. The spec's C5c criteria were all unticked; nine of ten are met

`260801-1122_*_spec-normative-consolidation.md` carried ten empty checkboxes for C5c. Nine ticked with per-criterion evidence. The tenth (`FUSION_ALLOW_RULES_WRITE`) is Q1's deliberate deferral to `260801-1244-guard-rules-write`, annotated as such rather than left ambiguous. The spec stays `_o_` — three of its four Circles are unbuilt.

The spec's own defect statement (line 249) and current-state bullet (line 609) are now historical, and the `hooks/guard.ts` line numbers they cite no longer point at what they describe. Recorded in the spec's Reconciliation Log rather than rewritten.

### 6. No decision warrants promotion to `_i_` — see the section below

### 7. Session bookkeeping froze at Turn 1

Three of four session-state surfaces stopped updating after the first Turn while three Turns ran. Filed as its own issue (below), because it is a fusion behaviour defect rather than a fact about this Circle.

---

## Decision records — the promotion question

Three decisions were walked `_o_` → `_a_` earlier in this session. **None is promoted to `_i_`.** All three keep `_a_`; each got a reconciliation note stating what was checked. Their stale `**Status:** open` header lines (left behind by the `_o_` → `_a_` rename) were corrected to `answered`.

**`260801-1020_*_may-any-fusion-writer-touch-rules` (D2)** is the one with a real case for promotion, and it fails on the facts. D2 answered *two* things: an environment-gated exemption, and project-level guard configuration. Neither exists. `FUSION_ALLOW_RULES_WRITE` returns no match across `hooks/`, `bin/`, `agents/`, `rules/`, `skills/`, `README-hooks.md`; `hooks/lib/config.ts:21-34` still walks up from the compiled hook's own directory and so still resolves only to the plugin's own `hooks/config.json`. What this Circle shipped is the *seam* the flag plugs into — `MutationOptions.exempt` at `bash-mutation-guard.ts:168`, consulted at `:1243` and `:1252`. A seam is preparation, not realisation.

What *did* change for D2 is the thing that matters: the objection recorded against it — that a flag on the `Edit` path is worth little while `mv` is unguarded — no longer holds. D2's answer is unblocked rather than undercut. That is a Grounding improvement, not an implementation.

**`260801-1020_*_provenance-header-on-rule-files` (D3)** — zero of the ten rule files carry a provenance header at HEAD, and no lint gate exists. The one pre-existing instance the record itself cites predates the decision. Notable and recorded on the record: `rules/protected-path-discipline.md`, the first rule file authored *after* this decision was answered, shipped without a header. That is the decay mode the record's own option 2 predicted, arriving early. The backfill target is now ten files, not nine.

**`260801-1020_*_where-does-normative-consistency-live` (D1)** — `agents/curator.md` does not exist; `agents/` holds the same sixteen prompts as at session start.

**The general argument against promoting on partial evidence.** `_i_` is terminal by the conventions — no `mv` back to `_a_`, and revisiting requires filing a superseding decision. Promoting a decision because the work that *unblocks* it landed would spend a one-way marker on a prerequisite and leave the store claiming three implemented decisions with nothing implementing them. The Circle implements the guard capability, not the curator, and the marker vocabulary exists precisely to keep those apart.

---

## New issues filed

Both to `shared/issues/` rather than into the Circle, per the Origin Rule: each was found next to this Circle's work, not caused by its Directive.

1. **`260801-2038_*_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`** — `fusion-workbench/tasklist.md` is the 260716 workbench-restructure queue, all nine entries `[x]` or `[deferred]`, `**Source plan:**` pointing at a pre-v4 bracket-marker path that resolves to nothing. Three sessions have run past it. Not the reconciler's to fix: `$TASKLIST` is taskplanner-owned. Three candidate resolutions in the issue; delete-at-closure and regenerate-at-activation compose rather than compete.

2. **`260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`** — `agentstate.yaml` frozen at `turn: 1 / commits: 4` against 16 commits; `_t_circle.md` still `**Status:** anticipated` with an empty `## Turn log` and `**Active session history:** (none yet)`; the orchestrator session history still reading `**Directive:** (not yet set — awaiting the user's task)` with `(no Turns yet)`. `orchestrator-events.jsonl` was the one surface that kept up, which is the diagnostic: it is written per action, the other three at Turn boundaries. Carries a cheap detection proposal (`progress.commits` against `git rev-list --count <git_head_at_start>..HEAD`).

---

## Found and left, with reasons

- **`260801-1410_*_unattributed-edit-to-ontocoder-prompt-during-session`** — stays `_o_`. Part 2 of its resolution is done (`a342e9b` committed the lines and removed the false grep-check claim, with the verification in the commit message). Parts 1 (authorship confirmed or denied) and 3 (the durable fix: the orchestrator diffing its working tree against its expected file set) are untouched and unowned. Evidence appended.
- **`260801-1020_*_guard-protects-rules-but-not-claude-rules`** — stays `_o_`, verified unaddressed: `.claude/rules/**` is still absent from `hooks/config.json:8-18`. This Circle widened *which tools* reach the protected-path check and did not touch *which paths* are in it. Untouched by design.
- **`260801-1244-guard-bash-inspection`** — `**Status:** anticipated`, empty Turn log, no session-history pointer. Outside the reconciler's write scope (Circle records are the orchestrator's at Phase 4). Reported, and covered by the second filed issue. **If it closes in this state its Turn log is permanently blank.**
- **`fusion-workbench/agentstate.yaml`**, **`260801-0936-orchestrator-session.md`** header fields — same reason. The Coherence section appended to that history file is the only cross-agent write this pass made, and it is append-only.
- **`fusion-workbench/tasklist.md`** — taskplanner-owned. Reported, filed, not touched.
- **The plan's `## Approach` module diagram** — now inaccurate (a third module, `hooks/lib/command-word.ts`, sits under both classifiers and is not on it). Left as drawn: the plan is a record of what was intended, and the divergence belongs in its Reconciliation Log, where it now is. The conceptrev review that evaluated that diagram is annotated to say the same.
- **The release ritual** — no `v5.8.0` tag (`git tag -l 'v5.*'` stops at `v5.7.0`), and `install.sh:27` still names `v5.7.0` as the current release. `claude plugin validate .` not re-run by this pass. The marketplace clone is not reachable from this repository and was not checked. All of it is the user's step per `CLAUDE.md`'s release process, so reported rather than filed.

---

## Verification commands run

```
git log --oneline 17730b8..HEAD                    # 16 commits
git show --stat <each>                             # file-level attribution
npm test          (in hooks/)                      # 753 passed, 16 files, exit 0
git status --short hooks/dist                      # empty AFTER the build → dist current at HEAD
git tag -l 'v5.*'                                  # stops at v5.7.0
grep -rn FUSION_ALLOW_RULES_WRITE hooks/ bin/ agents/ rules/ skills/ README-hooks.md   # no match
```

Plus targeted greps for `classifyBashMutation`, `isFusionPluginCwd`, `protected_path`, `resetBlockCounter`, `guard_allow`, `SubcommandDispatch`, `ShortFlagGrammar`, `SUBSTITUTION_FILLER`, `applyDirEffect`, `exempt`, and `rm -- -rf`; and direct reads of `guard-bash-integration.test.ts:283-458`, `hooks/config.json:8-18`, `hooks/package.json`, `.claude-plugin/plugin.json`.

---

## Coherence verdict

Computed and appended to `260801-0936-orchestrator-session.md` `## Coherence`. Aggregate: **coherent**. Rebalance recommendation: **none**. The reasoning, including what remains between this Circle and the session Directive, is in that section.
