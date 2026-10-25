38 `prior`-part citations name request-76 questions by a number only the span map assigns
---
32 skill `prior` parts cite "(request 76, question N)" 38 times. The numbers come from the span map's list. Request 76 is not written yet, and any renumbering silently repoints shipped bundle text. One citation is already wrong. Severity: Low. Fusion fixes this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer (parts), with package F's request writer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-2218-skill-span-map-for-entry-profiles.md (`### Questions for request 76`)

## Defect

- `grep -o 'request 76, question [0-9]*' catalog/profiles/*/parts/*-prior.md | wc -l` gives 38, in 32 files. By number: 1 ×4, 2 ×1, 3 ×22, 4 ×3, 5 ×2, 6, 7, 8 ×1 each, 9 ×2, 10 ×1.
- `catalog/profiles/skill-discuss/parts/09-prior.md`: "`--infer` or `--close` started as an entry run of its own finds none open (request 76, question 2)". Question 2 is the workspace basis. The run-spanning question is 11 (span map P9).
- Issue `261025-2352-skill-prior-parts-and-request-76-question-5-call-tmp-persistence-unstated-which-prior-08c57fb-states.md` asks for question 5 to change. Its two citations then point at a different question.

## Fix direction

Either package F keeps the span map's twelve numbers verbatim in request 76, and a step-25 check holds them, or the parts cite the topic ("request 76, per-checkout state") rather than the number. Fix discuss 09 in either case.

## Acceptance

- Every "(request 76, …)" citation in a `prior` part resolves to the question it means in the committed request 76.
- `skill-discuss/parts/09-prior.md` cites the run-spanning question.
