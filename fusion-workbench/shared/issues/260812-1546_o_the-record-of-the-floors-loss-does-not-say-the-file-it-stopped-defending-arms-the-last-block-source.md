The record of the floor's loss does not say the file it stopped defending arms the last block source

---
`hooks/lib/config.ts:125-133` is the record of what the self-protection floor's removal cost:

> There is no effective list to append to now, so nothing in the guard defends this file from an
> agent. What bounds that is what always bounded the pre-existence gap the floor never covered: the
> file is git-tracked, so a change to it appears in a diff.

Both sentences are true and the reach is understated. `fusion-guard.json` is not only a file an
agent can now edit; it is the file that arms CHECK 3, which after this removal is the guard's only
source of a block. So an agent can turn the last block source off, and the stated bound — a git diff
— is a bound a human has to read after the fact, not one that stops the write.

Measured in step 10's acceptance run against a scratch consuming project, in three steps against the
shipped `hooks/dist`:

    Edit <root>/src/api/service.ts        ->  block   (categorySensitivity.api = "high")
    Edit <root>/fusion-guard.json         ->  allow   (the agent rewrites it to "low")
    Edit <root>/src/api/service.ts        ->  allow

The same run confirmed the loss in its other two shapes: an `Edit` of `agents/coder.md` and a shell
write to `rules/x.md` both landed and neither was written back.

---
**Witness:** coder, step 10 acceptance run, scratch project at `/private/tmp/fusion-accept-260812/proj`
**Severity:** low — the loss itself is decided and accepted; this is about the record of its reach,
which is input to a live decision
**Affected:** `hooks/lib/config.ts:125-133`; the same understatement is carried by
`templates/fusion-guard.json` `_gitTracked` and by the `README-hooks.md` per-project configuration
section, both rewritten from the same argument in steps 8 and 9
**Cross-references:**
`shared/decisions/260812-1232_o_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`,
`circles/260801-1244-guard-rules-write/decisions/260802-1912_i_does-the-self-protection-floor-apply-before-the-config-file-exists.md`,
`shared/history/260812-1546-coder-acceptance-run-against-a-project-that-is-not-this-repository.md`

## Why a defect rather than a note

The floor's removal was decided with its cost stated, and this does not reopen it. What is filed is
that the three surfaces recording the cost each describe it as "an agent can edit the configuration
file" and none says "and that file is what arms the only check that can still block". The open
decision about whether the escalation counter survives a block source that ships inert is being
weighed on how live CHECK 3 is; that weighing should have the fact that CHECK 3 is armed from a file
the guard no longer defends.

The fix is prose in three places, not code. Whether the floor should come back for this one file is a
different question and is not asked here.
