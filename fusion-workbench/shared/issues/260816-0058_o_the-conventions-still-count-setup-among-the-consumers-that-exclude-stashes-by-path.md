The conventions still count setup among the four consumers that exclude stashes/ by path, and setup no longer does

---
`rules/fusion-workbench-conventions.md:64` states *"Four consumers exclude `stashes/` — `skills/setup/SKILL.md:67`, `skills/log-activity/SKILL.md:82`, `skills/archive/SKILL.md:96` and `agents/playmaker.md:61` — and all but the archive skill exclude `.migration-v2-backup/` too."* As of 260816 the setup skill excludes neither by path. Its bracket-marker probe no longer walks the whole workbench tree with three `-not -path` flags; it anchors its `find` at `shared/` and `circles/` instead, so all three frozen stores are outside it by construction rather than by exception. The count is three, not four, and the sentence names a mechanism setup no longer has.

---

## Context

Filed while closing `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/260806-0022_c_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` — the scope gap between setup's probe and migrate's reformat pass. The fix narrowed setup's probe to the union of trees migrate actually converts, which subsumes the three exclusions.

`rules/` was outside that task's permitted file set, so the sentence was left as it stands and filed here instead.

**What is still true and must not be lost in the correction.** The same sentence carries a standing instruction: *"Do not read their absence from this tree as permission to drop one: `skills/setup/SKILL.md:60` records what dropping them costs, a Setup that refuses permanently and routes to a migration with nothing to do."* That citation is still valid. `skills/setup/SKILL.md:60` still carries the deadlock history — 1146 matches on one consuming project, all under `archive/` and `.migration-v2-backup/` — and now states the tree bound that replaced the exception list. The paragraph count in setup was deliberately held unchanged so that both line numbers this sentence cites (`:60`, `:67`) still land on the paragraphs they were written against. Only the membership claim is wrong.

**The correction is not merely arithmetic.** Setup dropped the exclusions because a positive tree bound made them unreachable, which is a stronger guarantee than the list it replaced: a fourth frozen store needs no fourth entry. If the sentence is rewritten to say "three consumers", it should also say that the fourth stopped needing the exclusion rather than lost it — otherwise the next reader restores the flags to make the count come out.

**Related.** `shared/issues/260816-0025_o_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md` measures the same four consumers in a table and carries the `skills/setup/SKILL.md:60,67` row. That table needs the same correction, and the two records should be resolved together.

**Route:** normative text over shipped behaviour — `curator`, or an `ontocoder`/`coder` pass that owns `rules/`.
