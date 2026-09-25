# Turn 2 — closing three security findings on `FUSION_ALLOW_RULES_WRITE`

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Scope:** `hooks/guard.ts`, `hooks/lib/{paths,rules-write-exemption,bash-mutation-guard,fs-locator}.ts` + tests
**Tests:** 973 passed (baseline 871, +102)
**`hooks/dist/`:** left at HEAD, as instructed. `npm test` runs `tsc` first and rebuilds it; it was reverted after each run.

## What changed

### Finding 1 (High) — the flag was a write-anywhere primitive via an alias planted in `rules/`

The grant was decided on TEXT while the write followed the filesystem. Closed at three layers,
because no single one closes the class:

1. **`isProjectRulePath` now resolves the path against the real filesystem** and requires the
   resolved location to sit strictly inside a *resolved* rule directory. New port `FsLocator`
   (declared in `rules-write-exemption.ts`, implemented in the new `lib/fs-locator.ts`), injected
   the way `CheckoutResolver` already is, so the policy module stays pure and unit-testable.
2. **A hard link never gets a grant.** `realpath` cannot see one — `cp -l hooks/config.json
   rules/copy` gives a protected inode a second name inside `rules/` and both names resolve to
   themselves. An existing regular file with `nlink > 1` is refused. Directories and symlinks are
   excluded from that test (`rules/retired` has `nlink > 1` structurally).
3. **`ln` is not exemptible** — a new `VerbSpec.exemptible` field, false on exactly one row. The
   flag's permission is writing rule files; installing an alias is not that.

The resolver had to handle a **dangling** symlink explicitly. `realpath` throws ENOENT for a link
whose target is missing, and a walk-up that read that as "not created yet" reported the lexical
location and granted — measured, and the first version of this fix had that hole. Existence is
therefore tested with `lstat` and a dangling link is expanded by hand, bounded at 40 hops.

### Finding 2 (High) — the protected list was matched un-collapsed

`collapseSegments` (new, in `lib/paths.ts`) is applied once at `guard.ts:479`, above both checks.

I did **not** take the reviewer's suggestion verbatim. Their one-liner used the exemption's
`canonicalise`, which also strips a trailing separator — and a trailing separator *widens* whatever
set the path is matched against. Stripping it on the protection side turned `Edit agents/`,
`Edit rules/`, `Edit skills/` from denies into allows (caught by an existing Turn-1 test). So
`paths.ts` now exports two functions: `collapseSegments` (protection) and `canonicalise` =
collapse + strip (grant). The asymmetry is the point and is documented at both.

Consequently `isProjectRulePath` **keeps** its own canonicalisation rather than being simplified
away: the Bash path hands it operands `guard.ts:479` never sees, and `node:path.normalize` there
leaves the trailing separator in place. It is idempotent, so the second call costs nothing.

### Finding 3 — the halt was write-tool-only

Option 3, as directed. `MutationVerdict` gains `mutates: boolean`, reported independently of
`deny` — the exemption does not influence it, which is what makes the flag unable to lift a halt
(the exemption is applied *inside* classification, so ordering two calls could not have expressed
this). A halted guard denies every recognised mutation and allows everything else, so an agent can
still read its way to the clear-halt instruction. Placed inside the self-detect gate, so both write
surfaces stand down together in the plugin repo. No `recordBlock` — the halt is not a fresh
violation.

Side effect: `classifyBashMutation` no longer short-circuits on an empty `protectedPaths`, since a
project that protects nothing can still be halted. Deny behaviour is unchanged — passes 1 and 2 are
inert against an empty list and pass 3 is now explicitly gated on it.

## Verification

Every attack in findings 1 and 2 re-run against the real guard subprocess, with flag-unset
controls, plus a hunt for further routes. Two methodology corrections were needed and both mattered:

- The first probe **poisoned itself** — three denials halt the guard, after which every later case
  denies as `[HALTED]` and passes for the wrong reason. Fixed by one fresh project per case, and
  the integration suite now carries a `denyEach` helper that asserts the reason is *not* `[HALTED]`.
  Six of the new cases were passing vacuously before that.
- The first version of the fs resolver missed dangling symlinks (above).

## Residuals left open, measured not assumed

1. **Case folding on the protection side.** On APFS `Edit AGENTS/coder.md` writes
   `agents/coder.md` and is allowed; so are `HOOKS/config.json` and `rm AGENTS/coder.md`. Predates
   this Circle, independent of the flag, symmetric across both surfaces. The grant side is closed
   (`realpathSync.native` folds case).
2. **An unresolved second name for the project root.** `Edit <symlink-to-root>/agents/coder.md`
   allows. Already documented in the harness docstring as the macOS realpath trap.
3. **A symlink into a protected directory** (`shortcut -> agents`) still escapes protection. This
   is the reviewer's own accepted residual of a text classifier; the escalation direction is closed.
4. **Planting an alias via `mv`/`cp -P`/`install -l h`** is allowed. Harmless: every write through
   it is denied (verified end to end for `install -l h`). `mv` must stay exemptible —
   `mv rules/x.md rules/retired/` is the flag's headline use.

## Follow-up not in scope

`rules/protected-path-discipline.md` and `README-hooks.md` state the halt blocks the four write
tools. That is now understated on the Bash surface and should be corrected.
