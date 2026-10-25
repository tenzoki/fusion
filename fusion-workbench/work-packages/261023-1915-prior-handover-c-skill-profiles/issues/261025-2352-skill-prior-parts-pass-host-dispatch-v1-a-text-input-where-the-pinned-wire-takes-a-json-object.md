The dispatching skills' `prior` parts pass `host.dispatch.v1` a text input, and the pinned wire takes a JSON object
---
reconcile, curate and discuss tell the run to give `host.dispatch.v1` "the dispatch text", "the parameter lines followed by the task", as `input`. At Prior `08c57fb` the dispatch tool's `input` is "its role input as a JSON object written as a string", and a value that does not decode to an object is refused. No `prior` part, agent or skill, states which object. Severity: High. Fusion fixes the text; request 76 must carry the shape.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-2218-skill-span-map-for-entry-profiles.md (Finding 3, class `DISP`); 261025-1117-orchestrator-prior-parts-name-no-host-dispatch-v1-so-step-15-alone-cannot-pass-checkentries.md

## Defect

fusion side, at `ec6c968e`:

- `catalog/profiles/skill-reconcile/parts/01-prior.md`, `skill-curate/parts/01-prior.md`, `skill-discuss/parts/01-prior.md`: "one `host.dispatch.v1` call with that agent's bare entry id and the dispatch text as its input".
- `skill-reconcile/parts/15-prior.md`: "as its input, the parameter lines followed by the one-sentence task".
- `skill-curate/parts/09-prior.md`, `21-prior.md`: "The input's first non-empty content line MUST be the mode parameter" / "the first three non-empty content lines of the input".
- `skill-discuss/parts/19-prior.md`: "The parameter line comes first in its input". The line is `**Round:**`. `catalog/catalog.json` declares the `consultant` entry's arguments as `conversation` (`first-message`) alone, and no agent reads `**Round:**` (`grep -rn 'Round:\*\*' agents/ README-agents.md` is empty).
- `consultant/parts/13-prior.md` names `host.dispatch.v1` with no input shape either.

Prior side, read with `git -C /Users/kai/Projects/productive/F09-Prior show 08c57fb:<path>`:

- `internal/supervisor/general_tools.go` `DispatchDescriptor`: "entry is the catalog entry the child runs, input its role input as a JSON object written as a string"; `request` passes `arguments.Input` as raw JSON, and `validDispatch` refuses it (permission denied) when it is not an object.
- `moduleapi/v1/entry_wire.go` `DecodeDispatchCall`: `Decode(c.Input, &input)` into `map[string]json.RawMessage`.
- `internal/supervisor/dispatch.go`: the child's `RoleRequest.Input` is the parent's `input` bytes, and the `Profile` resolver may refuse it by admission (`unknown-argument`).

A run that follows the text sends plain text and is refused. A model that follows the tool description instead invents an object nobody specified.

## Fix direction

1. Request 76 states the shape fusion proposes for a dispatched child's input. The obvious candidate is the child entry's admitted arguments in the `entry-request.v1.json` form, `{"arguments": [{"name": "**Mode:**", "value": "survey"}, …, {"name": "task", "value": "<text>"}]}`, named by the child entry's declaration, with the host composing the rest of the entry request.
2. The three skill bindings and the five call sites say that, once. The consultant's binding names it too.
3. discuss either drops `**Round:**` from the Prior input or the `consultant` entry declares it.

## Acceptance

- Every `prior` part that names `host.dispatch.v1` states the input as a JSON object, in one wording shared by the three skill bindings.
- Request 76 carries the input shape as a row Prior can accept or correct.
- A discuss round's input names no argument the `consultant` entry does not declare.
- `cd catalog && npm test` exits 0, and the Claude render diff over `agents/ skills/` stays empty.
