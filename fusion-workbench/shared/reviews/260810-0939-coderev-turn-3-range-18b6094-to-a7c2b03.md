# Code review — `18b6094..a7c2b03`, Turn 3 (four files, scoped)

**Sender:** coderev
**Range:** `18b6094..a7c2b03`, 4 commits, 4 in-scope files (+296 / −26)
**Scope as dispatched:** `bin/fusion-plane`, `hooks/lib/__tests__/fusion-plane.test.ts`,
`hooks/lib/__tests__/fusion-count-sources.test.ts`, `docs/plane-setup.md`. `bcb0ae8`
(workbench records only) skipped as instructed. Nothing outside those four files was
reviewed; the concurrent edits in `agents/orchestrator.md`, `skills/next/SKILL.md` and
`skills/circle-stash/SKILL.md` were not opened.
**Origin:** No Circle active (`.active-circle` absent) — filed to `shared/`.
**Suite state at review time:** the two in-scope test files are **green** (116 passed).
Full `npm test` is **1 file red** — `lib/__tests__/circle-stash-git-exclusion.test.ts`,
4 failures. Out of scope and in a file a concurrent task is editing; not filed, not
diagnosed.
**Prior review:** `260810-0752-coderev-turn-2-range-ff70d3a-to-head.md`

---

## Verdict

**All three fixes do what their commit messages say, and the two specific over-application
risks the dispatch asked about are both clear.** `push --rebuild-map` on its own is
untouched, a fixture arriving through `FUSION_PLANE_ISSUES_FIXTURE` without the flag is
not caught, and the winner subtraction cannot silence a collision between two issues that
carry real UUIDs. Every load-bearing claim in the three commit messages was checked by
execution, including the two that are factual claims about jq and about bash; both hold.

**What the range costs is one class it did not intend: the refusal removed the last
non-mutating route to a post-rebuild plan, and then handed the operator a live push in
its place.** The refusal is right. Its remedy is a board mutation, printed inside a
documentation section headed "zero risk, nothing goes over the wire". That is the one
finding above cleanup severity.

The second-largest finding is the same shape Turn 2 already named: a guard re-entering
the class it closes. `38fe341` replaced two extension-count floors with a structural
parse check, and anchored the check the same way the regex it guards is anchored — so
two drift shapes that leave the script shipping 60 extensions still let the test cover 52.

### Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |
| **Total filed** | **4** |

All four in `shared/issues/` with `_o_` markers, timestamp `260810-0939`. Checked against
the open records first; none duplicates one, and the two the dispatch named as already
filed (`260810-0918_*_the-suite-total-moves-between-runs…`,
`260810-0918_*_push-fixture-without-rebuild-map-never-reads-the-fixture…`) are not
re-filed.

---

## Part 1 — The commit claims, checked against the code

### `4bf509e` — the dry-run refusal

| Claim | Verdict |
|---|---|
| Refuses `--rebuild-map` under any dry run | **Holds.** `bin/fusion-plane:1546-1552`. |
| Keyed on the flag, not the fixture | **Holds.** The predicate is `[ "$rebuild" -eq 1 ] && [ "$DRYRUN" -eq 1 ]`; `$rebuild_fixture` appears nowhere in it. |
| Placed after the env fold, so `FUSION_PLANE_DRYRUN=1` is caught | **Holds.** The fold is `:1527`, the check `:1546`. Also placed before `resolve_workbench` (`:1555`), so the refusal really does precede all work. |
| Refusing was chosen over reporting a planned rebuild because `--plan` emits ops computed from the map | **Holds, and the reasoning is sound.** `emit_plan` runs at `:1615` against the `map_view` built at `:1570`; a "planned rebuild" line would sit beside ops computed from the map the rebuild would have replaced. |
| Four previously-contradicted surfaces are now true | **Holds for the four named** (header `:18-22`, fold note `:107-116`, `usage()` `:2066-2073`, `docs/plane-setup.md:194-206`). **A fifth surface was missed** — filed, see below. |
| Three surfaces extended plus the doc | **Holds.** |
| The reads-never-write suite gains the fifth spelling | **Holds**, and the fixture it uses is verified destructive by a second test rather than assumed (`fusion-plane.test.ts:551-570` and `:629-639`). Good construction. |

**The two exposures the dispatch asked about.**

1. **`push --rebuild-map` alone is untouched.** `DRYRUN` is `0` at `:930` and set to `1`
   in exactly three places — `--plan` (`:1503`), the env fold (`:1527`), `cmd_plan`
   (`:1678`). Enumerated; there is no fourth. The suite pins it directly: *"a rebuild
   without a dry run still rebuilds"* (`fusion-plane.test.ts:629-639`) asserts the map is
   replaced.
2. **A fixture without the flag is not caught.** With `FUSION_PLANE_ISSUES_FIXTURE` set
   and no `--rebuild-map`, `$rebuild` stays `0` and the refusal does not fire. Correct.
   Note that nothing *pins* it: no test asserts the non-refusal of that spelling. I did
   not file that as a coverage gap, because the behaviour it would pin is the subject of
   the already-filed `260810-0918_*_push-fixture-without-rebuild-map-never-reads-the-
   fixture-and-says-nothing.md`, and whichever way that issue is resolved will decide
   what the assertion should say.

**One inaccuracy too small to file.** When both `--plan` and `FUSION_PLANE_DRYRUN=1` are
present, `dry_src` reports the env (`:1548`) even though the user typed the flag. Both
statements are true, so the message misattributes nothing. Same for the `plan` alias,
which reports `--plan` — a flag `cmd_plan` really does pass (`:1679`).

### `38fe341` — the extension parse

| Claim | Verdict |
|---|---|
| Every `VAR=` line must match | **Holds for lines the filter sees** — and that qualifier is the finding. `fusion-count-sources.test.ts:80-86`. |
| At least one line must exist | **Holds.** `:82`, pinned by the `NO_SUCH_EXT` case at `:329`. |
| Every token must look like an extension | **Holds.** `:87-89`. |
| Both floors removed | **Holds.** `:284-287`. |
| A permanent test mutates copies of the source and asserts each mutation throws | **Holds.** `:302-331`; `mutate()` guards its own fixture with `expect(out).not.toBe(src)`. |
| Rewriting a line to `${CODE_EXT}` still matches, because the continuation prefix is optional | **Verified true** against the actual regex. |
| "Neither the floor nor the line-count assertion sees it" | **True as written.** Worth recording that the *coverage* assertion (`:295`) would have caught the braced rewrite as a count mismatch — the commit does not claim otherwise, and the new check converts a confusing failure into a named one, which is the real gain. |

Arithmetic in the message checks out: `CODE_EXT` is 11 lines / 60 extensions (5.45 per
line), the C-family line carries 8, `60 − 8 = 52` clears the old floor of 50; `DATA_EXT`
is 19, `19 − 2 = 17` clears 15.

### `a7c2b03` — the collision report

| Claim | Verdict |
|---|---|
| The winner's id is subtracted from the losers | **Holds.** `bin/fusion-plane:1404-1406`. |
| `unique_by(.id)` rejected because it keeps whichever copy sorts first, an input-order artifact | **Verified against jq 1.7.1.** `[{id:A,u:2020},{id:A,u:2099}] \| unique_by(.id)` keeps `2020`; reversing the input keeps `2099`. The stated reason is factually correct, and the rejection is right. |
| A group reaches `.collisions` only if a loser survives | **Holds.** `select((.lost\|length) > 0)` at `:1409` operates on the post-subtraction list. |
| Three properties pinned against the operator-facing stderr | **Holds** — `fusion-plane.test.ts:794-857`, read off the report string rather than the jq structure, which is the right surface. |
| Both new tests fail against the pre-fix jq | **Verified by running both filters.** Pre-fix, the duplicate fixture yields `dropped:["plane-uuid-SAME"]`; the mixed fixture yields `dropped:["plane-uuid-LOSER","plane-uuid-WIN"]`. Both assertions would fail. |

**The over-application exposure the dispatch asked about.** A genuine collision needs two
*distinct* Plane issues, and distinct issues carry distinct UUIDs, so subtracting the
winner's id cannot reach a real loser. Confirmed by running the shipped filter over a
two-distinct-issue fixture: the collision reports in full, unchanged from pre-fix. The
one input where two distinct entries share an id is the input where neither *has* one —
filed, Low, with the narrow `select` that closes it.

Two behaviour changes the message does not mention, both benign: duplicate losers are now
deduplicated (an improvement), and `unique` sorts, so `dropped` is lexicographic rather
than rank-ordered. The report line makes no use of the order.

---

## Part 2 — Findings

### Medium

**M1 — the refusal's remedy is a live push, printed in the zero-risk section.**
`bin/fusion-plane:1550-1551`, `docs/plane-setup.md:170` + `:194-206`.
`push --rebuild-map --circle <dir>` with `DRYRUN=0` reaches `config_valid`, the key
check, `fetch_states` and `reconcile_circle` — it POSTs and PATCHes the board. There is
no rebuild-only command: `cmd_map` offers `--forget / --prune / --migrate` and nothing
else, so after this commit no route exists to a post-rebuild op list that does not first
mutate Plane. The doc paragraph sits under **"0. Dry run first — zero risk, nothing goes
over the wire"**, before step 1 creates the disposable Circle. The `&&` in the snippet
also swallows the `plan` step on the ordinary deferral (exit 10, no key or unreachable
host). Filed:
`260810-0939_*_the-rebuild-map-refusal-tells-the-operator-to-run-a-live-push-to-obtain-a-dry-run.md`

**M2 — the "declared but not parsed" guard is anchored like the regex it guards.**
`hooks/lib/__tests__/fusion-count-sources.test.ts:80`. `startsWith(`${varName}=`)` is the
same left-anchor as `^${varName}="…"$`, so a declaration the regex cannot see is not in
the filter either. Measured against the real script: indenting one `CODE_EXT=` line, or
rewriting it to `CODE_EXT+=`, leaves bash computing the identical 60-extension value
while `extensions()` returns 52 and throws nothing. Both are valid bash. Filed:
`260810-0939_*_the-declared-but-not-parsed-guard-is-anchored-like-the-regex-so-two-drift-shapes-still-cover-less.md`

### Low

**L1 — the winner subtraction silences a real collision when neither entry carries an
`id`.** `bin/fusion-plane:1398` binds `id: .id` unguarded while the sibling field is
guarded one line up (`select($key != "")`, `:1396`). Two distinct entries with no `id`
both become `null`, and `[null] − [null]` is empty. Not reachable from live Plane; the
map entry it writes is already a no-op (`map_get_id`'s `// empty`). What is lost is the
last diagnostic. One `select` at extraction closes it and keeps `plane_id: null` out of
the rebuilt map. Filed:
`260810-0939_*_the-winner-subtraction-silences-a-real-collision-when-neither-entry-carries-an-id.md`

**L2 — the fixture-seam header is a fifth surface the commit did not reach.**
`bin/fusion-plane:143-146` documents the rebuild fixture as "same seam shape as
`seed --plan --fixture`". After this commit it is not: `seed`'s seam is offline and exits
0, while the rebuild's only surviving spelling falls into the live branch and defers.
The suite records the asymmetry — the new test can only assert `.not.toBe(EXIT_USAGE)`.
Also `:142` and `:2101` ("forces `--plan` for any push / seed") now force a usage error
instead when `--rebuild-map` is present, on lines adjacent to the fixture env var in
`usage()`. Filed:
`260810-0939_*_the-fixture-seam-header-is-a-fifth-surface-and-still-names-the-spelling-the-refusal-rejects.md`

---

## Part 3 — Cross-cutting observations

**The guard that re-enters its own class, third Turn running.** Turn 1 named it, Turn 2
found two more, and M2 is the same shape again: a check written to close a drift class,
anchored so that two members of the class walk past it. The mechanism is identical each
time — the new guard is expressed in the same vocabulary as the thing it guards, so it
inherits the blind spot rather than covering it. `38fe341`'s own commit message contains
the antidote and does not apply it: it distinguishes "matching nothing" from "matching
some" for the *floors*, then anchors the replacement the same way as the regex. Worth
noting against the open decision
`260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.

**Refusing a contradiction is not the same as resolving it.** `4bf509e` correctly declines
to pick a side between "replace the map" and "write nothing", and the decidability
argument in its message is the right one. But the pair existed because someone wanted a
plan against a rebuilt map, and that want does not disappear with the flag combination.
The commit closed the wrong answer without opening a right one, and the remedy text
covers the gap by naming a command that does more than was asked (M1). The clean fix is
the missing verb, not better wording: a `map --rebuild` beside `map --migrate` makes
"rebuild, then plan" literally true and removes the reason the refused pair looked useful.

**The tests in this range are unusually good, and the pattern is worth keeping.** Three
things recur across both files and each is what makes the assertions mean something: the
destructive fixture is proven destructive by a separate test rather than assumed
(`fusion-plane.test.ts:551` / `:629`); the collision property is read off the
operator-facing stderr rather than the jq structure, because that string is what a human
acts on (`:761-770`); and the parse guard is made testable by taking its source as a
parameter, so the guard itself has negative controls
(`fusion-count-sources.test.ts:79`). Turn 2's review flagged the opposite habit — negative
controls that re-implement the logic instead of calling it. This range does not have it.

**Scope discipline: clean.** The diff touches only the four files plus workbench records.
No agent prompt or skill invokes `--rebuild-map` (grepped `agents/` and `skills/`), so the
new usage error cannot reach the orchestrator's mirror calls, which use
`push --circle <dir>` and `push --circle <dir> --closure`.

---

## Part 4 — Recommended sequencing

**Before the next release:** M1. It is the only finding that changes what an operator
does at a keyboard, and half of it is one paragraph in `docs/plane-setup.md` sitting under
a heading that promises the opposite of what it instructs. The doc half can land alone; the
`map --rebuild` half is a design call.

**Next cleanup pass:** M2, then L2. M2 is a two-line filter change plus two more cases in a
test harness that already exists. L2 is comment text.

**Whenever `JQ_REBUILD_MAP` is next opened:** L1. One `select`, and it closes the larger
latent problem (`plane_id: null` reaching the map) alongside the reported one.

**Not filed, carried forward:** the 4 failures in
`lib/__tests__/circle-stash-git-exclusion.test.ts`. Outside this review's scope, and in a
file under concurrent edit — someone should confirm they belong to that work and not to
this range. Nothing in these four commits touches stash or git exclusion.
