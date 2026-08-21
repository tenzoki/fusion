# Analysis: the pre-change reply-length baseline, frozen

**Date:** 2026-08-21 20:20
**Type:** Document Study
**Status:** Complete
**Requested by:** orchestrator, for step 1 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`

## Question

Which command reproduces the reply-length figures this Circle's Grounding states, what does that
command return over a closed corpus at HEAD `da88e68`, and what may a later re-run of it be
compared against? The Circle is about to rewrite `rules/user-facing-output.md` `## Length`. Once
that edit lands, the pre-change state of agent replies survives only in whatever is written down
first, and no command anywhere reproduced the Grounding's figures.

## Scope

The object of study is the Claude Code session transcript corpus for this project, at
`~/.claude/projects/-Users-k1-Projects-productive-fusion/*.jsonl`, one JSON record per line. The
report fixes a counting command, a corpus, a window boundary, three readings of the same corpus,
and the full frequency distribution of reply lengths.

Out of scope: any judgement about whether the rule change this Circle will make improves anything.

**This document is a frozen reading of the current state and it is not a gate.** No test, hook or
check reads it, none may be built from it, and a later re-run of the command that returns a worse
number is not a failure of anything.

**It does not amend and does not run the prose register measurement protocol.** That protocol,
`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`,
was read for this step and left untouched. It measures em-dash rate over session history files, and
its two windows both exclude any history file written by a session primed on the subject being
measured. Every session in this Circle is so primed. The measurement below is a different quantity
over a different corpus and it satisfies no part of that protocol's registration.

**Reading the transcripts is authorised** by
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_may-an-agent-read-the-session-transcripts-as-a-source-of-evidence.md`,
answered at option 1, evidence including verbatim quotation. This report quotes six one-line agent
narrations and no user prompt.

**HEAD.** The plan names `e764637` for this step. HEAD is `da88e68`, three commits later. All three
write only into `fusion-workbench/`: `git diff --name-only e764637..da88e68 | grep -E
'^(rules|agents|skills|stilwerk)/'` returns nothing, and `rules/user-facing-output.md` is byte
identical across the range. The baseline is therefore the same reading at either commit.

## Findings

### 1. The command

A user-facing reply is an `assistant` record that is not a sidechain and carries a `text` content
block. Its length is the number of newline-separated lines in that block. Both definitions are the
Circle's Grounding, and section 6 below verifies that this command reproduces the Grounding's
figures exactly.

```sh
DIR=~/.claude/projects/-Users-k1-Projects-productive-fusion
CUT=2026-08-21T10:16:31Z

jq -r --arg cut "$CUT" '
  select(.type == "assistant" and (.isSidechain != true))
  | select(.timestamp < $cut)
  | .message.content[]?
  | select(.type == "text")
  | (.text | split("\n") | length)
' "$DIR"/*.jsonl \
| LC_ALL=C awk '{ n++; if ($1 > 12) o++; if ($1 > 1) m++ }
    END { printf "blocks=%d over12=%d share=%.1f%% multiline=%d share_multiline=%.1f%%\n",
                 n, o, 100*o/n, m, 100*o/m }'
```

Three details are load-bearing rather than incidental. `LC_ALL=C` fixes the decimal separator,
which this machine's locale otherwise renders as a comma. The cutoff is compared as a string, which
is valid because every `timestamp` field is an ISO 8601 instant in UTC with a fixed width. The
`?` on `.message.content[]?` is what lets records without a content array pass without error.

Nothing was added to `bin/` for this. The command is written here and nowhere else, because a
helper script would be a shipped surface and this Circle's stated method is to add nothing there.

The frequency table in section 4 comes from the same pipeline with the `awk` stage replaced by
`sort -n | uniq -c | awk '{printf "%s:%s ", $2, $1}'`.

### 2. The corpus

| Property | Value |
|---|---|
| Directory | `~/.claude/projects/-Users-k1-Projects-productive-fusion/` |
| Files present at measurement | 70 `.jsonl` |
| Files contributing at least one in-window reply | 68 |
| `ls *.jsonl \| sort \| shasum -a 256` | `191c2692de56b47ee842a94d24a82c90baf6d4006f63bf4a71d4cb23938d4b51` |
| Window opens | `2026-08-01T20:12:01.949Z`, the earliest reply in the corpus |
| Window closes | `2026-08-21T10:16:31Z`, exclusive |
| Last reply inside the window | `2026-08-21T10:14:31.196Z` |

The closing instant is the first record of transcript `4b794a75-a0d0-41aa-a4f7-29f727ced4af.jsonl`,
the session that activated this Circle and ran this step. The boundary is chosen there for one
reason: every reply written by a session executing this Circle falls outside it, so the baseline
carries none of the writing this Circle's own subject primes. That session had written 54 further
top-level replies by the time of measurement, four of them over the cap, and none of the 54 is in
any figure below.

The window is closed and cannot grow. No session will write a record timestamped before an instant
already past, so a re-run of the command in six months returns the same numbers, provided the
transcript files still exist.

**They are not under version control and this repository cannot protect them.** They sit in the
user's home directory, they hold the user's own prompts, and Claude Code may prune them. The
frequency table in section 4 is embedded in this report for that reason: it reconstructs every
figure here without the corpus, and it contains no prompt text.

### 3. The figures

Three readings of one corpus. All three were produced by running the commands, not derived from
each other.

| Reading | Unit | Units | Over 12 lines | Share |
|---|---|---|---|---|
| A. Every text block | one `text` block | 2 236 | 400 | 17.9 % |
| B. Multi-line blocks only | one `text` block of more than one line | 856 | 400 | 46.7 % |
| C. Visible text per human prompt | all blocks between two human prompts | 281 | 232 | 82.6 % |

Reading A is the Grounding's unit and reproduces it. Reading B is reading A with the one-line
narration removed from the denominator. Reading C sums every block an agent wrote between one human
prompt and the next, and its mean is 47.2 lines with a median of 26.

The command for reading C differs from the one above, so it is written out here:

```sh
DIR=~/.claude/projects/-Users-k1-Projects-productive-fusion
CUT=2026-08-21T10:16:31Z

for f in "$DIR"/*.jsonl; do
  jq -r --arg cut "$CUT" '
    select(.isSidechain != true) | select(.timestamp < $cut)
    | if (.type == "user" and .origin.kind == "human") then "U"
      elif .type == "assistant" then
        ((.message.content // []) | map(select(.type == "text"))
         | map(.text | split("\n") | length) | add // empty | "T \(.)")
      else empty end' "$f"
  echo "U"
done | LC_ALL=C awk '$1=="U" { if (cur > 0) { n++; if (cur > 12) o++; s += cur }; cur = 0; next }
                     { cur += $2 }
                     END { if (cur > 0) { n++; if (cur > 12) o++; s += cur }
                           printf "turns=%d over12=%d share=%.1f%% mean=%.1f\n", n, o, 100*o/n, s/n }'
```

The cap the three readings are measured against is `rules/user-facing-output.md:114`, *"Chat reply
default: ≤ 12 lines."* That line is the only source of the number. Both chat voice profiles were
checked and neither states a line cap any more: `stilwerk/chat-voice-de.yaml` C04 defers to the rule
by name, and the shipped and workbench copies are byte identical under `diff -q`. The contradiction
recorded in `shared/issues/260816-1330_o_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`
does not reach this measurement, because no profile competes with the rule for the number.

### 4. The distribution

Reading A, all 2 236 blocks, as `lines:count` pairs.

```
1:1380  3:83  5:52  6:2  7:75  8:5  9:109  10:12  11:99  12:19  13:54  14:21  15:44
16:24  17:27  18:28  19:25  20:27  21:19  22:18  23:13  24:15  25:10  26:13  27:10
28:12  29:6  30:1  31:4  32:2  33:2  35:2  36:2  38:5  42:1  43:3  44:1  45:2  46:3
48:1  49:1  58:1  71:1  88:1  154:1
```

Mean 5.9, median 1, 75th percentile 9, 90th percentile 18, 95th percentile 23, 99th percentile 35,
maximum 154.

Two structural facts fall out of the table and both matter for how the figures are read.

**No block is exactly two lines, and 1 380 blocks are exactly one.** The corpus splits cleanly into
one-line narration between tool calls and paragraph-structured prose. There is no intermediate
form. Six of the one-line blocks, sampled at a fixed stride:

> Du hast die Review abgebrochen. Ich sehe nach, ob sie etwas hinterlassen hat.
>
> Der Shaper-Durchgang ist nicht Teil von `/fusion:next`, ich starte ihn als eigenen Schritt.
>
> Freigegeben. Ich markiere den Plan als in Arbeit und starte mit der Testseite.
>
> Alle drei sind zurück. Jetzt die Zusammenführung.
>
> Ich hatte es falsch zusammengefasst. Das eigentliche Ziel steht in der Spec.
>
> Beide Befunde bestätigt.

**Odd lengths dominate the multi-line half.** At every value from 3 to 21 the odd bucket is larger
than each of its even neighbours, often by a factor of five. A markdown reply of *n* paragraphs
separated by blank lines occupies 2*n*−1 lines, so the odd bias is the signature of paragraph
structure. It confirms that the multi-line half of reading A is prose written for a reader and not
an artifact of the format.

### 5. What each figure licenses, and what it does not

**Reading A, 17.9 %, is a floor and not an estimate.** The denominator counts the 1 380 one-line
narrations, which are not the surface `## Length` governs and which cannot exceed a 12-line cap.
The Grounding said this and did not say by how much the figure understates. Reading B answers that:
with one-line narration removed the share is 46.7 %.

**Reading B, 46.7 %, is the sharpest defensible figure and it still carries one bias.** The
denominator is every block of more than one line, which includes short structured output such as a
three-line table or a two-item list that is not a reply in the sense `## Length` means. That bias
runs in the same direction as reading A's, so 46.7 % is also a floor rather than a point estimate.

**Reading C, 82.6 %, is the weakest of the three and it is reported because it is the only one that
matches what the user sees.** Its unit is all visible text between two human prompts. In fusion an
unattended run of many Turns sits under a single human prompt, so one unit can span an hour of work
and forty separate narrations. Reading C therefore measures the total volume of a work session, not
the length of a reply, and it must not be quoted as the share of over-long replies. What it does
establish is that a human prompt in this project has produced a median of 26 lines of agent text,
against a rule that caps a reply at 12.

**The line count is of source newlines, not of rendered terminal lines.** A single long paragraph
that wraps to six lines on screen counts as one. This is the correct reading of the rule rather
than a compromise: `rules/user-facing-output.md:117` tells the writer to count the lines before
sending, and what a writer can count is the source. The bias runs against the over-cap figures,
which is the conservative direction.

**None of the three figures licenses a claim about register.** They measure length. The enumeration
rhythm, the restated claim and the self-report at the length of the work that this Circle's
Directive names are not counted by anything here, and no figure below should be offered as evidence
about them.

### 6. The Grounding reproduces exactly, verified by running it

The Grounding states four things about the transcripts. All four were re-derived, and three of the
four are per-session sequences specific enough that agreement is not coincidence.

| Grounding claim | Reproduced | How |
|---|---|---|
| 69 transcripts, 2 231 replies, 398 over the cap | yes, exactly | the section 1 command with `CUT=2026-08-21T08:47:00Z`, which is the shaper's own run stamp `260821-1047` in local time, over the 69 files that existed then |
| the session ending 2026-08-20 20:40 wrote six replies of 23, 26, 38, 36, 31 and 45 lines | yes, exactly | `11fe8a84-d631-431f-aaad-52f57dc45895.jsonl` returns `23 26 38 36 31 45` |
| the session ending 2026-08-20 21:01 wrote three, one of them 19 lines | yes, exactly | `0ae1fd28-1855-44e4-9eb4-9bdb8b316965.jsonl` returns `1 1 19` |
| the session that filed this Circle wrote three, of 44, 15 and 17 lines | yes, exactly | `2db8a70a-26ec-424f-86a1-9e05c5758825.jsonl` returns `44 15 17` |

The gap between the shaper's 2 231 and this report's 2 236 over the same 69 files is fully
accounted for. Five replies were written into those files after the shaper measured and before this
step ran, at 08:49:37, 09:08:24, 09:11:26, 09:11:59 and 10:14:31 UTC. Two of the five exceed twelve
lines, which accounts for 398 against 400. Nothing was lost, reinterpreted or rounded.

This is the strongest statement this report can make about its own command: it is not a plausible
reconstruction of what the shaper ran, it is the same measurement, confirmed against four
independent outputs of it.

### 7. Calibration

**Verified by running it**, with the command in section 1 or the variants named beside each figure:
every number in sections 2, 3, 4 and 6. The corpus properties, the three readings, the frequency
table, the percentiles, the absence of two-line blocks, the four Grounding reproductions, the five
late records that explain the difference, the six quoted narrations, the byte identity of the two
chat profiles, and the emptiness of the shipped-surface diff between `e764637` and `da88e68`.

**Inference**, reasoned from what was verified but not itself measured: that the odd-length bias is
caused by blank lines between markdown paragraphs. The arithmetic fits every bucket from 3 to 21 and
no competing mechanism suggests itself, but no reply was parsed to confirm its paragraph count.

**Inference**, second: that reading B's residual bias runs in the same direction as reading A's.
Short structured output is a subset of multi-line blocks and cannot exceed the cap, so it can only
dilute the numerator's share. This follows from the definition rather than from a count of how many
such blocks there are.

**Speculation**, and marked as such because a later Circle might otherwise treat it as a finding:
that reading C's 82.6 % would fall sharply if unattended multi-Turn runs were excluded. No attempt
was made to identify which of the 281 units are unattended runs, and the transcripts carry no field
that decides it.

**Not established at all:** any relationship between these figures and the rule text. The corpus was
written by agents that loaded `rules/user-facing-output.md` on every dispatch, so the rule was
present and the replies were over the cap. Whether the rule was read, ignored, obeyed and then
overridden, or defeated by the relocation clause the plan identifies is not decidable from a line
count, and this report claims nothing about it.

## Implications

The pre-change state is now recoverable from one command over a closed window, which it was not
before this step. A later Circle re-running the section 1 command over a window opened after the
rule change gets a number of the same kind and can put the two side by side.

That comparison will not be an experiment and should not be written up as one. Nothing here controls
for what else changes between the two windows: the agents' models, the tasks, the mix of interactive
and unattended sessions, and the priming effect of working on reply length at all. The honest use of
this baseline is as a description of what came before, against which a later description can be
read.

One figure is worth carrying forward on its own. Among replies that are prose rather than narration,
close to half exceed the cap that is loaded into the writer producing them. That is the condition
the plan's step 2 addresses, and it is now a measured condition rather than an asserted one.

## Recommendations

1. A later Circle that wants the after-reading runs the section 1 command unchanged, with `CUT` set
   to an instant after the rule change lands, and adds a lower bound so the window opens after it
   as well. Report reading A and reading B together. Reading A alone understates by a factor of
   about two and a half, and reading A was what the Grounding had.
2. Do not build a check, a hook or a test from anything in this document. `shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
   forbids a prose gate until its own registered measurement runs, and this is not that measurement.
3. Whoever writes the after-reading states in the same document that the corpus is outside version
   control and embeds its own frequency table, for the same reason section 2 gives.

## Filed Issues

None. The gap this step closes, that the Grounding's figures had no reproducible command behind
them, is closed by this report rather than tracked, and no defect was found in any file read.

## Sources

- `~/.claude/projects/-Users-k1-Projects-productive-fusion/*.jsonl`, 70 files, read through `jq` only
- `circles/260821-1042-reply-bounded-whole-question-answered/_t_circle.md`, `## Grounding snapshot`
- `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`, step 1
- `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-1047-shaper-reply-bounded-whole-question-answered.md`, `## What was measured rather than carried over`
- `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_may-an-agent-read-the-session-transcripts-as-a-source-of-evidence.md`
- `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`, read and not amended
- `shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
- `rules/user-facing-output.md:110`, `:113`, `:114`, `:117`
- `stilwerk/chat-voice-de.yaml` and `fusion-workbench/stilwerk/chat-voice-de.yaml`, C04
- `shared/issues/260816-1330_o_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`

## Open Questions

- [ ] Reading C's unit spans a whole unattended run. Whether a "reply" for the purpose of
      `## Length` is one text block or all text between two human prompts is a question the rule
      does not answer, and this report reports both rather than choosing. It bears directly on step
      2, because a cap on the block leaves the run unbounded in exactly the way the Circle says the
      Details clause leaves a reply unbounded.
- [ ] Whether the after-reading's window should exclude sessions primed on this Circle's subject, as
      the prose register protocol excludes them from its own windows. Not decided here, because
      deciding it would amount to registering a protocol, which this step is not authorised to do.
