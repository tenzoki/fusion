# The explicit form of `/fusion:next` skips the confirmation relay, and no step says so

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Low
**Scope:** `skills/next/SKILL.md` Step 3 short-circuit and Step 5b

## The path

Step 5b is reachable from exactly one place: the closing line of Step 5 (`skills/next/SKILL.md:151`, *"After rendering the briefing, proceed to Step 5b."*).

The explicit-form short-circuit bypasses it (`skills/next/SKILL.md:108`):

> the briefing render in Step 5 may be skipped. In that case **go straight to Step 6** with `<circle-dirname>` as the target.

So on `/fusion:next <circle-dirname>` and on the `--write-activation` alias, the first playmaker dispatch still runs and still writes its proposals into `$PORTFOLIO` `## Backlog — ranked`, and nothing ever puts them to the user. The proposals sit in the portfolio until the next default-form run.

## Whether it is wrong

Defensible: the user who names a Circle asked to activate that Circle, not to be interrupted with backlog questions, and the short-circuit's own reasoning already sacrifices the briefing for the same reason. The behaviour is probably right.

What is wrong is that it is invisible. Step 5b opens *"Playmaker's report from Step 3 may name backlog operations it proposed and could not perform"* with no hint that a whole invocation form never arrives there, and Step 3's short-circuit predates Step 5b and names only Step 5.

## Recommendation

One clause at `skills/next/SKILL.md:108`: the explicit form skips Step 5 **and Step 5b** — any backlog operations this run proposed stay in the portfolio and are put to the user on the next default-form `/fusion:next`. Optionally one line in the activation output naming that the portfolio carries unconfirmed proposals, so the user knows there is something waiting.

---
Resolved: `skills/next/SKILL.md` Step 3 short-circuit now names both steps it skips. It states that going straight to Step 6 skips Step 5b as well, since 5b is reachable only from the end of Step 5, and that backlog operations the run proposed stay in the portfolio until the next default-form `/fusion:next` puts them to the user.
