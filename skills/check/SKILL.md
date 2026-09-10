---
description: Run fusion's ten periodic installation checks — the shipped assets, the project's own files, the git settings, this checkout's identity and where it stands. Optional --only <selector> runs exactly one.
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Periodic checks

These ten checks ran at the top of every session until the ramp-up was cut. **None of them is a fact about this session**, and each answers the same way for days at a time. `fusion-workbench/.fusion-setup` therefore records, per selector, the date the check last ran and the plugin version it ran against; `/fusion:setup` asks for a selector again only when the version differs or that date is more than 30 days old, and runs it by reading this body.

**Run them all, or run one.** `/fusion:check` runs every selector below; `--only <selector>` runs exactly one. A selector this run does not perform keeps whatever the marker already records for it, so a `--only` run never claims coverage it did not take.

| Selector | What it answers |
|---|---|
| `monitor` | the workbench's monitor binary is the one this version ships |
| `concurrency` | another orchestrator session is already running against this project |
| `assets` | the workbench's voice profiles against the ones this version ships |
| `config` | the project has its own `fusion.json` |
| `permissions` | the project has a permission file, so a session need not approve every write |
| `gitattributes` | the event log has a union merge driver |
| `identity` | this checkout is in the registry, and holds no active Circle it never activated |
| `gitignore` | a tracked workbench's `.gitignore` against the four-class partition |
| `upstream` | how far this checkout is behind what it last saw of the remote |
| `leftovers` | files written by mechanisms fusion no longer ships |

**Nothing here blocks anything.** `permissions` asks one question on a normal run; `assets`, `identity` and `leftovers` each ask at most one when they find something to ask about. Everything else reports and continues. Report what every selector you ran had to say, then run the stamp at the end.

**Never prepend `cd <something>`** to the commands below: every path is relative to the project root, where the workbench and the project's own root-level files sit.

## monitor — the workbench's copy of the monitor binary

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version. Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor.new && chmod +x ./fusion-workbench/monitor.new && mv -f ./fusion-workbench/monitor.new ./fusion-workbench/monitor && P=./fusion-workbench/.asset-provenance && { [ -f "$P" ] || : > "$P"; } && h="$(shasum -a 256 ./fusion-workbench/monitor | cut -c1-64)" && { grep -q "^$h  monitor$" "$P" || { grep -v "  monitor$" "$P" > "$P.t"; printf '%s  monitor\n' "$h" >> "$P.t"; mv -f "$P.t" "$P"; }; }; }
```

The tail of that command **stamps** the copy in `./fusion-workbench/.asset-provenance`, the record the `assets` selector below reads; `/fusion:setup`'s profile step states its shape and its reason.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, report it and continue.

## concurrency — another orchestrator session against this project (advisory)

**Read what the cache costs here before you rely on this.** It is the one check whose subject *is* this session: a session starting inside the 30-day window at an unchanged plugin version never runs it, so the collision warning is not reached and no session marker is written. That was chosen with the rest of the ramp-up cut. Run `/fusion:check --only concurrency` by hand whenever a second session is plausible.

This selector reads the active session marker and warns the user.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" check
```

The helper prints `running`, `stale`, or `none` on stdout, and (when running/stale) the marker contents on stderr.

- **`none` or `stale`:** no active session detected. Write a fresh marker for this orchestrator session and continue:
  ```bash
  "$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator
  ```
- **`running`:** another fusion orchestrator session updated the marker within the last 10 minutes. **Warn the user** with the marker contents (start time, cwd, agent label) and offer:
  - **Proceed anyway** — overwrite the marker for this session. Document the risk: parallel orchestrators may corrupt workbench state. The user takes responsibility for sequencing.
  - **Abort** — stop, and tell the user where the other session appears to be running.

  Do not silently overwrite. The warning is the whole point.

Then, who else has been here:

```bash
E="$FUSION_PLUGIN_ROOT/bin/fusion-events"
if [ -x "$E" ]; then "$E" presence; echo "exit=$?"; else echo "presence=unread"; fi
```

**Both counts `0`: print nothing at all.** Otherwise one line in the project's chat language: `other_people` and `other_checkouts` apart (*"1 other person, 1 further checkout of your own"*), each `party=`'s person, Circle and time, its sixth field as that checkout's alias where the field is not `-`, the `window_days` window, and `scope=pulled`. **A failed read says so and never prints a zero**: `exit=3` — presence could not be read, this checkout has no identifier; `exit=4` — `other_checkouts`, another person not tellable from a further checkout of your own; `presence=unread` — not read, this install lacks the helper. The rest: that helper's header.

## assets — the copied profiles against the ones this version ships

This selector reads the record `/fusion:setup`'s profile step writes, classifies each asset, and asks **at most one question**. It resolves the shipped root itself, into `$SRC`; a root that resolves to nothing skips the selector: ask nothing, change nothing, and say that the assets were not compared. Every block below begins with this prelude, pasted in because each Bash call is a fresh shell:

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
6. **`case5-missing-local`** — the project has no copy (the profile copy in `/fusion:setup` failed or was skipped), so `bin/fusion-rules` emits no path for that profile. Name it in the Done report with that consequence; presence is that step's job.
7. **`case6-missing-shipped`** — the resolved root has no copy: a broken install or an unexpected root. Name it in the Done report as that; the project's file is neither changed nor stamped.

**One `AskUserQuestion` covers every file in cases 0 and 2 together — never one per file, and none when that set is empty.** The `permissions` selector is the one that asks on a normal run, and that is the budget. Ask in the project's chat language per `rules/fusion-workbench-conventions.md` `## Project language`, following `rules/user-facing-output.md` and the chat profile. Specified here in English:

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

## config — the project's own configuration file

fusion reads `./fusion.json` at the project root and merges it over its own built-in defaults, so this file is where a project declares which of its non-Markdown files carry record citations (`hooks/lib/config.ts`; the seeded template declares nothing and therefore inherits everything). It belongs in version control: every change to which files fusion's citation helpers read has to show up in a diff.

It lands at the project root, beside `fusion-workbench/` rather than inside it, in the directory `pwd` reports. The "never prepend `cd`" rule at the top of this skill is what keeps it there.

First check whether the project already has one. This is read-only and always allowed:

```bash
[ -f ./fusion.json ] && echo "fusion.json present" || echo "fusion.json absent"
```

- **`present`** — nothing to do. Do not run the copy anyway: the template declares nothing, so copying it over a project's filled-in file would replace a real setting with an empty inheritance.
- **`absent`** — seed the template. The copy is idempotent and never overwrites:

  ```bash
  [ -f ./fusion.json ] || { cp "$FUSION_PLUGIN_ROOT/templates/fusion.json" ./fusion.json && echo "fusion.json template copied — declares nothing and inherits fusion's own defaults until you edit it"; }
  ```

This selector does nothing about a leftover `fusion-guard.json`, nor about a retired key inside `fusion.json`. Naming either is the configuration loader's job, which does it once per guarded tool call until the file or the key is deleted. Do not read the old file here, and do not offer to move anything out of it.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, report it and continue. An absent `fusion.json` costs the project one thing and only one: fusion's citation helpers read the Markdown corpus alone, because that file is the only place a project declares anything else.

## permissions — the project's permission file

A fresh consuming project has no permission source of its own, so every `Write`, every `Edit` and every non-sandboxed shell call a fusion session makes raises an approval dialog. This selector offers to write the file that stops that. It is the only one here that asks the user for a decision on a normal run, and it asks **once**.

### 1. Ask

One `AskUserQuestion`, in the project's chat language, naming the file and what the setting does in plain words rather than behind the term:

> fusion writes `.claude/settings.local.json` in this project so future sessions run without asking you to approve each tool. That setting is `bypassPermissions`: Claude Code stops prompting for file writes, edits and shell commands in this project. It still asks before catastrophic operations such as `rm -rf /`. Write it?

Two options. **"Yes, write it" is the default and the recommended choice.** "No, keep the prompts" is the other; nothing is written and the run continues.

Read `.claude/settings.local.json` first if it exists. **A file that does not parse as JSON gets no question and no write**: report it in §3 as a file the user fixes by hand, naming the path, and continue. Otherwise note `permissions.defaultMode`. Already `bypassPermissions` — skip the question, still union the `allow` list (§2, item 3), and report the union (§3). Any **other** value — the question must name it and say plainly what happens to it: *this project currently sets `defaultMode: "<existing>"`; saying yes replaces it.* A replacement the question did not name is not a replacement the user consented to.

### 2. On "yes", write it

Target: `.claude/settings.local.json` in `pwd` — the project root. Merge into any existing file; never overwrite one.

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
- **Declined:** say plainly that per-tool approval prompts stay on for this project, and that this check can seed the file on a later run.

If the project already had `defaultMode: "bypassPermissions"`, say so, say the `allow` list was unioned, and skip the question — there is nothing to decide. Any other existing `defaultMode` survives the run untouched unless the user answered yes to the question that named it.
- **Malformed:** name the path, say the file did not parse and was left exactly as it was, and that the offer returns once it parses.

## gitattributes — the union merge driver for the event log

`fusion-workbench/orchestrator-events.jsonl` is the one workbench file every checkout appends to, so git's default text merge turns two checkouts' sessions into a conflict nobody should resolve by hand. This step asks git whether a merge driver already applies there and declares `merge=union` only where none does. `rules/workbench-tracking.md` `## The event log carries a union merge driver` holds the reasoning, including why the question is `git check-attr` and never a text search of `.gitattributes`; do not restate it here.

Like `config` and `permissions`, the write lands at the project root: `./.gitattributes` in the directory `pwd` reports, outside `fusion-workbench/` and never in a subfolder. **This selector asks the user nothing**, which is what keeps `permissions` the only one that asks on a normal run.

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ]; then
  D=$(git check-attr merge -- fusion-workbench/orchestrator-events.jsonl | sed 's/.*: //')
  case "$D" in
    union) echo "gitattributes: a union merge driver already applies — nothing written" ;;
    unspecified)
      [ -s ./.gitattributes ] && [ -n "$(tail -c1 ./.gitattributes)" ] && printf '\n' >> ./.gitattributes
      printf '# fusion: the orchestrator event log is append-only and two checkouts both append to it.\nfusion-workbench/orchestrator-events.jsonl merge=union\n' >> ./.gitattributes
      echo "gitattributes: union merge driver written to $(pwd)/.gitattributes" ;;
    set) echo "gitattributes: left alone — this path takes git's default text merge (a bare 'merge'), the case this check exists to prevent; fusion does not overrule it" ;;
    unset) echo "gitattributes: left alone — merging is switched off for this path ('-merge')" ;;
    *) echo "gitattributes: left alone — this path already has merge driver '$D'" ;;
  esac
else
  echo "gitattributes: not a git work tree — nothing written"
fi
```

## identity — this checkout's identity, and a Circle it never activated

A `_t_` Circle record travels between checkouts and `.active-circle` does not (`rules/workbench-tracking.md`), so a clone taken mid-Circle holds an active record with no pointer: `MISSING-POINTER`, the condition `agents/playmaker.md` names and `/fusion:next` renders. A pointer deleted by hand is that same state.

**Two conditions here ask**, each at most once per checkout: that one, and a checkout with no registry entry.

**This checkout's identity is read here, and the read mints it.** `bin/fusion-identity` prints `PERSON=` and `CHECKOUT=`; its header documents the mint and the six exit codes, and `rules/fusion-workbench-conventions.md` `### Who filed it` what each obliges; restate neither. Report both in the Done report, or a non-zero exit's reason unchanged. Hold the identity fragment `<ID>` as your own Setup step 2 defines it (the bullet "Who, which checkout, which session"): three keys, `session_id` from the line a SessionStart hook printed into your context, and no line means no key.

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-identity"
```

**And its name**, with the `CHECKOUT=` just read for `<hex>`:

```bash
C="$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name"
[ -x "$C" ] && { "$C" resolve "<hex>"; echo "exit=$?"; }
```

- **`$C` exit 3** — unregistered. Ask and `register` as that helper's header prescribes.
- **`$C` exit 0** — registered. Bare `register`. On both, act on any `collision=`.
- **`$C` exit 2, 4 or 5**, from either call — write nothing; report `checkout-registry=unread` and the reason `$C` gave. No `$C`: `helper-missing`.
- **`bin/fusion-identity` exit 1** — halt per `### Who filed it`: register nothing. Its **3 or 5**: no hex, skip this block, `unread`. Its **4**: no person, register anyway.

The rest: that helper's header.

```bash
[ -f ./fusion-workbench/.active-circle ] && echo pointer-present
find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_t_circle.md' 2>/dev/null
```

The count is taken unconditionally; the pointer gates the offer, not the detection.

- **No path, or one path with `pointer-present`** — report nothing, ask nothing: a pointer is present, whichever Circle it names.
- **One path and no `pointer-present`** — the directory name is its second-to-last segment. Read the record's first `## Directive` line, then one `AskUserQuestion` in the project's chat language: name both, say the Circle is active in the project but not in this checkout, and offer *Activate it here* / *Leave it inactive*. Read the record's `**Claim:**` too: where it opens with `Claimed ` and names an identity other than the one just read, name the holder and the time **before** the offer, and the offer overrides, writing the field's `Overridden ` sentence per `rules/circle-records.md` `### The claim field`. `Unclaimed`, no field, or this checkout's own identity behaves as today.
  - **Activate** — `printf '%s\n' "<dir>" > ./fusion-workbench/.active-circle`. Step 2 resolves against it.
  - **Leave** — write nothing; the Circle stays inactive here, and `/fusion:next` can activate it later.
- **More than one path, pointer or not** — attribute before you report. Sort the records by `**Claim:**` against the identity read above, per `rules/circle-records.md` `### How many Circles may be active, and in whose checkout`, and name the outcome that section gives. On `MULTI-CHECKOUT` say so in its terms, that one active Circle per checkout is the designed shape and not a condition, naming each holder through `"$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" resolve <hex>` under its `[ -x ]` guard, its misses in that helper's header. On `MULTIPLE-ACTIVE` or `CLAIM-UNATTRIBUTED` name every record found and what failed. **Offer nothing and write nothing in any of the three**: which Circle to run here is a portfolio judgement, and `/fusion:next` is where the project makes it. Point the user there.

Name the branch that ran in the Done report.

## gitignore — a tracked workbench against the four-class partition

`rules/workbench-tracking.md` `## The four classes` says which root entries travel and which stay; decisions `260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md` and `260825-1030_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md` say what fusion does when a tracked workbench's `.gitignore` departs from it: repair an excluded R2/R3 entry with a negation line, report a tracked class L entry, repair `.checkout-id` alone (the one whose tracking gives a wrong answer, not noise), never touch an R1 exclusion, ask nothing. Only in a git work tree that already tracks `fusion-workbench/`; the choice not to track is the project's. The question is `git check-ignore -q`, never a text read of `.gitignore`, for the reason the rule gives for `git check-attr`. A class L entry that is neither tracked nor ignored is reported as well: no rule covers it, so it stands as `??` in `git status` from the moment it holds a byte, and the next `git add` of a directory commits it. **That entry is found with `git ls-files --others --exclude-standard` over it** — what git would actually pick up — and never with `check-ignore` on the entry's own path, which is the wrong question for a directory covered by the `dir/*` form (defect `260905-2234_*_step-0js-new-unignored-branch-fires-on-a-directory-whose-contents-are-ignored-by-the-dir-star-form.md`). The existence test that stood in front of it went with the question it guarded. Reported and not repaired, because nothing is tracked yet and the direction-B criterion repairs a wrong answer, not a risk (defect `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md`).

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ] && git ls-files --error-unmatch fusion-workbench >/dev/null 2>&1; then
  for p in orchestrator-events.jsonl .fusion-setup .asset-provenance; do
    git check-ignore -q "fusion-workbench/$p" || continue
    grep -qxF "!fusion-workbench/$p" ./.gitignore 2>/dev/null || { [ -s ./.gitignore ] && [ -n "$(tail -c1 ./.gitignore)" ] && printf '\n' >> ./.gitignore; printf '!fusion-workbench/%s\n' "$p" >> ./.gitignore; }
    if git check-ignore -q "fusion-workbench/$p"; then echo "gitignore: $p still excluded by a nested ignore file, $(git check-ignore -v "fusion-workbench/$p" | cut -f1) — not repaired"; else echo "gitignore: $p was excluded — negation appended to $(pwd)/.gitignore"; fi
  done
  if git ls-files --error-unmatch fusion-workbench/.checkout-id >/dev/null 2>&1; then
    git rm -q --cached fusion-workbench/.checkout-id && printf 'fusion-workbench/.checkout-id\n' >> ./.gitignore && echo "gitignore: .checkout-id was tracked — untracked (file kept on disk) and excluded"
  fi
  for p in .session-marker .active-circle .cadence-anchors .commit-lock monitor portfolio.md .guard-state; do
    if git ls-files --error-unmatch "fusion-workbench/$p" >/dev/null 2>&1; then echo "gitignore: class L entry $p is tracked — not repaired, report it"
    elif [ -n "$(git ls-files --others --exclude-standard -- "fusion-workbench/$p")" ]; then echo "gitignore: class L entry $p is untracked and covered by no ignore rule — not repaired, report it"
    fi
  done
fi
```

Every line printed goes into the Done report verbatim; nothing printed means nothing to report.

## upstream — whether this checkout is behind its upstream (advisory)

This step reads how far the current branch is behind its upstream and **does not fetch**. The read is local, so what it answers is "behind what this checkout last saw", and the age of that view is reported together with the number in every case. A count printed without its age is the one shape this step may not produce (issue `260905-1850_*_setup-does-not-notice-that-the-checkout-is-behind-its-remote.md`). Fetching would answer the sharper question and was refused for what it costs in a session's mandatory first step; the reasons are in that issue's `Resolved:` note. Fetching stays the user's move.

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" != "true" ]; then echo "upstream=no-work-tree"; else
  B="$(git symbolic-ref -q --short HEAD 2>/dev/null)"
  U=""; [ -n "$B" ] && U="$(git for-each-ref --format='%(upstream:short)' "refs/heads/$B")"
  if [ -z "$U" ]; then echo "upstream=none"; else
    echo "upstream=$U"
    if C="$(git rev-list --left-right --count "$U...HEAD" 2>/dev/null)"; then
      echo "behind=$(printf '%s' "$C" | cut -f1) ahead=$(printf '%s' "$C" | cut -f2)"
    else echo "counts=unread"; fi
    F="$(git rev-parse --git-path FETCH_HEAD)"
    if [ -f "$F" ]; then echo "fetched_hours_ago=$(( ($(date +%s) - $(date -r "$F" +%s)) / 3600 ))"; else echo "fetched=never"; fi
  fi
fi
```

One line in the project's chat language, and no line carrying a count omits the age:

- **`behind=` non-zero:** how many commits, the `upstream=` name, the age, and that a pull is owed.
- **`behind=0` with `ahead=` non-zero:** nothing to pull as of that view; the branch is that many commits ahead and unpushed. The age is still said.
- **`behind=0 ahead=0`:** level as of that view, with the age.
- **`fetched=never`:** the count was taken against a remote this checkout has never contacted, so it is not evidence of anything. Say to fetch. This is the case the record was filed on, and it reads as a warning whatever the count says.
- **`fetched_hours_ago=` above 24:** lead with the age and put the count after it, not the other way round.
- **`upstream=none`:** no upstream is configured for the current branch. A detached HEAD reads the same way.
- **`upstream=no-work-tree`:** not a git work tree, so nothing is owed here and nothing is a fault.
- **`counts=unread`:** an upstream is configured and its remote-tracking ref could not be read. Name it unread beside the upstream name; never print a zero in its place.

Advisory throughout: no branch of this selector blocks anything, and none of them asks the user anything.

## leftovers — files written by mechanisms fusion no longer ships

Probe for the halt flag and for the three inert files `rules/workbench-tracking.md` `## The four classes` names as written by nothing at this version; this is read-only:

```bash
[ -f ./fusion-workbench/.guard-state/escalation.json ] && grep -q '"haltActive"[[:space:]]*:[[:space:]]*true' ./fusion-workbench/.guard-state/escalation.json && echo "legacy halt flag present" || echo "no legacy halt flag"
for f in escalation.json churn.json state-drift.json; do [ -f "./fusion-workbench/.guard-state/$f" ] && echo "leftover: $f"; done
```

**`no legacy halt flag` and no `leftover:` line — say nothing at all.** An absent file, an unreadable one and `haltActive: false` are the ordinary case, and none of them gets a line in the report.

**Any `leftover:` line** — this project is carrying state written by a mechanism fusion no longer ships. **No check fusion still ships can raise a halt**, and no code at this version reads the flag or the files: nothing is blocked by any of them, and no tool behaves differently whether they stay or go. Do not attribute the flag to a particular check — two of them could set it, and which one this project met is not readable from the file. Offer to delete them with one `AskUserQuestion`, in the project's chat language, the same way the `permissions` selector asks its question, listing the files found and saying `halt flag present` where it is:

> This project still carries leftover files in `fusion-workbench/.guard-state/` (`escalation.json`, halt flag present; `churn.json`). The mechanisms that wrote them are no longer part of fusion and no current version reads them, so nothing is being blocked. Delete the leftover files?

Two options. **"Delete them" is the default and the recommended choice:**

```bash
rm -f ./fusion-workbench/.guard-state/escalation.json ./fusion-workbench/.guard-state/churn.json ./fusion-workbench/.guard-state/state-drift.json
```

"Keep them" is the other: nothing is written, the run continues, and the offer comes back the next time this selector runs.

**Name the effect exactly, and claim nothing beyond it.** Deleting the files removes leftovers. It does not clear a halt, unblock writes or restore write access, because at this version nothing is blocked and nothing was taken away. Report it in those terms: which files were deleted and nothing about what is allowed changed, or the files were left in place.

## Stamp what you ran

**Last, and only over the selectors this run actually performed.** A selector you skipped, or one whose block could not read what it needed, is **not** stamped: a stamp is a claim that the check was taken, and a claim nobody took is the one thing this record must never carry. Substitute the selectors you ran for `<sel...>`:

```bash
M=./fusion-workbench/.fusion-setup
V="$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
[ -n "$V" ] || { echo "stamp-skipped: plugin version unresolved"; exit 0; }
command -v node >/dev/null 2>&1 || { echo "stamp-skipped: no node on PATH"; exit 0; }
node -e '
const fs = require("fs"); const [m, v, ...ran] = process.argv.slice(1);
let o = null; try { o = JSON.parse(fs.readFileSync(m, "utf8")); } catch {}
if (typeof o !== "object" || o === null) { console.log("stamp-skipped: no readable marker"); process.exit(0); }
if (typeof o.checks !== "object" || o.checks === null) o.checks = {};
const at = new Date().toISOString().slice(0, 10);
for (const sel of ran) o.checks[sel] = { at, version: v };
fs.writeFileSync(m, JSON.stringify(o) + "\n");
console.log("stamped=" + (ran.join(",") || "none"));
' "$M" "$V" <sel...>
```

Any `stamp-skipped:` line means the marker was not written, so every selector you just ran is asked for again on the next Setup. Say so; do not write the marker by hand to make the line go away.

## Done

Report, in the project's chat language and following `rules/user-facing-output.md` and the chat profile: which selectors ran and what each had to say, in the terms its own section names, plus the stamp line. A selector with nothing to report says nothing.
