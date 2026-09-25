# Orchestrator Session — 260910-0842

**Status:** Complete
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Directive:** Continue the active Circle's plan, `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, from step C0 (session 3 of four).
**Mode:** plan

## Snapshot at start

- HEAD `75ea0463`; branch `main`, 19 commits ahead of `origin/main`, nothing behind, upstream view 24 hours old.
- Open issues: 5 in this Circle, 29 shared. Open decisions: 2 in this Circle, 12 shared. Live plans: 4.
- Circles: 1 anticipated, 1 active, 3 bounded, 20 closed, 1 superseded.
- Workbench domain `code` (155 source files against 10 data files, counted by `git ls-files`).
- Turn budget 12; dispatch bound 20 minutes. Both resolved, no loader diagnostics.
- Setup portfolio hint printed (1 anticipated, 1 active).
- Checkout `5e8248d7` (`west-harbor`). One further checkout of the same person seen in the last 7 days, `1d05b0e4` (`russet-marsh`), last active 2026-09-07.

## Session 3 is blocked before its first step

Step C0 verifies session 2's substrate **against the log this session writes**, and the log
this session writes is written by the *installed* plugin copy at `$FUSION_PLUGIN_ROOT`, which
is pinned for a session's whole life. Measured here:

- `diff -rq hooks/dist $FUSION_PLUGIN_ROOT/hooks/dist` reports `session-start.js`,
  `tracker.js`, `guard.js`, `lib/orchestrator-events.js` and `lib/review-coverage.js`
  differing, and `lib/dispatch-bytes.js` present only in the work tree. The same for
  `bin/`: `fusion-commit-lock`, `fusion-review-coverage`, `fusion-session-domain` and
  `monitor`.
- No `session_start` row carrying this session's identifier
  (`2024594a-1464-4f29-93b7-f981f8a35749`) exists in `orchestrator-events.jsonl`, which is
  B1's product and therefore the direct evidence that B1 is not in force here.
- Both copies report version `10.26.0`, so the version string does not distinguish them.

C0's own verification clause forbids proceeding on a partial pass, and C1 depends on C0, so
the whole of session 3 waits.

**The remedy has three steps in this order, and the first is not optional.** `fusion --update`
fetches `https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh` and that installer
reads the GitHub `main` tarball, so an unpushed commit cannot reach the install. Session 2's
four hook commits (`0160c449`, `e257782d`, `9c4dbdbb`, `34cd5bc2`) are among the 19 this
branch holds and `origin/main` does not. So: push, then `fusion --update`, then restart the
session.

This is the two-session shape the plan's `## Approach` section states in advance rather than
a surprise; what it did not state is that a session-boundary update also needs a push, because
the plan assumed the boundary would be crossed from a pushed branch.

## The blocker is cleared; the restart is not

Performed in this session, in the order the remedy requires:

1. `git push origin main` — `840b3721..75ea0463`. `git rev-list --left-right --count
   origin/main...HEAD` now reads `0 0`, so the four hook commits are on the remote the
   installer reads.
2. `fusion --update` — reinstalled `10.26.0` from the GitHub `main` tarball. Verified:
   `diff -rq hooks/dist $FUSION_PLUGIN_ROOT/hooks/dist` and `diff -rq bin
   $FUSION_PLUGIN_ROOT/bin` are both empty, `hooks/dist/session-start.js` in the install
   carries `session_start`, and `hooks/dist/lib/dispatch-bytes.js` exists there.

**What remains is the restart, and nothing in this session can substitute for it.** A session
reads its hooks, its agent roster and its `bin/` helpers once at start from the install and
never re-reads them, so this session goes on running the pre-update copies whatever the
install now holds. C0 reads a log written by the *new* hooks, so C0 belongs to the next
session.

**Status:** Complete — session 3 did not start. Next session resumes at C0.
