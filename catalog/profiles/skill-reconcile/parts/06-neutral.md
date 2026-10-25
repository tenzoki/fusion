
- `<brief text>` — the session brief, in the user's own words. It is what the state-auditor's two Brief edges are evaluated against.
- `--since <commit>` — the anchor the ground-truth walk starts from. Absent, this body reads the checkout's own reconcile mark; absent that too, the state-auditor falls back to the stamp on the work package this checkout claimed and says so.
- `--domain code|data` — overrides the detected domain.
- `--force` — dispatch even when nothing has moved since the last pass (Step 3).

## Step 1 — Workbench root

```bash
