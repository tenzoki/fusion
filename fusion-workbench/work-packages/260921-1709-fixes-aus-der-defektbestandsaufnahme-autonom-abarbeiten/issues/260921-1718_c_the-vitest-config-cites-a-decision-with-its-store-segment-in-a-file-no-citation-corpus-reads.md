The vitest config cites a decision with its store segment, in a file no citation corpus reads

---
`hooks/vitest.config.mjs`, the comment block opening "What this is not" above `const half`, cites the fork-cap decision (`260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`) with the shared decision store's segment in front of the basename. The store segment is what an archive sweep moves, so the citation dies at the sweep (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), and no gate reports it: `reference-resolution-lint` scans `hooks/*.ts` and `hooks/lib/*.ts`, `fusion.json` `citations.extraPaths` declares `hooks/*.ts`, and a `.mjs` is in neither corpus.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Evidence.** `grep -n 'shared/decisions/' hooks/vitest.config.mjs` prints one line, the citation named above; `bin/fusion-citation-check` over this tree reports `store-prefixed=0`, so the token is outside every corpus rather than tolerated inside one. Found by the survey `260921-1653-open-defect-survey-at-11-9-1.md` (recommendation 6) while verifying its row 7; filed here because the package this container runs fixes it.

**Acceptance.** The comment cites the storeless basename with the marker wildcarded, and the file is inside a citation corpus so the next such token is reported: `hooks/*.mjs` is declared in `fusion.json` `citations.extraPaths`, or the lint's `surface()` walks it, and `bin/fusion-citation-check` names the file among `declared-files` (or the lint names it) with `store-prefixed=0` afterwards.

---
Resolved: the comment in `hooks/vitest.config.mjs` cites the storeless basename `260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`, and `fusion.json` `citations.extraPaths` declares `hooks/*.mjs`, with a clause in the entry-level `_note` saying why (the top-level `_citations` note stays byte-identical to the template). `bin/fusion-citation-check` reports `declared-patterns=4` and `declared-files=60` (59 at HEAD `75f0c5d2`), `edited-violations=0`, `verdict=clean`; the store-prefixed count is 404 before and after, all of them unedited legacy tokens in the workbench, and with the old spelling written back over the declared file the checker reports it as `store-prefixed`, `edited-violations=1`, so the next such token is caught. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 16, fixed in the commit that carries this line.
