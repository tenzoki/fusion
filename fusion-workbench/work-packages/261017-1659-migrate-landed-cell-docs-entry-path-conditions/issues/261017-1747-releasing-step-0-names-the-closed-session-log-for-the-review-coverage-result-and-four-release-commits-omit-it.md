# Releasing: step 0 says to state the review-coverage result "in the release commit or the session log", the session log is closed to writes, and the last four release commits do not state it

---
`README-agents.md` `## Releasing` step 0: "Before tagging, also run `bin/fusion-review-coverage --since <previous tag>` and state its result in the release commit or the session log." The history store has been closed to writes (`rules/fusion-workbench-conventions.md` `## Session history`), so the release commit is the only place left. The release commits of 13.1.8, 13.1.9, 13.1.10 and 13.1.11 do not mention the result. Those of 13.1.6 and 13.1.7 do.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `260817-1417_*_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md`

**Evidence.**
- `git log -1 --format=%B` of `c239cdd6`, `2615df08`, `f95c0b28` and `0dbce04b` contains neither "review-coverage" nor "coverage". `ddab3bf1` (13.1.7) and `74992939` (13.1.6) each contain it once.
- The 13.1.11 plan, step 3, sends the result to the executor's report, which is not persisted.
- Measured in a scratch clone at `c239cdd6`: `bin/fusion-review-coverage --since v13.1.10` prints `verdict=uncovered`, with all five commits uncovered before this package's closing review is filed.

**Fix direction.** Strike "or the session log" from step 0, and let the release procedure record the result where it persists: in the release commit, or in the tag annotation when the closing review lands after the release commit, as it does in this package's sequence. Wording only. No helper changes.

**Acceptance.** Step 0 names only places that still take writes, and the next release states the review-coverage result in one of them.
