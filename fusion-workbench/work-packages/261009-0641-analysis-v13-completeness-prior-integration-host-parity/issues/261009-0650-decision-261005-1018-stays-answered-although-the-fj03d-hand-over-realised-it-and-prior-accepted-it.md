Decision 261005-1018 stays answered although the FJ03d hand-over realised it and Prior accepted it
---
The decision `261005-1018_*_which-other-kind-hits-reach-prior-as-another-record-type-at-the-fj03d-hand-over.md` has `control.state` `answered`. Its answer was realised in data at `e7695d9c`: `codec/fixtures/prior/REQUESTS.md` `### The classification (step 10, at fj03d 29dac3c5)` folds the hits as 233 / 155 / 7 / 38 apart, exactly as the `Answered:` line rules. Prior accepted that fold at Prior `7da6690` (`Prior: docs/design/fusion-fj03d-prior-response.md`, "61: Yes"). A pass that lists the current evidence base (`open` + `answered`) therefore still shows a settled choice as pending.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261009-0650-prior-fusion-integration-status.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Evidence: `echo '{"op":"list"}' | bin/fusion-record` with `FUSION_WORKBENCH` set to this workbench, run at fusion `0ffee3c4` on 2026-10-09, answers `answered` for that decision's control path.

Acceptance: the dispatcher appends the `Implemented:` line citing the hand-over section, then sends `bin/fusion-write transition --to implemented --implementation-ref '"e7695d9c"'`. Afterwards `bin/fusion-record show` on the decision answers `implemented`.

Resolved: 2026-10-09, the decision carries its `Implemented:` line citing `e7695d9c` and stands at `implemented`.
