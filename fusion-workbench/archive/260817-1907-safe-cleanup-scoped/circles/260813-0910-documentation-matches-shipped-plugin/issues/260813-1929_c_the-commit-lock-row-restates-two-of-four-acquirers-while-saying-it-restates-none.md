The fusion-commit-lock Layout row restates two of four acquirers while declaring it restates none

---
`CLAUDE.md:41` opens by naming who acquires the commit lock (the orchestrator, and an executor committing on its own behalf) and later in the same row says that "who acquires … [is] spelled there, and this row deliberately does not restate them". The partial restatement omits the two skills that commit, so a reader who takes the opening clause as the list gets two of four.
---

## Both sides read

**Documentation side**, `CLAUDE.md:41`:

> | `bin/fusion-commit-lock` | The POSIX mutex around `git add` and `git commit`, **acquired by whoever is about to commit: the orchestrator at Phase 2 Step 3b, and an executor only in the rare case it commits on its own behalf.** … **The protocol is authored in `rules/workbench-stash-and-lock.md`** — **who acquires**, the two stale-lock paths at 60 seconds, the noclobber holder write and the failure modes are spelled there, and this row deliberately does not restate them. |

**Artifact side**, `rules/workbench-stash-and-lock.md:137-143`, `### Who acquires`, four entries:

- **Orchestrator** at Phase 2 Step 3b — before staging and committing.
- **Coder / ontocoder / bugfixer** ONLY if they commit directly (rare; default is the orchestrator commits on their behalf).
- **`/fusion:commit` and `/fusion:cleanup`** — the two skills that commit; each wraps every stage+commit pair in `with <skillname> --` (tags `commit`, `cleanup`). Skills are never served by `bin/fusion-rules`; their bodies carry the instruction and cite this section directly.
- **Other agents** — never commit, never need the lock.

The row's opening clause covers entries 1 and 2. Entry 3 is absent, and it is the entry a reader is least likely to guess: skills are not agents and are not served by `bin/fusion-rules`, which is the very asymmetry the row's closing sentence goes on to mention.

Everything else in the row was checked and is accurate: atomic `mkdir` and workbench anchoring (`:122`), the two stale-lock paths at 60 seconds (`:124`), the noclobber holder write (`:122`), the four subcommands with `with` canonical (`:130-135`), the failure modes (`:150-153`), and the orchestrator-only emission (`bin/fusion-rules:453-455`).

## Scope

`CLAUDE.md` only.

## Recommended fix direction

Either drop the acquirer clause from the opening sentence, letting the "authored in" pointer carry it whole, or complete it to the four entries. Dropping it is the better fit with the row's own stated policy of not restating the protocol.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`, commit `0b20859`).

---
Resolved: The partial acquirer list was dropped, per the issue's preferred direction. The `bin/fusion-commit-lock` row in `CLAUDE.md` now opens "The POSIX mutex around `git add` and `git commit`, acquired by whoever is about to commit." and lets the "authored in `rules/workbench-stash-and-lock.md`" pointer carry the roster whole, which is what the row's own closing sentence already promised. Checked against `rules/workbench-stash-and-lock.md` `### Who acquires`, read in full: four entries, orchestrator / executors-when-they-commit / the two committing skills / everyone else never.
