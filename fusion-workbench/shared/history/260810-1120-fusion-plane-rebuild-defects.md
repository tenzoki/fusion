# Four defects in `bin/fusion-plane`, filed against `98c8b3f`

**Agent:** coder
**Status:** Complete
**Baseline:** HEAD `7ddacbc`
**Sources:** `260810-1032_*_push-rebuild-map-swallows-a-failed-rebuild-…`,
`…_o_map-rebuild-has-a-third-outcome-…`, `…_o_the-new-skipped-guard-makes-one-entry-report-twice-…`,
`…_o_map-rebuild-silently-ignores-a-positional-key-…`

---

## Verification

`cd hooks && npm test` — exit 0. 39 test files, 1036 tests, all green.

---

## 1. The blocker — a failed rebuild no longer reaches the reconcile

**Decision taken: abort, do not continue with a warning, and do not fall through to the
outbox either.**

The reconcile reads `.plane-map.json` to decide, per artifact, whether to PATCH an existing
Plane issue or POST a new one. On a stale map every artifact it does not know about is
POSTed as a new issue, which is exactly the duplication the rebuild exists to prevent. A
warning annotates that damage rather than preventing it, because a POST has already
happened by the time anything is printed. Not running the reconcile is the only thing that
prevents it.

The `emit_manual_only` outbox path, which both neighbouring branches take, is wrong here
for the same reason one level down: `_manual_defer` asks `map_get_id` whether to tell the
operator "update `<URL>`" or "create", so the notes it writes are the stale map's answers
handed to a human to execute by hand. Same falsehood, slower channel.

Changes in `bin/fusion-plane`:

- `cmd_push` live branch: `rebuild_map || true` → capture the status through
  `|| rebuild_rc=$?` and return it, with two `err` lines naming the consequence. The status
  is captured through `||` rather than read after `if ! rebuild_map`, because `!` inverts
  the pipeline and `$?` inside that branch is 0 — the same swallow, re-entered from the
  shell side.
- The `rebuild_map` header comment claiming "there is no second implementation to keep in
  step" was false when written; it now says what the two callers actually agree on and why
  the claim is what let the divergence sit unread.
- `usage()` and `docs/plane-setup.md` say what a failed rebuild does to the push.

### Measured, before and after

Reviewer's setup, reproduced: a real HTTP mock on `127.0.0.1` answering
`GET issues/?per_page=100` with HTTP 200 and an empty body (which `rebuild_map` refuses),
`states/`, `labels/`, `POST` and `PATCH` all answering normally. `PLANE_API_KEY` set to a
literal so the live gate opens. The fixture workbench holds a stale one-entry map and six
mirrorable artifacts.

| | exit | `STATUS:` on stdout | map on disk | reached the board |
|---|---|---|---|---|
| before | 0 | `ok (6 pushed)` | replaced by the reconcile's own writes | 5 × `POST issues/`, 1 × `PATCH` |
| after | 10 | none (two `err` lines) | byte-identical to before the run | nothing |

The exit is 10 rather than 1 because change 2 below reclassified that condition; before
change 2 it was 1. Either way it is non-zero, which is the property the test asserts.

### The coverage gap that hid it

No test drove the live rebuild against a **reachable** endpoint. Every live-path case in
the suite uses the unroutable `.test` host, where `fetch_states` fails immediately after
the rebuild and the push defers for its own reason — exit 10 whether the status was
propagated or discarded. Four new cases in
`hooks/lib/__tests__/fusion-plane.test.ts` (`describe: the live rebuild, against a
reachable Plane`) run a real `node:http` server on `127.0.0.1` and point the fixture
config's `base_url` at it, so `plane_curl`'s whole chain runs unmodified (`zsh -ic`, the
key header, curl, the status/body split):

1. positive control — a rebuild that reaches Plane lands and the push then reconciles
   (this is what proves the mock is genuinely reachable, so case 2 cannot pass for the
   wrong reason),
2. a failed rebuild cancels the reconcile: nothing on the board, map unchanged, no
   `STATUS: ok`, no outbox,
3. the two spellings of one rebuild agree on a failure,
4. a Plane answer that could not be read is a deferral, not a config error (change 2).

Each was confirmed red against `git show HEAD:bin/fusion-plane` before the fix.

The runner for these is async (`spawn`, not `spawnSync`) and it has to be: the mock lives
in the vitest process, so a synchronous spawn blocks the event loop that has to answer the
helper's curl, and the run deadlocks instead of failing.

## 2. `map --rebuild` — three named outcomes, each on a `STATUS:` line

- **Classification.** `rebuild_map` now derives a single `read_fail` code from where the
  payload came from: a fixture is a local file the operator named (`EXIT_CONFIG`), Plane's
  answer is a remote one we could not interpret (`EXIT_DEFERRED`). That is `map_prune`'s C4
  doctrine asked of the same board one function further out. The empty-body and
  unparseable-response paths follow it; fixture-not-found and map-not-written stay
  `EXIT_CONFIG`. The `jq -S '.map'` read-back is always local — it reads this function's
  own temp file — and its message no longer duplicates the response-parse one.
- **`STATUS:` on every path.** `map_rebuild` sets a status in each branch and falls through
  to one tail. There is no `return` between the branches and the tail, so a fifth failure
  path added later cannot skip it by construction. Three outcomes: `rebuilt` (0),
  `deferred` (10), `failed` (1); both failures leave the map untouched, which is why
  "0 rebuilt" is the honest count on either.
- Named in `usage()` and in `docs/plane-setup.md` (a three-row table).

## 3. An id-less entry is reported once, and truthfully

`orphans` in `JQ_REBUILD_MAP` now subtracts `$skipped` as well as the usable keys. It was
computed from what survived the id guard, so a key the guard dropped, and that the current
map holds, landed in both sets — once as `SKIPPED`, once on the orphan line asserting it
"carries no fusion-key in Plane", which is false for it. For a `seed`-origin entry the
false line also printed the `seed --record-origin` re-bind.

The failure mode to avoid was removing the diagnostic that `98c8b3f` had just added, so the
`SKIPPED` line is untouched and a second test pins the over-application: a map entry whose
Plane issue genuinely carries no embedded key is still reported as an orphan, with the
re-bind command.

## 4. `map --rebuild <key>` no longer destroys the entry the key names

`cmd_map` refuses a bare positional key beside any mutator, placed with the other argument
checks and before `resolve_workbench`, so it costs nothing and reaches `--prune` and
`--migrate` too rather than only the newest mutator. `--forget` is unaffected: its key
arrives through the flag. The test covers all three mutators plus the two forms that
legitimately carry a key.

---

## Files changed

- `/Users/k1/Projects/productive/fusion/bin/fusion-plane`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fusion-plane.test.ts`
- `/Users/k1/Projects/productive/fusion/docs/plane-setup.md`

Not committed, and no issue marker renamed — the user does both after validating.

## Kept out of

`stable_basename`, `JQ_STABLE_KEY` and the map-format handling around them, per the
concurrent-work boundary. Every hunk in `bin/fusion-plane` sits at line 1419 or below.
