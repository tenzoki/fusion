# Does a shipped-file change after a release tag take a version bump, when any bump changes the Prior bundle digest?

---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`, `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md`

---

## Question

`60141589` changed a shipped file, `skills/help/SKILL.md` (`### 4. Update`), one commit after the `v13.1.0` tag at `c8d5a6f1`, and left `.claude-plugin/plugin.json` at `13.1.0`. Its message gives the reason: a change before the tag "would have changed the bundle digest Prior accepted". `CLAUDE.md` says "**Bump version on every change.**" Two consequences now stand. `main` and `v13.1.0` ship different `skills/help/SKILL.md` bytes under one version, and a marketplace install at 13.1.0 never receives the new paragraph, since the plugin cache keys on the version. And `adapters/prior/build.sh` at `main` builds a second bundle named `fusion` `13.1.0` with another digest, because `build-identity.json` carries the fusion revision (`README-agents.md` `### The Prior module bundle`: "a build at any other commit yields another digest"). Now that one revision feeds two deliverables, the bump rule needs a decision.

## Options

1. **Every shipped change bumps, and a bundle is rebuilt only when Prior is asked to run one.** A post-tag help edit becomes 13.1.1. The Prior bundle for 13.1.1 is not built or handed over unless something it carries changed.
   - Pros: keeps `CLAUDE.md`'s rule; marketplace installs receive the change; one version names one tree.
   - Cons: version numbers advance without a Prior hand-over, so "the module version is fusion's release version" (67.3) holds only for releases that ship a bundle.
2. **Documentation-only changes after a tag ride without a bump until the next release.** What `60141589` did.
   - Pros: no extra release act; the accepted digest stays the only 13.1.0 bundle Prior has seen.
   - Cons: breaks `CLAUDE.md`'s rule; `main` and the tag differ under one version; a bundle built from `main` reuses 13.1.0 with a foreign digest. Nothing refuses that build.
3. **Make the bundle identity independent of non-payload files**, by naming the commit of the payload's inputs (catalog, adapters, the inlined rules) instead of HEAD. A docs commit then leaves the digest alone, and option 1 costs nothing on the Prior side.
   - Pros: removes the coupling that produced the question.
   - Cons: a change to `build-identity.json`'s semantics, which Prior reads; needs a request to Prior.

## Constraints

The bytes Prior accepted at answer 70 (`f0b57b6`) stay what they are; no option may rebuild or re-tag `v13.1.0`.

## Recommendation

Option 1 now, with `build.sh` refusing to build from a commit that is not at a `v<plugin.json version>` tag unless `FUSION_BUILD_ALLOW_UNTAGGED=1` is given. That closes the second-13.1.0-bundle gap at once. Option 3 can follow in a later request to Prior if bundles without hand-overs become common.
