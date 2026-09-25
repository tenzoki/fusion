# v10.25.0 release surfaces, prepared and left untagged

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## Task

Prepare the v10.25.0 release across the version surfaces the release process names.
Do not tag and do not push: the tag waits on a proof run in another checkout, and
both acts are the user's. Do not commit in the fusion repository; commit in the
marketplace clone without pushing.

## Why 10.25.0 and not 10.24.1

`v10.24.1` already exists as a tag, cut from the `v10.24.0` tag rather than from
`main`, so the next number has to clear it, and this release adds a feature rather
than patching one.

## The marketplace jump

The marketplace entry stood at 10.24.0; 10.24.1 was tagged and never entered there.
Its content is already in `main`, so 10.25.0 supersedes it and the gap closes on its
own. The entry was bumped 10.24.0 to 10.25.0 directly and no 10.24.1 entry was added,
per `260908-0920_*_v10-24-1-is-tagged-and-was-never-entered-in-the-marketplace.md`.

## The four version surfaces

| Surface | Before | After |
|---|---|---|
| `.claude-plugin/plugin.json` `version` | 10.24.0 | 10.25.0 |
| `<marketplace>/.claude-plugin/marketplace.json` fusion `version` | 10.24.0 | 10.25.0 |
| `install.sh` header `FUSION_REF=tags/v<version>` example | v10.24.0 | v10.25.0 |
| `README.md` pin example | v10.24.0 | v10.25.0 |

The last two are the pair that went stale for 10.24.1, which is what the issue above
records as the part that outlives that instance.

## The fifth surface

`plugin.json`'s `description` and the marketplace entry's `description` were
byte-identical before the change and were rewritten together. Both now carry one added
clause naming what this release adds: a message one checkout leaves at the end of a
session and another reads with `/fusion:news` before it pulls, kept in its own store
and archived by age. Read side by side after the edit: both 870 bytes, string equality
confirmed by comparing the two parsed JSON values.

## One user-facing edit

`docs/fusion-intro.md` section 10 is a German command table and carried no
`/fusion:news` row. One row added, in German, in the register of the rows around it:

```
| `/fusion:news` | Was ein anderes Checkout hinterlassen hat, gelesen vor dem Pull |
```

Nothing holds that table — it is curated, not a gate-checked inventory — which is why
the row was missing. The one gate that reads it, the phantom-skill check in
`derivable-enumerations-lint.test.ts`, is open-set in that direction: it fails on a
`/fusion:<name>` token naming no directory, and `skills/news/` exists.

## Gate corpora

Three of the four touched fusion files sit inside a gate's scanned corpus, and all
three stayed green with no attribution work needed:

- `README.md` and `docs/fusion-intro.md` are in `derivable-enumerations-lint`'s
  phantom-skill surface set and in the citation gate's corpus. Neither edit adds a
  citation token, and the added skill token resolves.
- `install.sh` comments are scanned by `reference-resolution-lint`. The edit changes a
  version inside an existing `FUSION_REF=tags/...` example that already passed.

No growth baseline was touched, and none is in scope: the four bounds cover the
always-on rule set, `agents/`, `skills/` and the hook tests, and this change touches
none of them.

## No upgrade note written

Deliberately not written; the judgement is the user's. The recommendation is in the
report to the dispatcher.

## Verification

- `claude plugin validate .` — exit 0, `Validation passed with warnings`, exactly one
  warning (`CLAUDE.md` at the plugin root not loaded as project context), which is this
  repository's normal state.
- `cd hooks && npm test` — exit 0, 53 files, 924 tests passed. A baseline run before
  any edit gave the same 53/924, so the suite was green both sides of the change and
  none of the three nondeterministic harness files fired.

## Commits

- fusion repository: **none**. The user commits here.
- marketplace clone (`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`):
  `9799387 chore(fusion): 10.25.0`, one file, staged by explicit path, not pushed
  (`main...origin/main [ahead 1]`).

The commit lock was not acquired for that commit: `bin/fusion-workbench-root` exits 1
above the marketplace clone, so the lock has no workbench to anchor in, and the clone
is a separate repository whose index no fusion agent contends for.
