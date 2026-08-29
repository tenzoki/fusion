# Hardening `plane_curl` — the status code off the noisy channel, both mktemps guarded, nothing interpolated into the zsh string

**Date:** 2026-08-13 12:00
**Status:** Complete
**Agent:** coder
**Trigger:** User dispatch — the three `260813-1051_p_` issues filed by coderev against `7342fdd`

## Records addressed

| Record | Outcome |
|---|---|
| `260813-1051_*_the-http-code-is-still-read-from-the-noisy-channel-and-a-zshexit-hook-writes-after-curl.md` | Closed |
| `260813-1051_*_an-unguarded-mktemp-in-plane-curl-degrades-into-a-wrong-answer-because-every-call-site-suspends-set-e.md` | Closed except the EXIT-trap hygiene point (its "two smaller faults", item 2) |
| `260813-1051_*_plane-curl-interpolates-tmpdir-unquoted-into-the-zsh-command-string.md` | Closed, both lines |

## What changed

`bin/fusion-plane`, `plane_curl` and its two comment surfaces. One shape rather than three
patches: the function no longer reads anything structural off the interactive shell's stdout,
and no longer builds the string that shell parses out of runtime values.

**1. The status code moved to its own file.** The `-w` output is redirected inside the zsh
string (`> "$FUSION_PLANE_CODE"`) and the shell's own stdout is discarded whole
(`>/dev/null 2>&1`). This is the review's preferred remedy and the same move `7342fdd` made
for the body. `tail -n1` is gone.

*Rejected: curl's `--write-out %output{file}`.* It reaches the same end state and is the
cleaner spelling, but it needs curl >= 8.3.0 (Sep 2023). This repository states no curl floor
anywhere — `README.md` `### Requirements` names Claude Code, Node 18+ and Python 3, and
`bin/fusion-plane`'s own dependency line names `curl` unversioned — so adopting it would
impose an undeclared minimum. Confidence is split: the *absence* of a stated floor is
measured (grepped); the claim that in-support distributions still ship older curl
(Ubuntu 22.04 LTS at 7.81, Debian 12 at 7.88) is recalled, not verified here. A plain `>`
redirect needs neither claim to be true, so the constraint was not worth taking on.

**2. A three-digit validation on top.** `case "$code" in [0-9][0-9][0-9])` with a named
diagnostic otherwise. The channel is already empty, so this is the second line rather than
the first — it is what still names a curl that exited 0 having written no status at all
(an rc-defined `curl` function, a failed redirect, a curl too old for `-w`). Without it that
lands on the caller's `2*` case as a generic HTTP error, which is how all three faults used
to present.

**3. Both `mktemp`s guarded, plus the new one, plus the `printf` and the read-back.** Each
failure is named on stderr and returns non-zero. The record's diagnosis is the reason this
is not cosmetic: `set -eu` at `:201` protects nothing inside this function, because all
twelve call sites invoke it in a condition.

**4. Nothing is interpolated into the command string.** Method, URL and all three temp paths
travel in the environment `zsh -ic` inherits. The text the second shell parses is now a
constant assembled from single-quoted literals, so the `$TMPDIR` injection is closed by
construction rather than by quoting. `--data-binary @${tmpbody}` at the old `:365` is fixed
with it, as the review asked.

**5. Comments corrected.** The header's "noise can only ever precede it, never follow it" was
false and is gone. The call-summary at `:59` showed the pre-`-o` invocation form and now shows
the current one.

## Measured while fixing (zsh 5.9, curl 8.7.1, macOS)

The record's `zshexit` mechanism needed one correction, and it decides whether a test
reproduces anything:

- A **lone `zshexit`** never fires against this command. zsh execs the single external command
  in its own place, so the pre-fix function returned `200` — the filed reproduction used
  `printf`, a builtin, which is not exec'd.
- **`TRAPEXIT` alone** fires regardless of the exec, and glues itself onto the code, because
  curl's `-w` output carries no trailing newline: `200TRAP-EXIT-LINE`, which a caller's `2*`
  glob still matches. Milder again, and invisible.
- **Both defined** — the exec is skipped and `tail -n1` returns the hook's line alone
  (`PLANE_HTTP_CODE=EXIT-HOOK-LINE`). That is the filed defect exactly, and it is what the new
  test installs.

The other two reproduce as filed: a `$TMPDIR` holding `` a`touch PWNED`b `` created the file,
and a `$TMPDIR` that does not exist gave `PLANE_HTTP_CODE={"ok":true,…}` on the success branch.

## Tests

`hooks/lib/__tests__/fusion-plane.test.ts`, four cases in "the live rebuild, against a
reachable Plane". `runLive` now delegates to a `runLiveWith(workbench, extraEnv, args, cwd)`
that gives a case control of the child's environment and working directory — the three inputs
these faults travel on. All four were verified to **fail against `7342fdd`'s binary** and pass
against the fix.

1. An exit hook that prints after curl is not mistaken for the status code (`TRAPEXIT` +
   `zshexit`, neither printing at startup — the startup-banner guard belongs to
   `260813-1051_*_the-plane-curl-regression-guard-only-fires-…` and was deliberately left alone).
2. A `$TMPDIR` with a space and a command substitution in it neither breaks the request nor
   executes.
3. A `$TMPDIR` it cannot create a temp file in is named, not reported as an HTTP error. Uses
   `states`, not `map --rebuild`: a broken `$TMPDIR` breaks every `mktemp` in the file, and the
   rebuild path materialises the map view (`:850`, an unguarded `mktemp` outside this function)
   first.
4. A curl that exits 0 having written no status code is named.

Suite: 48 files, **1014 passed**, 0 failed — the 1010 baseline plus these four.

## Not done, deliberately

- **The EXIT trap over the temp files** (record 2, "two smaller faults" item 2). The single
  `trap map_view_cleanup EXIT` at `:831` would have to be restructured to cover more than
  `$MAP_VIEW_TMP`, which reaches outside `plane_curl`. The record calls it hygiene, not
  exposure (`mktemp` gives 0600). Left open.
- **`map_view`'s own unguarded `mktemp` at `:850`**, met while writing test 3. Same class as
  the fault just fixed, different function, no record — worth one.
- **The caller's follow-up line.** A local fault returns non-zero, so it lands on the
  transport-failure branch and a caller may still print "Plane unreachable (curl rc 1)"
  *after* the named diagnostic. `PLANE_CURL_RC` keeps curl's true rc rather than being faked.
  Fixing the wording means editing twelve call sites; out of scope here.
- `seed_defer_manual` at `:2263`, per the dispatch.
