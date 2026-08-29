# Should the branch policy stop predicting from command text and measure HEAD instead?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator (at the user's challenge, Rebalance / revise Grounding)
**Cross-references:** `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md` (the precedent, and the binding decision `rules/critical-stance.md` §4 was written from); `260809-2300_*_the-arithmetic-command-span-is-recognised-only-after-a-blank-so-if-and-for-defeat-it.md`; `260809-2044_*_...`, `260809-1110_*_...`, `260809-1111_*_...`, `260809-1548_*_...`, `260809-1226_*_...` (the five patches of session 260809-1725-orchestrator-session.md); `260809-2255_*_the-branch-policy-verification-left-an-active-halt-...`

---

## Question

`rules/critical-stance.md` §4 records what fusion learned in v6.0.0: deciding from the *text*
of a shell command which files that command will write is undecidable, 12 923 lines were built
against it carrying 21 documented residuals, and the answer was not a better classifier but a
change of mechanism. The guard now fingerprints the protected paths before the tool call and
again after it. A decided question replaced a predicted one.

The branch policy was not part of that change and still predicts. It reads the command text and
answers "will this move HEAD?" — the same question shape, over the same undecidable input, in
the same file that used to hold the other classifier.

**This session is the evidence that the price is being paid again.** Five patches landed against
that classifier in one afternoon, each closing a measured entrance and each revealing the next:

| Commit | The entrance it closed |
|---|---|
| `15eacb0` | the command word compared case-sensitively on a case-insensitive filesystem |
| `69a2d00` | a heredoc body segmented into candidate commands |
| `378b80a` | an attached-value global option consuming the following word |
| `6fae676` | six spans where bash suspends its tokenizer and `<<` is not a redirect |
| — | `if((1<<2))`, `for((`, `while((`, `until((`, `elif((`: the same span, one blank earlier |

`6fae676` explicitly went looking for the class rather than the instance, found six members
where the record named two, and argued the set. The reconciliation then found a seventh
entrance to the same span. That is not a failure of care. It is what §4 says happens when the
question has no cut.

**Two further observations from the same afternoon**, both of which say the mechanism rather
than the implementation:

- The 24 consecutive blocks that left the guard halted came from the agents' own verification
  commands. The classifier denied the attempts to measure it.
- `9db884c` and `97d5846` rewrote the rule text twice, because the honest description of what
  the classifier guarantees kept changing under it. `rules/git-branch-discipline.md` now carries
  a paragraph naming six tokenizer spans, and `## Why` concedes that a hidden verb (`eval`,
  `bash -c`, a `case` arm, a function body, a command word arriving as an expansion) is not seen
  at all.

## Options

1. **Measure HEAD, the way protected paths are measured.** Record the state before the tool call
   and again after it: `git rev-parse HEAD`, the symbolic ref, and the worktree list. A change
   is *observed*, not predicted, so the route to it does not matter — `eval`, `bash -c`, a
   script, an alias, a shape nobody enumerated.
   - Pros: it is the precedent, already implemented in `hooks/lib/protected-snapshot.ts` and
     `hooks/tracker.ts` for the other half, so this is reuse rather than new machinery. It ends
     the patch series, the residual catalogue and the rule text that keeps going stale. It closes
     the hidden-verb hole the current rule admits it cannot see.
   - Cons: after the fact. The switch happens and is then undone, exactly the price
     `rules/protected-path-discipline.md` `## What the measurement costs` already states for the
     other half. Restoring HEAD is well defined (the previous ref is in hand and no commit is
     lost), but it is a heavier action than restoring a file's bytes, and a restore that fails
     midway needs its own answer.
2. **Keep the classifier and keep patching.** The status quo.
   - Pros: nothing to build; the deny arrives before the switch rather than after it.
   - Cons: this session priced it. Five patches, a sixth entrance open, a rule text rewritten
     twice, and a halt caused by the classifier refusing its own verification.
3. **Measure, but report only.** Observe the movement, raise the halt, do not restore.
   - Pros: no restore semantics to get right; the human decides.
   - Cons: an agent that switched branches keeps working on the wrong branch until somebody
     reads the halt, which is the branch-drift chaos the policy exists to prevent.
4. **Drop the branch policy from the hook entirely** and leave the `settings.json` deny rules.
   - Pros: honest about what a text classifier can do; removes the surface.
   - Cons: those rules cannot express the `git checkout` nuance (the file-restore form must stay
     allowed), which is the reason the hook took the job in the first place.

## Constraints

- Whatever is chosen must keep `git checkout HEAD -- <files>` working: it is fusion's own revert
  strategy, used by the orchestrator on every failed task.
- The two env overrides (`FUSION_ALLOW_BRANCH_SWITCH`, `FUSION_ALLOW_WORKTREE`) are a user
  surface and must survive in some form.
- A worktree add moves no HEAD in the current tree, so option 1 needs the worktree list in the
  fingerprint, not only the ref. This is stated because it is the one place where "measure HEAD"
  is not sufficient on its own.
- `rules/git-branch-discipline.md` is written against the current mechanism throughout. Any
  answer other than option 2 rewrites it, and this time it should be written once, after.

## Recommendation

Option 1. The precedent is exact, the machinery exists, and the argument that settled the write
classifier applies here word for word: the question is not decidable from the inputs the
mechanism has, so what changes is the mechanism and not the approximation.

Two things worth deciding with it rather than after it. Whether the restore is automatic or the
halt is enough — option 3 is the weaker sibling of option 1 and the choice between them is about
how much an agent can do on a wrong branch before a human reads the message. And what happens to
the five fixes this session landed: they are correct as far as they go, and under option 1 most
of the classifier they correct stops being load-bearing.

**What should not happen is a sixth patch.** `260809-2300_*_the-arithmetic-command-span-is-recognised-only-after-a-blank-so-if-and-for-defeat-it.md` stands open and should stay open until
this is answered, rather than being closed by the next entrance-specific fix.

---
Answered: 2026-08-09 by the user, at the gate this record was filed for. **None of the four
options as written — the branch policy is deleted outright, and so are the `settings.json` deny
rules option 4 would have kept.** The reasoning is this record's own, taken one step further than
its recommendation: option 1 keeps a policy whose measured true positives, across the whole
history, nobody recorded, and pays for it with restore semantics for HEAD that the record itself
flags as needing their own answer. A mechanism with no recorded catch is not worth re-engineering;
it is worth removing. The constraint that the two env overrides "must survive in some form" falls
with the policy they override — there is nothing left to permit.

The recommendation (option 1) is left standing above, unedited, because it was the right reading
of the four options on the table and the user's answer is a fifth. A reader comparing them should
see both.

Consequences accepted with it, stated so nobody has to rediscover them:
- an agent CAN now switch branches, and nothing in fusion stops it. The Human Gate for a task
  that needs a different branch is gone from `agents/orchestrator.md` with the rest.
- `git checkout HEAD -- <files>`, the constraint that shaped the classifier, is unconditionally
  allowed now — it was the one thing the policy had to be argued into permitting.
- `260809-2300_*_the-arithmetic-command-span-is-recognised-only-after-a-blank-so-if-and-for-defeat-it.md` (the seventh entrance) and the five patches of session 260809-1725-orchestrator-session.md are moot: the
  code they corrected no longer exists.
Implemented: 7598073 — `feat(hooks)!: the branch policy is deleted, and skill files stop being protected` (2026-08-09 23:51) removes `hooks/lib/git-branch-guard.ts`, `hooks/lib/shell-parse.ts`, `hooks/lib/command-word.ts` and their four test/fixture files. Verified at `ed87d87`: none of the three source files exists, and `git log --diff-filter=D` names 7598073 as the deleting commit.
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
