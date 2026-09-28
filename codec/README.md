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

**FJ00 ships nothing.** There is no `build` script, no `dist/`, no installer
line and no `bin/` entry. What the codec looks like when it is shipped, and
whether the shipped form carries a schema library or a bounded validator of its
own, are FJ01's questions.

## Layout

| Path | Holds |
|---|---|
| `schemas/*.schema.json` | JSON Schema (draft 2020-12), one file per contract, each keyed by its `$id` |
| `contract/` | The transition, dependency and Prior-mapping tables as data |
| `fixtures/manifest.json` | The language-neutral fixture index: every fixture outside `fixtures/prior/`, with the schema it is checked against and the outcome expected. Prior's Go side reads this same file and asserts the same outcomes; its shape is `fixtures/manifest.schema.json` |
| `fixtures/valid/`, `fixtures/invalid/`, `fixtures/bytes/` | The fixtures the manifest indexes |
| `fixtures/prior/` | Round-trip fixtures for the Prior DTO mapping; not indexed by the manifest |
| `src/strict-json.ts` | The strict reader: bytes in, one JSON object or a typed refusal out (spec §4 limits) |
| `src/validate.ts` | Loads every schema under `schemas/` into one Ajv instance and validates a value against a schema `$id` |
| `src/__tests__/` | One suite per module, plus `fixtures.test.ts` over the manifest |

## Working in it

```
cd codec && npm install && npm test          # the package's own gate, beside hooks/'s
cd codec && npm run typecheck                # tsc --noEmit over src/
```

`npm test` in `codec/` is this package's gate and stands beside `npm test` in
`hooks/`; neither runs the other. The lock file is committed, as `hooks/`'s is.

Prose in this repository is British English (`CLAUDE.md`).
