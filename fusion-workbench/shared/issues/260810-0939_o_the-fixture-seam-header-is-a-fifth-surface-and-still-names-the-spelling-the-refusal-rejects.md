The fixture-seam header is a fifth surface and still names the spelling the refusal rejects
---
`4bf509e` enumerated four surfaces that claimed a dry run writes nothing and updated all
four. A fifth surface documents the rebuild fixture seam by analogy to `seed --plan
--fixture`, and that analogy is what the commit made false: `seed`'s fixture seam is a
dry run, while the rebuild's only surviving spelling is a live push. The header still
presents them as the same shape.
---
**Evidence**

`bin/fusion-plane:143-146`:

```
# `push --rebuild-map --fixture <captured issues JSON>` (or
# FUSION_PLANE_ISSUES_FIXTURE) runs the rebuild extraction against a captured
# `GET issues/` response instead of the wire — same seam shape as
# `seed --plan --fixture`.
```

`seed --plan --fixture` needs no key, makes no call and exits 0 (`bin/fusion-plane:2081-2082`).
`push --plan --rebuild-map --fixture` is now `EXIT_USAGE` (`:1546-1552`), so the working
spelling is `push --rebuild-map --fixture`, which performs the rebuild at `:1577-1580`
and then falls into the live branch at `:1583` — `config_valid`, key check, `fetch_states`,
`reconcile_circle`. The suite's own new test records this: it asserts only
`.not.toBe(EXIT_USAGE)` because the run defers
(`hooks/lib/__tests__/fusion-plane.test.ts:630-639`). The two seams no longer have the
same shape; one is offline and one is not.

Two smaller statements in the same class:

- `bin/fusion-plane:142` and `:2101` — "FUSION_PLANE_DRYRUN=1 forces --plan for any push
  / seed." With `--rebuild-map` present it now forces a usage error instead. The two env
  seams `FUSION_PLANE_DRYRUN` and `FUSION_PLANE_ISSUES_FIXTURE` are documented on
  adjacent lines of `usage()` (`:2101` and `:2104`) and are now mutually exclusive in the
  one spelling that reads the fixture, with neither line saying so.
- `bin/fusion-plane:2063` — the `push` synopsis line still omits `--fixture` entirely
  (pre-existing, noted here because the same block is being corrected).

**Fix direction.** Rewrite `:143-146` to say what the seam now is: a rebuild fixture is
read only on a live-shaped push, and the run continues into the reconcile (exit 10 when
no key is present). Drop the `seed --plan --fixture` analogy or qualify it. Add the
`--rebuild-map` exception to the `FUSION_PLANE_DRYRUN` line in both places.

**Scope:** `bin/fusion-plane` header and `usage()`. Documentation only; no behaviour
change is implied.

Found in code review of `18b6094..a7c2b03`, commit `4bf509e`.
