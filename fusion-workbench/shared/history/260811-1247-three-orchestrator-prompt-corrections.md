# Three low-priority corrections in the orchestrator prompt

**Status:** Complete
**Agent:** coder
**Directive:** Tasks 27, 28 and 31 of `fusion-workbench/tasklist.md`, batched because they touch one file, treated as three fixes with three source records.
**Files changed:** `agents/orchestrator.md` (all three); `fusion-workbench/tasklist.md`; the three source records.
**Verification:** `cd hooks && npm test` — 48 files, 1246 tests, exit 0.

---

## Task 27 — `I:260810-0509-cleanup-wording`

Source: `260810-0509_*_the-cleanup-drift-call-point-claims-a-single-turn-session-reaches-no-other-which-phase-2-contradicts.md`.

Two sentences claimed something Phase 2 contradicts, and both are now statements about what
a short session can *find* rather than about which call points it reaches:

- **Cleanup** (was `:681` in the record, now `:770`): *"A single-Turn session reaches this
  call point and no other"* became *"reaches Turn 1's `turn_start` and then this call point,
  with nothing in between: at `turn_start` it had no commit and no completed Turn of its own,
  so this is the first point at which a freeze in its own numbers can show up at all."* The
  reason the call point exists is kept, which the record explicitly asked for; only the false
  claim is gone.
- **Step 3e** (was `:497`, now `:534`): `session_end` is now the call point at which a freeze
  can first be **found**, not the only one that fires, with the reason stated in place.
- **Phase 2 step 2** gained the positive statement the other two are read against: the check
  fires in every Turn, Turn 1 included, and what it takes at Turn 1 is a baseline.

The record's line numbers had moved eleven-plus lines further, as the batch's own constraint
anticipated; the site descriptions still matched exactly.

`state-drift-detection-lint.test.ts` scans each call point's window for skip-licence wording
in any sentence naming the drift check. None of the three new sentences names it, and the
`in the same command` binding on each call point is untouched.

## Task 28 — `I:260810-1205-session-counts`

Source: `260810-1205_*_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md`.

**No fourth measurement module was built.** Decision
`260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`
is open and deferred by the user, and this count does not need one: it is a single shell block
over data already on disk, run at the moment the table is written. `agents/orchestrator.md`
Phase 4 gained `### The record counts are computed, not tallied`, a sibling of the
review-coverage subsection and placed for the same reason (both read `agentstate.yaml`, which
Cleanup deletes).

Two rules carry it:

- **Filed** this session = the record's own filename stamp is at or after `session.started`.
  True whether or not a commit carries the file yet.
- **Reached a marker** this session = the name it carries now did not exist at
  `session.git_head_at_start`. A question about the name, never about a git rename.

The second rule is the fix. The five records the issue names were filed by a review and closed
before anything was committed, so their open names never reached the index: a count watching
renames missed them from the closed side, a count watching new open files missed them from the
filed side, which is the −2 / −2 that was measured. Both rules count them.

Output is `filed <kind>` and `now_<marker> <kind>` counts; the four budget-table rows are read
off them unaltered, and the same figures go to the user report. Where the anchor is missing or
the project does not track its workbench the block prints `records=unmeasured`, and the prompt
says to write that word into the cells rather than a zero. Two bounds are stated in place: a
closed record *moved* between stores reads as closed again, and the untracked-workbench case is
what the `git cat-file -e` probe exists for. The State Tracking counter list now says the four
record counters are not what the table is written from.

**Measured, not asserted.** The block was extracted from the file and run in bash and zsh,
single-store and two-store, against this session's own range: `8 filed issue`, `5 now_c issue`,
`1 filed decision`, cross-checked against `git diff --name-status -M 7785330` (four renames to
closed, plus one record added directly as closed). The zsh run changed the code: zsh does not
split an unquoted parameter on spaces, so `for d in $SCAN_ISSUES` would hand `find` one path
made of two and report a Circle's records as absent. The store list is turned into lines and
read instead, and the prompt says why.

**Site note.** The record names `orchestrator-live.md` `## Session result` as the surface. No
such section is specified anywhere in the prompt (`grep -c "Session result" agents/orchestrator.md`
→ 0), so that heading was improvised by the closing session. The specified surfaces the counts
reach are the Phase 4 budget table and the Report-to-the-user bullets, and those are what is now
derived.

## Task 31 — `I:260810-1632-churnrank-exit3`

Source: `260810-1632_*_setup-documents-churn-rank-exit-2-and-not-the-exit-3-that-this-repos-own-build-cycle-produces.md`.

Setup Step 5's `bin/fusion-churn-rank` paragraph now covers both non-zero exits, with no cascade
branch added — the outcome stays the absent-helper branch's, and the reason is reported rather
than branched on (decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`). Exit 3 means the compiled hooks are missing: the
wrapper passes `[ -x ]` because what is absent is `hooks/dist/churn-rank.js` one directory over,
and the remedy is `fusion --update` for an installed copy or `cd hooks && npm run build` in the
work tree.

**A second defect at the same site, found by reading the authoritative table.** The paragraph
said *"Exit 2 is the same silence for a different reason — the project has no churn state yet."*
Both halves are wrong against `bin/fusion-churn-rank:19-25` and `hooks/churn-rank.ts:33-36`:
exit 2 is *no workbench above the working directory*, and a project with no churn yet is exit 0
with `ranked=0`. Fixed with the same edit, and the prompt now notes that Setup Step 0 has already
`cd`-ed to the workbench root, so meeting exit 2 there says the ground moved under the session.

`skills/setup/SKILL.md:252` inherits all of it through its existing pointer at this block.
