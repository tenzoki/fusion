The rule text states the claim criterion in head fields and two causes of exit 3, which the helpers no longer match
---
Since FJ03a steps 3 and 4 (`3516d7a2`, `8afcc242`) `bin/fusion-claimed-package` and `bin/fusion-paths` read the claim from the package's JSON control record through the codec and refuse a workbench that is not JSON-controlled. Two rule passages every agent loads at Setup still describe the Markdown reader. FJ03a leaves `rules/` untouched, so its steps could not correct them.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

**The two passages, at `4bbc9d19`:**

1. `rules/fusion-workbench-conventions.md` `### Contract` with `#### Exit codes` (under `## Path Resolution (Pfadauflösung)`).
   - "The item in scope is the one whose record carries `**Status:** claimed` and a `**Claim:**` naming this checkout's eight hex characters". The helpers compare `status` `claimed` and `claim.checkout_id` of `package.json` (header of `bin/fusion-claimed-package`, `The criterion, and where it is read`; `hooks/lib/scope.ts` `## The criterion`).
   - "as a directory name that must already exist in the container store; one that does not is exit 1". `bin/fusion-paths` now asks whether the directory holds a package record the codec reads; a directory alone is exit 1, and a refused workbench is exit 3 on this branch too (header of `bin/fusion-paths`, `<item-dir>` and exit 3).
   - The exit table's row 3 names two causes: "this checkout holds two or more claimed items, or its own identifier could not be read inside a git work tree". The helpers exit 3 for four more: the workbench is `legacy` or `unsupported`; the codec refused a read (`recovery-blocked` among the reasons) or gave no answer; a package record did not read; a package changed between the list and the read of it twice over (header of `bin/fusion-claimed-package`, exit 3).
   - "**Exit 3 is unknown scope and nothing else.**" still holds; the sentence after the table that reads the two causes as the whole set does not.
2. `rules/agent-setup.md` `## What fusion-paths emits`: "**exit 3** is scope the resolver could not determine, and the user clears it." For a `legacy` workbench the user clears nothing by hand: the way out is the migration (FJ04). The passage points at the conventions table for the causes, so it inherits the stale row.

**Evidence:** `grep -n 'Status:\*\* claimed\|two or more claimed items' rules/fusion-workbench-conventions.md` names the two lines; `sed -n 29,47p rules/agent-setup.md` is the second passage. Against them: `sed -n 23,47p bin/fusion-claimed-package` and `sed -n 44,55p bin/fusion-paths`. Observed at `4bbc9d19`: in this repository the work tree's `bin/fusion-paths analyst` exits 3 naming `legacy`, a cause neither passage lists. The plan that left the text for later: `260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md`, step 6 and the fourth row of `## Risks & Mitigations`.

**Owner:** FJ03d, the part of FJ03 that changes rule text (the same plan, `## The cut of FJ03`). The edit is charged to the growth bound on the rule files. No session reads the branch's helpers before the migration, so nothing is misdirected until FJ03d activates.

**Acceptance:** both passages state the criterion as `status` and `claim.checkout_id` of the package's JSON record; the exit table's row 3 names every cause the header of `bin/fusion-claimed-package` lists, or cites that header as the list; `## What fusion-paths emits` says what a reader does on a `legacy` or `unsupported` workbench; `grep -rnE '\*\*(Status|Claim):\*\*' rules/agent-setup.md` names nothing, and in `rules/fusion-workbench-conventions.md` no match stands under `## Path Resolution (Pfadauflösung)`.
