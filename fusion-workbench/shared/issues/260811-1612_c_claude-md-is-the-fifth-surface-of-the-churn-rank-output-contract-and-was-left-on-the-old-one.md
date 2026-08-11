# `CLAUDE.md` is the fifth surface of the churn-rank output contract and was left on the old one

---

**Severity:** Medium — the file every session in this repository loads first still documents the pre-change output of `bin/fusion-churn-rank`
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `CLAUDE.md:33` (the `bin/fusion-churn-rank` row)
**Cross-references:**
`shared/issues/260810-1632_c_the-churn-ranking-has-no-noise-filter-so-the-migration-promotes-dashboard-files-into-setups-top-ten.md` (the change that moved the contract);
`shared/issues/260811-1413_c_readme-hooks-still-describes-the-commit-message-class-without-the-store-scoping-that-defines-it.md` (the same shape, closed earlier in this same Turn);
`shared/history/260811-1550-coder-four-tracker-clustered-fixes.md:41-44` (the sweep's own surface enumeration, which does not include this file)

---

## What is wrong

`adaa545` added a `noise=` line to the churn ranking's output and carried the new contract to four
surfaces plus two `README-hooks.md` rows:

| Surface | Carries `noise=` |
|---|---|
| `hooks/churn-rank.ts` (the producer, doc comment and `main()`) | yes |
| `bin/fusion-churn-rank` (the usage block) | yes |
| `agents/orchestrator.md:126` (Setup Step 5) | yes |
| `skills/setup/SKILL.md:252` (defers to the block, describes both exclusions) | yes |
| `README-hooks.md` (`churn-rank.ts` and `lib/churn.ts` rows) | yes |
| **`CLAUDE.md:33`** | **no** |

`CLAUDE.md:33` still reads:

> Prints `anchor=`/`entries=`/`absent=`/`ranked=` then one `score=… total=… session=… path=…` line
> per file … The map keeps every file it has ever seen — nothing prunes, by design — so the absent
> ones are excluded **here**, on the read path, once per Setup rather than once per tool call.

Both halves are now wrong: the helper prints five keys, not four, and two exclusions run on the read
path, not one.

## Measured

```
$ grep -rn "absent=" --include='*.md' --include='*.ts' . | grep -v fusion-workbench/ | grep -v /dist/
bin/fusion-churn-rank:14  #   absent=367   # keys whose file is not on disk — kept in the
hooks/churn-rank.ts:36    absent=367
hooks/churn-rank.ts:118   `absent=${ranking.absent}`,
```

plus `CLAUDE.md:33`, which the grep above misses because it spells the keys inline as
`` `anchor=`/`entries=`/`absent=`/`ranked=` ``. That spelling is why it survived the sweep.

## Why it matters

`CLAUDE.md` is auto-loaded into every Claude Code session in this repository, so it is read before
any of the five surfaces that are correct. A session that reads the four-key contract and then sees a
fifth key has to decide which source to believe, and the row it read first is also the row that
claims authority over the helper.

The commit's own history file enumerates the surfaces it swept — *"all four surfaces that document it
… plus two `README-hooks.md` rows"*. `CLAUDE.md` is outside that enumeration, which is the same
mechanism that produced `260811-1413` (`README-hooks.md` outside `337c01b`'s file set) — the record
this very Turn closed two commits earlier.

## Suggested direction

Update the row to name both exclusions and all five keys. While there, consider whether the row
should describe the output at all: `bin/fusion-churn-rank`'s own header is the authoritative usage
block and the row could cite it instead of restating it, which is the question
`shared/decisions/260811-1522_o_should-the-readme-hooks-lib-table-pin-its-prose-to-the-modules-it-describes.md`
asks about the neighbouring table.

## Acceptance criteria

- [ ] `CLAUDE.md:33` names `noise=` and states that two exclusions run on the read path.
- [ ] A grep for the output keys across `CLAUDE.md`, `README*.md`, `bin/`, `hooks/`, `agents/` and
      `skills/` returns one contract, not two.

---
Resolved: The row no longer restates the key list at all. It cites `bin/fusion-churn-rank`'s own
header as the authoritative usage block for the `KEY=value` lines and the exit-code table, and
says in the row itself that it deliberately does not restate them — so a change to the output has
one surface to reach instead of two. What the row keeps is behaviour rather than contract: the map
never prunes, and two classes of key are held in the map and left out of the ranking (the file is
gone; the path names a workbench surface the tracker refuses to count as churn), each counted on
its own line so "deleted" and "not evidence" stay distinguishable. Verified after the edit that
the output keys are named in `bin/fusion-churn-rank` and `hooks/churn-rank.ts` only, plus
`agents/orchestrator.md:126`, which was already on the five-key contract. Suite green on a quiet
tree: 50 files, 1301 tests, exit 0. Commit: see the Turn-4 log in
`shared/history/260811-0752-orchestrator-session.md`.
