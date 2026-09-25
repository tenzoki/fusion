# `bin/monitor`'s `LOOPBACK_BINDS` lists `"::1"` — a bind value the AF_INET server can never reach, so the entry is dead and implies support that crashes

**Filed by:** coderev (incremental review of Turn 2, commits `c45fb44..81d4154`, MONITOR_BIND of `b90d1c8`)
**Scope:** `bin/monitor:1159` (`LOOPBACK_BINDS = ("127.0.0.1", "localhost", "::1")`)
**Severity:** Low — dead tuple entry; the advertised values (`0.0.0.0`, `127.0.0.1`) behave correctly

---

## The defect

`LOOPBACK_BINDS` gates the LAN-URL detection (`bin/monitor:1164`). It includes `"::1"`, implying `MONITOR_BIND=::1` is a supported loopback bind. It is not: `http.server.ThreadingHTTPServer` uses `address_family = AF_INET`, and the bind at `bin/monitor:1157` happens **before** the tuple is consulted. Measured 2026-08-06:

```
>>> http.server.ThreadingHTTPServer(('::1', 0), ...)
gaierror [Errno 8] nodename nor servname provided, or not known
```

So a user who reads the tuple as the supported set and sets `MONITOR_BIND=::1` gets a crashed server at startup, and the `"::1"` branch of the LAN-line gating is unreachable code.

Everything else in the `b90d1c8` change checks out (verified this session): the argv wiring is correct (`bin/monitor:74` `BIND = sys.argv[6]` matches the 7th positional the launcher passes at the `python3 "$TMPFILE" … "${MONITOR_BIND:-0.0.0.0}"` line); the default stays `0.0.0.0` for every production spawn (setup's copied monitor takes no env var, preserving the LAN dashboard of `8586ba3`); the usage text documents both advertised values; the LAN line correctly disappears for `127.0.0.1` and `localhost`; the test spawn (`hooks/lib/__tests__/monitor-warnings-panel.test.ts:109`) pins `127.0.0.1`.

## Recommended fix

Either drop `"::1"` from the tuple (one token; the tuple then states exactly the supported loopback spellings), or — if IPv6 loopback should actually work — select the address family from the bind value before constructing the server. The first is proportionate; nothing requests IPv6.

---

**Resolved:** 2026-08-06 (coder) — dropped `"::1"` from `LOOPBACK_BINDS` (`bin/monitor`), per the issue's preferred option; the tuple now states exactly the supported loopback spellings (`127.0.0.1`, `localhost`) and a comment records why IPv6 spellings are absent (AF_INET server; an IPv6 bind fails at construction before the tuple is consulted). `monitor-warnings-panel.test.ts` (spawns with `127.0.0.1`) green.
