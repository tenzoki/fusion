# `plane_curl` interpolates `$TMPDIR` unquoted into the string it hands to `zsh -ic`

---

**Severity:** Medium — a space in `TMPDIR` kills every request silently; a metacharacter in it executes arbitrary commands. Both need control of the environment, which bounds the reach.
**Domain:** code
**Filed by:** coderev, reviewing `7342fdd` (`260813-1051-coderev-plane-curl-response-via-temp-file.md`)
**Affects:** `bin/fusion-plane:361` (new in `7342fdd`), `bin/fusion-plane:365` (pre-existing, same shape)
**Cross-references:** `260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md` (the fix this reviews)

---

## The defect

```bash
tmpresp="$(mktemp "${TMPDIR:-/tmp}/fusion-plane-resp.XXXXXX")"
local common="-s -o ${tmpresp} -w '\\n%{http_code}' -X ${method} -H \"X-API-Key: \$PLANE_API_KEY\""
...
cmd="curl ${common} \"${url}\""
out="$(zsh -ic "$cmd" 2>/dev/null)" && rc=0 || rc=$?
```

`${tmpresp}` goes into `$common` unquoted, `$common` goes into `$cmd`, and `$cmd` is parsed
as source text by a second shell. The path is `$TMPDIR` plus a fixed suffix, so whatever is
in `$TMPDIR` is parsed by `zsh`. The pre-existing `--data-binary @${tmpbody}` at line 365 has
the identical shape; the change added a second instance rather than introducing the pattern.

**Measured, both cases, on this machine (zsh 5.9, curl 8.7.1):**

A `TMPDIR` containing a space — the command splits into an extra argument, which curl reads
as a second URL:

```
cmd=[curl -s -o /…/tm/has space//fusion-plane-resp.V30W58 -w '\n%{http_code}' "file:///…/src.txt"]
out=[000HELLO-BODY

000]
tmp file: empty
```

`PLANE_HTTP_CODE` becomes `000`, `PLANE_BODY` becomes empty, and `curl` exits 0 — so the
success path is taken and every caller falls through its `2*` case to "HTTP error". The whole
bridge is dead, silently, which is the exact failure class `7342fdd` set out to close.

A `TMPDIR` whose path contains a directory named with backticks — the embedded command runs:

```
$ mkdir 'inj/a`touch PWNED-BY-TMPDIR`b'
$ TMPDIR=…/inj/a`touch PWNED-BY-TMPDIR`b/   # then the plane_curl construction verbatim
$ ls PWNED-BY-TMPDIR
-rw-r--r--  0  PWNED-BY-TMPDIR
```

A payload cannot contain `/` (it must be a directory name), which rules out most path-bearing
commands but not `$(...)`/backtick payloads generally.

## Why it is not merely theoretical

`TMPDIR` is not a value the operator normally types — it is set by launchd, by CI runners, by
container and sandbox wrappers, and by anything that re-parents a build. It is the one input
to this function that comes from outside and is never validated.

## Suggested remedy

Do not interpolate the path into the command text at all. Pass it through the environment,
which `zsh -ic` inherits, and quote it inside the string:

```bash
FUSION_PLANE_RESP="$tmpresp" FUSION_PLANE_BODY="$tmpbody" \
  zsh -ic 'curl -s -o "$FUSION_PLANE_RESP" … --data-binary @"$FUSION_PLANE_BODY" …'
```

If the interpolation is kept, single-quote both operands inside `$cmd` and reject a `$TMPDIR`
containing a single quote — a strictly weaker fix, and one that has to be got right twice.

---
Resolved: both instances, and not by quoting. The string `zsh -ic` parses is now a **constant** — single-quoted throughout, referencing `$FUSION_PLANE_METHOD`, `$FUSION_PLANE_URL`, `$FUSION_PLANE_RESP`, `$FUSION_PLANE_CODE` and `$FUSION_PLANE_BODY`, all of which travel in the environment that shell inherits rather than being interpolated into its source text. The pre-existing `--data-binary @${tmpbody}` at the old `:365` went the same way, since leaving one instance is leaving the defect.

That is a stronger answer than the quoting this record asked for. A quoted interpolation is still text a second shell parses, and its safety then rests on the quoting being right at every future edit; an environment variable is never parsed as source at all. Injection through `$TMPDIR` is now structurally impossible rather than defended against, which is the difference between a fix and a mitigation.
