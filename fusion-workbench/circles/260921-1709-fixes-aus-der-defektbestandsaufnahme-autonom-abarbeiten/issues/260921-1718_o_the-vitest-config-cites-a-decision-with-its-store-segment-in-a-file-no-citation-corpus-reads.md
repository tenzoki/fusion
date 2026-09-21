The vitest config cites a decision with its store segment, in a file no citation corpus reads

---
`hooks/vitest.config.mjs`, the comment block opening "What this is not" above `const half`, cites the fork-cap decision (`260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`) with the shared decision store's segment in front of the basename. The store segment is what an archive sweep moves, so the citation dies at the sweep (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), and no gate reports it: `reference-resolution-lint` scans `hooks/*.ts` and `hooks/lib/*.ts`, `fusion.json` `citations.extraPaths` declares `hooks/*.ts`, and a `.mjs` is in neither corpus.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Evidence.** `grep -n 'shared/decisions/' hooks/vitest.config.mjs` prints one line, the citation named above; `bin/fusion-citation-check` over this tree reports `store-prefixed=0`, so the token is outside every corpus rather than tolerated inside one. Found by the survey `260921-1653-open-defect-survey-at-11-9-1.md` (recommendation 6) while verifying its row 7; filed here because the package this container runs fixes it.

**Acceptance.** The comment cites the storeless basename with the marker wildcarded, and the file is inside a citation corpus so the next such token is reported: `hooks/*.mjs` is declared in `fusion.json` `citations.extraPaths`, or the lint's `surface()` walks it, and `bin/fusion-citation-check` names the file among `declared-files` (or the lint names it) with `store-prefixed=0` afterwards.
