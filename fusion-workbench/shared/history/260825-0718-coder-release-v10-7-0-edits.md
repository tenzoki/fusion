# coder — v10.7.0 release edits (no commit)

**Date:** 2026-08-25
**Agent:** coder
**Status:** Complete

## What was done

- `.claude-plugin/plugin.json`: version 10.6.0 → 10.7.0. Description left unchanged: it describes the roster, the observation-only hook, the curator and the monitor, and none of the 25 commits in `571f945..HEAD` changed any of those. The marketplace entry's description therefore stays identical to it without an edit.
- Marketplace `.claude-plugin/marketplace.json` (working clone `F03-CLAUDE-plugin-marketplace/claude-plugins`): fusion version → 10.7.0.
- `install.sh`, `README.md`: pin example `tags/v10.6.0` → `tags/v10.7.0`.
- `docs/upgrading-to-v10-7.md`: new note, 4 7xx bytes, between its two siblings in size.
- `README.md` `## Install`: `**Upgrading from v10.6?**` paragraph above the v10.5 one.
- `skills/help/SKILL.md` update topic: v10.6→v10.7 paragraph added first, v10.3→v10.4 paragraph dropped; the v10.5 and v10.4 paragraphs point at the notes above them. Net −153 bytes on `skills/`.
- `CLAUDE.md` `docs/` row: verified true as written (README `## Install` and the three-release cap in `/fusion:help`), no edit.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated; `reference-resolution-lint.test.ts` BASELINE re-approved 1357/190 → 1374/192 on the existing line, no net test line.

## Verification

- `cd hooks && npm test` — exit 0 (43 files, 760 tests).
- `claude plugin validate .` — passed with the one standing CLAUDE.md warning, exit 0.

Not committed, not pushed, no tag; the orchestrator commits.
