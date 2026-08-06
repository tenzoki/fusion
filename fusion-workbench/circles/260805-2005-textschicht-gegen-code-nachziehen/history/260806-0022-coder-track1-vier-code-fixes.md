# Coder session — Track 1: the four code fixes (plan steps 4–7)

**Date:** 2026-08-06
**Agent:** coder
**Plan:** `planning/260805-2353_p_plan-textschicht-gegen-code.md`, Track 1 (steps 4, 5, 6, 7)
**Status:** Complete

## What was done

All four Track 1 fixes executed in order, each with its falsifier checked before the change.

### Step 4 — `shared_of` under zsh (`skills/archive/SKILL.md`)

- Falsifier reproduced first: the shipped snippet printed nothing under `zsh -c` and `shared/planning` under `bash -c` — the measured silent data loss is real (zsh does not word-split an unquoted parameter expansion).
- Fix: iterate over `$(printf '%s\n' "$1")` instead of `$1` — both shells field-split an unquoted command substitution; store paths carry no whitespace. Comment in the snippet states why.
- Added the non-empty distinction (`HYG-NO-SILENT-FAIL`): a loop over the five derived `SHARED_*` values halts with a named per-kind reason and exit 1 when any comes back empty, plus a prose paragraph instructing the skill to stop rather than report "nothing to archive".
- `skills/cleanup/SKILL.md` step 4 carries no copy of the snippet — it reads and executes the archive skill body, so the fix covers it. No cleanup edit needed.
- Verified standalone under `zsh -c` and `bash -c`: active-circle case and no-circle case both print the shared path in both shells; the empty-derivation check aborts with the named reason.

### Step 5 — `emit_if_exists` dies under `set -eu` (`bin/fusion-rules`)

- Falsifier first: grepped every `fusion-rules` caller across `agents/`, `skills/`, `bin/`, `hooks/`, `install.sh` — all callers are prose Setup instructions; none branches on the exit code, so no caller depends on the abort.
- Fix: `[ -f "$1" ] || return 0; printf …` with a comment citing the contract (`rules/agent-setup.md`, "missing files are skipped silently").
- Verified against a stripped plugin copy missing `decision-record-examples.md`: pre-fix behaviour demonstrated (partial emission, 2 of 8 paths, exit 1); post-fix exits 0 and emits every remaining path.
- Regression suite added to `hooks/lib/__tests__/context-manifest.test.ts` (the script-driving precedent): 2 tests driving the real script against a stripped plugin copy.

### Step 6 — setup bracket probe shape (`skills/setup/SKILL.md`, `skills/migrate/SKILL.md`)

- Falsifier first: read `/fusion:migrate`'s executor. Its rename pass converts exactly `\[([oatcibspd])\]-` (marker letter + trailing hyphen, unanchored). The plan's sketched regex (`^[0-9]{6}-[0-9]{4}\[[a-z]\]`) would have been both wider (letters migrate cannot convert → deadlock recreated) and narrower (unanchored convertible names missed). The flat-Circle-file form is a separate pass with its own already-correct probe on the same line.
- Fix: the whole-tree probe's broad `-name '*[[]*[]]*.md'` stays as cheap prefilter, piped through `grep -E '\[[oatcibspd]\]-[^/]*$'` — the executor's exact set. The three frozen-store exclusions untouched. Prose paragraph added stating the probe-consistency rule.
- Probe-consistency also applied inside migrate: its survey `REFORMAT` count and its executor candidate list gained the identical filter, so the proposal never counts a rename the pass would silently skip; one sentence added to migrate's Step-4 notes.
- Verified in a scratch workbench with the probe line extracted verbatim from the edited skill, under zsh and bash: `notes [draft].md` → OLD=0; `260101-1200[o]-topic.md` → OLD=1; marker file only under `archive/` → OLD=0; migrate's narrowed survey counts 1 of the 2 bracket files.
- Residual found and filed: the two files still differ in *scope* (setup probes the whole tree; migrate reformats only `shared/` + `circles/` depth ≥ 2) — `issues/260806-0022_o_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md`.

### Step 7 — garbled awk message (`bin/fusion-rules`)

- Falsifier first, on macOS `/usr/bin/awk`: `"\x27agents"` prints `zgents'` (BWK awk consumes trailing hex digits greedily; 0x27a & 0xff = 'z'); `\047` prints `'agents:'` verbatim.
- Fix: all 8 `\x27` occurrences in the embedded awk program replaced with the octal `\047` (bounded at three digits, never greedy).
- Verified through the real script with a malformed manifest: stderr reads `fusion-rules: malformed context-manifest.yaml: unit 'rules/big-knowledge.md' is missing 'agents:'` verbatim, exit 3; the `topics:` sibling message equally clean; a well-formed manifest still emits its units, exit 0.
- Message assertions added to `context-manifest.test.ts`: 2 tests asserting the byte-exact message and the absence of the garble.

## Verification summary

- Full suite: `cd hooks && npx vitest run` → **27 files, 1555 tests, all green** (baseline 1551 + the 4 added regression cases).
- No emitted rule file changed (code and skill bodies only), so the emission golden is untouched by construction.

## Files changed

- `skills/archive/SKILL.md` — shared_of snippet + non-empty check + prose
- `bin/fusion-rules` — emit_if_exists return-0; `\x27` → `\047` (8 sites)
- `skills/setup/SKILL.md` — bracket-probe filter + probe-shape prose
- `skills/migrate/SKILL.md` — same filter on survey + executor candidate list, one prose sentence
- `hooks/lib/__tests__/context-manifest.test.ts` — 4 regression tests (28 → 32 in that file)
- `planning/260805-2353_p_plan-textschicht-gegen-code.md` — steps 4–7 marked [DONE]
- `issues/260806-0022_o_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` — new (scope residual)

Source issues deliberately left open — the plan's step 17 closes them in one bookkeeping pass.
