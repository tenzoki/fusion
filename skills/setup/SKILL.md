---
description: Run fusion's Setup — create the workspace, write the marker, seed the voice profiles, and name the periodic checks that are due
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Orchestrator Setup

The active agent MUST be `fusion:orchestrator`. This skill inlines the whole of Setup so it cannot be skipped.

**Setup is two prerequisites and three short steps.** Step 0 creates the workspace and writes the marker; Step 0d puts the voice profiles in place. Nothing fusion does works without those two, so they run every time.

**Everything else that used to run here is a periodic check**, each a fact about the *installation* rather than about this session. They live in `/fusion:check`; Step 0 says which are due and Step 1 runs those.

## CRITICAL — Setup is the ONLY place a workbench is created

Setup is the single point where a fusion workbench is bootstrapped. The workbench lands at `./fusion-workbench/` relative to the directory `pwd` reports when this skill runs. After setup completes, every subsequent fusion agent and hook locates the workbench by walking *upward* from its working directory until it finds the marker file `fusion-workbench/.fusion-setup` (written in Step 0 below). Without that marker, agents halt and hooks no-op — fusion does NOT bootstrap a workbench in any directory other than the one setup ran in.

This makes setup deliberately strict: run it once, at the project root you want fusion to govern. Run in a subfolder, it produces two independent fusion projects — one at the subfolder and one at the parent, if that had setup before. Walk up to the intended root first.

**Never** prepend `cd <something>` to the commands below. Run them as written, so the workbench lands at `./fusion-workbench/` relative to the directory the user invoked setup from.

## Step 0 — Confirm and create workspace

```bash
pwd
```

Note the path: the workbench is created here.

### Superseded-format check (CRITICAL — refuse, do not migrate)

**This runs before the `mkdir` below.** Setup does **not** migrate — `/fusion:migrate` does. Setup's job here is to notice.

**A `work-packages/` container holding work-item directories is the CURRENT layout and is never a finding.** That is what a workbench looks like now: one directory per work item, holding that item's own stores, beside the `shared/` stores for everything with no item to belong to (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). Setup creates `work-packages/` itself, below. A probe that refused a container would refuse the ordinary shape and route every user to a migration that must not run.

**A v11 store name is reported, never refused.** `circles/`, `shared/planning/` and `shared/consult/` are read beside their v12 names until `13.0.0` (`rules/fusion-workbench-conventions.md` `### Transition window (v12.0.0 to v13.0.0)`), so the probe prints one `LEGACY-STORES` line naming each one it finds and `/fusion:migrate`, and Setup continues. The `mkdir` below then creates the new names beside them, and new records land there.

Detection is by artifact presence, not by version. A pre-v4, v4-era or bracket-marked shape is `/fusion:migrate`'s to recognise, and it refuses with the `v11.11.1` route; setup probes for none of them. Read-only:

```bash
WB=./fusion-workbench; OLD=0; L=""; for s in circles shared/planning shared/consult; do [ -d "$WB/$s" ] && L="$L $s/"; done
[ -n "$L" ] && echo "LEGACY-STORES:$L (v11 names, read until 13.0.0; /fusion:migrate renames them)"; echo "OLD=$OLD"
```

- **`LEGACY-STORES`** — say the line to the user once, in the chat language, and continue.
- **`OLD=0`** — nothing out of format here. Continue with the `mkdir` below. Say nothing about it.

Only when `OLD=0`:

```bash
mkdir -p ./fusion-workbench/work-packages ./fusion-workbench/shared/plans ./fusion-workbench/shared/issues ./fusion-workbench/shared/decisions ./fusion-workbench/shared/analyses ./fusion-workbench/shared/reviews ./fusion-workbench/shared/investigations ./fusion-workbench/shared/consultations ./fusion-workbench/shared/history ./fusion-workbench/shared/memos ./fusion-workbench/archive ./fusion-workbench/.guard-state
```

This is the layout defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, which enumerates every store and every root-anchored surface. Two facts about it are Setup's own:

- **`work-packages/` is created empty, and Setup creates nothing inside it.** A work item's container and its own stores come into existence when the item is filed and when its first artifact is written; Setup has no item to create one for.
- **Of the root-anchored surfaces, only `.guard-state/` is pre-created above.** The rest appear when their consumer first writes them, at the fixed root-relative paths the layout names; never create one anywhere else, because no consumer has a fallback path.

Write the setup marker — the file every agent and hook looks for to confirm fusion is set up here — and read, out of the same block, which periodic checks are due. Both halves need the version the plugin ships, so they are one call rather than two. The marker is rewritten only when its content would change; `rules/workbench-tracking.md` `## The setup marker is written on change, not on every run` says why that matters.

```bash
M=./fusion-workbench/.fusion-setup
V="$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
[ -n "$V" ] || { echo "marker-version-unresolved"; exit 0; }
command -v node >/dev/null 2>&1 || { [ -f "$M" ] && grep -qF "\"plugin_version\":\"$V\"" "$M" || printf '{"setup_at":"%s","plugin_version":"%s","checks":{}}\n' "$(date -u +%Y-%m-%dT%H:%M:%S)" "$V" > "$M"; echo "checks_due=unread (no node on PATH)"; exit 0; }
node -e '
const fs = require("fs"); const [m, v] = process.argv.slice(1);
const SEL = ["monitor","concurrency","assets","config","permissions","gitattributes","identity","gitignore","upstream","leftovers","claude-md"];
let o = null; try { o = JSON.parse(fs.readFileSync(m, "utf8")); } catch {}
if (typeof o !== "object" || o === null) o = {};
const before = JSON.stringify(o);
if (typeof o.setup_at !== "string") o.setup_at = new Date().toISOString().slice(0, 19);
o.plugin_version = v;
if (typeof o.checks !== "object" || o.checks === null) o.checks = {};
const now = Date.now();
const due = SEL.filter((sel) => { const e = o.checks[sel]; return !e || e.version !== v || !(now - Date.parse(e.at) < 30 * 864e5); });
const after = JSON.stringify(o);
if (after !== before) fs.writeFileSync(m, after + "\n");
console.log("marker=" + (after !== before ? "written" : "unchanged"));
console.log("checks_due=" + (due.join(",") || "none"));
' "$M" "$V"
```

`marker=unchanged` means nothing was written and the file's modification time did not move, which is the property the tracking rule asks for. `marker=written` means the marker was missing, carried another version, or gained its first `checks` object.

**`marker-version-unresolved` says the version could not be read, which is not the same as the version matching.** The version decides both halves, so an unreadable one leaves no comparison to make and no due list to compute: the block writes nothing and prints that token. Setup is not blocked. A marker is never written with an empty version, because the next run cannot tell an empty one apart from a real one. Report the token together with whichever outcome followed: an existing marker was left exactly as it stands, or the workbench has no marker at all and is therefore not set up here until the session is restarted and Setup run again.

**`checks_due=unread` says node is not on this machine's `PATH`.** The marker is still written, by the shell fallback, so the workbench is set up; what could not be computed is the due list. Every fusion hook is a node program, so none of them is running either. Report both facts and continue.

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

**What the loop adds to the copy is the stamp**, the third input the `assets` selector of `/fusion:check` needs (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). `./fusion-workbench/.asset-provenance` holds one line per asset in the shape `shasum -a 256` prints: the checksum, two spaces, the asset's path relative to the workbench. Only a file this run actually copied is stamped here; a file that was already present is deliberately left unstamped.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, report it and do not block Setup.

## Step 1 — Run the periodic checks that are due

Step 0 printed `checks_due=`. On `none`, say nothing at all and go to Step 2 — the ordinary case in an unchanged installation. On `unread`, say that no due list was computed and that `/fusion:check` runs the whole set by hand.

**One or more selectors: perform them here.** A skill body cannot invoke a slash command, so read `$FUSION_SRC/skills/check/SKILL.md` and execute the section of each named selector inline, then its stamp block over exactly the selectors you ran. That body owns the procedures and their reporting; restate none of it here, and do not tell the user to type the command instead.

Resolve the root once, first — nothing the plugin ships exists at a consuming project's root:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then FUSION_SRC="$FUSION_PLUGIN_ROOT"; else FUSION_SRC=""; fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

**`UNRESOLVED` is not a path and nothing here reads through it** (`bin/fusion-source-root`'s header carries the branch). Say so, say the due checks were not run and stay due, and tell the user to restart the session so the SessionStart hook exports the variable. **A due selector is not a gate either way:** nothing here blocks the session, and a check not run stays due.

## Step 2 — Rules check

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits: `fusion-workbench-conventions.md` always, plus any project-local rules from `./rules/`.

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the values resolved here are held by the **orchestrator** for the whole session, including the steps of its own prompt rather than of this file.

Hold these values for the rest of the session and use them wherever a step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes).

**In fusion's own repository, name the helpers the install lacks.** Every helper call site reads `$FUSION_PLUGIN_ROOT/bin/`, pinned for the session, so a helper this work tree just added takes every `[ -x ]` miss branch until the next `fusion --update` (issue `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`); whether the work-tree preference should reach helper resolution is part (c) of decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` and stays unanswered. This line measures the gap and changes nothing:

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null && for h in bin/*; do [ -x "$h" ] && [ ! -x "$FUSION_PLUGIN_ROOT/$h" ] && echo "helper in work tree, not in install: $h"; done
```

Name each line in the Done report.

## Step 3 — The event log

`./fusion-workbench/orchestrator-events.jsonl` is append-only across every session and checkout. Create it when missing, with a touch-or-append pattern and never a truncating `>` redirect:

```bash
[ -f ./fusion-workbench/orchestrator-events.jsonl ] || touch ./fusion-workbench/orchestrator-events.jsonl
```

**Write no row here.** The SessionStart hook appends this session's mechanical `session_start` row; your own row, the one carrying the Directive, belongs to your Setup step 6. There is no live dashboard file to write — the monitor reads the log.

## Done

Only after every step above completes may you begin the user's task. Report Setup complete with: the workspace path, what Step 0's marker block reported (`marker=`, `checks_due=`, or `marker-version-unresolved`), which checks Step 1 ran and what each said, and every helper Step 2 found in the work tree and not in the install. End with the two usual next moves: name a task, or claim a work item.
