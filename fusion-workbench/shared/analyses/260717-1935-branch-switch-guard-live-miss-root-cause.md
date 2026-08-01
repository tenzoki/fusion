# Analysis: branch-switch guard did not block a live `git switch` — root cause

**Date:** 2026-07-17 19:35
**Type:** Risk / Root-cause analysis
**Status:** Complete
**Requested by:** orchestrator (cross-cutting; NOT part of the active `260716-1847-workbench-umbau` Circle — origin is a guard defect, filed to `shared/` per the Origin Rule)

## Question

During an E2E verification run, a `git switch some-nonexistent-branch-for-guard-test`
issued via the Bash tool from the fusion repo root was **not** blocked by the fusion
branch-switch guard — git executed and returned `fatal: invalid reference` (exit 128).
CLAUDE.md promises the branch-switch policy "stays active even here [fusion's own repo]".
Why did the guard not intercept it? Real defect, stale build, or session-harness artifact?

## Scope

Read-only inspection of: `hooks/hooks.json`, `hooks/config.json`, `hooks/guard.ts`,
`hooks/dist/guard.js`, `hooks/lib/git-branch-guard.ts`, `hooks/dist/lib/git-branch-guard.js`,
`hooks/package.json`; git history of commits `dbf98f6` and `bf18fc0`; the live guard-state
under `fusion-workbench/.guard-state/{escalation.json,events.jsonl}`. Plus **two controlled
runtime executions** of the shipped `dist/guard.js` against fabricated hook input.

## Findings

### 1. The shipped code is correct — verified by direct execution

Running the shipped hook against the exact PreToolUse payload, with a clean env
(`FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE` both empty):

```
printf '{"tool_name":"Bash","tool_input":{"command":"git switch some-nonexistent-branch-for-guard-test"}}' | node hooks/dist/guard.js
→ {"decision":"block","reason":"fusion policy: agents never switch git branches autonomously ..."}
```

Control (`ls -la`) → `{}` (allow). The classifier logic is sound: `classifySegment`
(`git-branch-guard.ts:200-203`) returns `branch-switch` for any `git switch …`;
`classifyGitCommand:296-302` denies; `guardBashCommand` (`guard.ts:140-159`) emits the block.
The Bash path runs **before** the fusion self-detect write-guard stand-down
(`guard.ts:225-228` returns for `isBash` at line 225, ahead of the `isFusionPluginCwd()`
check at 234), so it is active even in the plugin's own repo — exactly as CLAUDE.md states.

### 2. Wiring is correct and current

- `hooks/hooks.json:19` PreToolUse matcher is `Write|Edit|MultiEdit|NotebookEdit|Bash`
  (the `Bash` token was added in `dbf98f6`, "wire branch/worktree guard to Bash").
- The loaded plugin (`FUSION_PLUGIN_ROOT=.../codebase/fusion`) and the `~/.fusion` install
  both carry the `…|Bash` matcher. (A stale `3.21.0` cache copy under
  `~/.claude/plugins/cache/` still has the pre-`dbf98f6` `…|NotebookEdit` PreToolUse matcher,
  but that copy is not the one loaded this session.)
- `dist/guard.js` contains the `isBash → guardBashCommand` branch (dist lines 152-174).
- `git status --short hooks/dist hooks/guard.ts hooks/lib/git-branch-guard.ts` is **clean** —
  the compiled dist matches committed source. **Not a stale-dist problem.**

### 3. The live miss left NO deny-path trace — proving the hook never ran for that call

The guard's deny path is **indelible**: `recordBlock` increments `consecutiveBlocks` and
saves `escalation.json`, and `emitEvent("guard_block", …)` appends to `events.jsonl`
(`guard.ts:140-157`). State captured at the start of this analysis:

- `escalation.json` `consecutiveBlocks: 0`, `lastBlockTimestamp: 2026-07-16T18:01:57Z`
  (the two most-recent `recentEvents` blocks are both dated **2026-07-16** — a prior session).
- `events.jsonl` had **zero** `guard_block` / override / `guard_error` entries for the
  live 2026-07-17 `git switch`.

Had the PreToolUse hook fired on the live command it would have (a) blocked git (git did NOT
run — it executed to exit 128) and (b) written those traces. Both are absent for that moment.
Conclusion: **the PreToolUse guard hook was not invoked by the harness for the live Bash call.**

(Corroboration that the deny path itself works: my controlled re-invocation of the identical
shipped `dist/guard.js` in step 1 produced exactly the expected mutations — a third
`recentEvents` entry with `filePath: "git switch some-nonexistent-branch-for-guard-test"`,
`consecutiveBlocks 0→1`, and a fresh `guard_block` event, all stamped 2026-07-17T17:33:40Z.
So the state changes prove the code path, and their **absence at the live moment** proves
non-invocation.)

The absence of guard events for *allowed* Bash calls is **not** evidence either way — the
allow path is deliberately silent (`guard.ts:161-175`, issues 260707-0750/0751). The proof of
non-firing rests solely on the missing *deny-path* traces for a command that must deny.

### 4. Asymmetry: PostToolUse Bash fired, PreToolUse Bash (for this call) did not

`events.jsonl` carries `tracker_record` / `"tool":"Bash"` entries (the PostToolUse `tracker.js`),
so the harness matched Bash for **PostToolUse** at least earlier in the day. Yet the PreToolUse
guard produced no deny trace for the live switch. Same matcher string, two different hook
registrations — one observably fired for Bash, the other observably did not for the offending
call. This asymmetry is the core of the anomaly and points at hook **dispatch/registration at
the harness level**, not at fusion's config (which is identical for both).

### Root-cause classification

| Candidate | Verdict | Evidence |
|---|---|---|
| (a) code/logic defect in shipped hook | **Ruled out** | `dist/guard.js` blocks the exact input; classifier correct at `git-branch-guard.ts:200-203` |
| (b) stale dist (source ok, build old) | **Ruled out** | `git status` clean; dist has the Bash branch; dist executes the block |
| (c) session-harness artifact — PreToolUse Bash hook not invoked for the live call | **Confirmed (for the observed miss)** | No deny-path side-effects at the live moment; controlled re-run of the same code produces them |
| (d) env override lifted the deny | **Ruled out** | override vars empty; no `git_branch_switch_override` advisory event exists |

## Implications

The shipped guard is correct, but the branch-switch choke-point is only as strong as the
harness's guarantee to invoke the PreToolUse hook **before every** Bash tool call. In this
session that guarantee did not hold for at least one Bash call. Whatever the harness-level
reason (hook-load timing at session start, a reload that re-registered PostToolUse but not
PreToolUse, per-mode dispatch differences, a verification-burst skip), the security property
"agents can never switch branches here" degraded to "usually can't" without any signal.

**Undetermined (honest limit):** *why* the harness skipped the PreToolUse invocation cannot be
established from static evidence — it needs runtime introspection of the harness's hook
dispatch. The candidate reasons above are **speculative** and labelled as such.

## Recommendations

1. **No fusion code change and no rebuild are warranted** for the observed miss — the shipped
   hook and wiring are correct (verified). For reference, the build command (if a rebuild is
   ever needed) is `npm run build` (→ `tsc`) run in `hooks/`.
2. **Settle the "why" with a live probe** (route to orchestrator/coder, not analyst): in the
   *same* running session, issue `git switch <nonexistent>` via the Bash tool and observe
   (i) whether git executes vs is blocked, and (ii) whether `escalation.json.consecutiveBlocks`
   increments + a `guard_block` event appends at that timestamp.
   - Blocked + traces present → the earlier miss was **transient** (hooks not yet loaded at that
     instant); mitigation is a load-order/readiness note, not a code fix.
   - git runs + no traces → PreToolUse Bash dispatch is **genuinely not wired** in this harness
     session; escalate as a harness/Claude-Code hook-reliability issue and consider a defense
     that does not depend on PreToolUse firing (e.g. a repo-level git hook or a launcher guard).
3. **State hygiene disclosure:** this diagnosis mutated live guard-state. My controlled
   `dist/guard.js` run bumped `consecutiveBlocks` to **1** and appended one `guard_block` event
   + one `recentEvents` entry (all at 2026-07-17T17:33:40Z). Halt fires at 3 consecutive blocks;
   current count 1 is well clear. If a clean baseline is wanted, reset via
   `node hooks/dist/clear-halt.js` (or let the next genuine allowed write reset the counter).

## Filed Issues

None filed by this analysis (analyst does not file). Recommendation below.

## Sources

- `hooks/hooks.json:19,30` (PreToolUse/PostToolUse matchers incl. `Bash`)
- `hooks/guard.ts:225-228` (isBash early branch, ahead of self-detect at 234), `:140-159` (deny path), `:161-175` (silent allow path)
- `hooks/lib/git-branch-guard.ts:200-203, 225-246, 267-305` (classifier)
- `hooks/dist/guard.js:152-174` (compiled Bash branch); `git status` clean on dist
- `git show dbf98f6` (Bash matcher added), `bf18fc0` (allow-path no longer mutates write-guard state)
- `fusion-workbench/.guard-state/escalation.json` (pre-diagnosis: consecutiveBlocks 0, lastBlock 2026-07-16)
- `fusion-workbench/.guard-state/events.jsonl` (`tracker_record`/Bash present; no live `guard_block` for the switch)
- Two controlled executions of `node hooks/dist/guard.js` (block on git switch, allow on ls)

## Open Questions

- [ ] Runtime probe (rec. 2) to determine whether the PreToolUse Bash miss is transient
      (load-timing) or persistent (dispatch not wired) in the current harness — the one check
      that disambiguates the harness reason static evidence cannot.
