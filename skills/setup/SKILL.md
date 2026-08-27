---
description: Run the mandatory orchestrator Setup procedure — workspace, dashboard, interrupted-session check, rules, history, event log
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Orchestrator Setup

The active agent MUST be `fusion:orchestrator`. This skill inlines the full Setup procedure so it cannot be skipped.

Execute every step below in order. Do not begin the user's task work until Setup is complete and any Step 1 decision has been resolved.

**A path into a file the plugin ships carries the `$FUSION_SRC` root.** Where a step below sends you to an agent prompt or another skill's body, open it at that root — nothing the plugin ships exists at a consuming project's root, so a bare `agents/…` or `skills/…` path resolves to nothing there. Resolve the root once, before the first step that cites one:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
else
  FUSION_SRC=""
fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

Hold the printed path and use it wherever a step below writes `$FUSION_SRC/…`. Each shell call gets a fresh shell, so every executable check in this file calls the helper again rather than relying on the variable surviving.

**`UNRESOLVED` is not a path, and no step below reads through it.** With `FUSION_PLUGIN_ROOT` unset the variable is empty and every `$FUSION_SRC/…` citation resolves from `/`; the check is this print, once (Step 0e re-resolves the root itself). When it prints `UNRESOLVED`, name it in the Setup-complete summary, say which steps citing a plugin file were not run, and tell the user to restart the session so the SessionStart hook exports the variable. Do not improvise the content of a section you could not open.
**Why the branch, why it is a call, and why the call is guarded:** `bin/fusion-source-root`'s own header.

**What the root does *not* cover.** Read shipped text → `$FUSION_SRC`; run a `bin/` helper or copy an installed asset (`bin/monitor`, `stilwerk/`, `templates/`, `.claude-plugin/plugin.json`, Step 0d's first profile copy included) → `$FUSION_PLUGIN_ROOT`. **One named exception:** Step 0e reads and refreshes the four stylometric profiles at the source root, decided for that comparison alone (decision `260820-2324`). Whether the work-tree preference reaches helper resolution is part (c) of decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention…` and is **unanswered**; do not assume it.

## CRITICAL — Setup is the ONLY place a workbench is created

Setup is the single point where a fusion workbench is bootstrapped. The workbench lands at `./fusion-workbench/` relative to the directory `pwd` reports when this skill runs. After setup completes, every subsequent fusion agent and hook locates the workbench by walking *upward* from its working directory until it finds the marker file `fusion-workbench/.fusion-setup` (written in Step 0 below). Without that marker, agents halt and hooks no-op — fusion does NOT bootstrap a workbench in any directory other than the one setup ran in.

This makes setup deliberately strict: run it once, at the project root you want fusion to govern. If you accidentally run setup in a subfolder, the result is two independent fusion projects — one at the subfolder and one at the parent (if it had setup before). Walk up to the intended root before running setup.

**Never** prepend `cd <something>` to the commands below. Run them exactly as written so the workbench lands at `./fusion-workbench/` relative to the directory the user invoked setup from.

## Step 0 — Confirm and create workspace

```bash
pwd
```

Note the path. The workbench will be created here.

### Pre-v4 layout check (CRITICAL — refuse, do not migrate)

**This runs before the `mkdir` below, and the order is the whole point.** A workbench created before v4 keeps its artifacts in type folders at the workbench root (`planning/`, `issues/`, `decisions/`, …); the container layout puts them in `shared/`. Setup does **not** migrate — `/fusion:migrate` does. Setup's job here is to notice and stop.

Running the `mkdir` first splits the workbench across two layouts and leaves every pre-v4 artifact unreachable; the marker write further down overwrites `plugin_version`.

Detection is by artifact presence, not by version — a workbench with no out-of-format artifacts has nothing to migrate regardless of which version created it. It fires on two shapes: a pre-v4 type-folder / flat-Circle layout, **and** a container-layout workbench whose filenames still carry the old bracket-form state marker (`…[o]-….md`) instead of the underscore form. Both route to `/fusion:migrate`, which brings the workbench fully to the current format. Read-only:

**The bracket-marker probe walks the two trees `/fusion:migrate` converts, and nothing else — do not widen it.** It anchors its `find` at `shared/` (any depth) and `circles/` (from depth 2), which is the same candidate list migrate's reformat pass renames (`skills/migrate/SKILL.md:54,87`). A live markered artifact has nowhere else to be: the workbench root holds fixed-name session surfaces and `stilwerk/` fixed-name configuration, and `archive/`, `stashes/` and `.migration-v2-backup/` hold content deliberately taken out of circulation. A frozen artifact keeps the filename it carried when it was frozen, so a workbench that ever archived pre-underscore content carries bracket markers forever, and not one of them is live. A probe reaching them reads an unconverted workbench, refuses Setup permanently, and routes the user to a migration that reports nothing to do — a deadlock rather than a mere false positive. The principle underneath: this check exists to catch artifacts that would become *unreachable* when the new store is created beside them, and nothing outside the two live trees is on any agent's search path to begin with.

**The bracket-marker probe matches the marker shape, not any bracket pair.** The `find` name test `'*[[]*[]]*.md'` is only the cheap prefilter; the `grep` behind it keeps a file only when its basename carries the actual old marker form `[x]-` with `x` one of `oatcibspd` — exactly the set `/fusion:migrate`'s rename pass converts (`s/\[([oatcibspd])\]-/_\1_/g`, `skills/migrate/SKILL.md` Step 4). The detector must only look for things the executor can remove: a name like `notes [draft].md` carries a bracket pair no migration will ever rename, and flagging it would refuse Setup permanently while `/fusion:migrate` correctly reports nothing to do — the same deadlock the tree bound above closes, arrived at from the shape side.

All three probes are now bounded by construction, and none may be given a path exception.

```bash
WB=./fusion-workbench; OLD=0; if [ -d "$WB" ]; then for d in planning issues decisions history analyses investigations consult memos codereview ontoreview conceptreview; do [ -d "$WB/$d" ] && { echo "  $d/ (root type folder)"; OLD=1; }; done; while IFS= read -r f; do printf '%s' "$(basename "$f" .md)" | grep -qE '^[0-9]{6}-[0-9]{4}\[[a-z]\]' && { echo "  circles/$(basename "$f") (Circle file in the old marker format)"; OLD=1; }; done < <(find "$WB/circles" -mindepth 1 -maxdepth 1 -name '*.md' 2>/dev/null); BM="$({ [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' | head -1)"; [ -n "$BM" ] && { echo "  files with a bracket marker in the name (the format before the underscore form), e.g. ${BM#"$WB"/}"; OLD=1; }; fi; echo "OLD=$OLD"
```

- **`OLD=0`** — nothing pre-v4 here. Continue with the `mkdir` below. Say nothing about it.
- **`OLD=1`** — **stop Setup here.** Do not run the `mkdir`. Do not write the marker. Do not proceed to any later step. Tell the user, in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), following `rules/user-facing-output.md` and the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Show the detected entries above the message so the user sees what was found. The message is specified here in English; render it in that language:

  > **Setup stopped.** This workbench still carries the pre-v4 layout: the artifacts listed above sit in root type folders instead of in `shared/`. Setup does not create the new structure beside them, because the workbench would then be spread across two layouts and no search would reach the old entries.
  >
  > **Next step:** run `/fusion:migrate`, then start `/fusion:setup` again. The migration shows what it will move and asks before moving anything.

  This is a refusal, not a question — there is nothing for the user to choose here, and `AskUserQuestion` would imply otherwise. `/fusion:migrate` is where the choice lives.

Only when `OLD=0`:

```bash
mkdir -p ./fusion-workbench/circles ./fusion-workbench/shared/planning ./fusion-workbench/shared/issues ./fusion-workbench/shared/decisions ./fusion-workbench/shared/analyses ./fusion-workbench/shared/reviews ./fusion-workbench/shared/investigations ./fusion-workbench/shared/consult ./fusion-workbench/shared/history ./fusion-workbench/shared/memos ./fusion-workbench/shared/backlog ./fusion-workbench/archive ./fusion-workbench/.guard-state
```

This is the Circle-container layout defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. Three things about it are worth knowing here:

- **A Circle is a directory, not a file.** `circles/` starts empty; each unit of work later gets `circles/<YYMMDD-HHMM>-<slug>/` with its own `planning/`, `issues/`, `decisions/`, `history/`, `reviews/` and `analyses/`. Setup does not create any Circle.
- **`shared/` is the home for everything with no Circle affiliation** — the Origin Rule's "unknown origin means shared". `investigations/`, `consult/`, `memos/` and `backlog/` exist only there.
- **The root-anchored surfaces stay at the root.** `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl` and `.guard-state/` are read at fixed root-relative paths by `hooks/tracker.ts:33-36` and `bin/monitor:72-75`; `.commit-lock/` by `bin/fusion-commit-lock` and `.session-marker` by `bin/fusion-session-mark`. Never create them anywhere else; none of these consumers has a fallback path. Only `.guard-state/` is pre-created above — the rest appear when their consumer first writes them. The full list is in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`.

Write the setup marker (the file every agent and hook looks for to confirm fusion is set up here) only when it is missing or carries a `plugin_version` other than the shipped one, and only when that shipped version can be read at all; `rules/workbench-tracking.md` `## The setup marker is written on change, not on every run` says why:

```bash
M=./fusion-workbench/.fusion-setup
V="$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
[ -n "$V" ] || { echo "marker-version-unresolved"; exit 0; }
[ -f "$M" ] && grep -qF "\"plugin_version\":\"$V\"" "$M" || printf '{"setup_at":"%s","plugin_version":"%s"}\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$V" > "$M"
```

**`marker-version-unresolved` says the version could not be read, which is not the same as the version matching.** The version now decides whether anything is written, so an unreadable one leaves no comparison to make: the block writes nothing and prints that token. Setup is not blocked, the same way Steps 0b, 0d and 0f do not block. A marker is never written with an empty version, because the next run's comparison cannot tell an empty one apart from a real one, and the version that produced this workbench would be gone with nothing else recording it. Report the token in the Setup-complete summary together with whichever of the two outcomes followed: an existing marker was left exactly as it stands, or the workbench has no marker at all and is therefore not set up here until the session is restarted and Setup run again.

Obtain current time: `date +%H:%M`.

Overwrite `./fusion-workbench/orchestrator-live.md` with (substitute `<HH:MM>`):

```markdown
# Orchestrator — Live

**Turn:** --/-- | **Tasks:** --/-- | **Commits:** 0 | **Errors:** 0
**Started:** <HH:MM> | **Session:** Initializing | **Guard:** checking...

## Current
  [SETUP] orchestrator -> New session starting...
```

This makes the monitor show the new session immediately, even while the rest of Setup runs.

## Step 0b — Refresh the monitor binary locally

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version. Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor.new && chmod +x ./fusion-workbench/monitor.new && mv -f ./fusion-workbench/monitor.new ./fusion-workbench/monitor && P=./fusion-workbench/.asset-provenance && { [ -f "$P" ] || : > "$P"; } && h="$(shasum -a 256 ./fusion-workbench/monitor | cut -c1-64)" && { grep -q "^$h  monitor$" "$P" || { grep -v "  monitor$" "$P" > "$P.t"; printf '%s  monitor\n' "$h" >> "$P.t"; mv -f "$P.t" "$P"; }; }; }
```

The tail of that command **stamps** the copy in `./fusion-workbench/.asset-provenance` — the record Step 0d writes and Step 0e reads; its shape and its reason are stated in Step 0d.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.


## Step 0c — Concurrent-session check (advisory)

Setup checks for an active session marker and warns the user.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" check
```

The helper prints `running`, `stale`, or `none` on stdout, and (when running/stale) the marker contents on stderr.

- **`none` or `stale`:** no active session detected. Write a fresh marker for this orchestrator session and continue:
  ```bash
  "$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator
  ```
- **`running`:** another fusion orchestrator session has updated the marker within the last 10 minutes. **Warn the user** with the marker contents (start time, cwd, agent label) and use `AskUserQuestion` to offer:
  - **Proceed anyway** — overwrite the marker for this session. Document the risk: parallel orchestrators may corrupt workbench state. The user takes responsibility for sequencing.
  - **Abort** — stop Setup. Tell the user where the other session appears to be running.

  Do not silently overwrite. The whole point of this step is the warning.

Then, who else has been here:

```bash
E="$FUSION_PLUGIN_ROOT/bin/fusion-events"
if [ -x "$E" ]; then "$E" presence; echo "exit=$?"; else echo "presence=unread"; fi
```

**Both counts `0`: print nothing at all**, as `/fusion:next` does for an empty backlog. Otherwise one line in the project's chat language: `other_people` and `other_checkouts` apart (*"1 other person, 1 further checkout of your own"*), each `party=`'s person, Circle and time, the `window_days` window, and `scope=pulled`: only what this checkout has pulled, so a session started elsewhere since the last fetch is invisible, not absent. **A failed read says so and never prints a zero**: `exit=3` — presence could not be read, this checkout has no identifier; `exit=4` — `other_checkouts`, another person not tellable from a further checkout of your own; `presence=unread` — not read, this install lacks the helper. The rest: that helper's header.

## Step 0d — Ensure stylometric profiles are present locally

Two profile families seed the project's user-facing voice, both at `./fusion-workbench/stilwerk/` so each project can edit them without affecting other projects or the plugin:

- `default-voice-{en,de}.yaml` — the long-form **writing** profile (cadence, vocabulary, structural patterns for narrative outputs: session summaries, consultant reports, analysis reports, spec/plan prose).
- `chat-voice-{en,de}.yaml` — the short-form **chat** profile (anti-pattern blacklist plus a minimal terse-and-direct whitelist for gate prompts, AskUserQuestion text, status reports, chat replies).

```bash
mkdir -p ./fusion-workbench/stilwerk
PROV=./fusion-workbench/.asset-provenance; [ -f "$PROV" ] || : > "$PROV"
for rel in stilwerk/default-voice-en.yaml stilwerk/default-voice-de.yaml stilwerk/chat-voice-en.yaml stilwerk/chat-voice-de.yaml; do
  [ -f "./fusion-workbench/$rel" ] && continue
  cp "$FUSION_PLUGIN_ROOT/$rel" "./fusion-workbench/$rel" || continue
  echo "${rel#stilwerk/} copied"
  h="$(shasum -a 256 "./fusion-workbench/$rel" | cut -c1-64)"
  grep -v "  $rel$" "$PROV" > "$PROV.t"; printf '%s  %s\n' "$h" "$rel" >> "$PROV.t"; mv -f "$PROV.t" "$PROV"
done
```

The copy is idempotent — an existing file is left untouched, so any project-local edits to the profiles survive subsequent setups.

**What the loop adds to the copy is the stamp**, the third input the next step needs (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). `./fusion-workbench/.asset-provenance` holds one line per asset in the shape `shasum -a 256` prints: the checksum, two spaces, the asset's path relative to the workbench. Only a file this run actually copied is stamped here; a file that was already present is deliberately left unstamped.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

## Step 0e — Compare the copied assets against the ones this version ships

This step reads the record Step 0d writes, classifies each asset, and asks **at most one question**. It resolves the shipped root itself, into `$SRC` (`$FUSION_SRC` was assigned in another shell and is empty here); a root that resolves to nothing skips the step: ask nothing, change nothing, and say in the Done report that the assets were not compared. Every block in this step begins with this prelude, pasted in because each Bash call is a fresh shell:

```bash
PROV=./fusion-workbench/.asset-provenance
SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
```

Read-only classification:

```bash
for rel in stilwerk/default-voice-en.yaml stilwerk/default-voice-de.yaml stilwerk/chat-voice-en.yaml stilwerk/chat-voice-de.yaml; do
  d="./fusion-workbench/$rel"; g="$SRC/$rel"
  [ -f "$d" ] || { echo "$rel case5-missing-local"; continue; }
  [ -f "$g" ] || { echo "$rel case6-missing-shipped"; continue; }
  P="$(shasum -a 256 "$d" | cut -c1-64)"; S="$(shasum -a 256 "$g" | cut -c1-64)"
  R="$(grep "  $rel$" "$PROV" 2>/dev/null | tail -1 | cut -c1-64)"
  if   [ "$P" = "$S" ]; then echo "$rel case1-equal"
  elif [ -z "$R" ];     then echo "$rel case0-unclassifiable"
  elif [ "$P" = "$R" ]; then echo "$rel case2-stale"
  elif [ "$S" = "$R" ]; then echo "$rel case3-adapted"
  else                       echo "$rel case4-conflict"; fi
done
```

**Eight tokens; the precedence is the branch order above.** `source-root-unresolved` ends the block before any file is classified and is reported, not enumerated. The other seven:

1. **`case1-equal`** — the project's copy *is* the shipped copy. Report nothing. Stamp it.
2. **`case0-unclassifiable`** — the copies differ and no checksum was recorded (every pre-existing workbench). Name the file, say that fusion **cannot tell an adaptation from a stale copy** for it, and carry that warning into the offer. Do not guess.
3. **`case2-stale`** — the project's copy is what it was given and the shipped file moved. Offer the replace.
4. **`case3-adapted`** — the project edited its copy and the shipped file did not move. Say nothing; touch nothing.
5. **`case4-conflict`** — both moved. Name it, offer no replace, neither change nor stamp it (so it is named on every run until resolved by hand), and say the two ways out: copy the shipped file over the project's (case 1 next run), or keep the project's and delete its line from `$PROV` (case 0 next run). A declined offer lands here the next time the plugin moves.
6. **`case5-missing-local`** — the project has no copy (Step 0d's copy failed or was skipped), so `bin/fusion-rules` emits no path for that profile. Name it in the Done report with that consequence; presence is Step 0d's job.
7. **`case6-missing-shipped`** — the resolved root has no copy: a broken install or an unexpected root. Name it in the Done report as that; the project's file is neither changed nor stamped.

**One `AskUserQuestion` covers every file in cases 0 and 2 together — never one per file, and none when that set is empty.** Setup asks one question on a normal run (Step 0g) and that is the budget. Ask in the project's chat language per `rules/fusion-workbench-conventions.md` `## Project language`, following `rules/user-facing-output.md` and the chat profile. Specified here in English:

> These workbench files differ from the ones this fusion version ships: *&lt;list&gt;*. Replace them with the shipped copies? Any edits you made to those files are lost. For *&lt;the case-0 files&gt;* fusion has no record of what it originally copied, so it cannot tell whether you adapted the file or the plugin moved on.

Two options: **"Replace them"** and **"Keep mine"**.

**Both answers end with a stamp, which is what stops the question repeating.** On "replace", copy the shipped file over the project's and stamp **the destination**, so a failed copy is left unstamped and offered again next run. On "keep mine", change no file and stamp anyway. One block, after the prelude: `MODE=replace` over the files to replace, then `MODE=stamp` over the case-1 files plus every kept file the question covered:

```bash
[ -f "$PROV" ] || : > "$PROV"
for rel in <rel...>; do
  if [ "$MODE" = replace ]; then
    cp "$SRC/$rel" "./fusion-workbench/$rel" || { echo "$rel replace-failed"; continue; }
    h="$(shasum -a 256 "./fusion-workbench/$rel" | cut -c1-64)"
  else
    h="$(shasum -a 256 "$SRC/$rel" | cut -c1-64)"
    grep -q "^$h  $rel$" "$PROV" && continue
  fi
  grep -v "  $rel$" "$PROV" > "$PROV.t"; printf '%s  %s\n' "$h" "$rel" >> "$PROV.t"; mv -f "$PROV.t" "$PROV"
done
```

Report in the Done report: which files were replaced, printed `replace-failed`, were kept, were conflicts or were missing on either side, and, on `source-root-unresolved`, that the assets were not compared. When every file came back `case1-equal`, say nothing about this step.

## Step 0f — Ensure the project configuration file is present locally

fusion reads `./fusion.json` at the project root and merges it over its own built-in defaults, so this file is where a project sets how many Turns the orchestrator may run (`hooks/lib/config.ts`; the seeded template declares nothing and therefore inherits everything). It belongs in version control: every change to how long a fusion session may run against the project has to show up in a diff.

It lands at the project root, beside `fusion-workbench/` rather than inside it, in the directory `pwd` reported in Step 0. The "never prepend `cd`" rule at the top of this skill is what keeps it there.

First check whether the project already has one. This is read-only and always allowed:

```bash
[ -f ./fusion.json ] && echo "fusion.json present" || echo "fusion.json absent"
```

- **`present`** — nothing to do; continue to Step 1. Do not run the copy anyway: the template declares nothing, so copying it over a project's filled-in file would replace a real setting with an empty inheritance.
- **`absent`** — seed the template. The copy is idempotent and never overwrites:

  ```bash
  [ -f ./fusion.json ] || { cp "$FUSION_PLUGIN_ROOT/templates/fusion.json" ./fusion.json && echo "fusion.json template copied — inherits fusion's own Turn budget until you edit it"; }
  ```

This step does nothing about a leftover `fusion-guard.json`. Naming that file is the configuration loader's job: it names the file, names the Turn-budget key and says where that key belongs now, once per guarded tool call until the file is deleted. Do not read the old file here, and do not offer to move anything out of it.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup. An absent `fusion.json` costs the project one thing and only one: the orchestrator runs on fusion's own Turn budget rather than a number the project chose.

## Step 0g — Offer to seed the project's permission file

A fresh consuming project has no permission source of its own, so every `Write`, every `Edit` and every non-sandboxed shell call a fusion session makes raises an approval dialog. This step offers to write the file that stops that. It is the only step in Setup that asks the user for a decision on a normal run, and it asks **once**.

### 1. Ask

One `AskUserQuestion`, in the project's chat language, naming the file and what the setting does in plain words rather than behind the term:

> fusion writes `.claude/settings.local.json` in this project so future sessions run without asking you to approve each tool. That setting is `bypassPermissions`: Claude Code stops prompting for file writes, edits and shell commands in this project. It still asks before catastrophic operations such as `rm -rf /`. Write it?

Two options. **"Yes, write it" is the default and the recommended choice.** "No, keep the prompts" is the other; nothing is written and Setup continues.

Read `.claude/settings.local.json` first if it exists. **A file that does not parse as JSON gets no question and no write**: report it in §3 as a file the user fixes by hand, naming the path, and continue Setup. Otherwise note `permissions.defaultMode`. Already `bypassPermissions` — skip the question, still union the `allow` list (§2, item 3), and report the union (§3). Any **other** value — the question must name it and say plainly what happens to it: *this project currently sets `defaultMode: "<existing>"`; saying yes replaces it.* A replacement the question did not name is not a replacement the user consented to.

### 2. On "yes", write it

Target: `.claude/settings.local.json` in `pwd` — the project root Step 0 reported. Merge into any existing file; never overwrite one.

Desired contents:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": ["Bash", "Read", "Edit", "Write", "WebFetch", "WebSearch", "Agent", "Glob", "Grep", "NotebookEdit"]
  }
}
```

**Bare tool names only** — no scoped path form may be written here under any wording, because none of them match.

1. `mkdir -p .claude`.
2. Read `.claude/settings.local.json` if present. If absent, create it with the JSON above.
3. If present, parse it and union the `allow` list with the values above, **preserving every existing entry — only add, never remove**; that guarantee is about the `allow` list and reaches no other field. Set `permissions.defaultMode` to `"bypassPermissions"` only when the file carries no `defaultMode`, or when the question named the existing value the user agreed to replace — a scalar is replaced, not merged, so it is never set silently. Write back with two-space indentation and a trailing newline.
4. Ensure the file is gitignored. Check `.gitignore` for either `.claude/settings.local.json` or `.claude/`; if neither matches, append `.claude/settings.local.json` to `.gitignore`. This step is not optional — a seeded local settings file that lands in a commit is a worse outcome than an unseeded one.

**Never** write this file outside `pwd`, never into a subfolder, and never touch `.claude/settings.json`, which is the shared checked-in file and not this one.

### 3. Report either way, in the Done report

- **Wrote it:** name the path, say the permission change takes effect **on the next session** — Claude Code reads permission settings only at startup, so this session still prompts — and say whether `.gitignore` was modified. If a `defaultMode` was replaced, name the old value beside the new one. Do not claim the current session is now unlocked.
- **Declined:** say plainly that per-tool approval prompts stay on for this project, and that Setup can seed the file on a later run.

If the project already had `defaultMode: "bypassPermissions"`, say so, say the `allow` list was unioned, and skip the question — there is nothing to decide. Any other existing `defaultMode` survives the run untouched unless the user answered yes to the question that named it.
- **Malformed:** name the path, say the file did not parse and was left exactly as it was, and that the offer returns once it parses.

## Step 0h — Declare the union merge driver for the event log

`fusion-workbench/orchestrator-events.jsonl` is the one workbench file every checkout appends to, so git's default text merge turns two checkouts' sessions into a conflict nobody should resolve by hand. This step asks git whether a merge driver already applies there and declares `merge=union` only where none does. `rules/workbench-tracking.md` `## The event log carries a union merge driver` holds the reasoning, including why the question is `git check-attr` and never a text search of `.gitattributes`; do not restate it here.

Like Steps 0f and 0g, the write lands at the project root: `./.gitattributes` in the directory `pwd` reported in Step 0, outside `fusion-workbench/` and never in a subfolder. **This step asks the user nothing**, which is what keeps Step 0g the only step that asks on a normal run.

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ]; then
  D=$(git check-attr merge -- fusion-workbench/orchestrator-events.jsonl | sed 's/.*: //')
  case "$D" in
    union) echo "gitattributes: a union merge driver already applies — nothing written" ;;
    unspecified)
      [ -s ./.gitattributes ] && [ -n "$(tail -c1 ./.gitattributes)" ] && printf '\n' >> ./.gitattributes
      printf '# fusion: the orchestrator event log is append-only and two checkouts both append to it.\nfusion-workbench/orchestrator-events.jsonl merge=union\n' >> ./.gitattributes
      echo "gitattributes: union merge driver written to $(pwd)/.gitattributes" ;;
    set) echo "gitattributes: left alone — this path takes git's default text merge (a bare 'merge'), the case this step exists to prevent; Setup does not overrule it" ;;
    unset) echo "gitattributes: left alone — merging is switched off for this path ('-merge')" ;;
    *) echo "gitattributes: left alone — this path already has merge driver '$D'" ;;
  esac
else
  echo "gitattributes: not a git work tree — nothing written"
fi
```

## Step 0i — This checkout's identity, and a Circle it never activated

A `_t_` Circle record travels between checkouts and `.active-circle` does not (`rules/workbench-tracking.md`), so a clone taken mid-Circle holds an active record with no pointer: `MISSING-POINTER`, the condition `agents/playmaker.md` names and `/fusion:next` renders. A pointer deleted by hand is that same state, same report, same offer.

It **asks only in that condition**, which is not a normal run, so Step 0g stays the only step that asks on one.

**This checkout's identity is read here, and the read mints it.** `bin/fusion-identity` prints `PERSON=` and `CHECKOUT=`, minting `fusion-workbench/.checkout-id` where none exists. Its header documents the six exit codes and `rules/fusion-workbench-conventions.md` `### Who filed it` what each obliges; restate neither. Report both in the Done report, or a non-zero exit's reason unchanged. Hold the identity fragment `<ID>` as `$FUSION_SRC/agents/orchestrator.md` Setup step 2 defines it, both bullets: the second extends it with the `session_id` a SessionStart hook printed into your context, and no line means no key.

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-identity"
```

```bash
[ -f ./fusion-workbench/.active-circle ] && echo pointer-present
find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_t_circle.md' 2>/dev/null
```

The count is taken unconditionally; the pointer gates the offer, not the detection.

- **No path, or one path with `pointer-present`** — report nothing, ask nothing: a pointer is present, whichever Circle it names.
- **One path and no `pointer-present`** — the directory name is its second-to-last segment. Read the record's first `## Directive` line, then one `AskUserQuestion` in the project's chat language: name both, say the Circle is active in the project but not in this checkout, and offer *Activate it here* / *Leave it inactive*. Read the record's `**Claim:**` too: where it opens with `Claimed ` and names an identity other than the one just read, name the holder and the time **before** the offer, and the offer overrides, writing the field's `Overridden ` sentence per `rules/circle-records.md` `### The claim field`. `Unclaimed`, no field, or this checkout's own identity behaves as today.
  - **Activate** — `printf '%s\n' "<dir>" > ./fusion-workbench/.active-circle`. Step 2 resolves against it.
  - **Leave** — write nothing; the Circle stays inactive here, and `/fusion:next` can activate it later.
- **More than one path, pointer or not** — `MULTIPLE-ACTIVE`, the condition `agents/playmaker.md` names beside `MISSING-POINTER`. Name every Circle found and say the project holds more than one active record. **Offer nothing and write nothing**: which of several to run here is a portfolio judgement, and `/fusion:next` is where the project makes it. Point the user there.

Name the branch that ran in the Done report.

## Step 0j — Bring a tracked workbench's `.gitignore` into line with the partition

`rules/workbench-tracking.md` `## The four classes` says which root entries travel and which stay; decisions `260825-1030` (both) say what Setup does when a tracked workbench's `.gitignore` departs from it: repair an excluded R2/R3 entry with a negation line, report a tracked class L entry, repair `.checkout-id` alone (the one whose tracking gives a wrong answer, not noise), never touch an R1 exclusion, ask nothing. Only in a git work tree that already tracks `fusion-workbench/`; the choice not to track is the project's. The question is `git check-ignore -q`, never a text read of `.gitignore`, for the reason the rule gives for `git check-attr`.

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ] && git ls-files --error-unmatch fusion-workbench >/dev/null 2>&1; then
  for p in orchestrator-events.jsonl .fusion-setup .asset-provenance; do
    git check-ignore -q "fusion-workbench/$p" && { [ -s ./.gitignore ] && [ -n "$(tail -c1 ./.gitignore)" ] && printf '\n' >> ./.gitignore; printf '!fusion-workbench/%s\n' "$p" >> ./.gitignore; echo "gitignore: $p was excluded — negation appended to $(pwd)/.gitignore"; }
  done
  if git ls-files --error-unmatch fusion-workbench/.checkout-id >/dev/null 2>&1; then
    git rm -q --cached fusion-workbench/.checkout-id && printf 'fusion-workbench/.checkout-id\n' >> ./.gitignore && echo "gitignore: .checkout-id was tracked — untracked (file kept on disk) and excluded"
  fi
  for p in agentstate.yaml orchestrator-live.md .session-marker .active-circle .cadence-anchors .commit-lock monitor portfolio.md .guard-state; do
    git ls-files --error-unmatch "fusion-workbench/$p" >/dev/null 2>&1 && echo "gitignore: class L entry $p is tracked — not repaired, report it"
  done
fi
```

Every line printed goes into the Done report verbatim; nothing printed means nothing to report.

## Step 1 — Interrupted-session check (CRITICAL — do not skip)

Read `./fusion-workbench/agentstate.yaml`.

- **If it does not exist:** fresh session — continue to Step 2.
- **If it exists:** a prior session was interrupted. Run the resume procedure in `$FUSION_SRC/rules/orchestrator-resume.md` (schema check, derived progress summary, the Continue / Restart / Modify question), the way Step 2 runs the Turn-budget block from the orchestrator prompt; nothing of it is restated here. **STOP. Do not proceed until the user has chosen.** Even if the user's original prompt implied resuming a specific task, the choice must be explicit.

## Step 2 — Rules check

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits. The helper emits `fusion-workbench-conventions.md` (always) plus any project-local rules from `./rules/`.

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_HISTORY`, `OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the values resolved here are held by the **orchestrator** for the whole session — including steps that live in `$FUSION_SRC/agents/orchestrator.md` and not in this file.

Hold these values for the rest of the session and use them wherever a later step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes).

**The Turn budget is resolved here too.** Run the `bin/fusion-turn-budget` block from `$FUSION_SRC/agents/orchestrator.md` Setup Step 2 — the `[ -x ]` guard is part of it — and hold the answer for the session the same way the `fusion-paths` values are held. That section is the canonical implementation and carries the unresolved branch and its four consequences; do not restate them here, and do not substitute a number for a budget that did not resolve. Report the value, or the fact that it did not resolve and why, in the Setup-complete summary — and with it every diagnostic line the helper put on stderr, which that section requires and which arrives even when the budget resolves.

**In fusion's own repository, name the helpers the install lacks.** Every helper call site reads `$FUSION_PLUGIN_ROOT/bin/`, pinned for the session, so a helper this work tree just added takes every `[ -x ]` miss branch until the next `fusion --update` (issue `260825-1329`); whether the work-tree preference should reach helper resolution is part (c) of decision `260810-1544` and stays unanswered. This line measures the gap and changes nothing:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null && for h in bin/*; do [ -x "$h" ] && [ ! -x "$FUSION_PLUGIN_ROOT/$h" ] && echo "helper in work tree, not in install: $h"; done
```

Name each line in the Done report.

## Step 3 — Context

- Read `CLAUDE.md` for project context, folder structure, architecture.
- `git log --oneline -20` for recent change context (skip if not a git repo).
- Snapshot open state, using the values `fusion-paths` gave you in Step 2. Every `SCAN_*` may name **two** directories (the active Circle's and the shared one) — count both, or the snapshot silently under-reports:
  - Open issues: for each path in `$SCAN_ISSUES`, count `*_o_*` and `*_p_*` files.
  - Open plan steps: for each path in `$SCAN_PLANS`, skim `*_o_*.md` and `*_p_*.md`.
  - Current git HEAD (if git repo)
- **Legacy leftovers (migration offer).** Probe for the halt flag and for the three inert files `rules/workbench-tracking.md` `## The four classes` names as written by nothing at this version; this is read-only:

  ```bash
  [ -f ./fusion-workbench/.guard-state/escalation.json ] && grep -q '"haltActive"[[:space:]]*:[[:space:]]*true' ./fusion-workbench/.guard-state/escalation.json && echo "legacy halt flag present" || echo "no legacy halt flag"
  for f in escalation.json churn.json state-drift.json; do [ -f "./fusion-workbench/.guard-state/$f" ] && echo "leftover: $f"; done
  ```

  **`no legacy halt flag` and no `leftover:` line — say nothing at all.** An absent file, an unreadable one and `haltActive: false` are the ordinary case, and none of them gets a line in the Setup report.

  **Any `leftover:` line** — this project is carrying state written by a mechanism fusion no longer ships. **No check fusion still ships can raise a halt**, and no code at this version reads the flag or the files: nothing is blocked by any of them, and no tool behaves differently whether they stay or go. Do not attribute the flag to a particular check — two of them could set it, and which one this project met is not readable from the file. Offer to delete them with one `AskUserQuestion`, in the project's chat language, the same way Step 0g asks its question, listing the files found and saying `halt flag present` where it is:

  > This project still carries leftover files in `fusion-workbench/.guard-state/` (`escalation.json`, halt flag present; `churn.json`). The mechanisms that wrote them are no longer part of fusion and no current version reads them, so nothing is being blocked. Delete the leftover files?

  Two options. **"Delete them" is the default and the recommended choice:**

  ```bash
  rm -f ./fusion-workbench/.guard-state/escalation.json ./fusion-workbench/.guard-state/churn.json ./fusion-workbench/.guard-state/state-drift.json
  ```

  "Keep them" is the other: nothing is written, Setup continues, and the offer comes back on the next run.

  **Name the effect exactly, and claim nothing beyond it.** Deleting the files removes leftovers. It does not clear a halt, unblock writes or restore write access, because at this version nothing is blocked and nothing was taken away. Report it in the Setup-complete summary in those terms: which files were deleted and nothing about what is allowed changed, or the files were left in place.
- Workbench-domain detection: run the heuristic in `$FUSION_SRC/agents/orchestrator.md` Setup Step 5. Report the detected domain in the Setup-complete summary. The orchestrator passes this domain as the default `domain` parameter to `taskplanner`, `reconciler` and `playmaker` dispatches; the user may override at any individual dispatch.
- **Circle-count snapshot and hint:** count Circles under `$SCAN_CIRCLES` by the marker on their record, not on the directory. Enumerate the records and read the marker from the name — one pass, no bracket expression, no glob per state:

  ```bash
  find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '*_circle.md' 2>/dev/null | while IFS= read -r f; do basename "$f" | sed -nE 's/^_([a-z])_.*/\1/p'; done | sort | uniq -c
  ```

  Output is one `<count> <marker>` line per state (`2 a`, `1 t`); no Circles prints nothing. `find` drives the loop so a missing or empty `circles/` yields no input and the count is zero — no unmatched glob to abort under zsh, no unexpanded pattern to miscount.

  The underscore marker is inert as a glob (`rules/fusion-workbench-conventions.md` `## Marker globs`).

  If any Circles exist, print a one-line advisory pointing to `/fusion:next` for portfolio review. If none exist, no hint is printed — opt-in behaviour preserved. The orchestrator's Setup Step 5 contains the canonical implementation.

## Step 4 — History file

Timestamp: `date +%y%m%d-%H%M`.

Create `$OUT_HISTORY/YYMMDD-HHMM-orchestrator-session.md` (the value `fusion-paths` gave you in Step 2 — the active Circle's `history/` when one is active, `shared/history/` when none is) and write the initial entry: session Directive and snapshot counts from Step 3.

## Step 5 — Event log and live dashboard

- **Create if missing, never overwrite.** `./fusion-workbench/orchestrator-events.jsonl` is append-only across all sessions. Use a touch-or-append pattern, never a truncating `>` redirect:
  ```bash
  [ -f ./fusion-workbench/orchestrator-events.jsonl ] || touch ./fusion-workbench/orchestrator-events.jsonl
  ```
- Append a `session_start` event (one line, appended — never overwrite the file). It carries `<ID>` from Step 0i; `history_file`, the path from Step 4; and `detail`, the session Directive and mode. Their contract, the unresolved-half rule included, is authored in `$FUSION_SRC/agents/orchestrator.md` `### 2. Structured Event Log` and not restated here.
  ```bash
  TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
  echo "{\"ts\":\"${TS}\",\"event\":\"session_start\"<ID>,\"history_file\":\"<the Step 4 path>\",\"detail\":\"<Directive and mode>\"}" >> ./fusion-workbench/orchestrator-events.jsonl
  ```

- Overwrite `./fusion-workbench/orchestrator-live.md` with the real session Directive and snapshot counts (replace the placeholder `Initializing` line). The dashboard is now live for the monitor.

## Done

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, whether an interrupted session was resumed, whatever Step 0's marker write had to report, whatever Step 0e had to report about the copied assets, the permission line Step 0g produced (written and effective next session, declined, or already in place), which of Step 0h's four outcomes occurred (rule written, naming the `.gitattributes` path; a union driver already applying; another value left alone, named; or no git work tree), and which Step 0i branch ran (nothing to report; one active Circle with no pointer, named, with whether the user activated it here; or `MULTIPLE-ACTIVE`, every record named), every line Step 0j printed, and every helper Step 2 found in the work tree and not in the install. (Pre-v4 workbenches are refused at Step 0 toward `/fusion:migrate`.) End with the three usual next moves: name a task, "run the active Circle", or `/fusion:next` for a recommendation.
