`list` answers a legacy workbench with an empty list and names no state
---
On a workbench without `workbench.json` the bundle answers `list` with `ok: true` and `records: []`, and the result carries no `state`. `validate` and `reconcile` on the same workbench do carry `state: "legacy"`, and `inspect` reports it. A caller that lists without inspecting first therefore reads a legacy workbench as an empty one, which for a scope resolver means "no package claimed" and a silent fall to the shared store: the failure section 7 of the specification forbids for `bin/fusion-claimed-package`.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md

Evidence: measured at fusion `b4c8f7ca` with `codec/dist/fusion-record.js` (`sha256:5f116c6436175a6b8e1cb08aa2625d2e2f68ef193657b00eb1891ea8d3b965bd`) over a scratch directory holding `.fusion-setup` and one v12 work package and no manifest. `{"op":"list"}` answered `{"ok":true,"result":{"workbench":"…","scope":null,"records":[]}}`; `{"op":"validate"}` answered `state: "legacy", checked: 0, valid: true`; `{"op":"inspect"}` answered `state: "legacy"`. The code is `list` in `codec/src/cli/ops.ts`, which builds its result from `workbench`, `scope` and `records` alone. No recorded exchange of the three sessions sends `list`, so no recorded byte depends on the shape.

The FJ03a plan does not fix this in the codec, because a changed answer moves the bundle digest both hosts pinned. It makes the format gate (`inspect` before any other request) mandatory in the Claude-side client, and hands the finding to the Prior side as a numbered request.

Acceptance: either `list` carries `state` as `validate` and `reconcile` do, with a fixture and a re-pin agreed with the Prior side, or the Prior side rules that a host gates on `inspect` and the rule is stated in `codec/README.md` `## The CLI`. In both cases a test on the Claude side shows that a legacy workbench is never answered as "nothing claimed". Executor: `code-implementer`, after the Prior side's answer.
