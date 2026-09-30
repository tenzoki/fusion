# Does `transition` refuse a payload field the record's kind has no rule about?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md, 260929-1417_*_plan-fj02b-plan-progress-and-evidence-creation-through-the-kernel.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

Item 25 of `codec/fixtures/prior/REQUESTS.md` left one question to FJ03c: the `transition` payload is one object admitting `claim`, `outcome`, `disposition`, `answer_ref`, `implementation_ref`, `superseded_by`, `deferral`, `steps` and `criteria`, and "only the fields the target state has a rule about are read" (`codec/schemas/protocol.schema.json`, the `transition` branch). FJ02b refuses `steps` and `criteria` on a non-plan record; every other foreign field is accepted and dropped. Measured on 2026-09-30 through the bundle at fusion `8dfaf018` (`sha256:bde8f3c9…44d1`): an issue moved `open → closed` with `outcome` and `claim: null` in its payload answered `ok: true`, and `show` afterwards carries neither field. FJ03c writes the first Claude-side caller that sends a payload, so the question is due now.

## Options

1. **The codec refuses every field outside the target kind's rules**, `schema-invalid/payload-field-not-admitted`, as FJ02b does for `steps` and `criteria`.
   - Pros: one rule for every caller, both hosts included; a caller's typo never lands silently.
   - Cons: a behaviour change on a frozen contract: a new bundle digest and a re-pin, and a request that lands today would be refused. Not fusion's alone to decide.
2. **The Claude-side client never sends one; the codec stays as it is.** The write client builds each payload from a per-kind field table, held equal to `codec/schemas/record.schema.json` and `package.schema.json` by a test, so no Claude-side request carries a foreign field.
   - Pros: no digest move inside FJ03c; decidable from shipped inputs; no second source of truth, since the table is pinned to the schemas.
   - Cons: a hand-built request or another host still loses a foreign field in silence.
3. **Both: option 2 now, and option 1 asked of Prior** for the next revision that moves the digest anyway (FJ04's migration revision, or the answer to the archival question filed beside this record).
   - Pros: FJ03c is not held; the contract question goes to the party that co-owns it; no extra re-pin.
   - Cons: the silent drop stays in the contract until that revision.

## Constraints

- A codec behaviour change is a contract change under the freeze rule: additive or agreed, a new digest, a Prior re-pin.
- FJ03c changes `skills/`, `hooks/` and `bin/`, and no file under `codec/` except tests and `REQUESTS.md`.

## Recommendation

Option 3. The Claude side's half is decidable now and costs one table and one test. Whether the shared codec should refuse is a question for both hosts, and asking it costs nothing until a revision moves the digest for another reason.

---
Answered: plan `260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md` — the recommended option — the Claude-side client never sends a field the record kind has no rule about (a table bound to the codec schemas by test); whether the codec itself refuses such fields is put to the Prior side as request 37; the user approved it with the FJ03c plan on 2026-09-30; ruled by user, Kai Stalmann <ks@qantr.com>
