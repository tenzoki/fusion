# How does a fix reach a consumer while main carries unreleased work?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260907-0657-orchestrator-session.md (the session that improvised the answer), 260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md (the neighbouring advisory-not-gate ruling), 260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md

---

## Question

The release process in `CLAUDE.md` describes one route: bump `plugin.json`, bump the fusion entry in
the marketplace's `marketplace.json`, push both repositories, tag the commit that was pushed. Every
step of it assumes the release is cut from `main`.

It has no answer for the case that occurred on 260908. A fix worth shipping sat on `main` two
commits below work that was not ready to publish, and the version had not been bumped. Cutting the
documented release would have published the unready work; not cutting one would have left the fix
unreachable from any consuming project. The session invented a third route under time pressure and
nothing in the shipped text sanctioned it.

Two halves, and the second is the one the documented process gets wrong rather than omits:

1. What is the sanctioned way to deliver a fix that sits below unreleased work?
2. Does the marketplace entry move for such a release?

The second half matters because the two surfaces resolve differently. A tag names one commit.
`/plugin install` resolves against the marketplace cache clone and serves `main`. Bumping
`marketplace.json` to a version whose source is a side branch therefore advertises a version number
while delivering a different tree, which is the failure the whole exercise exists to avoid.

## Options

1. **Patch release cut from the previous tag, no marketplace bump.** Branch from the last release
   tag, cherry-pick only what ships, bump `plugin.json`, tag, push branch and tag. Delivery is
   `install.sh` with `FUSION_REF` pinned to the new tag.
   - Pros: publishes exactly what was chosen and nothing else; the tag is a reproducible artifact
     any consumer can pin; `main` is untouched, so the unready work keeps its own release later.
   - Cons: the version surfaces drift, because `install.sh` and `README.md` carry a pin example
     naming the previous tag and neither is bumped on a side branch; the release is not reachable
     through `/plugin install` at all; a consumer must know to set `FUSION_REF`.
2. **Cut the release from `main` and revert the unready work on the release branch.** Branch from
   `main`, revert the commits that are not ready, tag.
   - Pros: carries every other improvement `main` has accumulated; one branch point.
   - Cons: a revert of in-flight work is a change nobody reviewed, and re-landing it later is a
     second merge conflict; the release contains commits whose reverts must be un-reverted.
3. **Wait: finish the in-flight work, then release from `main` normally.**
   - Pros: no departure from the documented process at all.
   - Cons: the consumer waits an unbounded time for a fix that is already written and verified.

## Constraints

- A release must not publish work its author says is not ready. This is what forces the question.
- `/plugin install` resolves against `main`. Any answer that bumps `marketplace.json` for a release
  not cut from `main` advertises a version it does not deliver.
- `fusion --update` runs `install.sh` with no ref and therefore resolves `heads/main`
  (`install.sh:34`, and the launcher body in the same file). A tag reaches a consumer only when the
  ref is set explicitly. Any answer that names `fusion --update` as the delivery route must carry
  the pin with it, or it delivers `main`.
- The four version surfaces `CLAUDE.md` enumerates (`plugin.json`, `marketplace.json`, the
  `install.sh` header example, the `README.md` example) were written on the assumption that a
  release comes from `main`. An answer here decides which of them a tag-cut release touches.

## Recommendation

Option 1, which is what the 260908 session performed and what this record exists to sanction or
reject after the fact.

---
Answered: 260907-0657-orchestrator-session.md `### Ruling: no marketplace release for a tag-cut patch` — option 1, the patch cut from the previous tag with the marketplace entry left alone; delivery by pinning the ref, since a bare `fusion --update` resolves `heads/main`; ruled by user, Kai Stalmann <ks@qantr.com>.
