# C4 step 7 — the monitor reads its own checkout

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Plan:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_o_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, step 7

## What was implemented

One file, `bin/monitor`, and three edits inside its embedded Python server.

1. **`CHECKOUT_ID_FILE`** beside the three path constants, pointing at `BASE_DIR/.checkout-id`.
2. **`_read_checkout_id()`** — a plain read of that file through the existing `_read_file`, returning `None` when the file is absent, unreadable or empty. It never mints: minting belongs to `bin/fusion-identity` alone, and a dashboard process that creates workbench state would be a defect of its own. The file is class L in `rules/workbench-tracking.md`, so it stays in the checkout it was minted in.
3. **`_read_events()`** — the event window, lifted out of `do_GET` into a named method beside `_read_warnings`, which is what leaves it extractable for plan step 10 the way `monitor-warnings-panel.test.ts` extracts the warnings read. It parses **every** line rather than `lines[-MAX_EVENTS:]`, drops the lines whose `checkout` is present and differs from this checkout's, sorts on the raw `ts` string, then takes the last `MAX_EVENTS`. The call site in `do_GET` is now `events = self._read_events()`.

The order matters and is the whole repair: the window is taken **after** the filter, so a foreign block can no longer push this session's most recent events out of it.

## Why the read is shaped this way

The method carries a comment naming the four false readings — `_parse_mode`, `computeETA`, the paired-duration average and the Event Log panel, all downstream of the one array — and citing the record that measured them, `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`. That record also measured that sorting by `ts` alone moves reading 1 from vague to wrong, which is why the comment states the mechanism change rather than the ordering.

Sorting on the raw string is correct for the reason `_read_warnings` already gives for the guard log: the emit convention writes a fixed-width UTC stamp, so lexical order is chronological order and no parse (and no parse failure) is involved. A line missing `ts` sorts oldest rather than raising, and the sort is stable.

An absent `checkout` and an unreadable identifier both keep every line. That is the user's decision carried through, not a fallback chosen here: the whole pre-C4 log carries no such field and no record is rewritten, so an absent identifier has to read as this checkout's own or the panel would come up empty on day one.

## One thing deliberately not written

The comment names the identity helper as `fusion-identity` and the tracking rule by description rather than by path. `bin/monitor` begins `#!`, so `reference-resolution-lint.test.ts` scans its comment lines as class (a) plugin paths, and that gate pins the resolved count in `BASELINE` by equality. Spelling either citation as a path would have added two tokens and required re-approving the baseline in a test file this task was scoped out of, and which the hook-test surface has zero lines of head-room to grow. The record citation is unaffected: class (c) counts are not pinned.

## Verified

`cd hooks && npm test` was run twice, and the two runs differ for a reason outside this file.

- 01:45, over a tree holding this change: 43 files, 760 tests, **exit 0**.
- 01:50, after two sibling tasks wrote to the same tree: **exit 1**, one failure, `reference-resolution-lint.test.ts` reporting `paths: 1411` against a `BASELINE` of `1409`. That baseline was itself re-approved from 1404 by a sibling while this task ran.

The failure is measured, not assumed, to be none of this file's doing. Scanning `bin/monitor`'s comment lines with the gate's own `PLUGIN_PATH_RE` gives **7 tokens at `HEAD` and 7 after this change**, the identical list, so this edit moves the count by zero; the dirty files at that moment were `rules/workbench-tracking.md` and `skills/setup/SKILL.md`, and the first of them is plan step 9, whose stated job is to name three readers by path. The remaining 42 files and 759 tests passed.

Measured rather than asserted, against a fixture workbench holding two checkouts' lines out of order, one legacy line with no `checkout` and one line with no `ts` at all:

- With `.checkout-id` = `aaaa1111`, `/api/dashboard` served the five lines of this checkout — the legacy line among them — in ascending `ts`, with the no-`ts` line first. Both `bbbb2222` lines were absent, including the `session_end` that stands latest by `ts`.
- With `.checkout-id` deleted, and again with it holding only whitespace, the same request served all seven lines and `mode` came back `done` — the exact false reading the record measured, and the proof that the unreadable-identifier branch is today's behaviour.
- With `-n 3` and the identifier present, the window held this checkout's three newest lines rather than the file's last three, which is the panel symptom the record measured with `-n 4`.
- Three `/api/dashboard` fetches against a workbench directory with no `.checkout-id` left the directory holding exactly the one file it started with: nothing was minted.
- Against this repository's own workbench, all 2 352 lines were parsed, none dropped (none carry a `checkout`), the served 100 were ascending by `ts` and ended on the real tail of the file, and `fusion-workbench/.checkout-id` kept its original mtime.

`bash -n bin/monitor` passed, and the embedded server compiled under `python3 -m py_compile`.

## Records closed

`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md` — a second `Resolved:` note appended beside the referral note it already carried, naming where the work landed. The marker was already `_c_` from that referral, so no rename was needed.
