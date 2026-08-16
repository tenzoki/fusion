The Circles bullet in CLAUDE.md ends a sentence with two full stops after the Plane-removal edit

---
`CLAUDE.md:72` reads *"…the first reason stands on its own and always did.. Empty or absent
`circles/` preserves single-Circle behaviour."* The doubled full stop is the seam left by `e8052e7`,
the curator's approved pass, which cut the Plane-mirror clause out of the middle of the sentence and
did not merge the two stops.

---

Cosmetic and one character wide. Recorded rather than fixed in passing because `CLAUDE.md` has
exactly one write path — the curator, at a user gate (`/fusion:cleanup --only claude-md`) — and a
reconciler may not write it.

Verified at HEAD `f77633f`: `grep -n 'always did\.\.' CLAUDE.md` returns line 72.

**Found by:** reconciler (supporting analyst pass), session
`shared/history/260815-2147-orchestrator-session.md`.
