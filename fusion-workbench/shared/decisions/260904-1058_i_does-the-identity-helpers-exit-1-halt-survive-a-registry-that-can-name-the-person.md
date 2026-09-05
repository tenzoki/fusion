# Does the identity helper's exit-1 halt survive a registry that can name the person?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `#### 1d. Does the exit-1 halt get worse under a registry?`;
`bin/fusion-identity` (the exit table, and the two clauses of exit 1's stated reason);
`rules/fusion-workbench-conventions.md` `### Who filed it` (where the halt binds a filing agent);
`260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md` (the sibling question, answered)

---

## Question

`bin/fusion-identity` exit 1 is a git work tree whose `user.name` or `user.email` is unset. The caller halts, reports, and files nothing. The helper's header gives two clauses as the reason: "A tree that intends to commit and cannot is misconfigured, and a record filed from it would name nobody."

A registry carrying the person breaks the second clause. The record would name somebody. The question is what the halt then rests on, and whether it stays.

## Options

1. **The halt stays, with its reason restated to the first clause alone.** The tree cannot commit, so its records never reach another checkout, and that is sufficient on its own.
   - Pros: no behaviour changes anywhere; the rule text becomes true again; the join from a record's author to the surrounding commits' author, which the whole attribution design rests on, is preserved.
   - Cons: the halt now enforces a git configuration for a reason unrelated to naming, which a reader meeting it will find surprising unless the text says so.
2. **The halt is demoted to a warning where a registry entry names the person.** The run reports the missing git configuration and files with the registry's person.
   - Pros: a tree mid-configuration can still work; the person is named honestly from a source the human wrote.
   - Cons: records get filed that are joined to no commit and look exactly like records that are. Nothing downstream can tell the two apart, and the tree cannot push them anyway.
3. **The halt goes.** The registry becomes the person's authoritative source and git configuration stops being fusion's business.
   - Pros: one identity source rather than two.
   - Cons: two identity sources is what actually results, since `**Filed by:**` on 146 existing records carries the git identity and those are not rewritten. And it withdraws a condition the user chose deliberately on 260824: "With no git identity the run halts and reports which value is missing. Never a substitute value."

## Constraints

- Exit 4 keeps its meaning under every option: a tree that is not a git work tree owes no identity and never halts. That is settled and not reopened here.
- No option may make the halt reachable in a case where it is not reachable today.
- Whatever is chosen, the condition stays evaluated in `bin/fusion-identity` and in no agent prompt.

## Recommendation

Option 1. `inference:` The halt's value was never mainly about the record's text; it is that a tree which cannot commit produces work nobody else will ever see, and a registry does not change that. The change owed is to the sentence in the helper's header and to `### Who filed it`, not to the behaviour.

`speculation:` Option 2 is the one to be careful about. Its failure is invisible by construction: a record naming a person, joined to no commit, is indistinguishable at every reading surface from one that is joined. We have not looked for a mechanism that would notice, and we would want one before recommending it.

---
Answered: 260904-1050-orchestrator-session.md `## Turn 3 — the exit-1 halt gate` — option 1, the halt stays and its reason is restated to the first clause alone; the user answered "1" at the step-9 gate of the plan.

**What step 10 must therefore do:** no behaviour changes anywhere, and no caller gains or loses a halt. What changes is text. `bin/fusion-identity`'s header drops the second clause of exit 1's stated reason, the one about a record naming nobody, which a registry makes false; the reason becomes the first clause alone, that a tree which cannot commit produces records no other checkout will ever see. `rules/fusion-workbench-conventions.md` `### Who filed it` is brought into line with the same reading, so a reader meeting the halt is told what it now rests on rather than being left with a justification the registry has retired.

---
Implemented: 9ffb9911 — option 1 realised as text: `bin/fusion-identity`'s exit-1 reason is cut to the clause a registry cannot falsify, and `rules/fusion-workbench-conventions.md` `### Who filed it` carries the same reading. Behaviour is unmoved, and a test case pins that exit 1 fires exactly where it fires at `cda72f71`.
