# Step 6: the records of the declared citation paths

**Date:** 260831-0150
**Status:** Complete
**Agent:** analyst
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Plan:** `260831-0024_*_a-project-declares-its-citation-bearing-paths.md`, step 6

Records only. No code, no configuration, no documentation surface was touched.

## What changed

**`260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md`, `_a_` to `_i_`.** Two appended sections and the `Implemented:` footer. The first names the three commits that realised option 5 and states the two properties of the shipped shape that option 5 itself does not carry: the sweep reads the declaration alongside the checker, because the reporter-versus-rewriter corpus split had been removed a week earlier after the sweep was found changing files the checker then declared clean, and the blocking gate does not read it, because a corpus set by an editable declaration turns a one-line edit to a project's `fusion.json` into a red suite for everyone who pulls. The second section carries the contrast that makes the mechanism a judgement rather than a heuristic: 45 declared files with 167 resolved citations and 2 dangling, against 51 undeclared test files with 90 dangling and 133 store-prefixed. It also records the two rows fusion now reports against itself at `hooks/lib/citation-scan.ts:330` as accepted and not exempted, since `RECORD_EXAMPLE_FILES` exempts whole files and the grammar's own source holds real citations.

**`260831-0032_*_which-mechanism-enumerates-a-declared-citation-path-and-what-happens-where-git-will-not-answer.md`, `_a_` to `_i_`.** One appended section naming option 1 and `5fd6bfab`, plus the three things the executor settled that the plan left unstated. Nothing asks git anything when a project declared nothing, because the resolver returns on an empty pattern list before the `rev-parse` call. A refusal names the call rather than git's text, because `hooks/lib/git.ts` discards stderr by contract. A tracked file absent from the work tree is filtered out, because the index names it and the callers read the tree. All three were verified against the shipped source rather than taken from the dispatch.

**`260831-0033_*_does-the-sweeps-test-fixture-skip-survive-a-project-declaring-its-own-citation-bearing-paths.md`, unchanged at `_o_`.** One appended note recording that the plan shipped through `bb934a4f` without touching `isTestFixture`, and that the 51-file measurement in its Question section was taken at `7be624e7`.

**The plan file.** Step 6 marked `[DONE]`.

## Two residuals the dispatch's bounds put outside this step

Step 5 carries no `[DONE]` mark, and the plan header still reads `**Status:** In Progress` with the filename marker at `_p_`. The dispatch bounds this agent's write in the plan file to the step-6 mark, so neither was touched. Both are the closing pass's, not a defect: every step is committed and step 6 is done, so the plan is complete in fact.

## The figures, taken rather than copied

The prediction the dispatch carried was measured at `bb934a4f`. The readings below are this checkout's, after the three record writes, and they differ from it by exactly those writes: three added citation tokens, all resolving.

- `bin/fusion-citation-check`, exit 0: `files=2409 declared-patterns=3 declared-files=45 tokens=22528 judged=17938 resolved=17253 dangling=313 store-prefixed=0 undecidable=3193 exempt=1769 verdict=violations`. Empty stderr. Against the same helper run before the writes (`tokens=22525 judged=17935 resolved=17250`), the delta is +3 tokens and +3 resolved, with `dangling` and `store-prefixed` unmoved. Every record name written in this step resolves.
- `bin/fusion-citation-sweep --dry-run`: `files=0 rewrites=0 residual=2819 record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=dry-run`. The release gate reads `rewrites=0`, unchanged through all six steps.
- `cd hooks && npm test`, exit 0: 47 files, 818 tests, all passing. The citation gate among them, which is what confirms the filenames these three records cite.

## Verification

- `ls fusion-workbench/shared/decisions/ | grep -oE '26083[01]-[0-9]{4}_._' | sort -u` prints eight rows, one per stamp: the `260830-1844` and `260831-0032` stamps carry `_i_`, the `260831-0033` stamp carries `_o_`, and no stamp appears twice.
- `cd hooks && npm test` exits 0.
- Nothing was committed, per the dispatch.
