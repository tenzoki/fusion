# Orchestrator Session — 260706-1851-orchestrator-session.md

**Directive:** Investigate why user-communicating agents (esp. the consultant) produce convoluted "Sprachmüll" in direct chat; user suspected the recent Kauderwelsch fix only touched written/long-form output.
**Mode:** custom (root-cause analysis → single-agent fix)
**Status:** Complete — 1 commit (f5151be)

## Work done

- Dispatched analyst (domain=knowledge) for root-cause / gap analysis across all user-facing agents.
- **Confirmed and narrowed:** only the **consultant** was affected. It classified its direct chat replies ("Conversation-mode answers") as long-form prose → `default-voice-en.yaml` (consulting register, 12–22 word sentence bands, expanded no-contraction forms). Analyst/shaper/investigator/playmaker/orchestrator were already clean.
- Recent Kauderwelsch commits (`2935d93` readability gate, `98cb40c` default-voice sharpening) improved the long-form profile but never touched the chat routing — user's suspicion correct. Misclassification stood since `f19daea` (31.05.).
- User approved the fix + Option 1 boundary rule ("surface decides the profile, never length").
- Dispatched coder: reworded `agents/consultant.md:166` (conversation answers → chat-voice; only `consult/*.md` stays long-form; surface-decides rule encoded incl. expanded-answers clause). Bumped `plugin.json` 3.24.0 → 3.24.1. `claude plugin validate .` passed.
- Committed `f5151be` under commit lock (2 files: consultant.md, plugin.json).

## Artifacts

- Report: `260706-1902-user-facing-agents-garbled-language-rootcause.md`
- Issue (closed): `260706-1902[c]-consultant-chat-misrouted-to-longform-voice.md`
- Decision (implemented, Option 1): `260706-1902[i]-consultant-chat-longform-boundary.md`

## Follow-up for the user

- Marketplace release (bump `marketplace.json`, push both repos) is a separate manual step — not done here.
- To pick up the new consultant behaviour locally: `/reload-plugins` or restart the session.

---

## Second topic — worktree/branch guard not firing + FUSION_PLUGIN_ROOT

**Trigger:** user recalled a rule excluding git worktrees; a prior search hadn't found it.

- Confirmed the rule exists (fusion plugin: `rules/git-branch-discipline.md` + `hooks/lib/git-branch-guard.ts` + `settings.json` deny belt). The prior search missed it because it looked at project/global config, not the plugin's shipped files at the install path.
- **Empirical probe** (`git checkout <nonexistent-ref>`) executed unblocked → guard not firing. Investigated as orchestrator (read-only).
- **Two independent defects found:**
  1. `hooks/hooks.json` PreToolUse matcher was `Write|Edit|MultiEdit|NotebookEdit` — **Bash missing** → guard.js never ran on git commands; the whole classifier was dead in production despite 48 passing unit tests (they test the pure function). Commit `4950ffa`'s message claimed Bash interception but never widened the matcher.
  2. `FUSION_PLUGIN_ROOT` unset in agent Bash calls — the SessionStart `$CLAUDE_ENV_FILE` mechanism didn't propagate. (Separate from the guard, which uses `CLAUDE_PLUGIN_ROOT`.)
- Corrected an earlier imprecision in my own diagnosis (I initially half-attributed the guard-off to FUSION_PLUGIN_ROOT; the actual cause is the matcher gap).
- Rejected the user's `~/.zshrc` idea (global, hardcoded path, breaks with multiple installs). Chose launcher-export instead.
- **Fix (coder, commit `dbf98f6`):** matcher widened to include Bash; `install.sh` generated launcher now `export FUSION_PLUGIN_ROOT="$FUSION_DIR"` before exec; new `hooks/lib/__tests__/hooks-wiring.test.ts` regression test; version 3.24.1 → 3.25.0. 91 hooks tests pass; `claude plugin validate` passed. guard.ts/dist needed no change (Bash dispatch already compiled since `c04bcec`).
- **Coderev:** ship-with-notes. Core fix correct + safe. Two non-blocking side-effects filed (running guard on every Bash): halt-escalation counter reset (`260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md`, medium) and events.jsonl flooding (`260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md`, low).
- Closed both original issues (`260707-0616[c]` ×2).

### Artifacts (second topic)

- Commit: `dbf98f6`
- Closed: `260707-0616[c]-guard-hook-not-wired-to-bash-matcher.md`, `260707-0616[c]-fusion-plugin-root-unset-in-agent-bash.md`
- Open (coderev side-effects, awaiting user decision): `260707-0750[o]-bash-allow-resets-block-counter-defeats-halt-escalation.md`, `260707-0751[o]-guard-allow-bash-events-flood-events-jsonl.md`

### Follow-up for the user (second topic)

- The fix ships to all users via `fusion --update` (it lives in `install.sh` + `hooks.json`). Your local session won't have the guard active until you relaunch via `fusion` after updating.
- End-to-end verification after relaunch: `git checkout __probe__` should be DENIED by the hook (fusion-policy message), not produce git's own pathspec error.
- Two side-effect issues remain open — decide whether to fix now or defer.

## Snapshot at Setup

- Working directory / workbench root: `/Users/kai/Dropbox/qboot/projects/F04-FUSION/codebase/fusion`
- This is the **fusion plugin source repo itself** (not a fusion-consuming project). `$FUSION_PLUGIN_ROOT` was unset; substituted `pwd` for the plugin root in all helper calls. The write guard self-disables here; the git branch-switch policy stays active.
- Plugin version (from local `.claude-plugin/plugin.json`): 3.24.0
- Git HEAD at start: `b5b0934`
- Open issues (`[o]`/`[p]`): 0
- Open plan steps (`[o]`/`[p]`): 0
- Open decisions (`[o]`): 0
- Guard state: no escalation, no churn (clean)
- Monitor binary: refreshed from `bin/monitor`
- Stylometric profiles: all four copied (default-voice + chat-voice, en + de)
- Concurrent-session check: none active; fresh marker written
- Interrupted session: none (`agentstate.yaml` absent)

## Domain detection

- commits touching workbench = 0
- analyses_count = 0
- issues_count = 0
- decisions_count = 0
- code_files (top + 1 subdir) = 3
- data_files (ontology/manifests/schemas/data) = 0
- **Resolved domain: `code`** (fallback branch — no heuristic condition matched)

## Circle snapshot

- Anticipated (`[a]`) = 0
- Active (`[t]`) = 0
- No portfolio hint printed (opt-in behaviour preserved — `circles/` empty).

## Coherence

(Section appended by reconciler in Phase 3 when a Turn loop runs.)
