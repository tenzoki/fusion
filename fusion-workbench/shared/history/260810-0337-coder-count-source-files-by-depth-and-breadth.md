# Counting a project's source files by depth and breadth

**Agent:** coder
**Date:** 2026-08-10
**Status:** Complete
**Task:** T2 of session 260810-0241 — replace the depth-bounded, extension-narrow file counting
in the workbench-domain heuristic. Not committed: left in the working tree by instruction.

**Source issue:** `shared/issues/260807-1951_o_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md`
**Governing decision:** `shared/decisions/260809-1731_a_how-should-the-domain-heuristic-count-a-projects-source-files.md`
— option 2, `git ls-files`, chosen by the user; the `Answered:` block narrows it further to
option 2 plain (no `find` fallback, no `CLAUDE.md` domain declaration).

**Base:** `6a69717`

---

## What changed

| File | Change |
|---|---|
| `bin/fusion-count-sources` | New. The whole counting mechanism, ~60 lines of shell under ~90 lines of header. |
| `agents/orchestrator.md` | Setup Step 5 only. The two count definitions are replaced by a call to the helper, and a new `counted_by == "none"` branch keeps an absent count out of the cascade. |
| `.gitignore` | `!bin/fusion-count-sources`. Required: `bin/*` is ignored, so without the exception the helper is never tracked and never ships. |
| `hooks/lib/__tests__/fusion-count-sources.test.ts` | New. 11 cases, one per reported defect layout plus the two exit codes. |

## The mechanism

`git ls-files --cached --others --exclude-standard -- . ':(exclude)fusion-workbench'`, filtered
twice against two extension alternations. One listing, two greps, no walk.

The depth bound disappears because there is nothing left to bound. The prune list
(`node_modules/`, `target/`, `vendor/`, `dist/`, `build/`, `.venv/`) never has to be written at
all, because `.gitignore` has already excluded those from the listing — that is the property
that recommended option 2 over option 1 in the decision record, and it is the reason the fix is
one list rather than a list plus an open-ended prune set.

Three implementation choices sit inside the answer rather than beside it, and each is argued in
the helper's own header so the next reader does not have to reconstruct it:

- **`--others --exclude-standard`, not `--cached` alone.** The record names "a source tree
  somebody forgot to `git add`" as the Con of option 2. Including untracked-but-not-ignored
  files removes that Con while keeping the `.gitignore` inheritance the option was chosen for.
  It is not a second mechanism, so it does not reopen the `find`-fallback question the user
  declined. Measured delta in this repository and in KRK: zero files either way.
- **No `capped at 1000`.** The cap was a cost bound on an unbounded `find` walk. Measured on a
  synthetic 10 000-file repository the whole helper runs in 0.143 s, so the cap buys no
  measurable time, and it would cost correctness in exactly the branch the same record insists
  must be sound: a project with 1200 source and 3000 data files would compare 1000 against
  1000 instead of 3000 against 1200, and the `data` branch that should fire would not. The
  record's constraint is "the check runs at every Setup, so it stays cheap"; the mechanism
  satisfies that without truncating.
- **`fusion-workbench/` excluded from both counts.** It is fusion's own bookkeeping, not the
  project's source or data, and in this repository it is git-tracked (in most consuming
  projects it is ignored and never appears). One closed directory that fusion itself defines,
  not an open prune list. In this repository it moves `data_files` from 32 to 21.

## The absent count

The user declined the layered `find` fallback, so a project with no git repository has no count
at all. It is reported as `unavailable` with `counted_by=none` and exit 2, never as zero.

This is load-bearing rather than cosmetic. A zero is indistinguishable from a measurement to
both branches that read these numbers: `analyses_count > 0 and code_files == 0` reads it as
"this project has no source", and `data_files > code_files * 2` gets a right-hand side of zero,
so any project with a single data file flips to `data`. The cascade now carries

```
elif counted_by == "none":   domain = "code"   # counts unavailable
```

ahead of both, and the prompt states that its position is load-bearing — if the branch order is
ever changed (task T3 of this session is about exactly that), the line moves with them. The
orchestrator is told to say the count could not be taken, in the user-facing Setup summary and
in the session history, rather than presenting the fallback silently.

## Breadth

`code_files` went from 7 extensions to 61. Every language the record named is now covered:
Kotlin, Swift, C, C++, C#, Ruby, PHP, Scala, Elixir, Zig, shell, SQL, and the single-file
component formats `.vue` and `.svelte`, plus the JS/TS variants the old list also missed
(`.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`).

`data_files` went from 5 extensions under four fixed directory names to 19 extensions anywhere
in the tree: the original five plus `.jsonl`, `.ndjson`, `.tsv`, `.xml`, the schema formats
`.xsd`/`.avsc`, and the RDF family `.ttl`, `.owl`, `.rdf`, `.jsonld`, `.nt`, `.n3`, `.nq`,
`.trig` — the shapes the `data` domain and the `ontocoder`/`ontorev` agents exist for.

A long extension list is not the special-case rim `rules/critical-stance.md` §2 warns about,
and the distinction is worth stating because the two look alike. A missing prune entry
*inverted* the result by counting a dependency tree as project source; a missing extension only
under-counts the one language it names. The first is a design failure, the second is a data
gap, and the header says so where somebody adding a language will read it.

## The live question the decision record handed over: keep the ratio branch

The record asked whether `data_files > code_files * 2` becomes unreachable once `code_files`
counts a real source tree, and said that if it cannot fire correctly the honest fix is removal,
not tuning.

**It fires, and it fires on the right projects. Keep it.** Measured:

| Project | code_files | data_files | Branch |
|---|---|---|---|
| Synthetic ontology tree (20 nested `.yaml`, 10 nested `.ttl`, 2 `.py` tools) | 2 | 30 | fires → `data`, correctly |
| this repository | 87 | 21 | does not fire → `code`, correctly |
| KRK (Cargo workspace) | 108 | 11 | does not fire → `code`, correctly |

What made the branch look unreachable was not the ratio, it was the asymmetry underneath it:
the left side had no depth bound but was restricted to four directory names, and the right side
had a depth bound of 2. Two differently-broken counts on either side of a comparison. Both
sides now come from one listing under one set of rules, which is what "dimensionally sound"
means here, and a genuine data project clears the factor of two comfortably. The regression
test `counts data files by the same mechanism, so the data-vs-code ratio compares like with
like` pins the firing case.

## Verification

Every number below was run, not inferred.

**This repository** — the case the issue measured at 260809:

```
old depth-2 walk, 7 extensions:  4
bin/fusion-count-sources:        code_files=87  data_files=21  counted_by=git-ls-files
```

The issue records 95 for `git ls-files` on 260809; 87 is the same measurement at `6a69717`,
after commit `7598073` deleted eight TypeScript files with the branch policy. Same mechanism,
smaller tree.

**Synthetic deep trees** (built in the session scratchpad, all git repositories):

| Fixture | Full-tree `find` | Old depth-2 walk | Helper |
|---|---|---|---|
| Cargo workspace, `crates/<c>/src/{,ablage/,operation/}*.rs`, 500 `.rs` under `target/` | 27 | **0** | **27** |
| Go, `internal/<pkg>/handler/*.go`, 300 `.go` under `vendor/` | 19 | **0** | **19** |
| Frontend, `src/components/<C>/*.tsx` + `.vue`/`.svelte`, 400 `.js` under `node_modules/`, 50 under `dist/` | 11 | **50** | **11** |

The frontend row is the sharper result. The old walk did not merely under-count there, it
returned 50 by counting `dist/*.js` build output as project source — the inversion the decision
record predicted for an unpruned walk, reproduced.

**KRK, a real consuming project** (the original report): `code_files=108`, against the 106
`.rs` files a full-tree `find` sees outside `target/`; the difference is shell and other
sources the `.rs`-only `find` did not ask for. The old walk returned 0.

**Cost**, on a synthetic 10 000-file repository: 0.143 s wall for the whole helper. This
repository: 0.047 s.

**No git**: exit 2, `code_files=unavailable`, `data_files=unavailable`, `counted_by=none`.
Confirmed against a scratch directory and against `/Users/k1/.fusion`, the installed plugin
copy, which is a real non-repository on this machine.

**Test suite**: `hooks/lib/__tests__/fusion-count-sources.test.ts` — 11 passed.
`path-literal-lint` — 19 passed. `tsc --noEmit` — clean. Full `npm test`: the only failure is
`reference-resolution-lint` on `bin/fusion-plane:567`, which belongs to another task's
in-flight work in this same Turn (`bin/fusion-plane` and `hooks/lib/__tests__/fusion-plane.test.ts`
are both modified in the working tree and neither is mine).

## Out of the stated file allowlist, and why

The dispatch named `agents/orchestrator.md` and a new `bin/` helper. Two files beyond that:

- `.gitignore` — not optional. `bin/*` is ignored with an explicit `!bin/<name>` exception per
  shipped helper, and the file's own warning comment says a helper without one is silently
  dropped from the distribution. Without the line the helper does not exist for any user.
- `hooks/lib/__tests__/fusion-count-sources.test.ts` — additive, collides with no other task.
  The repository tests its bash helpers (`fusion-paths.test.ts`, `fusion-plane.test.ts`) and an
  untested one is the thing that rots.

## Left for others

- **`skills/setup/SKILL.md` is not duplicated logic and needs no edit.** Line 227 points at
  `agents/orchestrator.md` Setup Step 5 rather than restating the heuristic, so the single
  source of truth held and the pointer stays valid.
- **`CLAUDE.md`'s `bin/` layout table** has no row for `fusion-count-sources`. Out of scope
  here; `/fusion:revise-claude-md` owns it.
- **Marker walks not performed**, per the dispatch's explicit file allowlist: the issue
  `260807-1951_o_...` is not renamed to `_c_`, the decision `260809-1731_a_...` is not renamed
  to `_i_`, and `tasklist.md` T2 is still `[ ] open`. The decision's `Implemented:` line wants
  a commit hash that does not exist yet, and four other tasks are editing shared files this
  Turn.
