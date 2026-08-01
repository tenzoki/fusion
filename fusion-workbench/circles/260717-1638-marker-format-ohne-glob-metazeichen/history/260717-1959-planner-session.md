# Planner session — marker-format underscore plan

**Date:** 2026-07-17 19:59
**Agent:** planner (domain: code, executors: coder)
**Circle:** 260717-1638-marker-format-ohne-glob-metazeichen
**Status:** Complete

## What was done

Produced the implementation plan `planning/260717-1959[o]-plan-marker-format-underscore.md`
for switching state markers from bracket delimiters (`[o]`) to underscore
delimiters (`_o_`) so no marker written into a shell glob is silently a
character class.

## Key findings (verified, not assumed)

- **`bin/fusion-paths` does NOT parse a marker.** The dispatch brief claimed it
  reads the marker out of the record filename via a sed regex; it does not. The
  resolver reads `.active-circle` (a bare, markerless directory name) and needs
  no functional change. `bin/monitor` and the TS hooks parse no markers either.
- The eight marker-parsing sites are all shell: orchestrator, playmaker, next,
  archive, setup (x2), migrate (x2).
- Blast radius: 556 bracket-marker mentions in agents/skills/rules, +67 in
  README/CLAUDE.md/docs, +37 marker-named workbench files (incl. both Circle
  records and this Circle's own active `[t]-circle.md`).
- Underscore forms verified under zsh 5.9: `*_o_*.md` matches open files, not
  `_p_`/`_c_`; `_t_circle.md` matches literally; the sed underscore forms parse
  and strip correctly; slugs never contain `_`, so no collision.

## Recommendations carried to the gate

1. Prose scope A (underscore everywhere, incl. vocab tables + prose) over B
   (filenames/globs/parsers only) — single-source-of-truth, no split rule,
   closes the copy-paste vector, lets the lint stay strict.
2. Migration approach M1: extend `/fusion:migrate` to detect and reformat
   bracket-marker files; M3 (dual-read) rejected — it re-introduces the
   escaped-bracket glob this Circle exists to remove.
3. Path-lint: yes — add a strict bracket-marker reject over agents/skills,
   reusing the existing {setup, migrate} exemption.
4. Sequencing: this Circle lands FIRST, then the zsh-fix plan
   (`shared/planning/260717-1918[o]`), which is re-grounded afterward (its
   site-12 bracket special-casing dissolves once markers are underscores).

## Output

- Plan: `circles/260717-1638-.../planning/260717-1959[o]-plan-marker-format-underscore.md`
  (7 steps, all executor `coder`; 2 Mermaid diagrams).
