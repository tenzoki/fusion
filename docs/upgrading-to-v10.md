# Upgrading to fusion v10

v10 is a removal release, the second in a row. What left is the last thing fusion's hook
layer decided: the decision-governed write check, the consecutive-block counter it fed, and
the halt that counter raised. The guard sees every write-tool call and every `Bash` call,
allows all of them, and records what it saw. It is an observer now, and nothing in it can
block a tool call.

One thing here is unlike v9, and it is why this page exists: **the release removes a file
every consuming project has at its root.** `fusion-guard.json` is no longer read, and
`fusion.json` replaces it. If your `fusion-guard.json` set a Turn budget, that budget stops
being applied the moment you upgrade, and no session says so out loud. The first check below
is the whole of the fix and takes about a minute.

Upgrading itself is the ordinary update — `fusion --update`, or the uninstall/install/reload
sequence on the marketplace path. The release is tagged `v10.0.0`, and the installer's
`FUSION_REF=tags/v10.0.0` pins exactly this version if you want it pinned. No workbench file
changes shape, and no agent, skill or slash command left in this release.

## What left

| Removed | Measured on |
|---|---|
| The decision-governed write check | neither of the two reachable consuming projects had ever armed it, and fusion's own layer shipped it switched off |
| The consecutive-block counter and the halt it raised | with the check above gone, nothing left could raise a halt |
| `clear-halt.ts`, the only thing that cleared a halt | there is no halt to clear |
| The fusion-repository stand-down inside the guard | it had outlived the deny it was written for by four days, and was standing down two checks it was never built for |
| `escalation.ts`, `project-relative.ts`, and four of the five exports of `hooks/lib/paths.ts` | each lost its last caller with the checks above |
| The plugin's own configuration layer inside the install, `config.json` and its example file | it existed so guard settings could have a plugin-level default a project narrowed; the guard has no settings, so nothing now stands between your file and fusion's built-in values |
| Your project's `fusion-guard.json` | it configured the guard; the one key in it that was never the guard's moved to `fusion.json` |

**What stays.** The PreToolUse hook is still registered, on the four write tools and on
`Bash`. It allows everything and still writes one `guard_allow` row per write-tool call, so
the monitor's write panel keeps its trace of what the write surface did. A `Bash` call is
inspected for nothing, and in a correctly configured project it writes no guard state at
all.

The full record of each removal, with the figures behind it, is in fusion's own workbench
under the Circle `260816-1741-guard-becomes-observation-only` in the source repo.

## What to do in your project

Two checks. The first is the load-bearing one; skipping it costs you a setting you chose.

### 1. Move your Turn budget into `fusion.json`, then delete `fusion-guard.json`

fusion reads `fusion.json` at your project root and merges it over its own built-in
defaults. It reads no byte of `fusion-guard.json` any more.

If your old file set a Turn budget, copy that one key across **before** you delete
anything, with your own number in place of the 12:

```json
{ "orchestrator": { "maxTurns": 12 } }
```

A budget left behind in `fusion-guard.json` is not read, and the orchestrator falls back to
fusion's built-in default **without saying so**. That silence is why this check leads: it is
the one loss of this migration you would not otherwise notice, and it looks exactly like a
working session.

**Copy nothing else across.** Everything else that file carried configured the guard, which
decides nothing now. The three top-level keys that held it — `guard`, `decisions` and
`escalation` — are retired: if one of them turns up inside `fusion.json`, the loader names
it, ignores it and leaves the rest of the file alone, once per guarded tool call until you
delete the key.

Then delete the old file:

```bash
rm fusion-guard.json
```

While it is still there, fusion tells you so on every guarded tool call, naming the file,
naming the Turn-budget key and saying where that key belongs now. The advisory stops when
the file is gone. That channel was chosen over a one-off Setup message deliberately: it
reaches a project on every call, where a Setup message reaches only a project that runs
Setup again.

If you never had a `fusion-guard.json`, or it set nothing, there is nothing to move, and
you need no `fusion.json` either — a project that has none runs on fusion's own built-in
Turn budget. Run `/fusion:setup` once if you want one: it seeds a documented template that
declares nothing and therefore inherits everything, ready for you to edit.

### 2. Delete a leftover halt flag, if you have one

A project halted by the old guard carries `haltActive: true` in
`fusion-workbench/.guard-state/escalation.json`. At this version that flag blocks nothing
and no code reads it. There is no clearing script any more, and none is needed.

`/fusion:setup` finds the file, says the check that set it is no longer part of fusion, and
offers to delete it. You can also delete it yourself:

```bash
rm -f fusion-workbench/.guard-state/escalation.json
```

A project that never runs Setup again keeps an inert flag in a file nothing reads. That
price was accepted deliberately rather than designed around: whether a given project ever
runs Setup again is not something fusion can find out, so nothing in the release pretends to
answer it.

## What needs no action

Each line below says what this release did to something, and stops there. A later release
can change any of it, so read this section as a record of v10 rather than as a standing
promise.

- **Your Circle directories, records, issues, decisions, reviews and histories.** The
  release moved none of them and changed no workbench layout.
- **Your existing `.guard-state/events.jsonl`.** The release neither rewrote nor truncated
  it, so the `guard_block` and `guard_halt` rows already in it are still there to read even
  though nothing writes another one.
- **The agent, skill and slash-command roster.** The release removed none of them and
  renamed none of them.
- **Your `.claude/` permission settings.** The release changed nothing about how they are
  read or where they live.

## Where to read more

- `README-hooks.md` — what the hook layer does now, and a written-up account of each thing
  it used to do.
- `templates/fusion.json` — the seeded configuration file, which documents every key in its
  own notes.
- `docs/upgrading-to-v9.md` — the previous removal release, if you are coming from v8 or
  earlier and skipped it.
- `/fusion:help` — install, update and configure, answered from your live installation.
