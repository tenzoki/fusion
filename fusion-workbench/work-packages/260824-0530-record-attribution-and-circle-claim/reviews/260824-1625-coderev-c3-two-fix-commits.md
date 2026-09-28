# C3 close-out review: the two commits that answer the Circle's high-severity findings

**Reviewed-range:** `0f5889e..3fba5c6`
**Not-opened:** none
**Filed by:** coderev
**Attribution backfilled 260825 (not written by the filing agent):** `coderev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.

`3fba5c6` is HEAD; the dispatched range was written `0f5889e..HEAD` and is resolved here per
`rules/review-contract.md`, which forbids an unresolvable endpoint. `9b1a3a5` carries no shipped
text: ten workbench records, all opened. The prior pass covers `e209011..0f5889e` and declared
`**Not-opened:** none`, so nothing is carried in.

## Summary

Both fixes do what their commit message says, and the arithmetic in the re-approval note and in the
head-room figures is correct to the byte. Three new findings, none of them a release blocker: the
filing rule's residual exit branch promises a value two of its member codes do not print, the
identity helper still has one bare, unguarded call site that the repair did not reach, and Setup's
claim branch describes a narrower case-space than its sibling in `/fusion:next`. The always-on
budget is now the binding constraint on this Circle: 431 bytes of head-room, and one of the three
findings costs some of it to fix.

## Totals

Critical 0 · High 0 · Medium 2 · Low 1

## The four claims, checked

### 1. The override citation split is clean: holds

`grep -rn Overridden agents/ rules/ skills/` returns five hits. Two are the authoring home
(`rules/circle-records.md:193` and the worked example at `:199`), two are the repaired call sites,
one is an inventory line at `skills/next/SKILL.md:262`. `agents/orchestrator.md` contains the word
zero times, confirmed by `grep -c`. So nothing moved, no third copy was written, and the two homes
are cited for what each owns:

| Clause | Home cited | Site |
|---|---|---|
| the `Overridden ` literal | `rules/circle-records.md` `### The claim field` | `skills/next/SKILL.md:207`, `skills/setup/SKILL.md:351` |
| who writes the claim, at which act, and its activation value | `agents/orchestrator.md` `## Circle head fields` | `skills/next/SKILL.md:221` |

`skills/next/SKILL.md:221` is untouched by the commit and still reads "Write the claim's activation
value from there, in the same command as the rename", which is the clause that section does own
(`agents/orchestrator.md:282-286`, the table's two claim rows). Neither file now cites the wrong home
for either clause.

### 2. The two trailing duplicates were redundant, and both branches survive: holds

Each removed token was the same `### The claim field` pointer one sentence below a fresh citation of
it. The instructions they were attached to are intact:

- `skills/next/SKILL.md:207` still ends "`Unclaimed`, an absent field, or this checkout's own
  identity is the mismatch above and is reported as one."
- `skills/setup/SKILL.md:351` still ends "`Unclaimed`, or no field, behaves as today."

Only the parenthetical citation went in each case. See the Low finding below for the case-space
difference between those two sentences, which the removal did not cause and did not close.

### 3. `### Who filed it`: disjoint, and complete in coverage only

Stated precisely, because the two halves of the question have different answers.

**Disjoint: yes.** The four outcomes key on values that cannot co-occur. Exit 1, exit 4 and "every
other code" partition the helper's six codes; the fourth branch is reached when `[ -x ]` is false, so
the helper never runs and no code is returned. No input falls in two branches.

**Complete in coverage: yes.** Every exit code has a branch and the guard-fails case has its own, so
nothing falls through.

**Complete as an instruction: no.** The residual branch says "On every other code `PERSON=` is
printed and you carry on." `bin/fusion-identity:211-223` prints neither line on exit 5, and the
usage path at `:132-135` prints nothing on exit 2. Exit 5 needs exactly exit 4's act, filing with the
person half absent, and is routed instead into a branch that tells the agent the value is there while
the same paragraph forbids composing one. So an agent on exit 5 has a branch and no executable
instruction. Filed:
`$SCAN_ISSUES/260824-1621_*_the-filing-rules-residual-branch-promises-a-person-line-that-exit-5-does-not-print.md`.

The new 127 paragraph itself is sound. It is genuinely neither exit 1 nor exit 4, it says so, it says
why the record shape matches one while the reason matches neither, and it rules out halting with the
consequence that would follow. `bin/fusion-identity` cannot answer for its own absence, so the rule
is the right home.

One residual the paragraph does not distinguish, and which costs nothing today: the branch is written
as "a helper that is not installed" and keyed on "when the guard fails". Those coincide for the case
it was written for and separate for an unset `$FUSION_PLUGIN_ROOT`, where the guard tests
`/bin/fusion-identity`. The instruction is right either way, so this is an observation, not a finding.

### 4. The re-approval note's arithmetic: holds, verified against the diff

`npx vitest run lib/__tests__/reference-resolution-lint.test.ts` passes at the new pin, which proves
the totals. The decomposition checks out per file:

| File | paths before | paths after | anchors before | anchors after |
|---|---|---|---|---|
| `skills/next/SKILL.md:207` | 3 | 2 | 0 | 0 |
| `skills/setup/SKILL.md:351` | 2 | 1 | 2 | 1 |
| `rules/fusion-workbench-conventions.md:494` | 1 | 2 | 0 | 0 |

Net paths −1 (1319 → 1318), net anchors −1 (186 → 185). The `next` anchors are zero in both columns
because both citations there are `$FUSION_SRC/`-rooted and `scanHeadingAnchors` skips a rooted
anchor, which is the known gate blindness the step-10 note records and
`shared/issues/260824-1506_*` tracks.

`records: 120` is correctly unmoved even though the note itself cites two record paths: `surface()`
in that test admits `hooks/lib/*.ts` and `hooks/*.ts` for the records class only, and
`statSync(abs).isFile()` excludes the `__tests__` directory the note lives in
(`hooks/lib/__tests__/reference-resolution-lint.test.ts:169-186`). The note is not self-counting.

The commit's head-room figures are also correct. `RULE_BASELINE`'s five core entries sum to 86 573,
budget 98 573; the golden's five core entries now sum to 98 142, head-room 431. Before the commit the
core stood at 97 392 and head-room at 1 181.

## Findings

### Medium: the residual exit branch promises a value exit 5 does not print

Detail under claim 3 above. Record:
`$SCAN_ISSUES/260824-1621_*_the-filing-rules-residual-branch-promises-a-person-line-that-exit-5-does-not-print.md`.

Worth noting where it lands: the open record
`$SCAN_ISSUES/260824-1538_*_the-claim-has-no-defined-value-when-the-identity-helper-produces-one-half-or-neither.md`
opens by asserting that `rules/fusion-workbench-conventions.md:496` handles the partial-identity case
for the person field. On exit 5 it does not. That record's scope stands; its premise needs the
correction.

### Medium: a fourth bare call of the identity helper, in `agents/orchestrator.md`

`agents/orchestrator.md:286` takes the claim's person and checkout "from `bin/fusion-identity`", with
no root, no `[ -x ]`, and no citation of the section that carries the branches. The closed record's
table listed three sites and missed this one, so the repair covered three of four. `agents/shaper.md:93`
is also bare but delegates to `### Who filed it` in the same clause, which now carries the rooted form,
so it is covered. The orchestrator's row delegates to nothing. Record:
`$SCAN_ISSUES/260824-1622_*_a-fourth-bare-call-of-the-identity-helper-sits-in-the-orchestrator-and-the-repair-did-not-reach-it.md`.

This is the cross-cutting shape of the whole Circle: five sites naming one helper, repaired one at a
time, each pass reading the line for a different property.

### Low: Setup's claim branch is narrower than `/fusion:next`'s

`skills/setup/SKILL.md:351` splits the claim read two ways and leaves `Claimed ` naming this checkout
uncovered, which is the state its own opening paragraph describes (a pointer deleted by hand).
`skills/next/SKILL.md:207` covers three cases including that one. Record:
`$SCAN_ISSUES/260824-1623_*_setups-claim-branch-leaves-a-circle-claimed-by-this-checkout-unstated-where-nexts-states-it.md`.

## The +750 bytes, and whether they were spent well

Measured: the `### Who filed it` section grew 1 073 to 1 823 bytes. The new paragraph alone is 628 of
the 750, so the section nearly doubled and the branch it adds accounts for five sixths of the cost.
Every agent pays it on every dispatch, and head-room fell 1 181 to 431.

**The branch had to be stated somewhere, and this is the only correct home.** A helper that is not
installed cannot document its own absence, and the two skill call sites bind only their own bodies
while this file binds all fifteen agents. So the decision to spend here is right.

**The amount is not proportionate, and the reason is that most of it is justification for a
transient condition.** The executable content is one sentence: when the guard fails, file with the
person half absent and say attribution was dropped. The other roughly 470 bytes explain why
`$FUSION_PLUGIN_ROOT` is the installed copy, why 127 is outside the table, how the branch differs
from exit 4 in reason while matching it in shape, and what halting would cost. That reasoning is
this project's house style and it is good reasoning. It is also reasoning about a window that closes
at the next release, after which the branch is nearly unreachable while the bytes are paid forever.

**What makes it worth flagging rather than shrugging at is the state of the budget.** At 431 bytes,
the next always-on addition of any size turns `npm test` red, and two already-open records want
always-on bytes: the `.checkout-id` tree row (+3, `260824-1538_*_the-new-layout-row-is-misaligned...`)
and the composed-address example. The exit-5 clause this review files wants roughly 40 more. None of
those is large; together with anything else they are not free. The 750 did not break anything, and it
consumed the room the Circle's own remaining fixes will ask for.

Verdict: right home, right instruction, and roughly 300 bytes more prose than the branch needs. Not
worth reverting. Worth reading as the moment the always-on budget became this Circle's binding
constraint, which no step has recorded, adjacent to
`$SCAN_ISSUES/260824-1538_*_a-fifth-budget-crossed-in-this-range-and-the-verification-step-measured-four.md`.

## Cross-cutting observations

**One helper, five citing sites, repaired one at a time.** The bare-call defect was found at
`/fusion:next` during step 10, fixed there and not carried to the rule; found in the rule at the
first review pass, fixed there and not carried to `agents/orchestrator.md`. Three passes, three
partial sweeps. A fix that names a helper should enumerate `grep -rn <helper> agents/ rules/ skills/`
before it closes.

**Two shipped gates measure citations and neither can see a wrong one.** The reference-resolution
lint proves a path and a heading resolve, never that the target carries what was cited, which is the
whole class this Circle exists to remove. The anchor half additionally skips a `$VAR/`-rooted
citation, already filed as `shared/issues/260824-1506_*`. The two high-severity findings both landed
in gate-green text.

**A re-cut split gets checked at the new branch and not at the residual.** `3fba5c6` reasoned
carefully about how its fourth outcome differs from exits 1 and 4, and did not re-read the branch it
was added beside. The residual is where an incomplete split hides.

## Recommended sequencing

Nothing here blocks the Circle's release precondition. The two claims the precondition rests on hold:
the citations point at homes that carry what they cite, and the filing rule names the helper it calls.

1. Before the next release, or with the next always-on edit: the exit-5 clause (Medium) and the
   orchestrator's call form (Medium). Both are single-clause changes and both want a bound
   re-measured afterwards.
2. Cleanup: Setup's third claim case (Low).
3. Not a fix, and it should be on the record before closure: the always-on head-room at 431 bytes,
   and which open records still want some of it.

## Attribution note

`**Filed by:**` on this file and on the three records filed today carries no person half. Following
`### Who filed it` as it now stands, `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` is false on
this machine, so the absent-helper branch applies: file with the person half absent, and report that
attribution was dropped because the helper was missing. Reported here and in chat.


---

## Reconciliation annotation — 260824-1637 (reconciler, Phase 3, HEAD `cf7a5b0`)

Findings are not rewritten here. All three are open at HEAD and each was re-checked against the tree rather than inherited. Log: `260824-1637-reconciliation.md`.

- **Exit-5 residual branch (Medium).** Confirmed by probe: outside a git work tree and outside any workbench the helper printed neither line and exited 5, while `rules/fusion-workbench-conventions.md:496` still routes every other code into "`PERSON=` is printed and you carry on".
- **Fourth bare call in `agents/orchestrator.md` (Medium).** Confirmed: `:286` unchanged, no root, no guard, no delegation. This pass carries it as the named exception on property 2 of the plan's `## Where this Circle stops`.
- **Setup's narrower claim branch (Low).** Confirmed: `skills/setup/SKILL.md:351` splits two ways, `skills/next/SKILL.md:207` three.

**This review's four verified claims were spot-checked and hold.** The override split (`grep -c Overridden agents/orchestrator.md` = 0), the surviving `Unclaimed`-or-absent branches at both sites, the disjointness of `### Who filed it`, and green `npm test` at HEAD (42 files, 732 tests).

**On the attribution note.** Independently confirmed, and it applies to this pass too. `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` is false in this checkout, while `./bin/fusion-identity` in the work tree exits 0 and prints a person. The two records this pass filed therefore carry no person half, for the same reason and under the same branch. The governing open question is part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`, which now has this measured instance in its own reconciliation note.
