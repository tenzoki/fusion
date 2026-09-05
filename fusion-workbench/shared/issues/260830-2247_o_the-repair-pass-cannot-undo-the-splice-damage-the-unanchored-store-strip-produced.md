# The repair pass cannot undo the splice damage the unanchored store strip produced

---
A project that ran the sweep before the left anchor landed carries citations with a path
fragment glued to the stamp. The `--repair` pass has three classes and none of them covers
that shape, so the only way back is the project's own git history.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## The defect

The store-prefixed patterns carried no left boundary until `cbc1d9fb`, so the sweep matched a
store name inside a longer word and behind a foreign path, and spliced the storeless basename in
while leaving everything to the left of the store segment standing. Two shapes result: a stamp
with a word fragment fused to its front, and a stamp under a foreign path that was never a
workbench path.

Both are worse than a dead citation. They are wrong, and they are invisible: the bare-record
pattern refuses a stamp preceded by a letter or a slash, so nothing reports them afterwards.

## Why `--repair` does not reach them

`hooks/citation-sweep.ts` documents its repair classes in its own header, and there are three:
`date-field`, a head field whose value was rewritten into a self-citation; `chained-tail`, a
basename with a marker tail chained onto it; and `doubled`, the word-marker case of the second,
counted apart. Every one of them keys on a token that *begins* at a stamp and has acquired a
suffix. The splice damage is the opposite shape: the token begins somewhere to the left of the
stamp and has acquired a **prefix**, which no class matches.

Read against `hooks/citation-sweep.ts` at `5907b4ae`, not inferred from the plan.

## Who is affected, and what they can do today

Any project that ran `bin/fusion-citation-sweep --write` at v10.20.0 or earlier over a tree
carrying such paths. The consuming project that reported the original defects measured 468 sites
of the vulnerable shape; whether all 468 were rewritten is **not measured here** and would have
to be read off that project's own tree.

The way back is that project's git history, which the sweep's own guard (a) guarantees exists: a
writing run refuses unless the workbench is tracked and clean, so the damage is always exactly one
revert or one diff away. That is a real remedy and it is why this is filed rather than treated as
data loss.

## What an answer would have to decide

Whether a fourth repair class is even decidable. The pass would have to recognise a prefix that
should not be there, and "should not be there" is a claim about a path the token no longer records.
A fragment such as `my` before a stamp is decidable, since no legitimate rooting ends in a letter
run; a foreign path segment is not obviously so, because the enumeration of legitimate rootings now
in the grammar could be used to reject the rest, and that may or may not be sound over a tree the
sweep has already rewritten twice. `rules/critical-stance.md` §4 applies: if the question is not
decidable from the text, the answer is a change of mechanism, and "restore from git" may simply be
that mechanism.

## Acceptance

Either a repair class that reverses the splice, with the decidability argument stated, or a
written decision that git is the remedy and the documentation says so where somebody about to run
`--write` will read it.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open on both branches of its acceptance.

`hooks/citation-sweep.ts` still documents and implements three repair classes and no fourth: the
`Repair` tuple at `:486` types the class as `"date-field" | "chained-tail" | "doubled"`, `repairsOn()`
at `:495` produces only those, and the header's repair section at `:214-232` names the same three.
Every one keys on a token that begins at a stamp and has acquired a suffix; nothing reads a prefix.

The second branch is unmet too. No decision record anywhere in the workbench answers this question —
the shared decisions store holds nine open records and none of them is about the splice — and the two
places a person about to run `--write` reads say only what guard (a) already buys in general: the
script header at `bin/fusion-citation-sweep:21` and `:55`, and the same sentence in
`docs/upgrading-to-v10-20.md`. Neither names the splice shape, and neither is a written decision that
git is the remedy for it.
