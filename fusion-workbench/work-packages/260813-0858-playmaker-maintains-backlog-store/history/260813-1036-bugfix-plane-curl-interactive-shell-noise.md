# Bugfix: the interactive shell's own stdout was being parsed as Plane's response

**Date:** 2026-08-13 10:36
**Status:** Complete
**Trigger:** Orchestrator dispatch — two failing tests at HEAD in `hooks/lib/__tests__/fusion-plane.test.ts`

## Error

`fusion-plane: the live rebuild, against a reachable Plane`, both cases:

- `fusion-plane.test.ts:1643` — expected stderr to contain `rebuild-map: wrote`
- `fusion-plane.test.ts:1672` — expected stderr to contain `the issues response was empty`

Both received the same stderr instead:

```
fusion-plane: rebuilding .plane-map.json from Plane (embedded fusion-key)…
fusion-plane: rebuild-map: could not parse issues — map not changed
```

## Root Cause

`bin/fusion-plane:354` (pre-fix) — `plane_curl` ran curl inside `zsh -ic` and read that
shell's **entire stdout** as `<body>\n<http_code>`:

```bash
out="$(zsh -ic "$cmd" 2>/dev/null)" && rc=0 || rc=$?
PLANE_HTTP_CODE="$(printf '%s' "$out" | tail -n1)"
PLANE_BODY="$(printf '%s' "$out" | sed '$d')"
```

`-i` sources the user's interactive rc, and an interactive rc may write to stdout. On stock
macOS, `/etc/zshrc_Apple_Terminal:217` writes a session file whose restore prints
`Restored session: <date>` on every interactive-shell startup when `TERM_PROGRAM=Apple_Terminal`
— which it is in this environment. Measured directly:

```
$ zsh -ic "curl -s -w '\n%{http_code}' -X GET http://127.0.0.1:8099/x"
'Restored session: Do 13 Aug 2026 10:33:01 CEST\n{"results": []}\n200'
```

`tail -n1` still read the HTTP code correctly, but `sed '$d'` handed the banner to
`$PLANE_BODY`, so `jq` failed on **every** response body — not just the empty one. That is
why one cause produced two different-looking failures: the positive control's valid payload
and the failure case's empty payload were corrupted identically, and both landed on
`rebuild_map`'s `could not parse issues` branch (`bin/fusion-plane:1657`) instead of, on the
one hand, succeeding, and on the other, reaching the distinct `the issues response was
empty` branch (`:1663`).

Both refusal branches exist in the tool and both strings are live — neither test was stale.
The empty-response case was being silently absorbed by the neighbouring parse-failure
branch, which is exactly the coverage loss that changing the assertion would have cemented.

The zsh's **stderr** was already discarded in anticipation of rc chatter; only stdout was
left open to it.

**This is a product defect, not a test defect.** Any operator whose interactive zsh prints
anything to stdout — an Apple Terminal session restore, a shell banner, a version-manager
line — gets a corrupted body on every Plane API call, and the whole bridge fails with
messages that name Plane rather than the shell.

## Fix

`plane_curl` now sends the response body to a temp file via `curl -o`, so the noisy channel
carries nothing but `%{http_code}` — still preceded by `\n`, so it is always the last line
and rc noise can only ever precede it. `rebuild_map` and the two tests were not touched.

| File | Change |
|------|--------|
| `bin/fusion-plane:334-352` | Header comment records why the body must never be read off the interactive shell's stdout |
| `bin/fusion-plane:353-379` | `plane_curl`: added `-o <tmp>`, `PLANE_BODY` read from that file, temp file removed on both the transport-failure and success paths |

## Verification

- [x] Original error resolved — both live-rebuild cases pass on their own assertions, unchanged
- [x] Full test suite passes — 48 files, 1010 tests, 0 failures
- [x] No regressions introduced — suite total unchanged (1010: was 3 failed + 1007 passed)

Established for issue `260813-0828`:

- **Environment-dependent: yes.** The mock needs `zsh` and `curl` on PATH and a free
  127.0.0.1 port; `PLANE_API_KEY` is injected by the test itself (`runLive`), so its absence
  from the shell is irrelevant. What made the cases red is the *user's own interactive rc*
  writing to stdout. Proof without a code change: `SHELL_SESSION_DID_INIT=1 npx vitest run
  lib/__tests__/fusion-plane.test.ts -t "the live rebuild"` is green at HEAD, because that
  variable suppresses the Apple Terminal session-restore line.
- **Which commit made them red: none.** `git log -S 'the issues response was empty' --
  bin/fusion-plane` names only `dd50efd`, which *added* the string; it is still present at
  HEAD, as is the parse-failure branch. The tests were broken by the environment (a session
  file Apple Terminal writes and re-restores), not by a commit — which also explains their
  intermittency.

## Unrelated Issues Found

- `260813-1036_*_the-manual-fetch-command-fusion-plane-prints-breaks-the-same-way-plane-curl-just-stopped-breaking.md`
  — `seed_defer_manual` (`bin/fusion-plane:2263`) prints a manual fetch command with the
  same `zsh -ic … | jq` shape. Printed, never executed, so out of scope for this fix.
