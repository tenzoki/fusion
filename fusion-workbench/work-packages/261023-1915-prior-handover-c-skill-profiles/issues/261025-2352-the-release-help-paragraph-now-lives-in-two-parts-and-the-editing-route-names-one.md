The release help paragraph now lives in two parts, and the editing route names one
---
`skills/help/SKILL.md` `### 4. Update` is the paragraph every release edits. It is now `skill-help/parts/21-claude.md`, and `21-prior.md` carries the same 4 430 bytes after a Prior preamble. A release that edits only the Claude part keeps the byte test green and ships a stale Prior help. Severity: Low. Fusion fixes this in plan step 22.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer (plan step 22)
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md (steps 22 and 23)

## Defect

- `catalog/profiles/skill-help/parts/21-claude.md` (4 430 bytes) is the release-notes span. It is `claude` because every note says `fusion --update`.
- `21-prior.md` (4 642 bytes) is a two-sentence Prior preamble followed by the same notes, word for word (`diff` of the two, word by word, adds only the preamble).
- `catalog/README.md` `## Editing a converted prompt` and `README-agents.md` `## Releasing` say nothing about editing two parts, and no test compares them.
- Plan step 23 edits this paragraph for 13.4.0.

## Fix direction

Re-cut span 21 so that the release notes sit in a `neutral` part, with `fusion --update` moved into a short `claude`/`prior` pair before them. Or have step 22's route and a test state that the two parts move together.

## Acceptance

- One edit, to one part, updates both renders' release notes, or a test fails when they differ.
- `cd catalog && npm test` exits 0, and the Claude render diff stays empty.

---
Resolved: `catalog/src/__tests__/prior-commands.test.ts` `the release help parts` holds the ordered version tokens of `skill-help/parts/21-claude.md` and `21-prior.md` equal, so a release that edits one part turns it red. It compares the version tokens and not the wording, because the two already differ by the host's slash-command tokens.
