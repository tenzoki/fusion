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

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Content confirmed live; two cross-references corrected.**

The measured table still reproduces the boundary it describes: `hooks/lib/paths.ts:37-38` decides protection on the text of a path and nothing else, and the classifier reads only written operands. The residual row this record would remove is live at `rules/protected-path-discipline.md` under "Where this check does not reach", shipped in `ce7a125`. So the record's urgency argument holds: the row calls the residual accepted, and it becomes wrong the day a deny lands.

**Two cross-references do not resolve as written.**

1. `issues/260802-2335_p_the-stated-residual-list-omits-the-alias-…` — the file is now `260802-2335_c_…`. It was closed by `ce7a125` in the same session that filed this record. This is the failure mode already filed at `shared/issues/260802-1740_*_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md`; the target moved one marker later, exactly as that issue predicts.
2. `shared/issues/260802-2320` — that issue is not in the shared store. It is `circles/260801-1244-guard-rules-write/issues/260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md`. The same wrong store appears in `## Options` option 3 and again in `## Constraints`.

**Option 3's status has moved since this record was written, and it matters here.** This record defers option 3 to `260802-2320` on the grounds that deciding it here would pre-empt that question. `260802-2320` has since been decided: `decisions/260803-1419_a_how-should-the-protected-path-check-treat-the-case-of-a-path.md` chose **unconditional case folding**, not filesystem resolution. So option 3 was not taken there and remains genuinely open for this record — the deferral did not resolve it by proxy, and whoever answers this decision cannot treat it as answered elsewhere.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_o_`. Content re-verified live; the urgency argument has strengthened.**

The measured table still reproduces at HEAD `cc012fc`: `ln -s ../agents/coder.md build/alias`, `cp -l agents/coder.md build/hardalias` and the follow-up `echo pwned > build/alias` all allow. `hooks/lib/paths.ts` still decides protection on the text of a path, and the classifier still reads only written operands.

The residual row this record would remove is live at `rules/protected-path-discipline.md:519-530`, and the same file now carries a second, larger honesty problem in the section an agent reasons from (`issues/260804-1025_o_`). That does not change this record's answer; it changes the weight of the record's own argument that a residual row calling the gap "accepted" becomes wrong the day a deny lands.

The two cross-reference corrections from reconciliation 260803-1516 were not applied and are repeated here so they are not lost: `issues/260802-2335_p_…` is now `_c_`, and `shared/issues/260802-2320` is not in the shared store — it is `circles/260801-1244-guard-rules-write/issues/260802-2320_c_…`, and its marker has since moved from `_o_` to `_c_` as well, so the citation is now wrong in two ways.

## Answer

**Option 1: the classifier keeps reading only the operands a verb writes.**

Chosen by the user, 2026-08-04. `ln`, `ln -s` and `cp -l` stay allowed whatever their source
operand is, and the planted alias stays on the accepted-residual list.

The reasoning that carried it is the one this record recommended with low confidence, and it
is about the invariant rather than about the case. "Only the operands a verb writes count" is
stated four times across the two shipped documents, it is what keeps every legitimate read of
a protected file allowed, and an agent can state it from memory. Denying a read operand would
close one spelling of the class at the price of that regularity, and an agent that has learned
"reads are always fine" and then meets a denied `cp -l` is in exactly the position
`rules/protected-path-discipline.md` exists to prevent: an unexplained deny, followed by a
rephrasing that works.

The residual is not new and is already on both residual lists, added when `260802-2335`
closed. **The obligation this answer creates is that the lists say the whole of it**: not only
that a pre-existing alias escapes protection, but that an agent may create one itself, in one
allowed command, with no flag, and write through it on either surface. Step 7 of the
remediation plan owns that sentence.

The larger fix remains available and is where it belongs: resolving every guarded path through
the filesystem drops this case out as a by-product rather than as a special case, and that is
`circles/260804-1205-shell-reachability-model`'s neighbourhood rather than this Circle's.

---
Answered: this record, `## Answer` — user chose option 1; the write-only rule is worth more than the spelling it leaves open, and the residual must be stated in full rather than in part.

---
Implemented: 98c9363 — option 1 is documentation-only, and the obligation landed: the planted-alias residual is stated in full in `rules/protected-path-discipline.md` (rewritten around the measured block) and `README-hooks.md:215`, and the hard-linked-rule-file exception on the exemption side landed with C5b plan Step 7 obligation 3 (`373f5ed`). Walked `_a_` → `_i_` by the reconciler at the final Circle reconciliation 260805-2323.
