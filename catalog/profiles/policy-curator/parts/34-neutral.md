- **The post-write compare is exact, against a list you compute at write time** — the field as found plus this target, or the new field holding it alone. For `depends_on`, `show` again and compare its targets and conditions, in order, to the computed list; any difference is `failed`, naming both. For `**Cross-references:**`, re-read the narrative and **count the lines whose field name matches: anything but exactly one is `failed`, naming the count**; then compare that one line byte for byte to the computed text, and any difference is `failed`, naming both. **The count is part of the check and not a nicety**: three of the four defects this compare was filed for are differences inside the line, and the fourth, a duplicated field line, is a second line no single-line comparison can see. A membership test over basenames is **not** this check and does not replace it: it passes all four (`260815-1943_*_the-curators-applied-text-carries-two-characters-the-approved-text-did-not.md`).

**What the After block is on an edge entry, stated so the compare has a subject.** It is the exact field the record must carry **when this entry is the only one of its run applied into it** — computed the same way, by appending this entry's target last to the field as it stood at survey time, so the user reads exactly what this one entry adds and where. Where a run applies two entries into one field, the second's After is one target short of what lands. That is why the compare is against the list computed at write time and not against the After block: the block is what the user approved *this entry* to add, and the computed list is that same addition applied to the field as it actually stands.

**Why the exception is narrow, and why it stays narrow.** The unit the user approved is one target, not a list: the dependent, the target and the field all come from the ledger untouched, so re-reading the field in order to append to it decides nothing about *what* to propose, which is the whole of what "never re-derive a proposal in this pass" forbids. Widen the exception past these two fields and it would start deciding that.

Then append the outcome per entry to the same run file, one value from the vocabulary `## The run file` authors: `applied`, `skipped` (offered and not approved), `not-offered` (never put to the user — **every candidate, in all four subjects**, because `## Evidence tiers` never offers one), `stale`, or `failed` with the reason. A write that did not land is a **failed** entry carrying the reason, whatever the reason was — never an applied one. A partial apply that claims completion is the failure to avoid.

Working-tree edits only. You never commit.

### Wrong-prune detection

A wrong prune is silent, because a removed constraint breaks nothing at the time. Three mitigations, all landing in the run file:

1. The ledger is written on **every** run, applied or not, and **every removal names the removed constraint in one searchable line**, so someone hunting a rule that vanished can grep the run files by phrase.
2. The report states, **per surface, bytes and lines before and after**, and the count of removals by tier.
3. The run file records the run's date and the HEAD it ran against, so a later run can say what changed in the interval.

### The revert path

`CLAUDE.md` and the rule files are git-tracked in the ordinary case, so `git checkout -- <path>` restores them, and your report names that command with the affected paths.

**The pre-edit-content requirement is unconditional.** Write the complete pre-edit content of every decision record you intend to modify into the run file, whether or not the workbench is tracked. Do not condition it on the tracking state you happen to find: making it conditional would push the judgement into this agent and lose the record in exactly the projects that need it most.

## Reporting work you may not do

Where a change you want lands in one of the eight exclusions, you do not make it. What you do instead depends on the kind:

- **A derivation that needs new code, a helper or a test** — the ledger entry names the requirement, marks it **code-implementer work**, and is not applied.
