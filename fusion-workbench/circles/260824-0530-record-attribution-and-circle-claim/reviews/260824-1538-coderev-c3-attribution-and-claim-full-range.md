# Code review — C3, attribution on records and a claim on the Circle

**Reviewed-range:** `e209011..0f5889e`
**Not-opened:** none
**Sender:** coderev
**Reviewed:** 2026-08-24
**Circle:** `circles/260824-0530-record-attribution-and-circle-claim`
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## Summary

The Circle's mechanism is sound and its one new executable, `bin/fusion-identity`, is the best-argued
file in the range: the exit table tiles a 2x2 of two independent facts, exit 1 provably leaves no
trace, and the mint is an `O_EXCL` create so a race produces one identifier. Eleven defects were
filed, none of them in that helper's logic. The two that matter most are both citation faults in the
prose layer the Circle spent most of its steps on: the claim's override sentence is written at two
call sites that cite a section which does not define it, and the universal filing obligation names
the identity helper with a path that does not resolve from a consuming project and no branch for the
helper being absent, which is the state of every install that has not updated.

Seven of the eight properties in the plan's `## Where this Circle stops` hold. One reads false as
written, and two of the seven hold with a named exception.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 5 |
| Low | 4 |

All eleven are filed as separate records. Nine to this Circle's issue store, two to `shared/` under
the Origin Rule, because `0db1fbb` landed before the Circle was captured and its subject is not this
Circle's Directive.

## Verification performed

- `cd hooks && npm test` at `0f5889e`: **42 files, 732 tests, exit 0.** The count `9efe19f` and step
  11 both report.
- The four blocking growth bounds: pass. `git diff --stat e209011..HEAD` over
  `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` is **empty**, so no baseline map
  moved.
- `bin/fusion-identity` driven by hand against temporary trees for exits 0, 1, 3, 4, 5, the
  malformed-`.checkout-id` branch, and a `PATH` with no `git`.
- `bin/fusion-review-coverage --since e209011` before this file: `commits=15 reviews=0 uncovered=15
  carried=(not recorded)`.
- The identity used for every `**Filed by:**` here comes from `./bin/fusion-identity`, the **work-tree
  copy**. `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` is false on this machine — the installed
  plugin predates this Circle — and that measurement is itself finding 2 below.

## Findings by theme

### Theme 1 — A citation that resolves and does not carry what was cited

**Finding 1 (High). Both override call sites cite a section that does not define the sentence they
must write.** `skills/next/SKILL.md:207` and `skills/setup/SKILL.md:351` say to write the claim's
`Overridden ` sentence "per `agents/orchestrator.md` `## Circle head fields`". That section
(`agents/orchestrator.md:258-305`) defines two claim rows, the `Claimed ` form at activation and
`Unclaimed` at the terminal rename, and states beneath the table that "**The two rows and this
paragraph are the authoring home for both performers.**" `grep -rn Overridden agents/` returns
nothing. The form is authored in `rules/circle-records.md:191-199`.

The two paths concerned are the only paths on which two identities ever land in one record, which is
the whole point of the override. No gate can see it: `reference-resolution-lint` resolves the file
token and the heading token, and both exist. Record:
`circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1538_*_both-override-call-sites-cite-a-section-that-does-not-define-the-sentence-they-must-write.md`.

**Finding 2 (High). The filing rule names the identity helper with no root, no guard, and no branch
for its absence.** `rules/fusion-workbench-conventions.md:494` `### Who filed it` is always-on for
all fifteen agents and writes a bare `bin/fusion-identity`. Every other helper call in that same file
is `"$FUSION_PLUGIN_ROOT/bin/<helper>"` (`### Where the call belongs`), and the Circle's two other new
call sites both guard with `[ -x ]` (`skills/setup/SKILL.md:340`, `skills/next/SKILL.md:207`).

The rule branches on exits 1, 4 and "every other code". Exit 127 is none of those, and 127 is what a
consuming project gets today. The same paragraph forbids the two escapes an agent would otherwise
take — "compose no value and substitute none". The condition was measured at the `/fusion:next` site
during step 10 (`history/260824-1502-…:52-53`) and the measurement did not reach the rule. Record:
`…/issues/260824-1538_*_the-filing-rule-names-the-identity-helper-with-no-root-no-guard-and-no-branch-for-its-absence.md`.

### Theme 2 — A case split that stops one branch short

**Finding 3 (Medium). The claim has no defined value when the helper produces one half or neither.**
`rules/circle-records.md:187` fixes the form as `Claimed YYMMDD-HHMM: <person>, checkout <id>.` and
`agents/orchestrator.md:286` says both halves come from `bin/fusion-identity`. Exits 3, 4 and 5 print
one line or none. `### Who filed it` closes exactly this gap for `**Filed by:**` and nothing does it
for the claim.

Exit 4 is the case that bites: `bin/fusion-identity:53-58` states that fusion supports a non-git
project deliberately and in shipped code, and cites the decision that made it so. Such a user can
activate a Circle, and the field then has a slot with nothing to put in it. The read side has the
same hole — `skills/next/SKILL.md:207` compares against "this checkout's own identity" with no branch
for there being none. `rules/critical-stance.md` §4 is the standard this misses. Record:
`…/issues/260824-1538_*_the-claim-has-no-defined-value-when-the-identity-helper-produces-one-half-or-neither.md`.

**Finding 8 (Low). The helper's exit-4 message names a cause it never established.**
`bin/fusion-identity:144` is one `&&` chain over two independent facts and its `else` at `:162`
asserts the second one. Verified by probe: inside a tree with `git` unreachable the script prints
"not a git work tree" and exits 4, so a record is filed unattributed in a project where an identity
*is* owed. The file's own header commits to the opposite rule for exit 3 at `:79-89` — "names an
outcome, never a cause" — and argues at `:42-51` that 1 and 4 must stay separate; an unverified cause
routed into 4 rejoins them from the other side. Record:
`…/issues/260824-1538_*_the-identity-helpers-exit-4-message-names-a-cause-it-never-established.md`.

### Theme 3 — A measurement whose product reaches nobody

**Finding 4 (Medium). A fifth budget crossed in this range and step 11 measured four.**
`rules/circle-records.md` went 20 172 -> 22 798 bytes. The role rule-text report in
`rules-emission-golden.test.ts` now fires for `playmaker` (22 798 against 21 302) and `shaper`
(27 632 against 26 975); subtracting the +2 626 delta puts both under before the range. The plan's
risk table charges step 6 to the always-on core, but `circle-records.md` is a conditional emission to
three agents, so it is charged to the role budget instead — a fifth instrument in a fifth file that no
step measured. It reports and does not block, so nothing is red; what is lost is the moment somebody
is told a cleanup is due. Record:
`…/issues/260824-1538_*_a-fifth-budget-crossed-in-this-range-and-the-verification-step-measured-four.md`.

**Finding 5 (Medium). A lint asserts the orchestrator must use the tool the prompt now bans.**
`hooks/lib/__tests__/turn-budget-lint.test.ts:449-453` requires `agents/orchestrator.md` to contain
"AskUserQuestion", with the message "must put the question through AskUserQuestion, the way every
other human gate in this prompt reaches the user". `0db1fbb` banned the tool absolutely at `:29` and
rewrote that gate to ask in chat at `:685`. The assertion passes on the two surviving occurrences:
the ban sentence and the frontmatter allowlist.

The tripwire now points the wrong way. Removing the allowlist grant leaves one occurrence and the
suite stays green; rewording the ban to drop the literal token turns it red for a change that
strengthens the policy the lint serves. Filed to `shared/`:
`shared/issues/260824-1538_*_a-lint-asserts-the-orchestrator-must-use-the-tool-the-prompt-now-bans-and-passes-on-the-ban-itself.md`.

**Finding 6 (Medium). Two design forks from the dialog ban were recorded only in a history log.**
`shared/history/260824-0443-…:38-53` argues both forks and closes "Both were put back to the user in
chat." No decision record exists. `## Issue and Decision Filing — MANDATORY` requires one and names a
history log among the places they must not live.

**They were already lost once, inside this range.** Two commits after the ban, this Circle added two
new mandated `AskUserQuestion` uses to the very surface the second fork is about
(`skills/next/SKILL.md:207`, `skills/setup/SKILL.md:351`), with nothing on disk for their author to
read. The history file's count of five skill bodies is also wrong: nine carry the tool. Filed to
`shared/`:
`shared/issues/260824-1538_*_two-design-forks-from-the-dialog-ban-were-put-to-the-user-in-chat-and-recorded-only-in-a-history-log.md`.

### Theme 4 — An exhibit that fails the rule it exhibits

**Finding 7 (Medium). An always-on rule file's worked example carries a real address, composed by
hand.** `rules/decision-record-examples.md:20` reads `**Filed by:** shaper, Kai Stalmann
<kai@qantr.com>`. That file is one of the five always-on rules, so the address is loaded into every
agent run of every consuming project and ships in the tarball. Its sibling example four commits later
(`rules/circle-records.md:199`) uses `ada@example.com` and `alan@example.com`.

And the address is not the one the helper prints here: `./bin/fusion-identity` gives
`PERSON=Kai Stalmann <ks@qantr.com>`, and every commit in the range is authored by `ks@qantr.com`. So
the exhibit was composed, which is what the rule it illustrates forbids in the sentence directly under
it. An example is what a model copies when it cannot obtain the real thing, and finding 2 says it
cannot. Record:
`…/issues/260824-1538_*_an-always-on-rule-files-worked-example-carries-a-real-address-composed-by-hand.md`.

### Theme 5 — Coverage and residue

**Finding 9 (Low). The checkout identifier is never overwritten and no test holds that property.**
`bin/fusion-identity:197-202` refuses to rewrite a malformed `.checkout-id`, and the header at
`:91-94` calls that the property whose loss would hand two checkouts one history. The test file drives
all six exits and mint-once and names one deliberate omission, the concurrent mint; this branch is not
named, so its absence reads as coverage. Verified live by probe: exit 5, file byte-identical. Record:
`…/issues/260824-1538_*_the-checkout-identifier-is-never-overwritten-and-no-test-holds-that-property.md`.

**Finding 10 (Low). The plan's stopping clause names one cut and two landed.** `8092c11` cut 44 lines
from three hook test files because the surface stood at 20 375 against a budget of 20 375. That is
exactly what the plan's risk table asks for, in a commit that names the cut, and the clause was not
amended. Record:
`…/issues/260824-1538_*_the-plans-stopping-clause-names-one-cut-and-two-landed.md`.

**Finding 11 (Low). The new layout row is misaligned and a cut left a line holding one space.**
`rules/fusion-workbench-conventions.md:55` puts its comment at column 43 where six neighbours sit at
46, inside a fenced diagram in an always-on file. `skills/setup/SKILL.md:467` holds a single space.
Record:
`…/issues/260824-1538_*_the-new-layout-row-is-misaligned-and-a-cut-left-a-line-holding-one-space.md`.

## The two cuts, checked against their own claims

Both claims hold, and both were checked rather than taken.

`8092c11`, the hook tests. The three hunks remove comment blocks alone: an inventory of removed test
cases in `guard-bash-integration.test.ts`, a paragraph in `helpers/guard-harness.ts` about a
stand-down deleted on 2026-08-16, and the Round 1 / Round 2 narrative in `domain-cascade.test.ts`. No
`expect`, no fixture value, no test name, no setup or teardown line moves. The suite reports 732 tests
at `0f5889e`, the figure the commit states for both sides of the cut.

`5b88eb9`, the setup skill. The largest single deletion is Step 0h's four-outcome branch list, and the
`case` block it restated stands untouched at `skills/setup/SKILL.md:332-343` with all five arms plus
the not-a-work-tree `else`. The rest is obituary and rationale. One sentence at the old Step 0i — "It
runs before Step 2 so `bin/fusion-paths` resolves against a Circle activated here" — was reasoning
rather than restatement, and its content survives structurally in the step's position; it is the one
line in the cut a stricter reading could argue with, and it changes no behaviour.

## Cross-cutting observations

**The Circle's own thesis is what its two High findings violate.** Every step of C3 argues that a
value belongs in one authoring home and is cited from everywhere else, and the argument is right. Both
High findings are the cost of executing it under a lint that checks whether a citation *resolves* and
never whether the target carries what was cited. Finding 1 is a citation to a real section without the
content; finding 2 is a citation with a path that resolves to nothing from the reader's working
directory. A third instance is already filed against the anchor gate this Circle uncovered
(`shared/issues/260824-1506_*_the-anchor-gate-silently-skips-every-var-rooted-citation-…`). Three
independent instances in one Circle is a property of the instrument, not of the authors.

**Three of eleven findings are the same shape: a statement written where nothing reads it.** The
budget crossing goes to stderr on a passing run (finding 4); the two design forks go to a history log
(finding 6); the stale lint's message goes to a failure nobody has hit (finding 5). Each is a fact
somebody established and then filed where the next reader is not looking. That is the same defect
class the review contract itself was written from.

**What I checked and did not find.** No shipped text promises more than "the collision is detected,
not prevented". `rules/circle-records.md:213` states it in bold and no other surface contradicts it.
The two uses of "prevent" elsewhere (`.gitignore` and `rules/workbench-tracking.md`) are about the
*identity* collision, which the mint genuinely does prevent, not the *activation* collision, which it
does not. The distinction is held consistently across all four sites.

**`bin/fusion-identity` itself.** Read line by line. The `set -e` interaction at `:151-152` is safe
(the failing test is non-final in an `&&` list). The person half is established before anything is
written, so exit 1 has no side effect, and the test pins it. The noclobber redirect is `O_EXCL` and
the value is read back on every path, so what is printed is what the file holds. `head -1` plus an
anchored `grep -Eq` is the right way round: an appended file reads as invalid rather than as its first
line. The only prose nit not worth a record is `:156`, which says "the missing value" in the singular
where `:155` may have named two.

## Recommended sequencing

**Before a tag.** Findings 1 and 2. Both are one-line-to-one-paragraph edits, both are on paths a run
takes today, and finding 2 is live for every consumer that has not updated. Finding 7 belongs here
too, not for its severity but because it is a real address that ships and the fix is one line.

**Before closure, not before a tag.** Findings 3, 4, 5, 6, 10. Finding 3 is the largest of them and
may want a decision first — whether a non-git project carries a claim at all — since there is no
transport there and so no collision to detect.

**Cleanup.** Findings 8, 9, 11.

## What this review does not cover

The `_a_`→`_t_` activation performed by the orchestrator reads no existing claim; only `/fusion:next`
Step 6.1 and `/fusion:setup` Step 0i do. I traced the reachable states and found no case where the
orchestrator's route overwrites a standing claim — it renames only `_a_` records, which carry
`Unclaimed` by construction — so no record was filed. Stated here because the reasoning rests on the
`_a_`-carries-`Unclaimed` invariant holding, and that invariant is stated in prose
(`rules/circle-records.md:186`) rather than enforced.
