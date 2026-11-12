# Closing review: the install test's sweep expectation after ee1a4984

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `ee2df82e..b6d45655`
**Not-opened:** none
**Review domain:** code
**Work package:** `261111-2330-request-81-restated-on-main-and-the-prior-session-brief.md`

## Summary

The range changes one code file, `codec/src/__tests__/install.test.ts`, by one expectation and one comment (commit `e72f04b4`). The repaired expectation states what `hooks/citation-sweep.ts` ships since `ee1a4984`, with the right line and the right count, and it is no looser than the one it replaces. No finding, no issue filed.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

## What was opened

- `git show e72f04b4`, whole diff.
- `codec/src/__tests__/install.test.ts` lines 500 to 560 (the test that carries the expectation), 915 to 935 and 1070 to 1090 (the two other calls of the installed sweep).
- `hooks/citation-sweep.ts` header lines 48 to 82 and 306 to 362, `main` lines 960 to 1085.
- `git show ee1a4984 -- hooks/citation-sweep.ts`, and `hooks/dist/citation-sweep.js` lines 948 to 952, 988, 1049.
- `b6d45655` changes `orchestrator-events.jsonl` only, an event log under the workbench, out of scope for code findings.

## Findings by theme

### The expectation against the shipped line

The sweep writes the line in one place, `hooks/citation-sweep.ts:980`:

```ts
boundLines.push(`bound=${relOf(projectRoot, abs)}  ${by.join(", ")}  skipped, ${n} left as written`);
```

The compiled copy the install ships carries the same template (`hooks/dist/citation-sweep.js:952`). The test at `codec/src/__tests__/install.test.ts:556` expects:

```ts
[`bound=fusion-workbench/${plan.path}  plan:fusion-workbench/${alpha.path}  skipped, 1 left as written`]
```

File, role and control path are the three parts the old expectation already asserted, unchanged. The suffix matches the template byte for byte, two spaces before `skipped` included.

### The count

`n` is the number of tokens the sweep pass would have rewritten in that file (`hooks/citation-sweep.ts:1042` to `1067`; `skipIfBound(abs, n)` is reached only with `n > 0`). The fixture plan's narrative, written at `install.test.ts:532`, carries one store-prefixed citation, `work-packages/<alpha>/<alpha>.md`, and nothing else the sweep rewrites. The same test asserts `store-prefixed` = 1 from the installed citation check at line 546, over the same store. The count 1 is therefore derived twice in the test, and the two agree.

### Tightness

The assertion is still `toEqual` on the pair of the first stdout line and the full list of `bound=` lines. A second `bound=` line, a different count, a missing suffix or a changed role each fail it. Nothing was replaced by a pattern or a prefix match; the change adds bytes to an exact string. The comment at line 555 states the reason and names the source file and the commit, and both hold.

### Other expectations of the old form

None. `install.test.ts` calls the installed sweep in two further places, lines 925 and 1078, and both assert only the exit status (line 925 also that the output names nothing archived). Neither reads a `bound=` line. In `hooks/lib/__tests__/citation-sweep.test.ts` every `bound=` expectation either carries the suffix or asserts the absence of the line (lines 474 and 660), which `ee1a4984` already brought in line.

### Run

`cd codec && npx vitest run src/__tests__/install.test.ts` at `b6d45655`: 1 file, 21 tests passed, exit 0, 128.84 s. The run left the work tree as it found it (`git status --short` shows the event log only, modified before the run).

## Cross-cutting observations

- The test was red from `ee1a4984` through the 13.5.0 release, as the commit message of `e72f04b4` says: it installs from an archive of HEAD, so a change under `hooks/` reaches it, and `ee1a4984`'s own verification list names `cd hooks && npm test` and `cd catalog`, not `cd codec`. One occurrence; not filed, because the range gives no second case and the release steps are outside this package's scope. Stated here so a second occurrence can be recognised as one.
- Not a defect, and unchanged by this range: the installed-sweep expectation does not read the summary line. Since `ee1a4984` that line is `files=0 rewrites=0` for this fixture, which is the statement that the bound plan is the only candidate and was not counted. `hooks/lib/__tests__/citation-sweep.test.ts` asserts it for the source build; the install test asserts only that the installed copy answers from JSON. Left as is.

## Already filed, not refiled

`261112-0728-the-largest-store-migration-test-asserts-a-5-s-wall-clock-allowance-and-goes-red-under-the-suites-own-parallel-load.md`, open, filed by the orchestrator. This pass ran one file, not the full suite, and adds no measurement to it.

## Recommended sequencing

Nothing blocks. The package's one open issue is the wall-clock assertion above.

## Verdict

accept
