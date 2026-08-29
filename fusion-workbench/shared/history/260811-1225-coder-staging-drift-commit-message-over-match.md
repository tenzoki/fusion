# Coder — staging-drift commit-message over-match

**Status:** Complete
**Agent:** coder
**Task:** Fix the High-severity regression introduced by Turn 1 (commit `cac41ef`)
**Source:** `260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md`
**HEAD at start:** `270c566`

## What was wrong

`classify()` in `hooks/lib/staging-drift.ts` ran `COMMIT_MESSAGE = /commit[-._]?(msg|message)/i`
against the basename alone, first, ahead of every location test. Three real workbench records
matched — one of them the record reporting the defect — and `stagingSentence()` then told the model
to delete them. Because the classes are exclusive, the same files never reached the `record` list,
so the unstaged-record fault they actually were was suppressed at the same time.

Measured before the change, through the shipped `hooks/dist`:

```
commit-message  shared/history/260810-1810-coder-commit-message-out-of-the-shell.md
commit-message  shared/issues/260811-1141_o_any-workbench-file-...-told-to-delete-it.md
commit-message  shared/issues/260811-1149_o_the-commit-message-path-lints-...-inconsistent.md
```

Note for a later reader: `./bin/fusion-staging-drift` on a **clean** tree does not show them —
`git status --porcelain` reports only changed paths, and all three were committed. The task brief
expected two of them in the CLI output; that expectation only holds once the files are dirty. The
reproduction above goes through `classify` directly, and the dirty-tree CLI run is recorded below.

## The cut taken, and why

The record offered two. Taken: **scope the pattern** — run the name test last, over only what
`LIVE_STATE`, `stashes/`, `ROOT_RECORDS` and `STORES` have all declined to claim.

Not taken: exclude the artifact filename shape `^\d{6}-\d{4}[-_]`. Two reasons. First, every other
class in `classify` is decided by **location**, and the distinguishing fact here is a location fact —
a leftover message file is one no store owns. A second name pattern arbitrating a location question
is the shape that produced the defect, one layer further in. Second, the shape cut's correctness
depends on the stamp convention being exceptionless, and it is not: `shared/memos/` holds
`memos-<user>.md`, `tasks-<user>.md`, `cadence-<user>.md`, and `shared/backlogs/` holds whatever the
user names — a file called `commit-message-notes.md` under a store would still have been classified
`commit-message` under that cut, and still told the model to delete it.

The ordering also fixes a latent case neither cut was aimed at: a `stashes/` snapshot of any of the
three records was `commit-message` too, because the name test preceded the stash test.

## What the cut gives up — stated, not glossed

The header at the old `:296-305` justified running `commit-message` first so a message file dropped
inside a store is still read as one. **That case is given up.** A commit message genuinely written
into `shared/issues/` or a Circle's `planning/` now comes back as an unstaged `record`: the model is
told to stage it, so the leftover enters a commit instead of being swept, and the sentence naming
`/tmp/fusion-commit-msg-<task-id>.txt` is not printed for it.

Weighed and accepted, on two counts. The misread runs in the safe direction — stage, never delete —
where the ordering it replaces misread authored records destructively, three times, already. And the
improvisation the class exists to catch is `.commit-msg-tmp` at the workbench root, which the
scoping still catches, along with any other spelling anywhere the stores do not reach. Verified:
`.commit-msg-tmp` and `commit-message.txt` at the root still classify `commit-message`.

## Changes

- `hooks/lib/staging-drift.ts` — `classify()` reordered (name test last); ordering contract in its
  header rewritten to state the principle, the defect and the cost; `COMMIT_MESSAGE` constant doc
  narrowed; module-header class bullet narrowed; `stagingSentence()` no longer says "Delete it"
  unconditionally — it says read the file first, delete only a leftover, stage anything authored,
  and why (the class is name-decided, so a false positive can enter it and a deletion is not
  recoverable).
- `agents/orchestrator.md` — `## Staging check` class table row rewritten to the same effect;
  the Step 3b prose at `:418` narrowed to "scoped to what no artifact store owns".
- `skills/commit/SKILL.md`, `hooks/tracker.ts` — the same narrowing in their descriptions.
- `hooks/lib/__tests__/staging-drift.test.ts` — the missing control: all three real filenames written
  under stores, asserted `record`, with no `commit-message` row. Plus a tracker case asserting the
  suppressed half — the record fault now reaches the model and the delete sentence does not. Suite
  header names the new property.
- `hooks/lib/__tests__/commit-message-path.test.ts` — `workbenchMessagePaths()` doc records the
  scoping it inherits and why the resulting narrowing is the intended reading; new control pins the
  boundary both ways (a cited record path is not flagged and classifies `record`;
  `commit-message-notes.md` with no store still classifies `commit-message`).

Out of scope and untouched: the other seven findings from the same review, and the deferred decision
about a shared chassis for the three measurement modules.

## Verification

`cd hooks && npm test` — **exit 0**, 48 files, **1246 passed** (1243 at HEAD `270c566`, +3 new cases).
`npm run build` re-emitted `hooks/dist/`; no `import ... from` in it names anything but `node:` or a
relative path, and no `require(` appears — still self-contained for the tarball install.

Dirty-tree CLI run after the change, the three real files touched then restored:

```
$ ./bin/fusion-staging-drift
unstaged=3
verdict=unstaged
  record          M shared/history/260810-1810-coder-commit-message-out-of-the-shell.md  UNSTAGED  (an authored record under the history store)
  record          M shared/issues/260811-1141_o_...-told-to-delete-it.md  UNSTAGED  (an authored record under the issues store)
  record          M shared/issues/260811-1149_o_...-case-inconsistent.md  UNSTAGED  (an authored record under the issues store)
```

Both halves closed in one reading: the class is `record`, and the fault count is 3 rather than 0.

## Not committed

No `git add`, no `git commit` — the orchestrator commits. The issue record was annotated and renamed
`_o_` → `_c_`; that rename is two paths in the staging list.
