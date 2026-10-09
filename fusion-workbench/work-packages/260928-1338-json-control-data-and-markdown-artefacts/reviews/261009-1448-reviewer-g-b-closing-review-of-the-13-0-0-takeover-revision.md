# Review G-B: the closing pre-release review of fusion 13.0.0's takeover revision, `031645d2..4e1e1b47`

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `031645d2..4e1e1b47`
**Not-opened:** `codec/fixtures/protocol-session-takeover/*.request.json`, `codec/fixtures/protocol-session-takeover/*.response.json`, `codec/fixtures/protocol-session-takeover/base/`, `hooks/lib/__tests__/fixtures/rules-emission.golden`

What the Not-opened list covers, and what it does not:
- The recorded exchanges are gated byte for byte by the takeover round-trip test, which passed.
- Of `base/`, one consent narrative was read, and the five consent control files were read for their state.
- The workbench-only files of the range were read by subject, file list and record state only. They are not listed path by path.
**Review domain:** both
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts
**Plan:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md (gate G-B, ahead of step 12)

**What the range is.** It runs from G-A's head `031645d2` to `4e1e1b47`. The code-bearing commits are:
- `f2b545d6` (step 3);
- `cc30475e` (the citation sweep);
- `f7b8f54d` (step 4);
- `00e465f6` (steps 5 and 6);
- `e34642a6` and `8bb82215` (step 7 and its fix);
- `0a0d6148` (step 8);
- `dd4bf3d4` (step 11).

`1e969cff`, `e9c411b5` and `4e1e1b47` append to `codec/fixtures/prior/REQUESTS.md` (steps 1, 2 and 9). The rest is workbench-only.

Compiled files were not read line by line. They were verified by rebuild, as the next paragraph says.

**The compiled trees are the build of their sources at `4e1e1b47`.** I made a scratch clone at `4e1e1b47`, entered it by absolute `cd` and confirmed it with `pwd`. In it:
- `hooks`: `npm install && npm run build`; then a fresh `tsc -p tsconfig.json --outDir <elsewhere>`, with `diff -rq` against `hooks/dist/`: no difference.
- `codec`: `npm run build` reported `dist/fusion-record.js: unchanged`, a byte comparison of a fresh esbuild bundle in `scripts/build.mjs` `main`. The digest is `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, the one the step note and request 64 state.
- `git status --porcelain` was empty before and after both suites.

## Summary

The takeover meets Prior's accepted contract:
- the request shape;
- the ten checks in Prior's order, CAS before the holder;
- the closed history entry;
- no chain rule;
- the frozen `transferred_at`;
- each transfer source as a reconcile site;
- the old bundle's refusal measured, not argued.

For your top concern: nothing changes for a package without a takeover.
- The new member is optional.
- `claimPlan` branches only on `takeover !== undefined`.
- Migration, kernel, journal, store and `codec/contract/` are byte-unchanged.
- The workbench manifest and the migration receipt pin schema ids, not schema bytes.
- This repository's own workbench, migrated with the old bundle on 2026-10-06, validates under the new bundle: 168 checked, 0 findings.

Four findings came out of the pass:
- **One medium:** the shipped takeover route leaves its consent decision `open`, and the orchestrator then puts it to the user again at every Setup.
- **Three low:**
  - two misstatements in the upgrade limits;
  - three untested branches of the flag parser;
  - a test that needs full git history.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 3 |

Four issue files, all stamped 261009-1448, in this package's issue store.

## What was run

- **Scratch clone** at `4e1e1b47`, as above.
- `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test`: 22 files, 1 810 passed, 0 skipped, 370 manifest entries, 13 Go-emitted goldens, 163 of 163 `prior_keys`.
- `cd hooks && npm test`, run after the codec suite and not beside it: 1 152 passed, 14 skipped (the opt-in observation file), 0 failed.
- In the live tree, read-only:
  - `echo '{"op":"validate"}' | bin/fusion-record`: `valid: true`, 168 checked, 0 findings;
  - one `list`;
  - path-limited `git log` and `git diff` only.
- `git -C fusion-workbench log --follow --diff-filter=A --format=%h -- <this package's narrative> | tail -n 1` prints `d84b8dfd`, the filing commit of 2026-09-28. So G-A's A1 fix anchors this package correctly; G-A measured `95720e4c` here.
- **Not run:** the opt-in observation suite (`FUSION_AGENT_RUN=1`). It is plan step 16's.

## Findings by theme

### A. The takeover against Prior's contract

**Checked and sound.**
- **Request.** `codec/schemas/protocol.schema.json` gives `takeover` as closed, both members required, and `null` refused. `previous_claim` refers to `common` `$defs/claim`. `source` refers to `$defs/claim_transfer/properties/source`, which is a `record_ref` or a `user-word` around a record or artefact ref; `null` and the `legacy` shape are excluded.
- **Order of checks.** `codec/src/cli/ops.ts` `takeoverPlan` runs `livePackage` first: read, CAS, not-a-package, terminal. Then it checks, in this order:
  - claimed;
  - the canonical three-field equality of the stored claim with `previous_claim` (`journal.ts` `canonical` sorts keys, and a null `claimed_at` compares as `null`);
  - the same checkout;
  - a null new `claimed_at`;
  - `resolveReference`, the resolver `set-mode` uses;
  - `validateResult` on the package schema.
  This is Prior's order, and no branch falls back to `transitionPlan`.
- **Entry.** Every member is set. `transferred_at` is copied from `req.claim.claimed_at`. `source` is kept verbatim. `{...pair.control, claim, provenance: {...provenance, claim_transfers: [...history, entry]}}` moves no other field.
- **Schema.** `$defs/claim_transfer` is closed with every member required. The new `claim.claimed_at` is forced to a timestamp. `actor` is `allOf` of `$defs/actor` and `not` the legacy-unknown token. Record and campaign refuse `claim_transfers` through `allOf`/`not`. Evidence has no provenance and has a negative fixture.
- **Fixtures.** I compared the invalid fixtures with their nearest valid one. Each differs by one structural change:
  - a member removed or added;
  - one value nulled;
  - `claim-transfer-new-claimed-at-null` also moves `/claim/claimed_at`, which keeps the package itself consistent.
- **Reconcile.** `referenceSites` adds `/provenance/claim_transfers/<i>/source/ref` for a user word and `/source` for a record. `record-archive.test.ts` shows a resolved record source and an unresolved but present artefact source both held, and a terminal package moving together with its consent decision.
- **Kernel.** `kernel.test.ts` recovers a takeover cut at every point to one replacement and one entry, and the replay bytes are unchanged. `transitions.test.ts` pins that `claimed -> claimed` stays no edge.
- **Version boundary.** `round-trip-cli-takeover.test.ts` runs the qualified `c76bbce9…` from its git blob over the session's end state:
  - `show` answers the record as stored;
  - `validate`, `release`, `transition` and a takeover are refused;
  - an unscoped `validate` names exactly the four transferred packages;
  - no byte moves.
  The 86 valid fixtures of `031645d2` validate in the new inlined schema set.
- **`REQUESTS.md`.** All three additions are pure appends: the hunk starts at old line 2754 with no removal. The line citations of the step-9 corrections (2859, 2878, 2931, 2982, 3035, 3045) point at the text they quote. The file at `dd4bf3d4` hashes to `44cad87d…`, 3 045 lines, as stated. The fixture counts it states (370 entries, 91 valid / 279 invalid by schema, 104 session files, 29 under `base/`) match the tree.

**A1. The takeover route leaves its consent decision `open`, so every Setup surfaces it as an unanswered question. Medium.**
- `agents/orchestrator.md` `## Work packages`, the **Take over** row (from `0a0d6148`), files the user's approval with `create --kind decision` and names no transition, so the record stays `open`.
- `rules/fusion-workbench-conventions.md` `## State Markers — decisions` defines `open` as "filed, not yet answered". But this record is the answer.
- `agents/orchestrator.md` `## Setup`, "Surface open decisions", lists every `open` decision to the user as a user decision. So each later session asks the user again about a takeover that has already landed.
- All five consent records of `codec/fixtures/protocol-session-takeover/base/` carry `"state": "open"` and a question as their title (`# May B take over P from deadbeef?`). Observation case (i) checks the record's kind and text, not its state.

Scope: the orchestrator prompt and observation case (i). The codec is not affected: it resolves the source whatever its state.
Issue: `261009-1448-the-takeover-route-leaves-its-consent-decision-open-so-every-setup-surfaces-it-as-an-unanswered-question.md`.

### B. The Claude-side client

**Checked and sound.**
- `parseFlags` applies the pairing check to `claim` alone, after `8bb82215`. The object check and the re-send flag set run only when `--take-over-from` is present, and only `claim` accepts that flag. `release`, `transition` and `set-mode` reject the three new flags as unknown.
- `takeover()` is reached only from `mutation()`, for `claim` with `--take-over-from`:
  - It refuses its own checkout as a usage error.
  - The first call compares the `show` holder with the flag, refuses exit 5 and sends nothing.
  - A re-send reads no `show`, and refuses a frozen previous claim that names another checkout.
  - It still runs `claimWritten`.
- `record-change.ts` adds both checkout ids only for `op === "claim"` with `takeover`.
- `hooks/write.ts` quotes the JSON `--previous-claim` in the stderr re-send hint.

**B1. Three takeover flag branches of the parser have no test. Low.**
- `record-write.ts` line 277: `--previous-claim` on an ordinary claim.
- Lines 278-279: a non-object `--previous-claim`.
- Lines 281-282: a takeover re-send missing `--previous-claim`.

None of these is reached by `record-write.test.ts`, whose `grep` finds `previous-claim` on lines 130 and 136 only. Each is the shape `8bb82215` had to repair.

Separately, `--take-over-from ""` is refused as ownership (exit 5) rather than as a usage error. Nothing is sent either way.
Issue: `261009-1448-three-takeover-flag-branches-of-the-write-client-parser-have-no-test.md`.

### C. Release text against behaviour

**Checked and sound.**
- `grep` finds no shipped "There is no takeover" and no "takeover waits".
- The remaining "no flag overrides either" (`record-write.ts` header, `## Ownership`) concerns `release`/`transition` and written claims, and stays true.
- The conventions paragraph, `docs/working-model.md`, `README-agents.md` and the `README-hooks.md` `bin/fusion-write` row agree with the client.
- The `autonomous` sorting lists take over among the operations that "ask as written".
- `docs/upgrading-to-v12.md` and `README-agents.md` now call `code-reviewer`/`data-reviewer` Prior catalog names, not dispatchable ones (issue 261009-0644, closed).
- `skills/cleanup/SKILL.md` keeps a record pair in one split (issue 261009-0647, closed).
- The pin examples name `tags/v13.0.0`.
- `surface-growth.golden` is the measured inventory. The baselines in `surface-growth-bound.test.ts` did not move. The `reference-resolution-lint` baseline was re-approved with its reason on the line.

**C1. The upgrade limits call a measured aggregate unmeasured, and omit observation case (j). Low.**
This is the nit the dispatch named, and it is confirmed.
- `docs/upgrading-to-v13.md` lines 178-180 say "Other operations were not measured: an aggregate operation of an old client may fail". `round-trip-cli-takeover.test.ts` lines 653-657 measure an unscoped `validate`: it answers, invalid, naming the four transferred packages.
- The bullet "Seven agent behaviours … were never observed" lists case (i) as written and not run. It does not list case (j), which was written in the same commit and also not run. That makes eight.

Issue: `261009-1448-the-upgrade-limits-call-a-measured-aggregate-unmeasured-and-omit-observation-case-j.md`.

### D. Step 4's fixes (G-A's A1 and B1)

**Checked and sound.**
- `hooks/review-coverage.ts` refuses `--since ""` with exit 1. `review-coverage.test.ts` asserts that.
- The closing anchor command is read out of `agents/orchestrator.md` by the new test and run on a renamed v11 store: it returns the narrative's filing commit, not the migration's.
- `/fusion:cadence` now dates each `record_change` row by its local date through `node`. Its install case checks three time zones whose dates are computed from the row's own `ts`, so the hour of the run no longer decides the outcome. Both G-A issues are `closed`.

### E. Test infrastructure

**E1. The version-boundary test needs full git history at two fixed objects. Low.**
- `round-trip-cli-takeover.test.ts` line 612 reads blob `6ecde063…` with `git cat-file`.
- Line 664 reads the manifest and fixtures at `031645d2` with `git show`.

No other codec test depends on history. Inference, not run: in a shallow clone or a `git archive` tree, the codec suite fails in `beforeAll`. The plan's own runs use full clones.
Issue: `261009-1448-the-version-boundary-test-needs-full-git-history-at-two-fixed-objects.md`.

## Cross-cutting observations

- **The shape of the claim is written three times.** It appears in `package.schema.json` `claim`, in `common.schema.json` `$defs/claim`, and inline in the protocol's `claim.claim`. They agree today. Prior's pin excludes `package.schema.json` from this revision, so no issue is filed. A later schema revision could point the two copies at `$defs/claim`.
- **The record states that are left behind matter.** A1 resembles G-A's D2 (an implemented decision handed to a route that does not move it): a procedure files a record and leaves its state to nobody. Both are prompt text and need no codec change.
- **Workbench practice.** This scratchpad directory is shared with other agents of the session. My first test run wrote `codec-test.log` there, under a name another run also uses. I deleted my own copy and re-ran into `gb-logs/`. No other agent's file was removed. Inference: the 14:22 `hooks-test.log` there is not mine, and it was not overwritten, because the stopped run never reached its hooks step.

## Recommended sequencing

1. Step 12: A1. It is one clause in the **Take over** row, plus a state assertion in observation case (i).
2. Low, carried to step 18's list unless fixed alongside: C1 (two sentences), B1 (three test cases), E1 (a fixture or a named precondition).
3. G-C then reviews step 12's commits alone.
