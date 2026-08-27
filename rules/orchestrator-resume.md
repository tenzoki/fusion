# Orchestrator — the interrupted-session resume procedure

**Provenance:** Partitioned out of `agents/orchestrator.md` Setup STEP 1 per decision `shared/decisions/260827-1210_*_do-the-rare-orchestrator-flows-stay-in-every-sessions-context.md`.

Read when Setup STEP 1 finds `fusion-workbench/agentstate.yaml`. The invariants (what a resumed session inherits, the no-second-`turn_start` rule) stay in the prompt; this is the procedure.

- If the file **exists**: a prior session was interrupted. You MUST do all of the following before proceeding:
  1. **Schema check (v2.9.0).** If the saved `agentstate.yaml` contains the legacy fields `cycle:` or `goal:` (instead of the current `turn:` / `directive:`), the snapshot is from a pre-v2.9.0 session. The schema rename is a hard break (no soft alias); a v2.8.5 snapshot cannot be replayed against v2.9.0 fields. In this case:
     a. Tell the user: "schema mismatch detected — your interrupted session is from a pre-v2.9.0 fusion install. The schema rename is a hard break; the saved state cannot be replayed."
     b. Offer a single option in chat: **Restart** (delete `agentstate.yaml` and proceed with fresh setup).
     c. STOP and WAIT for the user's response.
     d. On Restart: `rm fusion-workbench/agentstate.yaml`, then continue to "Remaining setup" below.
     e. **Skip steps 2-6** — they are for valid resumable snapshots only.
  2. Read the file contents completely.
  3. **Derive how far the session actually got, before you summarise it.** The saved state carries no counters — it never carries a number that could be stale, because the fields that could be are gone (see **Persistent State File → Format**). What it carries is the anchor and the queue, and the two figures the user needs are read off records the interrupted session could not have frozen:

     ```bash
     A=$(sed -n 's/.*git_head_at_start: *"\([^"]*\)".*/\1/p' fusion-workbench/agentstate.yaml 2>/dev/null)
     C=$([ -n "$A" ] && git rev-list --count "$A"..HEAD 2>/dev/null)
     echo "commits=${C:-unavailable}"
     if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-events" ]; then
       "$FUSION_PLUGIN_ROOT/bin/fusion-events" turns
     else
       echo "turns=unavailable (this install predates bin/fusion-events)"
     fi
     ```

     The task tallies come from counting `work_queue` entries by `status` in the file you just read. A figure that could not be taken is reported as `unavailable`, never as `0`: an absent anchor is not a session with no commits. `git rev-list` prints nothing rather than failing when the anchor no longer resolves, so the commit count is read off its variable's emptiness and never off an exit code; the `if`/`else` is deliberate for the same reason, since a `&&`/`||` one-liner prints the fallback word after a helper that ran and reported a real non-zero. **The Turn count is `bin/fusion-events turns` and nothing else** — Phase 2 step 3 states the definition it implements. Its `turns=` line is the figure only when it also prints `scope=checkout`. Every other outcome is `unavailable` with its reason named: `scope=all-checkouts` (the helper could not identify this checkout and counted every checkout in the merged log — report that reason and **never the number**, which is the whole-file count this call exists to abolish), no `turns=` line at all (exit 3 or 4), or an absent helper. `turns=0` is a real figure: the log was read and the session stopped before its first Turn.
  4. Present the saved state to the user as a summary:
     - Session Directive and mode
     - How far the session got — the Turn count and commit count derived in step 3, and tasks completed vs total from `work_queue`
     - Which task was active when the session stopped
     - Which tasks remain (with their status)
     - The plan file and user directive, if any
  5. Ask the user what to do, in chat — do NOT skip this:
     Lead the presentation with one line of the state — "Interrupted <when>: Turn <N>, <X> of <Y> tasks done, last commit <subject>" — and put the derived detail under a trailing Details block, after the question, not before it.

     - **Continue (recommended)** — resume from where the prior session left off. Use the saved work queue, skip already-completed tasks, pick up from the next unfinished task. **What a resumed session inherits** below says what that means for the Turn it re-enters.
     - **Restart** — discard prior state and start fresh. Delete `agentstate.yaml` and proceed with normal setup.
     - **Modify** — the user provides updated instructions or changes scope before resuming.
  6. **STOP and WAIT for the user's response. Do not proceed until the user has answered.**

