# Coder session: the `_a_` row's store-segment instruction is deleted, and the neighbours carry no copy of it

**Date:** 2026-09-05 10:36
**Status:** Complete
**Agent:** coder (dispatched by user)
**Domain:** code
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**HEAD at start:** `f75bf1ab`

## Task

Recommendation R1 of `260905-0529-consumer-findings-citation-form-and-decision-authority.md`, and nothing else in that consultation: delete the sentence in the `_a_` row of `rules/fusion-workbench-conventions.md` `## State Markers — decisions` that instructs a citation to carry its store segment, put a pointer to `## Filename Patterns` in its place, and read the `_i_`, `_d_` and `_s_` rows in the same pass for the same drift.

Out of scope by the consultation's own reasoning: `rules/decision-record-examples.md` (R2, blocked on the unanswered `path:line`-versus-anchor question), the `RECORD_EXAMPLE_FILES` and fenced-code exemptions in `hooks/lib/citation-scan.ts` (R3), and everything about decision authority (R4, R5).

## What was done

One edit, one line, in `rules/fusion-workbench-conventions.md` line 274.

Before:

```
The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. Cite the path as it stands, whether that is inside a Circle or in `shared/`.
```

After:

```
The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. That citation takes the form `## Filename Patterns` defines.
```

The `:line` half of the template is untouched: which form a resolution line takes is R2's open question, and the pointer defers it to the one section that will carry the answer.

**The neighbours carry no copy of the drift.** `_i_` names `Implemented: <commit hash> or <path>:<line>`, `_d_` says only "cite the deferral target", `_s_` names `Superseded by: <path> — <reason>`; none of the three instructs a store segment or a Circle-versus-`shared/` distinction. A grep for the phrase across `rules/`, `agents/` and `skills/*/SKILL.md` returns this one line and no second instance.

## Outcome

The contradiction is gone: the marker table now points at the binding rule instead of contradicting it, and `hooks/lib/citation-scan.ts` implements what both sections now say.

Byte delta: 52 629 → 52 613, sixteen bytes off the always-on rule surface. A shrink never trips a growth bound.

**One pinned golden went stale and was deliberately left stale.** `hooks/lib/__tests__/fixtures/rules-emission.golden` records `fusion-workbench-conventions.md 52629` and a per-agent total in every one of its sixteen blocks; the sixteen-byte shrink moves all of them, so `rules-emission-golden.test.ts > matches the checked-in golden, agent by agent` fails and `npm test` exits 1 with 824 of 825 tests passing. The dispatch instructed that a moved inventory be named rather than edited. Regenerating it is the documented deliberate act (`cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`, a run that rewrites the fixture and then fails on purpose), and it belongs to whoever commits this change.

## References

- `260905-0529-consumer-findings-citation-form-and-decision-authority.md` — the binding analysis, R1
- `260828-0904_*_does-the-mandated-citation-form-include-the-store-segment.md` — the decision the repaired sentence predates
