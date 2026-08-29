The Implemented note labels the analyst dispatch total as "the always-on rule set"

---

`shared/decisions/260816-1707_i_*`, last line of its `Implemented:` footer:

> The always-on rule set falls 98 874 -> 95 458 bytes per dispatch.

Both figures are the `[analyst]` block of `hooks/lib/__tests__/fixtures/rules-emission.golden`, which
is neither the always-on set nor any agent's floor. The deltas are right; the absolutes are wrong by
a fixed 2 519 bytes, and the label contradicts the definition `CLAUDE.md` states.

---

`CLAUDE.md` `## Conventions`, under the guard-rule paragraph, defines the set and warns against
exactly this substitution:

> Measure it when you need it, with `wc -c` over the always-on set — the **unindented**
> `emit_if_exists` lines in `bin/fusion-rules`, plus the project's chat voice profile. The indented
> ones are conditional emissions and are not part of the floor.

The analyst block does the opposite on both counts: it *includes* `design-diagrams.md` (4 834 bytes,
emitted behind `IS_DIAGRAM_AGENT` at `bin/fusion-rules:412-414`) and *excludes*
`fusion-workbench/stilwerk/chat-voice-de.yaml` (7 353 bytes, emitted unconditionally at
`bin/fusion-rules:396`). 7 353 − 4 834 = 2 519, which is the constant offset.

Measured at each of the three commits, over the five unindented `emit_if_exists` files plus the chat
profile:

```
52b1d95   101 393     claimed 98 874
b200902    97 977     claimed 95 458
b54ace5    98 796     claimed 96 277
```

`bin/fusion-rules coder | xargs wc -c` prints 98 796 at HEAD in one command, which is the check
`CLAUDE.md` names for this repository.

Two things the corrected figures say that the tabled ones do not. The floor at HEAD is under 100 000
rather than under 97 000, which matters against the 12 000-byte head-room in
`hooks/lib/__tests__/rules-emission-golden.test.ts`. And the second commit of the range *raised* the
floor by 819 bytes, which the single-figure claim in the footer hides: the movement is −3 416 then
+819, netting −2 597 — the same net the tabled figures give, off a base 2 519 bytes higher.

**Same class, second instance.** `260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`
found the identical mislabelling three days earlier, in a different artifact, and with the same two
memberships wrong in the same two directions: `design-diagrams.md` counted in, the chat profile left
out. Two independent measurements have now reached for the golden's analyst row and called it the
always-on set. That is a property of the artifact, not of the two authors — the golden labels its
per-agent blocks by agent and nothing in it says which row is the floor.

Verified at HEAD `b54ace5` by `git cat-file -s` over the six files at each of the three commits and
by `./bin/fusion-rules coder | xargs wc -c`.

**Fix direction.** Correct the three figures in the `Implemented:` footer of `260816-1707` and label
them for what they are. Separately, and more usefully: the golden is the artifact both passes
misread, so consider whether it should carry a line naming the always-on subtotal explicitly — that
is a change to a fixture and wants weighing against the count-pinning convention, so it belongs in a
record rather than in this fix.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301-orchestrator-session.md`. No Circle active, so it is
filed in the shared store under the Origin Rule.

---
Resolved: The `Implemented:` footer of `260816-1707_i_*` now names the always-on floor as `CLAUDE.md` defines it, 101 393 -> 97 977 bytes, with a dated correction note recording that the earlier figures were the `[analyst]` block and off by the fixed 2 519-byte offset. The commit message of `b200902` keeps the original wording, being history.
