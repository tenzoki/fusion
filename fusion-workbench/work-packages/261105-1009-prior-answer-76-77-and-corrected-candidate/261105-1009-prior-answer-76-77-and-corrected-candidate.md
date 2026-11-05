# Record Prior's answer to requests 76 and 77, and build the corrected candidate it asks for

## Directive

Filed on the user's words in chat on 2026-11-04 and 2026-11-05. Asked how the Prior integration stands, the user was told that Prior had answered at `52a2703` with "corrected", and was offered three moves. The first read: "Antwort und Fehler eintragen, dann die neue Version planen (empfohlen). Den Plan legst du vor der Umsetzung noch frei." The user answered "1", then: "führe das im automodus durch".

The work: file Prior's defect D-F1 in this workbench, record the answer in `codec/fixtures/prior/REQUESTS.md` with the Prior commit that holds it, plan the corrected candidate (module fix, v3 of the frozen entry assets, new patch version, rebuild, new digest, new request), and carry that plan out.

Reached when: the answer is recorded, D-F1 is fixed in a built bundle under a new digest, and the new request stands in `REQUESTS.md` for Prior to answer. Neither a tag nor a push belongs to this work: the tag waits for Prior's answer to the new request, and the user has not asked for a push.

Source of the answer: `docs/design/fusion-entry-v2-request76-77-prior-response.md` in the Prior repository at `52a2703`.

## Closure

Done on 2026-11-05, in commits `6f9607b0..dfaab63b`, closing value `done`. Request 78 is at `dfaab63b`, naming bundle `sha256:439142d70b8d0bfabe2936a209f51703121a6113aaa4158eb42a810feff6d153`, built at C″ `a3274f23` and delivered. `codec/fixtures/prior/REQUESTS.md` at that commit is `2e39d7b0fa48fe4da969a56fd5f83fdbc1b4f4cbf78033fa73aa6839d7c23801`. No tag and no push. The bundle has run on no Prior host.

The closing review is `261105-1459-reviewer-13-4-2-closing.md`, range `702294c3..1504f7c2`, verdict revise. Three findings are corrected in request 78; `261105-1453-the-setup-binding-says-the-commands-it-names-use-the-six-though-it-names-the-helper-form-and-its-exit-127-clause-covers-neutral-blocks-only.md` is bundle bytes and stays open for the next candidate, as does the watch-list finding `261105-1453-the-prior-commands-watch-list-still-passes-env-with-an-assignment-timeout-sh-c-bash-lc-eval-and-a-quoted-assignment.md`. Review coverage: `dfaab63b` and the commit carrying this note are after that range and unreviewed, and hold only the appended passage and workbench files.

The plan carries no v3 of the entry assets, which departs from what this package named at filing; that choice and two rulings stay open as decisions in this package. `rm` was not measured in the image.

The stop conditions were not put, answered by **Mode:** autonomous on this item, and no clause is marked as failing. Verbatim from the plan:

- The work is finished when request 78 is appended at a committed fusion commit naming the 13.4.2 digest, D-F1's issue is closed, and the user has been told which commit to report to Prior.
- **Nothing in this work tags, pushes, or bumps the marketplace.** The tag waits for Prior's answer to request 78, and for the user's rulings on the two decisions it states. `v13.4.1` is not tagged at all.
- No codec byte moves: `CODEC-PIN` prints `b4047458…` at C″, in the tarball and at the request commit. A step that needs a codec change stops the work there.
- No frozen file changes its bytes and none is added: `FROZEN-PIN` exits 0 at C″. A step that needs otherwise stops and re-files this plan, because `261105-1023-does-the-13-4-2-candidate-carry-the-v3-of-the-entry-assets.md` would have changed.
- `PRIOR_PIN` stays `08c57fb`. A build or test failure that needs a pin move stops the work.
- The Claude distribution is unchanged except the help paragraph, the two pin examples, the `README-agents.md` row and the golden: `CLAUDE-DIST` at C″ lists only those. Any other difference is a stop.
- The release commit C″ has a precondition: a reviewer pass over the diff of steps 2 to 4 has run, and each finding is fixed or filed. The pass reads the rewritten `prior` part commands against the substitution table, and `Select` against Prior's `entryControlRecord`. The release commit's message names that review. The orchestrator dispatches it after step 5 and before step 6.
- The bundle is delivered only from a clean tree outside the workbench whose `plugin.json` names 13.4.2. A `+dirty` identity is never handed over.
- Until a tag, main takes no commit to a shipped file after C″ other than `REQUESTS.md`. A commit that must land first moves the candidate to 13.4.3 and steps 6 to 8 are redone.
- Fusion records nothing on Prior's behalf and changes nothing in the Prior repository. Prior's production-run gap (limit G8) gets no step here (condition did not arise: no clause of this plan needs a production run).
- Step 1 failing to measure does not stop the work: step 8 then says "not measured" and question 2 stands on the inventory alone.
- The neutral parts and `bin/` helpers are not rewritten here. If Prior's answer refuses the wider guarantee, that is a later candidate under `261105-1023-neutral-shell-blocks-...`.
