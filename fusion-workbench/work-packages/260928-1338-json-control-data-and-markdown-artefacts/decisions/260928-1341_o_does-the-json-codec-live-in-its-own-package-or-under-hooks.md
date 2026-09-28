# Does the JSON codec live in its own package, or under hooks/ inside the existing growth bounds?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md, 260928-1338-json-control-data-and-markdown-artefacts.md, 260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md, 260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md

---

## Question

Prior's `concept/fusion-json-workbench-spec.md` (2026-09-28) asks fusion for schemas, a strict reader, transition rules, a Prior DTO mapping and a fixture suite (FJ00), then a codec with a process boundary both hosts bind to (FJ01). Fusion's only TypeScript home today is `hooks/`, whose test suite is bounded at 3 030 lines of head-room over a floor of 19 228 and stands at 22 252 lines at `40a1713f`: **6 lines of room**. `CLAUDE.md` `## Conventions` says a red bound is answered by a cut, never by a baseline edit. The ruling of 2026-09-27 that the growth bound yields to the dual-host prompt set names the dispatch text and the head-room raise as the instrument's first move; it says nothing about the test-line bound. Where the codec's code, schemas, fixtures and tests live decides whether FJ00 can be proven by a suite at all.

## Options

1. **A sibling package `codec/` at the repository root** — its own `package.json`, `tsc` and `vitest`, its own suite; ships nothing in FJ00; FJ01 decides its shipped form beside `hooks/dist/`.
   - Pros: the three bounded surfaces are untouched, so the bound keeps measuring what it was derived for (hook growth); the codec is the one implementation both hosts bind to, which the spec asks for, and a separate package is the natural unit Prior can consume as a process or a built artefact; the suite can be as large as the contract needs.
   - Cons: a second Node package to install, build and keep coherent with `hooks/` (Node version, TypeScript version); the installer's copy loop and `committed-dist.test.ts` gain a sibling to cover in FJ05; a reader could see it as the bound being walked around, so the record has to say why it is not: no dispatch path reads a byte of `codec/`.
2. **Under `hooks/lib/` and `hooks/lib/__tests__/`, paying with cuts** — the codec's tests join the bounded suite and every added line is paid for by cutting elsewhere in the suite.
   - Pros: one package, one build, one committed `dist/`, the existing installer already ships it.
   - Cons: the contract needs several hundred test lines at least (an exhaustive transition enumeration, a manifest-driven fixture suite, round-trips); cutting that much out of a suite that was itself cut on 2026-09-11, 16, 17 and 18 costs coverage the project decided to keep; the hooks are observation-only by decision and a codec is not a hook.
3. **Under `hooks/`, raising `TEST_LINE_HEAD_ROOM` under the 2026-09-27 ruling** — read that ruling as covering every bound the dual-host work meets.
   - Pros: one package, no cuts.
   - Cons: the ruling's text is about the dispatch text; reading it onto the test-line bound extends a ruling the user gave on a different quantity; the bound was raised five times already and each raise is logged as a debt.

## Constraints

- The spec's section 6: one codec implementation, no second independent parser, no Node requirement in Prior's core, no Go build for the Claude user.
- `CLAUDE.md` `## Conventions`: a red bound is cut, never re-baselined; `260822-1154_*` option 1: a cut-only change never re-baselines.
- The per-dispatch-path bound charges only what a dispatch reads; nothing under `codec/` is read by any dispatch.

## Recommendation

Option 1. The bounds exist to hold the rate at which the text every session loads and the hook suite grow, and the codec is neither: no agent reads it and no hook runs it. Putting it beside `hooks/` keeps both instruments honest, and it is the shape FJ01 needs anyway when Prior binds to the same implementation. The record states plainly that this is a new surface and not a way around a bound, and FJ05 adds it to the installer and the committed-dist check as the shipped surface it then is.
