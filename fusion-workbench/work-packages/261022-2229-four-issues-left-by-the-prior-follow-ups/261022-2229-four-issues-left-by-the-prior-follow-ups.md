# Work the four issues the Prior follow-ups package left open

## Directive

The user, 261022, on being offered the choice after `261022-1604-prior-bundle-closing-review-follow-ups` closed `done`, option 1: file a new work package for the four issues that stand open in that package's issue store, claim it, and plan it.

The four issues, all in `work-packages/261022-1604-prior-bundle-closing-review-follow-ups/issues/`:

- `261022-1712-catalog-render-test-no-longer-reproduces-agents-reviewer-md-since-91395e02.md`
- `261022-1806-migrate-run-maps-every-ensurebackup-failure-to-exit-9-including-a-copy-io-error.md`
- `261022-2143-three-pinned-codec-texts-still-say-proposed-mapping-or-every-cycle-after-step-13.md`
- `261022-2143-migrate-skill-repair-apply-sentence-no-longer-tells-the-reader-to-stop-on-exit-6-or-9.md`

This item is reached when each of the four stands `closed`, fixed with a verification that passed or closed with a disposition the user accepted. The codec-text issue changes files Prior pins, so its fix travels to Prior with fusion's next codec request (the re-pin of `d6fc9da0…`), under a number fusion assigns.

Mode, 261023, the user's word at the approval of plan `261022-2234-plan-four-issues-left-by-the-prior-follow-ups.md`: "2", choosing the offered option "Freigeben, im Autonomie-Modus. Dann laufen die Freigabepunkte durch, ohne dass ich dich frage." The plan is approved with its four defaults (no release before step 4; a description-only delta falls under option 2 of `261019-0913-…`; the reviewer sentence goes into a `claude` fragment; step 3 also corrects the `run` sentence). Set as `mode` `autonomous` on that word; it was given at the plan approval rather than in the turn of the filing or the claim.

Closure condition, 261023, the user's words after Prior announced the re-pin: "Wenn 75b geklärt ist: Paket abschließen, mit Review." This item stays `claimed` until Prior's answer to request 75(b) is relayed and recorded in `codec/fixtures/prior/REQUESTS.md`; then the closing review runs and the item closes. Prior's 75(a) answer (Prior `8b505a8`, accepted) is recorded; Prior said it does the re-pin after its own container rebuild finishes.

## Closure, 261023

Closed `done`, outcome `completed`, over commits `7bf53fed..45d40491` (8 commits), after Prior's answer to 75(b) was recorded, as the user's closure condition above asks. All four issues are closed `fixed`; plan `261022-2234-plan-four-issues-left-by-the-prior-follow-ups.md` closed with its 5 steps done. Request 75 is complete: 75(a) accepted at Prior `8b505a8`, 75(b) re-pinned and replayed at Prior `08c57fb`, so `b4047458…` is the qualified bundle and a tag on a commit holding `aa4277d8` no longer waits.

Closing review `261023-1023-reviewer-closing-review-of-the-four-issues-left-by-the-prior-follow-ups.md`: verdict accept, `uncovered=0`; Not-opened the two generated files, checked by rebuild. It filed one Low issue in this container, `261023-1023-migrate-run-exit-9-branch-for-an-unverified-backup-has-no-test.md`, left open for follow-up work.

Stop conditions, not put to the user under `mode` `autonomous`; carried verbatim, none marked failing by the dispatcher, with the reviewer's mechanical results:
1. "The work is finished when each of the four issues in the table above stands `closed`, fixed with its step's acceptance passed or closed with a disposition the user accepted." All four closed `fixed`, each with a `Resolved:` line.
2. "Also only if no byte of a frozen catalog asset moved: `cd catalog && shasum -a 256 -c schemas/FROZEN` passes at the last step's commit." Reviewer: 14 of 14 OK.
3. "Also only if no growth-bound baseline or head-room constant changed: `git diff 0db5d0de HEAD -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/helpers/growth-bound.ts hooks/lib/__tests__/fixtures/dispatch-path.baseline hooks/lib/__tests__/fixtures/rules-emission.golden` prints nothing. `hooks/lib/__tests__/fixtures/surface-growth.golden` is outside that set on purpose: it is regenerated in steps 2 and 3 and is not a baseline." Reviewer: empty.
4. "Also only if `git diff --name-only 0db5d0de HEAD -- codec/fixtures` names `codec/fixtures/prior/REQUESTS.md` alone, and its diff only adds lines after the section that ended at `0db5d0de`. No recorded exchange, seed or golden was re-recorded." Reviewer: `REQUESTS.md` alone, 303 lines added after line 5792, none removed.
5. "This package does not tag. A release tag on any commit holding step 4 waits for Prior's acceptance of request 75(a), recorded in `codec/fixtures/prior/REQUESTS.md` (`261019-0913-may-a-codec-revision-after-13-1-0-be-tagged-before-prior-re-qualifies-its-bundle.md`, option 2). The package's closure does not wait for that answer." No tag in range; 75(a) recorded at `ac665ffd`.
6. "A release tag on a commit that holds steps 1 to 3 and not step 4 carries `d6fc9da0…`. 74(a) has already met its condition. Whether such a tag is cut is `## Open Questions` 1, and cutting it is a release act outside this package." No such tag was cut.
7. "This package builds no module bundle and hands none to Prior; Prior's repository is read and never written." No bundle built; Prior read only.
