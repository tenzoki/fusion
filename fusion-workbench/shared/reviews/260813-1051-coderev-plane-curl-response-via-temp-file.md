# Code review — `plane_curl` reads the response body from a file (`7342fdd`)

**Sender:** coderev
**Reviewed-range:** `1c2d555..7342fdd`
**Not-opened:** `fusion-workbench/circles/260813-0858-playmaker-maintains-backlog-store/_t_circle.md`, `fusion-workbench/circles/260813-0858-playmaker-maintains-backlog-store/history/260813-1031-bugfix-circle-stash-test-locale.md`, `fusion-workbench/circles/260813-0858-playmaker-maintains-backlog-store/history/260813-1036-bugfix-plane-curl-interactive-shell-noise.md`, `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/portfolio.md`, `fusion-workbench/shared/history/260813-0806-orchestrator-session.md`, `fusion-workbench/shared/history/260813-0926-playmaker-direct-dispatch.md`

**Scope note.** The dispatch narrowed `bin/fusion-plane` to `plane_curl` and its header comment;
the rest of that 2000-line file is unchanged in the range and was read only where the review
needed it (`set -eu` at :201, the twelve call sites, the EXIT trap at :831, `plane_key_present`
at :388, `seed_defer_manual` at :2263). The seven not-opened files are workbench records, out of
this agent's review scope; they are listed because the mandate asks for the absence, not for a
judgement about it.

---

## Summary

The change is correct and it fixes a real, severe defect: the response body no longer travels on
a channel the operator's interactive rc is entitled to write to. Nothing in the diff should be
reverted. Five findings sit around it — two on lines the change touched, two on lines it copied a
pattern from, one on coverage — and none of them is a reason to hold `7342fdd`. The verdict is
**sound as it stands, with follow-ups filed.**

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 4 |
| Low | 1 |

## What the change gets right (verified, not assumed)

- **Temp-file cleanup is complete.** `plane_curl` has exactly two `return` statements (`:374`,
  `:381`) and both `rm -f "$tmpresp"`. `tmpbody` is removed at `:369`, before the branch, so it
  is covered on both. There is no third exit: `set -e` cannot fire inside the function, because
  all twelve call sites invoke it in a condition (`if ! plane_curl …` at :396, :447, :502, :593,
  :603, :608, :1278, :1284, :1661, :2014, :2362; `if plane_curl …` at :1142), and bash suspends
  `-e` for the whole body of a function called that way. Measured. The completeness therefore
  holds *because of* the call-site shape — a future bare `plane_curl …` call would let a failing
  `mktemp` or a failing `printf > "$tmpbody"` exit the script with `tmpresp` behind.
- **The transport-failure reading is still correct.** `-o` makes curl write a file for 4xx/5xx
  too, but the code's contract is "curl ran, an HTTP response arrived", and that is exactly
  curl's exit status, unchanged by `-o`. On `rc != 0` the code discards a possibly partial file
  and clears both globals — right, since a partial body is not a body.
- **Empty is not confused with absent, in the cases that occur.** A 204 gives an existing empty
  file, `PLANE_BODY=""`, `PLANE_HTTP_CODE="204"` — identical to the old `sed '$d'` result, so no
  regression, and callers branch on the code, not on the body. (Empty and *missing* are
  indistinguishable, but on `rc = 0` a missing file only arises from the two faults filed below.)
- **The test change is right.** `spawnSync` replaces the child environment when `env` is given,
  so `{ ...process.env, LC_ALL: "C" }` is the correct idiom and drops nothing. It is on the same
  `r` the assertion reads. `LC_ALL=C` beats `LANGUAGE`, verified against git 2.49.0 here:
  `LC_ALL=C LANGUAGE=de LANG=de_DE.UTF-8 git checkout -b` → `error: switch 'b' requires a value`.
  The test still proves its name: non-zero status, git's own reason for refusing, working tree
  unchanged.

## Findings by theme

### Quoting and injection at the shell boundary — Medium

`shared/issues/260813-1051_o_plane-curl-interpolates-tmpdir-unquoted-into-the-zsh-command-string.md`

`bin/fusion-plane:361` interpolates `${tmpresp}` unquoted into a string that a second shell
parses as source. The path is `$TMPDIR` plus a fixed suffix. Measured: a `TMPDIR` containing a
space splits the command and every request comes back `PLANE_HTTP_CODE=000` with an empty body
and `rc = 0` — silently dead, the same class of failure the commit set out to close. A `TMPDIR`
whose path contains a directory named with backticks executes the embedded command inside
`zsh -ic` (verified with a created file). **Not introduced here** — `--data-binary @${tmpbody}`
at `:365` predates it and has the identical shape. It is safe today only by the accident of
`$TMPDIR` normally being `/var/folders/…/T/`.

### Unguarded failure that becomes a wrong answer — Medium

`shared/issues/260813-1051_o_an-unguarded-mktemp-in-plane-curl-degrades-into-a-wrong-answer-because-every-call-site-suspends-set-e.md`

`bin/fusion-plane:360` does not check `mktemp`. Because `set -e` is suspended at every call site,
the function runs on with an empty `$tmpresp` instead of aborting. Measured on curl 8.7.1: `-o`
then consumes `-w` as its operand, so **no `%{http_code}` is written at all**, the body lands on
that shell's stdout, curl still exits 0, `tail -n1` returns the body's last line as the "HTTP
code", and `cat ""` leaves `PLANE_BODY` empty. Every caller reports an HTTP error and none names
the cause. The pre-existing `tmpbody` mktemp at `:363` is unguarded too but degrades better —
curl exits non-zero and it lands on the transport-failure branch. Two smaller faults ride along:
`PLANE_BODY="$(cat "$tmpresp")"` at `:379` ignores `cat`'s status, and the single
`trap map_view_cleanup EXIT` at `:831` covers only `$MAP_VIEW_TMP`, so an interrupt now leaves a
response body in `$TMPDIR` (0600, so hygiene rather than exposure — but bodies did not previously
touch disk at all).

### A stated absolute that does not hold — Medium

`shared/issues/260813-1051_o_the-http-code-is-still-read-from-the-noisy-channel-and-a-zshexit-hook-writes-after-curl.md`

The new header comment (`:349-350`) and the new inline comment (`:375-376`) claim noise "can only
ever precede" the code, "never follow it". True for startup noise, false for exit-time output:
`zsh` runs `zshexit` (and `TRAPEXIT`) after the command. Measured — with a `zshexit` printing one
line, `tail -n1` returns that line instead of `200`, so `PLANE_HTTP_CODE` never matches any
caller's `2*`. The body is now safe, so this is strictly milder than the fixed defect, but it is
the same operator, the same rc, and the same silence. `plane_key_present` (`:388`) is unaffected:
it reads only the exit status, and a `zshexit` returning non-zero does not change it (measured).

### The fix has no test that reproduces its trigger — Medium

`shared/issues/260813-1051_o_the-plane-curl-regression-guard-only-fires-on-a-machine-whose-interactive-rc-prints.md`

The two live-rebuild cases are real end-to-end coverage of `plane_curl`, which is why they caught
this at all — but they caught it because *this* Terminal prints a session-restore line. The
resolution record proves the dependency from the other side: `SHELL_SESSION_DID_INIT=1` made them
green at the broken HEAD. `runLive` (`fusion-plane.test.ts:1603-1620`) already builds the child
env, so a `ZDOTDIR` fixture whose `.zshrc` prints a banner would make the guard deterministic on
any machine.

### The locale fix is at the leaf, not at the shared helper — Low

`shared/issues/260813-1051_o_lc-all-c-sits-on-the-leaf-git-invocation-not-on-the-test-files-shared-git-helper.md`

`circle-stash-git-exclusion.test.ts:52`'s shared `git()` helper is still locale-dependent.
Harmless today — every assertion through it reads machine-shaped output — and harmless only for
as long as that stays true, in the file where this just broke.

## Cross-cutting observations

1. **Two of the five findings are one shape appearing twice in four lines.** `${tmpresp}` and
   `${tmpbody}` are both unquoted into the command string, and both `mktemp`s are unchecked. The
   change did not introduce the pattern; it doubled it. Whoever fixes either line should fix both,
   which is why they are filed as two issues by *fault* rather than four by *line*.
2. **The defect class is not closed, only narrowed.** The commit's own diagnosis — an interactive
   rc is entitled to write to stdout, so do not read its stdout — is right, and the fix applies it
   to the body while leaving the status code on that channel. The `zshexit` finding, the `mktemp`
   finding and the `$TMPDIR`-with-a-space finding all end at the same place: `PLANE_HTTP_CODE`
   holds something that is not three digits and nobody looks. **A single three-line guard —
   validate the code against `[0-9][0-9][0-9]` and emit a named diagnostic otherwise — converts
   all three from a mysterious HTTP error into a sentence.** That is the highest-value change
   available here and it is smaller than any of the individual fixes.
3. **`set -e` is off wherever this tool does HTTP.** Every `plane_curl` call site is a condition,
   which is good style and also means `set -eu` at `:201` protects none of the function's
   internals. Any error handling inside it has to be explicit. Worth knowing before the next
   change to it.

## The related record — nothing to add

I swept the repository for further instances of the `zsh -ic … | jq` shape that
`260813-1036_o_the-manual-fetch-command-…` records. There are none beyond the one it already
names. What the sweep found instead: `plane_key_present` (`bin/fusion-plane:388`) reads only the
exit status and discards both channels, so it is safe; `docs/plane-setup.md:41-45`,
`templates/plane.config.yaml:28` and `skills/seed-from-plane/SKILL.md:13` describe the wrapper in
prose without printing a copy-pasteable command. One cosmetic residue: the key-handling summary at
`bin/fusion-plane:59` still shows the pre-fix invocation shape (`zsh -ic "curl -s -H … \"<url>\""`,
no `-o`). It illustrates key handling rather than body reading, so it is not wrong, only dated —
not worth a record of its own, and worth a line if that header is edited for another reason.

## Recommended sequencing

- **Not a release blocker.** `7342fdd` is a strict improvement over `1c2d555` on every path
  examined. Nothing here argues for holding it.
- **Next, and cheapest first:** the three-digit validation of `PLANE_HTTP_CODE` (closes the third
  finding and makes the other two loud instead of silent).
- **Then, together, in one pass over four lines:** guard both `mktemp`s and quote both temp paths
  out of the command string (env-passed is the clean form).
- **With whichever of those lands:** the `ZDOTDIR` noise fixture, so the regression guard stops
  depending on the developer's own shell.
- **Cleanup, any time:** `LC_ALL=C` on the test file's shared `git()` helper.
