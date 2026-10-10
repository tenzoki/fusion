# Analysis: FJ05 step 23, the closing report to Prior (draft)

**Date:** 2026-10-10 10:24
**Type:** Document Study (draft of a hand-over section)
**Status:** Complete
**Requested by:** orchestrator, work package 260928-1338-json-control-data-and-markdown-artefacts
**Cross-references:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md (step 23, step notes 18 to 22, the correction to the step-20 note); 261010-0853-fj05-post-release-proof-from-the-v13-0-0-tag.md; 261009-2322-fj05-hand-over-draft-request-65-at-468d8e87.md

## Note to the orchestrator

**Verified on 2026-10-10 at 10:24, in fusion at `a05706b0` (branch `fj-json-workbench`, 3 ahead of `origin/fj-json-workbench` = `5aff4d19`):**

- `git rev-parse 'v13.0.0^{commit}'` = `468d8e870962988b22416ac2a4c1975ca7db2fb4`. The tag object is `7a5fc8f8`, tagger date 2026-10-10 06:40 +0200. Its annotation carries `commits=99, verdict=covered`.
- `git ls-remote origin` gives `refs/heads/main` = `468d8e87`, `refs/tags/v13.0.0` = `7a5fc8f8`, `refs/tags/v13.0.0^{}` = `468d8e87` and `refs/heads/backup/261010-v12.2.3` = `48f0c9ff`. `48f0c9ff` is an ancestor of `468d8e87`, and `v12.2.3^{commit}` = `48f0c9ff`.
- `git show v13.0.0:codec/dist/fusion-record.js` is 699 011 bytes, `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`. `git diff --stat 052932e2 468d8e87 -- codec` prints nothing. The bundle's last commit is still `00e465f6`. `plugin.json` at the tag reads 13.0.0.
- In the marketplace cache clone, `HEAD` = `bd7d0c3` ("chore(fusion): 13.0.0"). Its `ls-remote origin refs/heads/main` = `bd7d0c3`, and the fusion entry reads `13.0.0`.
- `fusion-record` `list` over this item's issues store returns 37 records: 26 closed and 11 open. The 11 open ones are exactly the 11 that step 18's section tabled, so the ratings below are copied from that table.
- Prior is at `167c605` locally. Its `fusion-workbench/.fusion-setup` reads `plugin_version` 12.0.0, and there is no `workbench.json`, so it is not migrated.
- FH09 is a package of `Prior: docs/design/fusion-dual-host-implementation-plan.md`, "FH09 — Migration, inventories and rollback", owners "F + P". Its header redirect of 2026-09-28 and `Prior: concept/fusion-json-workbench-spec.md` section 2.2 narrow it to "Import bestehender Prior-JSON-Artefakte und … Kompatibilitätsprüfung bereits migrierter Fusion-Workbenches". No fusion record holds it as a package. The workbench names it only in `260927-2304-fusion-dual-host-design-review.md` and `261009-0650-prior-fusion-integration-status.md`, and the latter gives the owner as Prior.
- The confidentiality grep over this file found no match for either string.

**Uncertain, or for you to settle:**

1. **The plan has no step-21 note.** Commit `b9ea2115` added only the analysis. The draft cites the analysis for step 21 directly. If you add the note before appending, nothing in the draft changes.
2. **Clause 2c is still the user's ruling.** That clause is the bare `--update` from a `FUSION_HOME` launcher. The draft states it as a documented host limit and says the user rules on it. If the user has already ruled (accepted, or 13.0.1), replace that one sentence.
3. **`origin/fj-json-workbench` is behind.** It is at `5aff4d19`, the step-20 commit. The correction note, step 21 and step 22 (`5bf2d3b0`, `b9ea2115`, `a05706b0`) are local only. Step 23's push carries them along with this section. The draft says only that the section reaches the branch by that push.
4. **Prior `167c605`.** Step 19 recorded it as "not yet pushed by Prior". I did not check whether Prior has pushed it since. The draft cites the commit only.
5. **The 3 leftover marketplace registrations.** The step-22 note records 3 stale registrations that remain for directories that no longer exist. The draft says "removed from every existing project" and names the 3 leftovers.
6. **A slip in tool use.** I ran one whole-tree `git status -sb` in Prior's checkout, which reads only and is not in fusion. In fusion, no whole-tree command ran: `git status -sb` was path-limited to `REQUESTS.md`.
7. **The append position.** REQUESTS.md is 3 582 lines and ends with a newline after "none is open." Append one blank line, then the section. The append moves the file once more, so Prior's two pins will again differ in `REQUESTS.md` alone. The draft says so.

---

## FJ05 (released as v13.0.0)

**Written against:** fusion `a05706b0` on branch `fj-json-workbench` (2026-10-10), which records plan step 22. The commits after C on this branch change only `fusion-workbench/` and this file. Prior was read at `167c605`, the commit that answered 65.

This section closes fusion's plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` with step 23. It records the released identity and the proofs that ran after the tag, as Prior's answer to 65 asks. It also corrects one precondition of the release act, and lists what stays open and who owns it. No line above is edited. Where this section disagrees with a section above, this section governs.

### What was released

| Item | Value | Read with |
|---|---|---|
| Tag | `v13.0.0`, an annotated tag object `7a5fc8f8`, tagged 2026-10-10 06:40 +0200 | `git cat-file -p v13.0.0` |
| Tagged commit | C = `468d8e870962988b22416ac2a4c1975ca7db2fb4` | `git rev-parse 'v13.0.0^{commit}'`; `git ls-remote origin refs/tags/v13.0.0` gives `refs/tags/v13.0.0^{}` = `468d8e87` |
| `origin/main` | `468d8e87`, fast-forwarded from `48f0c9ff` (v12.2.3, the last pre-v13 `main`) | `git ls-remote origin refs/heads/main` |
| Backup of the old `main` | `refs/heads/backup/261010-v12.2.3` = `48f0c9ff`, pushed at the user's request before the fast-forward | `git ls-remote origin` |
| Version at C | 13.0.0 | `git show 468d8e87:.claude-plugin/plugin.json` |
| Tag annotation | "Review coverage cd1b5522..468d8e87: commits=99, verdict=covered", and FJ05 accepted: the shared evidence by Prior (65, `167c605`), the host-specific evidence by the user | the tag object |
| Bundle | `codec/dist/fusion-record.js`, 699 011 bytes, `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f` | `git show v13.0.0:codec/dist/fusion-record.js \| shasum -a 256` |

**The bundle is the one Prior qualified at `34a2710`** (request 64), unchanged since then. `git diff --stat 052932e2 468d8e87 -- codec` prints nothing, and the bundle's last commit is still `00e465f6`. So `main` and the tag are exactly the C that `## FJ05 (the release evidence at 468d8e87)` handed over and that Prior answered "Yes" for. No version-bump commit was made, no codec byte changed, and 13.0.0 was not shipped twice.

This append moves `REQUESTS.md` once more. As before, Prior's two pins differ from fusion's head in this file alone.

### The proofs after the tag (plan step 21)

The report is `261010-0853-fj05-post-release-proof-from-the-v13-0-0-tag.md`, in fusion's workbench, with its logs beside it. Every install, launcher and helper call ran under `env -i` with a scratch `HOME`. Nothing on `PATH` matched `/prior/i`, and no Prior was present.

| Proof | Result |
|---|---|
| The installer | fetched over HTTPS from the raw `v13.0.0` path; byte-identical to `git show v13.0.0:install.sh` |
| Fresh install, `FUSION_REF=tags/v13.0.0`, scratch home and bin | exit 0. The installed tree equals `git archive v13.0.0` on every path of the copy loop: `diff -r` gives 0 lines, 1 507 of 1 507 files, 265 of 265 directories and the same 30 executable files. Installed bundle `fb170361…`, 699 011 bytes |
| Assets | `/fusion:check`'s asset block, run verbatim from the installed file, prints `case1-equal` for all four profiles, and none is missing |
| Update path | The scratch launcher's `--where` names its own home. `--update` fetches `heads/main`, which is now `468d8e87`, and installs a tree equal to the tag's archive. The user's productive `~/.fusion` (12.2.1) and `~/.local/bin/fusion` hash the same before and after |
| Second project | A scratch git project, not fusion. `/fusion:setup`'s blocks, run verbatim, create a JSON workbench (`fusion.workbench/v1`). `/fusion:wp`'s filing block files two packages, and `bin/fusion-write claim` claims one. A headless analyst with `--plugin-dir` on the install resolves every `OUT_*` and `SCAN_*` into the claimed container. One `bin/fusion-write claim --take-over-from` of a package held by an absent checkout lands with its answered consent decision as source, and `validate` is valid |
| Real migrated workbench | The read-back of foreign workbench 1's real migrated state, on a copy, through the tag install: `validate` valid on 748 records with 0 findings. The kinds and states equal step 15's copy. One open and one terminal package were read back through `show`, `fusion-paths` and `fusion-work-order`, every reader exit 0. The source's digests were equal across four readings. Its location and name are not recorded |

**One documented limit of the update path.** A bare `--update` from a launcher installed with `FUSION_HOME` does not reinstall into that launcher's home. It writes `$HOME/.fusion` and `$HOME/.local/bin/fusion`. The released `docs/upgrading-to-v13.md` `## Two installations on one machine` already says so: "Never run `fusion --update` from the v13 launcher". It prescribes running the installer again with the same three variables, and in that form the update writes only its own home. The installed bytes equal the tag, so this is no defect in the release. Whether it stays a documented limit or becomes a 13.0.1 launcher fix is the user's ruling. It touches no shared contract.

### The release precondition, corrected

`### What the release act will do` above named a precondition from the user's ruling of 2026-10-09: the user's real migration of the consuming project measured in step 15, run with the candidate build, succeeds **before** the release act.

**That did not happen in that order.** Fusion's orchestrator read one of the user's answers as confirming the migration, and it did not. The release act ran at 06:40 on 2026-10-10, and after the release the real checkout showed no migration. The user accepted this after the fact ("geht ja jetzt nicht anders"). The plan's step-20 note carries the correction.

What stands in for the missing order:

- **Before the release.** Step 15 ran on a copy of the same checkout at the same commit, with the candidate build. It finished valid on 748 records, gave `no-op` on a second run, resumed after a kill and rolled back byte-identically (`## FJ05 (the release evidence at 468d8e87)` `### The re-migration at the candidate (step 15)`).
- **After the release.** The user migrated the real checkout with the released build and pushed it. Step 21 read that real migrated state back through the tag install, as the table above records. The record mix equals step 15's, kind for kind and state for state.

Nothing in this changes request 65 or Prior's answer to it. The precondition was the user's, not Prior's, and no released byte depends on it.

### The marketplace entry (plan step 22)

- `tenzoki/claude-plugins` `main` is `bd7d0c3` ("chore(fusion): 13.0.0"), and its fusion entry reads `version` 13.0.0. The entry's `description` already matched `plugin.json` at `v13.0.0` byte for byte.
- The local marketplace cache clone was pulled to `bd7d0c3`. No `/plugin install` ran.
- On the release machine, the stale `fusion@tenzoki-plugins` 3.21.0 registrations were removed at user scope and from each of the 10 existing project paths that had one. Three remain, for directories that no longer exist.

### What stays open, and who owns it

None of these gates 13.0.0. None asks Prior anything now.

| Item | Owner | State |
|---|---|---|
| Prior's host binding of the takeover | Prior | after the release, as `### The hand-over point: Prior's host binding of the takeover` above states. Prior's production takeover stays refused until its own authority qualification (Prior's answer to 64, restated in its answer to 65) |
| The module bundle: role catalog, explorer and repair workflows (fusion package `261008-1215-fusion-as-an-external-prior-module-bundle.md`) | fusion delivers; Prior runs and accepts | `open`, unclaimed, unplanned. It continues FH03, FH04, FH05 and FH08 of `Prior: docs/design/fusion-dual-host-implementation-plan.md` and is planned in a session of its own |
| FH09, "Migration, inventories and rollback" of `Prior: docs/design/fusion-dual-host-implementation-plan.md`. Since the JSON redirect (that plan's header, and `Prior: concept/fusion-json-workbench-spec.md` section 2.2), it is the import of existing Prior JSON artefacts and the compatibility check of already-migrated fusion workbenches | Prior (the plan names F + P; fusion's migration half shipped in 13.0.0) | open. It is not a package in fusion's workbench |
| The migration of Prior's own workbench | Prior, after the release | not run. At `167c605` Prior's `fusion-workbench/.fusion-setup` reads 12.0.0, and there is no `workbench.json` |
| A real migrated workbench read through Prior (`prior fusion`) | Prior, with the user | deferred by decision A2, option 1 (`261009-1021-must-fj05-show-priors-access-path-on-a-real-migrated-workbench.md`): "prior Anbindung machen wir später" |
| The open issues carried past 13.0.0, below | fusion | each `open` in fusion's workbench. None touches `codec/` |

**The open issues.** `bin/fusion-record` `list` of the issues store of fusion's FJ05 work package, status `open`, at `a05706b0`, gives 11 issues. They are the same 11 that `### Open issues, carried past 13.0.0` above tabled. No review rated any of them critical or high.

| Issue | Rating | What it is |
|---|---|---|
| `261009-1037-transition-evidence-is-accepted-on-a-drop-where-the-codec-checks-no-binding.md` | low (G-A, A2) | the client accepts `--evidence` on a `dropped` finish, where the codec binds nothing |
| `261009-1037-plan-steps-admits-a-level-two-step-heading-in-its-header-which-its-code-reads-as-the-end-of-the-steps-section.md` | low (G-A, D1) | `planSteps`' header admits a `##` step heading that its loop reads as the end of the section |
| `261009-1037-reconcile-hands-an-implemented-decision-to-an-orchestrator-its-own-route-does-not-have.md` | low (G-A, D2) | `/fusion:reconcile` hands the `implemented` transition to a route that does not send it |
| `261009-1448-the-version-boundary-test-needs-full-git-history-at-two-fixed-objects.md` | low (G-B) | the version-boundary test reads the old bundle from git by object name, so a shallow clone or a `git archive` tree fails it |
| `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md` | low (coverage pass) | in a fresh clone, `carried=` comes from a review picked by file mtime; `verdict=` is unaffected |
| `261009-1833-migrate-names-a-four-commit-split-but-gives-no-path-lists-so-staging-it-needs-a-generated-list.md` | not rated; deferred by the user | the migration report proposes a four-commit split but names no path list for each commit |
| `261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md` | medium (F2 of `261009-1855-reviewer-…`); deferred by the user | `/fusion:migrate` Step 6 runs the sweep's write beside staged renames, which the sweep's guard refuses as a dirty tree |
| `261009-2028-migrate-reads-a-broken-branch-ref-as-a-repository-with-no-commit-and-derives-untracked-for-every-file.md` | low; deferred by the user | a branch ref git cannot read is taken for an unborn branch, so every person is derived as `untracked` |
| `261009-2040-migrate-skill-reads-a-missing-or-refusing-git-as-a-workbench-not-under-version-control.md` | not rated; deferred by the user | the skill's rename steps take a missing or refusing git for "not under version control" and move with `mv` |
| `261009-2148-the-rename-pass-cannot-drain-a-circles-store-whose-only-entry-is-a-colliding-ds-store-and-the-json-run-refuses-on-it.md` | not rated; deferred by the user | R1 of step 15; the upgrade guide names the hand step |
| `261009-2236-the-upgrade-guides-leftover-procedure-has-no-branch-for-a-leftover-with-no-copy-under-the-new-name.md` | low (`261009-2236-reviewer-…`, L-1) | the guide's leftover procedure assumes every leftover has a copy under the new name |

### Requests 59 to 66, as they stand

| Request | State | Where |
|---|---|---|
| 59 | **complete** at Prior `d6abeb8`, for `f9ecae78`; re-asked as 63 | `Prior: docs/design/fusion-fj04-correction-prior-response.md` `## 59: shared fixtures` |
| 60 | **complete** at `d6abeb8`; `c76bbce9…` qualified; re-asked as 64 | the same document, `## 60: runtime qualification` |
| 61 | **answered Yes** at Prior `7da6690` | `Prior: docs/design/fusion-fj03d-prior-response.md` |
| 62 | **accepted with corrections** at Prior `f32bf4a` | `Prior: docs/design/fusion-claim-takeover-prior-response.md` |
| 63 | **complete** at Prior `34a2710`, for `dd4bf3d4` | `Prior: docs/design/fusion-takeover-qualification-prior-response.md` `## 63 — Shared schemas and fixtures` |
| 64 | **complete** at `34a2710`, for `dd4bf3d4`; `fb170361…` qualified, the bundle `v13.0.0` ships | the same document, `## 64 — Runtime snapshot and replay` |
| 65 | **complete**: "Yes" at Prior `167c605`, for C = `468d8e87`, now `v13.0.0` | `Prior: docs/design/fusion-fj05-release-evidence-prior-response.md`; `### Prior's answer to 65 at 167c605` above |
| 66 | **never asked** (decision A2, option 1) | `## FJ05 (the release evidence at 468d8e87)` above |

These rows supersede the rows in `### Requests 59 to 65, as they stand` above. **No request is open.**

This section asks Prior nothing, and it opens no new request.
