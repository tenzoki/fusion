# Planner session: C2 — what travels between checkouts is settled

**Status:** Complete
**Date:** 2026-08-23
**Agent:** planner
**Circle:** `260823-0023-settle-what-travels-between-checkouts` (passed as the resolver's target at Setup step 2)
**Dispatch:** orchestrator, `**Executors:** coder, ontocoder, analyst`

## What was planned

The implementation plan for capability C2 of `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, written to
`260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`.

Nine steps, dependency-ordered. Eight route to `coder` and one to `analyst`. **No step routes to `ontocoder`**, and the reason is that C2 changes no structured data file: the `.fusion-setup` marker is JSON, but the change is to the skill-body prose that writes it, and `.gitignore` and `.gitattributes` are repository configuration, which the routing table assigns to `coder` along with build configuration of any extension.

## Measurements taken, rather than inferred

Five behaviours of `git check-attr` were measured in a scratch repository under the session scratchpad before the mechanism was designed, and the full idempotent block was then run three times against a `.gitattributes` carrying a comment and one unrelated rule. Result: the rule line appears exactly once, the neighbouring rule still applies afterwards (`git check-attr binary -- foo.png` returns `binary: set`), a missing final newline is handled, a broader glob already setting `union` suppresses the write, a foreign merge driver is left alone, and a non-git directory exits 128 so the `git rev-parse --is-inside-work-tree` guard must run first. The scratch tree was under `/private/tmp/…/scratchpad/gatest` and nothing was created inside the repository.

Growth-bound head-room at HEAD `3ee8eaf`, computed from the checked-in goldens against the baseline maps: `skills/` 4 338 bytes, `agents/` 15 163 bytes, always-on rules about 3 509 bytes, hook tests 287 lines. The `skills/` figure is the binding constraint and it is tight: three of C2's changes land there. The plan's answer is not terser prose but placement. The reasoning for the merge driver, the portfolio reclassification and the marker write condition goes into `rules/workbench-tracking.md`, which `bin/fusion-rules` emits to no agent and which therefore falls on no bounded surface, while the skill bodies carry the executable block and a pointer. Estimated additions under that split are about 2 950 bytes on `skills/` against 4 338 available. Every step that touches a bounded surface measures it after its own edit, and the first step to trip a bound stops and asks the user.

## Three findings that changed the plan

1. **The Grounding's claim that this is Setup's first write outside `fusion-workbench/` is false.** Step 0g already writes `.claude/settings.local.json` and appends to `.gitignore`, both at the project root. Filed as a defect; it makes the plan better rather than worse, because Step 0g is a reusable convention for exactly this kind of write.
2. **The pointer condition already has a name.** `agents/playmaker.md:95` defines `MISSING-POINTER` as `.active-circle` absent with at least one `_t_` Circle present, which is precisely the second-checkout state. Setup's new report reuses it and adds no second vocabulary. Setup thereby becomes the fifth writer of `.active-circle`, and `rules/fusion-workbench-conventions.md` prescribes adding it to that file's writer enumeration in the same commit, which the step does.
3. **The defect C2 closes carries a fix direction the Circle overrules.** `260816-1049` recommends keeping `portfolio.md` in the records group; the user's answer 6 moves it to class L. The step says so explicitly, because an executor reading the record would otherwise undo the Circle's own answer.

## Records filed

- Decision: `260823-0800_*_does-the-two-checkout-transport-verification-become-a-shipped-check.md` — binds C3 and C4, which need the same verification. C2 proceeds on the one-off reading and is not blocked.
- Defect: `260823-0800_*_two-further-surfaces-classify-portfolio-md-as-an-authored-record.md` — `hooks/lib/staging-drift.ts` `ROOT_RECORDS` and `agents/orchestrator.md:1138`, both outside the dispatch's scope bound.
- Defect: `260823-0800_*_the-groundings-first-write-outside-the-workbench-claim-was-already-false-when-it-was-written.md`

## Open decisions read at Setup

Of the open records under `$SCAN_DECISIONS`, three bear on this plan and none blocks it. `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` is cited in the plan's open questions because C0 proceeded on option 1 and the head-room arithmetic follows from that. `260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md` is held out of this Circle by the user's own placement and no work is planned against it. `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` belongs to C3.

Two answered records were confirmed on disk at `_a_` with `Answered:` lines: the event-log merge decision and the second-checkout activation decision. Step 8 of the plan closes both to `_i_`.
