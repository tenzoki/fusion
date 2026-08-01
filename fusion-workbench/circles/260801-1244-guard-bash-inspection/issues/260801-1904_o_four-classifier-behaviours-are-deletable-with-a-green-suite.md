Four classifier behaviours are deletable with a green suite

---

**Severity: Low.** No live defect. The suite is strong overall; these are the places where a
future edit would not be caught.

Method: `hooks/` was copied to a scratch tree, one behaviour was neutralised at a time, and the
five guard suites were run (`bash-mutation-guard`, `shell-parse`, `guard-bash-integration`,
`guard-bash-wiring`, `git-branch-guard`). A no-op control mutation confirmed the harness reports
SURVIVED correctly. No file in the repository was modified.

**Caught, as they should be** — reported so the survivors read as calibrated rather than as a
blanket complaint:

| Neutralised | Result |
|---|---|
| `targetDir` `adds` → always `replaces` | CAUGHT (1 test) |
| `isProtected`'s trailing-slash retry | CAUGHT (11) |
| `programName`'s basename strip | CAUGHT (1) |
| wrapper skipping disabled | CAUGHT (21) |
| the fail-closed pass (unresolved → allow) | CAUGHT (16) |
| `parenCounts`' `SUBSTITUTION_FILLER` removal | CAUGHT (1) |
| the dangling-redirect `nextSegmentHead` adoption | CAUGHT (1) |
| leading `~` no longer unresolved | CAUGHT (3) |
| the git override-waives-only-what-it-names fix, reverted | CAUGHT (2) |

**Survived** — four behaviours no test observes:

1. **`--` end-of-flags in `writtenOperands`** (`hooks/lib/bash-mutation-guard.ts:576-579`).
   Deleting the branch changes no verdict in the suite. The only tests are at
   `bash-mutation-guard.test.ts:323-328`, and all four give the identical verdict when `--` is
   replaced by an inert flag: `rm -- rules/x.md`, `rm -f -- rules/x.md` and `mv -- /tmp/a
   rules/x.md` deny either way, and the intended negative control `rm -- /tmp/-weird-name` starts
   with `/` so it never reaches the "a token starting with `-` is a flag" branch. The command that
   discriminates is `rm -- -rf` (a file literally named `-rf`), which is absent. The two sibling
   `--` handlers, `skipWrapper` (`:632`) and `firstDirArg` (`:897`), are deletable for the same
   reason.

2. **`isSkippedRedirectTarget`** (`:393-395`). Deleting the file-descriptor and `-` skips changes
   nothing, because a bare `1`, `2` or `-` matches no shipped protected pattern and resolves
   cleanly, so pass 3 never sees it either. The function is genuinely load-bearing only under a
   `protectedPaths` containing `"1"` or `"-"`, and no test uses such a list. The two tests under
   `describe("redirection — the skip forms must never deny")` (:704-720) pass with the function
   gone.

3. **`ancestorOfProtected`'s segment boundary** (`:750`, `prefix.startsWith(base + "/")`).
   Weakening it to `prefix.startsWith(base)` fails nothing. The docstring names `rules-draft` as
   the case the boundary protects (`:734`), but `rules-draft` is *longer* than `rules` and the
   comparison runs the other way, so it never exercised the boundary. The discriminating case is
   a **shorter** prefix-sharing sibling — `rm -rf rule`, `rm -rf hook`, `rm -rf agent` — each of
   which correctly allows today and would deny under the weakened form.

4. **`cd ~` → `outside` rather than the project root** (`:967-970`). Replacing `CWD_OUTSIDE` with
   `CWD_ROOT` fails nothing, so the `outside` / `unknown` / `known` three-way — described in the
   module as "the one judgement call here" (`:776-787`) — is untested at its most interesting
   point. The discriminating case is `cd ~ && rm -rf rules`: correctly allowed today (the shell is
   somewhere the guard knows is not the project), denied under the mutation.

---

**Where the fix belongs.** Four test additions, no production change:

- `rm -- -rf` against a `protectedPaths` containing `-rf`, or an assertion that the operand reaches
  the positional list.
- One redirect case with `"1"` or `"-"` in `protectedPaths`, so the skip becomes observable.
- `rm -rf rule` / `rm -rf hook` as allows, and a docstring correction at `:734` naming the shorter
  sibling instead of `rules-draft`.
- `cd ~ && rm -rf rules` as an allow, paired with the existing `cd ~ && rm -rf tmp`.

**Two further test-shape observations**, not worth their own issues:

- `expectAllDeny` (`bash-mutation-guard.test.ts:64-68`) checks only `.deny`. Roughly 86 deny
  assertions are boolean-only against 34 that also check `targetPath` / `offendingSegment` /
  `reason`. `it("mv -t adds the target directory to the written set")` (:242-249) is the sharpest
  instance: three of its four assertions deny identically under every reading of `-t`, and the
  title's claim rests entirely on line 247. An optional expected `targetPath` parameter would fix
  the family.
- The `normalize` stub (`:43-48`) is written by the test and never pinned against
  `guard.ts:109`'s `normalizeToRelative`, while the sibling `PROTECTED` fixture *is* pinned against
  the shipped `config.json` (:85-91). Every absolute-path assertion rests on that stub, and the
  only check of the seam elsewhere is a source-text grep (`guard-bash-wiring.test.ts:132`).

**Found by** coderev on the `17730b8..e31c0f3` review, by mutation testing against a scratch copy
of `hooks/`.

---
**Reconciliation 260801-2029 (reconciler) — verified still open. Marker stays `_o_`.**

Checked at HEAD `9ab5a2a`, after the two Turn-2/3 commits that followed this filing (`18e2e4f`, `9ab5a2a`) and after the Turn-2 review that re-read it. Both survivors I could test mechanically are still deletable:

- Survivor 1, the `--` end-of-flags branch: the discriminating command this issue names, `rm -- -rf`, does not appear anywhere in `hooks/lib/__tests__/bash-mutation-guard.test.ts`. Grepped at HEAD; no match.
- Survivor 4, the unpinned `normalize` stub: still a locally written function at `bash-mutation-guard.test.ts:39-53`, still described in its own comment as "mirroring `guard.ts`'s `normalizeToRelative`" rather than pinned against it. The sibling `PROTECTED` fixture is still pinned against the shipped `hooks/config.json`, so the asymmetry the issue reports is unchanged.

The Turn-2 review (`reviews/260801-1958-coderev-turn-2-fixes.md`) reached the same conclusion independently: "Six of the seven Turn-1 findings are adequately closed; the Low one is still open and Turn 2 did not change it."

One thing did change in this family, though not through this issue: `18e2e4f` replaced the corpus's `length >= 42` floor with a filter for entries that exercise a detected write (29 of 102 today, floor at 27), which is exactly the "a trivial-for-hard substitution now fails" property this issue argues for, applied to a different suite. That is evidence the class of finding was taken seriously, not that these four behaviours are now observed.

Severity is unchanged: Low, no live defect. Left open deliberately rather than closed as fixed-enough — it is test-hardening for a classifier that this session amended five times after shipping, which is precisely the edit rate that makes an unobserved behaviour worth pinning.
