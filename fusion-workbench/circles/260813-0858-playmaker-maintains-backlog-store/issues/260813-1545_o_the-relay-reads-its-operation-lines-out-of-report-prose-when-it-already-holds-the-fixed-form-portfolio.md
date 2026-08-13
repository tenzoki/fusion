# The relay reads its operation lines out of report prose when it already holds the fixed-form portfolio

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Medium
**Scope:** `skills/next/SKILL.md` Step 5b; `agents/playmaker.md` `### A confirmation carried by the dispatch prompt`

## The seam

`skills/next/SKILL.md:159`:

> **1. Read the proposals out of the report**, one operation to a line. The four line forms are fixed by the portfolio template in `rules/circle-records.md` `## Backlog — ranked`, and playmaker returns them in the report exactly as it wrote them into the portfolio.

Three things are assumed of the returned report and none is enforced:

1. **That the report carries the lines verbatim.** The only statement of this obligation is one clause in `agents/playmaker.md:205` (*"returns those same lines as report text"*). Pulling the other way, `agents/playmaker.md` `## Output Style` routes *"the briefing summary returned to the dispatcher"* through `rules/user-facing-output.md`, which mandates plain-English prose, action-first ordering and marker words rather than codes, and forbids the telegraphic form these lines are written in.
2. **That the block is findable.** Nothing names a heading, a fence or any delimiter for the proposal block in the report. The plan's step 4(b) calls it *"the proposal block"*; no file defines one.
3. **That absence is detectable.** `skills/next/SKILL.md:157` — *"**No proposals, no step.** When the returned report names none, do nothing here"* — is the most common path, and it is decided by failing to find something in free text.

## The evidence that prose is the natural output

The portfolio actually on disk was written by a playmaker run three hours before the change, and its `## Backlog — ranked` section states its split proposal as narrative bullets, not as `split <entry path> into: …` (`fusion-workbench/portfolio.md:155`–`186`). That is the register `user-facing-output.md` asks for, and it is unparseable by the relay.

## The better channel is already in hand

Step 4 has already read the portfolio (`skills/next/SKILL.md:139`, `cat "$WORKBENCH/$PORTFOLIO"`), and Step 4 declares it authoritative: *"Treat its current content as authoritative."* The portfolio is the surface where the four forms are actually mandated (`rules/circle-records.md:127`–`131`), because the template is the file that fixes them. Reading the operation lines from the portfolio section the skill already holds removes all three assumptions above at once, and costs nothing — the skill neither resolves nor needs a backlog key to do it, since `$PORTFOLIO` is at the workbench root and already in `next`'s key set.

## Recommendation

Change step 1 of Step 5b to read the operation lines out of the `## Backlog — ranked` section of the portfolio read in Step 4, and demote the returned report to what it is good at: telling the skill whether this run proposed anything at all. Then state in `agents/playmaker.md` that the four operation lines in `## Backlog — ranked` are a **structured artifact** and therefore exempt from the prose profiles, the way `rules/user-facing-output.md` already exempts dashboard lines and machine-read tables. Without that exemption the two rules genuinely conflict.
