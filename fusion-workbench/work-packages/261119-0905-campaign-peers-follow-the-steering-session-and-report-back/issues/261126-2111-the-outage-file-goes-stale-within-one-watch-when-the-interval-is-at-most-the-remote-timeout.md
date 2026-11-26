# The outage file goes stale within one watch when the interval is at most the remote timeout

---
The outage file counts as stale after two intervals, measured from its last mark. Between two failed probes of one watch lie one interval and one probe, and a hanging remote makes the probe last the full 60 s bound. For `--interval` of 60 s or less the file is stale at every check, so the watch prints `failed=` and exits on every probe of one outage.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`; analysis `261126-0814-c56-recheck-run-sheet.md` (the dry run at `--interval 3`)

**Evidence:** `hooks/lib/campaign-watch.ts:280` (`Date.now() - mtime < 2 * intervalMs`); `:301-325` (probe, then `fresh()`, then `mark`, then sleep); `REMOTE_TIMEOUT_MS` 60 000 at `:89`. Stale iff interval + probe duration >= 2 x interval, that is iff probe duration >= interval. The shipped texts use the default 300 s, which is not affected. `--interval` is a documented flag (`bin/fusion-campaign` `## Usage`).

**Acceptance:** staleness accounts for the probe's bound (for example two intervals plus the bound), the header says so, and a test with `--interval 1` and a remote that hangs past it prints `failed=` once over successive probes of one outage.
