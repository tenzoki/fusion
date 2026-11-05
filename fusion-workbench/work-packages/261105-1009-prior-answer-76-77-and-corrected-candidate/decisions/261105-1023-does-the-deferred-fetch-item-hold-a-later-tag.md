# Does the deferred fetch item, request 76 question 4, hold a later tag?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

---

## Question

Prior defers 76 question 4 on its issue `261023-0835-git-fetch-origin-fails-in-the-container-because-refs-remotes-is-read-only.md`. The command container runs `--network none`, so `news` cannot fetch and ends at exit 6, as `skill-news`'s `prior` part already says. Request 77 `### What fusion does with the answer` says of a deferred item: no tag carries the candidate, and the user rules. D-F1 ruled out a tag at C′ regardless, but the question comes back once Prior answers on 13.4.2. This is the user's ruling.

## Options

1. **The tag waits for Prior's issue.** No `v13.4.x` tag until a declared fetch works.
   - Pros: the tag means the whole surface was answered.
   - Cons: the date depends on a Prior item with no date, and the Claude Code release line carries no tag meanwhile.
2. **The tag may carry the deferral as a stated limit.** An otherwise accepted candidate is tagged, `news` on Prior ends at exit 6 as documented, and the fetch comes with a later patch.
   - Pros: the tag follows the evidence that exists; the behaviour is already what the text says.
   - Cons: it amends the rule request 77 wrote, by the user's act, in the request record.

## Constraints

Nothing in 13.4.2 depends on it: `skill-news`'s exit 6 text stays, no part changes for the fetch, and this package neither tags nor pushes.

## Recommendation

Leave it open until Prior answers request 78, because the question has no effect before then. Until ruled, the default is the rule as request 77 wrote it: no tag on a deferred item. The planner leans to option 2 on one reason only, that the behaviour is already documented (*inference*: the user may weigh the tag's meaning otherwise).
