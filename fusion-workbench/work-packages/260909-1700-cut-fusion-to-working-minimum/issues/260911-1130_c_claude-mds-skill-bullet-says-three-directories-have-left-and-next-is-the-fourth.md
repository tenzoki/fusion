CLAUDE.md's skill bullet says three directories have left and next is the fourth
---
The skill-bodies bullet names `revise-claude-md`, `unlock` and `direct` as the departed directories and counts them as three. `skills/next/` was deleted in this same release and is named nowhere in the file. No lint sees it, because the bullet's own invariant is keyed on `/fusion:` tokens and there is no `/fusion:next` token left to resolve.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `115be68d` (the pipeline collapse that deleted it); `rules/critical-stance.md` §5

**Measured at HEAD `1d6103c4`.** The directory set moved by exactly four entries against `v10.26.0`:

```
$ diff <(git ls-tree -d --name-only v10.26.0 skills/ | sed 's|skills/||') \
       <(ls -1d skills/*/ | sed 's|skills/||;s|/$||')
2a3
> check
6d6
< direct
12d11
< next
13a13
> reconcile
```

`CLAUDE.md:21` carries *"Three directories have left."* and then names three. `check` and
`reconcile` are both named in the same bullet, so the arrivals are accounted for; `next` is named
nowhere in the file.

**Why the lint cannot see it.** The bullet states its own gate: *"the lint reads every such token,
fails on one that names no directory, and asserts the match in the other direction too."* Both
directions are over `/fusion:<name>` tokens. `next` left and its token left with it, so the forward
check has nothing to resolve and the reverse check has no directory to demand. The count beside the
list is the only statement of the cardinality, and §5 is what it violates: a number beside a list is
a second copy of the list's length.

**Acceptance.** The sentence names four and names `next`, or it drops the numeral and names the
members. Either way `/fusion:next` stays unwritten, so the lint stays green for the reason it
already is.

---
Resolved: the bullet names four departed directories with `next` among them, cited to `2a785ba2`, and the "Neither name" clause that carried a cardinality of two over the list is gone with it. Applied as candidates L02 and L03 of the curator run `260911-1218-curator-run.md`, ruled by user, Kai Stalmann <ks@qantr.com>.
