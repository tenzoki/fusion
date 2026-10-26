Request 76 has no record of four payload choices step 19 made beyond the plan
---
Step 19 (`ec3d9597`) made four choices the plan does not state: links are left out, `build-identity.json` gets a new field, the install tree is read from the git index, and the module's binaries share the `bin/` that Prior mounts into the helper container. All four are sound, but none of them is in a record that step 25 reads. Step 25 lists what request 76 carries, and none of the four is on that list. So the H8 row would claim "the tree an install holds", while the bundle differs from an install by one link. Severity: Medium. This is a hand-over to package F, not a defect in package E's code.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** data-implementer (request 76, plan step 25)
**Cross-references:** 261026-1006-reviewer-closing-review-of-prior-handover-e-bundle-payload.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md (step 25, `## Approach` departure table); 261023-1854-which-plugin-tree-does-the-bundle-payload-carry-for-the-helper-runtime.md

## Defect

At `4e53b552`:

1. **A link is not carried.** `adapters/prior/fusionmodule/cmd/fusion-bundle/main.go:459` (`case "120000"`) leaves out every git link and names it on stderr and in `build-identity.json` `install_tree_omitted`. There is one at this commit: `codec/fixtures/legacy-v12/workbench/shared/analyses/latest-benchmark.md` → `260906-1100-benchmark-run.md`. `install.sh:85-87` copies with `cp -R`, which keeps the link, so an install holds it. The reason is Prior's: `internal/module/bundle.go` `InspectBundle` refuses `os.ModeSymlink` with `ErrBundle` (read at Prior `08c57fb`). The only readers are codec tests (`codec/src/__tests__/fixtures.test.ts`, `install.test.ts`, `round-trip-cli-migration.test.ts`). No hook, helper, skill or agent reads it.
2. **A new build-identity field.** `main.go:167` adds `install_tree_omitted` to `build-identity.json`. Prior decodes that file in its own tests (`internal/fusionhost/repair_catalog_test.go`, a lenient struct, so the field does no harm). The field is still new on a file that crosses the boundary.
3. **Bytes come from the git index, not the work tree.** See `main.go:410-417`. On a clean build the index equals `HEAD`, and `build.sh:80-91` refuses a tree that is not clean. Under `FUSION_BUILD_ALLOW_DIRTY=1` the install tree is the index and the catalog renders are the work tree. That build is marked `+dirty` and is never delivered.
4. **`bin/` is shared.** The payload's `bin/` holds the helpers, the module's launcher `bin/fusion-module`, and `bin/<os>-<arch>/fusion-module`. `moduleReserved` and `checkCollisions` (`main.go:516`, `:527`) keep them from colliding. Prior's `helperRequired` mounts `bin` whole into the contained executor (`internal/supervisor/exec.go:76` at `08c57fb`), so the module's launcher and three native binaries show up under `/opt/fusion/bin` in every helper container.

Of the four, only the link has a written home: `adapters/prior/README.md` `## Building the bundle` and the `README-agents.md` bullet. Step 25's checklist for request 76 does not name any of them.

## Acceptance

- Request 76's H8 row says the payload is the install tree minus git links. It names the one link at the delivered commit and the field that records it, `install_tree_omitted`. It cites Prior's `InspectBundle` symlink refusal as the reason.
- Request 76 names the shared `bin/` as part of the mount list Prior is asked to widen. That covers the module's own launcher and binaries inside `/opt/fusion/bin`. Prior accepts it or asks for a split.
- Request 76's `**The bundle**` item says the install tree is read from the git index at the build commit, so the bytes equal `HEAD` on a clean build.
- `git diff --numstat -- codec/fixtures/prior/REQUESTS.md` shows additions only, as step 25 requires.
