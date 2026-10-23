# Implement Prior's hand-over requirements H1 to H9 and send the hand-over request

## Directive

The user, 261023, asked "SIND H1-H9 umgesetzt?". On being told that none is, and offered the choice, the user answered option 1: file it as a work package, claim it, and plan it.

## What the work is

`Prior: docs/design/fusion-full-surface-handover-to-fusion.md` (Prior `7ac0845`, `sha256:9eca479aa14f5de81cadfd5a004d08dc9c9eca486f13a782640eb719a4748254`) hands fusion nine requirements, H1 to H9, so that Prior can host the full fusion surface (27 skills and agents):

- H1: catalog `entries` for the 27 functions, beside `roles`.
- H2 to H5: agent and skill profiles with `prior` parts.
- H6, H7: the `entry.v1` workflow, its schemas and module support for it.
- H8: the bundle payload with the helper runtime (`bin/`, `rules/`, `codec/dist/`, `templates/`, `stilwerk/`), built and delivered.
- H9: the lifecycle hooks and the plugin files they read, in the bundle payload.

The document also says what the request to Prior should carry, and asks fusion's workbench to rule on a question (B2, `orchestrator-events.jsonl`).

## State at filing

At fusion `8530c67c` (v13.3.3) none of H1 to H9 is implemented: `catalog/catalog.json` holds `schema` and `roles` only, and neither `entry.v1` nor `lifecycle_hooks` occurs in the tree. `codec/fixtures/prior/REQUESTS.md` ends at request 75, which says the hand-over request follows under a later number and names `b4047458…` as the codec its bundle carries. Prior answered 75(a) at `8b505a8` and 75(b) at `08c57fb`, re-pinning `b4047458…`, so the precondition the hand-over states is met.

Where things go in fusion is fusion's choice; the document's "Likely place" lines are suggestions. Its Acceptance and Verification lines are the former Prior plan's, carried word for word, and Prior checks the request against them row by row.

## Split

On 2026-10-23 the user approved the plan `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md` with its five-package split and the five decisions D1 to D5 answered as recommended. This package keeps steps 1, 2, 3, 4, 16 and 17: the catalog entries, the `entry.v1` workflow and the module support for it (H1, H6, H7). The rest moved to `261023-1915-prior-handover-b-agent-profiles` (steps 5 to 10), `261023-1915-prior-handover-c-skill-profiles` (11 to 14), `261023-1915-prior-handover-e-bundle-payload` (19 to 21) and `261023-1915-prior-handover-f-release-and-request-76` (15, 18, 22 to 25).
