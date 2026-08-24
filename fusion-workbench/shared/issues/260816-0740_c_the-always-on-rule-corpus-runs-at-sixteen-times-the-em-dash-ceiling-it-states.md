The always-on rule corpus runs at sixteen times the em-dash ceiling it states, so every agent is conditioned against the rule it is handed

---
`rules/user-facing-output.md:128` sets the ceiling at one em-dash per 1000 words and calls the
telegraphic-with-parentheses pattern "the single most common offender".
`fusion-workbench/stilwerk/default-voice-en.yaml:140` (AI02) states the same number.
`fusion-workbench/stilwerk/chat-voice-de.yaml:81` (AI02) bans the figure outright for chat.

The prose every agent reads at dispatch runs at 16.3 per 1000. The file that states the
ceiling runs at 14.8, and its own first sentence is the banned figure in its purest form.

---
**Found by:** analyst, measured at HEAD `787010f` on 2026-08-16.
**Owner:** `coder` for the mechanical edits; `curator` if any clause needs rewording rather
than repunctuating.
**Severity:** Medium. Nothing is broken; the effect is that agent output violates a style rule
at 8 to 24 times its stated ceiling, which is the user-visible complaint that caused the
analysis.
**Filed in the shared store** per the Origin Rule: no Circle is active and no Directive caused
this condition.
**Cross-references:** `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md`
finding 10 (the measurement and the causal inference);
`shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
(whether a gate should hold this after it is fixed);
`shared/analyses/260706-1902-user-facing-agents-garbled-language-rootcause.md` (the earlier,
different root cause for the same complaint, since fixed).

**Measured at HEAD `787010f`:**

```
rules/agent-setup.md                      533 words    15 em-dash   28.1 /1000
rules/decision-record-examples.md         554 words    17 em-dash   30.6 /1000
rules/design-diagrams.md                  794 words    20 em-dash   25.1 /1000
rules/critical-stance.md                 1587 words    29 em-dash   18.2 /1000
rules/fusion-workbench-conventions.md    8452 words   133 em-dash   15.7 /1000
rules/user-facing-output.md              2563 words    38 em-dash   14.8 /1000
CLAUDE.md                                8280 words   120 em-dash   14.4 /1000
------------------------------------------------------------------------------
total always-on context                 22763 words   372 em-dash   16.3 /1000
permitted at 1 per 1000                                23
```

Command:

```bash
w=$(wc -w < "$f"); d=$(grep -o '—' "$f" | wc -l); echo "scale=1; $d*1000/$w" | bc
```

The wider shipped corpus, same command: `rules/*.md` 16.9, `skills/*/SKILL.md` 16.0,
`agents/*.md` 15.3, `hooks/lib/__tests__/*.ts` 7.1.

**The self-violation, quoted.** `rules/user-facing-output.md:5`, the rule's first sentence:

> Every piece of output the user reads — status reports, gate prompts, `AskUserQuestion` text,
> session summaries, error messages, skill confirmations, activation banners — must be
> self-contained, plain-English, and action-first.

**Why this is a defect and not a style preference.** The rule is loaded into every agent's
context at every dispatch, and so is the corpus that contradicts it. A model writing prose
follows the register of its conditioning text more reliably than a numeric clause stated
inside that text. The measured output rates support it: agent history and review files run at
7.8 to 24.1 per 1000, above the corpus that produced them.

**Scope of the fix.** 372 em-dashes across seven files, of which some are legitimate (a genuine
dash between two independent clauses is not the banned parenthetical). The edit is
repunctuation, not rewriting: comma, colon, parentheses, or two sentences, per the rule's own
instruction at `:128`.

**This cannot trip a growth bound.** Removing a parenthetical shortens the file, and
`hooks/lib/__tests__/helpers/growth-bound.ts` measures the rate of addition only. All four
bounded surfaces would move away from their ceilings.

**Start with `rules/user-facing-output.md`.** A rule that violates its own numeric clause in
its first sentence teaches the opposite of what it says, and it is 2563 words of the 22 763.

---
Progress (2026-08-16, coder): `rules/user-facing-output.md` repunctuated. 38 em-dashes to 6,
14.1 per 1000 words to 2.2, at 91 bytes shorter. The 6 left standing are structural: 4 are
inside quoted anti-examples the file exhibits as faults (`:21`, `:33`, `:141`, `:182`) and 2 are
the code-span mentions of the character itself in the clause that states the ceiling (`:130`).
No wording changed. Normalised for punctuation and case, the token streams before and after are
identical at 2733 tokens: ten clauses that became their own sentence take a capital, and one
`see` loses one inside a merged parenthetical.

The rate quoted in the table above was 14.8 against 2563 words. The file had since grown by the
two gate bullets of `52b8665`, so the same 38 em-dashes measured 14.1 at the start of this pass.

This record stays `_o_`. The user chose the one-file scope at an orchestrator gate, so six of the
seven measured files keep their rates. Measured now, the same seven files run 22 871 words and
340 em-dashes, 14.8 per 1000 against the table's 16.3, and the words moved between the two
measurements as well as the dashes. Closing this record would claim a corpus fix that was not
performed.

---

**Reconciliation 260816-1345 (reconciler, HEAD `dd560ab`): the `_o_` marker is correct, the
progress note's corpus numbers reproduce exactly, and the set they are measured over is not the
always-on set.**

The corpus figures were re-derived independently with the record's own command rather than read
from the progress note. Every one matches:

```
rules/agent-setup.md                      533 words    15 em-dash   28.1 /1000
rules/decision-record-examples.md         554 words    17 em-dash   30.6 /1000
rules/design-diagrams.md                  794 words    20 em-dash   25.1 /1000
rules/critical-stance.md                 1587 words    29 em-dash   18.2 /1000
rules/fusion-workbench-conventions.md    8460 words   133 em-dash   15.7 /1000
rules/user-facing-output.md              2663 words     6 em-dash    2.2 /1000
CLAUDE.md                                8280 words   120 em-dash   14.4 /1000
------------------------------------------------------------------------------
                                        22871 words   340 em-dash   14.8 /1000
```

Six of the seven keep their rates; only `rules/fusion-workbench-conventions.md` moved at all, by
eight words from `b18a8cf`, and its rate is unchanged at 15.7. **Leaving this record open is
right.** 340 em-dashes stand against 23 permitted at the stated ceiling, so the corpus is at 14.8
times it and closing would claim a fix nobody performed.

**What the re-derivation did find is the set.** The table is labelled "total always-on context"
and its membership is wrong in both directions. `rules/design-diagrams.md` is a **conditional**
emission. `bin/fusion-rules:413` guards it with `if [ "$IS_DIAGRAM_AGENT" -eq 1 ]`, so it reaches
the five diagram producers and no other agent, and it is the second-worst offender in the table at
25.1. Missing from it is `fusion-workbench/stilwerk/chat-voice-de.yaml`, which `bin/fusion-rules:396`
emits unconditionally to **every** agent (882 words, 6 em-dash, 6.8 /1000). Swapping the two gives
the corpus every dispatch actually carries: **22 959 words, 326 em-dash, 14.1 per 1000**. The
conclusion is unchanged and the number a later pass will compare against is not. Filed as
`shared/issues/260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`.

**One stale figure in the record's own title.** "Sixteen times" was true of the 16.3 measured at
`787010f`. At HEAD the same seven files run 14.8 and the always-on set runs 14.1. The title is left
as filed; the numbers above are the ones to act on.

Verification: `cd hooks && npm test` at HEAD `dd560ab`, exit 0, 40 files, 764 tests.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). One file of seven was repunctuated, and the corpus figure barely moved. `rules/user-facing-output.md` now runs 6 em-dashes over 2 663 words. The other six are untouched: `agent-setup.md` 15/533, `decision-record-examples.md` 17/554, `design-diagrams.md` 20/794, `critical-stance.md` 29/1587, `fusion-workbench-conventions.md` 131/8570, `CLAUDE.md` 120/8841. The corpus stands at roughly 338 em-dashes over 23 542 words, about 14 per 1 000 against a stated ceiling of 1 per 1 000. Note also `260816-1345`, which is about this record-s own corpus table naming the wrong seven files.

---
**Correction appended 260821-0322** (coder, plan step 15 of
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`).
The two tables above keep their rows and their label; the label is retracted here rather than
edited out, because a table that says "total always-on context" over the wrong seven files is the
evidence that the set was never derived.

**Neither table is the always-on set, and no replacement table is written.** `rules/design-diagrams.md`
in both tables is **not always-on**: it is a conditional emission, guarded by
`if [ "$IS_DIAGRAM_AGENT" -eq 1 ]`, reaching the five diagram producers and no other agent. Missing
from both is this project's chat voice profile, which every agent receives. `CLAUDE.md` is in both
tables and is not emitted by any helper at all.

**State the set as its derivation instead.** It is the unindented `emit_if_exists` calls in
`bin/fusion-rules` plus the unconditional `emit_voice_profile "chat-voice" "$CHAT_LANG"` call,
resolved against the project's chat language. At HEAD `86edaac` that is `bin/fusion-rules:418-422`
and `:431`. Anyone re-measuring this record runs the derivation again rather than copying the six
filenames forward, because every hand-written copy of this set in this project has gone stale and
that is the root cause the Circle above was opened on.

**`CLAUDE.md` is always-on prose an agent holds, outside the derivation and inside the corpus.**
Claude Code loads it as project instructions, so no change to `bin/fusion-rules` can add or remove
it. Its prose was not repaired in this Circle, by
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
option 3.

**What the corrected set measures at HEAD `86edaac`**, with `bin/fusion-prose-metric`, the
authoritative counter since plan step 1 of the Circle above. It excludes fenced code, inline code
spans, block quotes and YAML example values from both the em-dash count and the word count, so its
numbers are not comparable term for term with the `wc -w` and `grep -o` figures in the tables
above. The rows below are that run's **output at that HEAD**, not a restatement of the set: the
set is the derivation two paragraphs up, and a later reader re-runs it rather than reading these
six filenames as a definition.

```
rules/agent-setup.md                            0 em-dash     488 words    0.0 /1000
rules/fusion-workbench-conventions.md           6 em-dash    7738 words    0.8 /1000
rules/decision-record-examples.md               0 em-dash     332 words    0.0 /1000
rules/user-facing-output.md                     1 em-dash    2577 words    0.4 /1000
rules/critical-stance.md                        1 em-dash    1529 words    0.7 /1000
fusion-workbench/stilwerk/chat-voice-de.yaml    0 em-dash     628 words    0.0 /1000
--------------------------------------------------------------------------------------
the six emitted files                           8 em-dash   13292 words    0.6 /1000
CLAUDE.md                                     126 em-dash    8892 words   14.2 /1000
always-on prose an agent holds                134 em-dash   22184 words    6.0 /1000
```

The title's "sixteen times" was measured over the mislabelled seven at `787010f` and has been stale
since; the emitted set now sits at 0.6 per 1000, under its stated ceiling of 1, and the prose an
agent actually holds sits at 6.0 because `CLAUDE.md` carries 126 of the 134 marks left. This record
is not closed by this note: it asks for a corpus at its ceiling, and 40 per cent of that corpus by
word count is unrepaired.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`).
**STAYS `_o_`. The emitted set is under the ceiling for the first time since this record was filed;
the corpus this record measures is not, and the difference is one file.**

Measured with `bin/fusion-prose-metric`, the authoritative counter since plan step 1 of
`circles/260820-2051-style-rules-arrive-and-get-measured`, over the set that helper derives:

```
rules/agent-setup.md                        0 em-dash    488 words   0.0 /1000  permit 0  ok
rules/fusion-workbench-conventions.md       6 em-dash   7738 words   0.8 /1000  permit 7  ok
rules/decision-record-examples.md           0 em-dash    332 words   0.0 /1000  permit 0  ok
rules/user-facing-output.md                 1 em-dash   2577 words   0.4 /1000  permit 2  ok
rules/critical-stance.md                    1 em-dash   1529 words   0.7 /1000  permit 1  ok
fusion-workbench/stilwerk/chat-voice-de.yaml 0 em-dash    628 words   0.0 /1000  permit 0  ok
total (6 files)                             8 em-dash  13292 words   0.6 /1000  permit 13 ok
```

Every one of the six is at or under its own permit, read per file, which is the reading
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-the-em-dash-ceiling-read-per-file-or-across-the-always-on-corpus.md`
chose. Against the 260817-1836 reconciliation on this record, which measured 338 em-dashes over
23 542 words at about 14 per 1000, this is the whole distance.

**Why the marker does not move.** `CLAUDE.md` carries 126 prose em-dashes over 8 892 prose words,
14.2 per 1000, and is 40 per cent of the always-on prose an agent holds and 94 per cent of the
em-dashes left in it. It was excluded by
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
option 3, answered in the user's absence and still `_o_`. `rules/design-diagrams.md` at 25.2 per
1000 is conditional, not always-on, and was never in this record's scope once the set was corrected.
Closing this record now would claim a corpus fix on a corpus whose largest untouched member is
untouched by a decision the user has not confirmed.

**And the progress note above is still uncorrected.** The `2733` token count at `:82` and the
inverted capitalisation clause beside it are the two sentences
`shared/issues/260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md`
asks to have corrected **on this record**. Plan step 16 wrote its correction onto that record instead
and said so. Both faults still read verbatim at `:82`.

---
**Correction appended 260824** (ontocoder, plan step 5 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`). This is the corrected statement for two sentences in the progress
note above (the `2733` token count and the capitalisation clause), which stand as written because the
wrong sentence is the evidence that it was wrong. **The identity, without a total:** normalised for
punctuation and case, the token streams of `rules/user-facing-output.md` before and after `6049d3e`
are identical; no word was added, removed or substituted. No count stands on its own, because seven
tokenisations return seven totals, 2 513 to 2 710, each equal on both sides, and `2733` belongs to
none of them; a total is quoted only with the tokenisation that produces it. **The capitalisation, in
the direction the evidence shows:** ten tokens gained a capital and none lost one; the `see` at `:12`
gained one, and the `see` inside the merged parenthetical at `:9` reads lowercase before and after.
Restated from the two independent passes recorded in
`shared/issues/260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md`;
no count was re-run for this note.

---
Resolved: referred — the six emitted files measure under the ceiling at HEAD and the one untouched member, `CLAUDE.md`, is held by `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`; the progress note's two faulty sentences are corrected in the note appended above; shared/issues/260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md:231
Corrected: 260824-2125 by coder — the `Resolved: referred` line above names no kind; it is `referred (decision)`, the decision being the `260820-2314_*` record it cites. Issue `circles/260824-1853-close-every-open-defect/issues/260824-2100_*_seven-backlog-referrals-close-onto-entries-that-do-not-exist-and-one-referral-names-no-kind.md`.
