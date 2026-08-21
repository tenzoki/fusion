# Coder — the corpus is measured

**Date:** 2026-08-21
**Agent:** coder
**Circle:** circles/260821-1042-reply-bounded-whole-question-answered
**Plan step:** 6 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Status:** Complete

## What this note is

The Circle's closing measurement. Every figure below is printed with the command that
produced it, taken against the working tree after steps 1 to 5 and before any commit of
steps 2 to 5. The anchor is HEAD `e764637`, the commit the plan measured from. Three
commits sit between that anchor and the current HEAD `58aae9b`, and none of them touches a
shipped surface, verified with:

```
$ git diff --stat e764637..HEAD -- rules/ stilwerk/ agents/ skills/ hooks/
(no output)
```

So an anchor-relative delta and a HEAD-relative delta are the same number for every file
measured here.

This step measures and records. It edits no rule file, no profile and no agent prompt, and
it adds no test.

## The three things a later reader must not get wrong

**The clauses land unenforced.** Steps 2, 3 and 4 changed text that an agent reads at
Setup. Nothing anywhere checks that an agent then obeys it. No hook inspects a reply, no
test reads one, and the caps in `## Length` are counted by the writer or not at all. The
plan's own head says so: the correspondence between a user's question and a draft reply is
decidable at the moment of drafting and nowhere else, because the project persists no
chat reply to check it against.

**No gate was built, and the reason is a standing decision rather than an oversight.**
`shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
is answered at option 4, and its reconciliation authorises no prose gate until its
registered measurement has run. This Circle did not run that measurement.

**Whether these clauses change a reply is not observed by this Circle, and this note is
where that is written down.** The measurement protocol is
`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`.
Both of its windows exclude any history file written by a session primed on the subject
being measured, and every session in this Circle is primed on exactly that subject: the
Directive names the register, the plan names the register, and each dispatch named it
again. A session cannot supply its own evidence under that protocol. Step 1 froze a
pre-change baseline in
`circles/260821-1042-reply-bounded-whole-question-answered/analyses/260821-2020-reply-length-baseline.md`
so that a later Circle can re-run the same command and compare, and that later Circle is
where an effect could first be seen. Nothing here claims one. A landed clause is not a
changed reply, and reading this note as evidence of a shorter reply would be reading it
backwards.

## The rule file

```
$ git show e764637:rules/user-facing-output.md | wc -c
   20144
$ wc -c < rules/user-facing-output.md
   20060
```

Net delta **−84 bytes**. The budget in
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
is net zero or less, and it is met.

## The four voice profile files

One loop, printed per file:

```
$ for f in stilwerk/chat-voice-en.yaml stilwerk/chat-voice-de.yaml \
           fusion-workbench/stilwerk/chat-voice-en.yaml fusion-workbench/stilwerk/chat-voice-de.yaml; do
    old=$(git show e764637:"$f" | wc -c | tr -d ' '); new=$(wc -c < "$f" | tr -d ' ')
    echo "$f  anchor=$old  worktree=$new  delta=$((new-old))"
  done
```

| File | At `e764637` | Now | Delta |
|---|---|---|---|
| `stilwerk/chat-voice-en.yaml` | 6 876 | 6 864 | −12 |
| `stilwerk/chat-voice-de.yaml` | 7 480 | 7 438 | −42 |
| `fusion-workbench/stilwerk/chat-voice-en.yaml` | 6 876 | 6 864 | −12 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 7 480 | 7 438 | −42 |

Each is net zero or less, so the profiles' own budget is met without drawing on the rule
file's, which is what the plan's two-budget constraint required.

The plugin copy and the workbench copy agree, and the two `default-voice-*` files were not
touched:

```
$ for p in chat-voice-en.yaml chat-voice-de.yaml default-voice-en.yaml default-voice-de.yaml; do
    diff -q stilwerk/$p fusion-workbench/stilwerk/$p && echo "identical: $p"
  done
identical: chat-voice-en.yaml
identical: chat-voice-de.yaml
identical: default-voice-en.yaml
identical: default-voice-de.yaml
```

## The always-on total, and a figure that had to be cross-checked rather than copied

Step 5 reported 94 982 bytes for an agent drawing no conditional rule. I measured it
myself rather than carrying the number across, and I got two different totals from two
commands that both have a claim to the name "always-on total". Both are printed here,
because a reader who takes one for the other will read a bound wrong.

**What the bound measures: 94 982 bytes.** `rules-emission-golden.test.ts` restricts itself
to the plugin's own `rules/` files, and its header states that the stilwerk voice profiles
are out of scope by construction, since a profile varies per consuming project and is
therefore not a property of the plugin. Summed over the five files `bin/fusion-rules coder`
emits from `rules/`:

```
$ bin/fusion-rules coder | grep '/rules/' | xargs wc -c
    3455 rules/agent-setup.md
   57114 rules/fusion-workbench-conventions.md
    4495 rules/decision-record-examples.md
   20060 rules/user-facing-output.md
    9858 rules/critical-stance.md
   94982 total
```

That agrees with step 5 exactly, and with the regenerated golden, which prints
`total 94982` in the `[coder]` block.

**What `CLAUDE.md` documents: 102 420 bytes.** `CLAUDE.md` writes the measurement as
`bin/fusion-rules coder | xargs wc -c`, and it also defines the floor as the shipped rule
text *plus* the project's chat voice profile. That command therefore includes
`./fusion-workbench/stilwerk/chat-voice-de.yaml` at 7 438 bytes:

```
$ bin/fusion-rules coder | xargs wc -c
    3455 /Users/k1/Projects/productive/fusion/rules/agent-setup.md
   57114 /Users/k1/Projects/productive/fusion/rules/fusion-workbench-conventions.md
    4495 /Users/k1/Projects/productive/fusion/rules/decision-record-examples.md
   20060 /Users/k1/Projects/productive/fusion/rules/user-facing-output.md
    9858 /Users/k1/Projects/productive/fusion/rules/critical-stance.md
    7438 ./fusion-workbench/stilwerk/chat-voice-de.yaml
  102420 total
```

94 982 is the number the floor and the budget are read against. 102 420 is what this
project's coder dispatch actually costs, profile included. Neither figure is wrong and
they are not alternatives: they count different sets, and the difference is exactly the
7 438 bytes of the German chat profile. Step 5's figure stands.

**Against the two thresholds.** The floor is `RULE_BASELINE` summed over the five universal
files in `hooks/lib/__tests__/rules-emission-golden.test.ts`, 3 513 + 52 027 + 4 291 +
16 784 + 9 958 = **86 573**, and `GROWTH_BUDGET` is 12 000, so the budget is **98 573**.

| | At `e764637` | Now | Move |
|---|---|---|---|
| Measured | 95 066 | 94 982 | −84 |
| Above the 86 573 floor | +8 493 | +8 409 | −84 |
| Head-room below the 98 573 budget | 3 507 | 3 591 | +84 |

The bound stands 84 bytes further from failing than it did at the anchor.

## The other three growth bounds

Measured sizes come from `hooks/lib/__tests__/fixtures/surface-growth.golden`, which step 2
regenerated; the floors are `AGENT_BASELINE`, `SKILL_BASELINE` and `TEST_LINE_BASELINE`
summed in `hooks/lib/__tests__/surface-growth-bound.test.ts`, and the head-rooms are the
three constants beneath them (18 000, 20 000, 2 500).

```
$ git show e764637:hooks/lib/__tests__/fixtures/surface-growth.golden | grep '^\[\|  total'
[agents bytes]
  total 416205
[skills bytes]
  total 240409
[hook-tests lines]
  total 20354
$ grep '^\[\|  total' hooks/lib/__tests__/fixtures/surface-growth.golden
[agents bytes]
  total 416205
[skills bytes]
  total 240409
[hook-tests lines]
  total 20364
```

| Surface | Unit | Floor | Budget | At `e764637` | Now | Head-room now | Moved? |
|---|---|---|---|---|---|---|---|
| `agents/*.md` | bytes | 399 843 | 417 843 | 416 205 | 416 205 | 1 638 | No |
| `skills/*/SKILL.md` | bytes | 220 439 | 240 439 | 240 409 | 240 409 | 30 | No |
| Hook tests and helpers | lines | 17 875 | 20 375 | 20 354 | 20 364 | 11 | **Yes, +10 lines** |

**The hook-test surface moved, and the plan did not expect it to.** The plan's budget table
records that surface as "not touched, and no test is added". No test was added: the ten
lines are two comment blocks in `hooks/lib/__tests__/reference-resolution-lint.test.ts`
re-approving that gate's `BASELINE` after steps 2 and 3 each added a citation to the rule
file, six lines for step 2 and four for step 3. The gate demands a written attribution for
every baseline move, so the lines are the cost of an existing gate being obeyed rather than
new test logic. It is still growth on a bounded surface, and the head-room it leaves is
**11 lines**, down from 21. Recording it is the point; nobody should have to rediscover it
from a diff.

```
$ git diff --stat e764637 -- hooks/lib/__tests__/reference-resolution-lint.test.ts
 hooks/lib/__tests__/reference-resolution-lint.test.ts | 12 +++++++++++-
 1 file changed, 11 insertions(+), 1 deletion(-)
```

Eleven insertions less one deletion is the `BASELINE` line rewritten in place plus ten new
comment lines.

## Prose metric on the rule file

```
$ bin/fusion-prose-metric rules/user-facing-output.md
file                         em-dash   words  /1000  permit  verdict
rules/user-facing-output.md        1    2634    0.4       2  ok
total (1 file)                     1    2634    0.4       2  ok
exit=0
```

One em-dash in 2 634 prose words, rate 0.4 per 1000 against a ceiling of 1 per 1000. The
tool reports and gates nothing, which is why the verdict is read here rather than in a test.

## The correction I made to another agent's log

The step 2 log,
`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2035-coder-close-the-three-routes-out-of-the-length-cap.md`,
stated in its `## Measurements` section that the hook-test surface moved to **20 363 lines**,
"the six-line attribution comment plus its blank neighbours". Both halves were wrong. The
comment block is six lines and has no blank neighbours, so the surface stood at
**20 360 lines** after step 2, not 20 363. The figure appeared twice in that file, at
line 70 and line 88, and had already propagated from there into a later dispatch prompt
before it was caught.

I corrected both occurrences in place and removed the "plus its blank neighbours" clause,
which was the source of the extra three lines. Nothing else in that log was touched: it is
another agent's record of its own run, and only the wrong number is mine to fix. The
20 364 in the table above is the current figure after step 3 added its own four lines, and
it is consistent with the corrected 20 360 rather than with the 20 363 that stood before.

## Verification

Run after this note was written, so that the workbench citation gate scanned it. That
ordering matters: `workbench-citation-lint.test.ts` recomputes its corpus from the tree on
every run, so a freshly filed record with an unresolvable citation turns the suite red, and
running the suite first would not have caught it.

```
$ cd hooks && npm test

 Test Files  40 passed (40)
      Tests  718 passed (718)
   Duration  60.98s

exit 0
```

All four growth bounds pass. Both goldens match, having been regenerated at step 2 and
left alone here. The citation gate is green at the re-approved `BASELINE`
`{ paths: 1258, anchors: 163, records: 116 }`, and it read this note.

**Verification:** `cd hooks && npm test`, exit 0.

## What the plan asked for that this note does not carry

Nothing was measured and left out. Two things the plan mentioned are recorded as
non-events rather than as figures:

- The plan's Testing Strategy assigned the golden regeneration to this step. Step 2 had
  already done it, correctly and with its own log at
  `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2108-coder-regenerate-two-golden-fixtures-after-step-2.md`,
  and step 5 left the result consistent. Regenerating again would have produced an empty
  diff, so I ran the suite without the flag and read the match.
- `RULE_BASELINE` was not touched, which is what the plan required. This Circle shrank the
  always-on corpus, and a shrink never needs a baseline to move.

## Note on profiles

`bin/fusion-rules coder` emitted the chat profile
`./fusion-workbench/stilwerk/chat-voice-de.yaml` and no writing profile, which is correct:
`coder` is not one of the prose agents. This file is a workbench artifact and follows the
project's artifact language, `en`, per `rules/fusion-workbench-conventions.md`
`## Project language`. The absence of a writing profile is noted here as
`rules/agent-setup.md` `## Voice profiles` requires, and it is expected rather than a
fault.

## Files changed by this step

- `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2147-coder-the-corpus-is-measured.md` (this file, new)
- `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2035-coder-close-the-three-routes-out-of-the-length-cap.md` (two figures corrected, nothing else)

No shipped file was touched. Nothing was staged and nothing was committed.
