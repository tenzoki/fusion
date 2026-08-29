# coder — `fusion-count-sources`: a failed count becomes an absent count

**Status:** Complete
**Date:** 2026-08-10 07:00
**Agent:** coder
**Turn:** 2, task R2
**Origin:** not Circle work — no Circle active; a Turn-1 review finding against work this
session landed. Filed under `shared/` per the Origin Rule.

**Source:** `260810-0459_*_fusion-count-sources-reports-a-measured-zero-when-git-fails-which-its-own-header-forbids.md`
**Review:** `260810-0512-coderev-turn-1-range-8960e1a-to-head.md`, Theme B, F5
**Fixes:** `2910cf6` (the helper, two hours old)

---

## What was wrong

`listing="$(git ls-files … | sort -u)"` reports the status of `sort`, not of `git`, and `sort`
succeeds on the empty input a failed `git` leaves behind. `2>/dev/null` removed the last trace.
Reproduced against a scratch repository whose `.git/index` was overwritten with `GARBAGE`:

```
git ls-files … → fatal: .git/index: index file smaller than expected, exit 128
bin/fusion-count-sources <root> → code_files=0 data_files=0 counted_by=git-ls-files, exit 0
```

`rev-parse --is-inside-work-tree` still answers `true` on that repository, so the one guard the
file had does not catch it — verified, and the test asserts it.

`counted_by=git-ls-files` is the helper asserting it counted. `agents/orchestrator.md` Setup
Step 5 puts the `counted_by == "none"` branch at the top of its cascade (rebuilt for exactly
this in `31d8bb3`) so an absent count cannot be read as evidence. This path handed the cascade a
zero wearing the label that says it is real, so the guard built for the case was bypassed by the
one input that most needed it.

## Which of the two moved

**The code moved to the header**, not the reverse. The header's doctrine — "A silent zero is
therefore worse than no number at all" — is unchanged and was not weakened. Two header edits
follow the code rather than lead it:

- the exit-code table now says exit 2 has **two** causes (no work tree; a count attempted and
  failed) sharing one output shape, and that only the second writes to stderr;
- "The absent count" now states that the doctrine covers a count that *failed* exactly as it
  covers one that was never possible, and records the pipe trap itself — it is invisible on
  reading, and this is the second file in the repo to be bitten by a masked status.

## The fix

One rule: nothing reaches the printing at the bottom except a count that was actually taken.

- The listing is read in its own command substitution; `sort -u` is a separate command over it.
  A status that must survive is never piped.
- A second masking, one step later, was closed with it. `grep`'s `|| true` flattened three
  different facts into "fine": 0 matches found, 1 a legitimate zero, >1 grep itself failing.
  The third arrived on stdout as an **empty** value still labelled `git-ls-files`. `count_matching()`
  now separates them and only status 1 yields a zero.
- Both route to one `report_unavailable()` — the branch that already existed, not a second
  failure shape (the issue's fix direction says so explicitly, and the file's "no fallback"
  constraint from the decision record allows nothing else).
- stderr is what separates the two causes now sharing one stdout shape: a failed count names the
  failing step, an absent one stays silent. git's own stderr stays suppressed — it is noisy on
  the success path — but its **status** is read.

## Tests

`hooks/lib/__tests__/fusion-count-sources.test.ts`, 11 → 17 cases. The runner moved from
`execFileSync` to `spawnSync` so stderr is assertable, and gained an env override for the one
test that shadows a command on PATH.

Closing the acceptance criterion:

- corrupt `.git/index` (the reviewer's route) → `counted_by=none`, `unavailable`, exit 2, stderr
  names the step. The test also asserts `rev-parse` still passes, so it documents *why* the old
  guard misses this.
- `grep` shimmed to exit 2 → same. grep's error statuses have no fixture that provokes them from
  outside, and a shim is the cheapest honest driver.
- no work tree → `counted_by=none` **and stderr empty**, which is the assertion that keeps the
  two causes distinguishable.

Coverage gaps the review named, closed:

- **All 60 `CODE_EXT` and 19 `DATA_EXT` extensions** are now exercised, and the lists are parsed
  out of the script rather than copied here. A copy drifts the moment somebody adds a language —
  which the header explicitly invites — and the test would keep passing while covering less.
  Each fixture also asserts the *other* count is 0, so the two lists' disjointness is checked.
- **Case-insensitivity**: `.PY`, `.Rs`, `.TsX`, `.YAML`, `.Json`.
- **Nested-subtree pathspec**: a package inside a larger repository counts its own subtree,
  not the repository's.

Left open, deliberately: no test drives a `git` too old for `:(exclude)` pathspec magic (one of
the issue's listed causes) — it needs a second git binary, and the exit-status path it would take
is the one the corrupt-index test already covers.

## Siblings

Checked every `bin/` helper for the same shape — a fallible producer piped into a filter whose
status is then read as the pipeline's. Most hits are `printf | jq` (the producer cannot fail) or
an explicit `|| true`. Three are structural siblings, all outside this task's file scope and none
touched:

| Site | Shape | Severity |
|---|---|---|
| `bin/fusion-plane:847` | `build_comment_body "$file" "$nk" \| jq -r '.comment_html'` — the producer is `jq -Rs … "$file"`, which exits 2 on an unreadable file; the outer jq then exits 0 on empty input. Result: an empty comment is pushed instead of the skip that `comment_skip()` exists for. | closest sibling; not filed |
| `bin/fusion-paths:211` | `grep … "$PROMPT" \| tr \| sort -u \| tr` — grep exit 2 becomes `KEYS=""`, and the consumer receives `WORKBENCH` alone with no `OUT_*`. Much narrower: `[ -f "$PROMPT" ]` is checked 17 lines earlier, so it needs a permission or I/O error. The file documents empty-`KEYS` as "a true answer, not a failure", so this is the same doctrine collision at a far rarer trigger. | low |
| `bin/fusion-paths:231`, `bin/fusion-rules:350` | `head -n 1 "$POINTER" \| tr \| sed` on the `.active-circle` pointer, twice. Same masking; both are already `[ -f ]`-guarded. | low |

`bin/fusion-plane` was explicitly out of scope (another Turn-2 task owns it), and the
`:847` finding is **not** covered by the two open plane issues (`…_o_456`, `…_o_457`), which are
about the map. It is reported here and nowhere else — it needs a record if it is to survive this
session.

## Verification

`cd hooks && npm test` — exit 1. 967 of 968 pass. The single failure is
`rules-emission-golden`, known and owned by the orchestrator this Turn
(`260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md`);
its diff is a byte-size drift in `rules/fusion-workbench-conventions.md`, a file this task did
not touch. `fusion-count-sources.test.ts` alone: 17/17. No other test moved.

## Files changed

- `bin/fusion-count-sources`
- `hooks/lib/__tests__/fusion-count-sources.test.ts`
- `260810-0459_*_…` → `_c_…` (plus the `Resolved:` note)

Not committed — the orchestrator commits.
