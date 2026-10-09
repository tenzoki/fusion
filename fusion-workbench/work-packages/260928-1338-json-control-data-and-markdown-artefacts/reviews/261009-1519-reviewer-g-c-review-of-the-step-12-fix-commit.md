# Review G-C: step 12's fix commit, `95fecad4..a563ff6a`

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `95fecad4..a563ff6a`
**Not-opened:** none

What the Not-opened line covers:
- Every file `a563ff6a` changes was read in its diff. `hooks/dist/lib/record-write.js` was also checked by rebuild (below).
- G-B's carried-over files were opened as the dispatch scoped them:
  - all 29 files under `codec/fixtures/protocol-session-takeover/base/` were read in full;
  - `README.md` and the exchanges `04`, `08`, `15`, `26` and `32` were read against Prior's cases;
  - the other 32 request/response pairs were checked by the byte-for-byte replay alone, which passed;
  - `hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated and compared.

**Review domain:** both (no ontology is in range; the pass is code and shipped text)
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts
**Plan:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md (gate G-C, after step 12)

**What the range is.** One commit, `a563ff6a`. It changes:
- `agents/orchestrator.md`;
- `docs/upgrading-to-v13.md`;
- `hooks/lib/record-write.ts` and its build;
- `hooks/lib/__tests__/record-write.test.ts`;
- `hooks/lib/__tests__/agent-dispatch-observation.test.ts`;
- `hooks/lib/__tests__/fixtures/surface-growth.golden`;
- workbench-only files: the three issues it closes, the plan record and the event log.

## Summary

Step 12 fixes what G-B found. I checked the new **Take over** sequence by running it against the real bundle: create the consent decision, append its `Answered:` line, move it to `answered` with an `answer_ref` naming itself, then send the takeover citing that record. The decision record and the claim both land, `validate` is clean, and `reconcile` resolves both references to the consent record.

The parser fix is pinned by a test that fails when the new line is removed. The doc limits now match the tests. No finding is high or medium.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 new; one "Also seen" on G-A's open issue |

No issue file was opened. The one observation goes on the issue that already covers its mechanism (`## Record filing`).

## What was run

- **Scratch clone** at `a563ff6a`, entered by absolute `cd`, confirmed with `pwd`. `git status --porcelain` was empty after every step.
- `hooks`: `npm install && npm run build`; a fresh `tsc -p tsconfig.json --outDir <elsewhere>`, then `diff -rq` against `hooks/dist/`: identical.
- `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test`: 22 files, 1 810 passed, none skipped. `round-trip-cli-takeover.test.ts` passed 59 tests in golden mode, with no update variable set.
- `cd hooks && npm test`, run after the codec suite: 67 files passed, 1 skipped (the opt-in observation file); 1 152 tests passed, 14 skipped, 0 failed.
- **Mutation check:** I deleted the new `--take-over-from ""` line from `hooks/lib/record-write.ts` and re-ran `describe("takeover, request 62")`. The composing case failed. I then restored the file.
- **Sequence check:** a throwaway test in the clone ran the Take over row through `parseFlags` and `write` against `BUNDLE`, on a package held by `0b0b0b0b`, then deleted it. In order:
  - `create --kind decision`;
  - append the `Answered:` line;
  - `transition --to answered --answer-ref <self>`;
  - `claim --take-over-from 0b0b0b0b --source <self>`.

  Results: every write answered `landed`. The decision's `control` holds `state: answered` and an `answer_ref` with its own id. `validate` gave `valid: true` with 0 findings. `reconcile` resolved `/control/answer_ref` and `/provenance/claim_transfers/0/source` to the same control file.
- **Golden regeneration:** I ran `UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`. It failed on purpose, with its "REWRITTEN" message. `git status` stayed empty, and the sha256 of the result equals the committed blob at `a563ff6a` (`384dc6f3…`). So the golden is the regenerated output of the current rules, not a hand edit. It last changed at `0a0d6148`.
- `surface-growth.golden` was measured against the tree: `agents/orchestrator.md` is 95 615 bytes and `record-write.test.ts` 441 lines, which are the numbers it records.

## Findings by theme

### A. The Take over consent sequence

**Checked and sound.**
- **Against `rules/fusion-workbench-conventions.md` `### Decision files`.** "Whoever sends a transition first appends its line": the row appends `Answered:` before `transition --to answered`. The line is "ruled by user", which is the `Answered:` shape. `## State Markers — decisions` admits "the record itself" as the recorded answer, so a self-referencing `answer_ref` is in scope.
- **Against the codec.**
  - `record.schema.json` types `answer_ref` as a `common` `reference`, and a `record_ref` `{workbench_id, record_id}` is one of its branches.
  - `codec/src/cli/ops.ts` `moveRecord` resolves the payload's `answer_ref` with `resolveReference`. A record's own id resolves, because it exists before the transition.
  - The takeover's `source` accepts the same bare `record_ref`.
  - The bare form is the one spelling both fields accept: a `user-word` wrapper is not a `reference`. So "both `{"workbench_id":…,"record_id":…}`" is correct, and the sequence check above shows it working.
- **Order.** The record is created, answered and then cited, so `--source` resolves when the claim is sent. If the claim is refused afterwards (holder mismatch, revision conflict), the record stays `answered`. That is true: the user did answer. A re-send cites the same record.
- **Setup.** `## Setup` "Surface open decisions" lists only `open` rows. G-B's A1 acceptance asked for an end state that is not `open`, and this meets it.
- **Observation case (i)** now reads `record.control.state` and expects `"answered"`, which is the field the codec writes. It was not run (opt-in, step 16), and the upgrade doc says so.
- **`docs/upgrading-to-v13.md`** says the record "moves … to `answered` as ruled by you". That agrees with the row. `docs/working-model.md` and `README-agents.md` make no claim about the consent record's state, so nothing there is stale.
- **The five consent records in `base/` stay `open`.** That is right for this fixture. It records codec behaviour, and the codec does not read the source's state. Changing it would move the bytes Prior's request 63 pinned. The issue's `Resolved:` note gives that reason.

**Observation (Low, no new issue).** `answered` means "not yet realised in code or data". Once the takeover is committed, the package's `claim_transfers` realises the answer, so the record is due its `implemented` transition. On the orchestrator's route, the state-auditor reports the record under "Implemented on disk — needs the transition" (`agents/state-auditor.md`, the decision bullets) and the orchestrator sends it. *Inference, not run:* the auditor recognises a takeover commit as realising the answer. On `/fusion:reconcile` no orchestrator runs, so the record is reported again on every pass. That is the mechanism of G-A's open issue `261009-1037-reconcile-hands-an-implemented-decision-to-an-orchestrator-its-own-route-does-not-have.md`. This pass appended an `Also seen:` line there, because step 12 adds one more record to that report for each takeover.

### B. The parser fix and its tests

**Checked and sound.**
- `parseFlags` (`hooks/lib/record-write.ts`) now refuses `--take-over-from ""` as usage. The check comes after the pairing check, so it is reached only on `claim` with both takeover flags. `flags.get(...)![0]` is safe there, because a flag with no value has already been refused as "needs a value".
- `record-write.test.ts` `describe("takeover, request 62")` grows from five usage cases to nine. Each case asserts `usage` and no mutation sent. The last four also assert the usage text of their own branch, so none of them can pass by hitting an earlier check:
  - the empty holder;
  - `--previous-claim` without a takeover;
  - `--previous-claim` as `[]`;
  - a re-send without `--previous-claim`.

  These cover the three branches G-B named and the new one.
- `hooks/dist/lib/record-write.js` changes by the same two lines, and the fresh compile matches it.
- G-B's E1, the version-boundary test needing full history, is left open on purpose. The commit message says so, and the issue has no `Resolved:` line.

### C. The upgrade limits against the tests

**Checked and sound.**
- **The old-client bullet.** It now says an unscoped `validate` "answers that the workbench is not valid, its findings naming exactly the packages that carry a transfer". In `round-trip-cli-takeover.test.ts`, the version-boundary case asserts `whole.ok` true, `valid` false, and that the set of finding paths equals the four transferred control paths. The "not measured" list (`list`, `reconcile`, `inspect`) is true: `oldRun` is called with `show`, `validate`, `release`, `transition` and `claim` only.
- **The unobserved-behaviours bullet** enumerates eight items:
  1. interactive approvals;
  2. a `revise` closure;
  3. policy-curator apply;
  4. reviewer with the ontology domain;
  5. state-auditor with live records;
  6. repetition;
  7. case (i);
  8. case (j).

  "The first six" and "the last two" partition that list. This follows `rules/critical-stance.md` §5.
- "Thirty-seven recorded exchanges" matches the tree: 76 entries, which are 37 pairs, `README.md` and `base/`, as the test's set check asserts.

### D. G-B's carried-over files

- **`base/`.** The 29 files read in full agree with the README's table:
  - thirteen control files: P, Q, U, N, O, Z, T, I and the five consent records X1 to X5;
  - memo M;
  - N's backup under `archive/migrations/`;
  - `workbench.json`.

  N's `provenance.backup` names the backup path, and the replay's case 35 passes against it.
- **Exchanges read against Prior's cases:**
  - `04` lands with `previous_checkout_id` `deadbeef`;
  - `08` is `takeover-holder-mismatch` (case 5);
  - `15` with `source: null` is `schema-invalid/request` (case 4);
  - `26` is `transition-refused`, no `claimed -> claimed` edge (case 8);
  - `32`, on an issue, is `schema-invalid/not-a-package`.
- **`rules-emission.golden`** is regenerated output, as above.

## Cross-cutting observations

- **Prose cuts made to pay for the row.** The +99 bytes in the row are paid for by two cuts elsewhere in `agents/orchestrator.md`: the `## Work packages` "Make each operation's call" sentence, and the session-end staging paragraph. Both keep their claim and their citation. The second loses the "forty-three minutes" detail, which the cited record keeps.
- **G-B's record-state theme continues.** A1 (left `open`) is closed. The record now waits at `answered` for a transition that only the orchestrator's reconciliation sends. That is the general lifecycle, not a defect of step 12. It does widen G-A's D2, as noted in A.

## Recommended sequencing

- No release blocker. Step 13 may proceed on C = `a563ff6a`, or on the head that carries this review.
- G-A's D2 and G-B's E1 stay on step 18's list as before.
