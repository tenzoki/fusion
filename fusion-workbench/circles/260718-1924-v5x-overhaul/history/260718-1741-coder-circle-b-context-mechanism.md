# Coder session — Circle B: context-management mechanism (fusion-side build)

**Date:** 2026-07-18
**Agent:** coder
**Circle:** 260718-1924-v5x-overhaul
**Scope:** Circle B, fusion-side build only (steps 1–4 of the master plan). The
`unite-co-creator` reference conversion (plan steps 5–8) is explicitly a later B
step and was NOT done here.
**Status:** Complete

## What landed

A manifest + topic-unit scheme layered onto `bin/fusion-rules`, byte-identical
when absent (`HYG-NO-REGRESS`).

1. **`rules/context-manifest.md` (new)** — design-lock: manifest home
   (`./rules/context-manifest.yaml`), schema (one `units:` list; per unit exactly
   one of `path`/`skill`, plus `agents`/`topics` inline arrays with `[*]`/
   `[always]` wildcards), the emit predicate (agent-match AND topic-match), the
   four-step topic resolution (CLI arg → Circle record `Topic:`/`Tags:` → slug
   keywords → empty), the Skill-packaging boundary, and the exit-code contract
   (0/1/2 unchanged; **3 = malformed manifest**).

2. **`bin/fusion-rules` (extended)** — optional 2nd positional arg
   `<agent> [<topic>]`; `resolve_topics()` (find-driven, zsh-safe) deriving the
   topic from `.active-circle`; a manifest block gated on
   `./rules/context-manifest.yaml` existing, parsed by an embedded `awk` program
   (no YAML runtime dependency). All new emission sits inside the file-exists
   gate, so the no-manifest path is untouched. Malformed manifest → loud stderr +
   exit 3, all-or-nothing (units collected and printed only in `awk`'s END, so no
   partial set leaks). Preserves exit 1 (usage) / 2 (unknown agent).

3. **`hooks/lib/__tests__/context-manifest.test.ts` (new)** — 26 vitest cases
   driving the real script as a subprocess (the `fusion-paths.test.ts` pattern):
   byte-identical-when-absent for all 15 agents (with and without a topic arg),
   the emit predicate (agent×topic, `[*]`/`[always]`, `path` vs `skill:` output,
   append-after-always-on, cross-domain topic pull), Circle-derived topic
   resolution (slug / CLI override / record `Topic:` / `Tags:` / no-circle), and
   malformed fail-closed (6 shapes → exit 3, plus all-or-nothing), plus valid
   empty/comments-only → exit 0.

4. **Docs** — `rules/context-lean-claude-md.md` (new; the lean-`CLAUDE.md`
   convention + canonical-home split + worked before/after example — the input to
   the later `unite-co-creator` conversion and Circle E) and the two plugin
   `CLAUDE.md` spots that describe `bin/fusion-rules`. `plugin.json` 5.0.0 → 5.1.0.

## Proof

- **Byte-identical:** captured `bin/fusion-rules <agent>` for all 15 agents
  before the change; re-ran after — identical, exit 0 for every one. Topic arg
  with no manifest also byte-identical.
- **Behaviour:** fixtures confirm agent×topic matching, `[*]`/`[always]`
  wildcards, `skill:<name>` pointers, exclusion of non-matching units, and
  cross-domain topic pull (a conventions-only agent pulls a skill unit it would
  never get by pattern).
- **Fail-closed:** 6 malformed shapes → exit 3 with a clear stderr reason and no
  partial stdout. Valid empty manifest → exit 0.
- **Gates:** `cd hooks && npm test` → **258 passed** (11 files; +26 new).
  `claude plugin validate .` → passed (1 pre-existing dev-CLAUDE.md warning).

## Decisions made at implementation (plan left to implementation)

- **YAML parser = embedded `awk`.** "Minimal and greppable" ruled against a YAML
  runtime dependency; the schema is constrained to inline arrays so `awk` parses
  it. Documented as a schema constraint in `context-manifest.md`.
- **Skill-pointer format = `skill:<name>`.** Greppable, unambiguously not a
  filesystem path, mirrors the manifest field.
- **Topic is a SET, not a scalar.** Slug derivation yields multiple keyword
  tokens; a unit matches if any of its topics intersects the resolved set. This
  is what makes "slug/directive keywords" work.
- **Malformed exit code = 3.** Keeps fusion-rules' 0/1/2 contract intact.
- **New exit-0 guard.** The trailing emission is an `if`, not `[ -n … ] && …`,
  which would leave a false status as the script's last command and exit 1 on a
  valid empty/no-match manifest. (Caught and fixed during testing.)
- **Left `emit_pattern_in_dir` untouched.** It uses a bash-only nullglob loop
  that aborts under a raw `zsh` interpreter, but `bin/fusion-rules` carries a
  bash shebang and is always invoked via it, so the pre-existing construct is
  guarded. Refactoring it is out of scope (`HYG-NO-REGRESS`); my new shell is
  find/file-driven per the zsh discipline.

## Not done (later B step)

`unite-co-creator` dedup + manifest authoring + lean `CLAUDE.md` (plan steps 5–8)
— explicitly deferred per the task. The lean-`CLAUDE.md` convention doc is the
input that conversion will consume.
