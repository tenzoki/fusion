# Should the reconcile quadratic fix and the plan/spec role ride the initialize bundle revision?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8
**Outcome:** did not converge after 2 rounds
**Cross-references:** 260930-1654_*_plan-initialize-the-codec-creates-a-new-workbench-and-list-names-its-state.md, 260930-1712_*_the-codecs-reconcile-grows-with-the-square-of-the-record-count-and-outlasts-the-clients-timeout-from-about-1200-records.md, 260930-1646_*_the-sweeps-binding-pass-spawns-one-show-per-package-and-evidence-row-for-data-the-index-already-holds.md, 260930-1654_*_does-a-read-finish-a-committed-initialize-whose-manifest-has-not-landed-or-report-the-target-as-legacy.md

---

## Question

The orchestrator put to the user, before approving the initialize plan (committed at `0f805a6e`), whether to fold two further codec changes into the same bundle revision: the fix for `reconcile` growing with the square of the record count (issue filed at `b3909330`), and the plan/spec role in `reconcile`'s references (the sweep follow-up left open at `b3909330`). The recommendation was to fold both in, so the Prior side re-pins once. The user opened this discussion instead of answering.

## What held up

### C1 — Folding changes into the initialize revision means the Prior side re-pins and runs conformance once instead of twice.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/fixtures/prior/REQUESTS.md:401` (item 28 uses the same reasoning for `list.state`). Condition: issue `260930-1712_*` says the reconcile fix is the Prior side's to rule on before the bundle moves, so one re-pin holds only if that ruling arrives before the plan's step 7.

### C4 — The cause is `resolveRecordId` reading every control file per reference; an index built once per call makes reconcile linear.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/src/kernel.ts:325-335` walks and parses every control file per call; `codec/src/cli/ops.ts:1783`, `:1654`, `:1688` call it per reference site, evidence binding and edge; `readContext` is built once per reconcile (`ops.ts:1757`); `dependencyEdges` already walks once (`ops.ts:1163`).

### C7 — The two folds are not alike: the reconcile fix is plausibly byte-neutral and belongs in the revision subject to Prior's ruling; the role field reopens a pinned recorded session, the reason the plan already gives for keeping paging out. Folding the fix but not the role is the option consistent with the plan's own rules.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** plan `260930-1654_*` line 80 (recorded sessions stay byte-identical) and line 215 (paging kept out for that reason); C5 below.

### C8 — The role is present in the record data (`active_documents[].role` ∈ {spec, plan}, required); its absence from reconcile is a gap in the answer's shape, which a later revision reopening the recorded sessions could close.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/schemas/package.schema.json` `required` at line 133, enum at line 136.

### C10 — The index must be built inside `reconcile`, not inside the shared `readContext`, because mutations resolve through the same context and a cached index could go stale within one mutation.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `readContext` is shared (comment above `codec/src/kernel.ts:317`); `create` checks a free id through `ctx.resolveRecordId` (`codec/src/cli/ops.ts:595`, `:712`); `reconcile` only reads and builds its context once (`ops.ts:1757`). Facts verified, risk inferred. C2 and C4 depend on this placement.

### C11 — Folding the reconcile fix alone keeps the initialize plan inside its file scope and, by estimate, under the advisory 40 000-byte plan-size ceiling.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the fix lives in `codec/src/kernel.ts` and `codec/src/cli/ops.ts`; the plan's scope lines (plan lines 12 and 179) exclude `agents/`, `skills/`, `rules/`. Ceiling `hooks/lib/plan-size.ts:72` (`DEFAULT_CEILING = 40000`, advisory, exit 0). Byte half inferred: 36 627 bytes now, an index step at the median step size adds about 1.5 to 2.5 KB, so about 38 to 39 KB; a step as long as step 3 would cross the advisory ceiling.

## What fell

### C3 — Without the fix, this repository's own workbench after FJ04 (roughly 2 400+ records) makes the scope, order and citation helpers time out.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the route holds (`hooks/lib/work-graph.ts:421`, `hooks/lib/record-index.ts:34` send unscoped `reconcile`; timeout 70 s at `hooks/lib/record-client.ts:146`), but the figure does not: 2 459 is a count of Markdown files outside `archive/`, and `REQUESTS.md:477` says not every file becomes a record.
- **Conceded:** first partner, round 1 — the 2 459 figure counts files, not records (`REQUESTS.md:477`); the record count is C9.

### C5 — Adding the plan/spec role to reconcile's `references` is additive and breaks no pinned byte Prior relies on.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/fixtures/protocol-session-fj02/15-reconcile.response.json` carries `/active_documents/0/ref` entries and is pinned at Prior `tests/testdata/fusion-fj01/UPSTREAM.json:37`; adding `role` changes its bytes.
- **Conceded:** first partner, round 1 — the pinned response file changes (`fusion-fj01/UPSTREAM.json:37`).

## What could not be decided

### C2 — The reconcile fix changes no answer byte, so every recorded session, golden and fixture stays valid.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** missing input: the implemented index and a replay of the recorded sessions. By inspection it can stay byte-neutral if it keeps `hits` in controlFiles order (`kernel.ts:333`), skips files the strict reader refuses (`kernel.ts:329-331`) and, like `resolveRecordId` today, applies no `blockedOn` filter (`kernel.ts:325-336`; only `readPair` checks it, `:321-322`); `controlFiles` returns a sorted list (`codec/src/store.ts:351`), which the ambiguous-reference detail lists in order (`kernel.ts:335`). The bundle digest moves regardless (`fusion-fj01/UPSTREAM.json:6`).

### C6 — Folding both in keeps the initialize plan within its bounds and does not materially delay FJ03c.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** missing input: where the 40 000-byte bound comes from, and the Prior side's schedule. The plan is 36 627 bytes; FJ03c's gate is the re-pin plus item 32 (plan line 181). Split in round 2 into C11 (scope and size, held up) and C12 (delay, not decidable); this entry stays undecided because C12 does.

### C9 — After FJ04's real migration, this repository's workbench holds more than about 1 200 records, so the reconcile fix is needed before that migration.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** missing input: the FJ04 rule on whether a terminal record outside the archive gets a control file (spec §2.1, "höchstens extrahierte Metadaten"; settled by the §8.2 survey plan). Counts outside `archive/` from file-name markers: 46 packages, 857 issues (8 open), 72 plans (22 live), 267 decisions (7 open), 5 discussions (2 open). Every file a record: 1 247, at the threshold; only packages and live records: about 85. `controlFiles` walks the whole root skipping only dot directories (`codec/src/store.ts:334-351`), so pairs archived later still count. Inferred: the cost is references times control files, not the record count alone.

### C12 — Folding the reconcile fix into the initialize revision does not materially delay FJ03c.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** missing input: the Prior side's schedule for ruling on the index fix and for the re-pin. FJ03c's gate is the re-pin plus item 32 (plan line 181).

## Recommendation

Qualified, and binding nothing. After round 2 the partners' interim reading was: fold the reconcile fix into the initialize revision, subject to the Prior side's agreement, and keep the plan/spec role out because it changes the pinned recorded session `15-reconcile.response.json` (C5, C7). Four entries stayed undecidable for want of inputs no further round could supply (C2, C6, C9, C12).

Before the user answered, the Prior side ruled at Prior `a15dfc8` (`docs/design/fusion-initialize-reconcile-plan-amendment.md`, with a change to `concept/fusion-json-workbench-spec.md`): initialize, the reconcile performance fix and the plan/spec role go into one qualified codec revision; the fix is a precondition of the real migration, which answers the purpose C9 asked about. The fixture exception C5 and C7 raised is accepted there by name: the role field changes the FJ02 recorded reconcile answer, and only the pure performance fix must stay byte-identical. That ruling, not this record, is what the initialize plan now follows.
