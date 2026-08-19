The halt that guards the audit trail rests on a self-test the documented inheritance model denies

---
`agents/shaper.md:55` makes the shaper decide whether `**Initiated by:**` is required by asking
itself whether it holds `AskUserQuestion`: holding it means top-level, not holding it means
dispatched. `README-agents.md:97` and `CLAUDE.md:28` state that a sub-agent inherits the parent
session's tool set, and `agents/orchestrator.md:4` puts `AskUserQuestion` in the orchestrator's
allowlist. Read together, a shaper dispatched by the orchestrator holds the tool, concludes it is
top-level, treats the line as optional, and edits the Circle record with no audit trail — in exactly
the case the line exists for.

---
**What the commit made load-bearing.** The "a dispatched sub-agent does not receive
`AskUserQuestion`" claim is not new. It appears in seven agent prompts (`shaper.md:121`,
`planner.md:72`, `analyst.md:45`, `bugfixer.md:42`, `curator.md:239`, `editor.md:67`,
`playmaker.md:205`) and until now it cost nothing to be wrong about: an agent that wrongly believed
it could ask would simply ask, and an agent that wrongly believed it could not would return its
questions and be relayed. Either way the work completed.

`bf9553f` promoted the same claim to the trigger of a **halt** (`agents/shaper.md:57`: "Halt the same
way when you were dispatched and `**Initiated by:**` is missing or empty"). A claim that was
self-correcting now decides whether the only in-run evidence of user initiation is demanded or
waived. Decision `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
`Implemented:` states the design explicitly: "the orchestrator holds the rule that makes
`**Initiated by:**` true, the shaper holds the check that the line is there and halts without it."
The shaper's half is the only mechanical one, and it is the one resting on the contested claim.

**The contradiction, verbatim.**

- `README-agents.md:97` — "**Tools** — inherited from the parent session. Every sub-agent gets the
  same tool set the parent Claude Code invocation has."
- `CLAUDE.md:28` — "the other 16 inherit tools and model from the parent session."
- `agents/orchestrator.md:4` — `tools: Agent(…), Bash, Read, Write, Edit, Glob, Grep, Skill,
  AskUserQuestion`.
- `agents/shaper.md:55` — "if you hold `AskUserQuestion` you are running top-level."

`CLAUDE.md:133` reasons from the inheritance model in the same direction: "sub-agents (shaper,
planner) inheriting from the orchestrator would also have been denied if reached" — i.e. the
orchestrator's allowlist is what a dispatched shaper's tool set is drawn from.

**Which side is wrong, on the evidence available.** The prompts are right and the inheritance
statement is over-broad. Three observations, all from this session and all reported rather than
instrumented:

1. A dispatched `curator` returned its gate question instead of asking it.
2. A dispatched `shaper` returned two clarification rounds for the orchestrator to relay
   (`shared/history/260813-2345-orchestrator-session.md:38-41`).
3. This review's own dispatch holds no `AskUserQuestion`.

None of the three is a controlled measurement of the shaper under `**Mode:**
portfolio-activation`, and none rules out the tool being present but unusable, which the self-test
would read as "top-level". The claim that the *documented* inheritance model is wrong is inference,
not verification.

**Why it is worth fixing rather than tolerating.** A self-test an LLM performs on its own tool list
is the weakest evidence in the mechanism, and it is placed at the one point that turns a permission
into a check. It also fails silently in the dangerous direction: a shaper that wrongly concludes
"top-level" does not halt, does not warn, and writes the record.

**Candidate fixes, none chosen here.**

- **Correct the inheritance model.** `README-agents.md:97` and `CLAUDE.md:28` gain the exception the
  seven prompts already assert. Cheapest, and it removes the contradiction without touching the
  mechanism — but it leaves the halt resting on self-introspection.
- **Make the line unconditionally required in mode 3.** A top-level user run can carry it as easily
  as a dispatched one, and then no discriminator is needed at all. This changes the contract the
  decision's answer set, so it is a decision rather than a repair.
- **Measure it first.** One headless dispatch of `fusion:shaper` in mode 3 against
  `--plugin-dir <repo>`, with and without `**Initiated by:**`, settles empirically what the prompt
  currently asserts. The same shape proved the curator loadable in Turn 2.

**Scope.** `README-agents.md`, `CLAUDE.md` for the first candidate; `agents/shaper.md` for the
second. Executor: `coder` for the first, a user gate for the second.

**Filed by:** coderev, review `circles/260801-1244-curator/reviews/260814-1850-coderev-curator-turn-4.md`.

---
**Half established, 2026-08-14 (Turn 5).** Two headless probes on Claude Code 2.1.232 returned
`PARENT_HAS_ASKUSERQUESTION=no`, `CHILD_HAS_ASKUSERQUESTION=no` and
`TOPLEVEL_SHAPER_HAS_ASKUSERQUESTION=no`. **The discriminator is unsound**, and by a case this
record did not anticipate: a *top-level* `--agent fusion:shaper` run holds no `AskUserQuestion`
either, so "if you do not hold it you were dispatched" is false on a case that occurs. The test
conflates *can I reach the user* with *did a user start this run*.

**The direction this record was filed about is still unmeasured.** Both probes ran headless, where
the parent holds no `AskUserQuestion`, so the child's `no` is explained by the parent's `no` and
says nothing about inheritance from an interactive parent. `README-agents.md:97` and `CLAUDE.md:28`
are therefore untouched: the measurement gives no evidence against them, and editing them would
have been a guess. What is exposed today is the safe failure — a top-level headless run halting
noisily. The silent one stands.

The record stays open because its remedy is a contract change, filed as
`circles/260801-1244-curator/decisions/260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`.
Answering that decision is what closes this.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged, and its own stated closing condition is unmet.**

`agents/shaper.md:66` still carries the discriminator verbatim: *"if you hold \`AskUserQuestion\` you are running top-level … if you do not hold it you were dispatched"*. Both inheritance statements it contradicts also stand — `README-agents.md:97` ("inherited from the parent session. Every sub-agent gets the same tool set") and `CLAUDE.md:28` ("the other 14 inherit tools and model from the parent session").

The record says answering `decisions/260814-1915_*_should-mode-3-require-the-audit-line-on-every-run…` is what closes it. That decision is still `_o_` at this pass, re-verified: nothing in ``, `` or any decision store answers it. The silent direction — a dispatched shaper concluding "top-level", waiving the audit line and editing a Circle record with no trail — remains unmeasured.
