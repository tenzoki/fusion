# catalog: the role catalog and its two renders

One source, two renders. This package holds the role catalog, the role parts,
the workflow definitions and the result schemas from which fusion generates
both host outputs: the Claude Code prompts under `agents/` for the converted
roles, and the Prior module bundle's profile assets. Why there is one source is
the ruling `261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md`;
how the source relates to the committed prompts is decision
`261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md`
(option 1), both in fusion's own workbench. Nothing here reaches a Claude
install: `install.sh` copies a fixed list of entries and `catalog/` is not on it.

## Layout

| Path | What it is |
|---|---|
| `catalog.json` | The roles: canonical id, Claude agent name, Prior ids, aliases with their domain, and one support state per host (`supported`, `planned`, `unsupported`). Copied byte for byte into the bundle. |
| `profiles/<id>/profile.json` | A role's profile: its `parts` list (fusion's own, never shipped) and the seven keys Prior reads. |
| `profiles/<id>/parts/*.md` | The role text, in order, each file tagged `neutral`, `claude` or `prior` in `profile.json`. |
| `workflows/<id>.v1.json` | A workflow definition: the steps, their hand-overs and completion conditions, `revise_bound`, and the host services it `requires`. |
| `schemas/*.schema.json` | The schemas of the three file kinds above; their `description` fields document each shape. |
| `schemas/*.v1.json` | The request, role-input, envelope and result schemas the bundle ships. |
| `src/render.ts` | The renderer and its CLI. |
| `src/__tests__/render.test.ts` | The contract, as tests. |

## The two commands

Both run from this directory after `npm ci`.

```
npm run render -- claude [<dir>]
```

Writes the Claude output of every role that has parts: the `neutral` and
`claude` parts concatenated in profile order, nothing between them, to
`<dir>/<claude_name>.md`. `<dir>` defaults to `../agents`, the live tree. The
output must equal the committed `agents/<id>.md` byte for byte, and the test
suite fails on any difference. A role without a profile keeps its hand-edited
prompt and is reported as skipped; a role whose parts are listed but not yet
written is skipped too.

```
npm run render -- prior <dir>
```

Writes into an empty `<dir>`, for every role whose `prior` state is not
`unsupported` and whose parts exist:

- `profiles/<id>.md`: the `neutral` and `prior` parts concatenated. The one
  directive a `prior` part may carry, `{{include rules/<name>.md}}` on a line
  of its own, is replaced by the file's bytes under a provenance line,
  `Included from fusion: <path> (commit <HEAD>, sha256:<hex>)`, so the
  rendered text has no runtime include (Prior answer 67.2). A directive in a
  `neutral` or `claude` part, an include outside `rules/`, or a target that
  does not exist is an error.
- `profiles/<id>.json`: the profile with exactly the seven keys Prior's loader
  decodes, `parts` dropped, in Prior's struct order.

And `catalog.json`, byte for byte, after a check that its key sets are exactly
the ones Prior decodes. The key sets are the constants `PRIOR_*_KEYS` in
`src/render.ts`, derived from the Go structs of Prior
`internal/fusionhost/external_catalog.go` at `5199cf1`, which decodes with
unknown fields rejected and an exact key count: one key more or less is a
refused bundle.

Support states are carried through, not enforced here: that a `planned` role
and an alias never dispatch is Prior's check. A `planned` role with no parts
gets nothing written and nothing listed, never a placeholder (Prior's
follow-up of 2026-10-11). A `supported` role with no parts is reported as
missing and the command exits 1, because Prior refuses a bundle whose
supported role has no text. The bundle's `workflows/` and `schemas/` are
copied by the bundle assembler (plan step 8), not by this command.

## Editing a converted prompt

`agents/code-implementer.md`, `agents/reviewer.md` and `agents/state-auditor.md`
are generated. Do not edit them by hand: the byte-equality test fails, and the
next render overwrites the edit. The route is

1. edit the part under `catalog/profiles/<id>/parts/`: a `neutral` part when
   the change holds on both hosts, a `claude` part when it is Claude Code
   mechanics, a `prior` part when it is Prior's;
2. `cd catalog && npm run render -- claude`, which rewrites `agents/<id>.md`;
3. `cd catalog && npm test`, then the usual `cd hooks && npm test`, since the
   growth bounds and lints over `agents/` still read the generated file.

A `neutral` part may carry no host token: no `$FUSION_PLUGIN_ROOT`, no `bin/`
helper, no `$OUT_*` or `$SCAN_*` key, no `Agent(`, no `AskUserQuestion`, no
slash command. The regexes are `HOST_TOKENS` in the test file, from Finding 1
of `261010-1504-span-map-and-repair-correspondence.md`. What a neutral part may
still carry, and what the Prior overlay has to resolve, is Finding 3 there:
`CLAUDE.md` means the host-supplied `project_context`, and the cited rule file
is inlined through the include directive.

## What the tests do not cover

`hooks/lib/__tests__/reference-resolution-lint.test.ts` does not scan
`catalog/`. A citation inside a part that points at a heading or a file that
no longer exists is caught by nothing here; the tests check tokens, includes,
schemas, id resolution and byte equality, and no more.
