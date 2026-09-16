The resolver rule still teaches a consumer name that exits 2

---
`rules/workbench-path-resolution.md` is the authoring home for the `<name>` namespace, and it demonstrates the namespace with three worked calls. One of them names the skill deleted at v11.4. The name resolves to no prompt file, so the example the rule offers a reader is a command that errors.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md

**Evidence.**

- `rules/workbench-path-resolution.md:24` — *"every consumer asks under its own name: `fusion-paths coder`, `fusion-paths memo`, `fusion-paths log-activity`."*
- Run at HEAD, from the installed copy and from the work tree alike:
  ```
  $ bin/fusion-paths log-activity
  fusion-paths: unknown name 'log-activity'. Expected an agent (agents/log-activity.md) or a skill (skills/log-activity/SKILL.md).
  $ echo $?
  2
  ```

No gate can see it. The token carries no `/fusion:` prefix, so `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`'s phantom-skill assertions do not read it; it is a bare word rather than a path, so `reference-resolution-lint` has nothing to resolve; and `bin/fusion-rules` emits this file to no agent, so no dispatch-path measurement touches it either. The plan's reference survey counted 21 non-workbench sites by grepping `log-activity`; this one is inside `rules/` and was not itemised in any step.

The replacement is in the file already: `:26` uses `/fusion:cadence` as its worked example of a skill with its own key set, and cadence is the consumer that inherited this one's job.

**Acceptance.** `rules/workbench-path-resolution.md:24`'s third example names a consumer that resolves, and `bin/fusion-paths <that name>` exits 0. `cd hooks && npm test` stays green.

---
Resolved: `rules/workbench-path-resolution.md` `## The name namespace`'s third worked call is now `fusion-paths cadence`. Verified at HEAD: `bin/fusion-paths cadence` exits **0** and emits `WORKBENCH`, `OUT_MEMO`, `SCAN_HISTORY`; `bin/fusion-paths log-activity` exits 2 with "unknown name". Cadence is the consumer that inherited the deleted one's job and is the replacement this record named.
