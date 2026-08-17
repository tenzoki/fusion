Rules lose their effect during a long dispatch

---
Reported by the user on 260812: rules become ineffective over time, mid-session. He extends the
hypothesis to project goals and Circle Directives, and draws a consequence from it — agents must
not perform long operations without returning to the orchestrator.

---
**Witness:** the user, directly, across projects
**Severity:** high, and it is the hypothesis the largest number of other defects would follow from
**Affected:** every agent; the mechanism is `bin/fusion-rules` and the Setup contract

What makes this hard to establish rather than merely believe: from inside this repository nobody
can measure a model's attention. What is measurable is the artifact — a convention honoured early
in a dispatch and violated later by the same agent, with the gap between the two.

One documented instance from this project, and it is exact. On 260811 an executor was told the
convention for staging a marker rename. Its own report, at the end of a 45-minute dispatch, warned
the orchestrator about that very trap in the general case — and it had itself left the rename staged
and the note unstaged, which is the trap. The knowledge was present in the report and absent in the
act, in the same minute.

Remedies to weigh against each other rather than adopt in order:
1. shorter dispatches, the user's proposal — bounded work, return to the orchestrator, re-enter;
2. restating the load-bearing rules inside the dispatch prompt, where they sit closest to the work;
3. cutting the corpus so that what is loaded is closer to what the task needs;
4. a mechanism that re-reads rules at intervals during a dispatch.

Note that (2) is what the orchestrator already does informally in well-written dispatches, and this
session's best executor outcomes correlate with it. That is an observation, not a measurement.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). The stated cause is refuted and the symptom is not. `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measured within-document em-dash compliance improving toward the end of a document, which is the opposite of context-depth decay. The remedy the analysis recommended — attach the rule to the act rather than stating it apart from it — was not adopted: `task_start` is still a standalone instruction (`agents/orchestrator.md:487`, `:1190`) with no lint behind it, and decision `260810-0710` on whether a rule may land without its enforcing check is still deferred. Retitling this record would be a rewrite of its analysis, which a reconciliation pass does not do; the correction is recorded here instead.
