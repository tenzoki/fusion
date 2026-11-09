The hooks record index will class a campaign row as status-unreadable once a campaign file exists
---
Since plan step 3 the codec's `list` returns a row of kind `campaign` whose `status` is the campaign's lifecycle state (`draft`, `running`, `paused`, …). `hooks/lib/codec-read.ts` (`unreadRow`, line 127) holds a row's status to the package vocabulary, and `hooks/lib/record-index.ts` (`unreadable`, lines 111 to 114) re-reads a non-package row against its own kind's vocabulary in `codec/contract/transitions.json`, where a campaign has no entry. A campaign row therefore comes out as `schema-invalid/status-unreadable` and lands in no map.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Read from the code by the code-implementer on plan step 3 and confirmed by the orchestrator at the two cited places; not executed, because no campaign file exists yet and the committed bundle (`codec/dist/fusion-record.js`) does not carry the new kind until plan step 5 rebuilds it. The fault takes effect with the first `campaigns/<id>/campaign.json` in a workbench read through the rebuilt bundle.

**Why it matters for this package.** Plan step 7's overview reads the record index for the open decisions of each held package; with a campaign file present (plan step 16 on), every reader of the index would carry an unreadable row, and a helper that treats an unreadable row as a stop would stop.

**Acceptance.** With the rebuilt bundle and a valid campaign file in a scratch workbench, the record index names the campaign row as read (or leaves it out by a stated rule) and reports no `status-unreadable` for it; a test in `hooks/lib/__tests__/` holds that. Where the campaign's state vocabulary comes from (the campaign schema, or a new entry in `codec/contract/transitions.json`, which is a contract file and a data change) is stated in the fix.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 3, 5, 7, 16)

---
Resolved: `readRecordIndex` in `hooks/lib/record-index.ts` leaves a `list` row of kind `campaign` out before any status is read, so it enters no map and no `unreadable` entry; the rule stands in that file's header, `## A campaign is not in it`, and in the function's comment. The campaign's state vocabulary is the enum of `codec/schemas/campaign.schema.json`, judged inside the codec, and `codec/contract/transitions.json` gained no entry. Measured before the fix through the rebuilt bundle, the fault was wider than filed: a valid campaign file read `schema-invalid/status-unreadable` at `running`, and at `paused`, the one state word the package vocabulary shares, it entered `byControl` as an entry of kind `campaign`. `hooks/lib/__tests__/record-index.test.ts` holds the fix over a scratch workbench whose campaign file comes from `campaignFile` in `hooks/lib/__tests__/helpers/json-workbench.ts`: at `running` and at `paused` no `unreadable` row, the campaign in no map, and the index equal to the one read before the file existed; a `campaign.json` the codec could not read carries no kind and stays an `unreadable` row, and one its schema refuses is left out and named by `validate`.
