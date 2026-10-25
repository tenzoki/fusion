- Safe to invoke during a running orchestrator session in the sense that it starts nothing: it claims no work package and touches no session state. The apply pass does edit files an active session may also be editing, so it is worth running at a quiet point.
- **The approval is never absent.** This body holds it. An orchestrator that dispatches the policy-curator mid-session proxies the same question instead (`agents/orchestrator.md`); a caller that cannot ask the user runs the survey pass and stops.

## Tone

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

For this workflow specifically:

- **The approval question leads with the decision**, not with a description of what the policy-curator does. The user invoked this and knows.
- **Groups are named in words**, not by tier number alone: "changes that remove a rule" reads, "tier 3" does not, and the tier can follow in parentheses.
- **Never print entry ids without the count they belong to.** `L01,L04` on its own is unreadable; "two entries, `L01` and `L04`" is not.
- **A run that proposes nothing gets one line.** No summary of the evidence sources, no restatement of what was checked — the agent's run file holds all of it for a reader who wants it.
