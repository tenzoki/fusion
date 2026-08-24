The filing rule names the identity helper with no root, no guard, and no branch for its absence
---
`rules/fusion-workbench-conventions.md:494` `### Who filed it` is the one place every agent is told to read the person half, and it writes the helper as a bare `bin/fusion-identity`. Every other helper call in the same file is `"$FUSION_PLUGIN_ROOT/bin/<helper>"`, and both other new call sites in this Circle guard with `[ -x ]`. From a consuming project's working directory the bare path resolves to nothing and the run gets exit 127, which is not in the exit table the rule branches on.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range.

Three call sites were written in this Circle and they do not agree:

| Site | Form | Guard | Absent-helper branch |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md:494` | `bin/fusion-identity` | none | none |
| `skills/setup/SKILL.md:340` | `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` | `[ -x ]` | none stated |
| `skills/next/SKILL.md:207` | `bin/fusion-identity`, "guarded with `[ -x ]` as every helper call site is" | stated | none stated |

The rule file is the one of the three that matters most, because it is always-on: `bin/fusion-rules <any-agent>` emits `fusion-workbench-conventions.md` to all fifteen agents, so it is the obligation every filing agent carries, while the two skills bind only their own bodies.

**Measured, on this machine, today.** `$FUSION_PLUGIN_ROOT` is `/Users/k1/.fusion` and `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` is false — the installed plugin predates this Circle, which added the helper. That is not an edge case, it is the state of every consuming install until it updates. `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1502-coder-c3-step10-next-refuses-and-claims.md:52-53` records the same measurement being made at the `/fusion:next` site and acted on there; it did not reach the rule.

**What the gap costs.** The rule's own branch table names exit 1 (halt), exit 4 (file with the person half absent) and "every other code" (`PERSON=` is printed, carry on). Exit 127 is none of those: nothing is printed and no code in the table was returned. An agent reading only this rule has three ways to go, and two of them are wrong — halt every filing on an install that is merely a release behind, or compose a value, which the same paragraph forbids in the same breath: "Read it from there and nowhere else: compose no value and substitute none."

`rules/fusion-workbench-conventions.md` `## Path Resolution` → `### Where the call belongs` already fixes the call form for this file's other helpers, so the shape to copy is present two hundred lines above the defect.

Fix direction: write the call as `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` guarded with `[ -x ]`, and add one sentence naming what an unavailable helper obliges — the same class of statement `bin/fusion-count-sources`' call site makes when it says an absent count is `unavailable` and never `0`. Whether that branch files with the person half absent (exit 4's treatment) or halts is a real choice and should be stated rather than left to each agent.

Adjacent records, cited rather than duplicated: `shared/issues/260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md` and `shared/issues/260811-2147_*_nothing-pins-the-gitignore-bin-exception-list-against-the-contents-of-bin-and-the-failure-is-a-helper-missing-from-the-tarball.md` are about the install carrying the wrong helper set. `shared/issues/260819-0822_*_the-fifth-source-root-call-site-drops-the-diagnostic-four-siblings-carry-and-reopens-a-closed-defect.md` is the same shape at a different helper: one call site of several dropping what the others carry.

---
Resolved: `rules/fusion-workbench-conventions.md` `### Who filed it` now names the helper as `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` and states the `[ -x ]` guard beside it, and a third paragraph states the absent-helper branch that exit 127 falls into: file with the person half absent as exit 4 does, and report that attribution was dropped because the helper was missing. It is deliberately neither of the two codes it borrows from — the record shape is exit 4's, the reason is not (exit 4 means no identity was owed; this means one was owed and could not be read), and halting is ruled out in the text because an install one release behind would otherwise stop every filing in the project. `skills/next/SKILL.md` Step 6.1, the third disagreeing site in the record's table, gained the same root. `skills/setup/SKILL.md:340` already carried both and was left alone. +751 bytes against 1181 of always-on head-room.
