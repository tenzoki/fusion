The reserved actor legacy-unknown passes every nested actor position, so a live write produces it
---
The schema rule of decision 261003-1746 (option 1) guards `filed_by.actor` and the top-level `actor` of the eight actor-bearing requests only. Three other actor positions reach the same `$defs/actor` with no guard: `deferral.ruled_by` (`codec/schemas/record.schema.json` `$defs/deferral`, also referenced by the `transition` payload of `protocol.schema.json`), and `discussion_control.participants[]` (`record.schema.json` `$defs/discussion_control`), which `create`'s free `payload` fills. The record-level `if/then` (`record.schema.json` top-level `allOf`) tests `filed_by` alone. So a created record can carry `legacy-unknown`, which five shipped texts say cannot happen.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** data
**Cross-references:** 261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261004-1807-reviewer-fj04-closing-pass-over-the-legacy-migration.md

**Evidence** (at `9232314a`, frozen bundle `sha256:575aec47…260c`).

- End to end through `bin/fusion-record`: `initialize` on a scratch workbench, then `create` of a discussion with `payload.participants: [{"actor":"legacy-unknown","person":null}]` answered `ok`. The written record reads `provenance {source: "created"}` with `control.participants [{actor: "legacy-unknown", person: null}]`.
- Schema only (ajv over `codec/schemas/*.json`): `valid/protocol/transition-decision-deferred.json` with `payload.deferral.ruled_by.actor` set to `legacy-unknown` validates against `fusion.protocol/v1`. `valid/record/decision-deferred.json` (source `created`) with `control.deferral.ruled_by.actor` set to it validates against `fusion.record/v1`. `codec/src/cli/ops.ts` copies `deferral` into the record on transition (`DECISION_FIELDS`).
- The texts this contradicts: the `$defs/actor` and `$defs/legacy_unknown_actor` descriptions in `common.schema.json` ("refused in every request that carries an actor, so no live write produces it"); `protocol.schema.json` `$defs/live_actor`; `codec/README.md`, the reserved-actor paragraph; the manifest note of `invalid/protocol/create-filed-by-legacy-unknown.json`; `codec/fixtures/prior/REQUESTS.md` lines 2079 and 2208 ("No other request carries an actor. 'No live write can produce it' stands"), which went to Prior with the frozen digest. The plan's stopping clause ("refuses `legacy-unknown` ... on every record whose `provenance.source` is `created`") does not hold for these positions.
- Coverage: `claim` and `release` are guarded by `live_actor` (`protocol.schema.json:224`, `:247`) but have no fixture and no test case; the six `invalid/protocol/*-actor-legacy-unknown.json` fixtures and the `create` case in `ops.test.ts` cover the other six.

**Acceptance.**
1. A record or package whose `provenance.source` is `created` is schema-invalid when `legacy-unknown` stands in any actor position (`filed_by`, `deferral.ruled_by`, `participants[]`); the `transition` payload's `deferral.ruled_by` refuses it as `schema-invalid/request`.
2. Invalid fixtures for: a `transition` deferral ruled by `legacy-unknown`; a created decision record with that ruler; a created discussion record with that participant; `claim` and `release` with that actor. Each is shown red against the schema at `9232314a`.
3. The bundle is rebuilt and the new digest replaces `575aec47…` in a `REQUESTS.md` addendum that corrects lines 2079 and 2208. The same addendum corrects line 2154's inference ("some 5 000 no-ops") to the measured figure the hand-over gives at line 2421 (4 001 entries exceed the cap, about 271 bytes each).

This lands before Prior re-pins the frozen digest (request 60): it moves that digest.

**Resolved (2026-10-04).** Every actor position now refuses `legacy-unknown` outside imported and legacy-terminal records: on records the participants and the deferral ruler beside `filed_by`; on requests the `transition` deferral ruler and the `create` participants and deferral ruler beside the existing positions (`f9ecae78`). Nine fixtures, manifest 338 -> 347; `ops.test.ts` cases red against the old bundle; `codec/README.md` corrected. Bundle 689 747 bytes, sha256 `c76bbce9…e52e`, the new frozen digest. REQUESTS.md corrected by the addendum after the closing review. Resolved by the commits named, closed by the commit that renames this record to `_c_`.
