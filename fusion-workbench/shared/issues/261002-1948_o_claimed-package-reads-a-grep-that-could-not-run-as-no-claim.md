`bin/fusion-claimed-package` reads a `grep` that could not run as "no claim" and exits 0
---
Since `8b92ff3e` the scan passes every record path of a store to one `grep -lE … "${records[@]}" 2>/dev/null || true`. Above the argument-length limit `grep` is never executed (exit 126, "Argument list too long", hidden by `2>/dev/null`), `|| true` turns that into an empty match list, and the helper exits 0 with no output. Its own header says no caller may read a failure as "none claimed", and here the helper does exactly that itself. The old per-record loop had no such limit.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Severity: Low. The failure is silent, but the limit sits far from today's stores: `getconf ARG_MAX` is 1 048 576 here, and at this repository's mean record-path length (144 bytes, 43 records) it is reached at about 7 000 containers. A consumer at a longer project root reaches it sooner.

Evidence (measured 261002, scratch git repo, `/bin/bash` 3.2.57): one claimed container plus 2 201 containers with 200-character slugs (1 259 146 bytes of paths).

```
v12.2.1 helper:  PACKAGE= and CONTAINER= naming the claimed fixture   rc=0
v12.2.2 helper:  (nothing)                                             rc=0
direct call:     /usr/bin/grep: Argument list too long                  rc=126
```

The same `2>/dev/null || true` also cannot tell an unreadable record (grep exit 2) from a non-matching one. That part is unchanged from v12.2.1, where `grep -q … || continue` skipped it the same way: a `chmod 000` claimed record is skipped silently in both versions.

Fix direction: keep the per-store grep but read its exit code. 0 and 1 are answers; anything above 1 with no output is unknown scope, exit 3 with a stderr line. Or batch the list (`xargs`, or `find … -exec grep -l … {} +`), which keeps the argument order the output relies on.

Acceptance: a test builds a store whose record list exceeds the argument limit (or forces the failure some other way) and the helper does not exit 0 with empty output; the existing one, two and three claim cases stay byte-identical.
