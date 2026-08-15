# An unguarded `mktemp` in `plane_curl` degrades into a wrong answer, because every call site suspends `set -e`

---

**Severity:** Low — the headline defect is fixed; what remains is a leak on abnormal exit and one unguarded `mktemp` on an earlier path
**Domain:** code
**Filed by:** coderev, reviewing `7342fdd` (`shared/reviews/260813-1051-coderev-plane-curl-response-via-temp-file.md`)
**Affects:** `bin/fusion-plane:360` (new in `7342fdd`), `bin/fusion-plane:363` (pre-existing, same shape), `bin/fusion-plane:379` (the unchecked `cat`)
**Cross-references:** `shared/issues/260813-1051_o_plane-curl-interpolates-tmpdir-unquoted-into-the-zsh-command-string.md` (the same two lines, a different fault)

---

## The defect

```bash
tmpresp="$(mktemp "${TMPDIR:-/tmp}/fusion-plane-resp.XXXXXX")"
local common="-s -o ${tmpresp} -w '\\n%{http_code}' …"
```

Nothing checks that `mktemp` succeeded. `bin/fusion-plane:201` sets `set -eu`, so the failed
assignment would normally kill the script — but **every one of the twelve `plane_curl` call
sites is a condition** (`if ! plane_curl …` at lines 396, 447, 502, 593, 603, 608, 1278, 1284,
1661, 2014, 2362, and `if plane_curl …` at 1142), and `set -e` is suspended for the whole body
of a function invoked in a condition. Measured:

```bash
set -eu
f() { local t; t="$(false)"; echo "REACHED t=[$t]"; return 0; }
if ! f; then echo "f returned nonzero"; fi   # → REACHED t=[]  … set -e did not fire
f                                             # → script dies here
```

So the guard that would have caught this is off at every live path, and the function runs on
with an empty `$tmpresp`.

## What curl actually does with an empty operand

`-o` takes the next argument, and the next argument is `-w`. Measured on curl 8.7.1:

```bash
$ curl -s -o -w "file://$PWD/src.txt" "file://$PWD/src.txt"   # two URLs, one -o
$ ls
-w   src.txt      # the first transfer went to a file literally named "-w"
$ # stdout carried the second transfer's body
```

In the real construction the argument after `-w` is `\n%{http_code}`, which curl reads as a
malformed first URL. The result, measured: **no `%{http_code}` is ever written**, the response
body arrives on that shell's stdout, and curl still exits 0. Then:

- `PLANE_HTTP_CODE` = `tail -n1` of the response body — the body's last line, never `2*`;
- `PLANE_BODY` = `cat ""` → empty, with `cat: : No such file or directory` on stderr;
- `plane_curl` returns 0, so every caller reports an HTTP error and none names the cause.

The pre-existing `tmpbody` mktemp at line 363 is unguarded too, so the pattern is not new —
but it degrades better: `--data-binary @` makes curl exit non-zero, which lands on the
transport-failure branch. The new instance degrades onto the success branch.

## Two smaller faults on the same lines

1. **`PLANE_BODY="$(cat "$tmpresp")"` (line 379) ignores `cat`'s exit status.** A missing or
   unreadable response file is indistinguishable from a genuine empty body (HTTP 204), which
   is a real and correctly-handled case elsewhere in this tool.
2. **No trap covers the two temp files.** The single `trap map_view_cleanup EXIT`
   (`bin/fusion-plane:831`) covers only `$MAP_VIEW_TMP`. An interrupt between curl and the
   `rm -f` now leaves a **response body** in `$TMPDIR` — a new kind of residue, since bodies
   did not previously touch disk. Bounded by `mktemp`'s 0600 mode, so it is a hygiene point,
   not an exposure.

## Suggested remedy

```bash
tmpresp="$(mktemp "${TMPDIR:-/tmp}/fusion-plane-resp.XXXXXX")" || {
  err "plane_curl: could not create a response temp file in ${TMPDIR:-/tmp}"; return 1; }
```

and the same for `tmpbody`, and check the read back:

```bash
PLANE_BODY="$(cat "$tmpresp")" || { err "plane_curl: response file vanished"; ... }
```

Whatever shape is chosen, the rule this tool already states for itself applies: never silent.

---
Partially resolved, and **re-scoped to what remains**. The marker returns to `_o_` rather than `_c_`: the headline defect is gone, two neighbouring instances of the same pattern are not, and closing on the headline would retire a record whose remaining half nobody else is carrying.

**Done.** Every `mktemp` inside `plane_curl` is guarded, as are the `printf` that writes the request body and the read-back of the response. Each of the three local faults now costs one sentence on stderr naming it, instead of presenting as a generic HTTP error at the caller (`HYG-NO-SILENT-FAIL`). The `set -e` analysis in this record was confirmed while fixing and is the reason the guards are explicit `if !` blocks rather than a reliance on `-e`.

**Not done, and this is now what this record is about.**

1. **The EXIT trap does not cover the temp files.** `trap map_view_cleanup EXIT` at `bin/fusion-plane:831` is the file's only EXIT trap and knows nothing of `plane_curl`'s three temp files. Every ordinary path removes them, so this is a leak only when the process dies between `mktemp` and the cleanup — a signal, or a failure in a caller between the two. Fixing it means restructuring that trap, which is outside `plane_curl` and was deliberately left out of a change scoped to one function.

2. **`map_view` at `bin/fusion-plane:850` carries the identical unguarded `mktemp`.** Found while fixing this record, not previously filed. It sits on the rebuild path **before** `plane_curl` runs, so it fails earlier than the defect this record was written about, and the guards just added do not cover it. It is recorded here rather than as a competing record because it is the same defect in the same file, and splitting one pattern across two records is how one of them gets fixed and the other forgotten.

**Acceptance for the remainder:** no `mktemp` in `bin/fusion-plane` is unguarded, and a temp file created by `plane_curl` or `map_view` does not survive an abnormal exit.

---

## Reconciliation 260813-1545 — the remainder is confirmed, and the enumeration undercounts it

Re-measured against `bin/fusion-plane` at `2a029eb` by listing every `mktemp` in the file.

**Two citations have drifted since this record was written.** `d6dd193` moved lines. The three
guarded `mktemp`s in `plane_curl` are now at `:395`, `:400` and `:409`, not the `:360`/`:363`/`:379`
in the `**Affects:**` header; `map_view`'s unguarded one is at `:927`, not `:850`. Both guards
verified present at the new lines in the `if ! tmp="$(mktemp …)"; then` form.

**The residual is larger than point 2 states.** It names `map_view` as the one identical case. The
file carries **six** unguarded `mktemp` calls, not one:

| Line | Function context |
|---|---|
| 927 | `map_view` — the one this record already names |
| 996 | the stamped-map path |
| 1024 | `map_write` |
| 1129 | the outbox writer |
| 1750 | `--rebuild-map` |
| 1778 | the same, the `out` temp |

The acceptance criterion this record already carries — *no `mktemp` in `bin/fusion-plane` is
unguarded* — is the right one and is unchanged by this; it is the enumeration under it that would
have led a fixer to guard one call and believe the record satisfied. Point 1 (the single EXIT trap
at `:908` is `map_view_cleanup` and covers none of `plane_curl`'s temp files) is confirmed
unchanged.

Severity is unchanged at Low: every ordinary path still removes its temp files, and the headline
defect stays fixed. Suite green at 49 files / 1019 tests.

---
Resolved: moot, not fixed. All three cited lines are inside `bin/fusion-plane`, deleted in `d0ddabb`. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913.
