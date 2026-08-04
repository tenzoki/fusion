# How should the protected-path check treat the case of a path?

---
**Domain:** code
**Status:** implemented (corrected from `answered` by reconciliation 260804-1021; the filename marker `_i_` was already right)
**Filed by:** orchestrator, at the user gate closing Turn 3 of `circles/260801-1244-guard-rules-write`
**Cross-references:** `circles/260801-1244-guard-rules-write/issues/260802-2320_o_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` (the measurement that raised this), `hooks/guard.ts` CHECK 2, `hooks/lib/paths.ts` (`collapseSegments`, `matchesAny`), `hooks/lib/bash-mutation-guard.ts`, `rules/protected-path-discipline.md`, `README-hooks.md`

---

## Question

On a case-insensitive filesystem, a protected path spelled in a different case writes the
same file and is allowed. Measured against the real guard subprocess in a throwaway project,
on a machine whose root filesystem is APFS in its default case-insensitive configuration:

```
Edit agents/coder.md        DENY
Edit AGENTS/coder.md        allow      -> writes agents/coder.md
Edit HOOKS/config.json      allow      -> writes hooks/config.json
Edit Rules/x.md             allow
rm AGENTS/coder.md          allow
```

That is a complete bypass of `guard.protectedPaths` on both write surfaces, for any
developer on a default macOS install or a case-insensitive Windows volume. It predates this
Circle and is independent of `FUSION_ALLOW_RULES_WRITE`. The grant side is already closed:
`isProjectRulePath` resolves through `realpathSync.native`, which folds case. Only the
protection side is open.

The choice had to be made rather than patched because three shipped documents describe the
protection check as purely textual, and one of them, `rules/protected-path-discipline.md`,
is loaded into every agent's context on every dispatch in every consuming project. It was
rewritten in this same Turn on exactly that premise (`ce7a125`). A change here is a change
to a stated security contract, not an implementation detail.

## Options

1. **Fold case unconditionally.** Match the protected list case-insensitively on every
   platform.
   - Pros: platform-independent, no filesystem work, one line on each side of the match.
     Over-blocking is the direction the guard already chooses elsewhere, in the fail-closed
     rule for an unresolvable operand of a recognised verb.
   - Cons: over-protects on a case-sensitive filesystem, where `AGENTS/coder.md` is
     genuinely a different file and a project that deliberately keeps both would find one of
     them unwritable.
2. **Fold only where the filesystem does**, detected once at load.
   - Pros: correct exactly where it applies, no over-blocking anywhere.
   - Cons: the same repository protects differently on Linux and on macOS. A platform-
     dependent security boundary has to be documented in every place the boundary is
     described, or it is discovered rather than known.
3. **Resolve every guarded path through the filesystem**, the way the grant side now does.
   - Pros: most accurate, and it closes the planted-alias residual
     (`260802-2335`, documented in `ce7a125`) and the symlink escape along with this.
   - Cons: filesystem work on every guarded call, and behaviour changes for a path that does
     not exist yet, which is the common case for a `Write`. The "purely textual" premise
     disappears from all three documents.

## Constraints

- Whatever is chosen must hold on **both** write surfaces. A fix on the write tools alone
  would leave the shell open and teach an agent that the way past a deny is to reach for
  Bash, which is the precise failure `rules/protected-path-discipline.md` exists to prevent.
- The stated contract in `rules/protected-path-discipline.md`, `README-hooks.md` and the
  module docstrings must be corrected in the same change. A guard whose documented premise
  is false is the defect this Circle has now hit twice.

## Answer

**Option 1: fold case unconditionally.**

Chosen by the user at the Turn 3 closing gate, 2026-08-03. The reasoning that carried it:
over-blocking on a case-sensitive filesystem is the safe direction and matches the choice
the guard already makes elsewhere, whereas a boundary that differs by platform (option 2)
has to be re-stated in every document that describes it and is discovered rather than known.
Option 3 is a larger change with a real per-call cost, and it can still be taken later — it
subsumes this answer rather than conflicting with it.

The documented premise becomes "the check is textual, and case-insensitive".

## Realisation

Not implemented. The change belongs to a later Circle, together with the correction of the
three documents that state the premise. This record moves to `_i_` when that lands.

---
Answered: `circles/260801-1244-guard-rules-write/history/260803-1038-orchestrator-session.md` — user chose unconditional case folding at the Turn 3 closing gate; over-blocking is the safe direction and a platform-dependent boundary is not.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_a_`. The answer is sound; its `Answered:` citation does not resolve to the answer.**

`_a_` is the correct marker: the direction is chosen and nothing implements it. `hooks/lib/paths.ts:37-38` (`matchesAny`) and `:77-79` (`collapseSegments`) contain no case handling, so the bypass measured in `## Question` reproduces at HEAD `fa81589`. `## Realisation` says so plainly.

**The citation problem.** The footer cites `circles/260801-1244-guard-rules-write/history/260803-1038-orchestrator-session.md`. That file exists, but it does not record the Turn 3 closing gate or this answer — it was written once at commit `3b0f9e7` and its `## Per-Turn Log` still reads "(No Turn started yet in this session.)". A reader following the citation finds nothing. The underlying cause is the session-bookkeeping freeze filed at `shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`, annotated today with this session as its second instance.

**Resolvable citations for the same answer**, so the record is not left pointing only at an empty section:

- this record's own `## Answer` section — the full reasoning, written at the gate
- commit `242b723` "chore(workbench): record the case-folding direction, leave the bypass open" — the commit that filed it
- `circles/260801-1244-guard-rules-write/issues/260802-2320_o_…`, `Direction decided` footer — the issue side of the same pair, which names this record back

**The pair is consistent, checked both ways.** This record's `**Cross-references:**` names the issue by its full current path with the `_o_` marker, which is correct while that marker stands. The issue's footer names this record. `## Answer` selects option 1 here, which is option 2 of the issue's candidate list — different numbering, same choice (unconditional folding), and neither document claims the code has moved.

---
Implemented: `86a437a` — `foldCase` and `matchesAnyFolded` in `hooks/lib/paths.ts`, consumed by `guard.ts` CHECK 2 and by both passes of the classifier's `isProtected`, with `ancestorOfProtected` folding its literal prefix by hand because it is a `startsWith` rather than a glob match. The fold is on the match, not on either normaliser, which is what keeps the grant side and the trailing-separator asymmetry intact. Cost measured on a purpose-built case-sensitive APFS image: exactly four denials appear that are genuinely a second file. Tests 1098 → 1146; with `foldCase` stubbed to the identity, 36 of the 48 new cases fail.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — `_i_` confirmed by measurement. Two record-integrity notes, one of them a repeat.**

**The `_i_` transition is real.** `hooks/lib/paths.ts:89-90` defines `foldCase`; `:148-149` folds both sides inside `matchesAnyFolded`; the classifier consumes it at `hooks/lib/bash-mutation-guard.ts:261`, `:1307` and `:1311`. Both write surfaces fold. The bypass measured in `## Question` does not reproduce at HEAD `cc012fc`. `86a437a` is correctly cited.

**The `Answered:` citation flagged by reconciliation 260803-1516 was not corrected, and now sits above an `Implemented:` line that is correct.** Line 87 still cites `circles/260801-1244-guard-rules-write/history/260803-1038-orchestrator-session.md` for the user's choice. Re-checked today: that file's `## Per-Turn Log` still reads "(No Turn started yet in this session.)" and records no gate. A reader following the citation still finds nothing. The three resolvable citations listed by the previous reconciliation still stand and are the ones to use — this record's own `## Answer`, commit `242b723`, and the `Direction decided` footer on `issues/260802-2320`.

That a citation flagged by one reconciliation survives the next session untouched is itself the finding. The reconciler annotates; nothing in the loop acts on the annotation. Recorded on `shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`, which is the nearest existing home for it.

**The `**Cross-references:**` line points at `issues/260802-2320_o_…`; that file now carries `_c_`.** Third instance of `shared/issues/260802-1740_o_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md` inside this Circle alone. Not repaired here, for the same reason the sibling instances were not: hand-fixing one path leaves the mechanism untouched.

**Header field corrected.** `**Status:**` read `answered` while the marker read `_i_` and the `Implemented:` line was filled. Set to `implemented`. Two other records in this store had the same disagreement — see the note on `260803-2338_i_`.
