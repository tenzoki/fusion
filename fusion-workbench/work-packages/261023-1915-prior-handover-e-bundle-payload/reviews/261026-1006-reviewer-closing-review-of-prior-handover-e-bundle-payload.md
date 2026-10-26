# Closing review of package E: bundle payload with the install tree and lifecycle_hooks (plan steps 19 to 21), and package C's fix commit

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `ec6c968e..4e53b552`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md`, `261025-2352-a-reviewer-entry-run-over-uncommitted-files-has-no-reviewed-range-to-write.md`, `261025-2352-orchestrator-neutral-parts-still-frame-the-loop-as-a-commit-per-task-after-81f000c7.md`, `261025-2352-skill-profile-tools-ceilings-follow-no-stated-rule-and-three-write-the-workbench-past-them.md`, `261025-2352-the-release-help-paragraph-now-lives-in-two-parts-and-the-editing-route-names-one.md`, `261025-2352-thirty-eight-prior-part-citations-name-request-76-questions-by-a-number-only-the-span-map-assigns.md`
**Review domain:** code
**Range note:** `git log --oneline ec6c968e..4e53b552` lists six commits: `11574f95`, `db315ce3`, `b0c068c8`, `9bb1751e`, `ec3d9597`, `4e53b552`. All six were opened. The event log stayed unopened because the dispatch excludes it. The C review and five still-open C issues were added by `11574f95`, a workbench-only commit. Of those, the review was read through its totals, and each issue's title and summary line were read; their bodies were not. The four C issues that `db315ce3` closes were read against the fix, two of them in full and two through their summary and acceptance.
**Verdict:** accept

## Summary

Steps 19, 20 and 21 meet their acceptance, and every check the plan names was re-run here and passed:
- The assembler copies exactly the install tree, with the right modes.
- The `lifecycle_hooks` declaration is the shape Prior's `DecodeManifest`/`VerifyFile` read at `08c57fb`.
- The hook-layout test cannot pass on an empty or one-sided run.
- `db315ce3` fixes the four package C issues it closes.

Two findings remain, and neither asks for a change to what steps 19 to 21 delivered:
- Four choices the executor made beyond the plan have no record that step 25, the request-76 step, reads.
- The payload README describes an order the test does not run.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |

Two issues filed. The observations below are not defects and have no record.

## Verification as run

- **`cd catalog && npm test`**: 4 files, 261 tests, exit 0. It includes the new `prior-held-unsupported.test.ts`, which has 2 tests.
- **`build.sh build`, twice**, into `<scratchpad>/b1` and `<scratchpad>/b2` on a tree that was clean outside `fusion-workbench/`. Both printed `bundle_digest sha256:08733e8daa5303999b493f8eb0f5a8164988de56231ef2a9a0e1082c07497c48`, `files 1581`, `install_tree_files 1549`, `install_tree_omitted 1`, `lifecycle_hooks hooks/hooks.json sha256:d7f4d7ab…`. `diff -r` of the two payloads is empty. `build.sh verify b1`: `ok, 1581 files, executable bin/fusion-module, 26 data files`, with payload and tarball identities equal.
- **Install-tree count, independently**: `git ls-files -s` over `install.sh`'s 14 loop entries lists 1550 entries. That is 1549 regular files plus one `120000` entry, and `LICENSE` contributes none because it is neither tracked nor present.
- **`FUSION_BUNDLE_DIR=b1 stage.sh test`**: all eight packages `ok`, exit 0. Then `go test -v -run TestHookLayoutBundleEqualsPluginTree` on its own: `PASS` in 10.2 s, not skipped. Measured shapes: env export and `subagent-stop` `empty`; `session-id` `text`; banner and `session-start` `json` with `hookEventName`,`systemMessage`; identity and `guard` `json` (`{}`); `tracker` `json` and `json` with `additionalContext`,`hookEventName`. Raw before normalisation, only these differed: `claude-env`, `.checkout-id`, `dispatch-map.json`, `.guard-state/events.jsonl`, `orchestrator-events.jsonl`. No stdout differed.
- **Step 19's `fusion-paths` acceptance**, own check. A scratch git repository got a fixed identity, `.fusion-setup` and a `workbench.json`. Then `bin/fusion-paths orchestrator` ran under `env -i`, once from the payload and once from the plugin tree. The two outputs were byte-identical, exit 0.
- **`hooks` suite** (`cd hooks && npm test`, in place, HEAD plus only the event-log change): 1216 passed, 14 skipped, exit 0.
- **`## Where this work stops`**: `git diff --stat ec6c968e..4e53b552 -- agents skills rules hooks bin templates stilwerk docs codec .claude-plugin install.sh CLAUDE.md README.md README-hooks.md` is empty. `shasum -a 256 codec/dist/fusion-record.js` gives `b4047458…2e2d`. The one shipped file changed is `README-agents.md`, the planned bullet under `### The Prior module bundle`.

## Step by step against the plan

### Step 19: install tree and `lifecycle_hooks`, met

- **Copy against `install.sh`.** `installEntries` (`adapters/prior/fusionmodule/cmd/fusion-bundle/main.go:79`) is the loop at `install.sh:85-86`, in order. `TestInstallEntriesAreTheInstallLoop` (`main_test.go:40`) parses the loop out of the real `install.sh`, including the backslash continuation (`main_test.go:50`), so the loop stays the one authority. The install copies the GitHub tarball of the same commit, and no `.gitattributes` `export-ignore` applies (`.gitattributes` names only the event log). So the git index at a clean build commit holds the same files as the tarball, except the one link.
- **Modes.** The plan's rule is applied, and stricter: `100755` becomes 0500, `100644` 0400, `120000` is omitted, and any other mode, a submodule for instance, refuses the build (`main.go:418-466`). `TestInstallTreeReadsTheIndex` covers untracked files, a non-loop directory and a link.
- **Declaration against Prior.** `Manifest.LifecycleHooks` is `{path, sha256, protocol_subset}`, with `sha256` as 64 lowercase hex digits and no prefix (`moduleapi/v1/manifest.go` `LifecycleHooks`, `Validate` at `08c57fb`). `lifecycleHooks` writes `hexSum(body)` and calls `Validate` (`main.go:540`). `checkAgainstManifest` passes the index digest in `sha256:<hex>` form to `VerifyFile` (`main.go:778`), which is the form `InspectBundle` passes (`internal/module/bundle.go` at `08c57fb`). `hookSubset` (`main.go:96`) equals Prior's `HookEvents`, `HookReplyForms` and `HookReplyFields` value for value. `TestLifecycleHooksDeclaration` round-trips the declaration through Prior's own `DecodeManifest` and shows that a wrong digest is refused. The carried `hooks.json` also passes `LoadLifecycleHooks`'s structural rules when read against it at `08c57fb`: four declared events, `command` hooks only, and matchers only on PreToolUse and PostToolUse.
- **Collisions.** `moduleReserved` and `checkCollisions` (`main.go:516`, `:527`) refuse a path that is equal to a module path, contains one, or lies below one. Reserved are the data files, `module.json`, `build-identity.json`, the launcher and the three target binaries. That is wider than the plan's "a data path or `bin/fusion-module`", and correct. `TestCollisionsAreRefused` tests both sides.
- **Node floor.** Prior's `helperEngines` reads `hooks/package.json` and `codec/package.json` (`internal/supervisor/exec.go:80` at `08c57fb`). Both are carried, with `engines.node` `>=20.12.0`, and `TestFusionInstallTree` asserts both files are present.
- **Executor choices beyond the plan.** All four are sound on the evidence; Finding 1 is about where they are recorded:
  - The omitted link and the new `install_tree_omitted` field. Prior's `InspectBundle` refuses `os.ModeSymlink`, so the link cannot be carried. Its only readers are codec tests.
  - Bytes from the git index. They equal `HEAD` whenever `build.sh` would deliver.
  - The reserved paths.
  - `LICENSE`. The loop names it, but it is neither tracked nor present, so neither the install nor the bundle has it. Parity holds.

### Step 20: hook payload fixtures, met

All 27 payloads were opened. `jq -e` passes on every one. Each of the eight `hooks.json` commands has a directory, and `parseHookCommands` refuses any registration other than `hookDirs` (`conformance/hooks_test.go:187-222`). The fields are those the README cites from Prior's analysis `### 1. Per command` at `08c57fb`. The README states the payloads are fusion's own and that the original run log is in neither repository. The ten SessionStart payloads are five copies of the same two files, which matches the README's `## Command to directory` note. Repository-relative paths are a stated, reasoned departure from Claude Code's absolute ones, and the conformance test resolves them against the run's working directory, as the hooks do.

### Step 21: hook-layout conformance, met, and not vacuous

Ways the test could pass vacuously, each checked:

- **Empty or skipped run.** `openBundle` skips when `FUSION_BUNDLE_DIR` is unset (`host_test.go:88`), as every conformance case does. With it set, `-v` shows `PASS`, not `SKIP`. `assertSessionLeftItsTrace` (`hooks_test.go:621`) requires the eight event kinds and the four env exports in the plugin-tree run's files, plus a minted checkout. Bundle equality then carries the same requirement to the bundle run.
- **Both runs on one tree.** The runs differ in `CLAUDE_PLUGIN_ROOT`, and each output is normalised only by its own root (`hooks_test.go:536-553`). A bundle hook that fell back to the plugin tree would leave the plugin path in its output un-normalised, and the comparison would fail. The tree digest of the payload must not move (`:158-165`). The bundled `hooks.json` must equal the declared sha256 and the plugin tree's bytes (`:143-153`).
- **Failures hidden.** A non-zero exit fails even when both runs agree (`:584`). A fail-open line `] Error:` fails (`:593`). Normalising takes out only the run path, the plugin root, the run's own checkout id and timestamps.
- **Declaration copied, not measured.** `measureReplies` (`:697-760`) checks in both directions: every reply lies inside the subset, under Prior's own constraints (text on SessionStart only, `additionalContext` on PostToolUse only, `hookEventName` naming its event), and every declared event, form and field is observed. Prior's `parseReply` (`internal/supervisor/lifecycle_hooks.go` at `08c57fb`) reads replies the same way: empty, `{`-prefixed JSON with only `hookSpecificOutput`, or text. Every `hooks/*.ts` reply site uses the `hookSpecificOutput` envelope (`identity-notice.ts:102`, `session-start.ts:297`, `tracker.ts:195`), so the branches no payload reaches cannot produce a top-level field Prior would refuse.

## Findings by theme

### Hand-over to request 76

**1. Four payload choices from step 19 have no record that step 25 reads. Medium.** Issue `261026-1006-request-76-has-no-record-of-four-payload-choices-step-19-made-beyond-the-plan.md`.

The four choices:
- links are left out (`main.go:459`), so the H8 claim "the tree an install holds" is short by one link;
- the new `install_tree_omitted` field (`main.go:167`);
- bytes from the index (`main.go:410-417`);
- the shared `bin/`, which Prior's `helperRequired` mounts whole (`internal/supervisor/exec.go:76` at `08c57fb`), so the module's launcher and native binaries appear in every helper container.

Only the first has a written home, `adapters/prior/README.md` `## Building the bundle`. Step 25 lists what request 76 carries, and the list names none of them. So the request's H8 row would overstate parity unless its executor re-derives this.

Scope: package F, step 25. The fix is three sentences in request 76. No code changes.

### Documentation against test

**2. The payload README gives an order the test does not run. Low.** Issue `261026-1006-the-hook-payload-readme-gives-an-order-that-never-reaches-the-staging-drift-the-conformance-test-requires.md`.

`adapters/prior/testdata/hook-payloads/README.md:34` prescribes filename order with pairs interleaved. `hooks_test.go:28` and `:224` say they follow that README. Then `:266-276` moves the Bash pair after `tracker/06` and a commit, because the README's own order never reaches `staging_drift`. The adapter README describes the test's real order, so two documents describe two orders.

Scope: test fixtures only.

### Package C's fix commit `db315ce3`

- **Dispatch input (High in C).** Fixed. The three skill bindings (`skill-reconcile`, `skill-curate`, `skill-discuss` `parts/01-prior.md`) now carry one identical sentence: `entry`, `description`, `input` as a JSON-object string `{"arguments": [{name, value}, …]}`. These are the three fields `DispatchDescriptor` requires at `08c57fb` (`general_tools.go:119`). The `arguments` items are the `entry-request.v1.json` item shape (`required: [name, value]`). Each call site names only arguments the child declares in `catalog.json`:
  - curate sends `**Mode:**` and `**Ledger:**`/`**Approved:**`, which `policy-curator` declares, and no `task`;
  - reconcile sends `**Domain:**`/`**Directive:**`/`**Since:**` plus `task`, all of which `state-auditor` declares;
  - discuss sends `conversation` alone, with `Round <n>.` moved into its value;
  - consultant sends `**Audience:**` plus `task`, which `analyst` declares.

  The text marks the shape as fusion's proposal, pending request 76. That is honest, because Prior's admission at the pin does not state the child input's shape. The span-map addendum records it as question 13.
- **wp and memo questions.** Fixed. wp's mode 3 is chat text. wp's binding drops the question-service line, and its `requires` is `["host.exec.v1"]`. memo asks the kind with the two options and then asks for topic and content as chat text, so no single-select call needs both an option and typed text.
- **Step 15 holding commit and cleanup.** Fixed by `catalog/src/__tests__/prior-held-unsupported.test.ts`. It looks up each entry by id and profile, fails if the entry is missing, and asserts `prior: unsupported`. Both entries are `unsupported` in `catalog.json` today. The test cannot pass because the entry is absent, and lifting the hold takes a stated edit to `HELD`.
- **`/tmp` persistence.** Fixed. Prior `08c57fb` `internal/platform/tool_container.go` (header) states that one container serves every command of a function run and that `/tmp` persists between commands. `internal/platform/container.go:83` mounts it `--tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m`. archive `01` and `41` now agree. No part still calls persistence within a run unknown (`grep` over `catalog/profiles`).

Record hygiene: the four closed C issues carry `closed`/`fixed` in their control files. None of their narratives carries the `Resolved:` line that `rules/fusion-workbench-conventions.md` `### Issue files` has the executor append. The commit message holds the resolution. Terminal records are not reconciled in place, so this review records the gap and files nothing.

## Cross-cutting observations

- **A hand-over without a record is the pattern both findings share.** Step 19's choices and step 20's order both live in a commit message or a second README, not in the place the next reader opens. Package C's closure handed five findings to F the same way, as open issues in C's container. Package F has to read the containers of C and E, not only the plan.
- **The conformance environment inherits `PATH`** (`hooks_test.go:424`). This session's `PATH` includes `/Users/kai/.fusion/bin`. No hook or helper calls a fusion helper by bare name today: hooks resolve through `CLAUDE_PLUGIN_ROOT` or `import.meta.url`, and the `bin/` grep finds only usage text. So nothing is masked. If a bare-name call is ever added, both runs would execute the installed copy and the comparison would stop telling bundle from tree. Nothing to fix now.
- **A `+dirty` build mixes two sources.** The install tree comes from the index and the catalog renders from the work tree. Such a build is labelled and never delivered (`build.sh:80-91`), so this is information for whoever reads a `+dirty` bundle.
- **Prior's current mount list would fail the shared-scope Setup.** I built a payload subset of Prior's `helperRequired` plus `helperDeferred` (`bin`, `rules`, `codec/dist`, `hooks`, `agents/orchestrator.md`, `.claude-plugin/plugin.json`). In it, `fusion-paths reviewer` exits with "unknown name 'reviewer'… agents/reviewer.md", while `fusion-paths orchestrator` resolves. This confirms D4's premise on the delivered bytes. It is evidence for the mount-list row of request 76.

## Recommended sequencing

- Nothing blocks closing package E. Steps 19 to 21 meet their acceptance, and no finding asks for a change to what they delivered.
- Finding 1 is part of package F's step 25. It must be in place before request 76 is appended.
- Finding 2 is cleanup that any later commit to `adapters/prior/` can take before step 24 builds the candidate bundle. It touches no shipped file and no codec byte.
