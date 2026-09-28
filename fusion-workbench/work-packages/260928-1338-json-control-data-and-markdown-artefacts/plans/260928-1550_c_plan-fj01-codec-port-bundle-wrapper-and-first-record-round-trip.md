# Implementation Plan: FJ01 — the codec port: one committed bundle, the `bin/fusion-record` wrapper, and the first record read and updated on both hosts

**Date:** 2026-09-28
**Status:** Complete — closed by the user on 2026-09-28 at `68754f58`; the hook suite's one red is the host's monitor case named at FJ00's closure, and the Prior side's answers to requests 7 to 10 are FJ02's inputs.
**Spec:** Prior's `concept/fusion-json-workbench-spec.md`, section 6 (the operations, the typed errors, the revision and the local write discipline) and section 9's row FJ01: "Derselbe Record wird aus Claude-Helfer und Prior-Testadapter gelesen/aktualisiert; keine Installation aus dem Source-Checkout nötig."
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260928-1550_*_which-process-boundary-and-shipped-form-does-the-codec-take.md, 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md (closed), 260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md, 260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md
**Survey commit:** fusion `6667d63b` on `fj-json-workbench`; Prior `12d8424`. Bounded surfaces unchanged since FJ00's survey: `agents/` 3 806 bytes of room, `skills/` 25 559 bytes, hook tests 6 lines. Nothing in this plan touches them.
**Decidability:** The load-bearing question is *is the record I am about to overwrite the one I read?* It is decidable: the revision is the SHA-256 of the stored bytes, the caller sends the revision it read, and the writer compares it against the bytes on disk under a local exclusive lock before the atomic rename. The question this plan does not try to answer is whether a concurrent writer in another checkout changed the record; that is settled after a git merge, as the spec says, and a conflict marker in the file is an invalid record the strict reader refuses. No heuristic, no timestamp.

## Directive

Turn FJ00's library into the one process both hosts run: a committed, self-contained bundle `codec/dist/fusion-record.js`, a `bin/fusion-record` wrapper on the Claude side, a stdin/stdout JSON protocol carrying the spec's operations and typed errors, and the smallest mutation the spec's write discipline allows (`transition` on a package record, compare-and-swap on the stored-bytes revision, temp file, fsync, atomic rename). Prove it from a tarball-shaped copy of the repository with only `node` present, on a scratch workbench fixture, and hand the Prior side what its test adapter needs to read and update the same record. The operation kernel with journal, replay and multi-file transactions is FJ02 and is not started here.

## Current State

- `codec/` at `6667d63b`: six schemas, three tables, 172 fixtures, `strictParse`, `validate`, `allowed`, `parseReference`, the Prior mapping; `tsc --noEmit` and vitest only, no build, no dist, no CLI. `ajv` and `ajv-formats` are devDependencies; the shipped tarball has no `node_modules`.
- **The shipping pattern exists in `hooks/`:** `hooks/dist/*.js` is committed, self-contained, excepted from the root `.gitignore`'s `dist/` rule by `!hooks/dist/`, synced atomically by `hooks/scripts/build.mjs`, and gated by `hooks/lib/__tests__/committed-dist.test.ts`, which recompiles the committed source in a temp dir and compares. Ten `bin/` helpers exec `node "$here/../hooks/dist/<name>.js"` and exit 3 when the file is missing (`bin/fusion-citation-check:119-134`).
- **Every shipped helper needs a `!bin/<name>` line** in the root `.gitignore` (`bin/*` is ignored; the comment there says so), and `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` may hold that list equal to the tree.
- **`install.sh` copies a fixed list of top-level items** (`.claude-plugin agents skills rules hooks bin stilwerk templates docs`, three READMEs, LICENSE) and drops `hooks/node_modules`; `codec` is not in the list.
- **Prior spawns a module executable** with stdin/stdout pipes, `Setpgid`, a filtered environment and a SHA-256 digest check on the executable path before start (`internal/module/process.go:60-110`); the framing on those pipes is `moduleapi.ConnectWithServices`. The Fusion module today is a Go executable (`modules/fusion/manifest.json` `"executable": "cmd/fusion"`). How Prior's test adapter reaches the bundle is the Prior side's, and is requested, not assumed.
- **Workbench location:** `bin/fusion-workbench-root` walks up from the working directory to `fusion-workbench/.fusion-setup`; the wrapper reuses it rather than a second walk.
- **No bundler in the repository.** esbuild is absent; `ajv` ships a standalone code generator (`codec/node_modules/ajv/dist/standalone`) that could replace the runtime library later if bundle size matters.

## Approach

One bundle, one protocol, two callers. `codec/src/cli/` holds the protocol types and the dispatcher; `codec/src/store.ts` holds the record-pair I/O and the write discipline; `codec/scripts/build.mjs` bundles `src/cli/main.ts` with esbuild into `codec/dist/fusion-record.js`, schemas and tables inlined, and the codec suite carries the gate that the committed bundle is the build of the committed source. `bin/fusion-record` is a thin wrapper in the shape of the ten existing node-backed helpers. Prior's adapter spawns the same file. Every operation takes JSON on stdin and returns JSON on stdout, exit 0 for an answered request whatever its `ok`, and non-zero only when no answer could be produced; errors are the spec's typed set.

```
stdin  {"op":"show","workbench":"<abs>","record":{"path":"work-packages/<d>/package.json"}}
stdout {"ok":true,"result":{"control":{...},"revision":"sha256:…","narrative":{"path":"…","sha256":"sha256:…"}}}
stdin  {"op":"transition","operation_id":"<uuid>","workbench":"<abs>","record":{"path":"…"},"expected_revision":"sha256:…","to":"claimed","actor":{…},"reason":"…","payload":{"claim":{…}}}
stdout {"ok":false,"error":{"class":"conflict","reason":"revision-mismatch","detail":"stored sha256:… expected sha256:…"}}
```

## Implementation Steps

1. [DONE] **The decision is answered**
   - Executor: `code-implementer` (no file; a gate)
   - Files: none
   - Changes: none. The record `260928-1550_*_which-process-boundary-and-shipped-form-does-the-codec-take.md` carries an `Answered:` line naming option 1 before any later step's commit; any other answer stops this plan and it is re-cut.
   - Dependencies: none.

2. [DONE] **Protocol types and error set**
   - Executor: `code-implementer`
   - Files: `codec/src/cli/protocol.ts`, `codec/src/__tests__/protocol.test.ts`, `codec/schemas/protocol.schema.json`
   - Changes: a request union over the operations the spec's section 6 table names (`inspect`, `list`, `show`, `validate`, `create`, `transition`, `claim`, `release`, `set-mode`, `set-dependencies`, `adopt-plan`, `attach-evidence`, `reconcile`, `migration`), each with its argument shape; FJ01 implements `inspect`, `list`, `show`, `validate` and `transition` and answers every other op with `{"ok":false,"error":{"class":"operation-unknown","reason":"not-implemented-in-fj01"}}`. The response envelope `{ok, result?, error?, revisions?}` with the error classes `schema-invalid`, `unsupported-format`, `conflict`, `unknown-scope`, `missing-evidence`, `unresolved-reference`, `operation-unknown`, `migration-incomplete`. The protocol schema is a seventh schema file under `$id` `urn:fusion:schema:fusion.protocol/v1`, so a request is validated by the same loader before it is dispatched, and an invalid request is a `schema-invalid` answer, never a crash.
   - Acceptance: every request shape has a valid and an invalid fixture under `codec/fixtures/valid/protocol/` and `invalid/protocol/`, listed in `fixtures/manifest.json`; the fixtures suite stays green.
   - Dependencies: 1.

3. [DONE] **Record-pair store and the write discipline**
   - Executor: `code-implementer`
   - Files: `codec/src/store.ts`, `codec/src/__tests__/store.test.ts`, `codec/fixtures/workbench/**`
   - Changes: `openWorkbench(root)` reads `workbench.json` when present and reports `unsupported-format` for an unknown schema or a required feature the codec lacks, and reports `legacy` when the manifest is absent (reads allowed, mutation refused with `unsupported-format`, per spec 4.1); `readPair(path)` returns the parsed control record, its revision (`sha256:` of the stored bytes), the narrative path and its hash; `writeControl(path, value, expectedRevision)` takes a local exclusive lock (`.json-state/<sha of path>.lock`, `O_EXCL`, released on exit, stale after 60 s by mtime as `bin/fusion-commit-lock` does), re-reads the stored bytes, refuses `conflict/revision-mismatch` when their hash differs from `expectedRevision`, writes the deterministic serialisation (two-space indent, LF, final newline, key order of the schema's `properties`) to a temp file in the same directory, fsyncs, renames atomically, and returns the new revision. No journal in FJ01: the one write is a single file and the spec's multi-file journal is FJ02's. `codec/fixtures/workbench/` is a minimal v12-shaped workbench with `workbench.json`, `.fusion-setup`, one package pair (`package.json` plus its Markdown) in `open`, one in `done`, and one `shared/issues/` record pair; the store tests copy it to a temp dir before every case.
   - Acceptance: read, write, CAS refusal, lock contention (a second writer waits, a stale lock is reaped), serialisation byte-stability (write, read, write again: identical bytes), a conflict-marker file refused by `strictParse`, an absent manifest refusing mutation.
   - Dependencies: 2.

4. [DONE] **The dispatcher and the five operations**
   - Executor: `code-implementer`
   - Files: `codec/src/cli/ops.ts`, `codec/src/cli/main.ts`, `codec/src/__tests__/ops.test.ts`
   - Changes: `dispatch(request) → response` over the store: `inspect` (workbench manifest state, schema ids, feature list), `list` (record pairs under a store or a container, with kind, status and revision), `show` (one pair: control, revision, narrative hash), `validate` (strict parse plus schema plus the cross-field rules `transitions.ts` owns, for one pair or the whole workbench), `transition` (package records only in FJ01: `allowed()` over the tables, then `writeControl` under the caller's expected revision, with `operation_id` echoed; a repeat of the same `operation_id` with the same payload against the same revision returns the stored answer from `.json-state/ops/<operation_id>.json`, a different payload under the same id is `conflict/operation-id-reused`). `main.ts` reads one JSON request from stdin (or `--file <path>`), writes one JSON response to stdout, exits 0 on an answered request, 2 on usage, 3 when the schemas cannot load. Nothing is written to stderr except on exit 2 and 3.
   - Acceptance: every op has a test over the scratch workbench, including the `operation_id` replay and the reuse conflict; `main.ts` is tested by spawning `node` on the compiled entry from step 5 with stdin piped.
   - Dependencies: 3.

5. [DONE] **The committed bundle and its gate**
   - Done 2026-09-28: esbuild 0.21.5 pinned exactly (the version vite already resolved); bundle 440 232 bytes; `npm test` in `codec/` builds first and runs the gate last; the gate compares against HEAD, so it is green from the commit that carries the bundle. Choices left open by the plan and taken: `validate` answers `ok: true` with findings rather than refusing; only landed transitions are stored under `.json-state/ops/`; a live target state drops the claim unless the payload supplies one, a terminal one keeps it; `record_selector.path` admits `package.json` and `*.record.json` only, so campaign and evidence files are outside `show`/`transition` in FJ01; the fixtures coverage test exempts `fixtures/workbench/` as it exempts `prior/`.
   - Executor: `code-implementer`
   - Files: `codec/scripts/build.mjs`, `codec/package.json` (esbuild devDependency, `build` script), `codec/dist/fusion-record.js`, `codec/src/__tests__/committed-bundle.test.ts`, root `.gitignore` (`!codec/dist/` beside `!hooks/dist/`)
   - Changes: esbuild, exact pinned version, `--bundle --platform=node --format=esm --target=node20`, schemas and tables imported as JSON so they are inlined, a `#!/usr/bin/env node` banner, sourcemap off, minify off (a diff a reviewer can read); output to a staging path and moved into `dist/` by rename, as `hooks/scripts/build.mjs` does and for the same reason. The gate mirrors `committed-dist.test.ts`: assert the esbuild version is the pinned one, `git archive HEAD codec/` into a temp dir, bundle there, compare byte-for-byte with the committed `codec/dist/fusion-record.js`, and fail with a message that names "run `npm run build` in `codec/` and commit the result" when they differ. `npm test` in `codec/` runs the gate last.
   - Acceptance: `npm run build` is idempotent (second run writes nothing); the gate is green at the commit that carries the bundle and red when a source line changes without a rebuild (asserted by the test on a temp copy).
   - Dependencies: 4.

6. [DONE] **The wrapper and its exception line**
   - Done 2026-09-28: `reference-resolution-lint.test.ts` pin re-approved on the same line, paths 1 735 to 1 742 (install.sh +2, README-hooks.md +2, the wrapper header +3); derivable-enumerations and path-literal lints green unchanged. The whole hook suite in the worktree: 1 007 of 1 009, the monitor case and `committed-dist.test.ts`'s "every helper in bin/ is tracked", which is red only until the commit that adds the wrapper.
   - Executor: `code-implementer`
   - Files: `bin/fusion-record`, root `.gitignore` (`!bin/fusion-record`), `README-hooks.md` `### The bin/ helper roster` (one row)
   - Changes: the wrapper in the shape of `bin/fusion-citation-check`: header with usage, exit codes (0 answered, 2 usage, 3 bundle missing), resolves `$here/../codec/dist/fusion-record.js`, `exec node "$entry" "$@"`; when no `workbench` is given in the request it passes the result of `bin/fusion-workbench-root` as `FUSION_WORKBENCH` in the environment, which `main.ts` reads as the default. The roster row names the helper, its one-line purpose and its exit codes.
   - Acceptance: `git ls-files bin/fusion-record` lists it; `bin/fusion-record < request.json` answers on the scratch workbench; `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` and `reference-resolution-lint.test.ts` are green or their pin is re-approved with an attributed line, per each file's header; any other hook-suite red is a stop.
   - Dependencies: 5.

7. [DONE] **The installer carries the codec**
   - Done 2026-09-28: the install test does not skip; it stubs `curl` to copy a local tarball built from `git archive HEAD` with the working tree's three changed files copied over, runs `install.sh` on a PATH holding node, bash, coreutils and a stub `claude`, and asserts the installed wrapper answers `show` with and without an explicit `workbench`. A by-hand run gave the same result.
   - Executor: `code-implementer`
   - Files: `install.sh` (the copy loop and the cruft drop), `codec/README.md`
   - Changes: `codec` joins the copy list; `rm -rf "$INSTALL_DIR/codec/node_modules"` beside the hooks line; a warning when `codec/dist/fusion-record.js` is missing, in the shape of the `guard.js` warning. `codec/README.md` states what ships (the bundle, schemas, contract, fixtures) and what does not (`src/`, tests are copied but unused; `node_modules` never).
   - Acceptance: from `git archive HEAD | tar -x` into a temp dir, `install.sh` with `FUSION_HOME=<temp>/home` and `FUSION_BIN=<temp>/bin` installs, and `<home>/bin/fusion-record` answers a `show` on the scratch workbench copied beside it, with `node` the only tool on `PATH` besides coreutils and bash. This is the "keine Installation aus dem Source-Checkout nötig" proof and is written as a test in `codec/src/__tests__/install.test.ts` that skips when `claude` is not on `PATH` (the installer dies without it) and says so.
   - Dependencies: 6.

8. [DONE] **The first record read and updated through the wrapper**
   - Done 2026-09-28: six exchanges recorded as raw stdin/stdout bytes under `codec/fixtures/protocol-session/`, temp root replaced by the literal `<workbench>` in requests and in the one response that echoes it (`validate`); golden regenerated only under `UPDATE_PROTOCOL_SESSION=1`. `fixtures.test.ts` exempts `protocol-session/` from manifest coverage as it exempts `prior/` and `workbench/`.
   - Executor: `code-implementer`
   - Files: `codec/src/__tests__/round-trip-cli.test.ts`
   - Changes: on a temp copy of the scratch workbench, through `bin/fusion-record` only: `show` the open package, `transition` it to `claimed` with the shown revision, `show` again and see the new status and revision, `transition` again with the old revision and receive `conflict/revision-mismatch`, repeat the first transition's `operation_id` and receive the stored answer, `validate` the workbench and receive `ok`. Record the six request and response pairs as fixtures under `codec/fixtures/protocol-session/` so the Prior side has the exact bytes to reproduce.
   - Acceptance: the test is green and the six pairs are committed.
   - Dependencies: 6.

9. [DONE] **Requests to the Prior side, FJ01 addendum**
   - Done 2026-09-28: `REQUESTS.md` items 7 to 10, stamped `d9dff6ad`. Two things the write surfaced: Prior's `process.go` digests `spec.Executable` only, so with `node` as the executable the bundle is unpinned by Prior's identity check (asked as 8b, three shapes offered); and `allowed()` matches a package edge by `from`/`to` and ignores the table's `operation` column, so `transition` walks the `claim` and `release` edges today, which the recorded pair 02 relies on: filed as `260928-1735_*_does-transition-keep-walking-the-claim-and-release-edges-once-they-are-operations-of-their-own.md`.
   - Executor: `analyst`
   - Files: `codec/fixtures/prior/REQUESTS.md` (a new section `## FJ01`)
   - Changes: what the Prior test adapter has to do to satisfy FJ01's second half: spawn `node codec/dist/fusion-record.js` from an installed fusion copy, take its digest over the bundle file, replay the six recorded request/response pairs against the same scratch workbench and assert the same bytes, then perform one `transition` of its own and hand the resulting revision back for the fusion side to `show`. Also: confirm that Prior's Fusion module may require `node` on `PATH` (the decision's option 1), and whether Prior's `moduleapi` framing or plain newline-delimited JSON is wanted on the pipes for FJ02 onward; FJ01 speaks one request, one response, then exit.
   - Acceptance: the section exists, names each item with the fixture path it closes, and states the fusion commit.
   - Dependencies: 8.

## Where this work stops

- The decision `260928-1550_*_which-process-boundary-and-shipped-form-does-the-codec-take.md` carries an `Answered:` line naming option 1 before step 2's commit.
- `codec/dist/fusion-record.js` is committed, and the codec suite's bundle gate proves it is the build of the committed source at the closing commit.
- `bin/fusion-record` is tracked, excepted in `.gitignore`, and has its roster row.
- From a `git archive` extract installed by `install.sh` into a scratch home, the wrapper answers `show` on the scratch workbench with `node` as the only runtime, or the install test's skip names `claude` as the missing precondition and the same proof was run by hand and its output pasted into the closing report.
- The six recorded request/response pairs under `codec/fixtures/protocol-session/` are committed and reproduced by the CLI round-trip test.
- `npm test` in `codec/` is green; the hook suite in a worktree stands where FJ00 left it (1 008 of 1 009, the monitor case) or better, with any lint pin re-approved by an attributed line.
- The three growth-bound figures stand at 3 806 bytes, 25 559 bytes and 6 lines.
- `codec/fixtures/prior/REQUESTS.md` carries the `## FJ01` section stamped with the closing commit.
- No journal, no multi-file transaction, no migration and no consumer of the helper outside the tests were written; those are FJ02 to FJ04.

## Data Structures

The protocol request and response shapes of step 2, the `.json-state/` lock and operation-answer files of steps 3 and 4 (class L, never tracked: `.gitignore` gains `fusion-workbench/.json-state/*` in this repository's own workbench section when the first consumer lands, which is FJ03; the scratch fixture carries none).

## API Changes

`bin/fusion-record` is new and shipped. `codec/src` gains `store.ts` and `cli/*`. No existing helper, hook, agent or skill changes.

## Testing Strategy

Store and ops units over a temp copy of the scratch workbench; the CLI round trip through the wrapper with recorded pairs; the bundle gate; the install proof from a tarball extract; the hook suite once in a worktree at the end for the two lints the `.gitignore` and README changes can trip.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| esbuild's output differs across versions and the gate goes red on a machine with another version | The gate asserts the pinned version first, as `committed-dist.test.ts` does, and names the toolchain as the cause |
| Prior cannot spawn `node` where its Fusion module runs | Step 9 asks; the protocol is fixed so that a single-executable build (decision option 2) is a packaging change |
| The install test cannot run because the installer requires `claude` on `PATH` | The test skips loudly and the closing report carries a by-hand run |
| A lint enumerates `bin/` or the `.gitignore` exception list and goes red | Step 6 re-approves inside the lint's own rules; never a widened baseline |

## Open Questions

- [x] Option 1 of the codec-port decision, ruled by the user on 2026-09-28.
- [ ] Does Prior want `moduleapi` framing on the pipes from FJ02 on, or newline-delimited JSON? Carried by `REQUESTS.md` item 9; open until the Prior side answers.
