# Does fusion ship a `LICENSE` file, or does the installer's copy list stop naming one?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `circles/260801-1244-guard-rules-write/issues/260805-1839_*_install-sh-will-eine-license-kopieren-die-das-repo-nicht-hat.md`; `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_*_the-installer-copy-list-names-a-license-file-the-tree-has-never-shipped.md`; plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-license)

---

## Question

`install.sh` copies `LICENSE` in its asset loop, behind an `[ -e ]` guard that swallows the miss silently. No `LICENSE` has ever been committed to this tree, while `.claude-plugin/plugin.json` declares `"license": "MIT"`. The two referring records agree on the measurement and agree that the fix is not theirs to choose: adding the file and dropping the entry are not equivalent, because this is a project installed by `curl | bash` from a public GitHub tarball, so what licence text ships is a distribution question. Both records have stayed open across three reconciliation passes for want of an answer, and this Circle refers them here so the question has a home while the defect records close.

## Options

1. **Add a `LICENSE` file carrying the MIT text** — makes `plugin.json`'s declaration true, makes the copy-list entry live, and both install paths then ship licence text.
   - Pros: the manifest and the tree agree; a public installer distributes a licence, which the second record names as the thing an MIT-declared plugin currently fails to do.
   - Cons: choosing the licence text is the user's act, and no agent may perform it; the MIT declaration in the manifest was never itself decided on record.
2. **Drop `LICENSE` from the copy list** — the loop stops claiming a file the tree does not hold.
   - Pros: one-line edit; the list no longer lies, which is the standard the loop was rewritten to on 2026-08-15 when `settings.json` left it for being inert.
   - Cons: the `"license": "MIT"` declaration stays unsupported by any text in the tree; a user installing from GitHub still receives no licence.
3. **Drop the manifest declaration as well as the entry** — the tree claims no licence anywhere until the user chooses one.
   - Pros: no surface asserts something the tree does not carry.
   - Cons: an unlicensed public repository is a stronger claim than an MIT one, and removing the declaration is as much the user's decision as adding the text.

## Constraints

- The licence choice, and whether the project ships one, is the user's; no agent answers it (both referring records, in the same words).
- Whichever option lands, the copy loop in `install.sh` must not name a file the tree does not ship: `CLAUDE.md` `### HTTPS installer` states the loop is the authority for what ships, and the 2026-08-15 rewrite set the standard that nothing in the tree looks like it ships something it does not.
- `CLAUDE.md` no longer restates the copy list (discharged at reconciliation 260819-1453), so the answer touches `install.sh` and possibly `.claude-plugin/plugin.json`, nothing else.

## Recommendation

None. Neither referring record gives one, and both say the question is the user's.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Deferred: a later Circle that meets the question again — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
