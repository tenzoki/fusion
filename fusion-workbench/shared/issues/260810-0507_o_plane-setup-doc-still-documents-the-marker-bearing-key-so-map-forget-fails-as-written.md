# `docs/plane-setup.md` still documents the marker-bearing key, so `map --forget` fails as written

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `docs/plane-setup.md:251`
**Cross-references:** commit `f320db2`

---

## The defect

`f320db2` removed the state marker from the natural key. `docs/plane-setup.md:251` still tells the
user that a sub-artifact is keyed `<circle-dir>::issues/<file>.md`, in the paragraph that instructs
them to run `map --forget`. `<file>` is no longer the on-disk filename — the marker is stripped.

Copying the documented spelling now fails:

```
$ fusion-plane map --forget '260719-1536-demo-circle::issues/260719-1600_o_open-issue.md'
fusion-plane: map --forget: no such key '…' — map not changed
exit=1
```

## Why it is Low rather than Medium

The failure is loud and exits non-zero, and the same paragraph already advises reading the keys off a
`map` dump, which yields the correct form. A user who follows the whole paragraph recovers; one who
copies the key shape from the prose does not.

`docs/` ships to every consumer (`rules/fusion-workbench-conventions.md` `## Project language` lists it
among the exempt surfaces), so this is user-facing documentation rather than an internal note.

## Fix direction

Update the key shape in that line to the marker-free form, and say in one clause that the marker is
deliberately absent so the key survives a state transition — that sentence is the whole point of
`f320db2` and it is the thing a user is most likely to get wrong when hand-composing a key.
