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

---
**Reconciliation 260822-1556 (reconciler, domain `code`, HEAD `9f65463`) — marker unchanged at
`_o_`. No answer exists on disk.**

No record template gained a person field in `370bfc5..9f65463`: the decision-record template in
`rules/fusion-workbench-conventions.md` `## Decision Record Template` is unchanged in the range, and
`$USER` still appears only in the memo store's filenames. Correctly open; the spec states it is due
at C3's planning gate and C3 has not started.

---
Answered: `circles/260824-0530-record-attribution-and-circle-claim/_t_circle.md:15` `## Grounding snapshot` — the user answered in chat on 260824; attribution takes the git identity, the claim takes the git identity plus a locally minted checkout identifier, and none of the three options above is selected.

## Answer (user, 260824)

**The answer is not among the options offered, and it supersedes the option set rather than selecting from it.** The three options above partition by *which identity source* a record should read: the account name, the git identity, or both written together. The answer partitions by *which question is being asked*. Attribution and claim are two questions, they take two different values, and no option above holds that shape, because all three were written as though one value had to serve both. The user rejected all three on one measurement of his own working arrangement: `$USER` is not unique across several instances on one machine, and the git identity is not unique either when one person works from several checkouts or several computers.

**Attribution is the git identity, `user.name` and `user.email`.** Who wrote a record is answered by the identity the transport already signs every commit with. It travels with the work, it is visible beside the record in the history, and it needs no new file.

**The claim is the git identity plus a checkout identifier.** Who holds a Circle is not answered by the git identity, because two checkouts of one person carry the same git identity and the claim would pass. That collision is exactly what the field exists to prevent. The checkout identifier is minted once at Setup, lives in class L of the partition in `rules/workbench-tracking.md`, and therefore never travels, which is what makes it unique by construction.

**No registry.** The user proposed `fusionusers.jsonl`, carrying an alias beside `user@host`, git name and git mail, and then withdrew the proposal himself as too complex. Three costs stand behind that withdrawal. It would be a tracked file with many writers, which is the shape `circles/260823-0023-settle-what-travels-between-checkouts/` spent a full pass reducing to exactly one. A person not yet enrolled in it could file nothing. And an entry goes stale in silence the moment somebody changes a git configuration, which is the failure mode a registry is least able to notice.

**What the user gives up, and knew before agreeing.** A stable alias that survives a changed git address. In a long-lived history that is a real loss, and it was named to him before he answered.

**With no git identity the run halts and reports which value is missing.** Never a substitute value. A tree without `user.email` cannot commit and does not take part in the multi-checkout arrangement at all.

### One correction, measured after the answer was given

While the answer was being taken, the orchestrator told the user that the git identity answers attribution "fully, across machines, because it is the same person". That is true only where every machine carries the same git configuration, and nothing guarantees it.

Measured on 260824 in `/Users/k1/Projects/test`: a repository with **no remote configured** still resolves a full identity, from the global `~/.gitconfig`, so a remote is irrelevant to whether an identity is available. The same measurement showed two addresses for one person already coexisting in this user's environment, a git identity `ks@qantr.com` beside an account address `kai@qantr.com`.

The consequence lands on the claim rather than on attribution. A person working from a second machine whose git configuration differs is read as somebody else, and `/fusion:next` refuses their own Circle. That is a false positive, not a detected conflict, and it is the one failure the refusal cannot tell apart from the collision it is built for. The override in `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C3` clears it: the field then carries both identities, which makes the doubling visible to the next reader instead of hiding it.

**The mitigation chosen is a stated precondition and no mechanism:** the same git identity on every machine a person runs fusion from. Step 6 of `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` writes that sentence into the rule text; this record states that it is the mitigation, and that no code checks it.

---
Implemented: 3ba7a46, 2b055a0, 0a726b5, d34141c, 12b56d1, 9efe19f — the two-value design is on disk: one helper prints the git identity and mints the checkout identifier, the rules take attribution from the first and the claim from both, and four writers fill the fields.

## As realised, 260824

Each hash was checked against its own diff with `git show --stat`, not read off its subject line.

| Commit | What it put on disk | Which half of the answer it realises |
|---|---|---|
| `3ba7a46` | `bin/fusion-identity`, 223 lines. `PERSON=` is read from `git config user.name` and `user.email`; `CHECKOUT=` is read from `fusion-workbench/.checkout-id`, minted there on first read. | Both. It is the one place either value is obtained. |
| `2b055a0` | `rules/fusion-workbench-conventions.md` `### Who filed it`, plus the person half of `**Filed by:**` in the issue format, the decision template and the worked example. | Attribution. The person is the git identity, read from the helper and composed nowhere else. |
| `0a726b5` | `rules/circle-records.md` `### The claim field`, plus `**Claim:**` in the Circle record template. | The claim. The value carries the person and the checkout identifier, and the collision is stated as detected rather than prevented. |
| `d34141c` | `agents/orchestrator.md` `## Circle head fields` gains the two claim rows; `agents/shaper.md` fills both identity fields at creation. | The claim's writers. |
| `12b56d1` | `skills/setup/SKILL.md` Step 0i calls the helper, which is where the identifier is minted. | The mint. |
| `9efe19f` | `skills/next/SKILL.md` refuses a Circle whose claim names another identity, and appends the `Overridden ` sentence on a takeover. | The claim's reader. |

**The correction this record appended after the answer was given is realised as the record itself describes it**, a stated precondition and no mechanism. `2b055a0` writes the same-git-identity-on-every-machine sentence into `### Who filed it`, with the statement that no code checks it and that the false positive it produces is one `/fusion:next` cannot tell from a real collision.

**Two things this line does not claim.** It does not claim the registry was reconsidered: nothing in the range adds one, and `bin/fusion-identity` reads no shared file. And it does not claim the halt rule covers a tree that is not a git work tree at all, which is a separate question answered in this Circle's own store by `circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`.
