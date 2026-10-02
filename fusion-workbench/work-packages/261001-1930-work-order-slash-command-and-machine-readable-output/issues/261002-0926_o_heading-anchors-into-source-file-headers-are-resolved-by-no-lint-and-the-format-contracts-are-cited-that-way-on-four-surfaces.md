Heading anchors into source-file headers are checked by no lint, and the format contracts are cited that way on four surfaces
---
Class (b) of `hooks/lib/__tests__/reference-resolution-lint.test.ts` (`ANCHOR_RE`) only resolves anchors whose file token ends in `.md`. A citation of the form `` `hooks/order.ts` `## The JSON format` `` is checked for its path only, never for its heading. Renaming or removing a `## The … format` section in the `hooks/order.ts` header leaves every citation of it dangling, and the suite stays green.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. This is a cross-cutting gap that predates the range. The range widens it.

**Evidence.** At `d3311e73`, the `hooks/order.ts` `## The TSV format` / `## The JSON format` / `## The Markdown format` contracts are cited by heading in `skills/wp-order/SKILL.md` (Step 2), `skills/help/SKILL.md` (`### 4. Update`, the 12.1.0 and 12.2.0 paragraphs), `README-hooks.md` (the `order.ts` row and the `bin/fusion-work-order` roster row) and `README-agents.md` (the `/fusion:wp-order` row). The same unchecked form also points at `hooks/session-start.ts` (`rules/project-language.md`) and `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` (`README-hooks.md`). The BASELINE re-approvals of this range report "anchors … unmoved" although the range added anchor citations. That is consistent with the `.md`-only scope, and it is also the symptom.

**Acceptance.** One of these holds:
- (a) class (b) also resolves `## X` against a `.ts` or `bin/` file's header comment, matching a comment line `* ## X` or `# ## X` by prefix as for Markdown. The anchors above count toward `BASELINE.anchors`, and renaming `## The JSON format` in `hooks/order.ts` turns the lint red.
- (b) the lint header says that anchors into non-Markdown files are deliberately not resolved, and why.

**Reconciliation 261002-1155 (state-auditor, domain `code`, HEAD `23e97066`) — still open.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` is unchanged since `d3311e73`: `ANCHOR_RE` still resolves `.md` file tokens only and the file header states no deliberate exclusion, so neither (a) nor (b) holds. The work package closed `done` at `3210689a` with this record open.
