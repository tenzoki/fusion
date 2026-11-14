# Analysis: request 82, the delta 13.4.4 → 13.5.0 for a Prior run, where `main` differs from the candidate, and fusion's campaign material

**Date:** 2026-11-14 17:04
**Type:** Impact (with a document study of the campaign material)
**Status:** Complete
**Requested by:** orchestrator, plan `261114-1656-plan-request-82-the-candidate-13-5-0-for-prior.md` step 1

## Question

What does a Prior-hosted run of 13.5.0 get that a run of 13.4.4 did not? Where does `main` differ from the candidate `v13.5.0`? What can fusion offer Prior for a campaign task across several checkouts? Items (a) to (g) of step 1. Items (b) and (c) re-check claims C1 to C9 of discussion `261114-1608-which-commit-request-82-candidate-built-from.md` and the measured part of decision `261114-1554-which-commit-is-the-candidate-of-request-82-built-from-now-that-main-differs-from-the-tag-in-install-tree-files.md`.

## Scope

**Fusion, measured at `ccdbb0aec371d76574751c0e43a4427121c637dc`** (2026-11-14 16:59:40 +0100, "chore(events): the commit and campaign-read rows of checkout 114caf11"), branch `main`. `git status -sb -- codec adapters catalog` prints `## main...origin/main` and no path, so the tree matches `origin/main` as last fetched (no fetch was run). Every reading "at the tag" uses `git show v13.5.0:<path>`, `git diff <ref> <ref> -- <paths>` or `git grep <term> v13.5.0 -- <paths>`. The tag was never checked out. No whole-tree git command was run.

- `v13.4.4` → commit `bcb7133d6d907477d3a3070e029bc98d5b07605f`.
- `v13.5.0` → tag object `48fe207c1a546440e375f57955cfaeebd6a7467f` (`git cat-file -t` prints `tag`), commit `6063934602b39d7445219006757bf415e3bef144`, committed 2026-11-11 12:48:45 +0100.

**Prior** (`/projects/productive/F09-Prior`) was read from committed objects only, with `git -C … show <commit>:<path>` and `git log -1`/`git show --stat` on the two named commits: `10e07d2c1b29cdf0ffe77181f1d0e6ebe3d11d62` (2026-11-13 12:20, parent `5975da60`) and `bd3c1bf2de1737e8cad852af3f2d19ebe0d5bb3c` (2026-11-12 20:13, parent `a8a5ef59`). Prior's working tree was not read, and nothing was written there.

The directory `/Users/kai/.fusion-tmp/114caf11/request-82/` (step 2's scratch) was not touched.

**Labels.** **measured** means a command ran and its output is stated. **read** means read in source and not run. *inference* is marked. Each figure names its command.

## Findings that correct or sharpen the plan and the discussion

These come first, as the dispatch asks. None contradicts C1 to C9. Three add to them.

1. **The stale request-81 sentence is in three shipped files, and one of them is rendered for Prior.** The plan names only `docs/campaign.md`. `git grep -n "asked and unanswered" v13.5.0 -- . ':!fusion-workbench' ':!codec/fixtures/prior'` (measured) finds it in:
   - `catalog/profiles/skill-help/parts/21-prior.md:1`;
   - `docs/campaign.md:7`;
   - `docs/upgrading-to-v13.md:339`.

   The `help` entry is `prior: supported` (measured, item (d)). `renderPrior` renders the prior parts of every profile whose referrer is not `unsupported` (`catalog/src/render.ts` `priorProfiles`, read). So the bundle's `profiles/skill-help.md` tells a Prior run, under "Coming from 13.4.4", that the re-pin "is request 81, asked and unanswered" (*inference* from the render rule; step 2 can confirm it in the tarball). **The sentence was true at the tag and is stale now, not "stale at the tag".** The tag's `REQUESTS.md` records no answer to 81: `git show v13.5.0:codec/fixtures/prior/REQUESTS.md | grep -n "^### Prior's answer"` ends with the answer to 80 (measured). Prior answered at `bd3c1bf` on 2026-11-12, and fusion recorded the answer at `4a512b9f` on 2026-11-13, both after the tag (measured, `git log v13.5.0..HEAD -- codec/fixtures/prior/REQUESTS.md`). The bundle is the tag's tree, so the sentence ships in all three places whatever `main` says.
2. **`adapters/` is identical between the two tags.** `git diff --stat v13.4.4 v13.5.0 -- adapters` prints nothing (measured). The module's Go sources, the launcher and `PRIOR_PIN` are those of 13.4.4. *Inference:* with the same `go_version` and pin, the three target binaries are byte-equal to 13.4.4's table. Step 2 measures this.
3. **One hook change can reach a Prior run, and only on a workbench that holds a campaign file.** C2 and C4 do not cover it. `staging-drift.ts` `classify` now returns `record` for `campaigns/<id>/campaign.json`. It sits in the tracker's import graph (item (e)). The Go module's `Select` still ignores that path (C3).
4. **The plan's delta size includes `install.sh`.** Over the copy-loop entries, `catalog` and `adapters`, `git diff --stat v13.4.4 v13.5.0` ends `188 files changed, 14362 insertions(+), 512 deletions(-)`. Adding `install.sh` (+1 −1, the pin example) gives the plan's `189 … 14363 … 513` (measured). Both figures are right for their path sets.
5. **The multi-checkout material simulates checkouts. No fixture has one clone per checkout.** The measured case `ax-k2-3-261105.json` carries ten checkout ids as data. The tests that use it write all of them from one pushing clone and read them from a second clone. Only `campaign-sync.test.ts` runs two clones with two git identities and two `.checkout-id` files. Detail in item (f).

## Findings

### (a) The commits `v13.4.4..v13.5.0` outside `fusion-workbench/`

`git rev-list --count v13.4.4..v13.5.0` prints 39, with `-- . ':!fusion-workbench'` 29, and `--first-parent` the same 29. `git rev-list --count --merges` prints 0 (all measured). `git log --format='%h %ad %s' v13.4.4..v13.5.0 -- . ':!fusion-workbench'` lists them. The per-commit file lists come from `git show --format= --numstat <c> -- . ':!fusion-workbench'` (measured).

`04d6e051` (Prior's answer to 80 recorded) and `dc51d55c` (request 81) change only `codec/fixtures/prior/REQUESTS.md`. The rest follow, the campaign commits first, in commit order:

| Commit | What it does for a Prior run |
|---|---|
| `4a81e482` | The campaign store enters the layout. `bin/fusion-stores` prints `CAMPAIGN_STORE=campaigns`. `bin/fusion-paths` gains `OUT_CAMPAIGN`/`SCAN_CAMPAIGNS`, emitted only to consumers whose prompt names them: of every agent and skill, only `campaign` receives a campaign key (measured, `bin/fusion-paths <name> \| grep -c CAMPAIGN` over `agents/*` and `skills/*/`; `bin` equals the tag, item (c)). `staging-drift.ts` classifies `campaigns/<id>/campaign.json` as a record (item (e)). Rule text in three files |
| `063d33e2` | Codec source: reads `campaign.json` as kind `campaign`, read-only. No bundle change yet |
| `01892937` | `protocol.schema.json`'s `record_selector` admits a campaign path. Three protocol fixtures and their manifest rows |
| `2f4228d1` | Codec bundle rebuilt with the campaign read (first move of `codec/dist/fusion-record.js` in the range) |
| `257e50dd` | Test data only: the measured case `hooks/lib/__tests__/fixtures/campaign/ax-k2-3-261105.json`. It is in the install tree, and no run reads it |
| `81bf45cf` | `record-index.ts` leaves a campaign row out. `stores.ts` constants. Not in the import graph of the five hook entries (item (e)). Reachable through bin helpers that use the record index, and only when a campaign file exists |
| `71b0e914` | `bin/fusion-campaign overview` and `hooks/campaign.ts`, `hooks/lib/campaign.ts`; `.gitignore`. No Prior-rendered part calls the helper to run it (item (b)) |
| `9d9cc841` | Catalog entry `campaign` with `support.prior` `unsupported`, the `skill-campaign` profile, `skills/campaign/SKILL.md`. Module data: `catalog.json` moves. The profile is not rendered for Prior |
| `e5ab2ead` | The citation sweep refuses a campaign record. On Prior the sweep is called only from `skill-migrate` (`17-prior.md`, `19-prior.md`, read), and `migrate` is `unsupported`, so no Prior route reaches it |
| `26a9d6b2` | `campaign.schema.json`: `lanes` is a required root key; 9 new fixtures, 26 stamped `"lanes": null` |
| `15be5d20` | The three lane rules, the member `prior` on a campaign's `show`; bundle rebuilt |
| `3840bda4` | `package.schema.json` gains `resources`; `set-resources` protocol branch; 11 fixtures |
| `d3ad786d` | The `set-resources` operation in the codec and `bin/fusion-write set-resources`; bundle rebuilt to `36570a7c…`. A package with `resources` is refused by the codec `b4047458…` (request 81). No Prior-rendered part names `set-resources` as an action (item (b)) |
| `418bc2cc` | `bin/fusion-campaign`'s steering writes (`hooks/lib/campaign-write.ts`), the only writer of `campaign.json` (C4, read) |
| `7cd51fea` | `bin/fusion-campaign sync`, the commit cycle with the `campaign_read` row |
| `77c35be0` | The orchestrator's commit step runs `sync` (`37-claude.md`, Claude only). **Prior render moves:** `59-prior.md` gains the row "`campaign_read` — Never yours: `bin/fusion-campaign sync` does not run on Prior, and this run makes no commit cycle" |
| `de1a8159` | The overview's full tier, lanes and the seven conditions |
| `052d84d8` | `bin/fusion-campaign cut`, the lane proposal; the test helper `campaign-fixture.ts` |
| `9de7eab0` | The skill's parts 05 to 07 (Claude), `docs/campaign.md` |
| `15530b7c` | Version 13.5.0. **Prior render moves:** `skill-help/parts/21-prior.md` gains "Coming from 13.4.4", which carries the stale sentence (finding 1). `docs/upgrading-to-v13.md` gains 38 lines |
| `9254ee16` | Orchestrator sync sub-step wording, `37-claude.md` only |
| `b979f19a` | `campaign-sync.ts` imports `utcStamp`; a comment in `orchestrator-events.ts` |
| `5f0cbead` | One reading of a live campaign for reads and writes; skill wording |
| `4d8bec3e` | The skill spells the control path a lane member's write takes |
| `849d59fc` | `README-agents.md` migration note; nothing a run reads |
| `ee1a4984` | Citation sweep leaves a hash-bound file as written (no Prior route, as `e5ab2ead`); `reviewer/parts/13-claude.md` and `agents/reviewer.md` cite by storeless basename, Claude only |
| `60639346` | Release: `plugin.json` version and description, `README.md`, `install.sh` pin example `tags/v13.5.0` |

The campaign range is `4a81e482` to `4d8bec3e`, as the plan says. The codec moved at `2f4228d1`, `15be5d20` and `d3ad786d`, and at none after (`git log -1 --format=%h -- codec/dist/fusion-record.js` at `HEAD` prints `d3ad786d`, per request 81's restatement; the tag and `HEAD` hash equal, item (c)).

### (b) The campaign as it reaches a Prior run

```mermaid
flowchart LR
  subgraph tag["Tree of v13.5.0"]
    CAT["catalog.json: campaign, prior unsupported"]
    PROF["skill-campaign profile"]
    BIN["bin/fusion-campaign (install tree)"]
    P59["orchestrator 59-prior.md: sync does not run on Prior"]
    P21["skill-help 21-prior.md: campaign unsupported on this host"]
    CODEC["codec 36570a7c: campaign read-only, set-resources"]
    SD["staging-drift classify: campaign.json is a record"]
  end
  subgraph run["Prior-hosted run"]
    RENDER["rendered profiles (supported entries only)"]
    HOOKS["hooks at /opt/fusion"]
    MOD["module Select: three names"]
  end
  CAT -->|unsupported: not rendered| PROF
  P59 --> RENDER
  P21 --> RENDER
  BIN -. present, no Prior part runs it .-> run
  CODEC -->|in install tree| HOOKS
  SD --> HOOKS
  MOD -. campaign.json not selected .-> run
```

- **`support.prior` of `campaign` at the tag: `unsupported`** (measured: `git show "v13.5.0:catalog/catalog.json"` parsed). The entry is `kind` `skill`, `class` `asks`, `requires` `host.question.v1`, `host.exec.v1`, subcommands `overview cut open lanes pause resume move reassign end`.
- **`skill-campaign` is not rendered for Prior.** `priorProfiles` skips a referrer whose `prior` state is `unsupported`. No role names `skill-campaign` (read, `catalog/src/render.ts`; roles listed by the same parse). Its `profile.json` declares `writes_workbench` `prior: false` and `execution_policy` `prior: prior-enforced` (read), so it would be refused even if it were rendered.
- **Prior and neutral parts that name `bin/fusion-campaign`, `campaign.json`, `lanes` or `set-resources`:** `git grep -n -E "fusion-campaign|campaign\.json|\blanes?\b|set-resources" v13.5.0 -- 'catalog/profiles/*-prior.md' 'catalog/profiles/*-neutral.md'` finds two, one line each (measured):
  - `orchestrator/parts/59-prior.md:2`: `campaign_read` is "Never yours: `bin/fusion-campaign sync` does not run on Prior, and this run makes no commit cycle".
  - `skill-help/parts/21-prior.md:1`: "13.5.0 adds the campaign across checkouts, steered from a Claude Code session; the campaign entry is unsupported on this host. … the orchestrator's commit step runs `bin/fusion-campaign sync` under Claude Code, and `bin/fusion-write set-resources` declares a package's areas. … a workbench this host also reads takes either only after Prior has re-pinned the codec: that re-pin is request 81, asked and unanswered, and this text predicts nothing about it."
  - The two neutral parts of `skill-campaign` (`02-neutral.md`, `04-neutral.md`) name none of the four terms, and they are not rendered anyway.
- **What `59-prior.md` says of `sync`:** the line quoted above. Its first line, unchanged, says a Prior run makes no commit (read).
- **What the codec `36570a7c…` does for a campaign:** cited from `REQUESTS.md` `### What the codec does for a campaign at this digest` (request 81, present at the tag and at `HEAD`). Kind `campaign` on `list`, `show` and `validate`, read-only, every mutation refused. The three lane findings come only from `validate` and `reconcile`. The member `prior` (`{charter_hash, revision}` or `{problem}`) appears on a campaign's `show`. `set-resources` replaces a package's `resources` whole.
- **Statement for request 82 (C7, first half), confirmed.** `/fusion:campaign` cannot start in a Prior-hosted run of 13.5.0. The entry is unsupported, its profile is absent from the render, and no Prior-rendered part runs `bin/fusion-campaign`. A Claude Code recording can use all of it: the entry is `claude-code: supported`, and `bin/fusion-campaign` with its four sub-libraries is in the install tree. *Inference*, not run: a Prior run whose workbench already holds a `campaigns/<id>/campaign.json` written under Claude Code still has the hook classification of finding 3 and the codec's read, and nothing in it writes the file.

### (c) `main` against the candidate

- **The copy loop at the tag** (`git show v13.5.0:install.sh`, lines 85 to 86, read): `.claude-plugin agents skills rules hooks codec bin stilwerk templates docs README.md README-agents.md README-hooks.md LICENSE`.
- **`git diff --name-status v13.5.0 HEAD -- <those entries> catalog adapters`** (measured):

  | Status | Path | `--numstat` |
  |---|---|---|
  | M | `codec/fixtures/prior/REQUESTS.md` | 554 0 |
  | M | `codec/src/__tests__/install.test.ts` | 2 1 |
  | M | `codec/src/__tests__/migration.test.ts` | 4 0 |
  | M | `codec/vitest.config.mjs` | 5 2 |
  | A | `codec/vitest.workspace.mjs` | 34 0 |

  `git diff --name-only v13.5.0 HEAD -- . ':!fusion-workbench'` prints the same five paths and nothing else. Nothing under `catalog`, `adapters`, `bin`, `hooks`, `agents`, `skills`, `rules` or `docs` differs. **C1 confirmed**, and the user's statement in the package narrative matches it path for path.
- **The codec:** `git show v13.5.0:codec/dist/fusion-record.js | shasum -a 256` and the same at `HEAD` both print `36570a7cafb3083a70b0386b337ac471357782b0d164b97fd28f2f7d740d8844` (measured).
- **The request log as the bundle carries it.** At the tag, `REQUESTS.md` is 7 997 lines, 1 359 919 bytes, `sha256:8ece771d672630ee78b3951fc2ec977c7950a82f8ec621f72b563001955a6f5f`. That equals the value request 81's restatement measured at `32ff15b7`. At `HEAD` it is 8 551 lines, 1 484 219 bytes, `sha256:5346572d70a268f51abd7b8a0187678ea789e9f304288efd57b96c2bdf5102f5` (measured, `git show <ref>:… | wc -lc` and `shasum -a 256`). Prior's answer to 81 names the version at `ee2df82e` (8 024 lines, `d7b57fad…`) as its hand-off (read, that document's head). The tarball carries an earlier version of the log than the one Prior last read.
- **`fusion_revision` (C8), read.** `adapters/prior/build.sh` at the tag: `fusion_revision()` (lines 78 to 95) takes `git -C "$fusion_root" rev-parse HEAD`. It refuses a tree dirty outside `fusion-workbench/`, or appends `+dirty` under `FUSION_BUILD_ALLOW_DIRTY=1`. `build()` calls it at line 113 and passes it as `-fusion-revision` to `cmd/fusion-bundle`, which writes it as `fusion_revision` (`main.go:159`, `:192`, `:226`, read). **C8 confirmed** by reading: any two build commits give two `build-identity.json` files and so two digests.
- **`PRIOR_PIN` (C9), read.** `git show v13.5.0:adapters/prior/PRIOR_PIN` prints `08c57fb4ec91df6b1e1e311fa2d063eb5ff08076`. `stage.sh` clones Prior "at PRIOR_PIN" (header lines 2 to 25). **C9's premise confirmed.** The byte equality itself is step 2's measurement.
- **`Select`'s names at the tag (C3), read.** `controlrecord.go:45` admits `package.json`, `*.record.json` and `*.evidence.json`, refuses dot segments and a root `archive/`, and its header names Prior's `entryControlRecord` at `52a2703` as the rule it copies. Callers at the tag (`git grep -n "controlrecord.Select" v13.5.0 -- adapters/prior/fusionmodule`, measured): `internal/entry/entry.go:546` inside `controlRecords`, whose results `:443` reads one by one through `host.ReadRecordAt`; the fake host `internal/fixture/entry.go:636`; and `conformance/hooks_test.go:664`. **C3 confirmed.** C4's "the module asks for a subset" holds for this path, since the module reads only what `Select` returns.

### (d) The catalog and profile delta

- **`git diff v13.4.4 v13.5.0 -- catalog/catalog.json`** (measured) adds one entry, `campaign`, after line 328, and changes nothing else.
- **Counts** (measured, a parse of `git show "<tag>:catalog/catalog.json"`):

  | Tag | Entries | `prior: supported` | `prior: unsupported` | `catalog.json` sha256 |
  |---|---|---|---|---|
  | `v13.4.4` | 27 | 24 | 3 | `ac5628687335575544a51e12e4abba4eb12f545b312b4988091c2d93d3e60e1b` |
  | `v13.5.0` | 28 | 24 | 4 | `21aa3a5e9f17905ebfd1428f9527d381b30dc5d8b17112d5f3b69f21fde7a7c3` |

  The four unsupported entries at the tag are `commit`, `cleanup`, `migrate` and `campaign`. The 13.4.4 value equals request 79's `catalog.json` sha256, so the two tags measure on the same basis.
- **Prior parts that changed** (`git diff --stat v13.4.4 v13.5.0 -- catalog`, measured, 18 files, +189 −10): only two, `orchestrator/parts/59-prior.md` (+1, the `campaign_read` row) and `skill-help/parts/21-prior.md` (+2 −2 in the stat, a paragraph added at the top and the "Coming from 13.0.0 to 13.1.12" paragraph removed at the foot). No neutral part outside `skill-campaign` changed. The other changes are `-claude.md` parts (orchestrator 37, 48c, 57, 59; reviewer 13; skill-help 21), the new `skill-campaign` profile (7 parts and `profile.json`), and `catalog/README.md`.
- *Inference* on the render: the set of rendered profiles is the 13.4.4 set (25), since the one new referrer is `unsupported`. Two rendered `.md` files move, `orchestrator.md` and `skill-help.md`. Step 2's `diff -rq` against 13.4.4 measures this.
- **`FROZEN` and `WITHDRAWN`:** `git diff --exit-code --stat v13.4.4 v13.5.0 -- catalog/schemas catalog/workflows` exits 0 with no output (measured). Both files sit at `catalog/schemas/FROZEN` and `catalog/schemas/WITHDRAWN` (`git ls-tree -r --name-only v13.5.0`, measured), so they are unchanged too.

### (e) The hooks between the tags

- **`hooks/hooks.json`:** `git show <tag>:hooks/hooks.json | shasum -a 256` prints `d7f4d7ab1d327d68b9e1c431484577f63c99e8fabc197b81a1caaac2d4dbc4f3` at both tags (measured). That equals the `lifecycle_hooks` digest request 79 states, so the declaration is unchanged. Commands: `session-start.js`, `session-id.js`, `guard.js`, `tracker.js`, `subagent-stop.js`, plus two inline shell commands (read).
- **The entry sources themselves are unchanged.** `git diff --stat v13.4.4 v13.5.0 -- hooks/checks-due.ts hooks/session-start.ts hooks/tracker.ts hooks/guard.ts hooks/subagent-stop.ts hooks/session-id.ts hooks/lib/temp-paths.ts` prints nothing (measured).
- **Hook sources changed** (`git diff --stat v13.4.4 v13.5.0 -- hooks` without tests, measured): 38 files, +6246 −101. New: `hooks/campaign.ts`, `lib/campaign*.ts` (four), with their `dist`. Changed: `citation-sweep.ts`, `lib/citation-corpus.ts`, `lib/orchestrator-events.ts`, `lib/record-change.ts`, `lib/record-index.ts`, `lib/record-write.ts`, `lib/staging-drift.ts`, `lib/stores.ts`. Tests: 19 files, +2815 −57.
- **What the five hook entries reach.** A script walked the relative imports of each `hooks/dist/<entry>.js` at the tag (`git show v13.5.0:<path>`, recursive) and intersected them with `git diff --name-only v13.4.4 v13.5.0 -- hooks/dist` (measured):

  | Entry | Modules in graph | Changed modules reached |
  |---|---|---|
  | `session-start` | 9 | `lib/orchestrator-events.js` |
  | `session-id` | 2 | none |
  | `guard` | 6 | `lib/orchestrator-events.js` |
  | `tracker` | 15 | `lib/citation-corpus.js`, `lib/orchestrator-events.js`, `lib/staging-drift.js`, `lib/stores.js` |
  | `subagent-stop` | 5 | `lib/orchestrator-events.js` |

- **Which of these change behaviour.** `git diff -U0` of the reached `dist` files, minus comment lines (measured): `orchestrator-events.js` and `citation-corpus.js` change in comments only. `stores.js` adds two exported constants, `CAMPAIGN_STORE = "campaigns"` and `CAMPAIGN_RECORD = "campaign.json"`. `staging-drift.js` adds one branch to `classify`: `campaigns/<id>/campaign.json` (exactly three segments) is `record`, "a campaign record, one writer, travels". Before the change such a path fell through every store test to the unclaimed remainder (read, `classify` at the tag).
- **What a Prior run can meet (step 3's input).**
  1. **Staging-drift report on a campaign file.** When `HEAD` has moved and `campaigns/<id>/campaign.json` is untracked or unstaged, the tracker's `measureStagingDriftForModel` (`tracker.ts:438`) now names it among the "record(s) … still uncommitted" in its model-facing text. That text has a `runsOnPrior` branch only for the commit-message class (`staging-drift.ts:820`), not for records (read). It is reachable on Prior only when (i) the workspace holds such a file and (ii) a commit runs in the run, as `contained-delivery-i-two-commits` did at 79. No Prior-supported entry writes the file (item (b)), so the trigger is a workbench prepared under Claude Code. **To measure:** not measured; step 3 can set it up with one scratch campaign file and one commit.
  2. **No new `runsOnPrior` branch, no new `systemMessage` path, no new `additionalContext` path.** `git grep -n runsOnPrior v13.5.0 -- hooks/lib/staging-drift.ts hooks/tracker.ts hooks/session-start.ts` lists the same sites as before, and the entry sources are unchanged (above). *Inference:* the three rows of request 79's table (the `cat /tmp/x` tracker reply, the session-start `systemMessage`, the commit-message sentence) produce the same output on 13.5.0 as on 13.4.4 under the same settings. Step 3 measures them. The due line's selector list depends on `checks-due.ts` and the check skill, and neither changed.
  3. **`bin/fusion-paths`**, called at every agent's Setup: the output for every consumer except `campaign` carries no new key (measured, item (a) row `4a81e482`).

### (f) Fusion's campaign material for Prior's multi-checkout task

All read at the tag with `git show v13.5.0:<path>`. Sizes and hashes measured (`wc -lc`, `shasum -a 256`). `git diff --stat v13.5.0 HEAD -- hooks docs` prints nothing, so every item is the same at `HEAD`.

| Item | Size | What it contains | Checkouts, remote | Consumed by, and what is asserted | What it gives a reference task | What it does not give |
|---|---|---|---|---|---|---|
| `hooks/lib/__tests__/fixtures/campaign/ax-k2-3-261105.json` | 1 298 lines, 58 783 B | The measured case: a consuming project (`ax-k2-3`) at commit `56c19983a`, hand-derived 2026-11-09. 28 packages in three groups (`pipeline-analysis` 23, `held-outside-lanes` 4, `lane-amendment` 1). Statuses: open 14, done 7, claimed 5, dropped 1, paused 1. 20 packages declare areas. `depends_on` edges. Three lanes (lane-1 "plan to run", `d44c592f`, 3 members; lane-2 "selection and catalog", `f85f8da1`, 8; lane-3 "AI calls (intake, fill, routes)", `95433365`, 9). Ten checkout ids with aliases. Five `commit` log rows. Every figure carries a `_source` provenance key | Ten checkout ids as **data**. No git repository, no remote. `source.clone` names a local path in another project | Through `campaign-fixture.ts` by `campaign-cut.test.ts` and `campaign-overview.test.ts` | A real, sized shape of a three-lane campaign over 28 packages: areas, edges, holders and log rows a task can be built from. The `_source` keys say where each figure came from | Any repository content of `ax-k2-3`. No real commits (tests synthesise one commit per log row). No campaign file (the overview test builds one from `lanes`). It names a foreign project and a local path, which a reference task shipped to Prior would have to reckon with (*inference*) |
| `hooks/lib/__tests__/helpers/campaign-fixture.ts` | 80 lines, 3 771 B | `buildFixture(project, options)`: writes the fixture's packages through the codec kernel (`json-workbench.ts`). Order: create, `set-dependencies`, `set-resources` (from `areas`; `shared_areas` written nowhere, "ruling B of 2026-11-09"), then each package brought to its status by `claim`/`transition`. Options select entries, areas and whether to transition | One JSON workbench in a temp dir (`withJsonProject`). No git | `campaign-cut.test.ts`, `campaign-overview.test.ts` | A ready recipe for turning the case into codec-valid `package.json` files. Every write goes through the codec, so no state the codec refuses can arise | Git history, checkouts as clones, a campaign file. It runs in vitest under Node and is not a CLI |
| `hooks/lib/__tests__/campaign-cut.test.ts` | 214 lines | Drives the real `bin/fusion-campaign cut` over the 23 `pipeline-analysis` entries, "no git". Three acceptance cases of plan step 15: (1) every entry live, process, strategy/catalog and ai each in a lane of their own, the route edge a hand-off; (2) the states of `56c19983a`, 15 live, one imbalance of seven against a bound of six; (3) with `shared_areas` too, 21 of 23 in one group. Also usage errors and two small-input rule tests | None; one workbench | Itself. Asserts lane assignment, that overlapping areas never split, byte-equal output on two runs, and the proposal file's keys | The expected lane cut for a known input: a reference for a task that cuts lanes | Anything after the cut: no open, no work in lanes, no checkouts |
| `hooks/lib/__tests__/campaign-overview.test.ts` | 380 lines | Drives the real `bin/fusion-campaign overview`. Reduced tier: `held=` rows read from the fetched ref, a dirty reading tree left alone, a draft without lanes, the states that are no answer. Measured case, reduced tier: the five holders dated by their rows' commits, one after a forced rebase. Full tier: the 28 packages and three lanes, four held packages in no lane, two hand-offs out of lane 1, one cross-lane commit by lane 2 under `pkg/ai`, every lane unconfirmed. Silent/unreadable lanes. `commitNamedBy` | **A bare origin, one pushing clone and one reading clone.** All checkouts' claims, registrations and log rows are written from the one pushing clone; the reader sees them only through `origin/main` | Itself. Asserts the `held=`, `campaign=`, `lane=`, `note=` lines and the exit codes | The read side across checkouts from a fetched ref, with a rebase in between: what a reference task's overview should print | Real separate checkouts. Ten checkout ids share one clone and one git identity ("Ada"); the reader is "Bo" |
| `hooks/lib/__tests__/campaign-sync.test.ts` | 269 lines | Drives the real `bin/fusion-campaign sync`. The cycle: rebase, union merge on the log, push, the `campaign_read` row on origin, overview reading the rebased commit, `pushed=` naming resolvable hashes, a decision taking one. Conflict (exit 10, rebase aborted). Dirty tracked file deferred. Paused campaign without lanes. Lane rule broken at the ref (unreadable). `mineOf`, `campaignReadRow` | **A bare origin and two clones, each with its own git identity and `.checkout-id`** (`clone(origin, tag, checkout)`). Network-free, all paths physical | Itself. Asserts the exit codes, the `state/ref/head/mine/settled` lines, a clean tree after, the `campaign_read` row's fields, and that the pushed hashes resolve in the other clone | **The closest thing to a multi-checkout task fusion has**: two real checkouts working one campaign with one lane each, through a shared origin | Only one lane and one package in the main case. The campaign file is placed by the test, not opened through `open`. No model, no orchestrator: `sync` is called directly |
| `hooks/lib/__tests__/campaign-write.test.ts` | 233 lines | Drives the seven steering writes of `bin/fusion-campaign` (open, lanes, pause, resume, move, reassign, end). Each stores the two values `show` answers as `prior` and validates. Non-completed `end` writes no evidence. Draft beside running. A claim held by the running checkout refuses every write (exit 8). Usage errors, a legacy workbench (exit 4). `readProposal` | One workbench. `git init` in one case only (the held claim) | Itself. Asserts each write's stored file validates and carries Prior's two hash values | The write side: how a valid `campaign.json` comes about, step by step, with Prior's own hashes | Checkouts, a remote, the read side |
| `codec/fixtures/valid/campaign/with-lanes.json` | 95 lines, 2 688 B, sha256 `dd0c92ff…` | The specimen of a Claude-written campaign: `260929-0900-parser-lanes`, `running`, two lanes (lane-1 `d44c592f` with two members; lane-2 `checkout_id` null, empty), Prior's `charter_hash` and `revision` stored | None (a file) | Manifest row (valid); `ops.test.ts` (`show` answers the two stored values; `validate` no finding); `prior-mapping.test.ts` (stores Prior's two hashes over its own export); `round-trip-cli.test.ts` (through the bundle); the three `lanes-rule-*` fixtures are variants of it | A valid `campaign.json` that Prior's own export reproduces. A task can place it under `campaigns/<id>/` as request 81 did | Packages: its members name record ids that exist in no fixture workbench (*inference* from the ids; not resolved here) |
| `docs/campaign.md` | 66 lines, 12 777 B | The model's description: steering from one session, the lane view, the seven conditions, the pause, and `## Where the Claude side deviates from Prior` (N lanes against Prior's two-writer bound, a pause at once on Prior, a first stored `running` with empty `sessions`/`runs`, nested-area grouping) | — | — | Prior's reading of how the Claude side works and where it differs | Fixtures. Line 7 and line 60 speak of request 81 as open: "asked and unanswered" (line 7), "Whether and when Prior moves its pin is request 81's" (line 60). Both are stale since Prior's answer at `bd3c1bf` (finding 1) |

*Inference* on what a multi-checkout reference task can take from this: the measured case for size and shape, `buildFixture` for codec-valid packages, the bare-origin-plus-clones pattern of `campaign-sync.test.ts` for real checkouts, and `with-lanes.json` or `campaign-write.test.ts` for the campaign file. No single item has N clones, one per lane, each working its lane under an orchestrator. That would be new.

### (g) Prior's own list for a confirmation

From Prior's committed objects only. `docs/design/fusion-entry-v2-request79-prior-response.md` at `10e07d2`: 465 lines, 41 505 bytes, sha256 `fc4ac7b0f9cbbdc3a22c1cb477e336b780ae55d9f13db7d877e814ea7b9bb44f`. `docs/design/fusion-codec-repin-request81-prior-response.md` at `bd3c1bf`: 314 lines, 29 621 bytes, sha256 `f622b2263ed51cb3d042f17c9dd6e14d5e07b25b0ec66d8b0cdf1d43d71f3a9a` (measured, `git show <c>:<path> | wc -lc` and `shasum -a 256`).

**`## What Prior said confirmation needs, item by item`** (at `10e07d2`, quoted):

> From `docs/design/fusion-entry-v2-request78-prior-response.md`, `## What confirmation on the next digest needs`, which marks the list as Prior's inference.

| Item | State | Evidence |
|---|---|---|
| A run on the digest, from a named Prior commit at `371dcea` or later, with no changed or untracked Go file, its evidence naming the digest | met | `## Identity` |
| The response naming the host commit, and `ff5f6e2` as where the check and the `argv` ruling landed | met | this document, `## Identity` |
| `commands.json` re-run on the bundle, and a ruling on the list if a command beyond it is needed | met. No command beyond the list is needed by a Prior run, and the list stays at the 26 | `## The commands on this bundle` |
| The hook replay repeated on it, and Prior's revision plan | the plan: met. **The replay: not met** | `## The hook replay on this digest` |
| Issue `261101-2130-…` read against both prongs there | met | `## Issue 261101-2130` |

> Four of the five items are met. The replay is the one that is not, and the verdicts above are given with that stated.

**`## The hook replay on this digest`** (at `10e07d2`, quoted in its main sentences):

> **It was not repeated.** The user ruled that Prior answers request 79 now, on the delivered run alone. Plan steps 75 and 76 of `WP`, which move the replay's pins to this bundle and repeat it, are open and were not run.
>
> - **What exists.** The last hook replay ran the hooks of the 13.4.1 bundle, with a check-stamp seed of `13.4.1` and no model call […]. It is no evidence about 13.4.4.
> - **What this run shows in its place, and what it cannot.** […] That covers 4 of the 24 supported entries on a fixture without stamps. The replay covers 27 entries against the 13.3.7 baselines. This run compares nothing with a baseline, so it does not show that the hook surfaces equal Claude Code's.
> - **What a repeat is expected to meet first.** On this bundle the session start lists `tmp` among the due selectors […]. *Inference:* the repeat delivers a due line where the baseline has none and stops at its surface s19 for a ruling.
> - **The read-only change does not reach the replay.** […]
> - **How long a repeat stays possible.** *Inference*, not run: once `QualifiedCodecDigest` moves, neither this payload nor a 13.3.7 fusion root passes Prior's codec check, so the replay can be repeated on this digest only while the pin has not moved.

**`### Question 3`** of the answer to 81 (at `bd3c1bf`, quoted in its main sentences):

> **Corrected.** Prior adds the name in both places, and only in the commit that moves the digest.
>
> - `entryControlRecord` (`internal/fusionhost/entry_workspace.go:294-310`, the three names at `:309`) selects, by file name, the changed paths the integration's codec check reads (`:1292`) and the records a module may then read (`internal/fusionhost/entry_services.go:553`, `:561-565`). […] It takes the bare name `campaign.json`, as it takes `package.json`.
> - `codecShaped` (`internal/qualification/fusionsurface/classify.go:179-201`) […] By that precedent the fourth name there is `campaigns/<id>/campaign.json`, three segments.
>
> […] A campaign file that breaks its schema or a lane rule therefore passes it. […] Prior keeps one rule for all four names and does not read `prior.problem` as a refusal.
>
> **Fusion's Go copy `Select`** names three at `d3ad786d` […]. It follows this answer: the fourth name arrives on Prior's side with the re-pin, and not at this commit.
>
> **What Prior changes.** Nothing at this answer. In the commit that moves the digest: `entry_workspace.go` with its comment, `TestEntryServicesControlRecordSelection` […], `classify.go` with its comment, and a classifier test.

*Inference* for request 82. Prior lists "the records a module may then read" as selected by `entryControlRecord`. A three-name module reads a subset of a four-name host's selection, which is C4's reading. Whether Prior's host compares the module's reads against its own selection is Prior's to say, and it is question (1) the plan already puts to Prior.

## Implications

- **C1, C2, C3, C8 and C9's premise hold by measurement or reading at `ccdbb0ae`.** C7's first half holds, more precisely: the only Prior-rendered campaign text is two lines, and both say the campaign does not run on Prior.
- **Request 82 needs one more stated-not-asked line, or a correction route.** The bundle's `skill-help` render tells a Prior run that request 81 is "asked and unanswered". Fixing it would move the bundle, which is the **Corrected** route to 13.5.1. Stating it in request 82 keeps the tag. The same holds for `docs/campaign.md` and `docs/upgrading-to-v13.md`, which a Prior run does not render but which ship in the install tree.
- **Step 3 has one hook change to measure beyond request 79's three rows:** the staging-drift record report on a `campaigns/<id>/campaign.json` after a commit (item (e) 1).
- **For the note to Prior on the test base:** fusion has material for each part of a multi-checkout campaign task, but no ready N-checkout scenario. Item (f)'s table is what request 82 can offer, each item with its limit.

## Recommendations

1. **Step 4 (data-implementer):** carry finding 1 under `### Stated and not asked` (three sites, one rendered for Prior, true at the tag and stale since `bd3c1bf`/`4a512b9f`). Carry finding 2 as the expectation step 2 confirms for the binaries.
2. **Step 3 (analyst):** add the staging-drift row of item (e) 1 to the measured hook rows, or state it not measured with the cause.
3. **Fusion's user, not this work:** whether the three stale sentences are corrected on `main` (Claude Code side) now. A correction there moves `main` further from the candidate in install-tree files, and request 82's `### Where main differs from the candidate` would then name them at step 7's re-measurement. No issue is filed here, because the user's ruling keeps the tag, so the sentence ships either way. Whether to fix it on `main` is a choice, not an unfixed defect in the work at hand.

## Filed Issues

None.

## Sources

- Fusion at `ccdbb0ae`: `git show`, `git diff`, `git grep`, `git log`, `git rev-list` over `v13.4.4` (`bcb7133d`), `v13.5.0` (`60639346`) and `HEAD`, path-limited as each item states.
- `codec/fixtures/prior/REQUESTS.md` at `HEAD`: `## The candidate 13.4.4 (request 79)` `### The commits since 13.4.2`, `### The bundle`, `### The codec and the frozen assets`; `## The re-pin to the codec of branch campaign (request 81)` `### What the codec does for a campaign at this digest`, `### Prior's own notes, answered`, `### The commit and the digest of 81, restated on main`.
- `catalog/src/render.ts` `priorProfiles`, `renderPrior`; `adapters/prior/build.sh`; `adapters/prior/stage.sh`; `adapters/prior/fusionmodule/internal/controlrecord/controlrecord.go`; `internal/entry/entry.go`; `cmd/fusion-bundle/main.go`; `hooks/lib/staging-drift.ts`; `hooks/lib/stores.ts`; `hooks/tracker.ts`; `bin/fusion-paths`; `bin/fusion-stores` (all at the tag).
- The seven campaign items of (f) and `docs/campaign.md`, `docs/upgrading-to-v13.md` at the tag.
- Prior: `docs/design/fusion-entry-v2-request79-prior-response.md` at `10e07d2`; `docs/design/fusion-codec-repin-request81-prior-response.md` at `bd3c1bf`.
- Package narrative `261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior.md`; discussion `261114-1608-which-commit-request-82-candidate-built-from.md`; decision `261114-1554-which-commit-is-the-candidate-of-request-82-built-from-now-that-main-differs-from-the-tag-in-install-tree-files.md`; plan `261114-1656-plan-request-82-the-candidate-13-5-0-for-prior.md`.

## Open Questions

- [ ] Whether `profiles/skill-help.md` in the 13.5.0 tarball carries the "asked and unanswered" sentence. Step 2's tarball can confirm it with `grep`. Finding 1 is an inference from the render rule.
- [ ] Whether the three stale sentences are corrected on `main` before request 82 is filed (Recommendation 3). This is the user's choice.
