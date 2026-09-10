No v10 release was ever tagged, so the installer's own rollback example names a ref that does not exist
---
`install.sh` documents `FUSION_REF=tags/v10.26.0` as the way to pin a version. That tag does not exist. `git tag --list` ends at `v9.0.0`: not one of the v10 releases was tagged, so there is no pin back to any of them and the documented example is unusable as written.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** CLAUDE.md `## Release process` step 5; install.sh:25-27

**Evidence, measured at `46a1209b`.** `git tag --list` returns 41 tags, the newest `v9.0.0`. `install.sh` lines 25 to 27 read: *"Every release is tagged v<version>, so pin one with FUSION_REF=tags/v<version> — e.g. FUSION_REF=tags/v10.26.0 for the current release."* Both halves are false: no v10 release is tagged, and the named example resolves to nothing. `CLAUDE.md`'s release process makes tagging step 5 and says tagging started at v5.5.0, with v5.5.0 applied retroactively to its release commit.

**Why it matters now rather than generally.** The repository stands at 11.0.0 with fifteen commits of a large cut on `main`, and `install.sh` defaults to `heads/main`. A user who updates gets that cut. If it goes wrong there is no released version to pin back to, because the last taggable point, v10.26.0 at `91179f35`, has no tag. The rollback the installer documents is exactly the thing that is missing.

**A second consequence, smaller.** `README.md` and the installer header both carry a pin example naming a tag that was never created, so the two version surfaces `CLAUDE.md` counts as needing to stay coherent have been coherent with each other and wrong together.

**Acceptance.** Either every v10 release carries a tag, applied retroactively as v5.5.0 was, or the claim that every release is tagged leaves `install.sh`, `README.md` and `CLAUDE.md` and is replaced by what is true. At minimum `91179f35` carries `v10.26.0` before any user is told to update, so a pin back to the last pre-cut release exists. The release process then says what makes step 5 get run, given it was skipped 26 times without anything noticing.
