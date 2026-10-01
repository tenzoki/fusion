# Does `bin/fusion-count-sources` exclude conventional test-fixture directories from its count?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md (the implemented decision this record amends: option 2, `git ls-files`, with `fusion-workbench/` as the one exclusion); work package 260928-1338-json-control-data-and-markdown-artefacts (the archive revision whose session fixtures surface the question); `hooks/lib/__tests__/domain-cascade.test.ts:254` (the test the change would otherwise turn red)

---

## Question

`bin/fusion-count-sources` counts every tracked and untracked-but-not-ignored file outside
`fusion-workbench/` (`bin/fusion-count-sources:109-110`). Its `data_files` count feeds the
orchestrator cascade branch `data_files > code_files * 2`. In this repository the codec's
protocol fixtures are `.json` files, and they now dominate the data count:

| Tree | `code_files` | `data_files` | Domain |
|---|---|---|---|
| HEAD `97e4128f`, tracked only | 240 | 441 | `code` (441 < 480) |
| of which under `codec/fixtures/` | 0 | 418 | |
| HEAD without fixture trees | 240 | 23 | `code` |
| Working tree with the uncommitted archive session (helper run live) | 241 | 562 | **`data`** (562 > 482) |
| Working tree without fixture trees | 241 | 23 | `code` |

Measured by:

- `bin/fusion-count-sources .` → `code_files=241 data_files=562 counted_by=git-ls-files`
- `git ls-files -- . ':(exclude)fusion-workbench'` filtered through the helper's own `CODE_EXT` and `DATA_EXT` (`bin/fusion-count-sources:132-142`, `DATA_EXT` at its own lines) → 240 / 441
- `git ls-files codec/fixtures | grep -Eic "\.($DATA_EXT)$"` → 418
- the same two listings with `grep -Ev '(^|/)(fixtures|__fixtures__|testdata)/'` → 240 / 23 (HEAD) and 241 / 23 (working tree)
- `git ls-files | awk -F/ '{print $1"/"$2}' | sort | uniq -c` → `codec/fixtures` 452 paths, the largest directory in the tree

Committing the archive session (`codec/fixtures/protocol-session-archive/`, 121 `.json` files)
flips this repository to domain `data`. That turns
`hooks/lib/__tests__/domain-cascade.test.ts:254` ("this tree, measured live, reaches domain
`code` on either of the helper's answers") red.

Nothing overrides the measured domain. `bin/fusion-session-domain` and `hooks/session-start.ts:232`
take it straight from the cascade over the helper's output; neither `fusion.json` nor
`templates/fusion.json` carries a domain key; and the helper's header rules out a `CLAUDE.md`
declaration, because 260809-1731 did not authorise one (`bin/fusion-count-sources`, "No domain
declaration read out of CLAUDE.md"). The question must be settled before the archive session is
committed.

## Options

1. **Exclude directories named `fixtures`, `__fixtures__` and `testdata`** — a small closed list
   of path-segment names, excluded beside the existing `fusion-workbench` exclusion in the same
   `git ls-files` pathspec.
   - Pros: counts what the heuristic means to count, a project's own source and data, not the
     test inputs that exercise it. Keeps one counting mechanism, as 260809-1731 requires. The
     list is closed and names test-convention directories, not an ecosystem's build output, so
     it is not the open prune set that decision rejected for `find`. This repository returns to
     241 / 23 and the live test stays green.
   - Cons: projects with large fixture trees move toward `code`. A real data project that keeps
     its data under a directory named `fixtures/` would be under-counted (judged unlikely).
2. **Accept the red** — commit the session and let the tree read as `data`.
   - Pros: no change to the helper.
   - Cons: the domain is wrong for a plugin source repository, the live test fails, and nothing
     can override it.
3. **Store sessions in non-`.json` files** — rename the fixtures out of the data extensions.
   - Pros: no change to the helper.
   - Cons: breaks Prior's replay format, which reads the sessions as `.json`; bends the fixtures
     to work around a counting defect rather than fixing the count.

## Constraints

- One counting mechanism, `git ls-files`, and no `find` fallback (260809-1731, `Answered:` block).
- No domain declaration read from `CLAUDE.md` unless separately decided (same record).
- An absent count stays `unavailable`, never 0 (helper header, "The absent count").
- The amendment must not reopen 260809-1731, which is terminal `_i_`; it adds an exclusion to
  the implemented mechanism and leaves that record untouched.

## Recommendation

Option 1. It is the only option that corrects the count rather than the fixtures or the test,
and it stays inside the mechanism 260809-1731 chose.

---
Answered: 261001-1348_*_does-the-source-count-exclude-conventional-test-fixture-directories.md `## Options` option 1 — `bin/fusion-count-sources` excludes path segments named `fixtures`, `__fixtures__` and `testdata`, beside the existing `fusion-workbench` exclusion; ruled by user, Kai Stalmann <ks@qantr.com>
