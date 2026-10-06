# How does an imported record carry a filer its legacy workbench never recorded, and how is a derived value told apart from a recorded one?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261003-1004-fj04-step12-proof-on-copies-of-real-workbenches.md, 261001-1804_*_how-are-legacy-values-with-no-v1-counterpart-mapped-at-import.md

---

## Question

The user ruled on 2026-10-03 that the migration derives what is derivable, carries what is not as unknown instead of asking for it, and asks only genuine decisions. Step 12's report counts 279 of 362 blocking findings across the three copies as a missing, unreadable or not-owed `**Filed by:**` line. The person half can be derived: the git author of the commit that first added the file is the same identity `bin/fusion-identity` reads, taken at the time of filing. The actor half cannot be derived from any input the host has, and it must never be invented. `codec/schemas/common.schema.json` `$defs/actor` requires `actor` as a non-null token, and `record.schema.json` and `package.schema.json` both require `filed_by`. So an unknown actor has no representation today. A second need applies to every class the amendment derives or defaults: after migration, a reader must be able to tell such a value from one the legacy file recorded. Both answers bind beyond the FJ04 plan. They fix a value in the contract Prior qualifies, and any later import reads them.

## Options

1. **A reserved actor token, `legacy-unknown`, admitted by the schema only on imported records; derivations marked in `provenance.legacy_fields.derived`.** `common.schema.json` names the reserved value. `record.schema.json` and `package.schema.json` admit `filed_by.actor` = `legacy-unknown` only when `provenance.source` is `imported` or `legacy-terminal`. The protocol schema refuses the value in every request that carries an actor (`create`'s `filed_by`, the `actor` of `transition`, `claim` and `release`). Each control value the host derived or defaulted gets one entry in `provenance.legacy_fields.derived`, keyed by its JSON Pointer into the control, of the form `{rule, evidence?}`. That object is schema-free today, and it already carries the importer's non-head data (`file_marker`, `step_marks`).
   - Pros: the type stays a string, so no consumer's decoding changes, Prior's Go side included. The value is reserved and checked by the codec, and no live write can produce it. The vocabulary follows the package schema's own `origin.kind` `legacy-unknown`. The marking needs no schema change.
   - Cons: the bundle digest moves, so Prior must qualify one digest more. That qualification is already pending for `c71e219e…`, which is unqualified. A consumer that ignores provenance shows `legacy-unknown` where a name would stand. That is honest, but it could be read as a name.
2. **`actor` nullable on imported records**, with the same marking. The `if`/`then` conditions match option 1, and `null` replaces the token.
   - Pros: no in-band value, and the null reads as absence.
   - Cons: the type changes. Every reader of `filed_by.actor` must handle null. A Go-side `string` decodes a JSON null as the empty string without an error, so a missed adaptation fails silently in Prior. It is a larger contract change for the same information.
3. **The same token by convention only, with no schema change.** The contract text and the codec README declare `legacy-unknown`, the host refuses it on writes, and the marking is as in option 1.
   - Pros: the bundle stays at `c71e219e…`, and nothing new is qualified.
   - Cons: nothing in the codec stops another host, or a later fusion change, from writing the value on a live record. The reservation then holds only as long as each writer follows it.
4. **Keep asking (the state before the ruling).**
   - Pros: no contract change.
   - Cons: it contradicts the user's ruling of 2026-10-03. It costs 49 unconditional questions on fusion's copy, 569 on the second and 122 on the third, and a consumer on 13.0.0 completes no agent's Setup until they are answered (step 12, N2).

## Constraints

- An actor is never invented. A person is never the current repairer's identity presented as historical (Prior, quoted in `REQUESTS.md` `## FJ04 (the contract delta, amended for ab9cb59)`). The git author of the first-add commit is historical evidence, not the repairer's identity.
- A value the legacy file recorded is never overwritten by a derived one. An explicitly absent person (`**Filed by:** user`) stays null.
- Every derived or defaulted value carries its rule and its evidence in the control file, and the frozen findings part repeats the finding.
- fusion stays operable in Claude Code with no Prior at runtime. A schema change is a release and coordination fact: Prior re-qualifies the frozen digest at the hand-over (plan step 13), and nothing waits on Prior at runtime.

## Recommendation

Option 1. It is the only option in which the codec enforces "never invented" for every host while every consumer's types stay as they are. The added coordination is one more schema rule inside a re-qualification Prior must make anyway. The FJ04 plan's amendment of 2026-10-03 builds against option 1 (steps 12a to 12c) and sends it to Prior as a request in step 12a.

## Answer

Answered 2026-10-03 by the user (Kai Stalmann), in chat: option 1, the reserved actor `legacy-unknown`, admitted by the schema only on `imported` and `legacy-terminal` records and refused in every request. The user also ruled that the build does not wait for Prior's answers to requests 54 to 58 (the plan's open question, option 1), and asked that the requests be relayed to him for forwarding to Prior.
