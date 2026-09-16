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
