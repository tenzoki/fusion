No shipped prompt binds a reviewer's evidence record to its package, so a succeeded edge cannot be met
---
FJ03d step 6 gave the reviewer `bin/fusion-write evidence`, which files an evidence record beside its review. Nothing in the shipped text sends `attach-evidence`, the subcommand that binds that record to the package. Until somebody does, no package carries an accepted evidence binding, and a `depends_on` entry with condition `succeeded` stays unmet whatever the review found.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Evidence, on `fj03d` after the step 6 commit:

- `rules/fusion-workbench-conventions.md` `## Work packages`: `succeeded` is "`done` with outcome `completed` and an accepted evidence record (`codec/contract/dependencies.json`)".
- `bin/fusion-write` header lists `attach-evidence --evidence <control path of the evidence record>`.
- `grep -rn 'attach-evidence' agents rules skills` names no file. `agents/reviewer.md` `## Review process` sends only `evidence`.

Open part: which party binds the record. The orchestrator is the likely one, since it reads the reviewer's return and does the closure, but no step of the FJ03d plan assigns it. Step 7 and step 9 do not cover it either.

Acceptance: one prompt or rule names the party that sends `attach-evidence --record <package control path> --evidence <evidence control path>` and when it does so, or a decision record states that `succeeded` stays unreachable through the agents. `hooks/lib/__tests__/reference-resolution-lint.test.ts` and the dispatch-path bound green. Executor: `code-implementer`.
