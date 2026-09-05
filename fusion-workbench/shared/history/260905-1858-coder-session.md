# Setup reads how far the checkout is behind its upstream

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <kai@qantr.com>

## The task

Close `260905-1850_*_setup-does-not-notice-that-the-checkout-is-behind-its-remote.md`. Setup's
Done report has to say how many commits the current branch is behind its upstream and when the
remote was last fetched, or that no upstream is configured, or that the read could not be taken
and why. Advisory, never blocking.

## The design choice: read, do not fetch

The step reads the local remote-tracking ref and never runs `git fetch`. What that answers is
"behind what this checkout last saw", so the age of that view is printed with the number in every
case that carries a number. The record forbids exactly one shape, a count without its age, and
this one cannot produce it.

Fetching would have given the sharper answer. It was refused for three costs, each paid at the
mandatory first step of every session:

1. It is the only network call in a step sequence that is otherwise wholly local, so it is the
   only step whose failure mode is the network.
2. It writes remote-tracking refs before the user has agreed to anything, changing what every
   later git read in the session sees, as a side effect of an advisory check.
3. Against a remote that wants credentials it blocks a non-interactive shell at a password
   prompt. There is no timeout that ships on every platform to bound it: macOS carries no
   `timeout`, and guarding all three conditions (`GIT_TERMINAL_PROMPT=0`, ssh `BatchMode=yes`,
   a portable backgrounded kill) is more machinery than the answer is worth inline.

**The case against the choice, stated.** In the case that motivated the record the read prints
`behind=0` where the truth was 25, because that checkout had not fetched. The age is what carries
the signal there, and a reader who skims the number and not the age learns nothing. Two things
answer that and neither makes it disappear. `fetched=never`, the shape a clone that never fetched
actually produces, renders as a warning whatever the count says. And above 24 hours the rendering
rule puts the age first and the count second. Both are rendering conventions rather than a
measurement, which is a real loss and is why it is written down here.

## Inline, not a `bin/` helper

The project's convention makes helpers of snippets that repeat
(`260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`).
This one has one call site. A helper would also be absent from `$FUSION_PLUGIN_ROOT` until the
next `fusion --update`, so every call site takes its `[ -x ]` miss branch for a whole release
(`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`),
and the step could not have been demonstrated running in the session that wrote it. Inline runs
now. No `CLAUDE.md` Layout row is owed.

## What changed

`skills/setup/SKILL.md` gains `## Step 0k — Whether this checkout is behind its upstream
(advisory)`, placed after Step 0j and before Step 1 so no existing step letter moves; letters
0c through 0j are cited from `CLAUDE.md`, `bin/`, `agents/` and four `docs/upgrading-*` notes,
and renumbering would have broken all of them. The step emits `KEY=value` in the house form and
carries an eight-case rendering rule. The `## Done` list now names it.

Emitted keys: `upstream=` (the configured upstream, or `none`, or `no-work-tree`),
`behind=`/`ahead=` or `counts=unread`, and `fetched_hours_ago=` or `fetched=never`. The upstream
name is read with `git for-each-ref --format='%(upstream:short)'` rather than
`git rev-parse --abbrev-ref @{upstream}`, because the latter prints the literal string
`@{upstream}` when the remote-tracking ref is gone; the chosen read names the configured upstream
whether or not its ref still exists, and the count then fails cleanly into `counts=unread`.
The fetch age comes from the mtime of `git rev-parse --git-path FETCH_HEAD`, which every fetch
and every pull rewrites even when nothing moved, and which a fresh clone does not have at all.

## What it prints here

```
upstream=origin/main
behind=0 ahead=39
fetched_hours_ago=1
```

Ahead and not behind, which is the merged-and-unpushed state of this checkout. Four further
cases were exercised by hand in scratch repositories: not a work tree (`upstream=no-work-tree`),
a repository with no upstream (`upstream=none`), a fresh clone (`upstream=origin/master`,
`behind=0 ahead=0`, `fetched=never` — the shape the record was filed on), and an upstream whose
ref cannot be read (`counts=unread`).

## Budget

`skills/` was at its baseline exactly (240 614 bytes, all 20 000 of head-room available).
`setup/SKILL.md` went 47 236 to 50 309, +3 073. The surface now stands 3 073 into its head-room
with 16 927 left. `fixtures/surface-growth.golden` was regenerated, which moves no baseline.
No baseline was edited and none went stale.

## Verification

`cd hooks && npm test` — exit 0, 50 files, 864 tests.
