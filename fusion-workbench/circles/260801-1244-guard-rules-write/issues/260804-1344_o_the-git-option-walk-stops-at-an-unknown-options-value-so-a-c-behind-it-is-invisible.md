# The git option walk stops at an unrecognised option's VALUE, so a `-C` behind it is invisible

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:1277-1325` (`resolveGit` — the walk's `break` at `:1312` and the candidate list at `:1317`)
**Kind:** The FAIL-OPEN half is pre-existing. What is new in `613d6fd` is the claim that it is closed: `260804-1333_c_…` says the class was "closed structurally", and `rules/protected-path-discipline.md:139-145` states the same to every agent.
**Cross-references:**
`issues/260804-1333_c_…` (closed by `613d6fd` — this is the same class, still open through a different door; do not reopen it, its own instance really is closed),
`issues/260804-1024_c_…` (the `-C` recording this defeats),
`decisions/260804-1323_i_…` (`## Answer`, third bullet — where the structural claim is made).

---

## What is wrong

`resolveGit` walks git's global options to find the subcommand. An option it cannot name
sets `unknownOption = true` and the walk advances one word (`:1307-1311`). The next word is
that option's value, it does not start with `-`, and the walk **breaks** (`:1312`).

The fix `613d6fd` added then tries the word in subcommand position and, because
`unknownOption` is set, the word after it (`:1317`). That is two adjacent words. It does not
**resume the option walk**. So every global option standing after an unrecognised option's
value — including `-C` and `--work-tree`, the two facts this same commit added — is never
read, and the invocation resolves to no row at all.

## Measured

Real guard subprocess, one fresh project per verdict, one fresh git repository per effect,
bash 3.2 and zsh 5.9, git 2.49.0. No deny read `[HALTED]` (asserted).

```
guard   bash   zsh    command
ALLOW   GONE   GONE   git --namespace foo -C rules rm x.md
ALLOW   GONE   GONE   git --namespace foo -C agents rm coder.md
ALLOW   GONE   GONE   git --namespace foo --work-tree=rules clean -fdx
```

The three controls that prove the greps discriminate, same harness:

```
block   GONE   GONE   git -C rules rm x.md                        # the -C fix
block   GONE   GONE   git --literal-pathspecs -C rules rm x.md    # valueless unknown option
block   GONE   GONE   git --namespace foo rm rules/x.md           # 260804-1333's own row
```

The discriminator is exactly one thing: whether the unrecognised option **takes a separated
value**. A valueless one leaves the walk running and everything after it is read; one with a
value ends the walk one word early and everything after it is invisible.

## Why `260804-1333` does not cover it

That issue's closure note says: *"when the word in subcommand position matches no row AND an
unrecognised option stands immediately in front of it, the NEXT word is tried as a
subcommand too. A second candidate can only add a match, so it can only add a deny."*

Both sentences are true. The claim that does not hold is the one wrapped around them —
*"Every option the table does not carry has this shape … which is why it was not closed by
adding a row"* — because the shape is not "the value lands in subcommand position". The shape
is "**the walk terminates on a word that is not the subcommand**", and adding one more
candidate index only covers the case where the subcommand happens to be the very next word.

`git --namespace foo -C rules rm x.md` puts three words between the unknown option and the
subcommand, and the `-C rules` in the middle is the part that makes the write land on
`rules/**`. Reading two candidate indices cannot see it.

## Recommendation

Resume the walk rather than widening the candidate list: when the walk breaks on a non-flag
word AND `unknownOption` is set, treat that word as the option's consumed value and
**continue the option loop from the next index**, recording `-C` / `--work-tree` as it goes.
Then try the subcommand candidates as today.

That keeps the property `613d6fd` rests on — a directory fact only ever ADDS a candidate
resolution, so it can only add a deny — because the resumed walk can only find more
directories, never fewer. It also keeps the stated cost unchanged in kind (a false deny of
the shape `git <unknown-option> <non-subcommand> <mutation-verb> <protected>`), just reached
through one more word.

The alternative — give the whole invocation up once an unrecognised option with a value is
seen — closes it too and denies a class of ordinary git work; it should be costed before
being taken, not assumed cheaper.

## Test coverage this needs

- the three rows above as denies, with the real-shell effect asserted, bash and zsh;
- `git --namespace foo -C build rm out.js` pinned as an ALLOW, so a fix cannot be a blanket
  give-up on every invocation carrying an unrecognised option;
- `git --namespace foo -C rules status` pinned as an ALLOW, so the fix does not read a
  read-only subcommand as a write;
- the valueless control (`git --literal-pathspecs -C rules rm x.md`) kept, since it is the
  row that already passes and would hide a regression in the walk.

## Anti-vacuity

All three rows ALLOW at `613d6fd` and all three delete the file in both shells, so none can
pass vacuously. A mutation that reverts the walk-resumption must fail at least the
`--namespace foo -C rules` row and must NOT fail the `-C build` allow row.
