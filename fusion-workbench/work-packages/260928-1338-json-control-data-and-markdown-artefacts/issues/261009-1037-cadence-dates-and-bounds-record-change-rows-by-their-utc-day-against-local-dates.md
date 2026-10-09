/fusion:cadence dates and bounds `record_change` rows by their UTC day against local dates
---
`skills/cadence/SKILL.md` `## Process`, step 3b (added at `f37b6194`), selects event-log rows with `awk -v s="$SINCE" '… substr($0, RSTART + 6, 10) >= s'` and tells the model to date each row "by its `ts`". A row's `ts` is UTC with no zone suffix (`utcStamp` in `hooks/lib/orchestrator-events.ts`: `toISOString().slice(0, 19)`), while `$SINCE` and `today` are local dates (`date +%Y-%m-%d`), the activity log's days are local, and the find beside it reads `-newermt "$SINCE"` as local midnight. On a host east of UTC a state change made between local midnight and the offset is dated a day early, and with `$SINCE` equal to that local day the row is dropped; west of UTC the error runs the other way. The install case pins the mismatch as a clock dependence: `codec/src/__tests__/install.test.ts`, the cadence `## Process` case, asserts `c.ts.slice(0, 10)` equal to the window block's local `today`, so the codec suite goes red when run between local midnight and 02:00 under CEST. Medium: a shipped skill misdates or drops activity, and the release gate's codec suite depends on the hour it runs.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence:** `skills/cadence/SKILL.md` line with `grep -hs '"event":"record_change"'`; `hooks/lib/orchestrator-events.ts` `utcStamp`; a live row in `fusion-workbench/orchestrator-events.jsonl` reads `"ts":"2026-10-09T08:28:00"` for a write made at 10:28 CEST. Not observed: no run was made inside the midnight window; the test's red is inferred from its assertion and the two date sources.

**Fix direction:** convert the row's `ts` to the local date before comparing and before dating (the skill already shells out; `date -j -u -f` on macOS, or one `python3`/`node` line), and assert the converted date in the install case.

**Acceptance:** the scan block selects and dates a row by its local date; the install case passes with `TZ` set so that the row's UTC date and the local date differ (for example `TZ=Pacific/Kiritimati`), and with `TZ=UTC`; codec suite green with `CODEC_REQUIRE_GOLDENS=1`.

Cross-references: 261009-1037-reviewer-g-a-pre-release-review-of-13-0-0.md
