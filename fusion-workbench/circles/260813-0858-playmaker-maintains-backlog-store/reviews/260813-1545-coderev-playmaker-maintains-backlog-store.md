# Code review — Circle `260813-0858-playmaker-maintains-backlog-store`, before closure

**Sender:** coderev
**Reviewed-range:** `7342fdd..2a029eb`
**Not-opened:** none
**Date:** 2026-08-13

## Summary

The Circle's delivery is sound in its mechanism and incomplete at its seam. The resolver key
lands exactly as designed, the ten no-write statements in `agents/playmaker.md` all moved,
the prose deliverable settles the case it was written for, and the suite is green at 1019
tests across 49 files. The confirmation relay in `/fusion:next` Step 5b is where the
findings are: eleven issues filed, one of them High — the "choose which" option has no
defined behaviour and the step's own "Ask, once" instruction forbids the follow-up question
it needs. Partial approval is the likely answer against the store's only entry, and the
skill cannot record it.

**Verdict: sound but not finished.** Nothing found is a correctness fault in what the change
mechanically does. The relay, which is the part the Circle closes without exercising, has
one gap that will surface on the first real run and three more that will surface quietly.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 5 |
| Low | 5 |

All eleven are filed in this Circle's issue store; the Origin Rule places them here because
each is against this Circle's own delivery. Nothing was filed shared.

## What was verified and holds

**The hazard check passes exactly.** `bin/fusion-paths` run against all five consumers:

| Consumer | `OUT_BACKLOG` | `SCAN_BACKLOG` | Expected |
|---|---|---|---|
| `playmaker` | `shared/backlog` | `shared/backlog` | both — met |
| `memo` | `shared/backlog` | — | write only — met |
| `shaper` | — | `shared/backlog` | read only — met |
| `next` | — | — | neither — met |
| `direct` | — | — | neither — met |

The `$OUT_BACKLOG`/`$SCAN_BACKLOG` trap in `skills/next/SKILL.md` was avoided: the fenced
dispatch example writes `<entry path>` placeholders throughout, and `bin/fusion-paths next`
emits `WORKBENCH`, `CIRCLE`, `SCAN_DECISIONS`, `SCAN_CIRCLES`, `PORTFOLIO`, `TASKLIST` and
nothing else.

**The prompt carries no survivor of the old boundary.** Grepped `agents/playmaker.md` for
every form of the retired statement; the only hits are the narrowed bound ("never originates
one") and the pointer at the conventions file. The frontmatter description and the body
agree in the same words, which is what the new lint holds.

**The inverted test loses no information.** `hooks/lib/__tests__/fusion-paths.test.ts:404`
drops the `OUT_BACKLOG === undefined` assertion for playmaker and replaces it with
`=== "shared/backlog"`, plus a comment that says what a green result does and does not prove.
The withheld-key half is not lost: it is still measured on `shaper` (`:405`), on `memo`, and
on the five-name case at `:388` (`coder`, `orchestrator`, `planner`, `direct`, `next`). The
commit message's claim on this point checks out.

**Suite arithmetic checks out.** 1019 tests across 49 files, matching the plan's prediction
and the commit message. Emission golden regenerated; shaper's total is 104,102 against
`RELEASE_CAP` 105,354, within the 1,252 bytes the commit message states.

**The `d6dd193` skim found nothing new.** Read `plane_curl` at HEAD. The zsh command string
is a single-quoted constant with all five variables passed through the environment, the
status code has its own temp file redirected inside the zsh string, that shell's stdout is
discarded whole, and each of the three local failure modes is named on stderr. The trailing
`[ -n "$tmpbody" ] && rm -f "$tmpbody"` is not in final position, so it leaks no status. The
EXIT-trap residual and the `map_view` mktemp are already carried by the open record
`shared/issues/260813-1051_o_an-unguarded-mktemp-in-plane-curl-…`.

## Findings by theme

### The confirmation relay — the seam

**1. The "choose which" branch has no defined behaviour.** `skills/next/SKILL.md:161` offers
three options and defines the continuation of two. "Ask, once" is bolded, which forbids the
follow-up question the third needs. The four fixed line forms exist precisely so a user can
approve one at a time, and the step that asks cannot record a subset. Step 6 of the same
skill (`:209`) specifies exactly this follow-up for its own "choose another" option; Step 5b
has no equivalent sentence. **High** — this is the case a 13-idea entry produces.
Record: `260813-1545_o_the-choose-which-branch-of-step-5b-…`

**2. The second dispatch re-appends Circle-record sections.** `agents/playmaker.md:207` tells
the second run to regenerate `$PORTFOLIO`, which is defined as a full six-section
regeneration (`:58`) and therefore re-runs Steps 3, 4 and 5 — each of which appends to Circle
records with no idempotence guard (`:182`, `:141`, `:149`). One `/fusion:next` with an
approved operation leaves two `## Activation proposal` blocks on the record it then
activates. "propose nothing further" reads as being about backlog proposals. **Medium.**
Record: `260813-1545_o_the-relays-second-dispatch-re-appends-…`

**3. `**Proposal source:**` is carried and never compared.** Both files carry the stamp
(`skills/next/SKILL.md:172`, `agents/playmaker.md:216`) and neither tells the second run to
check it against the portfolio's `**Generated:**` header. The window is the user's answer to
an `AskUserQuestion`, during which any Phase 4 dispatch or second `/fusion:next` overwrites
the portfolio in full. The instrument that would detect it exists and is inert. **Medium.**
Record: `260813-1545_o_the-proposal-source-stamp-is-carried-…`

**4. The relay reads its lines out of report prose.** `skills/next/SKILL.md:159` reads the
operations from the returned report, which has no delimiter, no verbatim obligation beyond
one clause, and a style rule pulling the other way (`agents/playmaker.md` `## Output Style` →
`rules/user-facing-output.md`). The portfolio actually on disk states its split proposal as
narrative bullets, not as `split … into: …` (`fusion-workbench/portfolio.md:155`–`186`) —
which is what the prose profile asks for and what the relay cannot parse. The skill already
holds the portfolio from Step 4 (`:139`), where the four forms are actually mandated.
**Medium.** Record: `260813-1545_o_the-relay-reads-its-operation-lines-…`

**5. The explicit form skips Step 5b silently.** `/fusion:next <circle-dirname>` jumps from
Step 3 to Step 6 (`skills/next/SKILL.md:108`); Step 5b is reachable only from Step 5's
closing line (`:151`). The behaviour is probably right; its invisibility is not. **Low.**
Record: `260813-1545_o_the-explicit-form-of-fusion-next-skips-…`

**6. The split line form cannot express a partial split.** One operation per line makes the
whole split the unit of approval (`rules/circle-records.md:128`), against an entry the last
run partitioned three ways across 13 ideas. Also: semicolon and em-dash separators inside
free-prose titles, and an option label that exceeds the four-line cap in
`rules/user-facing-output.md`. **Low.**
Record: `260813-1545_o_the-split-line-form-cannot-express-…`

### Survivors of the old boundary, outside the linted file

**7. `skills/next/SKILL.md:291`** still reads *"playmaker … writes only Circle records and
the portfolio."* The same commit edited this paragraph, adding a sentence three lines above
it. The safety conclusion the clause supports is still true, which is why nothing will
announce it. **Medium.** Record: `260813-1545_o_the-next-skills-boundaries-paragraph-…`

**8. `skills/direct/SKILL.md:77`,** the sentence step 5 corrected, acquired a new overclaim:
*"That bound holds for every consumer of the backlog except the playmaker."* It does not hold
for the shaper, which resolves `SCAN_BACKLOG` and renames plus appends into the store
(`agents/shaper.md:86`–`88`). The conventions table this commit added names the shaper as a
`_c_` writer (`rules/fusion-workbench-conventions.md:213`), so two files written in one
commit disagree. **Low.** Record: `260813-1545_o_the-corrected-sentence-in-fusion-direct-…`

**Deliberately deferred, not findings.** `README-agents.md:40` (Writes column omits the
backlog store; body says the playmaker "names duplicates" where it now merges them) and
`CLAUDE.md:51` are both carried by
`shared/issues/260813-0825_o_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
and handed to `circles/260813-0910-documentation-matches-shipped-plugin/`. `docs/working-model.md`
and `skills/help/SKILL.md` were grepped and carry no backlog claim at all — silence, not
contradiction, as the `2a029eb` commit message states. `skills/archive/SKILL.md:102`–`103`
was checked and is true through the change, as the plan predicted.

### The lint — what it does not cover

**9. The Phase 4 mandate is stated three times, and the lint holds two.**
`agents/playmaker.md:3`, `:194` and `:229` carry the identical sentence; case 2 of
`playmaker-backlog-mandate-lint.test.ts:219` compares the description against the mandate
section only, because `findMandateClauses` (`:136`) reads that section alone. A maintainer
rewording both linted surfaces together — the motion the lint's header explicitly permits
(`:45`–`:50`) — leaves `## Dispatch sources` behind, green. **Medium.**
Record: `260813-1545_o_the-phase-4-mandate-is-stated-a-third-time-…`

Two further boundaries, stated rather than filed: case 3's retired-prohibition corpus is
`agents/playmaker.md` alone, so findings 7 and 8 above are structurally invisible to it; and
the `RETIRED` pattern set is three exact pre-change wordings, so the gate reads reverts, not
newly-written contradictions. Both are inherent to a mutation-proven detector and acceptable.
The unlinted dispatch-parameter contract between the skill and the prompt is a documented
decision with sound reasoning in the plan's `## Testing Strategy`, and I agree with it — the
failure is loud.

The lint's construction is good work. Extracting the canonical clauses from the prompt's own
bullet structure rather than from sentences written into the test, and making every parser
return null into a `must()` that names itself, is the right shape. Case 3's mutation proof
against the real pre-change wording is the part most lints skip.

### The prose deliverable

**10. The bold lead says "entry" where the sentence that defines it says "idea".**
`rules/fusion-workbench-conventions.md:204`. Judged as a reader who did not write it:
**the sentence works for the case it was written for.** *"Filing is originating an idea;
maintenance is reshaping ideas the store already holds"* settles the merge cleanly — the set
of ideas is unchanged, so the merge is not filing — and `agents/playmaker.md:116` sharpens it
into a property of the text rather than a carve-out. Acceptance (a) and (c) are met.

The residual is the split. A split originates **entries**, so read literally against the bold
lead, `agents/playmaker.md:114` ("file the new entries at `_o_`") violates it. The marker
table rescues this two paragraphs down (`:211`, the `_o_` row names the playmaker "on a
split's new entries"), so the document is consistent — but the one sentence a reader was
meant to be able to quote does not settle the split case alone. One word fixes it. **Low.**
Record: `260813-1545_o_the-backlog-bounds-bold-lead-says-entry-…`

## Cross-cutting observations

**Every High and Medium finding sits on the relay, and the relay is the part with no test
and no acceptance run.** Steps 1, 2, 3, 5, 6 and 8 of the plan are each covered by a
mechanical gate — the resolver assertion, five prompt-scanning lints, the new mandate lint,
the emission golden — and I found nothing wrong with any of them. Step 4 is covered by "the
failure is loud", and the four findings against it are the ones a loud failure does not
catch: an undefined branch, a duplicated append, an inert staleness stamp, and a parse that
depends on a style rule pointing the other way. The plan's own reasoning for leaving step 4
unlinted is sound about *parameter-name drift*; it does not extend to the step's internal
completeness, which is what these four are.

**The surviving-enumeration defect recurred inside the fix.** The Circle exists because ten
statements of one boundary drifted from the capability. Two of the files the fixing commit
edited now carry an eleventh and a twelfth (`skills/next/SKILL.md:291`,
`skills/direct/SKILL.md:77`), and the new lint's corpus is one file, so neither is reachable
by the gate built to prevent exactly this. Widening the lint's retired-prohibition corpus
from `agents/playmaker.md` to the shipped prompt and skill set would catch both, cheaply.

**A statement duplicated verbatim in three places within one file is the same pattern one
level down.** `agents/playmaker.md:229` restates `:194` word for word. Deleting the
restatement in favour of a pointer, which the same section already does for its other two
dispatch sources, is preferable to teaching the lint about a third surface.

## Recommended sequencing

**Before the next real `/fusion:next` run** (these decide whether the relay works at all):

1. Finding 1 — define the "choose which" branch, or replace the three-option shape with one
   multi-select question. **High.**
2. Finding 2 — one sentence suppressing Circle-record appends on the second dispatch.
3. Finding 4 — read the operation lines from the portfolio rather than from report prose,
   and exempt those lines from the prose profiles as structured artifacts.

**Before the release that carries this Circle** (the version bump is deferred to the
documentation Circle, which is the natural moment):

4. Findings 7 and 8 — the two surviving enumerations, one sentence each.
5. Finding 9 — delete the third statement of the Phase 4 mandate, or extend the lint.
6. Finding 3 — make the `**Proposal source:**` stamp load-bearing.

**Cleanup, any time:**

7. Findings 5, 6, 10.

None of these blocks closing the Circle. Its `## Directive` names the resolver key, the five
surfaces and one named writer for the recommended-for-promotion marker, and all three are
met and verified. Step 9's deferral is recorded and is not counted as incomplete.

## Files opened

Every file in the range was opened. In addition, the seven paths the previous review
(`shared/reviews/260813-1051-coderev-plane-curl-response-via-temp-file.md`) declared
not-opened were carried forward and opened here:

| Path | Judgement |
|---|---|
| `circles/260813-0858-…/_t_circle.md` | Substantive. Read in full; the Directive, Grounding and three Turn-log entries are the authority this review measured the delivery against. No finding. |
| `circles/260813-0858-…/history/260813-1031-bugfix-circle-stash-test-locale.md` | Read. A bugfixer log for the locale-dependent test repair in `7342fdd`, already reviewed at its own commit. No finding. |
| `circles/260813-0858-…/history/260813-1036-bugfix-plane-curl-interactive-shell-noise.md` | Read. Same — the `plane_curl` repair log. Its root-cause section is accurate against `bin/fusion-plane` at HEAD. No finding. |
| `fusion-workbench/orchestrator-events.jsonl` | Read (tail, the Turn 1–3 window). Session telemetry; the three `state_drift` and one `staging_drift` entries are self-reported bookkeeping corrections, not product defects. No finding. |
| `fusion-workbench/portfolio.md` | Substantive. Read in full and it produced evidence for finding 4: its `## Backlog — ranked` section states the split proposal as narrative bullets rather than in the four fixed forms, which is what the relay would have to parse. Generated before the template change, so not itself a defect. |
| `shared/history/260813-0806-orchestrator-session.md` | Read. The session that answered the binding decision; its record of the user's four-part definition of "full maintenance" matches what shipped. No finding. |
| `shared/history/260813-0926-playmaker-direct-dispatch.md` | Read. The playmaker run that produced the portfolio above. Consistent with it. No finding. |

---

## Reconciliation annotation — 260813-1550

**Every record this review cites exists.** All ten were opened and confirmed present in
`circles/260813-0858-playmaker-maintains-backlog-store/issues/`, each carrying the `**Filed by:**
coderev` header and a severity matching its finding.

**The totals table overcounts by one.** `## Totals` reads High 1 / Medium 5 / Low 5 = 11, and
`## Summary` says "eleven issues filed". The findings section enumerates **ten**, numbered 1 to 10,
and ten records are on disk: 1 High, 5 Medium, 4 Low. The Low row should read 4 and the total 10.
The twelfth file in that store carrying a `260813-1545` stamp is
`260813-1545_o_the-deferred-version-bump-has-no-carrier-outside-the-plan-that-is-being-closed.md`,
filed by the reconciler in the same minute, and is not one of this review's findings.

**Coverage.** With this review on disk, `bin/fusion-review-coverage --since 1c2d555` moves from
`verdict=uncovered` (6 of 8 commits) to `verdict=covered`, `uncovered=0`, `carried=none`. The
session range `1c2d555..2a029eb` is fully tiled by this review (`7342fdd..2a029eb`, covers=6) and
`shared/reviews/260813-1051-coderev-plane-curl-response-via-temp-file.md` (`1c2d555..7342fdd`,
covers=2). The seven files that review left in its `**Not-opened:**` field were carried into this
one, which declares `**Not-opened:** none`.

**Findings 7 and 8 bear on the Circle's Directive**, and are read that way in the Coherence verdict
in `shared/history/260813-0806-orchestrator-session.md`: the Directive states that the five
surfaces asserting the old no-write boundary come to agree with the new one, and
`skills/next/SKILL.md:291` still asserts it.
