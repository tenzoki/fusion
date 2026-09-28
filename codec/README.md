# codec

The JSON contract for fusion's workbench control data: the schemas, the
contract tables, the fixtures both hosts validate, and the TypeScript that
reads and checks them. It realises Prior's `concept/fusion-json-workbench-spec.md`
(held in the Prior repository), package by package, starting with FJ00.

## What this package is, and is not

`codec/` is a sibling of `hooks/` with its own `package.json`, `tsc` and
`vitest`. Its home was ruled at the FJ00 plan approval on 2026-09-28 in the
decision record
`260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md`:
a separate package, so that the growth bounds on the shipped text and on the
hook suite keep measuring what they were derived for. No agent prompt reads a
byte of this directory and no hook runs it.

**What ships is one file.** FJ01 (the codec-port decision, option 1: one Node
bundle for both hosts) added `dist/fusion-record.js`: `src/cli/main.ts` and
everything it imports, the seven schemas and the two contract tables inlined,
bundled by esbuild at an exact pinned version and committed. Both hosts run it
with plain `node`; neither needs `node_modules`. The Claude side reaches it
through `bin/fusion-record` and Prior spawns it (both later FJ01 steps). What
ships beside it, and what does not, is the installer's business (FJ01 step 7).

## The CLI

One JSON request on stdin (or `--file <path>`), one JSON response on stdout:

```
echo '{"op":"show","workbench":"/abs/fusion-workbench","record":{"path":"work-packages/<d>/package.json"}}' | node codec/dist/fusion-record.js
{"ok":true,"result":{"path":"…","kind":"package","control":{…},"revision":"sha256:…","narrative":{"path":"…","sha256":"sha256:…"}}}
```

Exit 0 for an answered request whatever its `ok`, 2 on usage, 3 when the
inlined schemas do not compile; nothing on stderr except on 2 and 3. A
`workbench` the request leaves out is taken from `FUSION_WORKBENCH`. The
request shapes are `schemas/protocol.schema.json` (`fusion.protocol/v1`), one
branch per operation of spec section 6's table; the errors are the spec's
eight typed classes. FJ01 implements `inspect`, `list`, `show`, `validate` and
`transition` (package records, compare-and-swap on the stored-bytes revision,
replayable by `operation_id`); the other nine answer
`operation-unknown/not-implemented-in-fj01`.

## Layout

| Path | Holds |
|---|---|
| `schemas/*.schema.json` | JSON Schema (draft 2020-12), one file per contract, each keyed by its `$id` |
| `contract/` | The transition, dependency and Prior-mapping tables as data |
| `fixtures/manifest.json` | The language-neutral fixture index: every fixture outside `fixtures/prior/`, with the schema it is checked against and the outcome expected. Prior's Go side reads this same file and asserts the same outcomes; its shape is `fixtures/manifest.schema.json` |
| `fixtures/valid/`, `fixtures/invalid/`, `fixtures/bytes/` | The fixtures the manifest indexes |
| `fixtures/prior/` | Round-trip fixtures for the Prior DTO mapping; not indexed by the manifest |
| `fixtures/workbench/` | A minimal v12-shaped scratch workbench (`workbench.json`, `.fusion-setup`, two package pairs, one shared issue pair) the store and CLI suites copy to a temp directory before every case; not indexed by the manifest |
| `dist/fusion-record.js` | The shipped bundle, committed; `scripts/build.mjs` writes it and `src/__tests__/committed-bundle.test.ts` proves it is the build of the committed source |
| `scripts/build.mjs` | esbuild, pinned exactly, `--bundle --platform=node --format=esm --target=node20`, JSON inlined, staging path then atomic rename into `dist/`; a second run writes nothing |
| `src/cli/protocol.ts` | The request union over the fourteen operations, the response envelope and the eight error classes; `src/cli/schemas.ts` inlines the contract for the bundle |
| `src/cli/ops.ts` | `dispatch(request)`: validates against the protocol schema, then the five operations over the store |
| `src/cli/main.ts` | The entry point: stdin or `--file` in, stdout out, the exit codes above |
| `src/store.ts` | `openWorkbench` (spec 4.1: json-control, legacy, unsupported), `readPair` (control, `sha256:` revision of the stored bytes, narrative hash), `writeControl` (local `.json-state/` lock, CAS on the revision, deterministic serialisation in the schemas' `properties` order, temp file, fsync, atomic rename) |
| `src/strict-json.ts` | The strict reader: bytes in, one JSON object or a typed refusal out (spec §4 limits) |
| `src/validate.ts` | Loads every schema under `schemas/` (or the inlined set) into one Ajv instance and validates a value against a schema `$id` |
| `src/transitions.ts` | `allowed(kind, from, to, payload)` and `dependencySatisfied(condition, target)` over `contract/transitions.json` and `contract/dependencies.json`; a typed refusal, never a state change |
| `src/references.ts` | Parses the three prose citation forms and the structured `record_ref`, `artefact_ref` and `foreign_ref` shapes into one union and renders them back; resolves nothing against a file system |
| `src/prior/` | The Prior DTO mapping, both directions, row by row from `contract/prior-mapping.json`: `candidates.ts`, `packages.ts`, `campaign.ts`; `gojson.ts` reproduces Go's `encoding/json` bytes so that `computePriorRevision` equals Prior's stored revision |
| `src/__tests__/` | One suite per module, plus `fixtures.test.ts` over the manifest |

## Working in it

```
cd codec && npm install && npm test          # builds dist/, then the package's own gate, beside hooks/'s
cd codec && npm run build                    # the bundle alone; idempotent
cd codec && npm run typecheck                # tsc --noEmit over src/
```

`npm test` in `codec/` is this package's gate and stands beside `npm test` in
`hooks/`; neither runs the other. It builds `dist/` first, because the CLI
cases spawn the bundle, and it schedules `committed-bundle.test.ts` last: that
suite compares the bundle committed at HEAD with a fresh build of the source
committed at HEAD, so it is red between a source change and the commit that
carries its rebuilt bundle, and its message says to run `npm run build` and
commit the result. The lock file is committed, as `hooks/`'s is, and `esbuild`
is pinned to an exact version in `package.json` because the bundle's bytes are
a function of it.

Prose in this repository is British English (`CLAUDE.md`).
