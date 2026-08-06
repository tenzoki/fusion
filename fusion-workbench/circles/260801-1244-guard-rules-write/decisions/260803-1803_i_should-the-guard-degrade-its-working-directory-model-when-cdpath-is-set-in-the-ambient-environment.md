# Should the guard degrade its working-directory model when `CDPATH` is set in the ambient environment?

---
**Domain:** code
**Status:** implemented (corrected from `open` by reconciliation 260804-1021; the filename marker `_i_` was already right)
**Filed by:** analyst, task T4-1 of `circles/260801-1244-guard-rules-write`
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260803-1803_*_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate.md`
(the measurement that raised this),
`circles/260801-1244-guard-rules-write/analyses/260803-1803-guard-path-model-root-cause.md`
(the analysis recommending the in-command half),
`circles/260801-1244-guard-rules-write/issues/260803-1431_*_gate-0-misses-the-dotdot-in-a-cd-p-operand-so-a-planted-link-still-spends-the-grant.md`,
`hooks/lib/bash-mutation-guard.ts` (`applyDirEffect`, `resolveDir`, `firstDirArg`),
`rules/protected-path-discipline.md`

---

## Question

The Bash mutation classifier models where a `cd` lands by joining the operand onto a virtual
working directory. Bash consults the `CDPATH` variable when a `cd` operand is a bare word, and
resolves the operand against each `CDPATH` entry in turn, which can land the shell anywhere.
Measured against the real guard, with no flag set, a `CDPATH` assignment written inside the
command reaches the entire protected list, including the guard's own halt record.

The recommended fix catches `CDPATH` **written in the command**: as a prefix
(`CDPATH=.. cd agents`), as an `export`, or as a bare assignment segment. That leaves one case
open, and it is the one the guard cannot see at all.

**A `CDPATH` exported in the user's own shell profile is invisible in the command text.** The
Bash tool's shell is initialised from the user's profile, so `cd rules` in an agent command can
land somewhere the classifier does not model, with nothing in the command to give it away. The
classifier has no way to detect this from its input.

Two things make the ambient case different in kind from the in-command case, and they pull in
opposite directions. It is not an attack, so nobody is choosing to trigger it, and the common
profile settings (`CDPATH=.:~/projects`, with `.` first) resolve to the same place the
classifier models. But it is silent when it does bite, and the direction it bites in is not
always the safe one: a `CDPATH` pointing back into the project from a subdirectory makes a
guarded write look unguarded, which is the direction a guard may never move.

## Options

1. **Read `process.env.CDPATH` and degrade.** When the guard's own environment carries a
   non-empty `CDPATH`, every subsequent `cd` with a **bare-word** operand yields `CWD_UNKNOWN`.
   Operands beginning with `/`, `./` or `../` are immune to `CDPATH` in bash and stay modelled.
   - Pros: removes the residual rather than documenting it. One condition, in a module that
     already receives the environment as a parameter, alongside the existing flag reads. It is
     the same fail-closed stance the recommended in-command fix takes.
   - Cons: a behaviour change for the users who have `CDPATH` set. For them every bare-word
     `cd` becomes unknown, so every relative operand of a recognised mutation verb after such a
     `cd` denies. Those users would see denials nobody else sees, with a reason that names the
     working directory but not `CDPATH`, unless the reason is extended to say so.
2. **Refine option 1 by checking whether `CDPATH` can actually divert.** Degrade only when the
   `CDPATH` entries could resolve the operand, which the guard cannot test without touching the
   filesystem for each entry.
   - Pros: no denials for the common `CDPATH=.:~/projects` shape, where `.` wins.
   - Cons: filesystem work inside the classifier, which is textual by design, on every `cd`.
     It also reintroduces exactly the pattern this Circle has been closing: a check that decides
     a path question by predicting what the shell will do.
3. **Document it as a residual.** Fix the in-command case and add the ambient case to the
   residual list in `rules/protected-path-discipline.md` and `README-hooks.md`.
   - Pros: no behaviour change, no cost to anyone. Honest, and the residual list already carries
     the planted alias, which is a larger hole than this one.
   - Cons: the residual is undetectable by the person it affects. A user with `CDPATH` set gets
     a weaker guard than everyone else and has no signal that they do. Every other entry on the
     residual list is something an agent has to actively do.

## Constraints

- Whatever is chosen has to hold on the Bash surface only. The write-tool surface has no
  working-directory model and is unaffected.
- If option 1 or 2 is chosen, the deny reason has to name `CDPATH` as the cause. The existing
  `viaCwd` reason names the working directory, which would send a user with `CDPATH` set looking
  at the wrong thing, and `rules/protected-path-discipline.md` exists to stop an agent
  rephrasing its way past a deny it does not understand.
- If option 3 is chosen, both `rules/protected-path-discipline.md` and `README-hooks.md` have to
  carry it, and the rule file loads into every agent's context in every consuming project.
- This decision is independent of the in-command `CDPATH` fix and must not block it. The
  in-command case is a measured bypass with a chosen direction; this is about the remainder.

## Answer

Not yet answered. This needs the user: option 1 imposes a visible cost on a specific group of
users to remove an invisible weakness, and that trade is not the implementer's to make.

## Realisation

Not implemented.

## Answer

**Option 1: read `process.env.CDPATH` and degrade.**

Chosen by the user at the Turn 4 closing gate, 2026-08-03. A user with no `CDPATH` set sees no
change at all, which is the common case; a user who has one gets the fail-closed stance rather
than a silently weaker guard they have no way to detect. That asymmetry is what carried it:
every other entry on the residual list is something an agent has to actively do, while this one
is invisible to the person it affects.

Option 2 was rejected on the analyst's reasoning, not on cost. Testing whether a `CDPATH` entry
could really divert means filesystem work inside a classifier that is textual by design, and it
reintroduces the predict-what-the-shell-will-do pattern this Circle has spent four Turns
removing.

Per the constraint above, the deny reason must name `CDPATH` rather than only the working
directory.

---
Answered: this record, `## Answer` — user chose option 1 at the Turn 4 closing gate; a silent weakening of the guard for one class of user is worse than a visible denial.

---
Implemented: `b85f6a0` — a non-empty `CDPATH` in the guard's environment makes a bare-word `cd` yield the existing unknown-directory state; anchored operands (`./x`, `../x`, `.`, `..`, `/abs/x`) stay exactly modelled, verified as whole-verdict equality rather than by inspection. The deny names `CDPATH` and says that rewriting the operand will not help. Measured over a 32-command corpus against HEAD's classifier: zero drift with `CDPATH` unset, blank or whitespace; six commands flip with it set, all of the shape "bare-word `cd`, then a relative write". Tests 1155 → 1167. One correction to this record's `## Question`: the common `CDPATH=.:~/projects` shape does **not** reliably resolve where the classifier models, because a leading `.` shields only the names the current directory happens to hold. Both shipped documents now say so.

---
Bound recorded (Turn 5, T5-1 — no marker change, the answer stands): what `b85f6a0` reads is
the **hook process's** environment, which is a frozen snapshot of Claude Code's launch
environment, not the environment of the shell the `Bash` tool spawns. The two agree whenever
Claude Code was itself started from a shell that had sourced the user's profile, which is the
ordinary case and was verified in this session. They diverge on a launch from a GUI, an IDE
extension host or a service manager, and when the profile is edited mid-session — and in
those the degrade does not fire for a `CDPATH` that really is in force. Option 1 is still the
right answer; it reaches less than the `## Answer` above implies, and it reaches nothing
option 2 would have covered without paying option 2's cost. Stated at `ambientCdpathIsSet`,
in `rules/protected-path-discipline.md` and in `README-hooks.md`
(`issues/260803-2040_c_the-ambient-cdpath-check-reads-the-hooks-environment…`).

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — `_i_` confirmed by measurement.**

`b85f6a0` is correctly cited. Verified at HEAD `cc012fc` rather than read off the commit: a bare-word `cd` under `CDPATH=..` denies, while the anchored operands the record promises stay exactly modelled (`./x`, `../x`, `.`, `..`, `/abs/x` all allow), and `CDPATH=` and whitespace-only leave every verdict unchanged. `hooks/guard.ts:393` passes `env: process.env`, which is the reach bound the trailing `Bound recorded` note states.

**The `Bound recorded` note is the model this Circle should keep.** It narrows the answer without moving the marker, states what the fix does not reach, names where the bound is written down (`ambientCdpathIsSet`, both shipped documents), and cites the issue that found it. A record that says "option 1 is still the right answer; it reaches less than the `## Answer` above implies" is more useful than one that reads clean.

**Header field corrected.** `**Status:**` read `open` while the marker read `_i_` and both transition lines were filled. Set to `implemented`.

**One cross-reference does not resolve.** `decisions/260803-2338_i_…` cites this record as `260803-1803_a_…`; the marker moved to `_i_` when `b85f6a0` landed. Fourth instance of `shared/issues/260802-1740_*_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md` inside this Circle. Not repaired by hand, for the same reason as the others.

**One more leftover, same shape as `260803-2338_i_`'s.** This record carries **two** `## Answer` headings. The first, at `:82-89`, still reads "Not yet answered. This needs the user" with a `## Realisation — Not implemented` beneath it; the real answer follows at `:91`. A reader scanning by heading meets the stale one first. Both records that reached `_i_` inside a single Turn carry this, and neither carries it by accident: the answer was appended at the closing gate and the pre-gate text was left in place. Worth a convention note more than a hand-fix — recorded in `history/260804-1021-reconciliation.md`.
