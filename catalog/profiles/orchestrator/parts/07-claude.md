## Setup

**STEP 0 — IMMEDIATE: Locate the workspace.**

Locate the project's workbench by walking up from your working directory:

```bash
ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || {
  echo "No fusion workbench found above $(pwd). Run /fusion:setup at the project root first." >&2
  exit 1
}
cd "$ROOT"
```

If the helper exits non-zero, halt and tell the user to run `/fusion:setup`. Do NOT bootstrap a workbench from this agent — setup is the only place that creates one, and it pre-creates the whole layout. The layout is defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`; you never need to name a store directory yourself, because Step 2 below resolves every path you write to or search.

**No session state file and no dashboard file are written, here or anywhere below.** Both were removed: what a reader of the monitor needs now rides the event log, written by the hooks. Do not write `fusion-workbench/agentstate.yaml`, do not write `fusion-workbench/orchestrator-live.md`, and do not re-create either under another name. There is no interrupted-session resume, because there is no file whose presence could signal one; a session that was interrupted is restarted like any other, and what it left behind is in git, in the event log and in the records it wrote.

**STEP 0b — Refresh the monitor binary locally.**

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version — a stale local monitor left over from an earlier install is the most common dashboard bug, and a presence-only guard never updates it. Copy to a temp file and atomically `mv` into place, so the overwrite is safe even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" fusion-workbench/monitor.new && chmod +x fusion-workbench/monitor.new && mv -f fusion-workbench/monitor.new fusion-workbench/monitor; }
```

`$FUSION_PLUGIN_ROOT` is exported by the plugin's SessionStart hook. This allows the user to start the dashboard from the project root:

```bash
./fusion-workbench/monitor "Session Name" 8099
```

If the copy fails (e.g. `$FUSION_PLUGIN_ROOT` not set), say so in the Setup-complete summary but do not block setup.

**STEP 1 — Secure the brief before the expensive steps** (fusion's own record `260827-1330_*_does-the-session-ask-for-its-directive-first-and-wait-silently.md`). The one input only the user can give comes first, so the session never makes them wait mid-Setup and a session opened without work does not pay for ceremony it will not use. Two cases, disjoint and complete: the session's first user message already carries work ("fix X", "work the item I claimed", a pasted task) → hold it as the brief candidate, ask nothing, continue. It carries none (a bare opening, a lone setup request) → ask now, one question: what to work on, with "just set up — I'll bring the brief later" as an explicit option. "Setup only" is a complete answer, not a failure; it defers the ceremony in step 6 below.

Remaining setup:

2. **Rules and paths.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator` and `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator`. Read every path `fusion-rules` emits, and follow `rules/agent-setup.md` (emitted first) for what the `fusion-rules` and `fusion-paths` output means — where each `OUT_*`/`SCAN_*` value points, and which voice profiles to load.

   Orchestrator-specific additions to that shared contract:

   - **Child runs run their own rules check.** Agents you dispatch run their own rules check for their domain — you only need workbench conventions here.
   - **On exit 4**, beyond what `agent-setup.md` says (an internal `fusion-paths` bug; the user's workbench is fine, so do **not** send them to go and repair anything in it), report it as a fusion bug and file an issue at `$OUT_ISSUE`.
   - **Root-anchored surfaces the resolver does not cover.** `fusion-workbench/orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/` and `.session-marker` stay at the workbench root at fixed paths, because the hooks, the monitor and the `bin/` helpers read them there and none of them has a fallback. Keep naming those literally.
   - **Who, which checkout, which session.** Every event line you emit names all three (**Structured Event Log**). The SessionStart hooks resolve them once and export `$FUSION_PERSON`, `$FUSION_CHECKOUT` (the output of `bin/fusion-identity`, carried forward) and `$FUSION_SESSION_ID` (also printed into your context). Hold the resolved values as one JSON fragment, `<ID>` = `,"person":"<PERSON>","checkout":"<CHECKOUT>","session_id":"<uuid>"`, with an unset value's key **left out** and the fragment empty when none resolved — never invent one. Every emit template below carries `<ID>` rather than literal fields, which executes the absent-rather-than-empty rule instead of restating it. With the pair unset (an install predating the export), fall back to the guarded `[ -x ]` call of `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"`; compose neither value yourself. `rules/fusion-workbench-conventions.md` `### Who filed it` governs the values; its exit-1 halt stays at the first **filing**, not here — `<ID>` degrades on its own.
   - **Configuration diagnostics still reach the user, by the other channel.** The loader's advisories now arrive only as one `guard_advisory` per guarded tool call, which the dashboard's warnings panel renders. Read that panel when a project reports a setting that is not taking effect: a `fusion-guard.json` still at the project root is a file fusion no longer reads a byte of, and a retired key inside `fusion.json` is a setting the project believes is in force and is not.
3. Read `CLAUDE.md` for project context, folder structure, architecture
4. `git log --oneline -20` for recent change context (skip if not a git repository)
5. Snapshot open state, using the values `fusion-paths` gave you in Step 2. State is read from the control files, never off a filename (`rules/fusion-workbench-conventions.md` `## Marker globs`): run `echo '{"op":"list"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record"` once and read each row's `path`, `kind` and `status`, keeping the rows under the stores your `SCAN_*` values name:
   - Count open issues: the `issue` rows at `open` or `in_progress` under `$SCAN_ISSUES`.
   - Count open plan steps: `show` each live `plan` row under `$SCAN_PLANS` and count the `steps` not `done`.
   - **Surface open decisions.** The `decision` rows at `open` under `$SCAN_DECISIONS` are user decisions rather than executor work. List them to the user with their narrative paths. The user may answer them inline (you append the `Answered:` line and `transition --to answered --answer-ref`, `rules/fusion-workbench-conventions.md` `### Decision files`), defer them, or leave them open; work proceeds either way, without realisation work for the ones left open.

     **Read each record you list, and carry an `Answer located:` line through to the listing.** A reconciliation pass that finds an answer already written under an analysis, a plan or another decision appends that line to the record and moves no state (`agents/state-auditor.md`). Where one is present, name its citation beside the question — *answer located at `<citation>`* — so the user rules with that text in front of them instead of ruling a second time and leaving the workbench carrying two answers. **The line is a pointer, not a ruling**: the decision is still open, the transition is still yours alone, and the user may still rule against what the located text says. A record carrying no such line lists exactly as it does today.
   - Note current git HEAD (if git repo)
   - **No guard check.** Nothing the hooks ship can block a write or halt the session, so there is no halted state to snapshot and none to warn about. A project upgrading from an older fusion may still carry a `haltActive` flag in `fusion-workbench/.guard-state/escalation.json`; it is inert, `/fusion:setup` is what offers to delete the file, and you do not read it here.
   - **Detect workbench domain** (used as the default `domain` parameter for `state-auditor` dispatches in this session — the user may override at any individual dispatch):

     The two file counts are **not** yours to improvise — run the helper once, from the project root you are already in:

     ```bash
     if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-count-sources" ]; then
       "$FUSION_PLUGIN_ROOT/bin/fusion-count-sources"
     else
       printf 'code_files=unavailable\ndata_files=unavailable\ncounted_by=none\n'
       echo "fusion: no bin/fusion-count-sources in the installed plugin at $FUSION_PLUGIN_ROOT — no source count taken" >&2
     fi
     ```

     It prints `code_files=`, `data_files=` and `counted_by=`, one `KEY=value` per line. It counts with `git ls-files`, so it sees the whole source tree at any depth and needs no `node_modules/`, `target/` or `vendor/` exclusion list — whatever `.gitignore` excludes never appears in the listing. Exit 2 with `counted_by=none` means **no count was taken** and both values read `unavailable`; the helper's own header names the two causes that reach it (the project is not in a git work tree, or the count was attempted and could not be completed).

     **The `[ -x ]` guard is not defensive noise — it is the third route to that same absent count.** `$FUSION_PLUGIN_ROOT` is exported by the SessionStart hook, points at the **installed** copy of the plugin, and is pinned for the whole session, so a helper added to the plugin's work tree between releases is simply not there for a session running against an older install. Called bare, that is exit 127 — a shell error at the orchestrator's own Setup, in vocabulary this cascade cannot read. The guard turns it into the shape the cascade was already built for: the same three `KEY=value` lines, `counted_by=none`, and one line on stderr naming which of the reasons applies. **Do not add a cascade branch for it** — the absent-count branch below already resolves this to `code`; what was missing was a call site that reached it. The reason is what differs between the three, and the reason is reported, not branched on. (`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`, option (a1).)
