# Which identity does an attributed record carry, when the transport is git?

---
**Domain:** code
**Filed by:** shaper
**Cross-references:**
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (capability C3, which specifies `$USER` as the default and names this record as the residual);
`skills/memo/SKILL.md:38` (the existing mechanism, `echo "$USER"`, and the one place a person already appears in a fusion filename)

---

## Question

The user's answer at the round-2 gate was full attribution: every record says which person wrote it. fusion has exactly one identity mechanism today, `$USER` read from the environment by `/fusion:memo`, which names the memo and task files `memos-<username>.md` and `tasks-<username>.md`.

The transport, though, is git, and git carries a different identity: `user.name` and `user.email`, which is what every commit in the shared history is signed with. A record filed by `k1` and a commit authored by `Kai Stalmann` are the same person, and nothing in the workbench says so.

The question is which of the two a record carries. It matters because the reader of an attributed record is, for the first time, somebody other than the person who wrote it, and an operating-system account name is meaningful to its owner and often to nobody else.

## Options

1. **`$USER` alone.** Reuse the mechanism that exists.
   - Pros: one identity mechanism in fusion rather than two, which is what the reuse norm asks for; consistent with the memo store, the only other place a person is named; available to every agent with no new call.
   - Cons: an account name can be `k1`, `dev`, or `ubuntu`. In a shared history that is close to anonymous, and two people on two machines can carry the same account name.
2. **The git identity, `git config user.name` and `user.email`.** Read from the same configuration the transport reads.
   - Pros: it is the name every other person in the project already sees on every commit, and it is unique per person rather than per account. It joins a record to the commits around it.
   - Cons: a second identity mechanism beside `$USER`, and the memo store keeps the first, so fusion then names a person two ways. It fails in a tree with no git configuration, and it is one more command per record.
3. **Both, in one field.** The account name and the git identity, written together.
   - Pros: the join between the record and the commit is stated rather than inferred; a reader who knows either recognises the person.
   - Cons: the widest field of the three on the surface with the least head-room, and it states two things where a reader needs one.

## Constraints

- The identifier goes in the record body and never in a filename, per the user's condition at the round-3 gate. That holds for every option here.
- The memo store's filenames stay as they are, so `$USER` remains in use whatever is chosen for records.
- Whatever is chosen is written by every agent that files a record, so it must be obtainable with one cheap command and must degrade to something stated rather than to an empty field.

## Recommendation

`inference:` Option 1, on the reuse argument alone, and the spec specifies it as the default so that C3 is not blocked. The argument against it is real and is about readers rather than about mechanism: the whole point of attribution here is that somebody else reads it. If the user's checkouts belong to people whose account names do not identify them, option 2 is the better answer and the cost is one extra mechanism. This is the user's call and should be taken at C3's planning gate rather than before it.

---
Answered:
Implemented:
Deferred:
Superseded by:
