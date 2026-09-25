The consultant's startup procedure is written for an interactive session, and the discuss dispatch does not override it

---
The dispatch ban was deleted from the prohibition list; `agents/consultant.md:62` still tells the agent to acknowledge readiness, list open items, and "Stop and wait for the actual question". As a sub-agent there is no second turn.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The instruction.** `agents/consultant.md:62`:

> **On startup.** Acknowledge readiness in one to three lines. List open items (issues, decisions, active plans) the user might want to know about. Stop and wait for the actual question. Do NOT preemptively scan-and-summarize the project.

A sub-agent dispatched by `skills/discuss/SKILL.md` Step 5 runs once and returns. A round that follows this paragraph returns a readiness line and an open-items list instead of one verdict per register entry, and the register never moves.

**What the body does and does not neutralise.** `skills/discuss/SKILL.md:153-156` closes the dispatch with two overrides, "both stated rather than left to be inferred": write no file, and you have no `AskUserQuestion`. Those are the two standing permissions in `agents/consultant.md` that a round must suspend (`:37-40` grants three write keys). The startup procedure is a third and is not named. The author recognised the class of problem and enumerated it at two.

**Why the spec's reasoning does not cover it.** Spec C3: "Nothing has to be added to the prompt for that; the mandate that makes the consultant suitable is the mandate it already carries." That holds for the Reliability Mandate at `:12-21`, which is what the argument cites. It does not hold for the Primary Mode section, which is written throughout for a chat the sub-agent does not have — `:10` ("Your primary value is talking with the user"), `:54` ("Default length: 1-5 sentences"), and `:155`, whose whole Output Style split is chat replies versus report files, with no branch for a report to a dispatcher.

**Calibration.** *inference:* a dispatch carrying a `**Round:**` line, a register and a return contract reads as "the actual question", so a competent run will probably answer it rather than idle. The defect is that nothing in either file says so, on a path the spec declared needed no prompt change.

**Acceptance test.** A run of `/fusion:discuss --begin` returns per-entry verdicts in round one rather than a readiness acknowledgement. Either the dispatch's closing instructions name the startup procedure as the third thing suspended, or `agents/consultant.md` scopes `## Primary Mode` to a session the agent holds directly. `agents/consultant.md` stands well inside its own head-room after this range's −117 bytes (`hooks/lib/__tests__/fixtures/surface-growth.golden`, `[agents bytes]`); the `skills/` surface does not, at zero margin.

**Cross-references:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C3`, `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`

---
Resolved: The dispatch in `skills/discuss/SKILL.md` `## Step 5 — A round` gains a third closing instruction, "Do not acknowledge and wait", which names the consultant's startup procedure as written for a session it holds directly and states that there is no second turn. `agents/consultant.md` is untouched, as another task owns it. The list's opening sentence drops its count rather than restating it, so no numeral sits beside the bullets. Paid inside the same body.
