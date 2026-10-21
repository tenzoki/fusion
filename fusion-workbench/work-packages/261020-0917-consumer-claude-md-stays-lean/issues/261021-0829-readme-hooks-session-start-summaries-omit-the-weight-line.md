Two `README-hooks.md` summaries of `session-start.ts` omit the CLAUDE.md weight line
---
Step 7 added the weight line to the `## Files` row, but two other descriptions of the same hook in `README-hooks.md` were not updated. One still says "Silent otherwise".
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.**

- `README-hooks.md`, the SessionStart ASCII tree under `## Concept`: "Warns when the workbench root sits ABOVE the working directory instead of at it, and names the periodic checks that are due (lib/checks-due.ts). Silent otherwise." `e985638c` updated it for the due line. `7e081eb6` (the weight line) did not, so "Silent otherwise" is false while a section is over the threshold.
- `README-hooks.md`, the `**`hooks/`**` bullet near the end: "The third warns, as a `systemMessage`, when a workbench root is found *above* the working directory rather than at it." It names neither new line.
- For contrast, the `## Files` row for `session-start.ts` describes both lines correctly.

**Scope.** Documentation only.

**Acceptance.** Both passages name the due line and the weight line, or point at the `## Files` row instead of restating the hook's products. `npm test` stays green.

---
Resolved: the SessionStart tree and the `hooks/` bullet name the due line and the weight line and point at the `## Files` row; commit "fix: closing-review findings of the lean-CLAUDE.md package", 2026-10-21.
