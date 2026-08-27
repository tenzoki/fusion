A staging list assembled by a pipeline over git status is the directory sweep the rule forbids

---
The orchestrator wrote out every path, and derived one group of them from a command. A record
left HEAD for one commit. The rule's letter was satisfied and its purpose was not.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## What happened, measured

Commit `7ae6aae` staged the deletion of the `_o_`-marked record in
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/` whose slug is
`the-two-session-start-emit-sites-disagree-on-the-detail-field-and-the-vocabulary-names-one`,
without its `_c_` successor. The deleted filename, spelled as it stood in that commit:

```
260825-2140_o_the-two-session-start-emit-sites-disagree-on-the-detail-field-and-the-vocabulary-names-one.md
```

The record was in HEAD before that commit and absent after it. It returned two commits later, in `c2be6f8`, once the miss was noticed.

The cause is one line of the staging command:

```
OLD=$(git status --short "$CD/issues" | grep '^ D' | awk '{print $2}' | ...)
```

That collected every deletion under one directory, which on that Turn meant seven renames the
task had performed **and** one rename a different task had performed. The seven had their
successors in the same list, from a second pipeline. The eighth did not, because its successor
carried a different timestamp prefix and the second pipeline's pattern was written for the
seven.

## Why the existing rule did not catch it

`agents/orchestrator.md` Step 3b step 4 states the shape as *every path passed to `git add` is
one you wrote out yourself*, and forbids `-A`, `-u`, a directory argument and a glob. This
command used none of those four. What it used was a pipeline whose output is a path list, which
is the same thing as a glob with more steps: the author does not know what is in it at the
moment of writing, which is precisely the property the shape exists to guarantee against.

The failure mode is the one the rule already documents for `-u`, arrived at by another route:
a renamed record's deletion is staged and nothing is added in its place, so the record leaves
HEAD. The project has now measured this class three times — `git add -u` over a directory in
the commit repaired as `f38f37d`, the eighteen-commit unstaged pair in `260811-0114`, and this.

## What is not claimed

That the shape is wrong. It is right, and widening it is what the earlier records already ruled
out. What is unmeasured is whether a pipeline-built list is common in practice or whether this
is one orchestrator improvising under a wave of eight renames. One instance, this one.

## Possible directions, none chosen here

1. State in Step 3b step 4 that a path list produced by a command is a glob for this purpose,
   naming command substitution explicitly beside the four existing prohibitions. Cheapest, and
   it is a rule the next reader still has to obey by hand.
2. Have the executor report its renames as an explicit old-and-new pair per record, so the
   orchestrator copies pairs rather than reconstructing them from the tree. Moves the knowledge
   to where it exists; costs a line in every executor's report contract.
3. Let `bin/fusion-staging-drift` fail a commit that stages a deletion whose successor is
   untracked. It already detects the untracked successor after the fact, one commit too late;
   whether it can be consulted before the commit rather than after is unmeasured.

Resolved: direction 1. `agents/orchestrator.md` Step 3b step 4 now names a command-produced list beside the four prohibitions, with the substitution form and `7ae6aae` as the measured instance. Direction 2 is not taken: the executor report shape already requires every modified file by absolute path, and a rename is two such paths, so the knowledge is in the report when the executor follows its contract; a pair line would restate that. Direction 3 stays unmeasured, and `bin/fusion-staging-drift` reports and never gates by its own contract, so wiring it before a commit would be a new decision rather than a fix.
