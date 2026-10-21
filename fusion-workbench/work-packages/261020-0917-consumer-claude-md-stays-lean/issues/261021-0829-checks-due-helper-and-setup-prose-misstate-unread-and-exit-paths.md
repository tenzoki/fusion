The checks-due helper's header and setup's `unread` paragraph misstate what the new paths do
---
Three small contract mismatches came with the move of the due computation into `bin/fusion-checks-due`. The setup body tells the model that every `unread` means node is missing. The helper header documents an exit 1 the wrapper cannot reach. And it promises exit 0 always, which a node failure breaks.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.**

- `skills/setup/SKILL.md` Step 0, the paragraph after the marker block: "`checks_due=unread` says no due list was computed, and its parenthesis says why; usually node is not on this machine's `PATH`. The marker is still written, by the shell fallback ... Every fusion hook is a node program, so none of them is running either. Report both facts". The helper now also prints `unread (<entry> is missing)`, `unread (plugin version unreadable)` and `unread (no workbench above the working directory)` (`bin/fusion-checks-due`, the two early `echo`s, and `hooks/checks-due.ts` `main`). On those three, node ran and the marker was written by node, so "the shell fallback" and "none of them is running" are false. The body still tells the model to report both.
- `bin/fusion-checks-due` header, `# Exit codes:`: "1  usage error." The wrapper ends `exec node "$entry" "$here/.."` and passes on none of its own arguments. Probe: `bin/fusion-checks-due x; echo "exit=$?"` prints a due line and `exit=0`. The usage branch in `hooks/checks-due.ts` (`argv.length !== 1`) is reachable only by calling node directly.
- The same header: "0  always". If `hooks/dist/checks-due.js` exists but cannot load (for example a missing `hooks/dist/lib/fail-open.js` in a partial copy), `exec node` exits non-zero and prints no `checks_due=` line. Setup Step 0 documents no such case. inference: rare, because dist ships whole. Stated because the header claims totality.

**Scope.** Documentation and the wrapper only. The due semantics are unchanged from setup's former inline block: verified line by line, and by running the shipped block in a scratch workbench.

**Acceptance.** The setup paragraph distinguishes "no node" from the other `unread` reasons and asserts "no hook is running" only for the first. The helper header's exit table matches the wrapper's behaviour: either the wrapper rejects arguments with exit 1, or the usage line and exit 1 are dropped. A node failure either maps to `checks_due=unread (<why>)` with exit 0, or the header names it.
