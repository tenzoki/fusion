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

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, unmoved.

`declaredCitationFiles()` in `hooks/lib/citation-scan.ts:1197-1237` is unchanged in the respect this
record names. The four refusal branches and the `unmatched` branch each push a note; the drop at
`:1231` is still `if (seen.has(abs) || !existsSync(abs)) continue;` — no note, no counter, no line of
output. `declaredCitationNotes()` at `:1245-1254` emits one line per `refused` and one per `unmatched`
and has nothing to emit for this sixth outcome, so `declared-files=0` is still indistinguishable from
a pattern that matched nothing.

Over this repository the condition does not arise today: `node hooks/dist/citation-check.js` reports
`declared-patterns=3 declared-files=48`, every declared file present.

---
Resolved: 12dee877 — the missing-file drop and the dedup drop no longer share one continue. A path git named that the work tree does not hold pushes to a missing list, a duplicate still drops silently, and declaredCitationNotes emits one line naming how many of how many are absent and which. Both hand-run helpers print it with neither file touched. The docstring goes to six branches and states which quantity it is disjoint over. Not covered: the note reports; nothing fails on a declared pattern whose files are all absent.
