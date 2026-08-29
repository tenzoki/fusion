# The git option walk stops at an unrecognised option's VALUE, so a `-C` behind it is invisible

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:1277-1325` (`resolveGit` — the walk's `break` at `:1312` and the candidate list at `:1317`)
**Kind:** The FAIL-OPEN half is pre-existing. What is new in `613d6fd` is the claim that it is closed: `260804-1333_*_…` says the class was "closed structurally", and `rules/protected-path-discipline.md:139-145` states the same to every agent.
**Cross-references:**
`260804-1333_*_…` (closed by `613d6fd` — this is the same class, still open through a different door; do not reopen it, its own instance really is closed),
`260804-1024_*_…` (the `-C` recording this defeats),
`260804-1323_*_…` (`## Answer`, third bullet — where the structural claim is made).

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

## Why `260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` does not cover it

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

---

**Resolved:** 2026-08-04, `coder`, plan Step 3. `resolveGit` now RESUMES the option
walk instead of widening the candidate list. A bare word is tested against the
subcommand table; if it matches no row and an unrecognised option stands in front
of it, it is that option's value and the walk continues from the next index,
recording `-C` and `--work-tree` as it goes. If it matches no row and no
unrecognised option stands in front of it, it is git's real subcommand and the
walk stops there — which keeps the walk out of the subcommand's own arguments,
where `-C` means something else (`git commit -C HEAD~1` reuses a message).

All three measured rows deny, with the real-shell effect asserted in bash and zsh
(`guard-bash-integration.test.ts`, "a git option walk that stops early hides the
directory behind it"). Both allow-side controls (`-C build rm out.js`,
`-C rules status`) hold, plus four more.

**The class, and its bound.** Closed: every well-formed invocation whose
unrecognised global options each take at most ONE separated value. Not closed and
not claimed: an option taking two separated values, and a second bare word
standing between the value and the subcommand (`git --namespace foo bar -C rules
rm x.md`), which resolves to nothing. Neither is a fail-open in practice — git
reads that second bare word as the subcommand and refuses the command — but
neither is proven, and the bound is asserted in the suite ("states the BOUND of
the resumed walk rather than claiming the class closed") rather than left in
prose.

**The no-new-allow property survives structurally,** not by luck: the new
candidate set is a superset of the old one (a flag word can never match a row
name, so the old `i+1` candidate could never have matched one the new walk
skips), and a resumed walk can only record more directories, which can only add a
base and therefore only add a deny. Measured against a generated cross-product of
181,115 commands, baseline `f82ac02`: **0 newly allowed**.

Anti-vacuity, run: reverting the resumption to the two-adjacent-candidate fix
fails exactly the three measured rows in both shells plus the two unit
assertions — 8 cases — and does NOT fail `git --namespace foo -C build rm out.js`.
