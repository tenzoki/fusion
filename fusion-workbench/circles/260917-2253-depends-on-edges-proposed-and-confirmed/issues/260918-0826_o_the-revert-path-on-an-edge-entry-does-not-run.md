The revert path on an edge entry does not run

---

Every ledger entry states its own revert path, and the user approves with that in view. The edge entries the first run wrote carry a shell substitution over `$WORKBENCH`, which is not exported into any shell; the command fails. The schema's repair bound the `**File:**` line to a basename and pointed at the revert line for the full path, without checking that the revert line could carry one.

---

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0738-curator-run.md, 260918-0821_*_the-edge-exception-removed-the-apply-passs-staleness-check-and-put-nothing-in-its-place.md

## The defect

`agents/curator.md` `### Retiring a rule file is deleting it` makes the obligation unconditional:

> **every ledger entry states its own revert path** … The user approves or rejects with that in view.

`### Ledger entry schema` gives the form as `` `git checkout -- <path>` ``, and the repair at `git:8fad8ead` added:

> Where the full path is wanted as a shell argument it is already on the `**Revert path:**` line.

It is not. A work-item record's path spells a store segment, which is a citation violation on any line the project's citation gate reads, so the run could not write one — and wrote this instead, on both edge entries:

```
git checkout -- "$(find "$WORKBENCH" -name 260917-2253-depends-on-edges-proposed-and-confirmed.md)"
```

`WORKBENCH` is emitted by `bin/fusion-paths` as a `KEY=value` line for an agent to read. It is not exported, and it is empty in a shell the user pastes into. `find "" -name …` finds nothing, and `git checkout -- ""` errors. The failure is loud rather than silent, which is the only good news here: the user learns their revert does not work at the moment they need it.

This is the one subject whose writes land in the user's own record of their work rather than in project text, so it is the subject where the revert line matters most, and it is the only one where the schema's stated form cannot be used.

## Why the obvious fix is not obvious

`git checkout -- <path>` restores a tracked file, and a consuming project's workbench may not be tracked at all — the same section already requires an entry to say in those words where no revert path exists. So the repair is not only a better command; it has to state which case the workbench is in. A form that works in both: `git checkout -- $(bin/fusion-workbench-root)/circles/<container>/<record>` is still a store segment on a line a gate reads, so the citation constraint and the runnable-command constraint collide on this field exactly as they did on `**File:**` — and the resolution taken there, bind the field to a basename and push the path elsewhere, has now run out of elsewhere.

## Acceptance test

The revert path on an edge entry runs as written, pasted into a shell with no fusion environment set, and restores the record. Where the workbench is untracked the entry says so in those words instead. The citation gate stays green on the run file, and the resolution names which of the two demands the `**Revert path:**` line answers, as the `**File:**` line now does.
