# The comments-fixture seam is undocumented in `usage()`, the way `--fixture` was

---

**Severity:** Low
**Domain:** code
**Filed by:** orchestrator, from an adjacent finding the T11 executor reported outside its own scope (session `260810-0844`, Turn 3)
**Affects:** `bin/fusion-plane` — the `push` synopsis in the file header and in `usage()`
**Cross-references:** commit `98c8b3f` (which documented `--fixture` at both sites); `shared/issues/260810-0939_c_the-fixture-seam-header-is-a-fifth-surface-and-still-names-the-spelling-the-refusal-rejects.md`

---

## The defect

`--comments-fixture` and its env twin `FUSION_PLANE_COMMENTS_FIXTURE` appear nowhere in the
`push` synopsis, in the file header or in `usage()`. That is the same omission `98c8b3f` just
corrected for `--fixture`, in the same two places, left standing because the review that found
it was scoped to `--fixture`.

## Why it is worth a record rather than a silent tidy

`98c8b3f` corrected one undocumented seam and left its sibling undocumented, so the two now
disagree about whether a test seam gets documented. A reader who finds `--fixture` in `usage()`
and reasons that the list is complete will conclude `--comments-fixture` does not exist.

The cost is small and the fix is smaller. It is filed rather than fixed because the T11
executor was scoped to three records and correctly declined to widen into a fourth, and
because "while I was in there" is how a task's diff stops matching its stated scope.

## Fix direction

Add both spellings to the `push` synopsis in the header and in `usage()`, matching the wording
`98c8b3f` used for `--fixture`. Check at the same time whether any other flag the file accepts
is missing from those two lists — the same question was asked once per seam here, and asking it
once for all of them would end the series.
