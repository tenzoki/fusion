# catalog's render test no longer reproduces agents/reviewer.md since 91395e02

## Observation

`cd catalog && npm test` is red on one case: `src/__tests__/render.test.ts > render claude > reproduces agents/reviewer.md byte for byte (reviewer)`. The render from `catalog/` yields 13522 bytes; the committed `agents/reviewer.md` has 13819. Measured at `7bd21581`; the failure predates this package's work. `git log -1 -- agents/reviewer.md` is `91395e02` ("feat(agents): the reviewer routes a function-level CLAUDE.md drift to a move"), which edited the rendered agent without the catalog fragments it is rendered from.

Found by plan step 12 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md`, whose acceptance names `cd catalog && npm test`; step 12's own cases pass (38 of 38), and `tsc --noEmit` is clean.

## Consequence

The host-neutral role text is no longer the source of the reviewer agent, which is what `261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md` rules it must be; the Prior profile rendered from `catalog/` lacks the 91395e02 change.

## Fix direction

Carry 91395e02's change into the catalog fragment the reviewer renders from, so the render reproduces `agents/reviewer.md` byte for byte. Executor: code-implementer. The catalog fragment moves the module bundle digest only if it is in the bundle payload; say which.
