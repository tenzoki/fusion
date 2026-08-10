# The rebuild becomes a command of its own, and the id guard closes the silent collision

**Status:** Complete
**Agent:** coder
**Source records:**
- `shared/issues/260810-0939_o_the-rebuild-map-refusal-tells-the-operator-to-run-a-live-push-to-obtain-a-dry-run.md`
- `shared/issues/260810-0939_o_the-winner-subtraction-silences-a-real-collision-when-neither-entry-carries-an-id.md`
- `shared/issues/260810-0939_o_the-fixture-seam-header-is-a-fifth-surface-and-still-names-the-spelling-the-refusal-rejects.md`

---

## 1. `map --rebuild` — the rebuild without the reconcile

`4bf509e` refuses `push --plan --rebuild-map` (correctly) and printed as its remedy
`push --rebuild-map --circle <dir> && plan --circle <dir>`. That first command is a live
reconcile: with `DRYRUN=0` it passes `config_valid`, requires `$PLANE_API_KEY`, calls
`fetch_states`, and POSTs and PATCHes on the board. `docs/plane-setup.md` printed the same
pair under **"0. Dry run first — zero risk, nothing goes over the wire."**, before step 1
creates the disposable Circle, so a user following the document in order wrote to a real
board. Option 1 of the record, per the user's decision.

**New:** `map_rebuild()` plus `--rebuild` (and its `--fixture` seam) on `cmd_map`, in the
shape `--migrate` already had — mutate the map, report, stop. It is a fourth mutually
exclusive mutator.

- **Fixture path** — no key, no config, no call, exit 0. It runs ahead of the config+key
  gate, as `push --rebuild-map --fixture` does.
- **Live path** — `cfg_load` / `build_base` / `config_valid` / `plane_key_present`, exactly
  `map_prune`'s gate. An absent key or an unreachable Plane changes NOTHING and exits 10
  (C4): a rebuild from an unanswered request would empty the map.
- **Reports** `STATUS: rebuilt (N entries)` on stdout, beside `STATUS: migrated` /
  `STATUS: forgotten`.

It still reads the board — a rebuild is by definition a read of it — but it writes only
`.plane-map.json`.

### `push --rebuild-map` stays, and delegates

The flag is untouched in behaviour. Both spellings end in the one `rebuild_map()`; the only
difference is what happens next — nothing for `map --rebuild`, the full reconcile for
`push --rebuild-map`. So there is no second implementation to keep in step, and removing the
flag (out of scope, and not mine to remove) would not have simplified anything.

### The `&&` is gone

The refusal now prints two commands on two lines and says why they are not chained: a rebuild
that cannot reach Plane exits `EXIT_DEFERRED` (10) — the ordinary offline case — and a chain
would then drop the plan without a word, which is the shape `map_forget` forbids elsewhere in
the same file. The message avoids the literal `&&` entirely, so a test can assert its absence.

### The doc

The zero-risk section keeps the refusal (it is a statement about the dry run) and no longer
prints a command that writes anywhere. The rebuild-then-plan recipe moved to a new
`#### Rebuilding the map from the board` under "Repairing a map written before the key
changed", which is not under a zero-risk promise, and states plainly that the rebuild reads
the board, needs the key, and exits 10 without changing anything when it cannot. Section 0's
promise now holds for everything in it.

## 2. The id guard in `JQ_REBUILD_MAP`

`id: .id` bound unguarded while the sibling field one line up was guarded. Two costs, both
closed at extraction, per the record's fix direction:

```jq
| ( $found | map(select((.id | type) == "string" and .id != "")) ) as $usable
```

- No entry reaches the rebuilt map as `plane_id: null` (which `map_get_id`'s `// empty` reads
  as "no mapping" anyway, so the next push created rather than PATCHing).
- The subtraction `[$ranked[:-1][].id] - [$win.id]` now operates only on real UUIDs, where it
  is provably correct — two distinct id-less entries can no longer both rank as `null` and
  cancel each other out.

**Beyond the record:** the drop is not silent. `$skipped` carries a count per key and
`JQ_REBUILD_REPORT` prints a `SKIPPED` line for each, so the acceptance criterion "the
collision report says something rather than nothing" holds — the record's bare `select` would
have removed the last diagnostic instead of replacing it. The line does not claim the key is
absent from the map, because it may not be (one id-less entry beside one usable entry).

## 3. The fifth surface

- **`bin/fusion-plane:143-146`** rewritten. The `seed --plan --fixture` analogy is gone: the
  two rebuild spellings are now described separately and by what they do — `map --rebuild
  --fixture` is offline and exits 0 but is not a dry run (replacing the map is its whole job);
  `push --rebuild-map --fixture` performs the same rebuild and falls into the live branch,
  ending at exit 10 with no key, after the map has already been replaced.
- **`FUSION_PLANE_DRYRUN`** at the header and in `usage()`: both now carry the
  `--rebuild-map` exception (it forces the refused pair → exit 2) and note the var means
  nothing to `map --rebuild`.
- **`push` synopsis** at the header and in `usage()`: `--fixture` added (it was omitted
  entirely), and both now say the `--rebuild-map` run writes to the board.
- Also corrected for the new command: the writer list in the header, `map_report_fold`'s
  "commands that WRITE the map fold it" line, the `map` block in header and `usage()`, and
  `rebuild_map`'s own header comment.

Written against the code as it stands after (1), not against the record's quotes.

## Tests

`hooks/lib/__tests__/fusion-plane.test.ts`, two blocks:

- In `push --rebuild-map: a collision is decided, not raced` — two distinct id-less entries
  reach the map as nothing and are named (`SKIPPED`, `2 issue(s)`, the key); an id-less entry
  never displaces one with an id and produces no collision line; and the over-application
  guard, that a genuine two-issue collision emits no `SKIPPED` and still reports kept/dropped
  in full.
- New `map --rebuild: the rebuild without the reconcile` — rebuilds and stops (no outbox,
  measured against `push --rebuild-map`, which defers 6 artifacts to one); needs neither key
  nor a valid config (run with the all-zero `project_id` restored, so exit 0 proves it never
  reached `config_valid`); C4 on the live spelling; the `FUSION_PLANE_ISSUES_FIXTURE` twin,
  and that the env var means nothing to plain `map`; `--fixture` without `--rebuild` is a
  usage error; mutual exclusion; the refusal names `map --rebuild` and hands out no chain;
  and the remedy end to end — rebuild, then plan, with the plan computed from the rebuilt
  UUID and the map byte-identical afterwards.

## Verification

`cd hooks && npm test` — **exit 0**. 39 files, 1025 tests, all green. (The user's baseline
was 38 files at `7f617b1`; the count is not stable run to run and no file was added by this
task.) Nothing failed naming `fusion-count-sources.test.ts` or `clear-halt.ts`.

Manual demonstration against a scratch workbench (fixture workbench copied out of the test
fixtures, `FUSION_PLANE_WORKBENCH` pointed at it, `base_url` the unroutable `.test` TLD):

| Command | Result |
|---|---|
| `map --rebuild --fixture issues.json` | exit 0, 2 entries written, no `.plane-outbox.jsonl` |
| same, with the all-zero `project_id` | exit 0 — never reaches `config_valid` or the key |
| `push --circle … --rebuild-map --fixture issues.json` | exit 10, map rebuilt **and** 6 transitions deferred to the outbox — the reconcile `map --rebuild` does not do |
| `map --rebuild` (live, no key) | exit 10, `map not changed`, map byte-identical, no outbox |
| fixture with two id-less entries | map `{}`, one `SKIPPED` line naming the key and the count |
| fixture with two real colliding UUIDs | collision line intact: kept / DROPPED / close it by hand |

## Not touched

`.claude-plugin/plugin.json` (a version bump is the user's, and the file is protected), the
`--comments-fixture` flag and `FUSION_PLANE_COMMENTS_FIXTURE`, which are undocumented in
`usage()` the same way `--fixture` was — noticed while correcting that block, out of the
records' scope, not filed.
