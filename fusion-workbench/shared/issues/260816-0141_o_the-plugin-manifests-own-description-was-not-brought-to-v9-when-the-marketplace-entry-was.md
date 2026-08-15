The plugin manifest's own description was not brought to v9 when the marketplace entry was

---
`25af51d` rewrote the marketplace entry a user reads before installing so it describes v9. The four version surfaces are coherent — `marketplace.json` 9.0.0, `.claude-plugin/plugin.json` 9.0.0, `install.sh` and `README.md` both pinning `tags/v9.0.0`, and the tag exists. But `.claude-plugin/plugin.json`'s own `description` was not touched: it still reads *"Project-agnostic specialized agents (3 parameterised by domain — code/data) with a compliance guard, decision-record tracking, a real-time browser-based monitor…"* — no agent count, no curator, and no mention of what v9 removed. Two shipped descriptions of the same plugin now say different things, and only one was updated.

---

## Verified at `3a0408a`

`.claude-plugin/plugin.json`:

```json
"description": "Multi-domain AI agent orchestration framework. Project-agnostic specialized agents (3 parameterised by domain — code/data) with a compliance guard, decision-record tracking, a real-time browser-based monitor with session-scoped ETA estimation. /fusion:help inside Claude Code for self-explainer."
```

Nothing in it is **false**: fifteen agents exist (`ls agents/*.md` = 15), three are domain-parameterised (`taskplanner`, `reconciler`, `playmaker`, per `README-agents.md:57-59` and CLAUDE.md), the guard and the monitor are as described. It is incomplete rather than wrong, which is why this is Low.

## Why it is worth a line anyway

`plugin.json` is the description Claude Code shows for a plugin loaded with `--plugin-dir` — the development and `install.sh` path, which CLAUDE.md calls the recommended end-user route. The marketplace entry is the description shown on the marketplace path. So the surface that was updated is the one fewer users see.

CLAUDE.md's release process names four version surfaces to keep coherent and does not name the two *descriptions*. That is the reason they drifted, and it is the more durable half of the fix.

## Fix direction

1. Bring `.claude-plugin/plugin.json`'s `description` in line with the marketplace entry — agent count, curator, and whatever the marketplace copy now says about v9.
2. Add a line to CLAUDE.md `## Release process` naming the two descriptions as a pair that moves together, beside the four version surfaces. Roughly one sentence; the release section is not on a bounded surface.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commit `25af51d`), via a supporting analyst pass; re-verified by reading `.claude-plugin/plugin.json` and the marketplace clone at `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`.
