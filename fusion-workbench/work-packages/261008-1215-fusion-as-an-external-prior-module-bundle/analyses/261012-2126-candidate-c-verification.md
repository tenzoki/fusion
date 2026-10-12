# Analysis: candidate C verified, the Claude distribution measured against v13.0.0

**Date:** 2026-10-12 21:26
**Type:** Document Study (verification report, plan step 20)
**Status:** Complete
**Requested by:** orchestrator, under `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md` step 20
**Cross-references:** `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md`, `261012-2126-the-installed-tree-diff-at-c-lists-five-files-where-step-20-names-three-because-install-sh-copies-hooks-and-codec-whole.md`, `261012-2126-hooks-package-lock-json-is-ignored-and-untracked-so-npm-ci-cannot-run-in-a-clone-and-codec-gitignore-says-otherwise.md`

## Question

Is `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c` (C) the candidate the plan can hand over to Prior at step 21: do the three Node suites and the Go adapter suite pass at C, does the bundle build reproducibly, and does an HTTPS install of C differ from an install of `v13.0.0` only where the plan's acceptance says it may?

## Scope

Measured, not inferred. Every command below was run on 2026-10-12 between 21:14 and 21:26 local time, and its output is quoted or summarised with counts.

**The fusion tree** at `/Users/kai/Projects/productive/F04-FUSION/fusion`: HEAD `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c`, committed 2026-10-12 20:20:18 +0200, branch `main`, `git status -sb` reads `## main...origin/main` with two modified files, both under `fusion-workbench/` (the event log and this package's plan control file). `git ls-remote origin refs/heads/main` answers `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c`, so `heads/main` on GitHub is C. `v13.0.0` is an annotated tag (object `7a5fc8f8`) on commit `468d8e870962988b22416ac2a4c1975ca7db2fb4`, committed 2026-10-09 22:34:08 +0200. No command in this report wrote into this tree.

**The isolated clone** at `<scratch>/clone`, `<scratch>` being `/private/tmp/claude-501/-Users-kai-Projects-productive-F04-FUSION-fusion/3bd9f8b5-e804-461f-868f-a0c46a94a8f9/scratchpad/step20`: `git clone` of the tree above, `git checkout --detach c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c`, `git rev-parse HEAD` = `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c`, `git status --short` empty before and after every run (the dependency installs and the hooks build write only ignored paths).

**The Prior repository** at `/Users/kai/Projects/productive/F09-Prior`, `adapters/prior/PRIOR_PIN` = `10ad78becad0bb5323b1afeba4842fc21605f570`, which that repository resolves.

**Toolchain:** node v25.7.0, npm 11.10.1, `go version go1.26.0 darwin/arm64`, curl at `/opt/local/bin/curl`, tar at `/usr/bin/tar`, claude 2.1.296 at `/Users/kai/.local/bin/claude` (`install.sh` dies without `claude` on `PATH`, line 49 of the committed file).

**Not measured:** Prior's own host running the bundle (that proof is step 21's); the marketplace install path (`install.sh` only).

## Findings

### 1. The installed-tree diff: NOT MET as written (five files differ, the acceptance names three)

Two installs, each with the `install.sh` committed at its own ref (`git show v13.0.0:install.sh`, sha256 `620f7031…`; `git show c8d5a6f1:install.sh`, sha256 `4837fb63…`; the two differ by one comment line, line 29, the pin example), each under `env -i` with only `HOME`, `PATH` and `FUSION_REF` set:

```
env -i HOME=<scratch>/home-13.0.0 PATH=/opt/homebrew/bin:/Users/kai/.local/bin:/opt/local/bin:/usr/bin:/bin FUSION_REF=tags/v13.0.0 bash <scratch>/installers/install-v13.0.0.sh
  -> exit 0, "fusion 13.0.0 installed.", root <scratch>/home-13.0.0/.fusion
env -i HOME=<scratch>/home-C PATH=<same> FUSION_REF=heads/main bash <scratch>/installers/install-C.sh
  -> exit 0, "fusion 13.1.0 installed.", root <scratch>/home-C/.fusion
```

That the `heads/main` install is C: every copied item of the installed tree compared byte for byte against `git archive c8d5a6f1` (`diff -rq`, filtered to lines that are not "Only in archive"): no difference. The same comparison of the `v13.0.0` install against `git archive v13.0.0`: no difference. Both trees hold 1507 files.

```
diff -rq <scratch>/home-13.0.0/.fusion <scratch>/home-C/.fusion
Files .../home-13.0.0/.fusion/.claude-plugin/plugin.json and .../home-C/.fusion/.claude-plugin/plugin.json differ
Files .../home-13.0.0/.fusion/README-agents.md and .../home-C/.fusion/README-agents.md differ
Files .../home-13.0.0/.fusion/README.md and .../home-C/.fusion/README.md differ
Files .../home-13.0.0/.fusion/codec/fixtures/prior/REQUESTS.md and .../home-C/.fusion/codec/fixtures/prior/REQUESTS.md differ
Files .../home-13.0.0/.fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts and .../home-C/.fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts differ
```

The three the acceptance names, and what their hunks are:

- `.claude-plugin/plugin.json`: one line, `"version": "13.0.0"` to `"version": "13.1.0"`.
- `README.md`: one line, line 26, `FUSION_REF=tags/v13.0.0` to `FUSION_REF=tags/v13.1.0`. **The pin example at line 26 is the only hunk.**
- `README-agents.md`: 11 added lines, no removal: the `catalog/` row after line 200 under `## Plugin structure`, and `### The Prior module bundle (adapters/prior/)` after line 372 under `## Releasing`.

The two the acceptance does not name:

- `codec/fixtures/prior/REQUESTS.md`: 1263 added lines, no removal (the five sections `## FJ05 (the release evidence at 468d8e87)`, `## FJ05 (released as v13.0.0)`, `## Module bundle (request 67, …)`, `(request 68, …)`, `(request 69, …)`). The same acceptance's codec clause permits exactly this file.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`: one line, the `BASELINE` re-approval (finding 3). The plan's fourth stop clause permits it.

Why they appear: `install.sh` lines 84 to 87 copy `hooks` and `codec` as whole directories, tests and fixtures included, and exclude nothing but `node_modules`. Any change the codec clause or the stop clause permits therefore reaches the installed tree. The acceptance text and the copy list cannot both hold at any C that carries a request to Prior, and the step cannot be read as met as written. Neither file is read by an agent, a skill, a hook at run time or a `bin/` helper: one is a vitest source, the other a fixture document. The Claude distribution's behaviour is unchanged by both; its bytes are not. Filed as `261012-2126-the-installed-tree-diff-at-c-lists-five-files-where-step-20-names-three-because-install-sh-copies-hooks-and-codec-whole.md` for the orchestrator to rule on (amend the acceptance, or exclude test and fixture paths from the copy).

**Verdict: not met** (five files, of which three are the named ones with the named hunks; the two others are inert and are consequences of two other acceptance clauses).

### 2. Neither installed tree holds `catalog/` or `adapters/`: MET

```
find <root> -maxdepth 1   (identical for both roots, sorted)
.  ./.claude-plugin  ./agents  ./bin  ./codec  ./docs  ./hooks  ./README-agents.md  ./README-hooks.md  ./README.md  ./rules  ./skills  ./stilwerk  ./templates
```

`catalog` and `adapters` are absent from both roots (tested with `[ -e ]` on each of the four paths). `LICENSE` is on the copy list but in neither ref's tree, so it is absent too. No `node_modules` and no build output is in either tree: the GitHub tarball carries none, and the diff above lists no such path. Also absent on purpose, since they are not on the copy list: `install.sh`, `CLAUDE.md`, `fusion.json`, `.gitignore`, `.gitattributes`, `fusion-workbench/`, `activity-log-k1.md`, and two stray root entries, `foobaa.txt` and `refactor/`, which both refs carry (not a C regression; noted, not filed).

**Verdict: met.**

### 3. `git diff --quiet v13.0.0 C -- agents skills rules hooks bin templates stilwerk`: MET WITH THE NAMED DEVIATION

```
git diff --quiet v13.0.0 c8d5a6f1 -- agents skills rules hooks bin templates stilwerk ; echo exit=$?
exit=1
git diff --stat v13.0.0 c8d5a6f1 -- agents skills rules hooks bin templates stilwerk
 hooks/lib/__tests__/reference-resolution-lint.test.ts | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

The one changed line is the `BASELINE` constant at line 480: `{ paths: 2045, anchors: 370, stampBare: 11 }` to `{ paths: 2051, anchors: 373, stampBare: 11 }`, with its re-approval comment dated 2026-10-12 (plan step 19). `agents`, `skills`, `rules`, `bin`, `templates` and `stilwerk` are byte-identical between the two refs.

The growth-bound measurement the fourth stop clause names:

```
git diff v13.0.0 c8d5a6f1 -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/helpers/growth-bound.ts hooks/lib/__tests__/fixtures
(prints nothing; --quiet exits 0)
```

**Verdict: met with the named deviation** (one file, one line, the citation-count pin; no growth bound moved).

### 4. `git diff --stat v13.0.0 C -- codec` lists `codec/fixtures/prior/REQUESTS.md` alone: MET

```
git diff --stat v13.0.0 c8d5a6f1 -- codec
 codec/fixtures/prior/REQUESTS.md | 1263 ++++++++++++++++++++++++++++++++++++++
 1 file changed, 1263 insertions(+)
```

**Verdict: met.**

### 5. Both bundle builds print one digest: MET

The clone was clean, so `build.sh` did not refuse and `FUSION_BUILD_ALLOW_DIRTY` was never set. Both builds ran `adapters/prior/build.sh build <out>` from the clone root, exit 0 each, and printed the same lines apart from the output path:

```
stage.sh: prior clone at 10ad78becad0bb5323b1afeba4842fc21605f570
stage.sh: go version go1.26.0 darwin/arm64
module_id fusion
version 13.1.0
bundle_digest sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94
tarball fusion-13.1.0.tar
tarball_sha256 8cbad73442e0e0c5cc499ad2dcab3b4030f948d9920e1795f08f8b94908064bb
files 29
```

| | bundle-a | bundle-b |
|---|---|---|
| `bundle_digest` (handover.json) | `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94` | same |
| tarball sha256 (`shasum -a 256`) | `8cbad73442e0e0c5cc499ad2dcab3b4030f948d9920e1795f08f8b94908064bb` | same |
| `fusion_revision` | `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c` | same |
| `prior_revision` | `10ad78becad0bb5323b1afeba4842fc21605f570` | same |
| `payload/build-identity.json` | `cmp` identical | |
| `diff -rq bundle-a bundle-b` | exit 0, no difference | |

`adapters/prior/build.sh verify <scratch>/bundle-a`: exit 0, `verify: payload identity {"module_id":"fusion","version":"13.1.0","bundle_digest":"sha256:56ac4c57…"}`, the same for the tarball, `verify: ok, 29 files, executable bin/fusion-module, 23 data files`. The three target binaries carry sha256 `a6fe0808…` (darwin-arm64), `4d6c89a2…` (linux-amd64), `07ff4ec6…` (linux-arm64), identical in both builds by the `diff -rq`.

**Verdict: met.**

### 6. Every suite green: MET WITH THE NAMED DEVIATION

| Suite | Command (in the clone) | Result |
|---|---|---|
| codec | `cd codec && npm ci && npm test` | exit 0. 22 files passed, 1797 tests passed, 13 skipped (1810), 288.90 s |
| catalog | `cd catalog && npm ci && npm test` | exit 0. 2 files passed, 35 tests passed, 510 ms |
| hooks | `cd hooks && npm install && npm test` (see the deviation below) | exit 1. 66 files passed, 1 failed, 1 skipped (68); 1155 tests passed, 1 failed, 14 skipped (1170); 129.58 s |
| adapter, bundle unset | `env -u FUSION_BUNDLE_DIR adapters/prior/stage.sh test` | exit 0; `prior clone at 10ad78becad0bb5323b1afeba4842fc21605f570`, `go1.26.0 darwin/arm64`; 6 packages `ok`, 2 with no test files |
| adapter, bundle set | `FUSION_BUNDLE_DIR=<scratch>/bundle-a adapters/prior/stage.sh test` | exit 0; same clone and Go lines; 6 packages `ok`; conformance 2.508 s instead of 0.011 s |

The conformance count, from `go test -v -count=1 ./integrationbuild/fusionmodule/conformance/` under `stage.sh run` with the bundle set: 17 top-level cases, 17 `--- PASS`, 33 passes counting the 16 subtests of `TestKillAtEveryPersistedBoundaryThenResumeRunsNoModel`, 0 skipped, 0 failed. The same run with the variable unset: 17 cases, 17 `--- SKIP`, each with `FUSION_BUNDLE_DIR unset: build the bundle with adapters/prior/build.sh build <dir> and pass that directory`. The 17 match the expected count.

**The one hooks red is the pre-existing one**, `lib/__tests__/workbench-citation-lint.test.ts > workbench citation lint: every citation in a live record resolves > passes on the whole corpus — no dangling citation in any live record`, over two issues of package `260928-1338-json-control-data-and-markdown-artefacts`. Its two failure lines:

```
  work-packages/260928-1338-json-control-data-and-markdown-artefacts/issues/261010-1045-a-narrative-that-is-a-directory-or-unreadable-makes-the-codec-throw-and-exit-1-for-every-workbench-wide-read.md:18  '260928-1200-open-package'
  work-packages/260928-1338-json-control-data-and-markdown-artefacts/issues/261010-1045-containment-is-lexical-so-a-symlinked-store-sends-codec-writes-outside-the-workbench-and-list-never-sees-them.md:9  '261010-1200-q'
```

Both tokens are reported `no artefact and no work-package directory carries this name`. Neither file belongs to this package. The skipped file is `lib/__tests__/agent-dispatch-observation.test.ts` (14 tests, all skipped), skipped at `v13.0.0` and at C alike; no `UPDATE_*` variable was set (`env | grep '^UPDATE_'` printed nothing). Every other hooks test passed, `reference-resolution-lint.test.ts` (41 tests) and `rules-emission-golden.test.ts` (22 tests) among them.

**The procedural deviation:** `cd hooks && npm ci` exits 1 in the clone, `npm error The npm ci command can only install with an existing package-lock.json`. `hooks/package-lock.json` is matched by the root `.gitignore` line 7 (`package-lock.json`), is not tracked at `v13.0.0` or at C (`git ls-tree` empty at both), and `git log --diff-filter=ADR -- hooks/package-lock.json` is empty, so it was never committed. `codec/.gitignore` lines 2 and 3 say the opposite ("This package commits its lock, as `hooks/` does (whose lock was force-added)"). The suite was therefore run after `npm install`, which resolved typescript 5.9.3, vitest 2.1.9, tsx 4.23.15 and @types/node 25.9.9; the work tree's untracked lock pins typescript 5.9.3 and vitest 2.1.9, the two the tests run on, so the clone ran the same test runner and compiler. Filed as `261012-2126-hooks-package-lock-json-is-ignored-and-untracked-so-npm-ci-cannot-run-in-a-clone-and-codec-gitignore-says-otherwise.md`.

**Verdict: met with the named deviation** (one pre-existing red outside this package; `npm install` in place of `npm ci` for hooks).

## Implications

The measurements separate three statements that the plan's acceptance folds into one. **Behaviour:** nothing an agent, skill, hook or helper reads changed between `v13.0.0` and C; `agents`, `skills`, `rules`, `bin`, `templates`, `stilwerk` and `hooks/dist` are byte-identical, and the installed C tree is byte-identical to `git archive` of C. **Bytes shipped:** five files differ, two of them a test source and a fixture document that the copy loop carries along with their directories. **Build:** the bundle is reproducible at C to the byte, and Prior's own inspector accepts it.

The acceptance's "nothing else" clause assumed the shipped tree carries no tests and no fixtures. It does, since `install.sh` copies `hooks/` and `codec/` whole, and the plan permits changes in both. The clause is unsatisfiable as written whenever the codec clause or the stop clause is exercised, which this candidate does twice. That is a wording defect in the plan, or a copy-list defect in `install.sh`, and which one is a ruling for the orchestrator and the user, not a measurement.

## Recommendations

1. The orchestrator puts finding 1 to the user with the two readings: accept the five-file diff for C on the evidence that the two extra files are inert and permitted elsewhere in the same step (then the plan's acceptance is amended to name the copy loop's consequence), or amend `install.sh` to exclude `hooks/lib/__tests__` and `codec/fixtures` (then the candidate moves past C and this step re-runs). We recommend the first for this release: the second changes the Claude distribution's file list, which is the thing step 20 exists to prove unchanged.
2. Step 21 names the digest `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94`, tarball sha256 `8cbad73442e0e0c5cc499ad2dcab3b4030f948d9920e1795f08f8b94908064bb`, `fusion_revision` C and `prior_revision` `10ad78becad0bb5323b1afeba4842fc21605f570`, built with go1.26.0. The two bundle directories are in the scratchpad and will not survive the session; the hand-over rebuilds with `build.sh deliver`, which this report predicts to reproduce the digest above at C.
3. The hooks lock issue goes to the code-implementer outside this plan's scope: a one-line negation in a `hooks/.gitignore` plus `git add`, or a corrected comment in `codec/.gitignore`, whichever the user wants. It does not block step 21.
4. The citation-lint red stays with package `260928-1338-json-control-data-and-markdown-artefacts`; nothing in this package can close it.

## Filed Issues

- `261012-2126-the-installed-tree-diff-at-c-lists-five-files-where-step-20-names-three-because-install-sh-copies-hooks-and-codec-whole.md` (in this package's issue store): the step-20 acceptance and the `install.sh` copy list disagree.
- `261012-2126-hooks-package-lock-json-is-ignored-and-untracked-so-npm-ci-cannot-run-in-a-clone-and-codec-gitignore-says-otherwise.md` (in this package's issue store): `npm ci` in `hooks/` is impossible from a clone.

## Verdict

C, `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c`, is the candidate the plan can hand over at step 21, subject to one ruling. Of the six acceptance items, three are met outright (no `catalog/` or `adapters/` in either installed tree; the codec diff is `REQUESTS.md` alone; both bundle builds print the one digest `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94` and their outputs are byte-identical). Two are met with the deviation the dispatch named in advance (the one-line citation-count pin in `hooks/lib/__tests__/reference-resolution-lint.test.ts`, the growth bounds untouched; the one pre-existing citation-lint red over two issues of another package, every other test green across hooks, codec, catalog and the adapter in both modes, 17 conformance cases passed). One is not met as written: the installed-tree diff lists five files, the three named with exactly the named hunks, plus the lint test source and `codec/fixtures/prior/REQUESTS.md`, which `install.sh` ships because it copies `hooks/` and `codec/` whole. Both extra files are inert for the Claude distribution and both changes are permitted by other clauses of the same step; the acceptance text cannot be satisfied by any candidate that exercises those clauses. A procedural deviation stands beside these: the hooks suite ran after `npm install` because its lock file is not in git.

## Sources

- `/Users/kai/Projects/productive/F04-FUSION/fusion/install.sh` lines 26 to 31, 47 to 58, 84 to 94 (the committed copy at C; `git show v13.0.0:install.sh` differs at line 29 only)
- `/Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/build.sh` lines 63 to 79 (the dirty-tree refusal), 86 to 122 (build), 135 to 208 (verify)
- `/Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/stage.sh` lines 65 to 76, 91 to 103
- `/Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/PRIOR_PIN`
- `/Users/kai/Projects/productive/F04-FUSION/fusion/.gitignore` line 7; `codec/.gitignore` lines 1 to 5
- `/Users/kai/Projects/productive/F04-FUSION/fusion/hooks/package.json`, `codec/package.json`, `catalog/package.json` (`scripts`)
- `/Users/kai/Projects/productive/F04-FUSION/fusion/fusion-workbench/work-packages/261008-1215-fusion-as-an-external-prior-module-bundle/plans/261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md` lines 194 to 213
- Logs kept in `<scratch>`: `hooks-npm-ci.log`, `hooks-npm-install.log`, `hooks-npm-test.log`, `codec-npm-ci.log`, `codec-npm-test.log`, `catalog-npm-ci.log`, `catalog-npm-test.log`, `build-a.log`, `build-b.log`, `verify-a.log`, `stage-test-unset.log`, `stage-test-bundle.log`, `stage-conformance-v.log`, `stage-conformance-v-unset.log`, `install-13.0.0.log`, `install-C.log`; the two installed trees under `home-13.0.0/.fusion` and `home-C/.fusion`; the two bundles under `bundle-a` and `bundle-b`. The scratchpad is session-scoped and is not evidence that outlives this report.

## Open Questions

- [ ] Which reading of finding 1 the user takes: accept the five-file diff and amend the acceptance text, or exclude tests and fixtures from the `install.sh` copy loop and move the candidate.
- [ ] Whether `hooks/package-lock.json` is to be committed (as `codec/.gitignore` claims it was) or the comment corrected.
