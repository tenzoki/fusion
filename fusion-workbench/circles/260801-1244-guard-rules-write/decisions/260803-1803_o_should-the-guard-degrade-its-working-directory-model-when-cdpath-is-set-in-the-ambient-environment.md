# Should the guard degrade its working-directory model when `CDPATH` is set in the ambient environment?

---
**Domain:** code
**Status:** open
**Filed by:** analyst, task T4-1 of `circles/260801-1244-guard-rules-write`
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260803-1803_o_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate.md`
(the measurement that raised this),
`circles/260801-1244-guard-rules-write/analyses/260803-1803-guard-path-model-root-cause.md`
(the analysis recommending the in-command half),
`circles/260801-1244-guard-rules-write/issues/260803-1431_o_gate-0-misses-the-dotdot-in-a-cd-p-operand-so-a-planted-link-still-spends-the-grant.md`,
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
