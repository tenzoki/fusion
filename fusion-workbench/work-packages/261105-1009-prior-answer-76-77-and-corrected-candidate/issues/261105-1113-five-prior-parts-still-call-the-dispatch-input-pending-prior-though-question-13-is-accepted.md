Five prior parts still call the dispatch input pending Prior, though question 13 is accepted
---
Five `prior` parts say the dispatch input shape is "fusion's proposal, pending Prior's confirmation in request 76". Prior accepted that shape at `52a2703`. Severity: Medium; bundle bytes, so it goes before the release commit or waits for the next candidate.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer, before the release commit of 13.4.2
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Evidence.**

- The sentence stands in `consultant/parts/03-prior.md:3`, `orchestrator/parts/07-prior.md:3`, `skill-curate/parts/01-prior.md:10`, `skill-discuss/parts/01-prior.md:10` and `skill-reconcile/parts/01-prior.md:9`, all under `catalog/profiles/`. Command: `grep -n "pending Prior's confirmation" catalog/profiles/*/parts/*-prior.md`.
- `Prior: docs/design/fusion-entry-v2-request76-77-prior-response.md` at `52a2703`, question 13: "**accepted** | the shape fusion sends, `{"arguments": [{"name", "value"}, …]}`, each name one the **child** entry declares", and reading S65-1 accepted as fusion's own text.
- Plan step 3 asks to "Carry Prior's answers where a `prior` part still says the question is open" and lists `skill-discuss/17`, `skill-setup/27`, `skill-archive/01` and `/41`. These five were not on that list, so the implementer did what the list said; the plan's clause is unmet.

**Fix direction.** Replace the clause with the answer and its citation: the shape is what Prior takes (request 76, question 13).

**Acceptance.**

- `grep -n "pending Prior's confirmation" catalog/profiles/*/parts/*-prior.md`, less the two held skills, prints nothing.
- `FUSION-CATALOG` and `CLAUDE-RENDER` of the plan exit 0.
