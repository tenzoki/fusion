# Upgrading to fusion v11.4

**Nothing in your project is rewritten by this release and there is no migration step.** v11.4
removes one slash command by merging it into another. Your workbench, your `fusion.json`, your
records and your rule files are untouched.

Upgrading is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence on
the marketplace path, and then restart the session once. A session reads its skill roster at start
and never re-reads it, so the change below does not exist until you do. The release is tagged
`v11.4.0`, and `FUSION_REF=tags/v11.4.0` pins exactly this version.

## The one thing to act on: the `log-activity` command stops resolving

Type `/fusion:cadence` where you typed `log-activity`.

`/fusion:cadence` now runs both halves in one pass. It scans git and the whole workbench tree and
writes this checkout's `activity-log-<checkout>.md` at the project root, then reads that record
back and writes the digest to `fusion-workbench/shared/memos/cadence-<checkout>.md`. Both files
land on every run.

**What that buys.** The digest could only ever be as fresh as the last time somebody remembered to
type the other command, and nothing said when that was. In the repository that ships both commands
the log stood seventeen days stale. There is now no log to keep fresh and no order to remember.

**What it gives up, stated rather than hidden.** There is no way to read the digest without
rewriting the log first, and no switch to ask for one without the other. A cadence run therefore
costs what both commands used to cost together. That was the choice: a refresh flag and a staleness
heuristic were both considered and both refused, because either one puts the stale case back on
the user to notice.

## Three things move in the digest itself

**Recurring themes are ranked by days, not sessions.** The churn column counted the number of
distinct *sessions* a theme appeared in, which cadence could compute while it gathered its own
sources. It now ranks over the activity log's `## High-level arc`, one themed line per day, so
churn is the number of distinct **days** a theme appears in. The column header says `days` and the
report's `## Notes` says the unit changed, so a number that moved does not have to be inferred. A
theme still needs a churn of 2 or more to count as recurring, and each one still carries its span.

**The `**Covers:**` line is gone, and the digest now names no writers at all.** It named the distinct
writers of the session histories in the seven-day window, collected by opening each history file's
`**Filed by:**` header. The merged command scans the tree once for filenames and timestamps, writes
the activity log from that, and digests the log — it never opens a history header for its writer, so
the line has no input whatever the window holds. (The store being closed to writes since v11 does
not by itself empty it: a window of the last seven days still reaches files written before the cut.)
Every other
identity rule is unchanged: the digest is the project's, not a person's, and the `-<checkout>`
suffix still names the checkout that ran the command rather than the author of the work inside it.

**A legacy `activity-log-<login>.md` is adopted.** Where an old log is keyed by your login rather
than by the checkout identifier, and nothing yet stands at the checkout-keyed name, cadence renames
it and reports the rename. In every other case it leaves the file alone and names it in the report.
Nothing is merged and nothing is deleted. This was impossible before, because the command that
could adopt the file was not the command allowed to write it.

## `/fusion:cadence` now halts without a workbench

The old `log-activity` body would run with no `fusion-workbench/` above the working directory and write
a git-only log into whatever directory you happened to stand in. Cadence does not: with no
workbench it stops and tells you to run `/fusion:setup` at the project root. That removes the
failure mode where a log appeared somewhere nobody looks again, and it is the only new halt in this
release.

## Where the command is documented now

`skills/cadence/SKILL.md` is the body, and it is the only one. `README.md` and
`README-agents.md` carry the command tables, and `/fusion:help daily` describes the three commands
that frame a session. `docs/upgrading-to-v11.md` still lists `log-activity` among the commands the
end-of-session pipeline became — that note describes what v11 did and is not rewritten, so it names
the command as a bare name and says where it went.
