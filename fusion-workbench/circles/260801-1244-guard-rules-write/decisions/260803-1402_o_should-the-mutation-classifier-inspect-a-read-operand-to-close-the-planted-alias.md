# Should the mutation classifier inspect a READ operand, to deny `ln` / `ln -s` / `cp -l` when the source is a protected path?

---
**Domain:** code
**Status:** open
**Filed by:** coder (Turn 3, task T3-7), on the instruction in
`issues/260802-2335` direction 2
**Cross-references:**
`issues/260802-2335_p_the-stated-residual-list-omits-the-alias-an-agent-can-plant-for-itself-in-one-allowed-command.md`
(directions 1–3; direction 1 landed in T3-7),
`rules/protected-path-discipline.md` "Where this check does not reach" (the residual row
this decision would remove),
`hooks/lib/bash-mutation-guard.ts` `WrittenPositionals` / `VerbSpec.exemptible` (the
`exemptible: false` row on `ln`, which makes the same argument on the GRANT side),
`hooks/lib/paths.ts:71-75` (protection is purely textual, by design),
`shared/issues/260802-2320` (case-folding — carries direction 3, the complete answer)

---

## Question

The protected-path classifier reads only the operands a verb **writes**. That is correct
for `cp rules/x.md /tmp/backup`, which copies a protected file's contents out and harms
nothing. It is also what allows an agent to give a protected file a second, unprotected
name and then write through it.

Measured at HEAD, real guard subprocess, throwaway consuming project, shipped
`hooks/config.json`, no environment flag set:

```
  ln -s ../agents/coder.md build/alias      allow
  cp -l agents/coder.md build/hardalias     allow
  echo pwned > build/alias                  allow   -> agents/coder.md reads "pwned"
  echo pwned2 > build/hardalias             allow   -> agents/coder.md reads "pwned2"
  Edit build/alias                          allow   (the write-tool surface too)

  (control) rm agents/coder.md              DENY
  (control) echo x > agents/coder.md        DENY
```

Two commands, no flag, both spellings, both surfaces. The guard sees each command in full
and resolves every operand; it allows them because neither *names* a protected path.

Direction 2 of `260802-2335` proposes denying `ln`, `ln -s` and `cp -l` when the SOURCE
operand is protected. That closes the deliberate plant at the moment of planting. It also
introduces the first case in which the classifier inspects a read operand, which is why
this is a decision rather than a patch: "only the operands a verb writes count" is stated
four times across the two shipped documents and is the invariant that keeps every
legitimate read of a protected file allowed.

The question must be settled now rather than later because T3-7 has just shipped the
residual as **known and accepted** in the file every agent loads on every dispatch. If the
answer is that the plant should be denied, that row is wrong the day the deny lands.

## Options

1. **Leave it. The residual row is the answer.** (What T3-7 shipped.)
   - Pros: the write/read invariant stays whole and stays explainable in one sentence.
     Nothing legitimate is lost. The row is honest about the boundary, which is what
     `rules/protected-path-discipline.md` exists for.
   - Cons: the cheapest route around the guard stays open, and it is now written down in
     the file every agent reads. The rule's answer to that is normative ("this is the same
     denial you would have got"), not mechanical.
2. **Deny `ln` / `ln -s` / `cp -l` on a protected source.**
   - Pros: narrow, cheap, and it closes the plant in the two spellings an agent would
     actually reach for. It mirrors the `exemptible: false` reasoning already applied to
     `ln` on the grant side, where the argument is that a verb whose purpose is to give a
     file a second name cannot be treated like a verb that writes one.
   - Cons: the classifier starts reading operands it currently ignores, so the invariant
     needs a stated exception; `cp -l rules/x.md /tmp/backup` denies while
     `cp rules/x.md /tmp/backup` allows, a distinction that will read as arbitrary at the
     point of denial. It closes one spelling of the class, not the class: a pre-existing
     alias stays open, an alias to an ancestor DIRECTORY (`ln -s ../agents build/d`) needs
     ancestor matching on the read side too, and any program outside the table plants the
     same link. It also raises the question of whether the source operand should then be
     fail-closed when unresolvable, which would deny `ln -s "$SRC" x` and reach ordinary
     work.
3. **Resolve every guarded path through the filesystem.**
   - Pros: the complete answer. Both spellings, pre-existing aliases included, on both
     surfaces.
   - Cons: expensive, platform-dependent, and already under discussion at
     `shared/issues/260802-2320` as direction 3 of the case-folding question. Deciding it
     here would pre-empt that.

## Constraints

- Any answer must keep `cp rules/x.md /tmp/backup` and `cp -R rules /tmp/backup` allowed.
  Both are listed under "What stays allowed" and both are ordinary work.
- Any answer must not make the fail-closed rule reach read operands of ordinary commands.
  The stated bound ("an unrecognised program is allowed however unparseable its arguments
  are") is what keeps the guard out of everyday shell work.
- Whichever way this goes, `rules/protected-path-discipline.md` and `README-hooks.md` move
  together. Option 2 removes the residual row from one and the residual sentence from the
  other.
- Option 3 belongs to `260802-2320`, not here. This decision should not answer it.

## Recommendation

**Option 1, with low confidence, and I would want the user's judgement rather than mine.**

The reasoning that decides it for me is the asymmetry between the two sides. On the grant
side, `exemptible: false` on `ln` narrows a permission: it fails safe, and no
rule-curation workflow needs to create an alias, so it costs nothing. On the protection
side, denying a read operand widens a denial, and a widened denial that closes one
spelling of a class buys a partial gain at the price of an invariant an agent can state
from memory. An agent that has learned "reads are always fine" and then meets a denied
`cp -l` is in exactly the position `rules/protected-path-discipline.md` was written to
prevent: an unexplained deny, followed by a rephrasing that works
(`cp` without `-l`, then `ln` from a script).

What makes option 1 defensible is the honesty of the residual row rather than the strength
of the guard. If that is not enough, the answer is option 3 and the place to decide it is
`260802-2320`, where the cost is already being weighed.

`inference:` the "partial gain" judgement rests on my reading of the verb table and on the
measured rows above; I did not implement option 2 and have not measured what it would
break.

---
Answered:
Implemented:
Deferred:
Superseded by:
