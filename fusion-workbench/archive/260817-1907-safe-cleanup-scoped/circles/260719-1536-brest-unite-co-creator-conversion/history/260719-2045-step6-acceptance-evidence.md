# Step 6 — Acceptance Evidence: unite-co-creator context-loading conversion

**Date:** 2026-07-19 20:45
**Agent:** coder
**Plan:** `260719-1917_*_unite-context-loading-conversion.md` (Step 6)
**Verdict:** PROVEN — all 9 acceptance checks pass.

This is verification-only. No unite file was edited; nothing was committed. The single write is this evidence log.

## Setup

- Target repo `$U = /Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator`.
- All `fusion-rules` runs executed with **CWD = `$U`** so `./rules/context-manifest.yaml` and `rules/*` resolve to unite.
- `FR = $FUSION_PLUGIN_ROOT/bin/fusion-rules`.
- unite has a `fusion-workbench/` but **no `.active-circle`**, so `$FR <agent>` (no topic arg) derives no topic — check 5 is deterministic.
- The lines prefixed with the plugin-repo absolute path (`.../codebase/fusion/rules/*.md`) and `./fusion-workbench/stilwerk/*.yaml` are the plugin's always-on rules + voice profiles, emitted on every call regardless of topic. The unite units are the `rules/*.md` and `skill:*` lines.

## Per-check result

| # | Check | Result |
|---|---|---|
| 1 | Topic-scoped inclusion (`ontocoder ontology` includes both ontology files) | PASS |
| 2 | Topic-scoped exclusion (`ontocoder license` excludes both ontology files) | PASS |
| 3 | Cross-topic pull (`coder go`→GO-GOTCHAS; `planner architecture`→ARCHITECTURE-RULES) | PASS |
| 4 | `[always]` survives every topic (`coder license` still has CODING-HYGIENE + ARCHITECTURE-RULES) | PASS |
| 5 | No-regression / no-topic (`coder` emits plugin always-on + coding-frontend.md + `[always]` units, no topic leak) | PASS |
| 6 | Duplicate-emission gone (`coder \| sort \| uniq -d` empty) | PASS |
| 7 | All rule files reachable (14 of 14 — see note) | PASS |
| 8 | Manifest well-formed (every run exits 0, never exit 3) | PASS |
| 9 | Lean index (CLAUDE.md 43,145 → 8,504 bytes, 80.3% reduction) | PASS |

**Note on check 7 count:** the task labels this "all 12 rules" but its own breakdown enumerates 14 files (12 loaded via the manifest = 10 pre-existing UPPERCASE + the 2 new gotchas files; plus 2 loaded via the pattern matcher = `coding-frontend.md`, `investigator-capture-layout.md`). `git ls-files 'rules/*.md'` tracks exactly 14. All 14 are reachable. The "12" names the manifest-loaded subset only; nothing is unreachable.

---

## Check 1 — Topic-scoped inclusion

Command: `$FR ontocoder ontology` (CWD=$U)

Output (unite units):
```
rules/RULES-INDEX.md
rules/ONTO-ENG-RULES.md
rules/ONTOLOGY-GOTCHAS.md
```
exit=0

`rules/ONTO-ENG-RULES.md` and `rules/ONTOLOGY-GOTCHAS.md` both present. PASS.

## Check 2 — Topic-scoped exclusion

Command: `$FR ontocoder license` (CWD=$U)

Output (unite units):
```
rules/RULES-INDEX.md
rules/LICENSE-POLICY.md
```
exit=0

Neither ontology file appears (only the `[always]` RULES-INDEX + the license-topic unit). PASS.

## Check 3 — Cross-topic pull

Command: `$FR coder go` (CWD=$U) — unite units:
```
./rules/coding-frontend.md
rules/CODING-HYGIENE.md
rules/ARCHITECTURE-RULES.md
rules/RULES-INDEX.md
rules/GO-GOTCHAS.md
```
exit=0 → `rules/GO-GOTCHAS.md` present. PASS.

Command: `$FR planner architecture` (CWD=$U) — unite units:
```
./rules/coding-frontend.md
rules/CODING-HYGIENE.md
rules/ARCHITECTURE-RULES.md
rules/RULES-INDEX.md
skill:unite-mos-sc-skill
```
exit=0 → `rules/ARCHITECTURE-RULES.md` present. PASS.
(ARCHITECTURE-RULES is tagged `[always]`, so it emits on any topic including `architecture`; the `architecture` topic additionally pulls `skill:unite-mos-sc-skill` as tagged.)

## Check 4 — `[always]` survives every topic

Command: `$FR coder license` (CWD=$U) — unite units:
```
./rules/coding-frontend.md
rules/CODING-HYGIENE.md
rules/ARCHITECTURE-RULES.md
rules/RULES-INDEX.md
rules/LICENSE-POLICY.md
```
exit=0 → CODING-HYGIENE + ARCHITECTURE-RULES both present under a non-code topic. PASS.

## Check 5 — No-regression / no-topic

Command: `$FR coder` (no topic, no active unite Circle) (CWD=$U)

Full output:
```
/Users/kai/.../codebase/fusion/rules/agent-setup.md
/Users/kai/.../codebase/fusion/rules/fusion-workbench-conventions.md
/Users/kai/.../codebase/fusion/rules/decision-record-examples.md
/Users/kai/.../codebase/fusion/rules/user-facing-output.md
/Users/kai/.../codebase/fusion/rules/critical-stance.md
/Users/kai/.../codebase/fusion/rules/git-branch-discipline.md
./fusion-workbench/stilwerk/chat-voice-en.yaml
./rules/coding-frontend.md
rules/CODING-HYGIENE.md
rules/ARCHITECTURE-RULES.md
rules/RULES-INDEX.md
```
exit=0

Emits: the plugin always-on rules + chat-voice profile, the pattern-loaded `./rules/coding-frontend.md`, and the three `[always]` manifest units (CODING-HYGIENE, ARCHITECTURE-RULES, RULES-INDEX). No topic-scoped unit leaks — no GO-GOTCHAS, FE-DESIGN, CO-CREATOR, CENTRAL, ONTO-ENG, ONTOLOGY-GOTCHAS, READER-ABSTRACTION, NORMATIVE, LICENSE, and no skills. PASS.

## Check 6 — Duplicate-emission gone

Command: `$FR coder | sort | uniq -d` (CWD=$U)

Output: empty (no duplicate lines).

Pre-conversion, `coding-frontend.md` double-emitted (once from `rules/`, once from the `.claude/rules/` mirror). The mirror removal (Step 4) eliminates the duplicate. PASS.

## Check 7 — All rule files reachable

Each rule file probed via an appropriate (agent, topic) pair; `REACHABLE` = the file appeared in that call's output.

```
REACHABLE  CODING-HYGIENE.md             <-  $FR coder            (no topic; [always])
REACHABLE  ARCHITECTURE-RULES.md         <-  $FR coder            (no topic; [always])
REACHABLE  RULES-INDEX.md                <-  $FR coder            (no topic; [always])
REACHABLE  ONTO-ENG-RULES.md             <-  $FR ontocoder ontology
REACHABLE  ONTOLOGY-GOTCHAS.md           <-  $FR ontocoder ontology
REACHABLE  READER-ABSTRACTION-RULES.md   <-  $FR coder llm-pipeline
REACHABLE  GO-GOTCHAS.md                 <-  $FR coder go
REACHABLE  CO-CREATOR-DEV-RULES.md       <-  $FR coder co-creator
REACHABLE  CENTRAL-DEV-RULES.md          <-  $FR coder central
REACHABLE  FE-DESIGN-RULES.md            <-  $FR coder frontend
REACHABLE  NORMATIVE-MATERIAL-POLICY.md  <-  $FR coder normative
REACHABLE  LICENSE-POLICY.md             <-  $FR coder license
REACHABLE  coding-frontend.md            <-  $FR coder            (pattern: `coding`)
REACHABLE  investigator-capture-layout.md<-  $FR investigator     (pattern: `investigator`)
```

`git ls-files 'rules/*.md'` (14 files):
```
rules/ARCHITECTURE-RULES.md
rules/CENTRAL-DEV-RULES.md
rules/CO-CREATOR-DEV-RULES.md
rules/coding-frontend.md
rules/CODING-HYGIENE.md
rules/FE-DESIGN-RULES.md
rules/GO-GOTCHAS.md
rules/investigator-capture-layout.md
rules/LICENSE-POLICY.md
rules/NORMATIVE-MATERIAL-POLICY.md
rules/ONTO-ENG-RULES.md
rules/ONTOLOGY-GOTCHAS.md
rules/READER-ABSTRACTION-RULES.md
rules/RULES-INDEX.md
```
14 of 14 reachable (12 via manifest + 2 via pattern matcher). PASS.

## Check 8 — Manifest well-formed (exit-code sweep)

Every invocation across all topics exited 0 (a malformed manifest would exit 3):
```
exit=0  $FR coder
exit=0  $FR ontocoder ontology
exit=0  $FR ontocoder license
exit=0  $FR coder go
exit=0  $FR planner architecture
exit=0  $FR coder license
exit=0  $FR coder llm-pipeline
exit=0  $FR coder co-creator
exit=0  $FR coder central
exit=0  $FR coder frontend
exit=0  $FR coder normative
exit=0  $FR investigator
exit=0  $FR ontocoder
exit=0  $FR planner
exit=0  $FR coderev frontend
```
No exit 3 anywhere. PASS.

## Check 9 — Lean index

`wc -c $U/CLAUDE.md`:
```
before: 43,145 bytes
now:     8,504 bytes
delta:  -34,641 bytes (80.3% reduction)
```
PASS.

---

## Overall verdict: PROVEN

Selective, topic-scoped rule loading works end-to-end against the shipped `bin/fusion-rules` from CWD=$U: topic inclusion/exclusion holds, `[always]` units survive every topic, the no-topic baseline leaks no topic-scoped unit, the mirror-caused duplicate is gone, all 14 rule files are reachable, the manifest is well-formed on every run, and CLAUDE.md is reduced 80.3% (43,145 → 8,504 bytes). No check failed.
