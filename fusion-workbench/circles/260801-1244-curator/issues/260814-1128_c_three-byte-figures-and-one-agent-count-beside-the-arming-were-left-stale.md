Three byte figures and one agent count beside the arming were left stale while a fourth was removed

---
`5c843e6` removed one stale present-tense figure from
`hooks/lib/__tests__/rules-emission-golden.test.ts` — the drift ceiling's "33 378 bytes above
today's worst-off agent", disclosed as 292 bytes wrong — on the ground that the
`260814-0845` decision removes a count nothing asserts rather than refreshing it. Three byte
figures and one agent count in the two paragraphs immediately above it are stale in the same way
and were left standing.

---
**The four, measured at HEAD `5c843e6`.**

`rules-emission-golden.test.ts:136-142`:

> And the leanest role can spend it whole and still sit under RELEASE_CAP (89 896 + 12 000 =
> 101 896), so no consuming project pays more than origin/main already charged before the budget
> is even a question.

The leanest role is `(core only)` and stands at **86 573**, not 89 896 (measured:
`3 513 + 52 027 + 4 291 + 16 784 + 9 958`, and the same figure the arming wrote into
`RULE_BASELINE`). The conclusion still holds — 86 573 + 12 000 = 98 573, under the cap — so the
sentence is not wrong, only its number is.

`rules-emission-golden.test.ts:154-157`:

> after the cut the agents no longer carry the same load: they range from 89 896 to 111 766 bytes.
> A single figure has to sit at the maximum, so it would grant the five leanest agents 21 870
> bytes of silent head-room and call that compliance.

Three claims, all stale:

| Claim | Measured at `5c843e6` | How |
|---|---|---|
| range 89 896 to 111 766 | 86 573 to 111 474 | `fixtures/rules-emission.golden`, per-agent totals |
| 21 870 bytes of silent head-room | 24 901 | the difference of the two above |
| "the five leanest agents" | nine | `bin/fusion-rules <agent>` for all seventeen; the `(core only)` role holds bugfixer, coder, coderev, consultant, curator, editor, ontocoder, ontorev, reconciler |

The agent count is the sharpest of the four: it went stale inside this Circle, when
`agents/curator.md` landed in Turn 1 and joined the `(core only)` role, and it is exactly the
class the `260814-0845` decision was filed to settle.

**Why this is one finding rather than four.** The same commit applied the decision to a figure the
plan did not name, four lines below, and did not apply it fifteen lines above. That inconsistency
is what makes the residue worth filing; each figure on its own is cosmetic.

**Honest note on the line the executor drew.** The removed figure said "today's", which made it an
unambiguous present-tense falsehood. The two paragraphs here open with "after the cut", which can
be read as anchoring them to 2026-08-05, and on that reading they are historical statements and
correct. The reading is strained for "they range from" and "would grant … five leanest agents",
both of which are present tense and are used to justify a present design choice, but it is a
defensible line and the executor is not accused of missing something obvious.

**Candidate fix.** Same treatment as the figure that went: remove the numbers where the sentence
does not need them ("the leanest role can spend it whole and still sit under RELEASE_CAP"; "a
single figure has to sit at the maximum, so it would grant the leanest agents thousands of bytes
of silent head-room"), or anchor the paragraph explicitly to 2026-08-05 the way the cut log
entries are. Do not refresh them in place; that buys the same defect again at the next agent.

**Note on the cost of the fix.** Both paragraphs are inside a file the hard bound does not measure
(`hooks/`, not `rules/`), so editing them moves no baseline and costs no regeneration.

**Scope.** `hooks/lib/__tests__/rules-emission-golden.test.ts`, comment prose only. Executor:
`coder`.

**Filed by:** coderev, review `260814-1128-coderev-curator-turn-2.md`.

---
Resolved: All four figures removed rather than refreshed, per decision `260814-0845` and the record's own candidate fix — none of the four is a claim any parser re-derives, so refreshing them would buy the same defect back at the next agent. `rules-emission-golden.test.ts:139-142` now reads "the leanest role can spend it whole and still sit under RELEASE_CAP, so no consuming project pays more than origin/main already charged", dropping `(89 896 + 12 000 = 101 896)`; the claim it makes is still true on the armed baseline (86 573 + 12 000 = 98 573, under 105 354) and now says so without a number that ages. `:154-157` now reads "because after the cut the agents no longer carry the same load. A single figure has to sit at the maximum, so it would grant the leanest agents thousands of bytes of silent head-room and call that compliance" — the range, the head-room figure and "the five leanest agents" are all gone, the last being the count that went stale inside this Circle when `agents/curator.md` joined the `(core only)` role. The cut log's own occurrences of the same digits at `:364`, `:371` and `:381` were left untouched: they are historical measurements of past fleets, which the decision's constraints put out of scope. Comment prose only, in a file under `hooks/` that the hard bound does not measure, so no baseline moved and no golden regeneration was needed. `cd hooks && npm test` exit 0.
