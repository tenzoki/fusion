# Code review — `7f617b1..7ddacbc`, Turn 4 (six files, scoped)

**Sender:** coderev
**Range:** `7f617b1..7ddacbc`, 4 commits, 6 in-scope files (+845 in `hooks/`, +184/−57 in
`bin/fusion-plane` and `docs/plane-setup.md`)
**Scope as dispatched:** `bin/fusion-plane`, `docs/plane-setup.md`,
`hooks/lib/__tests__/fusion-plane.test.ts`,
`hooks/lib/__tests__/fusion-count-sources.test.ts`, `hooks/clear-halt.ts` +
`hooks/dist/clear-halt.*`, `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts`.
`7ddacbc` (workbench records only) skipped as instructed.
**Origin:** No Circle active (`.active-circle` absent) — filed to `shared/`.
**Suite state at review time:** the three in-scope test files are **green**, 134 passed,
38 s. `npx tsc --noEmit` on `hooks/` is clean. `hooks/dist/clear-halt.js` is byte-identical
to a fresh `tsc` build of `hooks/clear-halt.ts`.
**Prior review:** `260810-0939-coderev-turn-3-range-18b6094-to-a7c2b03.md`

---

## Verdict

**Every claim the four commit messages make is true, and the four findings the previous
pass filed are genuinely closed.** `map --rebuild` exists in `map --migrate`'s shape, the
fixture path needs no key and no config, the live path answers an absent key with exit 10
and an unchanged map, the refusal message contains no `&&` and a test asserts it, the
recipe left the zero-risk section, the `select` guard drops id-less entries with a
`SKIPPED` line behind it, a genuine two-issue collision is untouched, the `declared`
filter is now wider than the match regex it guards, the deletion case still passes and is
asserted relative to the unmutated count, `escalation.ts` is untouched, and the ordinary
`clear-halt` path is byte-identical.

**The dispatch's three questions, answered.** Yes, the two rebuild spellings diverge —
badly, and it is the one finding above cleanup severity. No, `map --rebuild`'s live path
cannot reach a board write; it only GETs. No, `clear-halt` has no false-positive route
to "not cleared": the three claimed guards hold and the fourth case I looked for does not
exist in the shipped code.

**What the range costs is the same class the last three Turns named, arriving through the
new command's error handling.** `98c8b3f` writes down, at `bin/fusion-plane:1474-1477`,
that `map --rebuild` and `push --rebuild-map` are one implementation with "no second
implementation to keep in step". The body is shared. The branch where a failure is decided
is not: `map_rebuild` propagates, `cmd_push` discards with `|| true`. Measured against a
local mock, the same failed rebuild makes one command exit 1 having changed nothing and
the other exit 0 with `STATUS: ok (6 pushed)` after creating six issues on the board —
against the stale map the rebuild was asked to replace.

### Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 1 |
| Low | 3 |
| **Total filed** | **5** |

All five in `shared/issues/` with `_o_` markers, timestamp `260810-1032`. Checked against
the open records first; none duplicates one, and the four the dispatch named as already
filed or already decided (`260810-0918`, `260810-1030_*_the-comments-fixture-seam-is-undocumented-in-usage-the-way-fixture-was.md`, `260810-0947_*_the-circle-stash-exclusion-test-describes-a-mechanism-and-a-code-shape-that-no-longer-exist.md`, decision
`260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md`) are not re-filed.

---

## Part 1 — The commit claims, checked against the code

### `98c8b3f` — `map --rebuild`

| Claim | Verdict |
|---|---|
| A new non-reconciling command in `--migrate`'s shape | **Holds.** `map_rebuild` at `:1860-1877`, dispatched at `:1931-1932`, mutator-exclusivity extended at `:1900-1904`. |
| The fixture path needs no key and no config | **Holds and is proven by the test rather than asserted** — the case rewrites `project_id` back to the all-zero placeholder `config_valid` rejects, so reaching exit 0 through it proves the ordering. `:1862-1866` runs ahead of `cfg_load`. |
| The live path answers an absent key with exit 10 and an unchanged map | **Holds.** `:1870-1874`, byte-for-byte the shape `map_prune:1797-1801` uses. |
| `push --rebuild-map` on the same input additionally defers 6 transitions | **Holds**, pinned as a positive control inside the "and stops" test rather than in a separate case — good construction. |
| The refusal message contains no `&&` at all, and a test asserts its absence | **Holds.** `:1596-1600`. The `&&` in `usage()` (`:2211`) is not the same surface and reads "not chained with `&&`", so the assertion is not evaded. Also checked that `main` does not print `usage()` on a `cmd_push` `EXIT_USAGE` return (`:2225-2229`), which would have reintroduced it into the same stream. |
| The rebuild-then-plan recipe moved out of the zero-risk section | **Holds.** `docs/plane-setup.md:197-205` now sends the reader to a heading of its own, and the recipe lives at `:325-330` under "Rebuilding the map from the board". |
| The `select` guard drops id-less entries, a `SKIPPED` line preserves the diagnostic | **Holds.** `:1433-1437`, `:1461-1462`. One side effect it did not intend — filed, see L1. |
| A genuine two-issue collision emits no `SKIPPED` | **Holds**, and the test asserts the negative directly. |
| Both spellings end in the one `rebuild_map()` | **Holds for the body and fails for the failure branch.** Filed, H1. |

**The live path cannot reach a board write.** Enumerated: `map_rebuild` calls `cfg_load`,
`build_base`, `config_valid`, `plane_key_present`, `rebuild_map`. `rebuild_map`'s only
network call is `plane_curl GET "$BASE/issues/?per_page=100"` (`:1497`); its only write is
`map_put` (`:1541`), which writes `.plane-map.json`. No POST, no PATCH, no `fetch_states`,
no `reconcile_*`. Verified by execution against a local mock that would have recorded
either verb.

**`map_view` is called twice on this path** — once in `cmd_map:1919`, once in
`rebuild_map:1507` — and that is harmless: `map_view:735` short-circuits on
`MAP_VIEW_READY`, so the fold is built and reported once, which the existing
"built once, in the parent shell" test already pins.

**`set -eu` and the new env-twin fold.** `[ "$want_rebuild" -eq 1 ] && [ -z "$fixture" ]
&& [ -n "…" ] && fixture="…"` (`:1913-1914`) cannot trip `set -e`: the failing command is
never the last in the `&&` list. Confirmed by the passing "the env fixture means nothing
to the other map commands" case, which drives `want_rebuild=0` and exits 0.

### `c546ef0` — the widened `declared` filter

| Claim | Verdict |
|---|---|
| The filter is now wider than the match regex | **Holds.** `^\s*${varName}\+?=` (`fusion-count-sources.test.ts:100`) against the match's `^${varName}="…"$`. |
| An indented line throws | **Holds**, `:350-352`. |
| A `+=` rewrite throws | **Holds**, `:353-355`. |
| A deleted line still does not throw | **Holds**, `:362`. |
| Asserted relative to the unmutated count, not a literal | **Holds.** `:363` reads `extensions("CODE_EXT", src).length - 8`. |

**Did the widening break anything that previously worked?** No. Checked the widened
pattern against every `CODE_EXT`/`DATA_EXT` occurrence in `bin/fusion-count-sources`
(lines 111, 132-142, 146-148, 194-195): the eleven and three declaration lines are
column-0 and all parse; line 111 is a comment (`#` first, so `^\s*CODE_EXT` cannot match)
and 194-195 use the variables rather than assign them. The deletion case is unaffected in
both directions — `startsWith` did not match a removed line either, so there is no
behaviour to regress.

The four spellings the author reported as still escaping are recorded as decision
`260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md` and are deliberately not re-filed here.

### `e39b3fe` — the post-clear check

| Claim | Verdict |
|---|---|
| Re-reads after saving and exits 2 naming any halt-level event it never showed | **Holds.** `clear-halt.ts:190-231`. |
| `escalation.ts` is untouched | **Verified** — the range touches no file under `hooks/lib/`. |
| The ordinary path is byte-identical | **Holds**, and pinned by three cases in the new suite, including "still says nothing is halted when nothing is". |
| The comparison is against the state as loaded, not the five printed lines | **Holds.** `seenEvents` is copied at `:164`, before `clearHalt` appends; the "too old to print" case seeds eight events and asserts exit 0. |

**The shipped `dist/` is current.** `npx tsc -p hooks/tsconfig.json --outDir /tmp/…` then
`diff` — `clear-halt.js` matches. Worth stating because the committed `dist/` is what
actually runs, and this range edited both.

**The test harness's own honesty.** The shim replaces `dist/lib/escalation.js` with a
pass-through that raises a real halt through the real module at a chosen point, and every
concurrent case additionally asserts the injected event reached the state file. That is
the right defence against a vacuous pass, and the header says so explicitly.

---

## Part 2 — Findings

### High

**H1 — `push --rebuild-map` swallows a failed rebuild and reconciles against the stale
map.** `bin/fusion-plane:1642` writes `rebuild_map || true`; `map_rebuild:1863` and
`:1875` write `rebuild_map || return "$?"`, and `cmd_push`'s own fixture branch twelve
lines higher (`:1627`) also propagates. Measured against a local mock answering
`GET issues/` with HTTP 200 and an empty body: `map --rebuild` exits 1 with the map
unchanged, `push --circle … --rebuild-map` prints the identical failure line, then creates
six Plane issues and exits 0 with `STATUS: ok (6 pushed)`.

The exit code is the smaller half. The premise of a rebuild is that the map is lost or
stale — `docs/plane-setup.md:315` says exactly that — so a swallowed failure makes the
reconcile POST duplicates of issues already on the board, which is the outcome the rebuild
exists to prevent, and then reports `ok`. The `|| true` predates this range; what the range
adds is the written claim that the two paths are one implementation, and a doc that now
recommends `push --rebuild-map` for "when you want the push". Filed:
`260810-1032_*_push-rebuild-map-swallows-a-failed-rebuild-and-reconciles-against-the-stale-map.md`

### Medium

**M1 — `map --rebuild` has a third outcome neither `usage()` nor the doc names, and it
ends without a `STATUS:` line.** Four paths in `rebuild_map` return `EXIT_CONFIG` (1) and
`map_rebuild` passes them straight out at `:1875`, while `usage():2213` and
`docs/plane-setup.md:321` both name only success and exit 10. Exit 1 is defined at `:174`
as "missing/invalid config, bad usage of a live command", which an empty 2xx body, an
unparseable payload and a full disk are none of; the doctrine `map_prune` states one
function above puts every "we could not tell" answer at `EXIT_DEFERRED`. And every
`EXIT_CONFIG`/`EXIT_DEFERRED` return through `:1875` skips the `STATUS:` printf at
`:1876`, so the run ends on an `err` line with an empty stdout — alone among the eight
terminal `STATUS:` lines in the `map` family. Filed:
`260810-1032_*_map-rebuild-has-a-third-outcome-neither-usage-nor-the-doc-names-and-it-ends-without-a-status-line.md`

### Low

**L1 — the new `skipped` guard makes one entry report twice, and the orphan line says the
opposite of the `SKIPPED` line.** `orphans` at `:1451-1452` is computed from `$usable`, so
a key dropped for having no `id` that the current map already holds also lands in
`orphans` — where the report line (`:1464`) asserts it "carries no fusion-key in Plane",
which is false for exactly that entry. Measured; for a `seed`-origin entry it would
additionally print a re-bind command for a binding that was never lost that way. One `-
($skipped | map(.key))` closes it. Filed:
`260810-1032_*_the-new-skipped-guard-makes-one-entry-report-twice-and-the-orphan-line-says-the-opposite.md`

**L2 — `map --rebuild <key>` silently ignores the key and replaces the whole map.**
`cmd_map:1893` captures the positional, `:1925-1932` dispatches on mutators first, so
`key` is read only by the two inspection branches. In the `map` family a bare key means
something everywhere else (`map <key>`, `map --forget <key>`), so the spelling invites the
mistake. Measured: the named key was the one entry the run destroyed, exit 0, no note.
`--prune` and `--migrate` share the shape; one check covers all three. Filed:
`260810-1032_*_map-rebuild-silently-ignores-a-positional-key-and-replaces-the-whole-map-instead.md`

**L3 — `clear-halt`'s "still halted, nothing arrived" branch points the human at a list it
never printed.** `clear-halt.ts:213-217` and `:224-227`: when `arrived` is empty and
`stillHalted` is true, the only line above is a one-sentence `else` that names nothing,
and the next line says "Read what is named above". That same `else` asserts a cause ("by
something raised while this ran") in the one case where nothing was raised — a halt was
re-adopted. The block also opens with "The halt you came to clear is cleared", which is
false here.

Reachability, stated honestly: **not** reachable from the two shipped writers. I
enumerated every `saveEscalation` call site — `tracker.ts:583` always pairs with
`raiseHalt`, `guard.ts:576`/`:638` follow `recordBlock` (which appends a halt event
whenever it sets `haltActive`), `guard.ts:675` is the allow path whose `state.haltActive`
is false, and CHECK 1 returns without saving. It is reachable from a hand-edited or
externally-written state file, since `coerceState` reads any truthy `haltActive`, and from
any third writer added later. The branch is untested: the suite's two concurrent cases
produce `arrived > 0` in both. Filed:
`260810-1032_*_clear-halts-still-halted-with-nothing-arrived-branch-points-the-human-at-a-list-it-never-printed.md`

---

## Part 3 — The verified negatives

Three things the dispatch asked about that are **clean**, recorded so the next pass does
not re-derive them.

**`clear-halt` has no false-positive route to "not cleared".** The dangerous inversion —
telling a human the halt stands while nothing is wrong — cannot happen through `arrived`.
The three claimed guards hold: `seen` is the loaded state (a halt older than the five
printed lines is in the budget), an unreadable state file loads as the empty state and
yields `arrived = []` with `stillHalted = false`, and the multiset comparison is the
false-*negative* guard it says it is. The fourth case I went looking for — `now`
containing a halt event `seen` did not, with nothing actually wrong — needs
`saveEscalation` to re-apply an event the caller already held. It cannot: the merge is
`[...onDisk, ...state.recentEvents.slice(baseline.eventCount)]`, and `baseline.eventCount`
is reset on every save, so a caller's re-applied slice is only what it pushed since its own
last write. The single route to duplication is a state object with no `baselines` entry,
which `escalation.ts:302-304` documents and only a hand-built state produces. No
production caller hand-builds one.

**`map --rebuild`'s live path reaches no board write.** Enumerated above: one GET, one
local file write, no state fetch, no reconcile. Verified by execution against a mock that
would have logged a POST or PATCH.

**`c546ef0`'s widening broke nothing.** Checked against every occurrence in the real
script; the deletion case is unaffected in both the old and the new filter, and the test
now pins it relative to the unmutated count rather than to `52`.

---

## Part 4 — Cross-cutting observations

**The guard that re-enters its own class, fourth Turn running — but this time it is the
*claim*, not the check.** Turns 1 through 3 each found a check anchored in the vocabulary
of the thing it guarded. `98c8b3f` does not do that: the widened filter in `c546ef0`
explicitly breaks the pattern, and the `SKIPPED` guard is a real extraction-time drop
rather than a restatement. What `98c8b3f` does instead is write an equivalence into a
comment (`:1474-1477`, "there is no second implementation to keep in step") and not check
that the equivalence holds. It holds for the shared body and fails for the branch beside
it. A comment asserting an invariant is a check with no negative control, which is the
same shape one level up: the file now says the two commands cannot drift, so the next
reader will not look.

**Two of the three fixes closed their finding and produced a smaller one in the same
function.** `98c8b3f`'s `SKIPPED` guard closed `260810-0939` L1 and moved the entry onto a
report line that contradicts it (L1 here). `e39b3fe`'s post-clear check closed the "clear
confirmed for a halt never shown" defect and left one of its four output combinations
pointing at an empty list (L3 here). Neither is severe and both are two-line fixes. Worth
noting as a rate rather than as an accusation: the session's fix-to-new-finding ratio has
been stable across four Turns, and every one of the new findings has been strictly smaller
than the one it replaced.

**The tests continue to be the strongest part of the range, and the same three habits are
why.** A destructive fixture proven destructive by a separate case; a property read off
the operator-facing stderr rather than the internal structure; a guard made testable by
taking its own source as a parameter. `e39b3fe` adds a fourth worth keeping: the
concurrency shim asserts that the injection *happened*, so a shim that silently stopped
working fails the case instead of passing it vacuously. The one gap the suite has, and it
is what let H1 through, is that **no test drives the live rebuild against a reachable
endpoint** — every live-path case uses an unroutable host, where `fetch_states` fails
immediately afterwards and masks the swallowed status with its own exit 10.

**Scope discipline: clean.** Grepped `agents/` and `skills/`: no prompt invokes
`--rebuild-map`, `map --rebuild`, `map --migrate` or `map --prune`. The orchestrator's
three mirror calls are `push --circle <dir>` and `push --circle <dir> --closure`, so the
new usage errors and the new command cannot reach an agent. H1 is an operator-facing
defect only.

---

## Part 5 — Recommended sequencing

**Release blocker: H1.** It is a live-board write on a stale map, reachable from a plain
`push --rebuild-map` against a working Plane, and it reports success. The fix is one line
(`|| true` → `|| return "$?"`); the test that would have caught it is the larger half and
is worth writing with it, because the whole live-rebuild class is currently invisible to
the suite.

**Before the next release: M1.** Two surfaces make a promise about exit codes that the
code does not keep, on a command released in this range. The `STATUS:` line and the
exit-code reclassification belong in one change.

**Next cleanup pass: L1, then L2.** L1 is one jq subtraction in `JQ_REBUILD_MAP`. L2 is
one guard in `cmd_map` that covers three mutators at once.

**Whenever `clear-halt` is next opened: L3.** Not reachable from the shipped writers, so
there is no urgency — but it is untested, and the fix is rewording two `console.error`
lines.

**Carried forward, not re-filed:** the suite-total instability (`260810-0918`), the
undocumented `--comments-fixture` (`260810-1030_*_the-comments-fixture-seam-is-undocumented-in-usage-the-way-fixture-was.md`), the circle-stash test's stale comments
(`260810-0947_*_the-circle-stash-exclusion-test-describes-a-mechanism-and-a-code-shape-that-no-longer-exist.md`), and the extension-parse residual, which is a decision
(`260810-1010_*_should-a-test-learn-a-scripts-extension-set-by-reading-its-text-or-by-asking-bash.md`) and stays one.
