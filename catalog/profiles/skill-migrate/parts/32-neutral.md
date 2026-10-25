
## Guardrails

- **Never migrate without an explicit user choice.** The survey is read-only; nothing moves before Step 3's answer, and Step 7 changes nothing before its yes.
- **Never overwrite.** A destination that exists means the source stays and the collision is reported. Move only; never copy, never delete.
- **Never touch the root-anchored surfaces.** `orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/`, `.session-marker`, `.checkout-id`, `.cadence-anchors`, `.check-stamps`, `.asset-provenance`, `monitor`, `stilwerk/`, `.fusion-setup` stay where they are; their consumers read them at fixed root-relative paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).
- **Never rename inside `archive/`, `stashes/`, `.migration-v2-backup/` or `shared/backlog/`.** Frozen content keeps the names it was frozen with.
- **Never open a record in the rename pass.** It renames directories; no line inside any file is read for its state or rewritten, terminal or live (`rules/fusion-workbench-conventions.md` `## Terminal states are history`). Step 7 edits a record only through a repair the user said yes to.
