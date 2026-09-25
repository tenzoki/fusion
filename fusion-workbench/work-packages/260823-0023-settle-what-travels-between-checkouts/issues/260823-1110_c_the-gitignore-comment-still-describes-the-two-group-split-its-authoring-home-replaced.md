The `.gitignore` comment still describes the two-group split its authoring home replaced

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `.gitignore:64-68`
**Cross-references:** plan step 2 in `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`; `rules/workbench-tracking.md`

---

## What is wrong

The `fusion-workbench` block's comment reads:

```
# Tracked does not mean all of it:
# the root-anchored surfaces split into records, which are kept, and live state, which
# only ever produces diff noise and — restored by a checkout — a lie about a session
# that ended. The split and its two consequences, one binding the lifecycle skills and one
# binding any command that sweeps the tree, are stated in rules/workbench-tracking.md,
# which is their authoring home.
```

Commit `21ae170` rewrote that authoring home from the two-group record-versus-live-state split into a four-class partition, and commit `00ce4f0` edited this same block one commit later without touching the description. The comment now cites a file that no longer defines what the comment says it defines.

Two smaller things travel with it. "The split and its **two** consequences" still holds, because `rules/workbench-tracking.md` `## Two consequences` kept both. And `.gitignore:70` calls `.guard-state/events.jsonl` "a record too", which is the same retired vocabulary; that half is filed separately as part of the tiling record, since it is one correction in two files.

## Why it matters at all

The comment's stated readers are a human writing a consuming project's `.gitignore` and anyone auditing this repository's own configuration. Both are sent to a rule file to learn a split it no longer states. The `KEPT:` line beneath it is now correct and names the three tracked entries exactly, so the block's operative half is right and only its explanation is stale.

## Verified

Read at HEAD `2f1e3a6`. `git ls-files fusion-workbench | awk -F/ 'NF==2'` returns `.asset-provenance`, `.fusion-setup` and `orchestrator-events.jsonl`, matching the `KEPT:` line and classes R2 and R3 exactly.

## Direction, not a prescription

Rewrite the two sentences in the four-class vocabulary: what git carries is R1, R2 and R3, what stays in the checkout is L, and this repository applies that partition. Keep the two-consequences pointer as it stands.

---

Resolved: 2026-08-23 by coder. The `fusion-workbench` block's comment in `.gitignore` was rewritten
in the four-class vocabulary: `rules/workbench-tracking.md` partitions every root-anchored entry
into four classes, git carries R1, R2 and R3, class L stays in the checkout that wrote it, and this
repository applies exactly that partition — so every path excluded below the comment is class L.
The two-consequences pointer was kept, as the record directed. The `KEPT:` line was correct and is
untouched.

The guard event log sentence at what was `:70` was corrected in the same pass, per the direction in
`260823-1110_*_the-guard-event-log-falls-in-no-class-of-a-partition-that-claims-every-entry-falls-in-one.md`:
it now reads class L like the rest of that directory, with the rolled copy under `archive/` named as
an ordinary class R1 archived file. The word "record" no longer appears for either.

**Measured.** `.gitignore` is on no bounded surface. Net +163 bytes, 3 470 -> 3 633.

**Files:** `.gitignore`. Uncommitted at the time of writing; the orchestrator commits.
