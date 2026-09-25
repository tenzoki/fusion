A gate meant to keep citations resolvable made one comment stop citing at all

---
An equality-pinned lint changed what a source comment says, rather than checking it. The
text is now vaguer than its author wanted, and the gate is the reason.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## What was measured

Plan step 7 (`bin/monitor`, commit pending) added a comment naming the four false readings
the checkout filter repairs and the record that measured them. Its author deliberately wrote
the identity helper as `fusion-identity` rather than `bin/fusion-identity`, and named the
tracking rule by description rather than as `rules/workbench-tracking.md`.

The reason is in that task's own report, and it is not a style preference.
`bin/monitor` begins with `#!`, so `reference-resolution-lint.test.ts` scans its comment
lines as class-(a) plugin paths against an equality-pinned baseline. Spelling either name as
a path would have moved the pin, and re-approving a pin means editing a test file that the
task's scope excluded. So the cheapest correct action available to a scoped task was to
write the comment less precisely.

## Why it matters

The gate exists so that a citation a reader follows actually resolves. Here it produced the
opposite: a reader of that comment gets no path to follow, and the two names it does carry
cannot be resolved mechanically by anything. The instrument shaped the artifact it was
measuring, in the direction it exists to prevent.

This is not an argument for widening the assertion into a floor, which the gate's own text
names as the thing not to do. It is a report that the pin's **scope cost** is real: any task
whose file list excludes the test file is pushed toward writing a worse citation, and that
pressure grows with every additional task the wave splits into. Turn 2's first wave paid it
four times, three of them as a blocked verification and once as this comment.

## What is not claimed

No measurement of how often this has happened elsewhere. The one instance is this one, found
because the task reported its own reasoning rather than quietly writing the vaguer form.
Whether other comments in `bin/` carry the same shape is unmeasured, and a grep for
descriptive references where a path would resolve would answer it.

## Possible directions, none chosen here

1. Let the re-approval ride any task that moves the count, by naming the test file in every
   dispatch that could. Costs a shared file in many scopes, which is what the wave design
   exists to avoid.
2. Have the orchestrator re-approve once per wave, which is what happened here by hand,
   three times across two Turns. Cheap, but it makes every wave's verification end red and
   trains readers to discount a red suite.
3. Scope the pin per directory, so a `bin/` comment and a `rules/` file do not share one
   number. Unmeasured whether the counts would then be stable enough to pin at all.

Resolved: direction 2, as already practised, with one refinement that removes its cost: each task in a wave measures its own path/anchor share by single-file revert against the dirty tree and reports it, and the orchestrator re-approves the pin once at the wave's end from those shares, so the red suite mid-wave is an expected, accounted state rather than one to discount. Direction 1 is rejected because it puts one shared test file in every scope, which the wave split exists to avoid; direction 3 is not taken because a per-directory pin is unmeasured and would multiply the numbers to re-approve. The one instance is corrected: the `bin/monitor` docstring now names `bin/fusion-identity` and `rules/workbench-tracking.md`, and the measurement shows why the vagueness bought nothing: that docstring is not a comment line, so the gate never scanned it, and the edit moves the pin by 0/0. Whether other `bin/` comments carry the same shape stays unmeasured.
