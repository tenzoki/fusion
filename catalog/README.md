# catalog: the role catalog and its two renders

One source, two renders. This package holds the role catalog, the role parts,
the workflow definitions and the result schemas from which fusion generates
both host outputs: the Claude Code prompts under `agents/` and `skills/` for
the converted roles and skills, and the Prior module bundle's profile assets. Why there is one source is
the ruling `261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md`;
how the source relates to the committed prompts is decision
`261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md`
(option 1), both in fusion's own workbench. Nothing here reaches a Claude
install: `install.sh` copies a fixed list of entries and `catalog/` is not on it.

## Layout

| Path | What it is |
|---|---|
| `catalog.json` | A `fusion.catalog/v2` document. `roles`: canonical id, Claude agent name, Prior ids, aliases with their domain, and one support state per host (`supported`, `planned`, `unsupported`). `entries`: one per function a user starts, an agent or a skill, each with `id`, `kind` (`agent`, `skill`), `profile`, `class` (`asks`, `dispatches`, `plain`), `arguments` (`{items: [{name, kind, required, values?, note?}], note?}`, kinds `flag`, `option`, `positional`, `parameter-line`, `first-message`), `requires` (from `host.question.v1`, `host.exec.v1`, `host.dispatch.v1`) and `support`. Copied byte for byte into the bundle. v2 is decision `261023-1854-does-the-catalog-gain-entries-under-fusion-catalog-v1-or-as-v2.md` (option 2). |
| `profiles/<id>/profile.json` | A role's or an entry's profile: its `parts` list (fusion's own, never shipped) and the seven keys Prior reads. |
| `profiles/<id>/parts/*.md` | The role text, in order, each file tagged `neutral`, `claude` or `prior` in `profile.json`. |
| `workflows/<id>.v<n>.json` | A workflow definition: the steps, their hand-overs and completion conditions, `revise_bound`, and the host services it `requires`. There are two: `explorer.v1.json`, one durable role, and `entry.v2.json`, the `fusion.entry.v2` workflow every supported entry runs under, proposed in request 77 and not yet accepted by Prior. It delivers on Prior's step-17 model: the run works in a copy of the user's checkout, and one `host.entry.integrate.v1` call fast-forwards the user's branch over the run's commits and applies its uncommitted changes to the checkout. |
| `schemas/*.schema.json` | The schemas of the three file kinds above; their `description` fields document each shape. |
| `schemas/*.v<n>.json` | The request, role-input, envelope and result schemas the bundle ships: the explorer's four, `entry-request.v1.json` and `entry-result.v2.json`. |
| `schemas/FROZEN` | The sha256 of every published schema and workflow definition, one line each, written at plan step 15 on Prior's answer 69 and extended by the v2 lines of 13.4.1. See `## The frozen assets`. |
| `schemas/WITHDRAWN` | The assets withdrawn from the published set, in `FROZEN`'s line form at the hash their `FROZEN` line carried, grouped under a comment line naming the commit that holds their bytes. See `## The frozen assets`. |
| `src/render.ts` | The renderer and its CLI. |
| `src/__tests__/render.test.ts` | The contract, as tests. |
| `src/__tests__/frozen.test.ts` | The freeze, as tests. |
| `src/__tests__/schema-cases.test.ts` | The schema-case tables, as tests: every row validates against the schema it names with the verdict it records, under ajv. |
| `testdata/catalog-decode-cases.v2.json` | Catalog documents with the verdict each must get, asserted by `render.test.ts` against `checkCatalogDocument` and by the module's `internal/steps/catalog_test.go` against `LoadCatalog`, so the two decoders agree. |
| `testdata/*-schema-cases.v<n>.json` | The schema-case tables (`fusion.schema-cases/v1`; `ls testdata/*-schema-cases.v*.json` lists them): documents, each naming the schema it validates against, with the verdict each must get, asserted by `schema-cases.test.ts` against ajv and by the module's `internal/steps/schema_cases_test.go` against the Go validator, so the two validators agree on the same rows. |

## The two commands

Both run from this directory after `npm ci`.

```
npm run render -- claude [<root>]
```

Writes the Claude output of every profile that has parts: the `neutral` and
`claude` parts concatenated in profile order, nothing between them, to the
file the catalog names for it under `<root>`. `<root>` defaults to `..`, the
fusion root, so the live tree. A role with a Claude name renders to
`agents/<claude_name>.md`; an entry renders to the file its `kind` gives,
`agents/<id>.md` for `agent` and `skills/<id>/SKILL.md` for `skill`, from the
profile it names. The target comes from the kind, never from the profile id's
`skill-` prefix. An agent entry on its role's profile is the role's file and
is written once; one file named from two profiles, or one profile naming two
files, is an error. The output must equal the committed file byte for byte,
and the test suite fails on any difference. A target without a profile keeps
its hand-edited file and is reported as skipped (`no profile`); one whose
parts are listed but not yet written is skipped too.

```
npm run render -- prior <dir>
```

Writes into an empty `<dir>`, for every profile a role or an entry names whose
`prior` state is not `unsupported` and whose parts exist, each profile once
(an agent entry names its role's profile, and that is one profile; its state
is `supported` when any role or entry naming it is):

- `profiles/<id>.md`: the `neutral` and `prior` parts concatenated. The one
  directive a `prior` part may carry, `{{include rules/<name>.md}}` on a line
  of its own, is replaced by the file's bytes under a provenance line,
  `Included from fusion: <path> (commit <HEAD>, sha256:<hex>)`, so the
  rendered text has no runtime include (Prior answer 67.2). A directive line
  in a `neutral` or `claude` part, an include outside `rules/`, or a target
  that does not exist is an error; a `{{` inside a sentence is not a
  directive (the reviewer prompt names `{{.X}}` as a template example).
- `profiles/<id>.json`: the profile with exactly the seven keys Prior's loader
  decodes, `parts` dropped, in Prior's struct order.

And `catalog.json`, byte for byte, after two checks. The first,
`checkCatalogDocument`, holds the version name, the key sets and every entry
value to its closed set. The role key sets are the constants `PRIOR_*_KEYS` in
`src/render.ts`, derived from the Go structs of Prior
`internal/fusionhost/external_catalog.go` at `5199cf1`, which decodes with
unknown fields rejected and an exact key count: one key more or less is a
refused bundle. The entry key sets (`PRIOR_ENTRY_KEYS`,
`PRIOR_ARGUMENTS_KEYS`, `PRIOR_ARGUMENT_KEYS`) are fusion's proposal to Prior
in request 76, held to the same exactness; the argument declaration carries
the optional keys of Prior's inventory schema. The second, `checkEntries`,
reads the fusion tree: an entry is of kind `agent` exactly when
`agents/<id>.md` exists and of kind `skill` exactly when
`skills/<id>/SKILL.md` exists; an entry `supported` on `prior` whose profile
has parts has at least one `prior` part, and the entry services those parts
name are exactly its `requires`.

Support states are carried through, not enforced here: that a `planned` role
and an alias never dispatch is Prior's check. A `planned` profile with no
parts gets nothing written and nothing listed, never a placeholder (Prior's
follow-up of 2026-10-11). A `supported` profile with no parts is reported as
missing and the command exits 1, because Prior refuses a bundle whose
supported role has no text. The bundle's `workflows/` and `schemas/` are
copied by the bundle assembler, `adapters/prior/fusionmodule/cmd/fusion-bundle/`
run by `adapters/prior/build.sh`, not by this command.

## The frozen assets

Every `schemas/*.v<n>.json` and `workflows/*.v<n>.json` is a published contract:
Prior decodes the bundle's copy, and the explorer's five were accepted byte
for byte at request 68. `schemas/FROZEN` names each with its sha256, and
`src/__tests__/frozen.test.ts` holds four things: the list parses and is
exactly the published set, every named file hashes to its line, a copy with
one byte appended is reported, and the explorer's assets are the bytes Prior
accepted. A change to a frozen file turns `npm test` red; the route is a new
schema version beside the old one, agreed with Prior, and a new `FROZEN`
line for it, never an edit under the same name. The `*.schema.json` files
and the profiles are fusion's own and are not frozen.

A contract that is withdrawn takes its assets out of the tree together with
their `FROZEN` lines (decision
`261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-contract-it-serves-is-withdrawn.md`,
option 1). `schemas/WITHDRAWN` lists each one in `FROZEN`'s line form, at the
hash its `FROZEN` line carried, under a comment line naming the commit that
still holds the bytes. `frozen.test.ts` holds that the list parses, that its
paths and `FROZEN`'s are disjoint, that no withdrawn path exists on disk, and
that each hash is the sha256 of the path at the commit its group names. A
withdrawn name is never published again; a successor is a new version. In
13.4.1 the repair workflow was withdrawn with its eight schemas (bytes at
`v13.1.0`), and so were `workflows/entry.v1.json` and
`schemas/entry-result.v1.json` (bytes at `ca9eb60d`), under decision
`261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`.

## Editing a converted prompt

`agents/code-implementer.md`, `agents/reviewer.md`, `agents/state-auditor.md`,
`agents/orchestrator.md`, `agents/consultant.md`, `agents/analyst.md`,
`agents/requirements-designer.md`, `agents/implementation-planner.md`,
`agents/data-implementer.md`, `agents/document-editor.md` and
`agents/policy-curator.md` are generated, and so is every
`skills/<name>/SKILL.md` whose entry's profile, `catalog/profiles/skill-<name>/`,
exists (decision
`261023-1854-how-does-a-skill-become-a-profile-when-its-body-carries-claude-mechanics.md`,
option 1): at present `skills/setup/SKILL.md`, `skills/check/SKILL.md`,
`skills/wp/SKILL.md`, `skills/wp-order/SKILL.md`,
`skills/reconcile/SKILL.md`, `skills/curate/SKILL.md`,
`skills/discuss/SKILL.md`, `skills/commit/SKILL.md`,
`skills/cleanup/SKILL.md`, `skills/archive/SKILL.md`,
`skills/memo/SKILL.md`, `skills/post/SKILL.md`, `skills/news/SKILL.md`,
`skills/cadence/SKILL.md`, `skills/migrate/SKILL.md` and
`skills/help/SKILL.md`. That is every file under `agents/` and `skills/`:
each is render output of `profiles/<id>/` (`profile.json` and
`parts/NN-{neutral,claude,prior}.md`), and a new skill directory without a
profile is reported by `npm run render -- claude` as `skipped … no profile`.
Do not edit a generated file by hand:
the byte-equality test fails, and the next render overwrites the edit. The
route is

1. edit the part under `catalog/profiles/<id>/parts/`: a `neutral` part when
   the change holds on both hosts, a `claude` part when it is Claude Code
   mechanics, a `prior` part when it is Prior's. A skill's frontmatter is
   Claude mechanics and sits in a `claude` part;
2. `cd catalog && npm run render -- claude`, which rewrites `agents/<id>.md`
   and `skills/<name>/SKILL.md`;
3. `cd catalog && npm test`, then the usual `cd hooks && npm test`, since the
   growth bounds and lints over `agents/` and `skills/` still read the
   generated file. The hooks suite cannot tell a hand edit from a render,
   which is why fusion's release step 0 runs `cd catalog && npm ci && npm test`.

Commit the parts and the render together: after the commit, a fresh
`npm run render -- claude` leaves `git -C .. diff --exit-code agents/ skills/`
at exit 0.

A skill's parts are held to the same lints as an agent's, unchanged: the
`neutral` lint below and the narrower Prior lint after it.

A `neutral` part may carry no host token: no `$FUSION_PLUGIN_ROOT`, no `bin/`
helper, no `$OUT_*` or `$SCAN_*` key, no `Agent(`, no `AskUserQuestion`, no
slash command. The regexes are `HOST_TOKENS` in the test file, from Finding 1
of `261010-1504-span-map-and-repair-correspondence.md`. What a neutral part may
still carry, and what the Prior overlay has to resolve, is Finding 3 there:
`CLAUDE.md` means the host-supplied `project_context`, and the cited rule file
is inlined through the include directive.

The token lint over a Prior render is narrower: it refuses only `Agent(`,
`AskUserQuestion` and a slash command. An entry run does its Setup and its
record writes through `host.exec.v1`, so its `prior` part spells the helper
path, `$FUSION_PLUGIN_ROOT` and the `OUT_*`/`SCAN_*` keys it reads back
(decision `261024-2111-may-an-entry-profiles-prior-part-spell-the-helper-calls-its-host-exec-runs.md`,
option 1).

## What the tests do not cover

`hooks/lib/__tests__/reference-resolution-lint.test.ts` does not scan
`catalog/`. A citation inside a part that points at a heading or a file that
no longer exists is caught by nothing here; the tests check tokens, includes,
schemas, id resolution and byte equality, and no more. The token lint over a
Prior render reads the overlay and not the inlined rule's bytes, which name
Claude surfaces by their names and are carried verbatim by contract; that
each `prior` part says what those names mean on Prior is read by a person.
