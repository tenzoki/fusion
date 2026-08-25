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

---
Resolved, and this is where the cross-cutting repair landed.

**The vocabulary is resolved once.** `bin/fusion-identity`'s exit codes are now translated in exactly one named place, `resolveIdentity` in `hooks/events-query.ts`, which returns `{ exit, identityOwed, note }` from a single table. Every branch of the reader consults it; no branch tests a code of its own, and `identityNote`'s per-call `switch` is gone. `identityOwed` is `false` **only** on the helper's 4 and 5 — the codes that could not tell (127, an unrecognised number, none passed at all) report a half as *unread*, because *nothing is owed* is the stronger of the two claims and a reader that could not establish it must not make it. The reason for the single point is stated at the function and again in the `bin/fusion-events` header: the helper's own header devotes a section to why 1 and 4 must stay distinguishable, and a switch repeated per branch is precisely how they stop being.

**The wording follows the distinction.** `presence` branches on `identityOwed` rather than on `identity.person === null`. In a tree that owes nothing it prints one sentence — no git identity is owed here, so there is no reading person to compare against and another person cannot be told from a further checkout of your own, **nothing is missing** — and the `fusion-identity reports …` note is no longer printed beside it, so the two contradicting lines the record measured are now one coherent line. The unread case keeps its own wording and keeps its note.

**The exit stays 4, deliberately, and the header now says why.** What a caller does is identical in both states: `other_people` is absent from stdout and every party line reads `unknown`. Exit 0 would promise a figure this run did not take, which is the one thing this helper's own principle forbids. The distinction between the two states is carried by stderr and by the header row rather than by a sixth code. Plan step 6's collision therefore resolves the way step 6 already resolves it: a non-git project's counts are zero, and the surface prints nothing at all.

The *classification* is untouched, per the record: telling another person from a further checkout of one's own is genuinely impossible without the reading person.

Measured, both branches against the same identity except the code:

```
$ FUSION_EVENTS_PERSON='' FUSION_EVENTS_CHECKOUT='deadbeef' FUSION_EVENTS_IDENTITY_EXIT=4 node hooks/dist/events-query.js presence
window_days=7
scope=pulled
other_checkouts=0
fusion-events: no git identity is owed here (not a git work tree), so there is no reading person to compare against and another person cannot be told from a further checkout of your own. Nothing is missing. other_people is not printed; …
EXIT=4

$ … FUSION_EVENTS_IDENTITY_EXIT=127 …
fusion-events: bin/fusion-identity is missing — the plugin install does not carry it.
fusion-events: the reading person could not be read, so another person cannot be told from a further checkout of your own. …
EXIT=4
```

**Not closed by this.** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0140_*_the-new-setup-step-2-identity-call-moves-a-halt-from-first-filing-to-setup-and-nothing-says-so.md`, the other visible end of the same vocabulary, is a statement owed in `agents/orchestrator.md` about exit 1 moving a halt to Setup. That file belongs to a later wave and no part of it was touched here.
