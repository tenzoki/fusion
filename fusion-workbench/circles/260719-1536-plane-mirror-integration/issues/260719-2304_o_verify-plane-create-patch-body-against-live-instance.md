Verify bin/fusion-plane's create/PATCH issue body against the live self-hosted Plane

---
The Plane bounded-bridge helper `bin/fusion-plane` (commit 982336f) makes three assumptions about the Plane REST API that MARTIN.md does NOT verify. MARTIN.md verified only the `states/` resolution, the `sequence_id`→UUID lookup, and the `issues/{id}/links/` body (`{url,title}`). These three must be checked against the live `plane.digitalleadership.com` before the mirror is relied on for real pushes.

---
Three unverified points (from the coder's Step 2-4 report):

1. **`states/` response envelope** — the helper handles both a bare array and `{results:[...]}` via `(.results // .)`. Confirm which the instance returns.
2. **create/PATCH issue body field names** — the helper uses Plane API v1 conventional fields `name`, `description_html`, `state` (UUID), `parent` (UUID). Standard but unverified. **If `description_html` is wrong, the embedded `fusion-key` never lands** and `push --rebuild-map` cannot reconstruct the map after a map loss. This is the highest-risk one.
3. **`parent` field for sub-issue attach (DR-1)** — the answered decision chose child sub-issues with a links fallback; the `parent` field on issue create is the unverified path. The helper verifies from the create response and falls back to `issues/{id}/links/` on mismatch, so this is already guarded — but confirm the primary path works.

Also minor: `doctor` returned rc=0 (not non-zero) when run outside a workbench (`/tmp` smoke). Verify doctor's exit codes are non-zero on real failure (key absent, config missing, states unreachable) so "never fail silently" holds at the exit-code level too.

**When:** Step 8 (tests) validates the pure core offline; this issue is the LIVE check, done at first real push / install (Step 7 `docs/plane-setup.md` + `fusion-plane doctor`). Resolve by running one real `push --circle <dir>` against the configured instance and confirming the issue is created with the embedded key readable back.

---
Reconciliation (2026-07-19, reconciler, domain=code): LEFT OPEN — verified this is the pre-live-Plane gap, not implementation debt. The offline core is complete and proven (`npm test` = 284/284; `bin/fusion-plane` commit `982336f`, tests `aefbf39`), and the plan deliberately scoped acceptance as offline dry-run (Testing §, agenda item 8). No live Plane instance was reachable this session, so the three unverified body assumptions (`states/` envelope, create/PATCH field names incl. `description_html`, the `parent` sub-issue field) and the doctor exit-code check remain to be confirmed against `plane.digitalleadership.com` at first real push / install. The DR-1 links fallback keeps the mirror safe even if the `parent` path fails. This open issue is the tracked reason the Circle's Artifact↔Directive coherence is "coherent with a noted live-verification follow-up" rather than fully closed on the live mirror (see the session `## Coherence`).
