The report uses "session" for two different units, and section 7 compares counts across them

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing `084c626..dbf259a`
**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0035-three-before-figures-and-the-after-measurement-defined.md` sections 1, 5 and 7, and recommendation 1
**Cross-references:** the same report's section 6, whose executability defect is filed separately at `260822-0116_*_the-after-runs-records-per-session-arm-names-a-join-between-transcripts-and-session-stamps-that-does-not-exist.md`

---

## What is wrong

The word "session" names two different objects in this report and the report never says so.

| Where | What a session is | Count in the before-window |
|---|---|---|
| Section 1, records filed per session | one `session_start` event in `fusion-workbench/orchestrator-events.jsonl` | 52 |
| Sections 5 and 7, and recommendation 1 | one transcript file under `~/.claude/projects/-Users-k1-Projects-productive-fusion/` | 52 unprimed of 68 contributing, 72 present |

**The two are not the same unit and they are not the same size.** Over roughly the same period the
transcript corpus holds 68 contributing files against 52 event-log session starts, a ratio near
1.3 to 1. Both re-measured at HEAD `dbf259a`: the section 1 command returns `sessions=52`, and a
per-file loop over the 72 transcripts returns 68 contributing, 52 of them unprimed.

**The collision at 52 is what makes this invisible.** Section 1's 52 and section 5's 52 are
different populations that happen to have the same cardinality in this window, so nothing in the
text looks wrong.

## Where it bites

Section 7's second bullet puts both units in one sentence:

> **Not the filing figure.** With the before arm at 52 sessions and a standard deviation of 17.6,
> a rise of five records per session is unreachable at any after-size and a rise of ten needs
> about 45 further sessions. At twenty, report the direction and the interval, and make no claim.

"45 further sessions" is event-log sessions. "At twenty" is transcripts, because twenty is derived
three paragraphs earlier as 158 after-blocks divided by 8.2 multi-line blocks per unprimed
transcript. Twenty transcripts is roughly fifteen orchestrator sessions, and 45 orchestrator
sessions is roughly 59 transcripts. The comparison the bullet invites the reader to make is
between numbers on two scales.

The practical conclusion of that bullet survives the error: twenty of either unit is far short of
45 of either unit, so "report the direction and make no claim" still holds. That is why this is
Medium rather than High. What does not survive is the report's claim on its own face that a later
session can run this without re-deriving anything.

Recommendation 1 is internally consistent on its own terms, because it names section 4's grep,
which counts transcripts.

## What to do

Two words, applied throughout.

1. Use **"transcript"** wherever the unit is a file in the transcript corpus, and reserve
   **"session"** for a `session_start` event. Sections 5 and 7 and recommendation 1 change; section
   1 stays.
2. State the two counts side by side once, where the twenty is derived, so a reader converting
   between them has the ratio in front of them.

If the fix for the section 6 defect is to leave the filing arm unrestricted, this rewrite is a
prerequisite for stating that clearly.

**Verified at HEAD `dbf259a`** by re-running the section 1 command (`sessions=52 records=854`), by
counting contributing transcripts with a per-file loop (68 of 72 overall, 52 of 53 unprimed), and
by reading sections 1, 5 and 7 and recommendation 1.
