# Analysis: the proof from the tag v13.1.0

**Date:** 2026-10-13 20:24
**Type:** Document Study (verification report, plan step 24)
**Status:** Complete
**Requested by:** orchestrator, under `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md` step 24
**Cross-references:** `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md`, `261012-2126-candidate-c-verification.md`

## Question

Does the released tag `v13.1.0` reproduce what the plan handed to Prior and what it proved at C? Two things are measured. First, does a bundle rebuilt from the tag's tree carry the digest Prior answered with at step 22? Second, does an HTTPS install from `tags/v13.1.0` give a tree that `diff -r` cannot tell from step 20's install of C?

## Scope

Measured, not inferred. Every command ran on 2026-10-13 between 20:24 and 20:40 local time.

**The fusion tree** at `/Users/kai/Projects/productive/F04-FUSION/fusion`:

- HEAD `ffd1330c4faa16a90213cad38ae266dcad909301`, committed 2026-10-13 20:22:46 +0200, branch `main`.
- `git status -sb` reads `## main...origin/main [voraus 1]`. Two files are modified, both under `fusion-workbench/`: the event log and this package's plan control file.
- `git rev-parse v13.1.0` = `042da0a9a2679b7aac4ea28cd5aba3804e29ab27` (`git cat-file -t`: `tag`). `git rev-parse 'v13.1.0^{commit}'` = `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c` (C).
- `git ls-remote origin` (origin is `git@github.com:tenzoki/fusion.git`):
  - `refs/tags/v13.1.0` = `042da0a9…`
  - `refs/tags/v13.1.0^{}` = `c8d5a6f1…`
  - `refs/heads/main` = `081608467567b85ce18431cbc44e5c9a1e718961`

  `heads/main` is no longer C, so every step below works from the tag.
- `adapters/prior/PRIOR_PIN` = `10ad78becad0bb5323b1afeba4842fc21605f570`, both in the work tree and in `git show v13.1.0:adapters/prior/PRIOR_PIN`.
- No command in this report wrote into this tree, apart from the report itself.

**Scratch:** `<scratch>` = `/private/tmp/claude-501/-Users-kai-Projects-productive-F04-FUSION-fusion/3bd9f8b5-e804-461f-868f-a0c46a94a8f9/scratchpad/step24`. Step 20's scratch, `<s20>` = `…/scratchpad/step20`, is from the same session and still exists. It is read here and not written.

**TMPDIR:** the system default, `/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/`, which equals `getconf DARWIN_USER_TEMP_DIR`. It was not overridden.

**Not touched:** the Prior repository `/Users/kai/Projects/productive/F09-Prior`, which `stage.sh` only clones from. Also not touched: `~/.local/share/prior/`, which was read with `ls` and `cmp` only. Nothing was delivered, pushed or tagged.

## Findings

### 1. The tree the build ran on: the tag's archive, built from a clone at the tag

`git archive` of the tag:

```
git -C <fusion> archive --format=tar v13.1.0 | tar -x -C <scratch>/archive        -> exit 0
```

**`build.sh` cannot build from an archive.** Its `fusion_revision` calls `git -C "$fusion_root" rev-parse HEAD` (`adapters/prior/build.sh` at the tag, function `fusion_revision`). That revision is written into `handover.json` and `build-identity.json`, so it is part of what the digest covers. The attempt, after `cd catalog && npm ci` in the archive (exit 0):

```
<scratch>/archive/adapters/prior/build.sh build <scratch>/bundle-archive
  -> exit 128, "Schwerwiegend: Kein Git-Repository (oder irgendeines der Elternverzeichnisse): .git"
     (<scratch>/bundle-archive left empty)
```

Per the dispatch, I therefore used **a clone detached at the tag**. It was cloned from GitHub, not from the local tree, so that the source is what was pushed:

```
git clone --quiet git@github.com:tenzoki/fusion.git <scratch>/clone                -> exit 0
cd <scratch>/clone ; pwd                                                            -> <scratch>/clone
git checkout --quiet --detach v13.1.0                                               -> exit 0
git rev-parse HEAD        -> c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c
git describe --exact-match HEAD -> v13.1.0
git status --short        -> (empty)
```

**The clone's tree is the archive's tree:**

```
diff -r -x .git -x node_modules <scratch>/archive <scratch>/clone                  -> exit 0, no output
```

The build therefore ran on the tag's archive bytes. The only addition is the `.git` directory that `build.sh` reads HEAD from.

### 2. The bundle rebuilt from the tag: MET

```
cd <scratch>/clone/catalog && npm ci                                                -> exit 0
cd <scratch>/clone && adapters/prior/build.sh build <scratch>/bundle-tag           -> exit 0
```

The tail of the output (log `<scratch>/build-tag.log`):

```
stage.sh: prior clone at 10ad78becad0bb5323b1afeba4842fc21605f570
stage.sh: go version go1.26.0 darwin/arm64
module_id fusion
version 13.1.0
bundle_digest sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94
tarball_sha256 8cbad73442e0e0c5cc499ad2dcab3b4030f948d9920e1795f08f8b94908064bb
files 29
build.sh: bundle digest sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94
```

| | Expected (steps 20, 21, 22) | Rebuilt from the tag | Equal |
|---|---|---|---|
| `bundle_digest` | `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94` | `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94` | yes |
| tarball sha256 (`shasum -a 256`, and the `.sha256` sidecar) | `8cbad73442e0e0c5cc499ad2dcab3b4030f948d9920e1795f08f8b94908064bb` | `8cbad73442e0e0c5cc499ad2dcab3b4030f948d9920e1795f08f8b94908064bb` | yes |
| `fusion_revision` (handover.json) | `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c` | same | yes |
| `prior_revision` (handover.json) | `10ad78becad0bb5323b1afeba4842fc21605f570` | same | yes |

Three further checks on the rebuilt bundle:

- **Against step 20's build.** `diff -r <s20>/bundle-a <scratch>/bundle-tag` exits 0. The whole output directory is byte-identical: payload, tarball, sidecar and handover.
- **Against step 21's delivery** (read only). `cmp` of each of the three files in `~/.local/share/prior/incoming/fusion/13.1.0/56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94/` (`fusion-13.1.0.tar`, `fusion-13.1.0.tar.sha256`, `handover.json`) against the rebuilt copy: all three identical.
- **Prior's inspector.** `adapters/prior/build.sh verify <scratch>/bundle-tag` exits 0, with `verify: payload identity {…"bundle_digest":"sha256:56ac4c57…cd94"}`, the same for the tarball, and `verify: ok, 29 files, executable bin/fusion-module, 23 data files`.

`git status --short` in the clone is empty after the build and the verify.

**Verdict: met.** The rebuilt digest equals step 22's.

### 3. The tag install against step 20's C install: MET

**The installer.** I used the `install.sh` committed at the tag, `git show v13.1.0:install.sh > <scratch>/install.sh`, sha256 `4837fb639349acd5ad1923fa661ca62216189b766980254525da8272ae45dba1`. `cmp` against `<s20>/installers/install-C.sh` shows it is the same file.

**The install** used step 20's method unchanged. Only the ref differs:

```
env -i HOME=<scratch>/home PATH=/opt/homebrew/bin:/Users/kai/.local/bin:/opt/local/bin:/usr/bin:/bin FUSION_REF=tags/v13.1.0 bash <scratch>/install.sh
  -> exit 0
     "Downloading fusion (tags/v13.1.0) over HTTPS..."
     "Installing to <scratch>/home/.fusion ..."
     "fusion 13.1.0 installed."
```

**The reference is step 20's own tree**, `<s20>/home-C/.fusion`, so nothing had to be reproduced. It has not changed since step 20: `find <s20>/home-C/.fusion -newer <s20>/install-C.log` prints nothing, and the directory's mtime is 2026-10-12 21:22:13.

**The acceptance diff:**

```
diff -r <s20>/home-C/.fusion <scratch>/home/.fusion                                 -> exit 0, no output
```

Supporting counts:

- Both trees hold 1507 regular files and 1 symlink. The symlink is `codec/fixtures/legacy-v12/workbench/shared/analyses/latest-benchmark.md -> 260906-1100-benchmark-run.md` in both.
- The sorted `find .` listings of the two HOMEs are identical (`diff` exit 0).
- An independent check repeats step 20's method: `git archive c8d5a6f1` against the tag install, `diff -rq` with the "Only in archive" lines filtered out. It gives 0 lines.

**Outside `.fusion`:** `diff -r` over the two whole HOMEs differs only in the launcher `.local/bin/fusion`, lines 4 and 11. Those lines embed the absolute HOME path (`FUSION_DIR=…` and the uninstall `rm -rf` path), so they differ for any two scratch HOMEs. The acceptance names the installed tree, which is `.fusion`. The launcher is noted here so that the whole-HOME result is not read as a defect.

**Verdict: met.** `diff -r` prints nothing.

## Implications

The released tag is the candidate in both of its distributions. The Prior bundle built from the tag is byte-identical to the one Prior answered for at step 22: same digest, tarball and delivered files. The Claude distribution installed from the tag cannot be told apart from the C install whose file list step 20 measured against `v13.0.0`. Step 25 can name `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94` as the released bundle digest.

One method fact belongs in step 25's record. "Rebuilt from the tag's archive" is only possible together with git metadata, because `build.sh` reads `HEAD` and puts it into the digest. A bare `git archive` or GitHub tarball of the tag exits 128 before it renders anything. The proof here is: an archive-equal clone at the tag (`diff -r -x .git` empty), then `build.sh`.

## Recommendations

1. Proceed to step 25 (code-implementer, on the user's approval of the marketplace push). Carry this report's result into `## Module bundle (released as v13.1.0)`.
2. No issue is filed. An archive-only build is out of `build.sh`'s design (its header says the revision comes from git), and the plan does not ask for one.

## Filed Issues

None.

## Sources

- `adapters/prior/build.sh` at `v13.1.0`: the header, `fusion_revision`, `build`
- `install.sh` at `v13.1.0` (sha256 `4837fb63…`)
- `261012-2126-candidate-c-verification.md` (step 20: the method, the C install, the expected digest)
- `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md`, step 24 and `## Where this work stops`
- Logs in `<scratch>`: `archive-catalog-npm-ci.log`, `build-archive.log`, `clone-catalog-npm-ci.log`, `build-tag.log`, `verify-tag.log`, `install-tag.log`, `list-C.txt`, `list-tag.txt`. Trees: `archive/`, `archive-C/`, `clone/`, `bundle-tag/`, `home/`. The scratchpad is session-scoped and is not evidence that outlives this report.

## Open Questions

None.
