# Should `git restore --source=HEAD <path>` become inert, the way `git checkout HEAD -- <path>` already is?

---
**Domain:** code (security control)
**Status:** open
**Filed by:** coder, implementing plan Step 3
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1348_p_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md` (recommendation 3, which this record carries so the issue's other two halves can be taken by Step 7),
`circles/260801-1244-guard-rules-write/decisions/260804-1323_i_should-the-guard-model-gits-own-working-directory-or-give-up-on-it.md` (`## The second question` — where the `checkout HEAD` inertness argument was made and where the claim that the two spellings now agree was recorded),
`circles/260801-1244-guard-rules-write/planning/260804-1633_o_plan-c5b-remediation-and-ship.md` (Step 3, which assigns `260804-1348` to a code pass that cannot take it without breaching the Circle's own no-new-allow constraint),
`hooks/lib/bash-mutation-guard.ts` — `isGitRestoreSourceFlag`, the `restore` row, `GIT_CHECKOUT_INERT_TREEISH`, `gitCheckoutWrites`

---

## Question

`git checkout HEAD -- rules/x.md` and `git restore --source=HEAD rules/x.md` are the
same operation — restore the file to its committed state — and the guard gives them
opposite verdicts. The first allows, because `gitCheckoutWrites` recognises the literal
`HEAD` as the one tree-ish that writes nothing an agent could not have obtained by
leaving the file alone. The second denies.

Should `restore` learn the same exception?

Measured, real guard subprocess, one fresh project per case, and pinned in the unit
suite as `MEASURES: checkout and restore still disagree at HEAD (260804-1348, open)`:

```
ALLOW   git checkout HEAD -- rules/x.md
block   git restore --source=HEAD rules/x.md
block   git restore --source HEAD rules/x.md

block   git checkout HEAD~1 -- rules/x.md      # the two agree everywhere else
block   git restore --source=HEAD~1 rules/x.md
ALLOW   git restore rules/x.md                 # restores from the INDEX — a third operation
```

## Why it was not simply done in Step 3

Two reasons, and the second is the load-bearing one.

**The architectural cause is real.** `restore` is discriminated by `mutatesOnlyWhen`,
which receives the flag TOKEN and nothing else. It sees `--source=HEAD` whole and could
in principle inspect the value, but it never sees the value of the separated
`--source HEAD` at all — `writtenOperands` consumes it as a `valueFlags` value before
any predicate is offered it. `checkout` takes its source as a POSITIONAL, which
`positionalModel` sees in every spelling. So `restore` cannot carry the exception
uniformly with the mechanism it has; closing the disagreement means moving its
discrimination to a `positionalModel`-style hook.

**And the change NEWLY ALLOWS a command.** That would be the first newly allowed
command in this Circle. Every Turn has held the line that no command newly allows and
no path protected today becomes unprotected, and the plan restates it as one of three
constraints inherited by every step. A step cannot take that decision on the plan's
authority; `260804-1323` had to argue `checkout HEAD`'s inertness from measurement, and
`--source=HEAD` needs the same argument made for it rather than inherited by analogy.

## Options

1. **Leave the asymmetry and document it.** Say in the rule file that `checkout` and
   `restore` agree for every named source except the literal `HEAD`, that
   `git restore --source=HEAD <path>` denies where `git checkout HEAD -- <path>` allows,
   and why. Replace "Now they agree", which is falsifiable as written.
   - Pros: no new allow. The suite already pins the pair, so the asymmetry cannot drift
     silently. An agent that meets the deny has a documented way through that is one
     spelling away (`git checkout HEAD -- <path>`), and it is the spelling the rule file
     already promises everywhere.
   - Cons: the guard treats one operation two ways, which is `260804-1026`'s original
     complaint surviving at exactly the spelling the revert promise is about. A reader
     who knows the two commands are equivalent meets a deny with no cause visible in it.
2. **Teach `restore` the same `HEAD` inertness**, by moving its discrimination off
   `mutatesOnlyWhen` onto a model that sees the flag's value in both spellings.
   - Pros: one rule for one operation. The disagreement closes rather than being
     explained. The revert strategy becomes spelling-independent, which is what an agent
     reading either rule file would expect.
   - Cons: it newly allows `git restore --source=HEAD <protected>` and
     `git restore -s HEAD <protected>`. "Inert" has to be argued for `--source=HEAD` the
     way `260804-1323` argued it for `checkout HEAD` — and the argument has a wider
     surface here, because `-s`, `--source` and `--source=` are three spellings and the
     set of tree-ish spellings denoting the current commit is already documented as OPEN
     (`@`, `HEAD~0`, `HEAD^0`, `refs/heads/<branch>` all deny on the `checkout` row, on
     purpose).
3. **Close it in the other direction** — deny `git checkout HEAD -- <path>` too.
   - Named only to be ruled out. It breaks fusion's own revert strategy, which
     `rules/protected-path-discipline.md` promises to every agent in every consuming
     project and which the orchestrator uses to undo an out-of-scope edit. The unit
     suite carries it as `THE REVERT STRATEGY MUST STAY ALLOWED`.

## Constraints

- Whatever is chosen, the false claim has to go. `decisions/260804-1323` says the
  `checkout` model "makes the two spellings of one operation agree" and
  `rules/protected-path-discipline.md:89` says "Now they agree". Both are falsified by
  the `HEAD` row and are corrected by Step 7 either way.
- Option 2 is a security-boundary widening and belongs at the Human Gate, not in a
  coder step. The plan's Step 3 assigns `260804-1348` to a code pass; that assignment is
  wrong for this half of the issue and is recorded as such on the issue.
- The pinning tests exist under either answer. They assert the CURRENT verdicts and cite
  this record, so option 2 lands as a deliberate test flip rather than a silent one.

## Recommendation

Option 1 for this Circle, and say so where the reader meets it rather than only here.
The cost of the asymmetry is one documented sentence and a deny whose way through is a
command the reader is already told is always allowed; the cost of option 2 is the
Circle's one invariant, spent on an ergonomic gain, in a Circle whose ship is gated on
five security-boundary questions already. If option 2 is wanted, it is a clean first
step for a later Circle, where the inertness argument can be made at the length
`260804-1323` needed.

---
Answered:
Implemented:
Deferred:
Superseded by:

## Answer

**Option 1: `restore` does not learn the exception. The asymmetry stays and is documented.**

Chosen by the user, 2026-08-04, as this record recommended.

`git checkout HEAD -- <path>` allows and `git restore --source=HEAD <path>` denies, for the
same operation. The way through the deny is a command the rule file already tells every agent
is always allowed, so the cost is one documented sentence rather than a blocked workflow.

Option 2 would have made a command **newly allow**. No Turn in this Circle has done that, and
it is the property every boundary claim here rests on. Spending it on an ergonomic gain, in a
Circle whose ship was gated on five security-boundary questions, is the wrong trade at the
wrong time.

**The obligation:** the asymmetry must be stated where a reader meets it, not only here. An
agent that hits the `restore` deny and does not know `checkout HEAD` is the sanctioned
spelling will rephrase, and rephrasing past a deny is the behaviour the rule file forbids.
Step 7 owns the sentence, and it names the allowed form explicitly rather than describing it.

If option 2 is ever wanted it is a clean first step for a later Circle, where the inertness
argument can be made at the length it needs. The unit suite pins the current divergence with
a `MEASURES:` case, so it fails the day that Circle lands.

---
Answered: this record, `## Answer` — user chose option 1; the asymmetry costs a sentence, closing it would cost the no-new-allow property.

---
Implemented: 98c9363 — option 1 is documentation-only, and the sentence landed: the `restore`/`checkout` asymmetry is stated where a reader meets it, with the allowed spelling named in as many words (`git checkout HEAD -- <paths>`) in `rules/protected-path-discipline.md`'s git-row section and `README-hooks.md:180`; the unit suite pins the divergence with a `MEASURES:` case. Walked `_a_` → `_i_` by the reconciler at the final Circle reconciliation 260805-2323.
