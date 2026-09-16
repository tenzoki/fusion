The news skill reads an entry from a fetched ref and names its writer from the working tree

---

`/fusion:news` Step 4 takes its two halves from two different trees, so a checkout that registered in a commit the reader has fetched but not merged is rendered as unregistered. The statement is false at the moment it is printed: the registration is present in the very commit the message body was read from.

---

**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md

## The defect

The entry body comes from the fetched ref. `skills/news/SKILL.md:86` runs `fusion-forum show "$HEAD" "$ENTRY"`, and that subcommand is `git show "<commit>:<git-path>"` and nothing else (`bin/fusion-forum:352`, documented at `bin/fusion-forum` `## show <commit> <git-path>`): no checkout, no merge, nothing in the working tree consulted.

The writer's name comes from the working tree. `skills/news/SKILL.md:94-96` cuts the hex out of the filename and hands it to `fusion-checkout-name resolve`, which builds its store path from `bin/fusion-workbench-root` (`bin/fusion-checkout-name:281-282`) and tests one file on disk (`bin/fusion-checkout-name:363-364`), exiting 3 when it is absent. `$HEAD` is not passed and the helper has no way to receive it.

`shared/checkouts/` is class R1 and travels in git (`rules/workbench-tracking.md` `## The four classes`), so the registration file sits in the same fetched tree as the forum entry. When the registration commit is on the upstream and not yet merged locally, `resolve` exits 3 against the working tree while `git show "$HEAD:<workbench>/shared/checkouts/<hex>.md"` would answer at the commit the skill already holds.

`skills/news/SKILL.md:100` then instructs the reader to treat exit 3 as "a checkout that never registered", which turns a lookup against the wrong tree into an assertion about the other party. The skill's own fetch is what makes the correct answer available, and the pull it offers at Step 6 is what silently changes the answer.

## Why the helper's stated bound does not cover this

`bin/fusion-checkout-name` `## Naming a holder, and why the name never enters a comparison` forbids routing a *comparison* through `resolve`, on the ground that an entry is a pulled file and would answer differently across a fetch. That bound reaches identity and claim equality. It does not reach rendering, which the same section routes through `resolve` deliberately. Pinning the render to `$HEAD` moves it toward the property that section is protecting, not away from it: the name would then be fixed by the same commit the body is, instead of by whenever the reader last pulled.

## Scope

`/fusion:news` is the only call site with this split. The other three resolve this checkout's own hex against its own tree (`skills/cadence/SKILL.md:37`, `skills/check/SKILL.md:242`, the SessionStart command in `hooks/hooks.json`), and `bin/fusion-events` joins the roster against local event rows, which do not travel.

## Acceptance test

Given an upstream carrying a registration for hex `H` and, in a later commit on the same branch, a forum entry whose filename's third field is `H`, with the local branch behind both: `/fusion:news` names that writer by the alias the registry carries, and a subsequent `git pull` changes nothing about what the render said. The name shown beside an entry is read at the same commit as the entry body.

The fix touches `bin/fusion-checkout-name`'s interface: `resolve` takes no commit today and reads no ref.

---

Resolved: `resolve` grew `--at <commit>`, which reads the entry with `git show <commit>:<path>` instead of from the working tree, deriving the store's git-root-relative path the way `bin/fusion-forum` derives its own (both sides physical, so a symlinked temp directory is not read as a workbench outside the repository). `skills/news/SKILL.md` Step 4 now passes `$HEAD` to both of its calls, so the name and the body are read at one commit. **The split the defect turned on is now two exit codes**: 3 stays an answer *about* the registry at that commit, and the new 6 is the absence of one — not a work tree, a workbench outside the repository, or a commit that does not resolve — so a failure to look can never again be rendered as "this checkout never registered". Exit 6 is unreachable from `/fusion:news`, which reaches Step 4 only after `fusion-forum new` has established all three. The reasoning, and why pinning the render to a commit serves rather than weakens the bound in `## Naming a holder, and why the name never enters a comparison`, is in `bin/fusion-checkout-name` `## Reading the registry at a commit`.

The acceptance test this record wrote out is `hooks/lib/__tests__/fusion-checkout-name.test.ts`, the case named "resolve --at names a writer whose registration reached a commit and not this tree": it registers, commits, deletes the entry from the working tree, and asserts the working tree answers 3 while the commit answers with the alias. It cost 19 lines on a surface at zero margin and was funded by the fourth `TEST_LINE_HEAD_ROOM` raise, 2 821 -> 2 840, ruled by the user and logged with its before-and-after figures in `README-hooks.md` `#### The head-room raises, and the reduction read on 2026-10-10`. No baseline moved. The skill body came out 17 bytes lighter, and the helper is on an unbounded surface, so the test was the whole of what the fix asked for.
