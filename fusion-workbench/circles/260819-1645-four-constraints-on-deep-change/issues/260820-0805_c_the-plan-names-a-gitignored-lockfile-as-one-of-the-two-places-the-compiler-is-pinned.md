# The plan names a gitignored lockfile as one of the two places the compiler is pinned

---

The plan's `## Current State` opens a paragraph with "The compiler is pinned in one of the two
places that matter and not in the other", and names `hooks/package-lock.json` as the place that
already records `typescript` at `5.9.3`, "which is what `npm ci` installs".

`hooks/package-lock.json` is gitignored. `.gitignore:7` carries the bare pattern `package-lock.json`
and `git ls-files hooks/package-lock.json` returns nothing. The file exists on the machine the plan
was written on and nowhere else: it is not committed, it is not in the tarball `install.sh`
downloads, and a fresh clone cannot run `npm ci` at all.

The implementation did not inherit the error — `hooks/lib/__tests__/committed-dist.test.ts` states in
its own header that the lockfile "is gitignored here, so it is a local-consistency leg of the first
case rather than the pin itself", and the pin went into `hooks/package.json`, which is committed.
The plan was never corrected, so the record of why the pin went where it did carries a false
premise about the alternative.

---

**Severity:** Low — the outcome is right and the test file states the correct reasoning. What is
wrong is a measurement in a plan that later readers will take as a description of the repository.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `260819-2016_*_four-constraints-on-deep-change.md`
`## Current State`, the paragraph beginning "The compiler is pinned in one of the two places"
**Cross-references:** `.gitignore:7`; `hooks/lib/__tests__/committed-dist.test.ts:44-47` (the header
paragraph that states the correct reading)

**Verified 2026-08-20 at HEAD `bbfc912`.** `git ls-files hooks/package-lock.json` prints nothing;
`git ls-files hooks/package.json` prints the path.

## Fix direction

Correct the sentence in place, in the tense it was written in — the plan is a record of a planning
run, so the repair is a clause naming what the measurement missed, not a rewrite that erases it.

---
**Reconciliation 260820-0830-reconciliation.md** (reconciler, domain `code`, HEAD `04db0b0`) — **still open,
reproduces.** `.gitignore` excludes `package-lock.json` in its Dependencies block and
`git ls-files hooks/package-lock.json` returns nothing. The plan's `## Current State` still reads
"pinned in one of the two places that matter", naming the lockfile as one of them. The decision
record `260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
already carries the correction in its `Implemented:` block; the plan does not. Marker unchanged.

---
Resolved: the plan's `## Current State` carries the correction, appended in the tense the fix
direction asked for rather than substituted, because the plan is the record of a planning run and
what it measured is part of it.

Re-measured before writing: `git ls-files hooks/package-lock.json` prints nothing, `git ls-files
hooks/package.json` prints the path, `.gitignore:7` carries the bare pattern `package-lock.json`,
and `hooks/package.json:17` now reads `"typescript": "5.9.3"` exactly. The appended paragraph states
that the lockfile is in no clone, no commit and no tarball, that a fresh checkout therefore cannot
run `npm ci` at all, that the pin had to go into the committed `package.json` and did, and that
`hooks/lib/__tests__/committed-dist.test.ts` states the same reading in its own header. The
conclusion the original sentence supported is unaffected and is said to stand.
