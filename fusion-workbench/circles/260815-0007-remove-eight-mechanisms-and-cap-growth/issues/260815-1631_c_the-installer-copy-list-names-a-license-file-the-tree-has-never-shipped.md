The installer copy list names a `LICENSE` file the tree does not ship, and `CLAUDE.md`'s copy of the same list omits it

---

`install.sh:80` copies `LICENSE`. No `LICENSE` exists at the repo root, and `git log` finds none
ever committed. `.claude-plugin/plugin.json` declares `"license": "MIT"` with no license text
anywhere in the tree. `CLAUDE.md:106` restates the same copy list and does **not** include
`LICENSE`, so the two enumerations of one list disagree.

---

## Evidence

`install.sh:79-82` at HEAD, after step 12 removed `settings.json` from it:

```sh
for item in .claude-plugin agents skills rules hooks bin stilwerk templates docs \
            README.md README-agents.md README-hooks.md LICENSE; do
  [ -e "$SRC/$item" ] && cp -R "$SRC/$item" "$INSTALL_DIR/"
done
```

`git ls-tree --name-only HEAD` at the root:
`.claude-plugin .gitignore CLAUDE.md README-agents.md README-hooks.md README.md agents bin docs
fusion-guard.json fusion-workbench hooks install.sh rules skills stilwerk templates`. No `LICENSE`.

`CLAUDE.md:106`: *"The installer copies plugin assets (`.claude-plugin agents skills rules hooks bin
stilwerk templates docs README*.md`)"* — twelve names to install.sh's thirteen.

## Severity and why it is filed here

Low, and **pre-existing** — the entry predates this Circle. It is filed against this Circle rather
than `shared/` because step 12 rewrote that exact `for` list and the comment above it, on the
premise stated in the commit message that nothing in the tree should look like it ships something it
does not. `settings.json` was removed from the list for being inert; `LICENSE` is the same class,
one word to its right, in the same three lines.

Nothing breaks: the `[ -e ]` guard makes the entry a no-op, which is why it has survived. The
consequence is that an MIT-declared plugin distributes no license text on either install path.

## Two things this record does not decide

Whether the fix is to add a `LICENSE` file (making `plugin.json`'s declaration true and the copy
entry live) or to drop the entry (making the two lists agree and leaving the declaration
unsupported) is a licensing question, not an installer one. And whether `CLAUDE.md`'s bullet should
mirror the list verbatim or stay a summary is the same class as the two stale inventory rows already
filed at `260815-0803_*_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md`
— cross-referenced, not duplicated.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Primary half stands; the second-enumeration half is discharged.**

```
install.sh:83-84
  for item in .claude-plugin agents skills rules hooks bin stilwerk templates docs \\
              README.md README-agents.md README-hooks.md LICENSE; do
ls LICENSE  → No such file or directory
```

**Discharged:** `CLAUDE.md:108` no longer restates the copy list — it now names the loop itself as the authority — so the two-enumerations-disagree half is gone.

**Standing:** the loop still copies a `LICENSE` that has never existed, silently, behind its `[ -e ]` guard, while `.claude-plugin/plugin.json` declares `"license": "MIT"`. That mismatch is the distribution question the record names and no agent may answer it.

**Filed twice.** `circles/260801-1244-guard-rules-write/issues/260805-1839_*_install-sh-will-eine-license-kopieren-die-das-repo-nicht-hat.md` states the same defect from the same measurement ten days earlier, in another Circle, and is also open at this pass. Both are cross-annotated; whoever fixes the line closes both.

---
Resolved: referred (decision) — the second-enumeration half is discharged above; whether fusion ships a LICENSE or the installer stops naming one is the decision's question; circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_does-fusion-ship-a-license-file-or-does-the-installer-stop-naming-one.md
