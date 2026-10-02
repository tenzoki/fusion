# Do departures 1 (second sentence) and 5 of the FJ04 step-6a addendum hold?

---
**Domain:** data
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 6
**Ceiling:** 8
**Outcome:** converged
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261002-1236_*_does-priors-a1fb17a-contract-govern-c8-c16.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

The analyst's draft of the FJ04 step-6a addendum to `codec/fixtures/prior/REQUESTS.md` (scratchpad `fj04-6a-addendum.md`, stamped against fusion `92b375d5`, Prior `1dfd446`) names five departures from Prior's a1fb17a text. Two are new and stand neither in the approved plan nor on `wip/fj04-step6`:

- **Departure 5:** a reconstructed request (the exempt `end` and `begin`, and each scheduled answer's request) is tried in two forms, with `workbench` absent and with `workbench` equal to the root of the request being served, because `requestDigest` covers the request as sent and `workbench` is optional. The alternative put to the user is a host rule: fusion's host never sends `workbench` during a migration.
- **Departure 1, second sentence:** a scheduled answer that does not validate refuses as `conflict/after-state-changed` in a rollback and as `migration-incomplete/receipt-unverified` in the second-run no-op, the same as a missing or changed baseline answer.

The orchestrator put both to the user as a confirmation question; the user answered by opening this discussion. The standing acceptance criterion from the previous discussion applies: fusion stays operable directly in Claude Code, with no Prior at runtime.

## What held up

### C1 — `requestDigest` covers the request exactly as sent, and `workbench` is an optional request field, so a stored answer's digest differs depending on whether the host sent `workbench`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/src/journal.ts:109-118`, `kernel.ts:319`, `migration.ts:827` (digest over the request as dispatched); `codec/schemas/protocol.schema.json:57,346,357,391,404,416` and `codec/src/cli/protocol.ts:113` (optional except on `initialize`); `kernel.ts:342,376`, `journal.ts:385-387` (a stored answer keeps only `request_digest` and `op`).

### C2 — Without departure 5 or a host rule, a reconstructed exempt `end`/`begin` or scheduled request can fail to match its genuine stored answer, which would make the rollback audit or the second-run no-op refuse a clean migration.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/record-client.ts:225` sends `{ ...request, workbench: resolve(workbench) }` on every request, including the archive helper's maintenance `begin`/`end` (`hooks/lib/record-archive.ts:556,565`); a reconstruction without `workbench` cannot match those.

### C3 — Two-form reconstruction admits no false match: no stored answer of a different request, or of another workbench, digests equal to either form.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `canonical` is injective over JSON values (`journal.ts:109-115`), so equality needs a sha256 collision; answers are read only from this workbench's own `ops/` (`journal.ts:381`). A differently spelled root is a missed match (C4), never a false one.

### C4 — Two-form reconstruction is sufficient only if every `workbench` value the host can send for this workbench is byte-identical to the root the codec reconstructs with.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the schema requires only a leading `/` (`protocol.schema.json:425-430`), so a relative path is already refused, but a trailing slash, `//`, `/./` or a symlinked spelling all pass; the codec's `resolve(root)` (`codec/src/store.ts:141`) normalises text, not symlinks, while the digest covers the field as sent. Today's two senders keep one spelling (`bin/fusion-workbench-root:26` via `pwd -P`; `record-client.ts:225` via `resolve()`); a caller setting `FUSION_WORKBENCH`, or a second host, could differ. The consultant corrected the claim's parenthetical: the relative-path case cannot occur. Round 2 sharpened the condition: the values must also agree across time, the root at migration time against the root at a later no-op or rollback (C18).

### C5 — The host-rule alternative is checkable by the codec itself: it can refuse a migration-phase or maintenance request carrying `workbench`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `dispatch` reads `req.workbench` before routing (`codec/src/cli/ops.ts:196`). Cost: `record-client.ts:222-225` spawns the codec with `env: {}` and always sets `workbench`, so such a refusal would block fusion's own archive and migration traffic until `record-client.ts` changes.

### C7 — Departure 1's second sentence is required under the addendum's own definition: a scheduled id is excluded from later operations, so a non-validating scheduled answer would otherwise pass silently.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the draft's operation-baseline section defines a later operation as one "neither in the baseline nor one of this plan's scheduled answers", excluding by id. C10 offers the cleaner fix.

### C8 — Neither departure contradicts the user's ruling that Prior's a1fb17a contract governs C8–C16.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Prior `1dfd446` `docs/design/fusion-fj04-amended-contract-prior-response.md:134-135` ("Derive each exempt request from the known request shape and evidence and compare its digest", silent on `workbench`) and `:125-126` (baseline mismatch is "a refusal"). One sentence is wrong: departure 1 calls the non-validating scheduled answer "a case Prior does not address", but Prior takes the set difference against operations "known from the schedule and validated answers" (`:123-125`). Round 2 added a second correction: `:125-126` sits in 52's rollback-exemption paragraph (`:117-127`) and supports the rollback refusal only; for the no-op Prior carries over only "this same definition for `later_operations`" (`:127-128`), so the no-op refusal of a missing baseline answer is also a fusion extension (C17).

### C9 — The host-rule option is not "host discipline only": fusion's host breaks it by construction today, so it costs a code change, while departure 5 matches what the host already sends.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/record-client.ts:225`.

### C10 — With "validated" in the addendum's definition of a later operation, as Prior (`:123-125`) and the plan (`:203`, "this plan's validated scheduled operations") already have it, a non-validating scheduled answer becomes a later operation and refuses as one in a rollback; the only real departure left is the second-run no-op, which the addendum makes refuse as `receipt-unverified` where Prior's reading would only list it in `later_operations`, a list that "decides nothing" (`REQUESTS.md:1723`).

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Prior `:123-125`; plan `:203`; `REQUESTS.md:1723`.

### C11 — "The root of the request being served" is ambiguous between the literal `req.workbench` and the resolved `wb.root` (`store.ts:141`); departure 5 should name `wb.root`, and state that with no `workbench` on the served request the root is the resolved `FUSION_WORKBENCH`.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/src/store.ts:141`; `record-client.ts:225` sends `resolve()`d paths, so `wb.root` is the reading that matches the host.

### C12 — Departure 5's scope is only the codec's own reconstructions; the host-side rebuild of a pending `verify` "from the workbench path" (`REQUESTS.md:1742`) needs no rule, because the host knows what it sent.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `REQUESTS.md:1716-1720` (every migration request shape carries `workbench`), `:1742`.

### C14 — Every missed match under departure 5 is fail-closed; the residual gap costs availability, never lets an unverified state pass, and can be stated as a limit.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** a missed exempt match fails "exactly one stored answer must match each" (draft `:44-48`); a non-validating scheduled answer is a later operation and "every other stored answer refuses" (`REQUESTS.md:1806`); chunk-0 and legacy-`end` progress validation refuse on any mismatch (draft `:67,76`); landedness is by id alone (`REQUESTS.md:1778`). Turning "two matches" into "exactly one" is unreachable: a second `end` for an ended fence is refused and never stored, and the `begin` is looked up by a single id. Caveat: under the draft, a miss in the no-op yields `migration-incomplete`, a wrong diagnosis.

### C15 — Departure 5, worded per C11 and scoped per C12, needs no host change, keeps fusion operable in Claude Code with no Prior at runtime, and covers what fusion's host sends today.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** host sends `resolve(workbench)` (`hooks/lib/record-client.ts:225`); codec opens `resolve(req.workbench)` (`codec/src/cli/ops.ts:196`, `codec/src/store.ts:143`); `resolve` is idempotent. Narrowed: no host file sends a `migration` request today, so "covers" means the archive helper's maintenance `begin`/`end` (`hooks/lib/record-archive.ts:556,565`); that a future migration host also sends through `ask()` is inference.

### C17 — The no-op refusal of a missing baseline answer is a fusion extension with low practical exposure, to be stated as a limit.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** stored answers live under the self-ignoring `.json-state/` (`REQUESTS.md:237,627`; `codec/src/journal.ts:95`), as does the proposal the no-op `plan` needs (`REQUESTS.md:1765,1770`); the refusal fires only if `ops/` lost entries while the proposal survived.

### C18 — Moving the workbench directory after `verify` makes every reconstruction miss in both forms.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** mechanism checked: the digest covers `workbench` as sent (C1), a stored answer keeps only `request_digest` and `op` (`journal.ts:385-387`), and after a move `wb.root` is the new path (`store.ts:143`). A rollback after activation then refuses as `after-state-changed`; the no-op under the draft refuses as `receipt-unverified` permanently, under Prior's reading it lists every scheduled operation in `later_operations`, which decides nothing. Frequency is not established. A codec-wide digest that omits `workbench` would close it, but changes replay matching for every stored answer and lies outside this addendum.

### C19 — Departure 1 reduces to: (a) the definition reads "validated scheduled answers"; (b) the separate scheduled-refusal bullet is deleted; (c) in a rollback a missing or changed baseline answer refuses as `after-state-changed`; (d) the second-run no-op refuses on neither case and follows Prior's `later_operations` definition only.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** (a) Prior `:123-125`, plan `:203`; the draft drops "validated" (`fj04-6a-addendum.md:39`). (b) under (a) a non-validating answer is a later operation and refuses via `REQUESTS.md:1806` with the class `:1768` names. (c) Prior `:125-126` within `:117-127`; the class is already fusion's at `REQUESTS.md:1768`; plan `:203` sits in row R3, the rollback basis. (d) Prior carries only "this same definition" to `later_operations` (`:127-128`); `receipt-unverified` is the three receipt checks (`REQUESTS.md:1770-1776`); the `answers` part file is integrity-bound, an `ops/` entry is not. With (d), C17's limit, C14's caveat and C18's permanent `receipt-unverified` disappear. (d) leaves C22's gap.

### C21 — Whichever option is chosen, the addendum states the residual limit in its own text.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** consistent with C14, C18 and C19(d); under a host rule the text would also have to say whether the codec enforces it.

### C22 — Under C19(d), baseline membership must be defined by the whole entry (`operation_id`, `op`, `request_digest`, `answer_sha256`), not by id; otherwise a changed baseline answer passes the no-op silently.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** stored answers are never rewritten (`kernel.ts:342,376`); with whole-entry membership the changed answer is listed in `later_operations` and refuses in the rollback under both C19(c) and `REQUESTS.md:1806`; the draft (`:39`) does not say which.

### C23 — "This plan's scheduled answers" excludes the `unassigned` surplus ids.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** no request can be rebuilt for an unassigned id (`REQUESTS.md:1702`), so "validated" is undefined for it; Prior names plan, apply and verify (`:123-124`); including rollback ids is harmless, since no rollback answer exists in the no-op state and the audit runs only on the first rollback request (`REQUESTS.md:1778,1767`).

### C24 — If a host rule were adopted without codec enforcement, keeping the two-form reconstruction costs nothing and covers senders the rule does not reach.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** C3 (no false match); the present form still catches a sender that keeps the codec's spelling.

### C26 — Replacement refusals text: in a rollback a missing or changed baseline answer refuses as `after-state-changed`; a non-validating scheduled answer is a later operation and refuses under line 1806; the no-op adds no refusal and answers with `later_operations`, which decides nothing.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** C19(c) (Prior `:125-126`, `REQUESTS.md:1768`); `REQUESTS.md:1806`; the exempt `verify` is found by the same reconstruction (draft `:44-48`); C19(d); the receipt still binds the `answers` part (draft `:38`), so a changed part file stays `receipt-unverified` through integrity (`REQUESTS.md:1773`). Side finding: plan step 6, W3 (plan `:448`) still says "`receipt-unverified` in the no-op, as 6a fixes", which goes stale.

### C29 — C25's definition text, plus after "is withdrawn": "So is its next sentence: `later_operations` names the stored answers that neither the baseline nor the validated schedule accounts for, and does not tell ordinary work apart from a changed or unmatched answer."

- **Advanced by:** consultant
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** `REQUESTS.md:1723` (its second sentence claims `later_operations` tells ordinary work from an incomplete migration); C22; C27's limit.

### C30 — C27's reconstruction text with the bracket "(the exempt `end` and `begin`, each scheduled answer's request, and each answer before chunk 0 that the `progress` list names)" and the limit: "a rebuilt request misses in both forms when the original request carried `workbench` spelled differently from that resolved root. Every answer fusion's host stored before the workbench directory was moved is such a case; baseline entries are not rebuilt and are unaffected. Every miss refuses: the first rollback after activation as `after-state-changed`, and rollback chunk 0's check of its `progress` list and any later rollback chunk as their own refusals. The no-op lists the affected answers in `later_operations`."

- **Advanced by:** consultant
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** draft `:59,66-67,72` (chunk 0's own entry and legacy `end` rebuild nothing; chunk 0's and later chunks' refusals carry no named class); C14; C18; `codec/src/store.ts:143`, `codec/src/cli/ops.ts:196`.

### C31 — C28's departure list plus: "6. The scheduled answers set aside from later operations include the rollback chunks' answers besides plan, apply and verify, which Prior names. `REQUESTS.md:1806` already counts them as progress, not as exemptions."

- **Advanced by:** consultant
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** Prior `:123-124`; C23; draft `:59`; `REQUESTS.md:1806`.

### C34 — In C26's refusal text and in departure 1, "In a rollback" becomes "In the first rollback after activation"; departure 1 reads: "In the first rollback after activation, a missing or changed baseline answer refuses as `after-state-changed`. Prior names only "a refusal" there. The no-op adds no refusal."

- **Advanced by:** consultant
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** the baseline check runs only "After activation, first request only" (`REQUESTS.md:1768`); a rollback before activation has no answer audit, and since the addendum governs (draft `:6`) unscoped wording would add one; later chunks refuse a changed baseline answer anyway as a later operation outside the exempt set (draft `:59`, C22), and a missing one does not refuse there, matching Prior's "continue to reject any unexpected operation" (`:134`).

### C35 — The plan needs matching edits at two places: line 409 (step 6a's Changes) and line 448 (step 6, W3).

- **Advanced by:** consultant
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** line 409 to read "A missing or changed baseline answer refuses as `after-state-changed` in the first rollback after activation (fusion's choice of class: Prior names only "a refusal"); the no-op adds no refusal and lists the answer in `later_operations`."; line 448 the same no-op change, and "minus the baseline minus this plan's scheduled answers" to read "minus the baseline, compared by whole entry, minus this plan's validated scheduled answers (plan, apply, verify and rollback ids; `unassigned` excluded)". Lines 165, 195, 203, 416 and 466 need no edit.

### C36 — The six verbatim replacements below, applied to the draft, are consistent with the rest of the draft, with every held-up claim, with Prior `1dfd446` and with `REQUESTS.md:1-1900` outside the lines the addendum corrects, and open no new gap.

- **Advanced by:** first partner
- **Entered:** round 6
- **Last moved:** round 6
- **Evidence:** definition: C22, C23 (`codec/schemas/migration-plan.schema.json:177,179,193` separates `unassigned`), Prior `:123-125`, `proposal_ref` required (`:224,231`) and equal to the `plan` request's `proposal` (`REQUESTS.md:1717`), `answer_sha256` covers `op` and `request_digest` (draft `:38`, Prior `:113-114`); refusals: C34, `REQUESTS.md:1768,1773,1806`, draft `:44-48`; reconstruction: `ops.ts:196`, `store.ts:143`, C11, C12, C14, C18, C30 verbatim; departures 1, 5, 6: C34, `record-client.ts:207-209,225`, C31 verbatim. Optional clause, not required for correctness: after "Both the no-op's `later_operations` and the rollback audit use this definition" add ", which replaces line 1806's 'stored after `verify`'s'", since `REQUESTS.md:1806` carries the same unprovable timing the addendum withdraws at `:1723`; draft `:6` and the definition already fix the meaning. The texts:
  - **Draft line 39:** "- **One definition of a later operation.** A later operation is a stored answer that is neither a baseline entry nor one of this plan's validated scheduled answers. A stored answer is a baseline entry only when its `operation_id`, `op`, `request_digest` and `answer_sha256` all equal one entry of the `answers` part. A scheduled answer is one stored under an id the schedule assigns to `plan`, an apply chunk, `verify` or a rollback chunk; the `unassigned` ids are not scheduled. It is validated when its `request_digest` equals the digest of its reconstructed request. `plan`'s request is rebuilt from the index's `proposal`. Both the no-op's `later_operations` and the rollback audit use this definition. Line 1723's "landed after the receipt" is withdrawn. Whether an answer landed after the receipt cannot be decided from stored answers, which carry no sequence or time. Its next sentence is withdrawn too: `later_operations` names the stored answers that neither the baseline nor the validated schedule accounts for, and does not tell ordinary work apart from a changed or unmatched answer."
  - **Draft lines 40–42:** "- **Refusals.** In the first rollback after activation, a baseline entry whose stored answer is missing or hashes differently refuses as `conflict/after-state-changed`. A scheduled answer that does not validate is a later operation and refuses under line 1806. The second-run no-op adds no refusal: it answers with `later_operations` as defined above, which decides nothing."
  - **Draft line 49:** "- **Reconstruction and the `workbench` field.** The digest covers `workbench` when a request carried it. Every reconstruction the codec performs itself (the exempt `end` and `begin`, each scheduled answer's request, and each answer before chunk 0 that the `progress` list names) is therefore tried in two forms: with `workbench` absent, and with `workbench` equal to the root the codec resolved for the request being served (the resolved `FUSION_WORKBENCH` when that request carried none). The host's own rebuild of a pending `verify` (line 1742) is outside this rule. **Limit:** a rebuilt request misses in both forms when the original request carried `workbench` spelled differently from that resolved root. Every answer fusion's host stored before the workbench directory was moved is such a case; baseline entries are not rebuilt and are unaffected. Every miss refuses: the first rollback after activation as `after-state-changed`, and rollback chunk 0's check of its `progress` list and any later rollback chunk as their own refusals. The no-op lists the affected answers in `later_operations`. Departure (5)."
  - **Departure 1 (draft line 102):** "1. In the first rollback after activation, a missing or changed baseline answer refuses as `after-state-changed`. Prior names only "a refusal" there. The no-op adds no refusal."
  - **Departure 5 (draft line 106):** "5. A codec-side reconstruction is tried with `workbench` absent and with `workbench` equal to the served request's resolved root. Prior's text does not address this field. A host rule that never sends `workbench` was considered and not taken: fusion's host sets the field on every request by design (`hooks/lib/record-client.ts:207-209`)."
  - **New departure 6:** "6. The scheduled answers set aside from later operations include the rollback chunks' answers besides plan, apply and verify, which Prior names. `REQUESTS.md:1806` already counts them as progress, not as exemptions."

## What fell

### C6 — Under Claude Code, fusion's host is `bin/fusion-record` and its callers.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the host that builds codec requests is `hooks/lib/record-client.ts` `ask()`, used by `bin/fusion-archive`, `bin/fusion-write` and the hook libraries, spawning the bundle directly (`record-client.ts:222`); `bin/fusion-record`'s callers send only `inspect`/`list` without `workbench` (`skills/archive/SKILL.md:27,262`, `skills/wp/SKILL.md:15`, `skills/check/SKILL.md:76`, `skills/discuss/SKILL.md:19`). The question the claim served is answered: the host sends `workbench` on every request today.
- **Conceded:** first partner, round 1 — `hooks/lib/record-client.ts:222-225`.

### C13 — In the second-run no-op, refusing a non-validating scheduled answer as `receipt-unverified` is justified because the migration's chain of answers would not be what the receipt says.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the receipt binds plan, parts, `verify_operation_id`, `after_inventory_sha256` and `manifest_revision`, not answers (`REQUESTS.md:1674-1690`; `codec/schemas/migration-receipt.schema.json:8`); only successful answers are stored and never rewritten (`kernel.ts:342,376`); `plan` refuses scheduled ids already answered (`REQUESTS.md:1698`); a taken apply id leaves bytes unlanded and `verify`'s Disk check refuses (`:1767`). So in the no-op state a non-validating scheduled answer comes only from a missed reconstruction, ordinary work reusing an unused rollback id, or hand-editing `ops/`, none of which makes the migration incomplete; `receipt-unverified` is defined by identity, integrity and availability (`:1770-1776`), and refusing with it when all three pass would be false. Prior's `later_operations` "decides nothing" (`:1723`; Prior `:123-128`).
- **Conceded:** first partner, round 2 — `REQUESTS.md:1674-1690,1770-1776`.

### C16 — Corrected departure-1 wording: rollback refusal for baseline gaps as Prior's "a refusal", the no-op refusing a non-validating scheduled answer as `receipt-unverified`, and the separate scheduled-refusal bullet redundant for the rollback once the definition says "validated".

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the redundancy half holds (a non-validating scheduled answer refuses in the rollback via `REQUESTS.md:1806` under `after-state-changed`, and cannot pass as the exempt `verify`). The whole fails: it rests on C13, and "Prior names only 'a refusal'" holds for the rollback only (Prior `:117-127` vs `:127-128`).
- **Conceded:** first partner, round 2 — C13's evidence and Prior `:117-128`.

### C20 — A scoped host rule (never send `workbench` on migration or audited maintenance requests) closes C18 and C4 entirely at the cost of a scoped `record-client.ts` change plus optional codec enforcement.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** the mechanism holds (no request shape carries a root other than `workbench`, `REQUESTS.md:1716-1720`), and replay is unaffected (`record-archive.ts:741-742,565`). The claim falls on three points: `ask()` spawns with `env: {}` (`record-client.ts:223`) and states it always sets `workbench` so no request falls back to an ambient default (`:207-209`), and a request without it is refused as `unknown-scope/workbench-unspecified` (`ops.ts:196-197`, `main.ts:94`), so the rule reverses a stated property rather than scoping a change; codec enforcement cannot tell the migration host's maintenance requests from the archive helper's (`record-archive.ts:556,565`); without enforcement "entirely" holds for fusion's own host only. Side finding narrowing C2 and C15: an archive-helper `begin` can never be a matched exempt answer in a passing audit, because the helper writes `archive/<into>/.inventory.json` first (`record-archive.ts:270,689,707`) and that path fails `REQUESTS.md:1805`; the reconstructions that matter come from the future migration host.
- **Conceded:** first partner, round 3 — `hooks/lib/record-client.ts:207-209,223`, `codec/src/cli/ops.ts:196-197`.

### C25 — Replacement definition text (whole-entry baseline, validated scheduled answers over plan, apply, verify and rollback ids, `unassigned` excluded, line 1723's "landed after the receipt" withdrawn) is complete.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** every part holds (`journal.ts:385-387`; Prior `:123-125`; plan `:203`; `codec/schemas/migration-plan.schema.json:224,231`; draft `:59`; `REQUESTS.md:1806`), but `REQUESTS.md:1723`'s next sentence, that `later_operations` tells ordinary work from an incomplete migration, now overclaims and is left uncorrected. Superseded by C29.
- **Conceded:** first partner, round 4 — `REQUESTS.md:1723`.

### C27 — Replacement reconstruction text, including its bracket list and limit, is exact.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** the two-form rule holds (C1, C11, C12; `store.ts:143`, `ops.ts:196`), but the bracket wrongly includes chunk 0's own `progress` entry (draft `:66`, taken from the current request) and legacy `end` rebuilds nothing (`:72`); "every answer stored before the move" overstates (baseline entries are not rebuilt; requests without `workbench` still match); and "refuses as `after-state-changed`" omits chunk 0's and later chunks' refusals (draft `:59,67`). Superseded by C30.
- **Conceded:** first partner, round 4 — draft `:59,66-67,72`.

### C28 — Replacement departure list (1 and 5) is complete.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** items 1 and 5 hold (C19, C8, C11, C12; `record-client.ts:207-209`), but counting the rollback chunks' answers as scheduled departs from Prior's "plan/apply/verify" (`:123-124`) and is not listed. Superseded by C31.
- **Conceded:** first partner, round 4 — Prior `:123-124`.

### C32 — The merged replacement (C29, C26, C30, C28's departures 1 and 5, C31's item 6) is consistent with the rest of the draft and opens no gap.

- **Advanced by:** first partner
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** consistent with draft `:43-48`, `:57-60`, `:64-76`, `:89-98` and departures 2–4; the gap is scope: "In a rollback" in C26 and departure 1 would extend the baseline check to every rollback chunk, before activation too, where `REQUESTS.md:1768` runs it on the first request after activation only. Superseded by C34. A sub-point stayed open because the record quoted C25's and C27's texts only in summary; the verbatim merged text now stands in C36.
- **Conceded:** first partner, round 5 — `REQUESTS.md:1768`.

### C33 — Outside the addendum, only plan line 448 (W3) needs a matching edit.

- **Advanced by:** first partner
- **Entered:** round 5
- **Last moved:** round 5
- **Evidence:** plan line 409 (step 6a's Changes) also says "`receipt-unverified` in the no-op". Superseded by C35.
- **Conceded:** first partner, round 5 — plan `:409`.

## What could not be decided

## Recommendation

This recommendation is qualified and binds nothing; the user rules.

- **Departure 5 stands, as the two-form rule, not as a host rule.** Take C36's reconstruction text: the codec's own reconstructions are tried with `workbench` absent and with the root the codec resolved for the served request. A host rule would reverse a property `hooks/lib/record-client.ts:207-209` states by design and could not be enforced for the migration host alone (C20). State the moved-workbench limit (C18) in the addendum; every miss fails closed (C14).
- **Departure 1's second sentence goes.** A non-validating scheduled answer is a later operation under the "validated" definition Prior and the plan already use, and refuses in the rollback under `REQUESTS.md:1806`; the second-run no-op adds no refusal, because the receipt binds no answers and `receipt-unverified` would misreport a complete migration (C13, C19). The baseline refusal is scoped to the first rollback after activation (C34), and baseline membership is by whole entry (C22).
- **Apply C36's six passages verbatim to the draft** and add departure 6 (C31). The optional clause naming line 1806's "stored after `verify`'s" is not needed for correctness.
- **Edit the approved plan at lines 409 and 448** to match (C35); no other plan line presumes a no-op refusal.
- The draft's other three departures (2, 3, 4) and the analyst's three corrections were not disputed here and stand as drafted.
