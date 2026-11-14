# Consultation: how the fusion and Prior strands continue, towards fusion's surface on Prior with an open-weight model

**Date:** 2026-11-14 07:13
**Status:** Complete
**Requested by:** Kai Stalmann, from the two session summaries of 2026-11-14 06:57 (Prior) and 06:58 (fusion)

## Question

Fusion 13.5.0 added campaigns, which Prior does not yet read. How should the two strands continue so that fusion's function set can be tested on Prior with an open-weight model?

## Context

Measured on 2026-11-14 at fusion `c124027a` and Prior `c42ddbf` (Prior's working tree holds the uncommitted re-pin plan, two decision records and one discussion).

- **The goal is already Prior's directive.** Prior's re-pin plan, `## Directive`: make each fusion function startable through Prior with the same structural effect as under Claude Code, "first on P11b, then on `qwen3.6:35b` through Ollama". Step 1 of the spec is P11b (the Claude subscription route), step 2 is the open-weight model (Prior's `261113-1934-full-fusion-surface-on-prior-codec-repin-request81.md`, `## Where this work stops`).
- **The open-weight steps sit at the end of a chain.** Step 35 depends on 33 and 34; step 34 (the Ollama route) depends on 28 and 77; step 33 is the P11b table, behind 29 to 32, which need 76 and 77 (same plan, lines 552, 561, 570, 581 and step 29). Step 77 is stopped on the open decision `261107-0848-how-does-a-p11b-role-run-reach-the-runs-tools-and-hooks.md`. That record is "the subscription path waits on a decision from you" in Prior's summary.
- **The machine is ready for the model.** `ollama --version` reports 0.40.0, the version step 34 pins, and `~/.ollama/models/manifests/registry.ollama.ai/library/qwen3.6/35b` exists. Not checked: whether the manifest digest is the one step 34 will pin, and how much context the machine carries.
- **The codec is the coupling.** `codec/dist/fusion-record.js` hashes to `b4047458…` at `v13.4.4` and to `36570a7c…` at `v13.5.0` and at `HEAD` (measured). Prior's host accepts one codec digest (`QualifiedCodecDigest`, `internal/fusionhost/workbench.go:22`, per Prior's plan; not re-read here).
- **13.5.0 is the right candidate.** `git diff --name-status v13.5.0..HEAD` outside the workbench names `codec/fixtures/prior/REQUESTS.md`, two test files under `codec/src/__tests__/`, `codec/vitest.config.mjs` and the new `codec/vitest.workspace.mjs`. No skill, agent, hook, `bin/` helper or the codec bundle has changed since the tag. The test corrections the fusion session mentions do not touch what Prior runs.
- **Prior's test basis has no campaign in it.** The 27 reference tasks under Prior's `tests/testdata/fusion-surface/tasks/` include no `campaign`, and `inventory.json` names `fusion_version` 13.3.7. Fusion's `v13.3.7` tree has no `skills/campaign`; `v13.5.0` has it (both measured with `git ls-tree`).

## Analysis

### The real bottleneck is the test basis

Prior's second decision record, `261113-1934-which-fusion-root-builds-the-fixture-…`, shows that after the re-pin no fusion root passes both fixture checks: the reference tasks require 13.3.7, the host requires the new codec, and no fusion version is both. It recommends deferring the question until fusion files the next candidate (option 3).

That recommendation is sound for the re-pin alone. For your goal it costs a cycle. The 13.3.7 baselines can never test campaigns, because 13.3.7 has no campaign. Any plan that wants to test "the fusion function set" at 13.5.0 needs Claude Code baselines recorded at 13.5.0, which is option 1 of that record. Option 2 (a second, older codec for the fixture only) keeps the 13.3.7 baselines and therefore keeps campaigns out of scope; the discussion also found it names only half of the code it must change (claim C12).

So the fixture-root question should be ruled now, for option 1, and not deferred. The recording itself waits for the candidate, but the reference tasks for campaign can be written while fusion prepares request 82.

**Cost of option 1, as the record states it:** live Claude Code runs over the reference tasks, with you at the terminal for the `asks` entries, and a re-read of the hook surfaces and the stamp seed for 13.5.0. It overturns the standing ruling that the 13.3.7 baselines stay; that ruling is yours to lift.

**Open design question (not answered here):** a campaign spans several checkouts. A reference task for `/fusion:campaign` needs a fixture with more than one checkout and a fetched ref. Prior's task format was written for one repository. That needs a short analysis on Prior's side before the tasks are written.

### The ten steps bound to 13.4.4

Prior's discussion supports "move the pin and keep the steps" and I agree. The hook replay on 13.4.4 (option "replay first") would measure a version that fusion has already ruled to stand without it (fusion `1f92185c`) and that nobody will run after the pin. Its expected first result is a stop that needs a further ruling. The hook comparison belongs on the 13.5.0 bundle, in request 82.

Ending the steps (third option) would force a new plan immediately, before the candidate it would bind exists.

### The subscription path is on the critical path of the open-weight test

Step 35 runs `qwen3.6:35b` on the entries that passed P11b. That ordering is deliberate: P11b separates defects in Prior's host from weaknesses of the model. A failure on qwen alone is then attributable to the model or the route. Without it, every qwen failure is ambiguous.

Step 34 (the Ollama route) also waits for step 77, because it builds `fusionModuleBackend` for `ollama` "on step 77's shape" (plan line 548). **Inference:** that is a design-consistency dependency, not a technical one; the native route runs its tools through Prior's own loop and does not need the managed MCP seam that step 77 lacks. If you want the open-weight route earlier, step 34 could be decoupled from 77 by a ruling. I do not recommend decoupling step 35 from 33.

The decision `261107-0848` offers A (a small host seam in `RunRole`) and B (a turn bridge). B makes each MCP tool call a journalled model attempt that never reached the model, which falsifies the journal's account of inference. **Inference:** A is the cleaner fit; its cost is a change in `internal/supervisor/roles.go`, which step 77's stop clause reserves for your ruling. Note: the record's support for A cites a comment at `internal/supervisor/tools.go:196`; at `c42ddbf` that line is about failed observations, not this seam. The record should be re-checked before it is ruled.

## Recommendations

The order below is the critical path. Steps in the same phase can run in parallel.

### Phase 0 — rulings, now

1. **Prior, decision `261113-1934-what-becomes-of-the-plan-steps-…`:** "Umstellen und die Schritte behalten".
2. **Prior, decision `261113-1934-which-fusion-root-builds-the-fixture-…`:** option 1, baselines move to the candidate's fusion version. Lift the ruling "the 13.3.7 baselines stay" explicitly, recorded beside it.
3. **Prior, decision `261107-0848`:** have the consultant re-verify its citations, then rule (A recommended, see above).
4. **Prior:** commit the plan, both decision records and the discussion, and adopt the plan (claim C13: it is not yet the plan in force).

### Phase 1 — re-pin and candidate, in parallel

- **Prior:** steps 89 to 92, one pin commit, then the follow-up to request 81 with the commit and test results. Relay to fusion through you.
- **Fusion:** prepare request 82 for the bundle built from tag `v13.5.0` (not from `HEAD`: nothing shipped differs, and a tag-built bundle is reproducible). Contents, after the pattern of 79: bundle and digest; the change list 13.4.4 → 13.5.0 with campaigns first (`/fusion:campaign`, `campaign.json`, lanes, `set-resources`); the items Prior is to rule on; the hook comparison deferred at 13.4.4; what fusion does with the answer. Request 82 is filed after Prior's pin commit, so that it can name it.
- **Fusion, after Prior's pin commit:** the Go copy accepts `campaign.json`; Prior's commit is entered in `REQUESTS.md`, which closes question 1 of 81.

### Phase 2 — new test basis at 13.5.0 (Prior)

- An analysis of how a campaign reference task is fixtured (several checkouts, a fetched ref).
- Reference tasks re-read for 13.5.0, campaign tasks added; baselines recorded under Claude Code at 13.5.0, with you at the terminal for `asks`.
- A revision plan binds steps 75, 76, 29 to 37 to the 13.5.0 bundle. Step 76 (the hook replay) runs on it and answers the hook item of request 82.

### Phase 3 — subscription route (Prior)

- Step 77 on the ruled shape, then step 34 (Ollama route, offline tests), then 29 to 33 (P11b live, with your fresh approval after step 76).

### Phase 4 — open-weight (Prior)

- Steps 35 to 37 on `qwen3.6:35b`; every gap filed as an issue; the gap report is the deliverable for your question.

### What I would not do

- Replay hooks on 13.4.4 now.
- Defer the fixture-root ruling: it is the decision that determines whether campaigns can be tested at all.
- Build request 82 from `HEAD`.

## Open Questions

- [ ] How is a multi-checkout campaign fixtured in Prior's reference-task format?
- [ ] Does the local `qwen3.6:35b` manifest digest match what step 34 will pin, and what context does the M2 Max carry at 35B?
- [ ] Is step 34's dependency on 77 to be kept, or decoupled so the Ollama route can be built while 77 waits?
- [ ] Which `asks` entries need you at the terminal for the 13.5.0 baselines, and how many sessions does that take?

## Sources

- Fusion: `git log`, `git tag`, `git diff --name-status v13.5.0..HEAD`, `git ls-tree v13.3.7|v13.5.0 skills/`, codec bundle hashes at `v13.4.4`, `v13.5.0`, `HEAD`; `codec/fixtures/prior/REQUESTS.md` section headings (request 80 at line 7462, request 81 at line 7826).
- Prior, in its work package `261021-2241-full-fusion-surface-on-prior`: the plan `261113-1934-…-codec-repin-request81.md` (Directive, steps 29, 34 to 37, `### What steps 29 to 37 now mean`, `## Where this work stops`); decisions `261113-1934-what-becomes-of-…`, `261113-1934-which-fusion-root-…`, `261107-0848-…`; discussion `261113-2031-…` (claims C6, C9, C11 to C13).
- Prior: `concept/README.md`, `docs/qualification/p10-local-profile.md`, `docs/qualification/2026-09-27-backend-switching.md`, `tests/testdata/fusion-surface/tasks/`, `docs/qualification/fusion-surface/inventory.json`, `internal/supervisor/tools.go:190-200`.
- Local machine: `ollama --version`, `~/.ollama/models/manifests/`.
