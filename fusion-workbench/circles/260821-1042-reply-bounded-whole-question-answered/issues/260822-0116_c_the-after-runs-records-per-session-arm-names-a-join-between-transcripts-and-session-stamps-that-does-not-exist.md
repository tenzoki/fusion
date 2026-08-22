The after-run's records-per-session arm names a join between transcripts and session stamps that does not exist

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, reviewing `084c626..dbf259a`
**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0035-three-before-figures-and-the-after-measurement-defined.md` section 6, and the `C3 -.-> F4` edge of the flowchart in that section
**Cross-references:** section 1 of the same report, which defines the records-per-session command; `fusion-workbench/orchestrator-events.jsonl`, the source that lacks the key

---

## What is wrong

Section 6 states the after-window form of the records-per-session figure in one sentence:

> Records per session in the after-window uses section 1's command with the window bounds
> changed to `$1>="260821-2311"`, which is the local-clock form of the same instant, and with
> the `unprimed.list` sessions used to say which of those sessions may be counted.

**There is no way to do the second half.** The two halves of that sentence live in different
identifier spaces and the report supplies no map between them.

- `unprimed.list` holds one absolute path per line, each a transcript file named by a UUID
  (`~/.claude/projects/-Users-k1-Projects-productive-fusion/<uuid>.jsonl`). The construction is
  in section 4 and I re-ran it: 53 lines, every one a UUID path.
- Section 1's per-session table is keyed by a `yymmdd-HHMM` stamp derived from `session_start`
  events. Those events carry two fields and nothing else. `head -3` of
  `fusion-workbench/orchestrator-events.jsonl` returns
  `{"ts":"2026-07-06T16:51:48","event":"session_start"}` and two records of the same shape. No
  session id, no transcript name, no path.

So a later session that follows section 6 as written reaches a step it cannot execute. To
proceed it has to invent a time-proximity join: pick a timestamp out of each transcript (first
record? first assistant record? first human prompt?), match it to the nearest `session_start`,
choose a tolerance, and decide what to do when one transcript spans two session starts or two
transcripts sit inside one. **Each of those is a judgement the report did not make**, and the
report's own stated purpose is that "a later session can act on it without re-reading this one".

The flowchart carries the same unbacked claim in graphical form: the dotted edge
`C3 -.->|"names the unprimed sessions F4 may count"| F4` draws a link the data does not support.

## Why this one matters more than a missing convenience

The join is not decorative. Without it the after-run has three routes, and they are not equal.

1. Invent a join. Two runs invent different ones and the figures stop comparing.
2. Drop the unprimed restriction from this arm alone, and compare an unrestricted after-figure
   against a before-figure that section 1 also computed unrestricted. This is self-consistent and
   is very likely what was intended, but the report says the opposite.
3. Drop the arm. Defensible given section 7's finding that it carries no verdict at twenty
   sessions, but that is a decision, not a silent omission.

Route 2 is probably right and the report should say so rather than leave three doors open.

## What to do

Amend section 6 to state one of the following, in the report itself rather than here.

- **Preferred:** state that the records-per-session arm is **not** unprimed-restricted, because
  the event log carries no key that could restrict it, and that both arms are therefore
  whole-corpus and comparable to each other. Remove the dotted edge from the flowchart, or relabel
  it to say that it does not constrain F4.
- **Or**, if the restriction is wanted, write the join out as a command with its tolerance and its
  tie-break fixed, the way section 4's grep is written out.

Either fix is a paragraph. What must not stand is a step that reads as mechanical and is not.

**Verified at HEAD `dbf259a`** by re-running section 4's pipeline (53 unprimed paths, all UUIDs),
by reading the field set of `fusion-workbench/orchestrator-events.jsonl`, and by reading section 6
and its flowchart.

---

Resolved: route 2 of the three the record names, extended with what route 3 asked for. Section 6 of
`circles/260821-1042-reply-bounded-whole-question-answered/analyses/260822-0035-three-before-figures-and-the-after-measurement-defined.md`
now states that the records-per-orchestrator-session arm carries **no priming restriction at all**,
that both its sides are whole-corpus and therefore compare to each other, and that the after value
will include primed sessions with an upward bias whose size is not measurable. The `C3 -.-> F4`
edge is deleted from the flowchart and `F4`'s label now reads "no priming restriction"; the
subgraph label was corrected from "each against its section-5 before value" to "each against its
stated before value", because `F4`'s before value is section 1 and never was section 5.

The join was not defined, and the report now says why rather than leaving it implicit. Nothing in
the workbench carries a transcript identifier: across the event log's 1 896 records the key set is
`ts`, `event`, `detail`, `agent`, `task`, `turn`, `verdict` and `history_file`, and
`fusion-workbench/.guard-state/events.jsonl` adds only `file` and `tool`. `history_file` is not the
missing key. It names a workbench history log rather than a transcript, and it sits on 25 of the 70
before-window session starts, first appearing on 2026-08-12 rather than tonight.

What would make the restriction possible is named in the report and it does not rescue this
comparison. The value already arrives inside fusion as the `PreToolUse` hook's `session_id`
(`hooks/guard.ts:84`), and the transcript file is that identifier plus `.jsonl`, verified by
locating this run's own transcript from its session id. Writing it onto `session_start` would key a
future window and could never key the frozen before-window, so a restricted after arm would face an
unrestrictable before arm. That is a worse comparison than the unrestricted pair, which is the
decisive reason route 2 was chosen over route 1 and not merely the cheaper one.
