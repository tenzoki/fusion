`bin/fusion-events`' header says "the four sum to the dispatches in scope" without naming which four, and the four on stdout do not sum
---
`bin/fusion-events:38-46` (since `6420c14e`, plan step 26): "**Two counts are on stderr and never on stdout** … The second is under the same agent and cutoff filters as every figure on stdout, so the four sum to the dispatches in scope."

The stdout block prints four dispatch figures, `counted=`, `longer_than_threshold=`, `unattributable=`, `unpaired=` (`hooks/events-query.ts:463-470`), and those four do not sum: `longer_than_threshold` is a subset of `counted`. The identity the sentence has in mind is `counted + unpaired + unattributable + unstamped`, with `unstamped` on stderr (`hooks/lib/events-query.ts:655-700`, one increment per branch), and none of the four is named on the line. A reader who takes "the four" as the four stdout keys checks an identity that fails.

Acceptance: the sentence names its four summands; `grep -c 'counted.*unpaired.*unattributable.*unstamped\|unstamped.*counted' bin/fusion-events` is at least `1`; `cd hooks && npm test` exits 0.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder`. Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`.

---
Resolved: `bin/fusion-events`' header names its summands and says where each is printed: the unstamped count on stderr is the fourth, and with `counted`, `unpaired` and `unattributable` from stdout it is the whole of the dispatches in scope. `longer_than_threshold` is named as being in no sum, a subset of `counted` whose addition would count those dispatches twice. No figure and no program changed; the sentence describes what already prints.
