Nothing detects a raised growth baseline, and the only bound on one is a comment
---
The golden/baseline separation is real and works: I regenerated the golden with an over-budget add-back in place and the bound still failed. But the baselines themselves are three plain object literals read by one file and asserted on by nothing. A session that edits a number in `AGENT_BASELINE` clears a red bound with no test firing, and the doctrine forbidding it lives only in a comment. Whether that residual is acceptable is a decision nobody has recorded.
---
**Severity:** Low as a defect, and it may not be one. Filed because the Circle's Directive rests on this cap holding, and "how could this be quietly widened" deserves a recorded answer rather than a reviewer's shrug.

**First, what is genuinely sound, verified by execution rather than by reading.** The commit body claims growth is "recorded, not absolved" when a golden is regenerated. That distinction is real in the code. In a detached worktree at HEAD I restored the two deleted agent prompts (`conceptrev.md` 12 459 B, `investigator.md` 15 502 B), then:

```
$ UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts
  × was not run with the update flag left switched on
  × holds agents inside its own head-room of 18000 bytes
  Tests  2 failed | 10 passed
$ npx vitest run lib/__tests__/surface-growth-bound.test.ts      # golden now regenerated
  × holds agents inside its own head-room of 18000 bytes
  Tests  1 failed | 11 passed
```

The golden assertion goes green, the bound stays red. The failure text is correct to the byte — "grown 27 961 bytes past its baseline … 9 961 beyond the 18 000 of head-room (427 804 now, budget 417 843 = floor 399 843 + 18 000)" — and names both restored files with their exact contributions. The guarantee holds and the demonstration in the commit body is honest.

**The residual.** `AGENT_BASELINE`, `SKILL_BASELINE` and `TEST_LINE_BASELINE` are declared at `hooks/lib/__tests__/surface-growth-bound.test.ts:216`, `:235` and `:258` and referenced at `:315`, `:328` and `:343`. A repo-wide grep finds no other reader:

```
$ grep -rn "AGENT_BASELINE\|SKILL_BASELINE\|TEST_LINE_BASELINE" hooks/ --include=*.ts | grep -v node_modules
hooks/lib/__tests__/surface-growth-bound.test.ts:216,235,258,315,328,343
```

Of the twelve assertions in the file, the only one that reads a baseline against anything external is `carries no baseline entry for a file that is gone`, which catches a *stale* entry and by construction cannot catch a *raised* one. Raising `orchestrator.md` from 139 859 to 157 859 in that literal turns a red suite green and no other test changes colour.

**Two things that make this less alarming than it sounds, and one that makes it worse.**

Less alarming: the same is true of `rules-emission-golden.test.ts`'s `RULE_BASELINE`, so this is the project's established shape rather than a regression; and every such edit lands in a git diff, which the instrument's own header names as the enforcement ("both are written down").

Worse: the guard's `protectedPaths` half was removed on 2026-08-12, so nothing measures a write to this file any more, and no rule is emitted to any agent describing the doctrine. The header of `helpers/growth-bound.ts` `## Re-baselining` is 25 lines of careful reasoning that no agent loads. An executor told "make the suite green" reaches this literal with the same permissions it reaches anything else, and the only thing standing between it and a silent raise is that it happens to open the right file and read the comment.

**A second route, cheaper than editing a number.** Within one surface the bound is net: `over` is `total > floor + headRoom` summed across the surface. Trimming 18 000 bytes of prose from `agents/orchestrator.md` — 35 % of the surface on its own — buys 18 000 bytes of growth anywhere else in `agents/` with no baseline edit and no cleanup recorded. That is arguably the instrument working as designed, since it bounds the rate of net addition; but "cut where the growth is", the instruction in both the failure text and `README-hooks.md`, is satisfiable by cutting somewhere else entirely, and neither document says so.

**What is actually being asked.** Not a lock. A recorded answer to: is a baseline raise meant to be detectable by anything other than a human reading a diff? If yes, the cheap form is a single asserted total per surface next to each map, so that raising an entry fails a second, differently-worded assertion that names the doctrine. If no, say so in the header, because a reader who has just read 25 lines about the two events at which a baseline moves will otherwise assume something enforces them.

**Found by:** coderev, review of `1e29572..9306f0a`, commit `0609945`.
