# The last three UX findings: resume default, flow metrics, quickstart

---
**Domain:** code
**Filed by:** claude-code (UX round, findings 5–7 of the 260827 UX review), Kai Stalmann <ks@qantr.com>
**Cross-references:** `rules/orchestrator-resume.md` (finding 5) · `skills/cadence/SKILL.md` `### 7b` (finding 6) · `skills/setup/SKILL.md` and `agents/orchestrator.md` Setup step 6 (finding 7) · `260827-1330_*_does-the-session-ask-for-its-directive-first-and-wait-silently.md` (findings 3–4, same round)

---

## Answer (260827, user: "mach die restlichen fertig")

**5 — the resume dialog leads with the state and recommends.** One line — interrupted when, Turn, tasks done, last commit — then **Continue (recommended)** / Restart, detail trailing after the question, per the option-default rule the output contract already carries.

**6 — `/fusion:cadence` measures the session feel it used to leave to impression.** A `Session flow (7d)` line from this checkout's own event rows, possible only since the rows carry machine timestamps: gate answers per Turn, median time to first dispatch, dispatch durations (median/max). Absent inputs report absent, never 0 — the counts rule.

**7 — Setup ends with the three usual next moves** (name a task, "run the active Circle", `/fusion:next`), in both the skill's report and the orchestrator's "setup only" branch — the one line a first-time consumer was missing at exactly the moment they ask "and now what?".
