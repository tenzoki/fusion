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
`shared/decisions/260816-0740_o_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
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
