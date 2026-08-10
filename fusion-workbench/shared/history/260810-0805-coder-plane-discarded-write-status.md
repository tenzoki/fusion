# R4 — the third instance of one shape, and every other site of it in the same file

**Agent:** coder
**Date:** 2026-08-10 08:05
**Status:** Complete
**Task:** Turn 3, R4
**Source records:**
- `fusion-workbench/shared/issues/260810-0743_o_map-put-reports-success-on-a-failed-write-so-map-write-s-error-branch-never-fires.md` (High)
- `fusion-workbench/shared/issues/260810-0744_o_map-view-s-cache-and-cleanup-die-in-the-subshell-every-caller-runs-it-in.md` (Medium)
- `fusion-workbench/shared/issues/260810-0750_o_an-unreadable-record-yields-an-empty-plane-comment-instead-of-the-skip-that-exists-for-it.md` (Low, folded in)
- `fusion-workbench/shared/reviews/260810-0752-coderev-turn-2-range-ff70d3a-to-head.md` F1, F3, F7

**Origin:** Not Circle work; no Circle active. Findings against `c923935`, one commit old.

## Reproduction before the fix

Both filed measurements reproduce exactly, against the committed binary at `c923935`.

| Scenario | Measured before | Measured after |
|---|---|---|
| `map --migrate`, workbench `chmod 555` | `STATUS: migrated (1 entries)`, exit 0, map byte-identical | no STATUS line, exit 1, map byte-identical, `could not replace` on stderr |
| `map --forget <key>`, same | `STATUS: forgotten … 1 entries remain`, exit 0, map unchanged | no STATUS line, exit 1 |
| `push --plan --all`, legacy map, private `TMPDIR` | 24 temp files, 24 fold reports | 0 temp files, 1 fold report |
| control: same run, already-folded map | 0 and 0 | 0 and 0 |

Two mechanisms were confirmed directly rather than assumed, because both fixes rest on them:

- **bash resets an inherited `EXIT` trap in a command-substitution subshell.** `T="$(f)"` where
  `f` assigns `T` and creates a `mktemp` file: the parent's `T` is empty afterwards and the file
  survives. So no PID guard is needed in `map_view_cleanup` — the trap simply never runs there.
- **`jq` exits 0 on empty input and produces nothing.** `printf '' | jq -S '.'` → exit 0, 0 bytes;
  `printf '' | jq '.["k"] = {a:1}'` → exit 0, 0 bytes. A zero status from `jq` therefore does not
  say the program ran, which turned out to be a second, unfiled instance of the same class.

## The class

A fallible operation whose status nobody reads, so a failure wears the label that says it
succeeded. `ea492e6` removed it from `bin/fusion-count-sources` at 07:07; `c923935` re-entered it
in `bin/fusion-plane` at 07:18. This is the third instance in one session, so the task was to
enumerate every site of it in the file rather than fix the two the reviewer named.

## What changed — `bin/fusion-plane`

**The High (F1) — `map_put`.** `mv "$1" "$MAP"` now has its status read; on failure the temp file
is removed, the file is named on stderr and the function returns 1. Four already-written
`|| return "$EXIT_CONFIG"` guards (`map_forget`, `map_migrate`, `map_prune`, and `map_write`'s own)
became reachable, which is the whole fix at those sites. Two call sites needed the status added:
`rebuild_map` (which went on to print `wrote N entries` read back out of the unchanged file) and
`cmd_seed --record-origin` (which printed `STATUS: origin recorded`).

**The live push path.** `map_set` at `:1039`/`:1043` discarded the same status, and under `set -e`
propagating it would have aborted the run — contradicting the file's own C4 doctrine. Both sites
now `defer` instead: the create branch's note carries the created issue's UUID and its board URL
with *do not create another*, because that is the exact loss the record predicts (the next push's
`map_get_id` misses and fusion POSTs a second issue — issue `260807-1939` from the write side).

**The Medium (F3) — `map_view` in a subshell.** The header already named this hazard, for the
return value only. **The code moved to the header, not the reverse** — the same direction
`ea492e6` chose for its own doctrine. Building the view is now the parent's job and reading it is
the getter's:

- `map_json`, `map_get_id`, `map_get_state`, `map_get_origin` no longer call `map_view`. They call
  a new `map_view_required`, which fails loudly if no view was built. It fails closed on purpose:
  an empty answer from a getter reads as *not mapped yet* and makes the next push create a duplicate.
- Each subcommand calls `map_view` once, in its own shell: `cmd_push` (at the point where the
  "NO map_ensure here" comment explains what a read path may and may not do), `cmd_map`, and the
  `seed --record-origin` branch. `map_write` and `rebuild_map` already called it from the parent.
- `map_put` now sets `MAP_VIEW="$MAP"` and `MAP_VIEW_READY=1` instead of clearing them. What it
  just wrote is by construction already in the stable key form, so the new file *is* a valid view.
  That removes the invalidate-then-rebuild dance that `map_prune`'s loop would otherwise need.

The temp-file leak is now closed structurally rather than by a counter: at most one fold file
exists per run, in the parent, where the `EXIT` trap does run.

**The Low the reviewer named without a record (F7, filed as `260810-0750`).** Both spec-comment
sites now read `build_comment_body`'s status. The dry-run site's pipe is split in two statements;
the live site in `upsert_spec_comment` had the same hole one level up (an empty `$body` would have
been PATCHed over the brief) and is gated the same way. Both route to `comment_skip`, which exists
for this outcome and was unreachable from either.

*Correction to the record:* it predicts `comment_html: ""`. Measured against `c923935` with an
unreadable record, the op came out carrying `<!-- fusion-spec-comment:… -->\n<pre></pre>` — the
marker intact, the record body gone. The mechanism is the one the record names; the surviving
string is not. Both the code comment and the test say what was measured.

**Four more sites of the same class, found by the enumeration and fixed:**

- `map_write` now refuses to replace `$MAP` with an empty file. `jq` exits 0 on empty input, so a
  truncated map made `.[$k] = {…}` produce nothing, and the empty result was moved over the map:
  the new entry lost, every existing one with it, exit 0. Verified against `c923935` —
  `seed --record-origin` over a zero-byte map printed `STATUS: origin recorded`, exit 0, and wrote
  nothing.
- `rebuild_map` has the same guard (`[ ! -s "$tmp" ]`). An empty issues response walked the whole
  function reporting nothing and ended by replacing the map with a zero-byte file.
- `outbox_drain_circle` read `jq`'s status before the result replaced the outbox. With `|| true`
  there, a malformed outbox left an empty `$tmp`, which was moved over the file and then deleted
  for being empty — a read-and-repair path destroying the human record it was walking, which is
  the shape of `260810-0456`. The `mv` is checked too. Neither failure is fatal: the outbox is a
  human record, not a correctness queue, so a drain that could not run says so and leaves the notes.
- `outbox_append` no longer lets a failed `>>` out. It fails on exactly the unwritable workbench
  the new `map_set` deferrals describe, and under `set -e` that aborted the run — the crash C4
  forbids. Nothing is swallowed: `defer` still counts it, still names it on stderr, still moves the
  exit code to `EXIT_DEFERRED`; only the persistent note is lost, and that loss is reported.

**Two reporting paths that flattened a failure into "nothing to report":** `map_report_fold`'s
loser list and `rebuild_map`'s dropped-UUID report both used `|| printf ''`. Each named UUID is
"the only handle a human has on the stray Plane issue" by the file's own argument, so a list that
could not be produced now says so instead of reading as an empty one.

**One caller-side status:** `cmd_push` reads `emit_plan`'s. The op list is the dry run's entire
output and its consumers parse it; an unemitted plan must not leave exit 0 for them to read as
*no ops*.

## The enumeration — sites examined and deliberately left

Every `mv`, `cp`, `mkdir`, file redirection and pipe-into-filter in the file was walked. The ones
above were fixed. These were examined and left, with the reason:

| Site | Why it stays |
|---|---|
| `plane_curl:296` `printf … > "$tmpbody"` | `set -e` is live at that point (every caller invokes `plane_curl` in an `if` condition, which disables it *inside* the call — but the redirect's own failure aborts the function before any status is claimed). No success is reported over it. |
| `plane_curl:301` `[ -n "$tmpbody" ] && rm -f` | The discarded status is `rm`'s on a temp file already written. An empty `$tmpbody` makes the AND-list return 1, which `set -e` exempts (a non-final command of an AND-OR list). Cosmetic, not a false success. |
| `artifact_title:608` `grep … \| sed … \|\| true` | `grep` returns 1 for *no match*, which is the normal case the fallback exists for, and the fallback (the natural key) is documented. Distinguishing status 1 from status 2 would buy a better title on an unreadable file whose real failure the spec-comment gate now reports. |
| `resolve_canonical_state`, `label_uuid`, `state_uuid`, `comment_id_for_marker` — the `$(… \|\| true)` lookups | Each is followed by an explicit emptiness test that routes to a defer or a skip. The status and the emptiness carry the same information here. |
| `resolve_kind_label:444` `LABELS_JSON="$(… \| jq -c …)"` | A failure empties the per-run label cache; the memo already holds the resolved id, so nothing re-fetches and nothing is misreported. Metadata path, never blocking by design. |
| `attach_child:882`, `:1032`, `:438` — `jq -r '.id // empty' … \|\| true` | Each result is emptiness-checked immediately after, and every failure lands on a defer or the documented links fallback. |
| `ls … \|\| true` at `:1140`, `:1458` and the five `< <(ls … 2>/dev/null \| sort)` loops | The failure *is* the answer: no matching file. An empty list yields "no `*_circle.md` — skipping" or an empty loop, both intended. |
| `cmd_seed:1795` / `rebuild_map:1297` `issues_json="$(cat "$fixture")"` | Plain assignments after an `[ -f ]` check; `set -e` aborts on a read failure in `cmd_seed`, and in `rebuild_map` the new empty-`$tmp` guard catches the one path where `set -e` is disabled. |
| `cmd_doctor:1669` `jq … \|\| echo '?'` | The `?` is the report — doctor's whole job is to describe what it could and could not determine. |
| `rebuild_map` second jq (`jq -S '.map'`) and `info "wrote $(jq 'length' …)"` | Both run on input the new guards have already proven non-empty. The `info` substitution can only degrade the printed count, never the exit code or the write. |
| `outbox_drain_circle` — reaching it at all | It runs only after a fully successful live reconcile, which no test can reach without a Plane instance. The fix is reasoned from the code and verified by reading, **not** by execution. |
| The live `map_set` deferrals | Same limit: they need a 2xx from Plane followed by a failed local write. Verified by construction (the two branches are the only callers of `map_set` on that path), not by a live run. |

`bin/fusion-plane` sets `set -eu` and **no `pipefail`**. Adding `pipefail` was considered and not
done: it would change the status of every `ls … | head`, `printf … | jq` and `grep … | sed` in the
file at once, including the ones whose first-stage failure is the intended answer. The two pipes
where the first stage's failure was load-bearing are split into statements instead.

## Tests — `hooks/lib/__tests__/fusion-plane.test.ts`

Section 7 added, 8 tests. Each was checked against the pre-fix binary (`git show c923935:…`) to
confirm it fails there rather than passing for the wrong reason.

- `map --migrate` and `map --forget` over a `chmod 555` workbench: non-zero exit, no `STATUS:` line,
  map byte-identical. Plus the **positive control** — the identical map one permission bit apart
  migrates and reports it, so the two tests cannot pass by never reaching the write.
- `map_write` refuses an empty result: `seed --record-origin` over a zero-byte map.
- The leak measurement: `push --plan --all` with `TMPDIR` pointed at a private directory asserts
  0 files and exactly 1 fold report.
- Its **negative control** runs the actual pre-fix text read out of git through the identical path,
  the template `queue-retirement-empty-key.test.ts` set. It asserts the property (more than one of
  each) rather than the constant 24, and skips visibly in a repo without the commit.
- A structural lint: none of the four getters may call `map_view`, only `map_view_required`. That
  is the invariant whose breach is how the leak entered a file whose header had already named it.
- The unreadable-record spec-comment: no op emitted, `record unreadable` on stderr, the Circle's own
  op still planned and exit still 0 (auxiliary, never costs the transition).

**Suite: 38 files, 1001 tests, 0 failures.** Baseline at HEAD was 993; the 8 above are the delta.

## Documentation

`docs/plane-setup.md` gains one paragraph in the map-repair section: a map write can fail to land,
and when it does the command names the file, prints no `STATUS:` line and exits 1. The doc already
stated that doctrine for an absent key (`map --forget` on a typo); it now covers the write itself.

## Files changed

- `bin/fusion-plane`
- `hooks/lib/__tests__/fusion-plane.test.ts`
- `docs/plane-setup.md`

Nothing committed and nothing renamed, per the task.

## Left open

The three source records stay `_o_`. `260810-0743` and `260810-0744` are fixed here in full;
`260810-0750` is fixed as well, but its trailing instruction — name the two `[ -f ]`-guarded pointer
reads `ea492e6`'s message also mentions — is **not** done. Checked, not assumed: `bin/fusion-plane`
has eleven `[ -f ]` guards and none of them reads a pointer file (`.active-circle`); the phrase does
not describe anything in this file. The likeliest site is `bin/fusion-paths:227-229`, which is
outside this task's file list, so naming them precisely needs its own task while the `ea492e6`
executor's context is still recoverable.

Two fixes are reasoned rather than executed, and are marked as such in the enumeration table above:
the live `map_set` deferrals and `outbox_drain_circle`, both of which need a 2xx from a real Plane
instance to reach. No test covers either.
