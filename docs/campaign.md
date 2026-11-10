# A campaign over several checkouts

One project, several clones, and only git between them. Each clone runs its own session, claims a work package and commits; nobody sees what the others hold until the next pull, and nobody can say, from one place, which checkout should take which package next. A campaign is the frame above that: one record naming an objective, the conditions under which the work stops, and the lanes, one ordered list of packages per checkout. The record is a file in the repository like everything else fusion writes. It travels by push and pull, needs no server between the clones, and is legible with `cat` when the tooling is not to hand.

A campaign has one writer, the steering session, which is a session in a checkout that holds no package of its own. Every other checkout is a working session: it reads the campaign once per commit cycle and does what the record says. Nothing on either side holds a lease or a lock; the record is read, and the reader acts on what it read.

**Before the first use, update every checkout and restart.** A session reads its command roster from the installed copy of fusion when it starts, and never re-reads it. An install that predates this feature carries neither the command nor the helper, and more than that: a package that declares areas and a campaign record are both refused by an older reader, by name and not silently, so a workbench in which one checkout has declared areas is unreadable to a checkout that has not updated. Declare areas and open a campaign only once every checkout of the project runs this version. In a workbench a Prior host also reads, that holds only after Prior has re-pinned the codec: the request for that re-pin, request 81 in `codec/fixtures/prior/REQUESTS.md`, is asked and unanswered, and this page predicts nothing about the answer.

## The three commands

**`/fusion:campaign`** is the steering session's command, the body in `skills/campaign/SKILL.md`. Without an argument it shows the overview: who holds what at the commit the remote stands at, when each checkout last pushed, what each package waits for, and, for a running campaign, how each lane stands and which of seven conditions hold. `cut --checkouts <N>` proposes the lanes and writes a proposal file, nothing else; `lanes` writes a confirmed proposal into the record, with the checkout each lane is assigned to, and then asks once whether every lane member runs autonomously. `open`, `pause`, `resume`, `move`, `reassign` and `end` are the six steering acts, each one confirmed write.

**`bin/fusion-campaign sync`** is the working session's half, run by the orchestrator in every commit cycle (`agents/orchestrator.md` `### Step 4 — commit`, sub-step 5a), never typed by the user. It fetches, reads the campaign at the fetched commit, writes one `campaign_read` row per campaign into the event log, settles that log, rebases, pushes, and prints the commits the push landed. A `paused` campaign that steers this checkout makes the orchestrator dispatch nothing more and report the reason; the package stays claimed.

**`bin/fusion-write set-resources`** declares a package's areas, the paths of the project it works in, relative to the project root and without a trailing slash, each covering everything under it. The entries stand on the user's confirmation; no agent invents one. The cut reads them and nothing else about a package's content.

## What travels

Three things, all by commit and push: the campaign record, the packages' control files with their claims and their declared areas, and the event log with its `commit` and `campaign_read` rows. The steering session writes the record and commits it through the ordinary commit step; the act reaches a working session at that session's next commit, when `sync` fetches and reads. No time is attached to that sentence, and the next section says why.

A pause is read the same way. On Prior a pause takes effect at once; here the working session finishes the commit cycle it was in, push included, and reads the pause at the fetch after it. The latitude is deliberate: a withheld push would strand a finished commit in one clone.

## What the overview can and cannot see

**It is as old as the slowest checkout's last push.** The overview reads one commit, the one the branch's upstream stands at after a fetch, and reports that commit's age as the age of the picture. Everything a checkout has done since its last push is invisible, and the picture is never newer than the newest push by anybody.

**A last-push time is a lower bound.** The time comes from the checkout's own `commit` rows in the event log, matched to commits on the ref by hash or, where a rebase renamed the commit, by subject and author time. A row reaches the ref only with the commit that carries the log, so the figure trails the checkout's newest push by that one commit, and a row that names no commit on the ref is counted in a note rather than dropped. The measurement behind the rule, and the three alternatives it ruled out, are in `hooks/lib/campaign.ts`.

**A file several lanes share by design is declared on none of them, and then reported by neither the cut nor the overview.** The cut groups packages whose declared areas overlap into one lane; a file every lane touches, declared on each, would pull every package into one lane. So it is declared on no package, and a commit into it by any lane prints no cross-lane row. The user ruled on 2026-11-09 (ruling B, in the campaign package's narrative) that this limit stands and is stated rather than engineered around.

**A commit by a checkout in no lane produces no cross-lane row.** The row compares two lanes, the committer's and the declaring one; a checkout outside every lane has no lane to compare, so its commits into a declared area are not reported. A commit that no checkout's rows name is reported as unattributed, in a note.

**The lane view is evaluated for a running or paused campaign only, and only once it has lanes.** A campaign that has ended steers nobody, and a campaign whose lanes are still to be cut has nothing to be in or out of. A campaign whose record the codec refuses is named as unreadable and evaluated no further.

## What "next commit" has meant in practice

The gap between two commits of a working session is the delay with which a steering act can reach it. Fusion measured that gap once, over the event logs of two projects, in `261109-1515-commit-cadence-of-autonomous-sessions.md` in fusion's own workbench. The 90th percentile of the gaps between consecutive commits of an autonomous session was **137.8 minutes** in the consuming project's log (45 sessions, 1 369 gaps), **146.1 minutes** in fusion's own log (11 sessions, 470 gaps) and **139.8 minutes** pooled (56 sessions, 1 839 gaps); the medians were 21.2, 14.0 and 18.6 minutes. Gaps of 24 hours or more were cut, five in all.

Read the figures for what they are. They are gaps between commits, not a bound on how long a pause goes unread: a session that sits idle writes no commit, and nothing bounds how long it sits. Most of the long gaps follow a finished commit or a finished task: in 247 of the 316 gaps over an hour in the consuming project, and 76 of 104 in fusion, the longest stretch without any row begins where the session has just committed or just received a finished task. That reads as a session waiting for its user, and it is inference: no row marks a wait, and an orchestrator working for an hour in its own loop would look the same. Three gaps in four are under an hour in both logs.

The user accepted the measured figure as the intervention delay on 2026-11-09 (ruling C). That is why the user-facing sentence is "at the holding session's next commit" and names no time.

## Commit hashes in records

**A commit hash written into a record is a pushed one.** A working session's cycle is commit, then fetch and read, then rebase, then push, and a rebase over a moved upstream replaces the hash the commit had locally. A hash copied from `git commit` into a decision's implementation reference, a closure note or an issue's resolution line therefore names a commit no other clone may ever hold. The rule, in the orchestrator's commit step, is that a record takes the hash a `pushed=` line of `sync` names for that commit, found by its subject, and never the one `git commit` printed; where no line has been printed yet, the write waits for the cycle that prints it. With no helper installed, or a branch with no upstream, nothing rebases and git's hash stands as before.

**A record already carrying an older hash that no clone resolves is left as it stands.** A terminal record is never rewritten, and a hash in a live one is not corrected by hand. Its commit is found by subject and author time, which a rebase keeps, the same join the overview uses for a checkout's last push. The issue that raised the point is `261109-1341-a-commit-hash-written-into-a-record-before-the-rebase-goes-stale-when-the-rebase-rewrites-the-commit.md`, in the campaign package's workbench.

## Where the Claude side deviates from Prior

The campaign record is Prior's format, `fusion.campaign/v1`, and fusion's codec reads it as Prior's does. What the Claude side does with it differs from Prior in these points, and this section is the one home of the list.

- **N lanes against Prior's two-writer bound.** Prior's campaign admits two writers; the Claude side cuts the work into as many lanes as the user names checkouts.
- **A pause takes effect at once on Prior.** After it, no protected action runs and no attempt records its outcome. Here a pause is read at the fetch after the working session's next commit, and that commit cycle is finished, push included.
- **A first stored state of `running` with empty `sessions` and `runs`.** `open` writes it; Prior's own lifecycle cannot produce it, and Prior reads it as a shape its `Start` never writes. It grants nothing on Prior, and it holds only while no import of a Claude-written campaign into Prior is planned; none is. A `resume` writes the reason back to null, which is Prior's correction and no deviation.
- **The cut groups nested areas.** Two declared areas overlap for the cut when they are equal or one lies under the other at a `/` boundary. Prior's `overlap` reads equal strings only, so Prior's reading is the narrower one: every pair Prior groups the cut groups too, and the cut groups nested pairs Prior would not.

**The two hash values are no deviation.** `state.charter_hash` and `state.revision` of a campaign the Claude side writes are Prior's own `charterHash` and `stateRevision`, computed by the codec on `show` and copied into the record by the writer, so they equal what Prior would compute over the same bytes. An interim rule that would have labelled a different value as Prior's was withdrawn before any campaign was written.

**Areas and campaigns are for this version's readers.** A package carrying `resources` and a campaign record are each refused by an older codec, so areas are declared and a campaign is opened only once every checkout runs this version, and in a workbench a Prior host also reads, only after Prior has re-pinned the codec. Whether and when Prior moves its pin is request 81's, and this page does not say.

## Where the mechanism is written down

`bin/fusion-campaign`'s own header is the authoritative documentation for every sub-command: the fetch and the read at the commit, the `last_push` rule, the lane view and the seven conditions, the cut's rules and its proposal file, each steering act with its refusals, the commit cycle of `sync`, the notes, the state vocabulary and the exit codes. None of it is copied here, deliberately: a second copy drifts from the first, and the first is the one the program obeys. The computations behind it are `hooks/lib/campaign.ts` (the overview and the lane view), `hooks/lib/campaign-cut.ts` (the cut), `hooks/lib/campaign-write.ts` (the seven writes) and `hooks/lib/campaign-sync.ts` (the commit cycle), each with its own header.

The flow on the steering side lives in `skills/campaign/SKILL.md`; the working side's one step is in `agents/orchestrator.md` `### Step 4 — commit`. What a work package is, and which of its fields a campaign reads, is `rules/fusion-workbench-conventions.md` `## Work packages`. The companion page for the other thing that travels between checkouts, a message, is `docs/messages-between-checkouts.md`.
