Six headings were renamed in the earlier commit of the same Turn with no census, and two citations are now dead

---

`c226949` kept four em-dashes in `rules/fusion-workbench-conventions.md` because 61 citations depend
on the exact spelling of the headings that carry them, and probed each one to find out which were
gate-protected. Twenty-five minutes earlier, `b393a45` renamed **six** headings in two always-on rule
files and its record does not mention headings at all.

**The six:**

| File | Before | After |
|---|---|---|
| `rules/critical-stance.md:23` | `## 2. No premature solutions — the Research Gate` | `## 2. No premature solutions: the Research Gate` |
| `rules/critical-stance.md:47` | `## 4. A case split is disjoint and complete — or the question is cut wrong` | `## 4. A case split is disjoint and complete, or the question is cut wrong` |
| `rules/decision-record-examples.md:1` | `# Decision Record — Worked Examples` | `# Decision Record: Worked Examples` |
| `rules/decision-record-examples.md:9` | `## Example 1 — Happy path: …` | `## Example 1: Happy path: …` |
| `rules/decision-record-examples.md:71` | `## Example 2 — Supersession: …` | `## Example 2: Supersession: …` |
| `rules/decision-record-examples.md:92` | `## Example 3 — User defers: …` | `## Example 3: User defers: …` |

**Two citations point at nothing as a result**, both to `## 4.`:

- `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_c_plan-guard-misst-statt-orakelt.md:288`
  spells the heading in full, in the backticked `` `## …` `` citation form.
- `circles/260807-0923-guard-misst-statt-orakelt/history/260807-0955-coder-s8-mece-prinzip.md:11`
  quotes it in prose.

A third, `circles/260801-1244-guard-rules-write/issues/260805-1840_c_decision-examples-ueberschrift-a-s-koerper-i-s.md:1`,
cites `"Example 2 — Supersession: _a_ → _s_"`, which was already stale on its marker half. No shipped
file cites any of the six, so `reference-resolution-lint` reports nothing and its `anchors` baseline
correctly did not move.

**Why no gate saw it, stated as mechanism rather than as a probe result.**
`hooks/lib/__tests__/reference-resolution-lint.test.ts:143-190` builds its corpus from the shipped
tree only: `rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the READMEs, `CLAUDE.md`,
the `bin/` scripts and the `hooks/**/*.ts` **comment** lines. `fusion-workbench/` is not among the
roots, so a heading citation originating in a workbench record is out of scope by construction. The
sibling gate, `hooks/lib/__tests__/workbench-citation-lint.test.ts`, does read the workbench but
resolves paths, not heading anchors. That is the general exposure already filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0250_*_three-of-four-section-headings-carry-58-citations-and-no-gate-notices-when-one-is-renamed.md`;
this record is the instance that shows it firing.

**One correction to the `c226949` record while the subject is open.** Its table says of
`## Issue and Decision Filing — MANDATORY` that "no shipped file names it". `agents/planner.md:65`
cites `` `## Issue and Decision Filing` ``, a prefix of it. The conclusion is unaffected, because
`reference-resolution-lint.test.ts:848` resolves by `h === headingText || h.startsWith(headingText)`
and the prefix survives any change to the suffix, but the statement as written is false.

---
**Found by:** coderev, review gate R1 of `circles/260820-2051-style-rules-arrive-and-get-measured`,
review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0257-coderev-turn-2-the-repunctuation-and-the-repaired-step-0e.md`.
**Owner:** `coder`. Either restore the two heading spellings the workbench cites, or append a
correction to the two citing records. Both are one-line edits; which one is right is a judgement
about whether a rule file's heading or an archived record's pointer moves.
**Severity:** Medium. Nothing at runtime reads a heading. The cost is two dead pointers in the
project's own history, filed under a class the project already tracks, created by the one Turn that
was measuring itself against exactly this risk in its other commit.
**Filed in the Circle store** per the Origin Rule.
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0250_*_three-of-four-section-headings-carry-58-citations-and-no-gate-notices-when-one-is-renamed.md`
(the general exposure);
`shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`.

**Verified at HEAD `c226949`** by `grep -rn` over the whole tree for each of the six old spellings,
and by reading `surface()` at `reference-resolution-lint.test.ts:143-190` and `scanHeadingAnchors`
at `:820-858`.

**The sequencing fact that makes this worth recording rather than only fixing.** `b393a45` (02:17)
preceded `c226949` (02:42). The census discipline was invented in the second commit and never
back-applied to the first. A discipline discovered mid-Turn is not automatically retroactive, and
nothing in this Turn's process made it so.

---
Resolved: fixed — the two heading citations take the current spelling, each with a dated note; circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_*_plan-guard-misst-statt-orakelt.md:288 and circles/260807-0923-guard-misst-statt-orakelt/history/260807-0955-coder-s8-mece-prinzip.md:12
