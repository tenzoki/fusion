# `/fusion:cadence` defines a churn "session" two ways for git, which changes the list-3 ranking

**Filed by:** coderev (incremental review, Turn 1, v5.7.0 release session)
**Scope:** `skills/cadence/SKILL.md` — inherited verbatim from `flight`'s original
**Severity:** Medium — the ambiguity sits on the metric that list 3 exists to produce

---

## The defect

The skill defines the unit of counting twice, and the two definitions disagree for git.

`skills/cadence/SKILL.md:103` (step 4, dating the units):

> Each **log unit** is one dated thing: one session-history file, one `## YYYY-MM-DD`
> day-section in the activity log, or **one git commit**.

`skills/cadence/SKILL.md:136` (step 7, the churn metric):

> A "session" is one log unit as defined in step 4 (one session-history file, one
> activity-log day-section, or **one git-commit day**).

Step 7 cites step 4 as its authority and then states a different unit for the git source.
Per-commit and per-commit-day are not close: a topic worked in ten commits on one
afternoon scores **10** under step 4's unit and **1** under step 7's. Git is normally the
highest-volume source of the three, so the choice decides the ranking — a burst of
refactor commits outranks a theme that genuinely recurred across four separate weeks, or
does not, depending on which sentence the running agent reads last.

The same contradiction affects list 6's ordering rule ("order by how active the topic was
(most log units first)", `skills/cadence/SKILL.md:127`), for the same reason.

## Provenance

Inherited, not introduced by the port. `flight`'s original carries it identically —
`/Users/kai/Projects/productive/F05-flight/codebase/flight/skills/cadence/SKILL.md:91`
("one git commit") versus `:126` ("one git-commit day"). The port fixed flight's other
internal-numbering drift (flight's "list 1"/"list 2" labels contradicted its own intro;
fusion renamed them to "the recent lists" and "the third list") but carried this one
through unexamined.

## Recommended fix

Pick per-commit-day and make step 4 say so. Rationale, not just a coin flip: churn is
meant to measure *how many separate times you came back to a theme*, and a run of commits
in one sitting is one return, not ten. Per-commit-day also makes the git unit
dimensionally consistent with the other two sources — a history file is one session and an
activity-log day-section is one day, so counting git per commit would let one source use a
finer grain than the rest and silently dominate the ranking.

One edit at `skills/cadence/SKILL.md:103` (git unit = one commit **day**, with the commits
of that day read together for topics), and step 7 then agrees with the step it cites. The
git-source legend at `skills/cadence/SKILL.md:82` and the ordering rule at `:127` should be
read against the same unit while making the change.

---
Reconciliation 260731-2324-reconciliation.md (reconciler, domain `code`) — **confirmed, stays `_o_`.** Both halves of the contradiction re-read at `17730b8`: `skills/cadence/SKILL.md:103` says a log unit is "one git commit"; `:136` says a session is "one git-commit day" while citing step 4 as its authority. The disagreement is real and is confined to the git source — the session-history and activity-log units are stated identically in both places. The knock-on to the ordering rule at `:127` is also as described.

Unresolved by the release. This is the one of the three new findings with a user-visible consequence (it decides list 3's ranking), so it is the natural first fix when the cadence follow-up is picked up.

---
Resolved: the git-commit day is now the single unit, defined once in step 4 and restated without divergence in step 7. Five sites moved together — the step-4 definition, the step-4 date derivation (a date's commits are grouped and read as one unit), the step-7 churn metric, the step-6 ordering rule for the two recent lists, and the git-source legend row. The report template's `Sources scanned` example moved with them, from `git (37 commits)` to `git (37 commits on 12 days = 12 units)`, so a bare commit count no longer sits next to a commit-day unit.

The direction was chosen for a reason rather than by coin flip: churn measures how many separate times a theme was returned to, and a run of commits in one sitting is one return; and it makes the git unit dimensionally consistent with the other two sources, so none of the three counts at a finer grain and silently dominates the ranking.

Session: `260810-0241-orchestrator-session.md` (task T9). Executor log: `260810-0323-coder-cadence-churn-unit.md`.
