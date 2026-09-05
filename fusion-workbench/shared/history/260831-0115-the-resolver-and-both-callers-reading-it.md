# The resolver for declared citation paths, and both callers reading it

**Date:** 260831-0115
**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `260831-0024_*_a-project-declares-its-citation-bearing-paths.md`, step 2

## What changed

Three hand-edited source files, two test files and the regenerated build. Step
1 resolved `citations.extraPaths` and nothing read it; both hand-run citation
helpers read it now.

**`hooks/lib/citation-scan.ts`.** `declaredCitationFiles(projectRoot, patterns)`
sits beside `markdownFilesUnder()` and returns
`{ files, unmatched, refused, unavailable }`. It runs git through
`hooks/lib/git.ts` as it stands, so no second subprocess wrapper exists: one
`git rev-parse --show-toplevel`, then one `git ls-files -z -- ':(glob)<p>'` per
surviving pattern with the project root as cwd. The union is deduplicated by
absolute path. No new module, so `README-hooks.md`'s `lib/` table owes no row
and `derivable-enumerations-lint` stays green.

A second export, `declaredCitationNotes()`, renders the stderr lines both
callers print. It returns lines rather than writing them, so the stream and the
prefix stay the caller's, and one wording serves both.

The five branches, disjoint and complete: git will not answer (`unavailable`);
a pattern that is absolute or carries a `..` segment (`refused`, from the string
alone, before git); a pattern git declines (`refused`); a pattern with empty
output (`unmatched`); paths (`files`).

**`hooks/citation-check.ts`.** Reads the patterns from
`loadConfig({ projectRoot })` where the root is what `findWorkbenchRoot()`
returned, adds the resolved files to the corpus deduplicated by absolute path,
and gains exactly two stdout lines after `files=`: `declared-patterns=<n>` and
`declared-files=<n>`, the second reading `unavailable` where git would not
answer. The loader's diagnostics and one line per unmatched or refused pattern
go to stderr.

**`hooks/citation-sweep.ts`.** The same read against `dirname(--root)`, with
the declared files joining the corpus at the same place a `<path>` argument
does and **before** `refusal()` is asked, so guard (a) covers them with no new
guard code. Its summary line is untouched, byte for byte, because
`citation-sweep.test.ts` pins it as a release gate.

**Headers.** `citation-scan.ts` states in its module header and in the
resolver's own docstring what the resolver decides (did the project declare
this file) and what it refuses to decide (is this token a pointer or an
exhibit, undecidable outside Markdown where a fence and a blockquote are the
whole distinction). Both callers' headers state that the two hand-run helpers
share one corpus while `workbench-citation-lint.test.ts` deliberately does not
read the declaration, and why: that gate has no approvable baseline and runs in
everyone's `npm test`, so a corpus set by an editable configuration leaf would
redden the suite of somebody who edited nothing.

## Three readings the step's text left open, and how each was settled

**No pattern is asked about when none was declared.** The resolver returns the
empty result before it reaches git. Evaluating git unconditionally would print
`declared-files=unavailable` and one stderr line to every project outside a git
work tree that never wrote the key, which is a behaviour change and an advisory
where the plan's Approach promises neither. The header states that this is an
answer about zero patterns and not a claim about the tree.

**A refusal names the call, not git's own text.** The step asks for git's own
reason; `hooks/lib/git.ts` discards stderr and collapses every failure to
`null` by contract, so `git declined the pathspec` is the most the resolver can
honestly say without a second wrapper the Approach forbids.

**An index entry with no file in the work tree is not returned.** `git ls-files`
names the index and both callers read the work tree, so a tracked file deleted
from the tree would have crashed `readFileSync`. It is excluded by an
`existsSync` check inside the resolver and named in its header. This is the one
judgement not written into the step.

## Verification

- `cd hooks && npm test` exits 0: 47 files, 817 tests.
- Scratch git project, workbench, `["src/*.go"]`, a `src/a.go` and a `src/b.txt`
  each citing a record that does not exist: the `src/a.go` row is reported, the
  `src/b.txt` row is not, `declared-patterns=1 declared-files=1`.
- `["src/*.go", "nowhere/*.py"]`: stdout unchanged for the `.go` file, one
  stderr line naming `nowhere/*.py` as matching nothing.
- `["/etc/*.conf"]` and `["../x/*.go"]`: each refused on stderr before git,
  `declared-files=0`.
- The same project with `.git` removed: `declared-files=unavailable`, one
  stderr line, exit 0.
- `bin/fusion-citation-check` over this repository: `declared-patterns=0
  declared-files=0`, and `files=2360 tokens=22321 judged=17755 resolved=17073
  dangling=311 store-prefixed=0 undecidable=3177 exempt=1760
  verdict=violations`. Every one of those nine figures is what the compiled
  checker at `c08f70a5` prints over the same tree, measured by running that
  commit's `hooks/dist/` out of a scratch directory rather than by moving the
  work tree.
- `bin/fusion-citation-sweep --dry-run` over this repository:
  `files=0 rewrites=0 residual=2804 record=0 circle-record=0 circle-dir=0
  bare-record=0 stamp-bare=0 mode=dry-run`, the same fields in the same order,
  and the same string the `c08f70a5` build prints.

## Budget

114 lines added across the two test files, against the 120 the step allows: 88
in `fusion-citation-check.test.ts`, 26 in `citation-sweep.test.ts`. The
`surface-growth.golden` fixture was regenerated by its own documented procedure
(`UPDATE_SURFACE_GOLDEN=1`) and its diff is those two figures and the total,
20026 to 20140. No baseline moved.
