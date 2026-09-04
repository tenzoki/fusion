`monitor-warnings-panel.test.ts` fails intermittently on the dual-stack bind
---
One observed failure with `connect ECONNREFUSED ::1:<port>` in the dual-stack bind case, followed by four passes: three isolated runs and one full-suite run. A gate that fails on load rather than on the code under test costs a session a diagnosis every time it fires.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence, and the honest limit on it.** The observation is the coder's, made while implementing step 7 of the active Circle, and reported with the limit attached: five observations, called flaky rather than proven. The diff that was in the tree at the time touches nothing in the bind path. Nothing here establishes a rate, and nothing has looked at the bind code.

**Why it is worth a record rather than a shrug.** `npm test` is a release gate in this repository, and a suite that fails on a race gives a session a red result it has to spend a diagnosis on before it can tell the flake from a real regression. Today it cost one, and today's suite was already red for two other reasons, which is exactly the condition under which an intermittent failure gets absorbed into the noise and stops being noticed.

**Acceptance.** Either the bind path is made deterministic, so the test cannot fail on which stack answers first, or the record says why the race is acceptable and what a session should do when it sees this failure. A rate is measured before either, over a run count the record names.
