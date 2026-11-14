# Which commit is the candidate of request 82 built from?

---
**Domain:** code
**Partners:** orchestrator and consultant
**Rounds:** 1
**Ceiling:** 8
**Outcome:** did not converge after 1 rounds
**Cross-references:** `261114-1554-which-commit-is-the-candidate-of-request-82-built-from-now-that-main-differs-from-the-tag-in-install-tree-files.md`, `261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior.md`

---

## Question

The user ruled on 2026-11-14 that the bundle of request 82 is built from the tag `v13.5.0`, and that fusion's Go copy takes `campaign.json` as the fourth control-file name when Prior's pin commit is passed. Planning stopped at its first measurement: the five files that differ between the tag and `main` sit under `codec/`, which the installer copies whole, and the Go change reaches a bundle only through a rebuild. The open decision `261114-1554-…` puts four options: the tag as ruled with the difference stated; a new patch version 13.5.1 built after the Go change; the tag with the Go change held until Prior's answer; a commit of `main` under the version 13.5.0. The user invoked the discussion on that question, at the point where the session had put the first three options to him.

## What held up

### C1 — The five files that differ between `v13.5.0` and `main` outside `fusion-workbench/` are all inside the bundle, so a bundle built at the tag and one built at `main` carry different digests.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `git diff --stat v13.5.0 HEAD -- . ':!fusion-workbench'` prints five files, all under `codec/` (`codec/vitest.workspace.mjs` new, 34 lines); `install.sh:85-87` copies `codec` whole; request 79 `### The bundle` defines the install tree as every file `git ls-files -s` lists under the copy loop's entries. See C8: the digests differ even without these files.

### C2 — None of the five files changes anything a Prior run starts: they are the request log, two test sources and the codec's vitest configuration.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** by reading, not by a run: `git grep -n "REQUESTS\.md\|vitest\|__tests__" v13.5.0 -- bin hooks/dist codec/dist adapters/prior/fusionmodule catalog/profiles skills agents rules` finds comments only; the test diff changes one expected string (`install.test.ts:555`) and adds comments (`migration.test.ts:15-18`); the vitest config moves `include` into the new workspace file.

### C3 — The module binaries the bundle carries compile the three-name `Select`, so a bundle built from the tag selects three control-file names whatever `main` holds later.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `adapters/prior/fusionmodule/internal/controlrecord/controlrecord.go:45` names `package.json`, `*.record.json`, `*.evidence.json`, equal at tag and HEAD (`git diff --stat v13.5.0 HEAD -- adapters` empty); called at `internal/entry/entry.go:546` from `:443`; `adapters/prior/stage.sh:84-85` copies `fusionmodule/` into the Prior clone's `integrationbuild/`, where the binaries are compiled. The consultant corrected the wording: the Go change does not exist yet; what is compiled in is the three-name `Select`.

### C4 — A 13.5.0 module selecting three names while Prior's host, after its pin commit, recognises four causes no failure in any run request 82 would ask for.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** checked on fusion's side. `campaign` is `prior: unsupported` at the tag (`git show v13.5.0:catalog/catalog.json`); the one writer of `campaign.json` is `bin/fusion-campaign` via `hooks/lib/campaign-write.ts`, reached from `skill-campaign` (unsupported on Prior) and the orchestrator's `sync`, which `catalog/profiles/orchestrator/parts/59-prior.md:2` says does not run on Prior. `entry.go:443-450` asks the host for exactly the records `Select` picks, so a three-name module asks for a strict subset of what a four-name host admits; a changed campaign file is codec-checked with the bundle's own codec `36570a7c…`, the campaign codec. Prior's pin commit, as Prior lists it (Prior `bd3c1bf`, answer to 81, question 3), adds no check that module and host select the same names. The final step rests on that Prior commit, which does not yet exist (C10).

### C5 — Request 79's rule "a commit that must land first moves the candidate to a new patch version" does not reach the Go change.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the rule covers D "until a tag" (`codec/fixtures/prior/REQUESTS.md:7447`); `v13.4.4` exists and was ruled to stand (`1f92185c`), so the rule is spent and does not carry over to 82 by itself. The Go change's timing is set by Prior's pin commit (Prior `bd3c1bf`: "the fourth name arrives on Prior's side with the re-pin"). If Prior's answer to 82 asks for the fourth name inside the module, that is request 79's **Corrected** route, a new patch version.

### C6 — Of the four options, only those that build from the tag (1 and 3) let the bundle and every digest-bearing figure be prepared before Prior's pin commit.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** options 2 and 4 build from the commit carrying the Go change, which the user scheduled for after the pin commit (ruling 2 in the package narrative). The consultant adds the stronger ground: the user's words "Gebaut wird aus dem Tag v13.5.0, nicht aus HEAD" contradict options 2 and 4 directly, and option 3 contradicts ruling 2 ("fusions Go-Kopie nimmt campaign.json … auf"). Only option 1 is consistent with both rulings.

### C8 — Any two build commits give different digests, whatever files differ.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `adapters/prior/build.sh:74-113` writes `fusion_revision` (HEAD) into `build-identity.json`, which request 79 `### The bundle` lists among the payload entries ("manifest and identity 2").

### C9 — A bundle built from the tag now is byte-identical to one built from the tag after Prior's pin commit.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** checked on fusion's side. `git show v13.5.0:adapters/prior/PRIOR_PIN` reads `08c57fb…`, and `stage.sh` clones that pin, not Prior's HEAD (request 79, `### Written against`); at 79 two clean clones produced identical output (`cmp` and `diff -r` exit 0). So preparing now under option 1 is durable.

## What fell

## What could not be decided

### C7 — Whatever commit is chosen, a 13.5.0 candidate cannot carry the campaign part of the user's goal; the request has to say so, and the campaign part needs a later candidate.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the first half holds: `campaign` is unsupported on Prior at 13.5.0, so a Prior-hosted run cannot start `/fusion:campaign`, and request 82 has to say so. The second half needs two inputs: a fusion ruling on whether the campaign entry gets Prior support at all, given that Prior runs make no commit (`59-prior.md:1-2`); and Prior's open analysis of how a campaign task across several checkouts is set up as a fixture (`261114-0713-fusion-prior-two-strands-towards-an-open-weight-run.md`, lines 34 and 89). Partly against the claim: Prior's planned campaign baselines are recorded under Claude Code, where the entry is supported, so 13.5.0 can serve that recording.

### C10 — Whether Prior's post-pin host accepts any 13.5.0 candidate.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** missing input: Prior's pin commit, its value at `internal/fusionhost/workbench.go:22`. The host refuses a payload whose codec is not `QualifiedCodecDigest` (Prior `bd3c1bf`, question 5: `cmd/prior/fusion_route_ollama.go:261-284`). The 13.5.0 codec is `36570a7c…` at tag and HEAD alike, so this does not separate the four options.

## Recommendation

This recommendation binds nothing; the decision `261114-1554-…` is the user's.

Build the candidate of request 82 from the tag `v13.5.0`, as ruled (option 1 of the decision). It is the only option consistent with both of the user's rulings (C6), the five differing files reach nothing a Prior run starts (C2), a three-name module on a four-name host asks for a subset and no read is refused (C4), request 79's rule on later commits is spent (C5), and the bundle can be built now without going stale before Prior's pin commit (C9). Request 82 then states: the files in which `main` differs from the candidate, and that a bundle's digest differs from any other commit's by construction (C8); that the bundle's module selects three control-file names while `main` and Prior's host select four from the pin commit on; and that `/fusion:campaign` cannot start in a Prior-hosted run of 13.5.0, while Prior's Claude Code recordings, where the entry is supported, can use it (C7, first half).

Two points stay open and no further round could close them: whether Prior's post-pin host accepts a 13.5.0 candidate at all (C10, decided by Prior's pin commit and the same for every option), and whether the campaign part of the user's goal needs a later candidate (C7, decided by a fusion ruling on Prior support for the campaign entry and by Prior's analysis of a multi-checkout campaign fixture). The discussion was closed by the user after round 1 for that reason.
