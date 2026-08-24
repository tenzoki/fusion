The identity helper's exit-4 message names a cause it never established
---
`bin/fusion-identity:162` prints "not a git work tree, so no identity is owed and none is missing" whenever the compound test at `:144` fails for any reason, `git` being absent from `PATH` included. Inside a real work tree with no `git` on `PATH` the run then exits 4 and the caller files a record with the person half absent, on a stated cause the program did not check. The file's own header commits to the opposite rule for exit 3: it "names an outcome, never a cause".
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range. Landed at `3ba7a46` (plan step 4).

The test is one `&&` chain over two independent facts:

```bash
if command -v git >/dev/null 2>&1 &&
   [ "$(git rev-parse --is-inside-work-tree 2>/dev/null || true)" = "true" ]; then
```

Its `else` branch has one message and that message asserts the second fact. It is reached when the second is false, and equally when the first is — `git` not installed, `git` not on the `PATH` the hook or skill invoked with, a `git` that fails to execute.

**Verified by probe**, against a temporary tree with a workbench and no `git` reachable: the script prints the "not a git work tree" line and exits 4.

**What the misattribution costs.** Exit 4 is the code that says no identity is owed. In a git project whose `git` is unreachable an identity *is* owed and cannot be obtained, and the caller is told the opposite, so records are filed unattributed and nothing anywhere says why. That is the failure the exit table was built to make impossible: `bin/fusion-identity:42-51` argues at length that 1 and 4 must stay separate because merging them makes the program undecidable for its callers, and an unverified cause routed into 4 rejoins them from the other side.

**The file already states the rule it breaks here.** `:79-89`, "Exit 3 names an outcome, never a cause", with the reasoning that a broken install must never be reported as an answer about the project. A missing `git` is exactly a broken environment reported as an answer about the project.

Fix direction: split the `else` on `command -v git`. A tree that is not a work tree keeps today's message and exit 4. `git` unreachable is a different sentence — the program cannot tell whether an identity is owed — and needs a decision about which code it takes. Exit 1 is defensible on the ground that a run which cannot ask about identity should stop rather than file silently; that is a choice, not a correction, and belongs in a record before it is coded.

Scope: `bin/fusion-identity` only. No caller changes; every caller already branches on the number.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** Reproduced independently rather than inherited from the review. Run from `/Users/k1/Projects/productive/fusion/rules`, a directory inside a genuine git work tree, with `PATH` set to a shim holding `bash`, `od`, `head`, `printf`, `mkdir`, `cat`, `sed`, `dirname` and `basename` but no `git`, the helper printed "not a git work tree, so no identity is owed and none is missing" and exited without halting. The tree is a git work tree and an identity is owed in it, so a record filed from that state would carry no person half and no agent would learn why.
