A tree that owes no git identity is read as one whose identity could not be read, and the two sentences it prints contradict each other

---

`bin/fusion-identity` exit 4 means *not a git work tree, so no identity is owed*. `bin/fusion-events presence` maps it into the same degraded branch as exit 3 and 5, so a non-git project — a configuration fusion supports deliberately — never reaches exit 0 and gets a permanent caveat on every presence surface, under two stderr lines that say opposite things.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium

**Evidence.** Measured in a fresh non-git workbench with an empty event log:

```
$ bin/fusion-events presence
fusion-identity: not a git work tree, so no identity is owed and none is missing.
window_days=7
scope=pulled
other_checkouts=0
fusion-events: fusion-identity reports no git identity is owed here (not a git work tree).
fusion-events: the reading person could not be read, so another person cannot be told from a
  further checkout of your own. other_people is not printed; ...
EXIT=4
```

The third line and the fifth are the same program describing one state as *nothing is owed* and as *could not be read*. `hooks/events-query.ts:79-98` has the distinction in hand — `identityNote` branches on 4 separately — and `:178-186` then discards it, keying only on `identity.person === null`.

**Why the distinction is load-bearing rather than cosmetic.** `bin/fusion-identity`'s own header devotes a section to why 1 and 4 must stay different codes: "A prompt keys on the exit code and cannot key on stderr prose", and 4 says "*carry on, there is nothing to name*". `rules/fusion-workbench-conventions.md` `### Who filed it` restates it: on exit 4 the caller "files normally, with the person half absent rather than empty". `CLAUDE.md`'s `bin/fusion-identity` row calls the non-git case "what keeps single-user non-git operation working".

**The user-visible consequence.** Plan step 6 renders exit 4 as "the counts with the note that the two kinds could not be told apart". In a non-git project that note is permanent, on every `/fusion:setup` and every `/fusion:next`, for a project in which no other party can exist. Step 6 also asks the surface to "print nothing at all when the counts are zero", and the two instructions collide precisely here.

**What is genuinely undecidable, and what is not.** Telling another person from a further checkout of one's own is genuinely impossible without the reading person, so the *classification* is right. What does not follow is the wording or the exit code: nothing "could not be read" in a tree that owes nothing.

**Fix direction.** Branch on `FUSION_EVENTS_IDENTITY_EXIT === 4` in `presence`. Phrase it as *no git identity is owed here, so no other party can be told from a further checkout of your own*, and decide deliberately whether that reaches exit 0 with `other_people` absent or keeps 4 — then state the choice in the `bin/fusion-events` header. Drop whichever of the two contradicting stderr lines is not chosen.

**Scope.** `hooks/events-query.ts`, `bin/fusion-events` header, and the renderer plan step 6 has yet to write.
