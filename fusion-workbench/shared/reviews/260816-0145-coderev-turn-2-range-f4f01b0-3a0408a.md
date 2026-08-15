# Code review — Turn 2: the sixteen uncovered commits

**Sender:** coderev
**Stamp:** 260816-0145
**Reviewed-range:** `f4f01b0..3a0408a`
**Not-opened:** none

## What `none` covers, and what it does not

Every one of the 21 shipped files the range touches was opened at `3a0408a` in a detached worktree,
along with all 18 closure footers of the record batch in `4f7508d`. What was read markers-and-titles
only, and not in full, is the session's own bookkeeping inside `fusion-workbench/`: the thirteen
`shared/history/260815-23xx…260816-0115-*` entries this session wrote about its own Turns, and the
closure footers of `260815-2325_c_*` through `260815-2329_c_*` beyond their markers. They are
recorded here rather than in the field, because putting a session's own history logs into
`**Not-opened:**` would hand the next dispatch thirteen entries of scope that carry no shipped
surface, and the field's job is to move real gaps forward.

`HEAD` moved during this pass — `260816-0119_o_*` was filed by a concurrent task after `3a0408a`.
The range above is the two resolved short hashes, which is what tiles.

The previous review's `**Not-opened:**` was `none`, so nothing was carried in.

## Summary

Nothing in the sixteen is broken. The hook suite is green at the range head — 40 files, 752 tests,
exit 0 — and every behavioural change does what its message claims when you run it rather than read
it. What this pass found is the same shape the predecessor found one Turn earlier, and it is worth
naming as a pattern rather than eleven times: **the code lands and the sentence beside it does not
move with it.** Six of the eleven findings are a claim in shipped text that some *other* change in
this same session falsified — twice within one commit, once between two commits forty minutes apart,
once by a commit three later. Three of the eleven are partial landings of fixes to the predecessor's
own review, and two of those three predecessor records are now closed over the remainder.

## Totals

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 6 |
| Low | 5 |

Eleven records filed, all in `shared/issues/` (no Circle is active, so the Origin Rule places them
there): `260816-0130` … `260816-0136`, `260816-0138` … `260816-0141`.

## Findings by theme

### Theme 1 — a claim falsified by a change in the same session (6)

This is the cross-cutting one. Each of these is a sentence in shipped text that was true when
written and is false at `3a0408a` because of another commit in this range.

| # | Where | The claim | Falsified by |
|---|---|---|---|
| `0130` **M** | `bin/monitor:1310-1313` | the test "pins the launched URL to `http://localhost:${port}`", so binding both families "leaves the pin correct" | `a19c867` itself, which rewrote that pin to `http://127.0.0.1:${port}` (`monitor-warnings-panel.test.ts:906-908`) |
| `0134` **M** | `agents/orchestrator.md:955` | the commit message of `e18dcb1`: "Both now read *by any agent or the user*" | `:955` reads "by **any** agent" and stops there |
| `0135` **L** | `agents/playmaker.md:61` | "`/fusion:setup` Step 0 … carr[ies] the same exclusions in [its] `find` invocation" | `c0e179a`, which replaced Setup's exclusion list with a tree bound |
| `0136` **L** | `rules/fusion-workbench-conventions.md:74` | the split "ranges over every root entry outside the artifact directories", with "no overlap and no remainder" | `:64` nine lines above, rewritten by `f73dfe4`, names two further root entries a workbench may carry |
| `0139` **L** | `README-agents.md:71,72` | `/fusion:curate` as the acting surface | `642130f`'s own collapse, which the same file states at `:246` |
| `0141` **L** | `.claude-plugin/plugin.json` `description` | (incomplete rather than false) | `25af51d` updated only the marketplace twin |

`0130` is the sharpest of the six because it is self-inflicted inside one commit, and because the
paragraph's *first* sentence goes the same way: it says printing `127.0.0.1` "is not the one taken",
and the file now takes exactly that on three of its four bind paths. The design it defends is still
right; the two reasons it gives for it are both wrong about the tree.

`0135` is the second site of a defect already filed as `260816-0058`. That record routes itself to
`rules/`, and an agent prompt is outside that route, so the site would have survived the correction
of the other two. Resolve all three together — the measurement is already written down in `0058`.

### Theme 2 — a fix that changed the mechanism and left its own description behind (2)

| # | Where | What was measured |
|---|---|---|
| `0132` **M** | `skills/next/SKILL.md:218-227` | the note is decided from a file-wide `grep`, not from the write's result; two failure modes reproduced on fixtures |
| `0131` **L** | `bin/monitor:1237-1250` | the second port query's predicate is a substring test over the whole command line, not a test of what the process is |

**`0132`, measured.** Six fixtures, running the shipped commands verbatim.

- Valueless field → `active`, no note. **The fix works, and this was the defect.**
- Value carrying regex metacharacters (`**Status:** a|b&c\1 .*[x]`) → clean rewrite. The
  metacharacter question the dispatch raised is closed: the pattern is fixed, `.*` consumes the
  value, the replacement carries no `&` and no backreference.
- Record with no head field but a column-0 `**Status:** active` line elsewhere → **no write, no
  note.** The same silent skip the change closed, re-entered from the output side. All fifteen
  `*_circle.md` in this workbench carry exactly one such line, so this is latent, not live —
  `rules/circle-records.md:70` is the template line that would make it live.
- Read-only destination → note fires reading *"carries no `**Status:**` field, so none was set"*
  while the field is present and unchanged.
- Two column-0 `**Status:**` lines → both rewritten. Same as the old shape, but the new pattern
  reaches one spelling more.

The added prose at `:225` states *"The note is decided from the **result** of the write, never from
a separate test of the input."* It is decided from neither.

**`0131`, measured.** Four processes on one port, then a second monitor started.

```
listener                                     DEAD  (intended)
plain client                                 ALIVE (the browser stand-in — claim holds)
client whose argv merely names the script    DEAD  (should not be)
```

So *"a browser can never be one"* is contingent rather than structural, *"asks what a process is"*
is not what the code asks, and *"inert on a host where a stale monitor does reach LISTEN"* is inert
only when no port-holder carries the string. Practical risk is low — nothing that holds a monitor
port in normal use carries `monitor-server.py` in its command line — so this is Low and the comment
is the defect, not the union. One unremarked improvement rides along and should not be lost in any
rewrite: `_lsof_pids` now catches `OSError`, so a host with no `lsof` on `PATH` no longer crashes
the monitor at startup, which the code it replaced did.

### Theme 3 — the fix is right and the drift vector is unchanged (1)

`0133` **M**. `c0e179a` made Setup's bracket probe run migrate's query. Verified mechanically: the
three occurrences are **byte-identical, 218 characters each** — `skills/setup/SKILL.md:67`,
`skills/migrate/SKILL.md:54`, `skills/migrate/SKILL.md:87`. The narrowing itself is correct and the
three probes tile without overlap; the reasoning at `skills/setup/SKILL.md:60,62` holds as written.

But the defect was two copies written once and edited independently, and the fix leaves three copies
and no gate. `path-literal-lint.test.ts` reads these same files for store literals and would not see
this. A ten-line assertion that the three are byte-identical is affordable against the 2 320 lines
of `hook-tests` head-room, and it is the shape this repo already uses for exactly this class.

### Theme 4 — case splits that are not complete (2)

| # | Where | The uncovered input |
|---|---|---|
| `0140` **M** | `skills/setup/SKILL.md:206,227` | a malformed `.claude/settings.local.json` — "parse it and union" with no failure path, under "never overwrite one" |
| `0138` **M** | `skills/direct/SKILL.md:109` + roster | `**Answers:**` is passed by the skill and declared by nobody |

`0140`'s headline fix is complete: the four `defaultMode` states are disjoint and the replacement is
now named to the user before it happens. The malformed-file case is pre-existing, but the commit
rewrote both the read and the write halves without closing it, and it leaves an agent improvising
after a question that promised a write. Its second part is older still and is a contradiction rather
than a gap: `:206` skips the write entirely for a project already at `bypassPermissions`, while
`:223` calls the `allow` list "belt-and-suspenders for tools the bypass mode still gates" — so the
one project that would need the list is the one project that never receives it.

`0138`'s relay mechanism works, and I checked the part that could have broken: `agents/shaper.md:59`
terminates `**Draft:**` at the next `**<Keyword>:**` line, so the `**Answers:**` block parses and
does not swallow the draft. What is missing is the roster half. CLAUDE.md names
`README-agents.md` `## Dispatch parameters` as the single authoring home and records that a second
copy is how `planner` came to be listed as domain-parameterised in four places while its prompt
parsed nothing; this is the mirror — a parameter passed and declared nowhere. The comparison the
commit drew on cuts against it: `/fusion:next` Step 5b, whose shape this copies, *is* declared on
both sides. `skills/direct/SKILL.md:145` also still promises the dialogue the change removed.

## Cross-cutting observations

**1. Three of the predecessor's five findings were closed over a remainder.** `260815-2325`
(the IPv4 fallback) — behaviour landed, the docstring defending it did not (`0130`). `260815-2326`
(listen-only port clearing) — the union landed, its stated predicate overstates what it does
(`0131`). `260815-2328` (the breaker's two populations) — the caveat and the worked example landed,
one of the two definitions did not (`0134`). Say it plainly: `260815-2328` is `_c_` while the
asymmetry it was filed for is still in the file, four words wide. The other two closures are
defensible; that one is not.

**2. The predecessor's two clean closures were clean.** `260815-2329` — every single-point figure in
the growth-bound header now reproduces. I re-measured two of them off `git ls-tree` at the two named
anchors: `rules/` 166 610 → 154 092 and `agents/` 289 958 → 460 292, both exact, and −7.5 % is the
right percentage. Dropping the three unreproducible claims into a named paragraph rather than
recomputing them to fit is the right call and should be the pattern. `260815-2327` — the wildcard
bind now has a real end-to-end test (`monitor-warnings-panel.test.ts:1052-1069`) whose skip probe
binds a dual-stack wildcard from the test process itself rather than skipping on a guess.

**3. One arm of the monitor fix is still on the path nobody watches — and no test can reach it.**
The `dual_stack = False` branch is the OSError fallback, which the file's own comment calls "the
platform-compatibility arm, so it fires where there is no one to notice". Its counterpart, the
explicit `MONITOR_BIND=127.0.0.1` spelling, *is* now pinned at `monitor-warnings-panel.test.ts:906`.
The fallback arm itself needs an injected `OSError` to reach and there is no injection point in a
heredoc'd python script. **Not filed**, deliberately: a coverage gap with no feasible fix is a line
in a review, not a queue entry that will sit open forever. Recorded here so the next reviewer does
not re-derive it.

**4. Nothing in the range regressed the bounds.** Measured at `3a0408a`: `agents/` 400 696 bytes,
17 147 of head-room left; `skills/` 226 301, 14 138 left; hook tests 19 633 lines, 2 320 left. The
tightest is `skills/`, which has already absorbed 5 862 bytes this session. Of the eleven findings,
`0132` and `0138` land there; both are corrections and near-replacements rather than additions, and
`0132`'s should stay that way — if the shape correction runs long, drop a sentence rather than take
the head-room.

**5. The record batch is sound.** All 18 closure footers in `4f7508d` cite a commit or a deleted
subject. Two spot-checked against HEAD: `SKIP_LICENCES` returns nothing anywhere, and
`bin/fusion-paths playmaker` emits `OUT_BACKLOG=shared/backlog`. One closure note named a residual —
the `agents/orchestrator.md:293` citation repoint — and the repoint had already landed at `:293`.
The one closure that aged badly is `260815-1251`, whose asked-for sentence is exactly the sentence
`c0e179a` then falsified; that is `260816-0058`'s subject and is not re-filed.

## Recommended sequencing

**Release blockers: none.** Nothing here would ship broken behaviour.

**Do first, because they are four words each and they are wrong in the file right now.**
`0134` (add "or the user" to `:955`), `0135` (the playmaker parenthetical, resolved together with
`260816-0058` and `260816-0025` — three sites, one measurement), `0139`'s two `README-agents.md`
rows.

**Do next, one pass each.** `0130` (rewrite the two-reason paragraph to describe what the file does),
`0132` (decide the note from the write's exit status, verify against the head field), `0138` (the
Tone clause, the roster row, the citation).

**Do when the surface is next open.** `0133` (the byte-identity assertion), `0136` (one clause in the
always-on rule, plus two words in `.gitignore:67`), `0140` (one branch for a malformed file, and
decide which of the two `allow`-list sentences is right), `0141` (the manifest description, plus a
line in CLAUDE.md's release process naming the two descriptions as a pair).

**Do not act on `0131` by tightening the predicate unless the union is being kept.** Its premise is
`260816-0110`'s subject and is unverified at HEAD; if that record resolves toward removing the union,
`0131` resolves with it.

**Hand to `reconciler`, not to `coder`.** `260815-1633_o_*` is open with a residual table whose every
row is now done, while a site it never surveyed still stands (`0139` part 2). Whoever edits
`README-agents.md` should not be the one to close the record.
