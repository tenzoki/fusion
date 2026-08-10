# Coder — Turn 3, task `P:silent-skip`

**Status:** Complete
**Agent:** coder
**Session:** `260810-1646`, Turn 3
**Task:** make the reference lint stop skipping citations rooted in an unrecognised variable, and
correct the citation count in `260810-2029`
**Records worked:** `shared/issues/260810-2029_*_seven-citations-…`,
`shared/issues/260810-2110_*_the-citation-rooting-commit-and-its-own-record-…`

---

## What was decided, and why option 2 rather than option 1

The dispatch offered two shapes and said the choice was the substance. Option 1 adds `FUSION_SRC` to
the recognised names and leaves the property intact. Option 2 makes an unrecognised `$VAR/`-rooted
citation fail rather than disappear, and it was to be taken only if it holds without firing on
legitimate prose.

It holds, and the reason it holds is worth stating because it was not obvious in advance: **the two
classes part on the remainder, not on the variable name.** The dispatch named `$WORKBENCH/`,
`$OUT_PLAN/` and `$SCAN_ISSUES/` as the shapes that are not citations. They are, and there are 121 of
them, but every one of them is followed by a workbench store path — a record filename, `monitor`, a
store directory — and never by `rules/…`, `agents/…`, `bin/…` or one of the four top-level plugin
files. So the gate does not need to know which names are resolver keys. It asks what follows.

Measured over the whole scanned surface before the design was committed to, exactly four variables
stand in front of a plugin-shaped path:

| Variable | Sites | What it names |
|---|---|---|
| `$FUSION_PLUGIN_ROOT` | 129 | the plugin tree |
| `$FUSION_SRC` | 8 | the plugin tree (work tree here, install elsewhere) |
| `$CLAUDE_PLUGIN_ROOT` | 6 | the plugin tree |
| `$STASH_DIR` | 1 | a stash directory, at `skills/circle-stash/SKILL.md:439` |

The last row is why the design is a map with two kinds of entry rather than a widened list of names.
`$STASH_DIR/README.md` is a stash's own manifest and must be skipped, and the only honest way to skip
it is to say so in a declaration that carries the reason.

## The change

One file: `hooks/lib/__tests__/reference-resolution-lint.test.ts`.

- `PLUGIN_PATH_BODY` extracted as a source string, so the shape of a plugin path is written once and
  used twice: with the "not mid-path" lookbehind for scanning prose (`PLUGIN_PATH_RE`, unchanged in
  behaviour) and anchored for testing the remainder of a rooted token (`PLUGIN_SHAPE_RE`, new).
- `ROOT_VAR_RE` no longer spells the recognised names into the pattern. It matches `$VAR/<path>` for
  any variable and captures the name.
- `ROOT_VARS` classifies the name: `true` means the plugin tree and the remainder is
  existence-checked; a string means something else and carries the reason for skipping. A name in
  neither position, in front of a plugin-shaped path, is a violation.
- The violation message names both remedies, because only one of them is right in any given case and
  a message offering one would be wrong half the time.
- Six negative controls added, including the resolver-key case and a falsifier that fails when a
  declared non-plugin root stops shadowing anything — the same guard shape `EXAMPLE_PATHS` carries.

The bound is written into the header rather than left to be discovered: a token under an unrecognised
variable whose remainder is *not* plugin-shaped stays skipped. That is the class boundary, not a
residual — a path no plugin directory could hold is not a plugin citation.

## Demonstration

Per decision `260810-1820` (option 1, scratch copy), every mutation ran on a copy of the tree and the
live working tree was never written by a verification step. Two dangling citations were planted in the
copy's `skills/next/SKILL.md`: `$FUSION_HOME/agents/no-such-agent.md` and
`$FUSION_SRC/bin/no-such-helper`.

- Previous gate: **23 tests passed, file green.** Both citations accepted in silence.
- New gate: **1 failed, 28 passed.** The first reported as an unclassified root naming both remedies,
  the second as a dangling plugin path — which is the coverage the eight sites lost.
- Planted line removed, copy re-run: 29 passed, so the new branch has no false positive on the real
  surface.

## Count

Eight, re-measured independently rather than copied from the review. The sites are
`skills/setup/SKILL.md:220,238,239,254,260` and `skills/next/SKILL.md:115,121,185`. The same figure
from the other side: root-variable tokens the gate resolves move from 140 to 148 once `FUSION_SRC` is
classified. Corrected in `260810-2029`'s title and all three body statements; the filename keeps
"seven" because a record's topic is immutable and three live texts cite that slug, and the record now
says so in its opening lines.

## Verification

`npm test` from `hooks/` — **exit 1**, and neither failure is this task's.

| Run | Started | Result |
|---|---|---|
| 1 | 21:38:44 | 41 files passed, 1119 tests, 0 failed (exit code not captured — a shell error on my side) |
| 2 | 21:40:43 | exit 1 — `domain-cascade.test.ts` › "README-hooks.md carries the generated claim verbatim" |
| 3 | 21:43:29 | exit 1 — `fusion-commit-lock.test.ts` › the reaped-creator timing case |

Run 2's failure belongs to a parallel executor: that test does not exist at HEAD, its file was written
at 21:39:53, and `README-hooks.md` was written at 21:40:47 — during the run, which started at 21:40:43.
By run 3 it passes. Run 3's failure is the known load-sensitive case already recorded as
`260810-1135_o_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation`,
which would be its fourth observation; not appended here, because the record belongs to no task of
mine and three executors are writing this workbench.

`reference-resolution-lint.test.ts` is green in all three runs, at 29 tests.

## Reported upward, not built

The dispatch asked whether the property can be stated once, this being the second gate in two Turns
whose coverage shrank with nothing turning red. It can, and the shape is in the answer above: the
non-vacuity floors (`counts.paths > 50` against a corpus of 148) cannot see a loss of eight, and no
floor placed anywhere can. The costing is in the report to the orchestrator.
