The plan names only D1 as superseded, but the pass-through formats also relax four C1 criteria of the spec
---
The head of `261002-0733_*_plan-work-order-markdown-and-json-formats.md` says the user's request supersedes D1 and that "every other ruling of that spec still holds". For `--format tsv|json|markdown`, `skills/wp-order/SKILL.md` Step 2 departs from four acceptance criteria of `261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md` `### C1`. The spec record is still `_o_`, and neither record names the departures.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. This is traceability, not behaviour. The plan's Approach and Risks table argue for each departure, and the plan was approved. A later reviewer reading the spec against the skill will still have to re-derive them. This pass had to.

**Evidence.** The four C1 criteria and what the skill now does in the non-text formats:
1. "rendered … in the project's chat language". The `markdown` reply is English. The plan's Risks row says "Accepted".
2. "the person sees [the `note=`] content as a separate sentence". Step 2 says "a `note` in them is not repeated".
3. "Every cycle, unresolved-entry and unreadable-record row … is named to the person, along with what each means". `tsv` and `json` output goes back verbatim and unannotated.
4. "usage error (1) … reported as a fusion defect". The skill now reports exit 1 with an argument as the user's argument.

**Acceptance.** Whoever closes the work package adds a line to the spec, or to the plan head, that names these four C1 criteria as holding for the text format only from 12.2.0 on, with the plan as its source. The spec's marker then moves on its own terms. No shipped file changes.

**Reconciliation 261002-1155 (state-auditor, domain `code`, HEAD `23e97066`) — still open.** The work package closed `done` at `3210689a` without the line this record asks for: neither 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md nor 261002-0733_*_plan-work-order-markdown-and-json-formats.md names the four `### C1` departures (`grep -n 'C1'` over the plan head finds none). The line is a spec/plan description edit, which a reconciliation pass may not write; the spec stays `_o_` until it lands.

Resolved: 261002 — the spec `261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md` carries a scope note directly under `### C1` naming the four criteria as holding for the text format only from 12.2.0 on, with `261002-0733_*_plan-work-order-markdown-and-json-formats.md` as its source. No shipped file changed. The spec stays `_o_`; its marker moves on its own terms.
