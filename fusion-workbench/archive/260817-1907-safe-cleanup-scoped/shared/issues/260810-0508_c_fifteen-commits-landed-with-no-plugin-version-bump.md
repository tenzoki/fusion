# Fifteen commits landed with no `plugin.json` version bump

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `.claude-plugin/plugin.json`
**Cross-references:** `CLAUDE.md` `## Layout` (the `plugin.json` row) and `## Release process`

---

## The observation

`CLAUDE.md` states the rule on the `plugin.json` row of the layout table: **"Bump version on every
change."**

`git log --oneline 8960e1a..HEAD -- .claude-plugin/plugin.json` returns nothing across fifteen
commits. `plugin.json` reads `7.0.0`, and `git rev-list -n1 v7.0.0` resolves to `8960e1a` — the range's
own base. So the whole of tonight's work carries the version of the release it followed.

## Why it is worth recording rather than shrugging at

Two documented mechanisms key on the version, and both are misled by this state:

- `install.sh`'s `FUSION_REF=tags/v<version>` pin resolves against the tag, so a user pinning `v7.0.0`
  gets `8960e1a`, not this work. That is correct behaviour for a pin, and it means the fifteen commits
  are unreleased — which is fine, provided the next release does bump.
- `/plugin install` reads the version to decide whether anything changed. An unbumped version is how a
  marketplace install silently keeps serving the old copy, which `CLAUDE.md`'s troubleshooting table
  already lists as a known symptom.

There is also a live consequence tonight, filed separately: `260810-0352_*_…` records
that Setup Step 5 calls a helper the installed copy does not have. The gap between work tree and
installed copy is exactly what a version bump plus a release closes, and this record is the other half
of that one.

## Fix direction

Decide whether tonight's range is a release. If it is, run the documented release process — bump
`plugin.json`, bump `marketplace.json`, refresh the two `FUSION_REF=tags/v<version>` pin examples,
tag, and pull the marketplace cache clone. If it is not, no action is needed beyond noting that no
session should expect these changes to be live, which is what `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` says from the other side.

**Do not bump before `npm test` is green** — see
`260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md`.
Step 0 of the release process is "Validate first."

---
Resolved: ed87d87 — the range became a release. plugin.json, the marketplace clone's marketplace.json, the install.sh header example and the README pin example all move 7.0.0 to 7.1.0 — minor rather than patch, because map --rebuild is a new command. The release gate ran first as the process requires: claude plugin validate passed (one pre-existing warning about CLAUDE.md at the plugin root), and the smoke test resolved fusion:orchestrator and answered.

The guard-adjacent caution in the release process is satisfied: this range changes hooks/clear-halt.ts, and both e39b3fe and 49e5b1d verify it by spawning the compiled script in throwaway projects rather than against this repository, where the stand-down would make the test unrepresentative.

This also closes the other half of 260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md, whose workaround was exactly this release.
