Setup Step 0i branches on two of the helper's five exit codes, and the reachable fourth has no branch

---
`/fusion:setup` Step 0i handles `bin/fusion-checkout-name` exits 0 and 3, and the missing-helper case. Exits 2, 4 and 5 have no branch, and exit 4 is reachable in an ordinary configuration. The same bullet also mixes two helpers' exit vocabularies without saying which number belongs to which.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. A model reaching an unbranched exit has no instruction and will improvise, which is the failure the exit tables exist to prevent.

**Cross-references:**
`rules/critical-stance.md` §4 (a case split is disjoint and complete);
`260905-0933_*_fusion-checkout-name-discards-the-identity-helpers-stderr-and-names-a-wrong-cause-on-its-exit-1.md` (what exit 4 actually says when it fires).

## Evidence

`skills/setup/SKILL.md:350-358`, the whole of the branch list:

```
- **`exit=3`** — unregistered. Ask **one** question, …
- **`exit=0`** — registered. Bare `register`; act on any `collision=`.
- **No hex** (identity exit 3 or 5) or no `$C` — write nothing, report …
  **No person** (exit 4) — register anyway.
```

- `bin/fusion-checkout-name:53-67` — the helper's table is 0, 2, 3, 4, 5. Three of the five have no branch above.
- Exit 4 is reachable: measured in a git work tree with `user.name` and `user.email` unset, `register` exits 4 (see the cross-referenced issue). The step runs `resolve` first, which cannot reach 4 — but the step then prescribes `register`, which can.
- `bin/fusion-identity` exit 1 has no branch either. `rules/fusion-workbench-conventions.md` `### Who filed it` says exit 1 means halt and file nothing; Step 0h reports it and Step 0i then reads as though registration should proceed.
- The two `exit=` bullets are `fusion-checkout-name`'s codes; the parenthesised `exit 3 or 5` and `exit 4` in the third bullet are `fusion-identity`'s. One list, two vocabularies, no label.

## Adjacent gap in the test file

`hooks/lib/__tests__/fusion-checkout-name.test.ts` covers exits 0, 2, 3 and 5. Exit 4 has no test, and it is precisely the code with no consumer branch.

## Acceptance test

Step 0i names an action for every code `bin/fusion-checkout-name` can return and for `bin/fusion-identity` exit 1, and each bullet says which helper its number belongs to. `fusion-checkout-name.test.ts` gains a case that reaches exit 4.

---
Resolved: the branch list in `skills/setup/SKILL.md` Step 0i now tiles both vocabularies and labels every line with the helper it belongs to. `$C` exit 3 asks and registers, exit 0 registers bare, and exits 2, 4 or 5 — from `resolve` or from `register`, which is where 4 is reachable — write nothing and report `checkout-registry=unread` with the reason the helper gave; no `$C` stays `helper-missing`. `bin/fusion-identity` exit 1 is named as that helper's and carries its halt by citing `rules/fusion-workbench-conventions.md` `### Who filed it` rather than restating it; its 3 or 5 leaves no hex and its 4 leaves no person, as before. No code's meaning changed and no branch was dropped. `hooks/lib/__tests__/fusion-checkout-name.test.ts` gains the exit-4 case the record asked for, reaching it the way an ordinary configuration does — a git work tree with no `user.name` and no `user.email`. The growth bound on `skills/` was paid inside the file rather than by a baseline edit: the step's restatement of the mint and of the asking form was cut, each being already carried by the header of the helper it describes, and the new `bin/fusion-checkout-name` header section `## Two exit vocabularies, and which number belongs to which` carries the reasoning the step now cites instead of holding.
