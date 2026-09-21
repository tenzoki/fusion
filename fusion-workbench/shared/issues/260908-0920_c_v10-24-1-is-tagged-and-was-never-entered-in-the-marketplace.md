v10.24.1 is tagged and was never entered in the marketplace

---

`v10.24.1` exists as a git tag and as the branch `release/v10.24.1`, cut from the `v10.24.0` tag
rather than from `main`. The marketplace entry still reads `10.24.0`: its clone is clean and its
last fusion commit is `641007d chore(fusion): 10.24.0`. The release process requires both repos to
be bumped and pushed.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**What is and is not affected.** Nothing is broken for a user installing over HTTPS: `install.sh`
reads the GitHub tarball and `FUSION_REF=tags/v10.24.1` resolves. A user installing through
`/plugin install fusion@tenzoki-plugins` gets 10.24.0 and has no way to see that a patch exists.

**Why it is a record rather than a fix in passing.** The version this session is preparing, 10.25.0,
carries 10.24.1's content already — measured, the three files that patch touches are byte-identical
between `origin/main` and `origin/release/v10.24.1`, and the record it carries is in `main`. So the
marketplace will jump 10.24.0 to 10.25.0 and the gap closes on its own without 10.24.1 ever
appearing there. Bumping the marketplace to 10.24.1 now would publish a version whose content is
already superseded.

**The part that outlives this instance.** A release cut from a tag rather than from `main` reaches
only the surfaces whoever cut it remembered. Two of the four version surfaces the release process
names moved for 10.24.1 and two did not: `install.sh`'s pin example and `README.md`'s both still
say `v10.24.0`. Nothing measures that, which is why a release can be half-published and look
finished.

**Acceptance.** Either the four version surfaces and the marketplace agree for every tag that
exists, or the release process states which tags are allowed to be partial and how a reader tells
one from an unfinished release.

---
Resolved: obsolete for its instance, and its residual written into the process. The marketplace entry this record measured at `10.24.0` reads `11.9.1` (`/Users/k1/Projects/productive/claude-plugins/.claude-plugin/marketplace.json`, that clone's HEAD `57ab4e3 chore(fusion): bump to 11.9.1`); `install.sh` and `README.md` both pin `v11.9.1`; the tag `v10.24.1` still exists and never will be entered, and the gap closed at 10.25.0 as the record foresaw. The acceptance's second branch is taken: `README-agents.md` `## Releasing` step 5 now states, in the commit that carries this line, that a tag cut from anything but `main` is partial by definition and is not entered in the marketplace, which is how a reader tells `v10.24.1` from an unfinished release. Survey `260921-1653-open-defect-survey-at-11-9-1.md` row 13. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 27.
