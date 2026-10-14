The bundle build identity hashes git-ignored files the dirty check cannot see
---
`build-identity.json` inventories every regular file under `adapters/prior/fusionmodule/` and `adapters/prior/launcher/` of the working tree, and the bundle digest covers it. `build.sh` refuses a dirty tree through `git status --porcelain --untracked-files=all`, which never lists an ignored file. A `.DS_Store` (Finder) or `*.swp` (editor) under either directory, both ignored by the root `.gitignore`, enters the identity and changes the digest while the build reports a clean revision. Two builds of one commit in two checkouts then print different digests, and a rebuild from a clean clone does not reproduce a delivered digest, which is the property Prior's acceptance rests on (plan step 24, "the rebuilt digest equals step 22's").
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/fusionmodule/cmd/fusion-bundle/main.go:269`: `inventory(o.adapter, []string{"fusionmodule", "launcher"})`; `main.go:464-497` walks the directories and hashes every regular file except `build-identity.json`.
- `adapters/prior/build.sh:66`: `git status --porcelain --untracked-files=all -- . ':(exclude)fusion-workbench'`, which omits ignored paths.
- `.gitignore:133` (`.DS_Store`) and `.gitignore:139` (`*.swp`); `git check-ignore -v adapters/prior/fusionmodule/.DS_Store` names line 133.
- `adapters/prior/stage.sh:79` copies the same directories with `cp -R`, ignored files included (harmless to `go build`, but the same source of drift).

Step 24's rebuild matched, so no stray file stood at the release; the defect is latent.

Fix direction: build the inventory from `git ls-files -z -- adapters/prior/fusionmodule adapters/prior/launcher` at the fusion revision (or refuse when `git status --porcelain --ignored` lists anything under those directories), and stage the same file list.

Acceptance: with `touch adapters/prior/fusionmodule/.DS_Store`, `build.sh build` either refuses naming the file or prints the same bundle digest as without it.
