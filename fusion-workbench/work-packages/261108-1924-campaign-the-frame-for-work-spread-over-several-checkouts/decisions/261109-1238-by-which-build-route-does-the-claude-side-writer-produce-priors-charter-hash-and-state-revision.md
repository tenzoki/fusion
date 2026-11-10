# By which build route, if any, does the Claude-side writer produce Prior's `charterHash` and `stateRevision`?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261108-2301-which-value-does-a-claude-side-writer-put-in-a-prior-revision-field.md` (answered with option 1, the interim rule; the ruling on this record would supersede it), `261109-1100-request-80-says-fusion-cannot-reproduce-priors-hashes-and-its-own-source-tree-does.md`, `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 10, 13 and 16), `foreign:F09-Prior:261109-0730-which-value-stands-in-a-prior-revision-field-of-a-campaign-fusion-wrote.md`, `codec/fixtures/prior/REQUESTS.md` (`### Prior's answer to 80 at 557011a`, question 4)

---

## Question

Prior answered question 4 of request 80 with its own rule: `state.charter_hash` is `charterHash`, `state.revision` is `stateRevision`, and the interim rule the earlier decision chose is not admitted under the label `prior-json-sha256:`. The answer carries one condition, quoted: "This holds if fusion confirms that its Claude-side helper can reach `codec/src/prior`. If it cannot, the interim rule stands as fusion's stated deviation until it can. The values are then unverifiable by Prior and bar any import." The earlier decision was ruled on the premise that fusion's tree cannot produce the bytes Prior hashes, and the premise is false for the source tree. What remains is a build question. The functions exist in `codec/src/prior`, the helper the plan builds under `hooks/` does not reach them, and the user chooses a route or the deviation. The ruling is needed before plan steps 13 and 16 are dispatched, because each is written differently per outcome; steps 10, 11 and 12 are the same under all four.

## Measured at `04d6e051`

- **The functions exist and are tested.** `codec/src/prior/gojson.ts` exports `computePriorRevision` (line 452) and `computeCharterHash` (line 459), and `exportCampaignState` in `codec/src/prior/campaign.ts` builds the Go form with the charter embedded. `codec/src/__tests__/prior-mapping.test.ts` holds both functions against Prior's four campaign goldens under `codec/fixtures/prior/campaign/`.
- **Nothing shipped runs them.** The one importer of `codec/src/prior/` is that test file (`grep -rn 'from "[^"]*prior/' codec/src hooks`). `codec/dist/fusion-record.js` (`sha256:bc0de764…`, 701 296 bytes) contains neither name: `grep -c` prints 0 for each. The bundle's entry is `codec/src/cli/main.ts` alone (`codec/scripts/build.mjs`).
- **An installed plugin holds the source and cannot run it.** `install.sh` copies `codec/` whole and removes `codec/node_modules`, so `codec/src/prior/` is present as TypeScript (read in `~/.fusion/codec/src/`). The hooks are compiled by `tsc` with `rootDir` `.` over `*.ts` and `lib/**/*.ts` (`hooks/tsconfig.json`) and reach the codec by spawning the bundle (`hooks/lib/record-client.ts`). *Inference, not run:* an import from `hooks/lib/` into `codec/src/` leaves `rootDir`, which `tsc` refuses, and moving `rootDir` moves every path under `hooks/dist/` that a `bin/` wrapper names.
- **What the code costs in bytes.** A scratch bundle built with the codec's own esbuild and written outside the tree is 11 114 bytes for `gojson.ts` alone. With `exportCampaignState` it is 297 340 bytes, because `codec/src/prior/common.ts` imports `codec/src/validate.ts` and with it ajv. Of those bytes 17 500 come from `codec/src/prior/` (`gojson.ts` 11 034, `common.ts` 3 655, `campaign.ts` 2 811), which is what the main bundle would gain, since it carries ajv already. The export ran from the scratch bundle outside `codec/`, so it reads no contract file at run time.
- **The schema admits one label.** `prior_revision` in `codec/schemas/common.schema.json` is `^prior-json-sha256:[0-9a-f]{64}$`. `state.charter_hash` is required and of that type, `state.revision` is that type or null (`codec/schemas/campaign.schema.json`).
- **The four valid campaign fixtures do not hold Prior's values.** Run through the scratch bundle, `computeCharterHash` over each fixture's exported charter equals the stored `charter_hash` in 0 of the 4 files under `codec/fixtures/valid/campaign/`, and `computePriorRevision` equals the stored `state.revision` in 0 of the 3 that store one (`minimal.json` stores null). Three of the four share the `charter_hash` `292b7847…` over two different charters, which compute to `79f22f89…` and `de018753…`; `archived.json` stores `b67f8d62…` and computes to `4fbca117…`. Prior's 0 of 4 is repeated with fusion's own functions. A `register.revision` cannot be recomputed from such a file at all, since a register's candidates are issues the fixture does not hold.
- **No campaign file exists.** `fusion-workbench/campaigns/` is absent here and the writer is plan step 16, not built. No stored value has to be migrated under any option.
- **No Claude-side reader needs either value.** The revised plan's read confirmation names the campaign file's own `sha256:` revision, on Prior's inference that `state.revision` does not move with `lanes`. The two fields are then read by nobody on the Claude side, and the choice is about what the record claims towards Prior.

## Options

1. **The codec computes them, read-only, on `show` of a campaign.** For kind `campaign` alone, `show` returns a member holding the two values computed from the stored charter and state, as it returns `report` for an evidence record alone today. The helper writes its candidate into a scratch workbench, asks `show`, fills the two fields, validates and lands the file.
   - Cost: `codec/src/cli/ops.ts` imports `codec/src/prior/campaign.ts`; about 17 500 bytes on the bundle (2.5 %); one case in `ops.test.ts` and one round trip. No request branch is added, so `codec/schemas/protocol.schema.json` and the `inspect` answer stay as they are. The digest moves in plan step 13, where it moves for `lanes` and `set-resources` in any case. A variant with an operation name of its own costs a protocol branch, a fixture with its manifest row and a moved `inspect` answer, and gives the helper nothing the member does not.
   - Prior's host: `show` is an operation it exposes, so the member arrives with the re-pin and no name is added. Whether the host reads it is Prior's. Whether its parser tolerates the added member on a campaign answer is not determined; Prior has run no codec that reads a campaign.
   - To Prior: confirmed. The helper reaches `codec/src/prior` through the shipped bundle, and the interim rule is withdrawn before any campaign was written.
2. **A second build product bundling `codec/src/prior` for the helper.**
   - Cost: a second entry in `codec/scripts/build.mjs`; `committed-bundle.test.ts` compares one file today and would compare two; `install.sh` checks one bundle by name. The file is 297 340 bytes with the exporter as it stands (42 % of the main bundle, a second copy of ajv). It is 11 114 bytes if the helper builds the Go form itself under `hooks/lib/`, which makes a second copy of the mapping's rules for nil against empty and for the stripped label. `fusion-record.js` does not change for this route. The growth bounds read `agents/`, `skills/`, the dispatch paths and the hook-test lines, so a file under `codec/dist/` is charged to none; the helper's test is.
   - Prior's host: gains nothing. A hosted run could not obtain the values through the protocol it speaks.
   - To Prior: confirmed, by a second artefact from the same source.
3. **The codec becomes the campaign's writer.** Mutating operations on a campaign path, with the hashes stamped inside the kernel under its lock and journal.
   - Cost: reverses plan step 3's refusal (`unsupported-format/not-a-pair-kind`, built at `063d33e2`, round-tripped at `2f4228d1`) and request 80's sentence that every mutating operation on that path is refused, which Prior read and wrote its notes on. At least one operation with a protocol branch, plan functions and recorded sessions. On Prior it offers the host a write of `running` without `Authorise` and `Start`, which is deviation 3(b) moved from the Claude side into the shared codec. Plan steps 11 to 17 are planned again.
   - Gain: `expected_revision` and the lock would enforce the single-writer rule inside one workbench.
   - To Prior: confirmed, in a new numbered request that withdraws the read-only statement.
4. **The interim rule stays, as a stated deviation.**
   - Under the label `prior-json-sha256:` it validates today and is what Prior does not admit: the label's description, the campaign schema's rule on `charter_hash`, Prior's mapping ruling and Prior's spec each become false for a Claude-written campaign.
   - Under another label it does not validate, since the pattern admits one label and `charter_hash` is required. A second label needs a change to `codec/schemas/campaign.schema.json` and a further format question to Prior.
   - `state.revision` may be null, which narrows the deviation to `charter_hash` and does not remove it.
   - To Prior: not confirmed, by choice and not by inability, since options 1 and 2 show a route. The values are unverifiable by Prior and bar any import.

## Constraints

- Prior's condition is answered in words fusion's user relays. This record prepares the answer; no agent gives it.
- A schema change that follows from Prior's answer is put to fusion's user before it lands (request 80, `### What fusion does with the answer`). Option 1 in its `show` form changes no schema file.
- The earlier decision is `answered` and unrealised. A ruling for options 1 to 3 supersedes it; a ruling for option 4 keeps its rule and restates it as a deviation.
- Request 80 says no import of a Claude-written campaign into Prior is asked or planned, and Prior's verdict on 3(b) holds only while that stays so.

## The four valid fixtures

We recommend leaving `archived.json`, `minimal.json`, `with-register-and-formation.json` and `formation-signed-metrics-stale-reason-and-charter-duplicates.json` unstamped under every option. They exercise the schema's shapes. A restamp could make `charter_hash` and `state.revision` true and would leave the `register.revision` beside them unverifiable, and Prior's pin moves with every fixture that changes. The specimen of a Claude-written campaign is the new `with-lanes.json` of plan step 10: `running` with empty `sessions` and `runs`, the two values computed by the tree's own functions, and a test in plan step 13 that holds them. That fixture is written the same way under all four options, because a true value is valid under each.

## Recommendation

Option 1, in its `show` form. It is the one route on which Prior's condition is met by the artefact both hosts already run and the committed-bundle gate already covers, at the smallest measured cost and with no schema file changed. Option 2 answers the condition for the Claude side alone and adds a second artefact with its own gate. Option 3 is a different work package. Option 4 would tell Prior that fusion cannot do what its tree measurably can.

The recommendation is contingent on one point nobody has determined: that Prior's host accepts an added member on the `show` answer for a campaign. The plan names it in what a re-pin request would carry.

Answered: `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md` `## Rulings after Prior's answer to request 80` — option 1, the codec computes the two values read-only on `show` of a campaign; ruled by user, Kai Stalmann <ks@qantr.com>, 2026-11-09.

---
Implemented: `hooks/lib/campaign-write.ts` `## One sequence serves every write` (`priorRevisions`, the one function that knows where the two values come from), `hooks/campaign.ts` (the seven write sub-commands), `bin/fusion-campaign` `## The steering writes` and `## Exit codes` (rows 8 and 9), `README-hooks.md` `## Files` (the `lib/campaign-write.ts` row), `hooks/lib/__tests__/campaign-write.test.ts` — option 1 in its `show` form: every steering write asks the codec's `show` for `prior` over the candidate in a scratch workbench, stores the two values verbatim, validates the filled candidate there and renames the file into place; nothing on the Claude side computes a hash of its own.
