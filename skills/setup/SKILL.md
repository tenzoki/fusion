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

**`UNRESOLVED` is not a path, and no step below reads through it.** With `FUSION_PLUGIN_ROOT` unset the variable holds the empty string, every `$FUSION_SRC/…` citation then resolves from `/`, and the two steps that cite one without an inline fallback — the Turn budget in Step 2 and the domain detection in Step 3 — would find nothing and say nothing about why. Step 0e cites none: it re-resolves the root in each of its own blocks and skips itself when that comes back empty. The check is this print, once, rather than a test at each site. When it prints `UNRESOLVED`, name it in the Setup-complete summary, say that no step citing a plugin file was run and which ones those were, and tell the user to restart the session so the SessionStart hook exports the variable. Do not improvise the content of a section you could not open. That is `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* applied to a held root: nothing is read through a value that came back empty, and the run names the value instead.

**Why the branch, why it is a call, and why the call is guarded:** `bin/fusion-source-root`'s own header.

**The guard is not local to this block.** Step 0e re-resolves the root inline in three of its own blocks, and the Turn-budget block Step 2 runs carries the same test. Four sites in this file, one shape, and the header above is where its reason is written down.

**What the root does *not* cover.** A `bin/` helper is always run from `$FUSION_PLUGIN_ROOT`, and so is an asset this skill copies — `bin/monitor`, `stilwerk/`, `templates/`, `.claude-plugin/plugin.json` — Step 0d's first copy of a profile included. **One named exception:** Step 0e reads and refreshes the four stylometric profiles at the source root, because a comparison whose whole purpose is to notice a shipped file that moved cannot read the one copy where it never moves. That exception was decided for that comparison alone. Whether the work-tree preference reaches helper resolution is part (c) of decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention…` and is **unanswered**; do not assume it. The split is by what you do with the path: read shipped text → `$FUSION_SRC`; run or copy an installed artefact → `$FUSION_PLUGIN_ROOT`.

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

Stopping *before* the `mkdir` is what makes this worth doing. The `mkdir -p` below creates `shared/planning/` and friends; run it against a pre-v4 workbench and the workbench is now split across two layouts — old artifacts at the root, an empty new store beside them — and every agent dispatched afterwards writes into the new one while every old artifact sits unreachable in the old. That is not hypothetical: it is filed as `fusion-workbench/shared/issues/260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md`. The marker write further down is the second reason: it overwrites `plugin_version`, destroying the only record of which version produced the workbench.

Detection is by artifact presence, not by version — a workbench with no out-of-format artifacts has nothing to migrate regardless of which version created it. It fires on two shapes: a pre-v4 type-folder / flat-Circle layout, **and** a container-layout workbench whose filenames still carry the old bracket-form state marker (`…[o]-….md`) instead of the underscore form. Both route to `/fusion:migrate`, which brings the workbench fully to the current format. Read-only:

**The bracket-marker probe walks the two trees `/fusion:migrate` converts, and nothing else — do not widen it.** It anchors its `find` at `shared/` (any depth) and `circles/` (from depth 2), which is the same candidate list migrate's reformat pass renames (`skills/migrate/SKILL.md:54,87`). A live markered artifact has nowhere else to be: the workbench root holds fixed-name session surfaces and `stilwerk/` fixed-name configuration, and `archive/`, `stashes/` and `.migration-v2-backup/` hold content deliberately taken out of circulation — the archive step of `/fusion:cleanup` (reachable alone as `/fusion:cleanup --only archive`) moves it there, the removed stash skills froze it, and the retired `/fusion:migrate-workbench-v2` (fusion v2.3–v2.5) left the backup copy behind as its rollback path. A frozen artifact keeps the filename it carried when it was frozen, so a workbench that ever archived pre-underscore content carries bracket markers forever, and not one of them is live. A probe reaching them reads an unconverted workbench, refuses Setup permanently, and routes the user to a migration that reports nothing to do — a deadlock rather than a mere false positive, hit twice on one consuming project, 1146 matches, all of them under `archive/` and `.migration-v2-backup/`, none anywhere else. This probe was a whole-tree walk with those three stores named as `-not -path` exceptions until 260816; the tree bound replaces the list and needs no fourth entry when a fourth frozen store appears. The principle underneath: this check exists to catch artifacts that would become *unreachable* when the new store is created beside them, and nothing outside the two live trees is on any agent's search path to begin with.

**The bracket-marker probe matches the marker shape, not any bracket pair.** The `find` name test `'*[[]*[]]*.md'` is only the cheap prefilter; the `grep` behind it keeps a file only when its basename carries the actual old marker form `[x]-` with `x` one of `oatcibspd` — exactly the set `/fusion:migrate`'s rename pass converts (`s/\[([oatcibspd])\]-/_\1_/g`, `skills/migrate/SKILL.md` Step 4). The detector must only look for things the executor can remove: a name like `notes [draft].md` carries a bracket pair no migration will ever rename, and flagging it would refuse Setup permanently while `/fusion:migrate` correctly reports nothing to do — the same deadlock the tree bound above closes, arrived at from the shape side.

All three probes are now bounded by construction, and none may be given a path exception. The type-folder probe tests `$WB/<folder>` directly, so an archived `archive/<batch>/planning/` is not a root type folder and cannot match. The Circle-file probe is `-mindepth 1 -maxdepth 1` under `circles/`, while frozen Circles live at `archive/<batch>/circles/…` or `stashes/<id>/circle/`. A flat `circles/*.md` that the Circle-file probe does not recognise is out of the bracket probe's reach as well, and deliberately: migrate ignores such a file by name (its `SKIPPED` counter), so a probe that flagged it would refuse Setup over something no pass will ever convert.

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
- **`shared/` is the home for everything with no Circle affiliation** — the Origin Rule's "unknown origin means shared". `investigations/`, `consult/`, `memos/` and `backlog/` exist only there, because none of the four is produced by executing a Directive — and a backlog entry, being an idea that is not yet a unit of work, precedes every Directive there is.
- **The root-anchored surfaces stay at the root.** `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl` and `.guard-state/` are read at fixed root-relative paths by `hooks/tracker.ts:33-36` and `bin/monitor:72-75`; `.commit-lock/` by `bin/fusion-commit-lock` and `.session-marker` by `bin/fusion-session-mark`. Never create them anywhere else; none of these consumers has a fallback path. Only `.guard-state/` is pre-created above — the rest appear when their consumer first writes them. The full list is in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`.

Write the setup marker (the file every agent and hook looks for to confirm fusion is set up here) only when it is missing or carries a `plugin_version` other than the shipped one; `rules/workbench-tracking.md` `## The setup marker is written on change, not on every run` says why:

```bash
M=./fusion-workbench/.fusion-setup
V="$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
[ -f "$M" ] && grep -qF "\"plugin_version\":\"$V\"" "$M" || printf '{"setup_at":"%s","plugin_version":"%s"}\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$V" > "$M"
```

If `./fusion-workbench/` already existed from a prior fusion version, the `mkdir -p` is harmless and existing content is preserved. Pre-v4 content is caught by the layout check above, which stops Setup before this point and routes the user to `/fusion:migrate` — so a workbench reaching this `mkdir` is already in the container layout.

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

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version (a stale local monitor from an earlier install is the most common dashboard bug). Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor.new && chmod +x ./fusion-workbench/monitor.new && mv -f ./fusion-workbench/monitor.new ./fusion-workbench/monitor && P=./fusion-workbench/.asset-provenance && { [ -f "$P" ] || : > "$P"; } && h="$(shasum -a 256 ./fusion-workbench/monitor | cut -c1-64)" && { grep -q "^$h  monitor$" "$P" || { grep -v "  monitor$" "$P" > "$P.t"; printf '%s  monitor\n' "$h" >> "$P.t"; mv -f "$P.t" "$P"; }; }; }
```

The tail of that command **stamps** the copy in `./fusion-workbench/.asset-provenance` — the record Step 0d writes and Step 0e reads; its shape and its reason are stated in Step 0d. `monitor` is the one stamped asset Step 0e never offers to refresh, and the reason is structural: this step re-copies it unconditionally on every Setup, so it is never the stale copy that offer exists for.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.


## Step 0c — Concurrent-session check (advisory)

Fusion has no concurrency lock. Two orchestrators on the same project can corrupt `agentstate.yaml`, double-dispatch tasks, and race on `.guard-state/` counters. Setup checks for an active session marker and warns the user.

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

**What the loop adds to the copy is the stamp**, and it is the third input the next step needs. "Is this project's copy stale, or has the project adapted it" is not decidable from the two files a comparison holds: one difference, two causes. It becomes decidable from the checksum recorded at the moment of copying. `./fusion-workbench/.asset-provenance` holds one line per asset in the shape `shasum -a 256` prints — the checksum, two spaces, the asset's path relative to the workbench — so the file reads and re-checks with one command. Only a file this run actually copied is stamped here. A file that was already present is deliberately left unstamped, because nothing observed at this moment says what it was given, and guessing is the one thing the record exists to stop.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

## Step 0e — Compare the copied assets against the ones this version ships

Step 0d copies a profile once and never looks again, so a profile improved in the plugin never reaches a project that was set up before the improvement (`shared/issues/260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md`). This step closes that. It reads the record Step 0d writes, classifies each asset, and asks **at most one question**.

**Every block below resolves the shipped root itself**, into `$SRC`, with the same guarded `bin/fusion-source-root` call and the same `$FUSION_PLUGIN_ROOT` fallback the top of this file uses. No block here reads `$FUSION_SRC`: that variable is assigned in another shell, is empty by the time these run, and an instruction to substitute the printed path is not a guard. This comparison is the one place an asset is read at that root rather than at `$FUSION_PLUGIN_ROOT`, and the reason is that the install copy is the one place a shipped file cannot have moved: `install.sh` reads a GitHub tarball, never the work tree, so comparing against it would offer this repository's workbench the pre-release text. It settles that comparison and nothing else; part (c) stays where the header above left it. **A root that resolves to nothing skips the step**: ask nothing, change nothing, and say in the Done report that the assets were not compared.

Read-only classification:

```bash
PROV=./fusion-workbench/.asset-provenance
SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
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

**The eight tokens, and the precedence is the branch order above rather than a preference.** The first is `source-root-unresolved`, the skip above: it ends the block before any file is classified, and it is reported rather than enumerated. Without the precedence the cases overlap: case 1 and case 4 both match whenever both copies moved to the same content. Cases 5 and 6 are the two ways a comparison has nothing to compare; they are split because they route to different fixes, and both are reported in branch order, the local one first when both hold, because neither is silent by design.

1. **`case1-equal`** — the project's copy *is* the shipped copy. Report nothing. Stamp it: the observation is unambiguous, and recording it is what keeps a workbench that matches today out of case 0 on the day the profile improves.
2. **`case0-unclassifiable`** — the copies differ and no checksum was ever recorded. This is every workbench that existed before this step. Name the file, say plainly that fusion **cannot tell an adaptation from a stale copy** for it, and carry that warning into the offer. Do not guess which it is.
3. **`case2-stale`** — the project's copy is exactly what it was given, and the shipped file has moved. Offer the replace. This is the case the capability exists for.
4. **`case3-adapted`** — the project edited its copy and the shipped file did not move. Say nothing about it and do not touch it.
5. **`case4-conflict`** — both moved. Name it as a conflict and offer no one-click replace. The file is neither changed nor stamped, so it is named again on every run until a human resolves it by hand.
6. **`case5-missing-local`** — the project has no copy. Step 0d makes one, so its copy failed or was skipped; until it exists `bin/fusion-rules` emits no path for that profile and every agent runs the session without it. Name it in the Done report with that consequence. This step does not copy it — presence is Step 0d's job, and a second copier is a second place to keep right.
7. **`case6-missing-shipped`** — the resolved root has no copy. That is a broken install or an unexpected root, not anything about the project. Name it in the Done report as that; the project's file is neither changed nor stamped.

**One `AskUserQuestion` covers every file in cases 0 and 2 together — never one per file, and none at all when that set is empty.** Setup asks one question on a normal run (Step 0g) and that is the budget. Ask in the project's chat language per `rules/fusion-workbench-conventions.md` `## Project language`, following `rules/user-facing-output.md` and the chat profile. Specified here in English:

> These workbench files differ from the ones this fusion version ships: *&lt;list&gt;*. Replace them with the shipped copies? Any edits you made to those files are lost. For *&lt;the case-0 files&gt;* fusion has no record of what it originally copied, so it cannot tell whether you adapted the file or the plugin moved on.

Two options: **"Replace them"** and **"Keep mine"**.

**Both answers end the same way, and that end state is what stops the question repeating.** On "replace", copy the shipped file over the project's, then stamp. On "keep mine", change no file and stamp anyway — the shipped checksum records *this divergence was seen and kept*, which turns the file into case 3 on the next run and re-raises it only when the plugin moves again.

```bash
SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
for rel in <the files to replace>; do cp "$SRC/$rel" "./fusion-workbench/$rel"; done
```

Then stamp, with `<rel...>` the case-1 files plus every file the question covered, whichever way it was answered:

```bash
SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
PROV=./fusion-workbench/.asset-provenance; [ -f "$PROV" ] || : > "$PROV"
for rel in <rel...>; do
  h="$(shasum -a 256 "$SRC/$rel" | cut -c1-64)"
  grep -q "^$h  $rel$" "$PROV" && continue
  grep -v "  $rel$" "$PROV" > "$PROV.t"; printf '%s  %s\n' "$h" "$rel" >> "$PROV.t"; mv -f "$PROV.t" "$PROV"
done
```

The `grep -q` skip is what makes a second Setup with nothing changed in between rewrite no file at all.

Report in the Done report: which files were replaced, which were kept, which were named as conflicts, which were missing on either side (cases 5 and 6), and, when the block printed `source-root-unresolved`, that the assets were not compared at all. When every file came back `case1-equal`, say nothing about this step — a run with nothing to report is the normal run.

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

The probe is why this step runs two commands where Steps 0b and 0d run one: reporting `present` is a better answer for the user than a silent no-op. The `[ -f ]` guard inside the copy stays regardless, so the block is safe on its own for anyone who runs it without the probe.

This step does nothing about a leftover `fusion-guard.json`. Naming that file is the configuration loader's job: it names the file, names the Turn-budget key and says where that key belongs now, once per guarded tool call until the file is deleted. Do not read the old file here, and do not offer to move anything out of it.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup. An absent `fusion.json` costs the project one thing and only one: the orchestrator runs on fusion's own Turn budget rather than a number the project chose.

## Step 0g — Offer to seed the project's permission file

A fresh consuming project has no permission source of its own, so every `Write`, every `Edit` and every non-sandboxed shell call a fusion session makes raises an approval dialog. This step offers to write the file that stops that. It is the only step in Setup that asks the user for a decision on a normal run, and it asks **once**.

**Why the grant is all-or-nothing.** Measured on Claude Code 2.1.226: a plugin's own permission settings are not read at all under `--plugin-dir`, and directory-scoped patterns (`Write(fusion-workbench/**)` and every variant of it) were denied even from a project file that *is* read. Only the bare tool name was honoured. So there is no narrow grant to offer — the choice is between the permissive one below and none.

### 1. Ask

One `AskUserQuestion`, in the project's chat language, naming the file and what the setting does in plain words rather than behind the term:

> fusion writes `.claude/settings.local.json` in this project so future sessions run without asking you to approve each tool. That setting is `bypassPermissions`: Claude Code stops prompting for file writes, edits and shell commands in this project. It still asks before catastrophic operations such as `rm -rf /`. Write it?

Two options. **"Yes, write it" is the default and the recommended choice.** "No, keep the prompts" is the other; nothing is written and Setup continues.

Read `.claude/settings.local.json` first if it exists and note `permissions.defaultMode`. Already `bypassPermissions` — skip the question (§3). Any **other** value — the question must name it and say plainly what happens to it: *this project currently sets `defaultMode: "<existing>"`; saying yes replaces it.* A replacement the question did not name is not a replacement the user consented to.

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

`defaultMode` is the load-bearing field; the `allow` list is belt-and-suspenders for tools the bypass mode still gates. **Bare tool names only** — no scoped path form may be written here under any wording, because none of them match.

1. `mkdir -p .claude`.
2. Read `.claude/settings.local.json` if present. If absent, create it with the JSON above.
3. If present, parse it and union the `allow` list with the values above, **preserving every existing entry — only add, never remove**; that guarantee is about the `allow` list and reaches no other field. Set `permissions.defaultMode` to `"bypassPermissions"` only when the file carries no `defaultMode`, or when the question named the existing value the user agreed to replace — a scalar is replaced, not merged, so it is never set silently. Write back with two-space indentation and a trailing newline.
4. Ensure the file is gitignored. Check `.gitignore` for either `.claude/settings.local.json` or `.claude/`; if neither matches, append `.claude/settings.local.json` to `.gitignore`. This step is not optional — a seeded local settings file that lands in a commit is a worse outcome than an unseeded one.

**Never** write this file outside `pwd`, never into a subfolder, and never touch `.claude/settings.json`, which is the shared checked-in file and not this one.

### 3. Report either way, in the Done report

- **Wrote it:** name the path, say the permission change takes effect **on the next session** — Claude Code reads permission settings only at startup, so this session still prompts — and say whether `.gitignore` was modified. If a `defaultMode` was replaced, name the old value beside the new one. Do not claim the current session is now unlocked.
- **Declined:** say plainly that per-tool approval prompts stay on for this project, and that Setup can seed the file on a later run.

If the project already had `defaultMode: "bypassPermissions"`, say so and skip the question — there is nothing to decide. Any other existing `defaultMode` survives the run untouched unless the user answered yes to the question that named it.

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
    *) echo "gitattributes: left alone — this path already has merge driver '$D'" ;;
  esac
else
  echo "gitattributes: not a git work tree — nothing written"
fi
```

Four outcomes, disjoint because `git check-attr` returns exactly one value for `merge` on that path:

- **`union`** — write nothing. A broader glob the project wrote itself may be what set it, and the path already has what the rule asks for.
- **`unspecified`** — no driver applies, so the comment and the rule line are appended. The `tail -c1` test is what makes that safe: appending to a file whose last byte is not a newline joins the neighbouring rule to the comment and destroys both.
- **any other value** — leave the file alone and name the driver. `unset`, which a project writes as `-merge`, reports here and is correct to leave: switching the driver off is as deliberate as setting a different one.
- **not a git work tree** — nothing to ask, nothing to write.

## Step 1 — Interrupted-session check (CRITICAL — do not skip)

Read `./fusion-workbench/agentstate.yaml`.

- **If it does not exist:** fresh session — continue to Step 2.
- **If it exists:** a prior session was interrupted. You MUST do ALL of:
  0a. **Schema check (v2.9.0).** If the saved `agentstate.yaml` contains the legacy fields `cycle:` or `goal:` (instead of the current `turn:` / `directive:`), it is a pre-v2.9.0 snapshot that cannot be replayed against v2.9.0 fields. The schema rename is a hard break — there is no soft alias. Tell the user "schema mismatch — please restart", offer **Restart only** (delete `agentstate.yaml` and proceed with fresh setup), and do not attempt to resume. Skip the remaining sub-steps once Restart is chosen.
  1. Read the file completely.
  2. **Derive how far the session got before you summarise it, rather than reading it off the file.** The saved state carries no counters — it never carries a number that could be stale, because the fields that could be were removed on 2026-08-15 along with the check that caught them (`agents/orchestrator.md` **Persistent State File → Format**). It used to: `agentstate.yaml` said `commits: 0` while git counted 6, 7, 8 and 12, measured six times (issue `260801-2038`). Take the two figures from the records that could not freeze:

     ```bash
     A=$(sed -n 's/.*git_head_at_start: *"\([^"]*\)".*/\1/p' ./fusion-workbench/agentstate.yaml 2>/dev/null)
     C=$([ -n "$A" ] && git rev-list --count "$A"..HEAD 2>/dev/null)
     T=$(grep -c '"event":"turn_start"' ./fusion-workbench/orchestrator-events.jsonl 2>/dev/null)
     echo "commits=${C:-unavailable}"
     echo "turns=${T:-unavailable}"
     ```

     The task tallies come from counting the `work_queue` entries by `status` in the file you just read. Report a figure that could not be taken as `unavailable`, never as `0` — an absent anchor is not a session with no commits. Each figure is captured into a variable and reported on its own emptiness, never on the exit code of the command that took it: `git rev-list` prints nothing when the anchor no longer resolves, and `grep -c` prints `0` **and** exits non-zero when the log carries no match, so a form that branched on `||` printed the number and the fallback word together. `turns=0` is the opposite case and is a real figure: the log was read and the session stopped before its first Turn.
  3. Present a summary to the user:
     - Session Directive and mode
     - Progress (the Turn and commit counts derived in sub-step 2, tasks completed vs total from `work_queue`)
     - The task that was active when the session stopped
     - Remaining tasks (with their status)
     - Plan file and user directive, if any
  4. Use `AskUserQuestion` to offer:
     - **Continue** — resume from the saved queue, skipping completed tasks
     - **Restart** — discard state, delete `agentstate.yaml`, fresh setup
     - **Modify** — user provides updated instructions before resuming
  5. **STOP. Do not proceed until the user has chosen.** Even if the user's original prompt implied resuming a specific task, the choice must be explicit.

## Step 2 — Rules check

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits. The helper emits `fusion-workbench-conventions.md` (always) plus any project-local rules from `./rules/`.

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_HISTORY`, `OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the values resolved here are held by the **orchestrator** for the whole session — including steps that live in `$FUSION_SRC/agents/orchestrator.md` and not in this file. Passing `setup` would yield only the keys this file happens to name, and the orchestrator would be short the rest.

Hold these values for the rest of the session and use them wherever a later step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes).

**The Turn budget is resolved here too.** Run the `bin/fusion-turn-budget` block from `$FUSION_SRC/agents/orchestrator.md` Setup Step 2 — the `[ -x ]` guard is part of it — and hold the answer for the session the same way the `fusion-paths` values are held. That section is the canonical implementation and carries the unresolved branch and its four consequences; do not restate them here, and do not substitute a number for a budget that did not resolve. Report the value, or the fact that it did not resolve and why, in the Setup-complete summary — and with it every diagnostic line the helper put on stderr, which that section requires and which arrives even when the budget resolves.

## Step 3 — Context

- Read `CLAUDE.md` for project context, folder structure, architecture.
- `git log --oneline -20` for recent change context (skip if not a git repo).
- Snapshot open state, using the values `fusion-paths` gave you in Step 2. Every `SCAN_*` may name **two** directories (the active Circle's and the shared one) — count both, or the snapshot silently under-reports:
  - Open issues: for each path in `$SCAN_ISSUES`, count `*_o_*` and `*_p_*` files.
  - Open plan steps: for each path in `$SCAN_PLANS`, skim `*_o_*.md` and `*_p_*.md`.
  - Current git HEAD (if git repo)
- **Legacy halt flag (migration offer).** Probe for the flag first; this is read-only:

  ```bash
  [ -f ./fusion-workbench/.guard-state/escalation.json ] && grep -q '"haltActive"[[:space:]]*:[[:space:]]*true' ./fusion-workbench/.guard-state/escalation.json && echo "legacy halt flag present" || echo "no legacy halt flag"
  ```

  **`no legacy halt flag` — say nothing at all.** An absent file, an unreadable one and `haltActive: false` are the ordinary case, and none of them gets a line in the Setup report. Every other idempotent step here is silent when it has nothing to do, and a Setup that narrates its no-ops is a Setup nobody reads.

  **`legacy halt flag present`** — this project is carrying state written by a mechanism fusion no longer ships. **No check fusion still ships can raise a halt**, and no code at this version reads the flag: nothing is blocked by it, and no tool behaves differently whether the file stays or goes. Do not attribute the flag to a particular check — two of them could set it, and which one this project met is not readable from the file. Offer to delete it with one `AskUserQuestion`, in the project's chat language, the same way Step 0g asks its question:

  > This project still carries a halt flag in `fusion-workbench/.guard-state/escalation.json`. The check that set it is no longer part of fusion and no current version reads the flag, so nothing is being blocked. Delete the leftover file?

  Two options. **"Delete it" is the default and the recommended choice:**

  ```bash
  rm -f ./fusion-workbench/.guard-state/escalation.json
  ```

  "Keep it" is the other: nothing is written, Setup continues, and the offer comes back on the next run.

  **Name the effect exactly, and claim nothing beyond it.** Deleting the file removes a leftover flag. It does not clear a halt, unblock writes or restore write access, because at this version nothing is blocked and nothing was taken away. A user who reads "the halt is cleared" believes write access has just been handed back, and it never left. Report it in the Setup-complete summary in those terms: the flag was deleted and nothing about what is allowed changed, or the flag was left in place.
- Workbench-domain detection: run the heuristic in `$FUSION_SRC/agents/orchestrator.md` Setup Step 5 (the `decisions_count`/`analyses_count`/`code_files`/`data_files` block). Report the detected domain in the Setup-complete summary. The orchestrator passes this domain as the default `domain` parameter to `taskplanner` and `reconciler` dispatches; the user may override at any individual dispatch.
- **Circle-count snapshot and hint:** count Circles under `$SCAN_CIRCLES` by the marker on their record, not on the directory. Enumerate the records and read the marker from the name — one pass, no bracket expression, no glob per state:

  ```bash
  find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '*_circle.md' 2>/dev/null | while IFS= read -r f; do basename "$f" | sed -nE 's/^_([a-z])_.*/\1/p'; done | sort | uniq -c
  ```

  Output is one `<count> <marker>` line per state (`2 a`, `1 t`); no Circles prints nothing. `find` drives the loop so a missing or empty `circles/` yields no input and the count is zero — no unmatched glob to abort under zsh, no unexpanded pattern to miscount.

  **The underscore marker is inert as a glob.** `_a_circle.md` matches literally — no character-class surprise, no escaping — so the enumeration above (and any per-state glob such as `circles/*/_a_circle.md`) resolves correctly, and `find -name '_a_circle.md'` needs no special handling. The enumeration form is still preferred: it reads the marker as data in one pass. See `rules/fusion-workbench-conventions.md` `## Marker globs`.

  If any Circles exist, print a one-line advisory pointing to `/fusion:next` for portfolio review. If none exist, no hint is printed — opt-in behaviour preserved. The orchestrator's Setup Step 5 contains the canonical implementation.

## Step 4 — History file

Timestamp: `date +%y%m%d-%H%M`.

Create `$OUT_HISTORY/YYMMDD-HHMM-orchestrator-session.md` (the value `fusion-paths` gave you in Step 2 — the active Circle's `history/` when one is active, `shared/history/` when none is) and write the initial entry: session Directive and snapshot counts from Step 3.

## Step 5 — Event log and live dashboard

- **Create if missing, never overwrite.** `./fusion-workbench/orchestrator-events.jsonl` is append-only across all sessions. Use a touch-or-append pattern, never a truncating `>` redirect:
  ```bash
  [ -f ./fusion-workbench/orchestrator-events.jsonl ] || touch ./fusion-workbench/orchestrator-events.jsonl
  ```
- Append a `session_start` event (one line, appended — never overwrite the file). It carries `history_file`, the path from Step 4:
  ```bash
  TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
  echo "{\"ts\":\"${TS}\",\"event\":\"session_start\",\"history_file\":\"<the Step 4 path>\"}" >> ./fusion-workbench/orchestrator-events.jsonl
  ```
  That field is the session's identity in an append-only log, and a Turn count taken over `turn_start` events runs from the first `session_start` carrying it — which is what lets the count span an interrupted session's resume instead of restarting at zero. Since the Turn number stopped being written to `agentstate.yaml`, this log is the only place it can be read (`agents/orchestrator.md` Phase 2).
- Overwrite `./fusion-workbench/orchestrator-live.md` with the real session Directive and snapshot counts (replace the placeholder `Initializing` line). The dashboard is now live for the monitor.

## Done

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, whether an interrupted session was resumed, whatever Step 0e had to report about the copied assets, the permission line Step 0g produced (written and effective next session, declined, or already in place), and which of Step 0h's four outcomes occurred (rule written, naming the `.gitattributes` path; a union driver already applying; another driver left alone, named; or no git work tree). (Setup no longer migrates — a pre-v4 workbench is caught by the layout check in Step 0, which refuses and routes the user to `/fusion:migrate` before any of this runs.)
