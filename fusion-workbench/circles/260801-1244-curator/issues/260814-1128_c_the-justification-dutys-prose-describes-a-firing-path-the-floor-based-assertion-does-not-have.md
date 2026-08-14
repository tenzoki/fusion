The justification duty's prose describes a firing path the floor-based assertion does not have

---
Two sentences in `hooks/lib/__tests__/rules-emission-golden.test.ts` describe the RELEASE_CAP
justification duty as if a role's floor tracked what that role ships. It does not: the floor is
`RULE_BASELINE` summed over the role's files, and no edit to a rule file moves it. So the newly
written "one core-file edit away from firing" names a path that cannot happen, and the older
"a role floor at or below it costs a consuming project nothing it was not already paying" is
false today for the orchestrator's role, which sits 229 bytes under the cap on its floor and
6 120 bytes over it on what it actually emits.

---
**The mechanism, read rather than assumed.**

`hooks/lib/__tests__/rules-emission-golden.test.ts:1045-1046`:

```ts
const floor = floorOf(measured.get(members[0])!);
if (floor <= RELEASE_CAP) continue;
```

`floorOf` (line 689) delegates to `growth()` (line 636), whose floor is
`files.reduce((n, f) => n + (RULE_BASELINE[f.rel] ?? 0), 0)`. `RULE_BASELINE` is a hand-edited
constant. Therefore the duty's trigger is a function of the baseline map and the role's file
*set*, never of the bytes those files hold.

**Instance 1 — a firing path that does not exist. (the newly written one)**

`rules-emission-golden.test.ts:571`, added in `5c843e6`:

> The assertion skips it while the floor is under the cap, which on this margin is one core-file
> edit away from firing.

Editing a core rule file changes `wc -c`, not `RULE_BASELINE`, so the floor does not move and the
assertion cannot begin firing. Adding a *new* always-on rule file does not move it either: the
file has no baseline entry, contributes 0 to the floor, and counts as growth in full against the
hard bound instead — which the same file states at line 280. The two things that can move a
role's floor are a hand re-baseline at one of the two events in `## Re-baselining`, and an
audience change in `bin/fusion-rules` that hands the role another already-baselined file. Neither
is "a core-file edit".

The same claim is repeated in the commit message of `5c843e6` ("the cap is one core-file edit
away from firing") and in
`circles/260801-1244-curator/history/260814-1116-coder-arm-the-growth-bound.md`
("one core-file edit away from the justification duty firing").

**Instance 2 — the duty's stated meaning, false as of this Turn.**

`rules-emission-golden.test.ts:228-233`:

> The one job it still does honestly is the BASELINE for the JUSTIFICATION DUTY: a role floor at
> or below it costs a consuming project nothing it was not already paying, and a role floor above
> it is a decision to charge that project more.

Measured at HEAD `5c843e6`: the orchestrator's role floor is 105 125 (86 573 core + 9 302 +
9 250), which is 229 under `RELEASE_CAP` = 105 354, so the duty skips it. What that role emits is
111 474 (`hooks/lib/__tests__/fixtures/rules-emission.golden:115`), which is 6 120 **over** the
cap. A consuming project running an orchestrator session is paying that overage on every
dispatch, and nothing in the suite says so.

This half is pre-existing rather than introduced here — the gap between floor and emission was
22 919 bytes wider before the arming, and the arming narrowed it. It is filed together with
instance 1 because they share one root cause: the duty is floor-based and its prose is written as
if the floor were the shipped load.

**Why it is worth fixing rather than tolerating.** This file's whole doctrine is that a number
nothing asserts is a number nobody notices moving (`:20-27`), and the Circle that armed the bound
spent two decisions on removing claims that no parser checks. A false claim about when the gate
fires belongs to the same class, and it is the sentence the next person editing an always-on rule
is most likely to act on.

**Candidate fixes, none chosen here.**

- State what actually moves the floor: a re-baseline, or an audience change. Say that the gate the
  next core edit meets is the hard bound at +12 000, not the cap.
- For instance 2, either say plainly that the duty measures the floor and not the emission, or
  change the assertion to read the emission. The second is a behaviour change and would fire today
  for the orchestrator's role, so it is a decision rather than a repair.

**Scope.** One file, `hooks/lib/__tests__/rules-emission-golden.test.ts`. Prose and, for the second
candidate fix only, one assertion. Executor: `coder`.

**Filed by:** coderev, review `circles/260801-1244-curator/reviews/260814-1128-coderev-curator-turn-2.md`.

---
Resolved: Fixed the prose, not the mechanism — the floor-based assertion is the arming decision `260814-0738`'s and was not touched, nor were `RULE_BASELINE`, `RELEASE_CAP` or `DRIFT_CEILING`. I re-read the trigger before editing and confirm the finding: `floorOf` (`:689`) delegates to `growth()` (`:636`), whose floor is `RULE_BASELINE[f.rel]` summed over the role's files, so no edit to a rule file can move it and the mechanism is right as it stands. Instance 1, the orchestrator role's entry in `ROLES`: "one core-file edit away from firing" is replaced by what actually moves a floor — a re-baseline at one of the two events in `## Re-baselining`, or an audience change in `bin/fusion-rules` handing the role another already-baselined file — and by the statement that editing a rule file moves what the role emits and not what it stands on, that a newly added always-on file contributes 0 to the floor and counts as growth in full instead, and that what the next core-file edit meets is the hard bound at +GROWTH_BUDGET rather than this cap. Instance 2, the `RELEASE_CAP` docblock: the duty is now stated as measuring the FLOOR, with a new paragraph (`READ THAT AS THE FLOOR AND NOT AS THE BILL`) saying that what a role emits is the floor plus everything its files have grown since the baseline was last set, that a role can therefore stand under the cap on its floor and over it on what it ships, and that the duty stays silent through that because the gap belongs to the budget report and the hard bound. The false half — "costs a consuming project nothing it was not already paying" — is gone. Per decision `260814-0845` the correction carries no present-tense byte figures of its own, so it cannot go stale the way the sentence it replaces did. `cd hooks && npm test` exit 0, 49 files, 1030 tests; no `RULE-TEXT BUDGET` report printed.
