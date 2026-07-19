# Plane setup — wiring the fusion work-queue mirror

fusion can mirror its work queue into a [Plane](https://plane.so) project: every
Circle, fusion issue, and decision appears as a Plane issue, labelled by kind and
kept in the matching state. The mirror is **push-only and idempotent** — files in
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

The key invariant: **there is no `api_key` / `token` / `secret` field in this file.**
A lint test fails the build if one appears.

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

Before you rely on the mirror, activate or pick a disposable Circle and let one push
land. Then look at the Plane board and check the issue appeared, carries the right
kind label, and sits in the state matching the fusion marker.

The reason is narrow and worth knowing: `doctor` verifies the key, the config, and
`states/` reachability — it does **not** verify the issue create/update body. That
body uses Plane API v1 conventional fields (`name`, `description_html`, `state`,
`parent`). They are standard, but they have not been confirmed against every
self-hosted build. If a field name is wrong on your instance, the symptom is a
missing or malformed issue body — and `push --rebuild-map` could not recover the map
afterwards, because it rebuilds by reading the natural key embedded in the
description. So the first real push is the live check that `doctor` can't do for you.

The sub-issue `parent` path is already safe either way: if an instance rejects or
ignores `parent`, the helper falls back to the verified `issues/{id}/links/` endpoint,
so the child still gets attached.

### Seeding is safe for your existing stories

When a Circle was seeded from a Plane issue via `/fusion:seed-from-plane`, the mirror
writes **state only** back to that issue. It never rewrites the title or the
description — your original story text is preserved as written. Issues that fusion
itself created keep the full mirrored body.

This is not a convention you have to remember: an `origin` field in `.plane-map.json`
records who authored each issue, `push` branches on it, and tests cover the
distinction. `push --plan` also shows the write scope per issue (`state-only` vs
`full`) if you want to see it before anything goes over the wire.

### What "it worked" looks like

- `bin/fusion-plane doctor` reports green on all three checks.
- One push produces the expected Plane issues, correctly labelled and stated.
- A second push of the same Circle creates nothing new — it updates in place.
- A push while Plane is unreachable writes a `.plane-outbox.jsonl` line and reports
  `deferred`, without blocking the Turn.

## Runtime files (no action needed)

`fusion-plane` writes two files at the workbench root, both gitignored with the rest
of `fusion-workbench/`:

- `.plane-map.json` — the natural-key → Plane-UUID map that makes pushes idempotent
  (a second push updates, never duplicates).
- `.plane-outbox.jsonl` — a human-readable record of any transition deferred during a
  Plane outage. It is drained once the affected Circle's next reconcile succeeds.
