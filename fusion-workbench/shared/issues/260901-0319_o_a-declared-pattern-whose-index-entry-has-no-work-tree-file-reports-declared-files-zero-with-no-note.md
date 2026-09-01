# A declared pattern whose index entry has no work-tree file reports declared-files=0 with no note

---
`declaredCitationFiles()` documents five branches per pattern. There is a sixth: git names the
pattern's files, none of them is on disk, and the pattern is neither `unmatched` nor a file. The
declared corpus is silently not read and the printed figure is a bare `0`.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/lib/citation-scan.ts`, `declaredCitationFiles()`. A pattern reaches `git ls-files`, git
answers with paths, so the `rels.length === 0` branch that produces the `unmatched` note is not
taken. The loop then drops every path failing `existsSync(abs)` — `continue`, no note, no counter.
A pattern whose index entries all resolve to missing files therefore contributes nothing and is
reported as nothing.

The docstring calls the split "disjoint and complete over five branches" and states the drop as a
property (`an index entry with no file in the work tree is not returned`), but the two statements
do not meet: the drop is a sixth outcome and it is the only one with no line of output.

## Evidence, at `dcdca34c`

A scratch project with `fusion.json` declaring `["src/*.go"]`, one `git add`ed `src/a.go`, then the
file removed from the work tree without `git rm`:

```
$ git ls-files -- ':(glob)src/*.go'
src/a.go
$ node hooks/dist/citation-check.js
files=0
declared-patterns=1
declared-files=0
```

stderr is empty. An ordinary `rm` reaches this, and so does a checkout that has not been cleaned.
`declared-files=0` is indistinguishable from a pattern that matched nothing, which the same
function is at pains to make nameable ("One call PER PATTERN is what makes a pattern that names
nothing nameable at all").

## The acceptance test

A pattern git names but that resolves to no readable file produces a line on stderr saying so, and
`declared-files=` never reports a silent drop as a taken count of none — the rule this module
already applies to `unavailable`.
