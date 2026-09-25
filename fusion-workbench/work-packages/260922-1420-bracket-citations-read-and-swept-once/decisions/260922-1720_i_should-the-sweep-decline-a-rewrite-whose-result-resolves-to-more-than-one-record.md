# Should the sweep decline a rewrite whose result resolves to more than one record?

---
**Domain:** code
**Status:** open
**Filed by:** reviewer (closing pass `49ab50e4..e41e333f`, checkout `5e8248d7`, Kai Stalmann <ks@qantr.com>)
**Cross-references:** commit `23576fe6` (the sweep that raised it); `260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md` (the ruling this executes); `260922-1628_*_the-grammar-reads-the-bracket-marker-and-the-tree-is-swept-once.md` (the plan); `hooks/citation-sweep.ts` `## The visibility guard`

---

## Question

`hooks/citation-sweep.ts` applies a rewrite when the rewritten string re-tokenises whole under the same grammar — the **visibility guard**, `readsBackWhole()`. It does not ask how many records the result resolves to.

For a citation carrying a slug that question never bites: `<stamp>_*_<topic>.md` names one file. For a **slugless** citation it does. A bracket-marked slugless token and its underscore sibling `<stamp>_x_` both become `<stamp>_*_`, and where the workbench holds two or more records on that minute the result matches all of them. `hooks/lib/citation-scan.ts:1727` classes that as `ambiguous`, which `partition()` counts as **undecidable** — so it is not a violation, no `verdict=` reads it, and nothing reports it again.

Should `candidateFor()` / `rewriteOf()` decline such a rewrite and leave the token as written, or is the wildcard the right answer even when it is ambiguous?

## What is measured

Taken at `e41e333f` over the whole workbench, `archive/` included, by resolving every slugless `<stamp>_*_` token against the record index:

- **111** slugless `_*_` tokens resolve to a number of records other than one. Two to fifteen each; the widest is `260805-1842_*_`, which names 15.
- **8** of those were produced by `23576fe6`'s sweep. The other **103 predate it** — they are the standing behaviour of the sweep on underscore markers, not something the bracket package introduced.
- None of the 8 lands in a live record, so `edited-violations=0` holds and no gate moved.

Worked example, in the archived container record of `260717-1638-marker-format-ohne-glob-metazeichen` at line 34: a bracket-marked token on stamp `260716-1910` became `260716-1910_*_`, which now names two records at once, the workbench-umbau plan and the circle-marker decision.

## What did and did not change at the rewrite

**The tool never read the marker letter**, before or after. A lookup of the bracket-marked token returns 0 — no file on disk carries that name — and the wildcard retry is what produced the two matches, which is why the pre-rewrite status was `stale-marker` with two matches and the post-rewrite status is `ambiguous` with the same two. Machine resolution is unchanged.

Two things did change:

1. **A human reader lost the one character that disambiguated.** The marker letter told a reader the decision from the plan; `_*_` does not.
2. **The status moved from reported to silent.** `stale-marker` is a violation the checker prints and counts; `ambiguous` is undecidable and appears in no verdict. A citation that could not be resolved is now a citation nothing will mention again.

## Options

1. **Leave it.** `_*_` is the mandated form (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), the checker's own `fix` string prints "cite the marker position as `_*_`", and a sweep that wrote anything else would write a fix no gate proposed. The ambiguity is a property of a slugless citation, not of the rewrite; the citation named a minute and not a file either way. Cost: 111 citations that resolve to nothing in particular and that no figure counts.
2. **Decline the rewrite when the candidate resolves to more than one record.** The sweep already has the index; `readsBackWhole()` is the place the check would sit. Cost: a class of tokens the sweep can no longer settle, so `rewrites=0` holds only because they are permanently declined, and the checker keeps reporting them as `stale-marker` forever with no repair available. That is the "reported and unrepairable" shape `unrewritable-violations=` was invented for, so it has a home.
3. **Report the class without changing the sweep.** Add a figure to `bin/fusion-citation-check` counting slugless citations that resolve to ≠1 record, so the 111 stop being invisible, and decide about the rewrite later on that number. Cost: one more figure on a line that already carries twelve.
4. **Rule it out of scope.** A bare stamp is not a citation (`rules/fusion-workbench-conventions.md` `## Filename Patterns`, "111 of the 545 stamps in fusion's own corpus are carried by more than one file"), and a slugless `<stamp>_*_` is a bare stamp with a marker slot on it. If that is the reading, these 111 are residual by definition and the question is closed rather than answered.

## Why this is a decision and not a defect

Nothing here is broken against a stated rule. The sweep did exactly what the checker prescribes, the gates are green, and 103 of the 111 instances predate this package. What is undecided is whether "resolves to exactly one record" belongs among the sweep's guards — a design question with a real cost on each side, and one the reviewer has no standing to settle.

## Recommendation

Option 3 first, then re-open the rewrite question on the measured number. The figure is cheap, it makes the class visible where it is currently silent, and it does not spend the sweep's ability to settle a token before anybody knows whether the class is growing.

---
Answered: 260922-1720_*_should-the-sweep-decline-a-rewrite-whose-result-resolves-to-more-than-one-record.md `## Options` — leave it: `_*_` is the mandated form, and a bare-stamp reference is residue rather than a citation, so the sweep keeps rewriting it and the checker keeps reading the result as ambiguous; no new count is added; ruled by user, Kai Stalmann <ks@qantr.com>
---
Implemented: `bin/fusion-citation-sweep` and `bin/fusion-citation-check` — the tree already behaves this way; nothing changes
