Five agent prompts tell a top-level run it holds `AskUserQuestion`, and a headless one does not

---

`agents/analyst.md:44`, `agents/bugfixer.md:41`, `agents/curator.md:245`, `agents/planner.md:71` and
`agents/shaper.md:131` each carry a variant of *"Run top-level (user-initiated). You have
`AskUserQuestion`."*

Two headless probes on Claude Code 2.1.232 measured the opposite: a top-level
`--agent fusion:shaper` run reported `TOPLEVEL_SHAPER_HAS_ASKUSERQUESTION=no`. The measurement is
recorded in `circles/260801-1244-curator/decisions/260814-1915_*_should-mode-3-require-the-audit-line-*`,
whose answer deleted the self-test that rested on the same false half.

---

**Why this is filed rather than fixed.** The sentence is a claim about the **clarification channel** —
can this run ask the user a question — and not about the audit line the answered decision settled.
Correcting it properly needs a measurement nobody has taken: whether a top-level run started from an
*interactive* parent inherits the tool, as against the headless probes that were run. That is option 3
of the same decision, and the user did not choose it.

Rewriting the five sentences today would settle an unmeasured question by prose, in five shipped
prompts at once. The executor that met them declined for that reason and named them instead, which is
the right call and the reason they are here.

**What it costs while it stands.** A prompt tells an agent it can ask the user something, and in a
headless run it cannot. What such an agent does when it tries is not recorded anywhere; every agent
whose prompt carries the sentence also carries instructions for returning questions in its report,
so the likely outcome is a degradation nobody has observed rather than a failure anybody would see.

**What would close it.** The interactive-parent measurement, then one edit across the five. Until then
the sentence is wrong in a way that is measured for one case and unmeasured for the other, and saying
so is more use than a guess in either direction.

Filed by the orchestrator of session `260819-2006` from the executor's report while realising three
answered decisions. No Circle is active, so it goes to the shared store under the Origin Rule.

---
Resolved: fixed — the five sentences no longer assert a tool: a top-level run asks in chat, a dispatched run returns the question in its report, so no measurement of tool inheritance is needed for the wording; `agents/analyst.md:44`, `agents/bugfixer.md:41`, `agents/curator.md:245`, `agents/planner.md:71`, `agents/shaper.md:131`
