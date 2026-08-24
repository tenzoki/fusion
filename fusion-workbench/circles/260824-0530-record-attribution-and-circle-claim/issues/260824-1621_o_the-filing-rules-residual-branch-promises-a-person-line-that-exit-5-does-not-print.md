The filing rule's residual branch promises a PERSON line that exit 5 does not print
---
`rules/fusion-workbench-conventions.md:496` `### Who filed it` branches on exit 1, exit 4 and "every other code", and says of the residual: "On every other code `PERSON=` is printed and you carry on." That is false for exit 5, where `bin/fusion-identity:222` prints neither line, and for exit 2, where the usage path prints nothing at all. Exit 5 needs exit 4's treatment, filing with the person half absent, and is routed into a branch that tells the agent the value is there.
---
**Filed by:** coderev

Found reviewing `0f5889e..3fba5c6`, the two commits that close the C3 Circle's high-severity findings.

**Verified in the helper, not inferred.** `bin/fusion-identity:211-223` is the report block:

```bash
if [ -n "$person" ]; then printf 'PERSON=%s\n' "$person"; fi
if [ -n "$checkout" ]; then printf 'CHECKOUT=%s\n' "$checkout"; fi
...
elif [ -n "$checkout" ]; then
  exit 4
else
  exit 5
fi
```

Exit 5 is reached when `person` is empty **and** `checkout` is empty, so neither line is printed. The script's own header says the same at `:36`: "5  3 and 4 together: neither line is printed." Exit 2 (`:132-135`) prints the usage block on stderr and exits before any identity is read.

**Where the rule lands each of the six codes today.**

| Exit | `PERSON=` printed | Branch the rule sends the agent to | Correct? |
|---|---|---|---|
| 0 | yes | residual, carry on | yes |
| 1 | no | halt, file nothing | yes |
| 2 | no | residual, "`PERSON=` is printed" | **no**, nothing is printed |
| 3 | yes | residual, carry on | yes |
| 4 | no | file with the person half absent | yes |
| 5 | no | residual, "`PERSON=` is printed" | **no**, nothing is printed |

So the split is disjoint and covers all six codes, and one of its three branches asserts something false of two of them. An agent on exit 5 is told to carry on with a value it does not have, while the same paragraph forbids the only two ways out of that: "compose no value and substitute none."

**Exit 5 is reachable in a configuration fusion supports on purpose.** `bin/fusion-identity:53-58` records that a non-git project is supported in shipped code. Exit 4 is that project with the checkout half resolved; exit 5 is that project when the checkout half also fails, which `bin/fusion-identity:196-207` reaches three ways: no workbench above the working directory, a `.checkout-id` holding something other than eight lowercase hex, or a workbench the mint could not write to. The middle one is not hypothetical: `circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1538_*_the-checkout-identifier-is-never-overwritten-and-no-test-holds-that-property.md` records that exact state being produced by probe, exiting 5.

**Why this survived the commit that re-cut the split.** `3fba5c6` added a fourth outcome, the absent-helper branch, and left the residual sentence untouched. `rules/critical-stance.md` §4 asks whether a split is disjoint and complete; the check was applied to the new branch and not to the branch it was added beside. The residual is where an incomplete split hides, because it is the one branch nobody enumerates.

**It also contradicts an open sibling record.** `circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1538_*_the-claim-has-no-defined-value-when-the-identity-helper-produces-one-half-or-neither.md` opens by saying `rules/fusion-workbench-conventions.md:496` "handles this for the person field" and that the split for `**Filed by:**` is complete where the claim's is not. On exit 5 it is not. That record's scope is the `**Claim:**` field and stands; its premise about the person field needs the correction this record makes.

Fix direction: name exit 5 beside exit 4 rather than in the residual, since the two oblige the same act of filing with the person half absent. One clause, roughly forty bytes on an always-on file whose head-room now stands at 431, so measure `rules-emission-golden.test.ts` after. Restating the residual as "on every other code carry on, and the person half is whatever the helper printed" would also close it and reads weaker; the enumerated form is what the rest of this section uses.
