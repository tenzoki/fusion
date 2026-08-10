# Plane setup — wiring the fusion work-queue mirror

fusion can mirror its work queue into a [Plane](https://plane.so) project: every
Circle, fusion issue, and decision appears as a Plane issue, labelled by kind
(`circle` / `fusion-issue` / `decision`), kept in the matching state, with its children
attached. The mirror is **push-only and idempotent** — files in
`fusion-workbench/` are always the source of truth, Plane is a secondary read-along
view. fusion stays fully operational when Plane is unreachable and rebuilds the
mirror from files on the next reconcile.

There is also one **bounded read**: `fusion-plane seed <seq>` reads a named Plane
issue's description once to seed a new Circle's Grounding, after which that Circle
is file-authoritative and Plane is not consulted about it again.

The bridge is optional. Skip this doc and fusion runs exactly as before — no mirror,
no error.

The helper is `bin/fusion-plane` (subcommands `push` / `seed` / `map` / `states` /
`doctor` / `plan`). Three things must be in place before the first push.

## 1. A Plane instance

Either works:

- **Self-hosted** (e.g. `https://plane.digitalleadership.com`) — set `base_url` to
  your instance root.
- **Plane Cloud** (`https://api.plane.so`) — set `base_url` to the cloud API root.

**Self-hosted note:** the Pages API is unreachable on a self-hosted instance, so
**only the work queue mirrors** — Circles, fusion issues, and decisions. Prose
(history, reviews, analyses) stays in files and is never pushed. This is a scoped,
deliberate limitation, not a bug.

You need one Plane **project** to mirror into. Note its workspace slug (the
human-readable identifier in Plane URLs) and its project UUID (project settings, or
via the API).

## 2. The API key in your shell profile

The key is **never stored in a file**. It lives only as an environment variable, so
every Plane call runs through `zsh -ic "curl ... $PLANE_API_KEY ..."` — the
non-interactive Bash-tool shell does not inherit exported vars, so an interactive
`zsh -ic` is required to pick the key up.

Add to `~/.zshrc` (so every `zsh -ic` sees it):

```bash
export PLANE_API_KEY="plane_api_..."
```

Then `source ~/.zshrc` (or open a new terminal). Generate the key in Plane under
your account/workspace API-token settings.

If the key is ever absent, `fusion-plane` does not fail silently and does not block:
it prints the exact transition it would have made and asks you to do it in the Plane
UI.

## 3. Fill in `plane.config.yaml`

`/fusion:setup` copies the template to `fusion-workbench/plane.config.yaml` (it never
overwrites a filled-in copy). Open it and set:

- `base_url` — your instance root, scheme + host only, no `/api` path, no trailing
  slash.
- `workspace_slug` — the slug from your Plane URLs (not the workspace UUID).
- `project_id` — the target project's UUID.

The `states:` block maps fusion's five canonical states (Backlog / Todo / In
Progress / Done / Cancelled) to the state names on your board. Edit a value only if
your instance renames a state (e.g. a German board using "In Bearbeitung"); leave the
keys fixed. fusion resolves each name to its UUID at runtime via the project's
`states/` endpoint and **never hardcodes a state UUID**. The optional `state_fallback:`
block handles a board that lacks a state (e.g. no "Cancelled" → fall back to "Done").

The `labels:` block works the same way for the kind label every fusion-created issue
carries. Its three canonical keys (`circle` / `fusion-issue` / `decision`) are fixed;
each value is the label name on your board, so a renamed or localised board changes
only the values. As with states, fusion resolves each name to its UUID at runtime via
the project's `labels/` endpoint and **never hardcodes a label UUID**.

Two behaviours worth knowing:

- **Create-if-missing.** If a configured label name does not exist on your board,
  fusion creates it once and uses the returned UUID. You do not have to pre-create the
  three labels by hand.
- **A label never blocks a push.** If the `labels/` endpoint is unreachable or refuses
  the create, the push proceeds *without* the label and says so — on stderr, and in the
  final `STATUS:` line. A label is metadata; losing it must never cost you the state
  transition.

The key invariant: **there is no `api_key` / `token` / `secret` field in this file.**
A lint test fails the build if one appears.

### The full brief as a comment (`spec_comment`, optional)

By default the mirror keeps each issue's **description** a deliberately thin stub:
`Mirrored fusion <kind>`, the embedded `fusion-key:` line, and the source. That is
enough for the board to identify the issue and for a rebuild (`map --rebuild`) to find
it again; the authoritative brief stays in files.

If you want the full Circle brief visible on the board too, opt in — uncomment
`spec_comment` in `plane.config.yaml` and set it to `true`:

```yaml
spec_comment: true
```

Absent or `false` (the default), nothing changes. With it on, each **Circle** push
attaches the Circle record's full body as one Plane **comment**, refreshed on every
push and keyed on a hidden marker so a re-push updates that same comment instead of
piling up new ones. The split is deliberate: the description stays the thin mirror
stub, the full spec rides in the comment. The bridge only ever writes an issue's
name, description, and state — never comments — so the brief in the comment survives
every re-push untouched by the description path.

This applies to **seed-origin** stories too. A Circle seeded from an existing Plane
story keeps its own human-written description (fusion never rewrites it) and simply
gains the brief as a comment alongside it — the comment never overwrites the
description.

The comment write is **non-blocking**, the same doctrine as the kind label: if the
comments endpoint is unreachable or refuses the write, the push still lands the state
transition and says so in the `STATUS:` line. A failed comment never costs you the
state change, and it self-heals on the next push. It is a Circle-only feature —
fusion issues and decisions are unaffected.

## 4. Verify with `fusion-plane doctor`

Before the first real push, confirm everything resolves:

```bash
bin/fusion-plane doctor
```

`doctor` reports, non-silently:

- **key presence** — is `$PLANE_API_KEY` set and readable via `zsh -ic`;
- **config validity** — does `plane.config.yaml` parse and carry every required
  field;
- **`states/` reachability** — can the helper reach the project and resolve the
  configured state names to UUIDs.

When `doctor` is green the mirror is wired up. From then on the orchestrator pushes
at the state-change points it already owns (Circle activation, per-Turn when issues
or decisions changed, and Phase 4 closure); you never call `push` by hand for the
mirror to work.

## First run

### Getting the code

The bridge ships on `main`, so a plain update picks it up:

```bash
fusion --update
```

(The HTTPS installer fetches `heads/main`.) Then run `/fusion:setup` once in the
consuming project — it copies `plane.config.yaml` into the workbench. Setup is
idempotent and never clobbers a config you have already filled in, so re-running it
on an existing workbench is safe.

### Push on a throwaway Circle first

Before you rely on the mirror, put one push through a Circle you are willing to throw
away, and check the result on the board by hand. It takes about five minutes.

#### The procedure

**0. Dry run first — zero risk, nothing goes over the wire.**

```bash
bin/fusion-plane push --plan --circle <circle-dir>
```

This emits, as JSON, exactly the operations it *would* perform: one op per artifact,
each with its `kind` (`circle` / `fusion-issue` / `decision`), the target `state`, the
`label` that would be applied (by name — the dry run resolves no UUIDs because it makes
no call), the `write_scope` (`full` vs `state-only`), and the `writes` list — the precise
set of body fields the call will carry. `label` is reported separately from `writes`
because it is best-effort: it is dropped, with a printed note, if the live `labels/`
call cannot resolve or create it. If any of that looks wrong, stop here; nothing has
happened. The dry run needs no API key and makes no network call. It does need
`fusion-workbench/plane.config.yaml` to exist and parse — without it the helper exits
1 rather than planning against defaults.

"Nothing has happened" now covers the local files too. A dry run writes **nothing** —
not `.plane-map.json`, not even an empty one where none existed. That was briefly
untrue: the key migration described under "Repairing a map written before the key
changed" ran on the way in to every command, including this one, so a dry run rewrote
the map and on a map carrying legacy duplicates it destroyed a Plane UUID. The
migration is now a command of its own; reads only read.

That holds for every spelling of the dry run, because the one flag that could break it
is refused outright: `push --plan --rebuild-map` exits 2 with a usage error and does
nothing at all. A rebuild replaces the map, a dry run writes nothing, and the pair asks
for both — so neither is quietly performed and neither is quietly dropped.

Rebuilding the map is a separate command, `map --rebuild`, and it is deliberately **not**
part of this step: it reads your board and replaces your local map, so it belongs neither
under "nothing goes over the wire" nor before you have looked at what a push would do.
If you need a plan computed from a rebuilt map, that recipe is under "Repairing a map
written before the key changed" below. Planning *before* the rebuild would be the
misleading order anyway: the op list is computed from the map, so it would describe a
board the rebuild is about to change.

**1. Create a disposable Circle.** "Throwaway" means a Circle created only for this
check, whose Plane issues you delete afterwards, so no real work lands on the board.
The quickest way:

```bash
/fusion:direct "Plane bridge smoke test"
```

That writes an anticipated (`_a_`) Circle, which maps to **Backlog**. A fresh `_a_`
Circle has no issues or decisions yet, so it pushes as a single top-level Plane issue
with no children — fine for checks 1-4 below, but it will not exercise the sub-issue
path. Note also that *activating* a Circle makes the orchestrator push on its own; for
a pure check, leave it anticipated and push by hand.

**2. The real push.**

```bash
bin/fusion-plane push --circle <circle-dir>
```

Expect a final `STATUS:` line — `STATUS: ok (1 pushed)` on success, or
`STATUS: deferred (0 pushed, 1 deferred) — see …/.plane-outbox.jsonl` if something was
unreachable. The count is artifacts actually created or updated.

**3. Check five things on the Plane board.** This is the actual verification:

1. the issue exists, and its title matches the Circle's H1;
2. its state matches the fusion marker (`_a_` → Backlog, `_t_` → In Progress, `_c_`/`_b_`
   → Done);
3. children, if the Circle has any, are attached to it — as nested sub-issues, or as
   links (see below);
4. **the description is non-empty and contains the embedded natural key** — the line
   `fusion-key: <circle-directory-name>`;
5. it carries the right **kind label** — `circle` for the Circle record, `fusion-issue`
   and `decision` for its children (or whatever you renamed those to in the `labels:`
   block). If the label was missing on your board, fusion created it on this push.

Check 4 is *the* critical one. An empty description, or one missing the key, means
`description_html` is the wrong body field name on your instance. It is the single
failure that is otherwise completely silent: the push reports `ok`, the issue looks
plausible on the board, and you only discover the problem later when `map --rebuild`
cannot reconstruct the map — because rebuilding works by reading that embedded key back
out.

One exception to check 5: a Circle **seeded from an existing Plane story** carries no
kind label, deliberately. Such a story is yours, not fusion's, and fusion writes only
its state — never its title, description, or labels. See "Seeding is safe for your
existing stories" below.

**4. Idempotency check.** Run the same push again. No second issue may appear — the
existing one is only updated. Two observable signals: the live run reports
`STATUS: ok (0 pushed)`, and `push --plan --circle <circle-dir>` now emits `{"ops":[]}`,
an empty op list.

**5. Clean up.** Delete the test issues in Plane, then close or drop the throwaway
Circle. **Also remove its entries from `fusion-workbench/.plane-map.json`** — deleting
an issue in Plane does not prune the map, and the next push would try to PATCH a dead
UUID, get a 404, and defer.

```bash
bin/fusion-plane map --forget <circle-dir>
```

Run it once per stale entry. Circle sub-artifacts are keyed
`<circle-dir>::issues/<file>.md` and `<circle-dir>::decisions/<file>.md` — a
`bin/fusion-plane map` dump lists them all. Forgetting a key that is not in the map
reports `not found` and exits 1 rather than pretending to succeed, so a typo is
visible.

If you deleted several issues and would rather not name each one,
`bin/fusion-plane map --prune` drops every entry whose Plane issue returns a 404. It
needs the API key and a reachable Plane; on any inconclusive answer — no network, a
5xx, a rate limit — it deletes **nothing** and exits 10, so an outage can never cost
you map entries.

#### Repairing a map written before the key changed

fusion's natural key used to carry the record's state marker, which meant the key
changed on exactly the event a mirror exists to push. Maps written under that scheme
still work: every command folds them onto the marker-free keys **as it reads them**, so
lookups resolve and nothing is stranded. What no command does any more is fold them *on
disk* unless you asked it to.

```bash
bin/fusion-plane map --migrate
```

That is the one command whose whole job is the fold. Anything that already writes the
map — `map --forget`, `map --prune`, `map --rebuild`, a live `push` — folds it in
passing; `map`, `push --plan` and `plan` never do.

A map write can also fail to land: a read-only mount, a full disk, a workbench you no
longer have write access to. When the replacement fails, the command names the file on
stderr, prints **no** `STATUS: migrated` or `STATUS: forgotten` line, and exits 1. Take
that at face value — the map on disk is exactly as it was before, and the entry count a
successful run would have reported was never true. (`map --rebuild` reports the same
failure differently: it prints `STATUS: failed (0 rebuilt)` and exits 1, because every one
of its outcomes ends on a status line. Same fact, said rather than withheld.)

The split matters because the fold can cost you a UUID. The old scheme could record one
record **twice**, once per state it was pushed in, which means two Plane issues. Both
fold onto one key, so one of the two mappings is discarded — and a discarded UUID is not
recoverable from the map: it names a Plane issue that goes on existing on your board
with nothing pointing at it, for you to find and close by hand. Whenever a fold would
cost one, the helper prints the key and the UUID on stderr before anything is written.
Keep that line; it is the only handle you have on the stray issue.

#### Rebuilding the map from the board

If the map is lost or badly out of date, rebuild it from Plane itself:

```bash
bin/fusion-plane map --rebuild
```

That reads `GET issues/` once, reads the embedded `fusion-key:` back out of each issue
body, and replaces `.plane-map.json`. It writes **only** the map — it creates and updates
nothing on the board — but it is not free of the wire and it needs the API key. It acts on
the whole map and takes no key: `map --rebuild <some-key>` is refused as a usage error
rather than read as a request to rebuild that one entry.

It ends on one of three `STATUS:` lines, and **both failures leave the map exactly as it
was** — a rebuild from an answer you did not get would empty it:

| Line | Exit | What happened |
|---|---|---|
| `STATUS: rebuilt (<n> entries)` | 0 | The map was replaced from the board. |
| `STATUS: deferred (0 rebuilt) — …` | 10 | Plane could not be read: the API key is absent, the instance is unreachable, it answered with a non-2xx, or the answer was empty or would not parse. |
| `STATUS: failed (0 rebuilt) — …` | 1 | Something local: the config is missing or still unfilled, a `--fixture` path is not there, or the map could not be written (read-only mount, full disk). |

The split is the same one `map --prune` makes. A "we could not tell" answer from Plane is
deferred, never reported as your config being wrong, so a script that branches on the exit
code is sent to look at the right side of the wire.

To see what a push would do *after* a rebuild, run the two commands one after the other:

```bash
bin/fusion-plane map --rebuild
bin/fusion-plane plan --circle <circle-dir>
```

Two commands, deliberately not chained with `&&`. A rebuild that could not reach Plane
exits 10 having changed nothing, and `&&` would then skip the plan without a word —
leaving you looking at no output and no reason for it. Run the first, read what it
reports, then run the second. (`push --rebuild-map` performs the same rebuild and then
goes on to reconcile, which writes to the board. Use it when you want the push; use
`map --rebuild` when you want the map.)

`push --rebuild-map` stops if that rebuild fails, and pushes nothing. You reached for it
because the map is stale, and the reconcile reads exactly that map to decide per artifact
whether to update an existing Plane issue or create a new one — so running it on a map the
rebuild could not replace creates duplicates of issues already on your board. It exits with
the rebuild's own status, says on stderr that the reconcile did not run, and leaves both
the map and the board untouched. Fix what the rebuild reported, then run the push again.

A rebuild folds legacy keys the same way `map --migrate` does and, since it reads the
keys back out of Plane's own issue bodies, can meet the same duplicate pair there. It
keeps the UUID your map is already tracking, or failing that the most recently updated
issue, and prints every UUID it drops. Note that a rebuild **replaces** the map rather
than merging into it, so an entry it cannot see is gone: that means seed-origin bindings,
whose Plane issue is your own story and carries no `fusion-key:` line at all. Those are
printed too, each with the `seed --record-origin` command that restores it. Re-bind them,
or the next push may overwrite your story's title. An issue whose response carries no
`id` is skipped and named as well — nothing in the rebuilt map will point at it.

#### Why this is worth doing

`doctor` verifies the key, the config, and `states/` reachability — it does **not**
verify the issue create/update body, and it does not touch `labels/` at all. That body
uses Plane API v1 conventional fields (`name`, `description_html`, `state`, `parent`,
`labels`). They are standard, but they have not been confirmed against every
self-hosted build. So the first real push is the live check that `doctor` cannot do for
you.

The label path is the least-verified part: `GET labels/`, `POST labels/ {"name": …}`,
and `labels: [<uuid>]` in the issue body are the documented Plane v1 shapes, but they
have not been exercised against a live self-hosted instance. Check 5 above is what
confirms them for your build — and if the shape is wrong, the push still lands the
state and only the label is missing.

The sub-issue `parent` path is already safe either way: if an instance rejects or
ignores `parent`, the helper falls back to the verified `issues/{id}/links/` endpoint,
so the child still gets attached.

#### If a check fails

- **Empty description, or no `fusion-key:` line** → the body field name is wrong for
  this instance. Fix `build_write_body` in `bin/fusion-plane`.
- **Description looks right on the board but `map --rebuild` finds nothing** →
  no longer expected. Rebuild used to read only the plain `description` field while
  fusion writes `description_html`, so it found nothing on any instance that does not
  derive one from the other. It now reads `description_stripped`, then
  `description_html`, then `description`, taking the first that carries the key. If it
  still finds nothing, the key is genuinely not in the body — treat it as the
  empty-description case above.
- **Wrong or missing state** → run `bin/fusion-plane states`. It prints canonical →
  instance-name → UUID and marks anything it cannot resolve as `<unresolved>`; compare
  that against the `states:` names in `plane.config.yaml` and the actual state names on
  your board.
- **Children appear as links rather than nested sub-issues** → the `parent` fallback
  engaged. Expected behaviour on instances that ignore `parent`, not a failure.
- **No kind label on the issue** → check stderr and the `STATUS:` line from the push.
  A note naming the label and the reason means fusion could not resolve or create it
  and deliberately pushed without it. Silence there instead means the label was sent
  but your instance did not apply it — the `labels:` body field is wrong for this
  build. Either way the state transition already landed; only the label is missing.

### Seeding is safe for your existing stories

When a Circle was seeded from a Plane issue via `/fusion:seed-from-plane`, the mirror
writes **state only** back to that issue. It never rewrites the title or the
description, and it never adds a kind label — your original story is preserved as
written. Issues that fusion itself created keep the full mirrored body and the label.

This is not a convention you have to remember: an `origin` field in `.plane-map.json`
records who authored each issue, `push` branches on it, and tests cover the
distinction. `push --plan` also shows the write scope per issue (`state-only` vs
`full`) if you want to see it before anything goes over the wire.

### What "it worked" looks like

- `bin/fusion-plane doctor` reports green on all three checks.
- One push produces the expected Plane issues, in the right states, each carrying its
  kind label and the `fusion-key:` line in its description.
- A second push of the same Circle creates nothing new — it reports `0 pushed`.
- A push while Plane is unreachable writes a `.plane-outbox.jsonl` line and reports
  `deferred`, without blocking the Turn.

## Runtime files (no action needed)

`fusion-plane` writes two files at the workbench root, both gitignored with the rest
of `fusion-workbench/`:

- `.plane-map.json` — the natural-key → Plane-UUID map that makes pushes idempotent
  (a second push updates, never duplicates).
- `.plane-outbox.jsonl` — a human-readable record of any transition deferred during a
  Plane outage. It is drained once the affected Circle's next reconcile succeeds.
