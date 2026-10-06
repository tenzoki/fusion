# Where is the FJ03d window's client installed, from which ref, and what may the 13.0.0 release change after it?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260929-1810_*_in-which-order-do-the-parts-of-fj03-and-fj04-land-while-fusions-own-workbench-is-still-in-the-v12-form.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

---

## Question

The answered order record puts FJ03d, the migration of this repository's workbench and "an install built from the branch" into one maintenance window, before FJ05 releases. Three facts make the install's location and identity a choice.

- `~/.fusion` is one install per machine. It is 12.2.1 at `9c74070b`, and the same machine holds the user's other projects' workbenches, all legacy. A 13.0.0 build there makes every agent in every one of them halt at Setup until it is migrated, which the specification reserves for after FJ05 (Prior `concept/fusion-json-workbench-spec.md` §10, "Erst FJ05 rechtfertigt...").
- `install.sh` downloads `https://github.com/tenzoki/fusion/archive/refs/$FUSION_REF.tar.gz`. A branch install needs the branch pushed; `origin/fj-json-workbench` exists. `fusion --update` from any launcher reinstalls `heads/main` into `~/.fusion` regardless of `FUSION_HOME`.
- `plugin.json` on the branch already reads 13.0.0 (FJ04 step 10a). Prior §8.1 forbids shipping a version number again with changed bytes. A branch install is not a shipment, but a version check reads 13.0.0 in both the window build and the later release.

## Options

1. **A separate install home from the pushed branch.** `FUSION_REF=heads/fj-json-workbench FUSION_HOME=~/.fusion-13 FUSION_BIN=<a launcher directory of its own>` runs `install.sh`. This repository is launched only through that launcher until the release; `~/.fusion` stays 12.2.1 for every other project. The installed commit hash is recorded with the migration receipt. The release may change bytes after the window, and FJ05 re-proves the activation on the tag in a fresh install.
   - Pros: no other project halts; the real installer runs; the evidence names the exact commit.
   - Cons: two launchers on one machine until the release. Starting this repository with the 12.2.1 launcher after activation writes Markdown control nothing detects (the post-activation limit of the FJ04 plan).
2. **Replace `~/.fusion` with the branch build.**
   - Pros: one launcher.
   - Cons: every legacy workbench on the machine halts until migrated, before FJ05 justifies migrating them.
3. **`claude --plugin-dir` on a clean export of the window commit, no installer.**
   - Pros: no push, no second install.
   - Cons: the installer is not exercised, so "installed client" is not shown; FJ05 has to show all of it.
4. **Release 13.0.0 first, then the window.**
   - Cons: `heads/main` reaches every HTTPS user before any real workbench was activated; contrary to the answered order record and Prior §10.

## Constraints

- fusion runs in Claude Code with no Prior installation, binary, service or variable.
- No real workbench other than this repository's is migrated before FJ05.
- Every writing installation of this repository's workbench is on the window build before activation (Prior §8.1).

## Recommendation

Option 1, with the release allowed to differ from the window commit, and FJ05 listing that difference and re-running the activation proof on the tag.

## Answer

Answered 2026-10-05 by the user (Kai Stalmann), in chat ("B1 als ~/.fp"): option 1, a separate install home from the pushed branch, with `FUSION_HOME=~/.fp` (not `~/.fusion-13`) and a launcher directory of its own. The user added, in chat: "~/.fusion auf keinen Fall ändern, damit wird produktiv an einen Consumer Projekt gearbeitet." So no step of FJ03d or FJ05 installs, updates, reinstalls or writes `~/.fusion`; the window launcher and any `fusion --update` run from it must be shown unable to reach `~/.fusion` before the install.

---
Implemented: `~/.fp/.claude-plugin/plugin.json` 13.0.0 (byte-identical to the pushed branch head's), launcher `~/.fp-bin/fusion` with `FUSION_DIR="/Users/kai/.fp"`, `~/.fusion/.claude-plugin/plugin.json` 12.2.1 unchanged; installed by FJ03d steps 13 and 15 with `FUSION_REF=heads/fj-json-workbench FUSION_HOME=~/.fp FUSION_BIN=~/.fp-bin bash install.sh` — option 1: a separate install home from the pushed branch with a launcher directory of its own, `~/.fusion` untouched.
