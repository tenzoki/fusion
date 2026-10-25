
Then the stores, in this order before the marker:

```bash
mkdir -p ./fusion-workbench/work-packages ./fusion-workbench/shared/plans ./fusion-workbench/shared/issues ./fusion-workbench/shared/decisions ./fusion-workbench/shared/analyses ./fusion-workbench/shared/reviews ./fusion-workbench/shared/investigations ./fusion-workbench/shared/consultations ./fusion-workbench/shared/history ./fusion-workbench/shared/memos ./fusion-workbench/archive ./fusion-workbench/.guard-state
```

This is the layout defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, which enumerates every store and every root-anchored surface. Two facts about it are Setup's own:

- **`work-packages/` is created empty, and Setup creates nothing inside it.** A work package's container and its own stores come into existence when the package is filed and when its first artefact is written; Setup has no item to create one for.
- **Of the root-anchored surfaces, only `.guard-state/` is pre-created above.** The rest appear when their consumer first writes them, at the fixed root-relative paths the layout names; never create one anywhere else, because no consumer has a fallback path.

Write the setup marker — the file every agent and hook looks for to confirm fusion is set up here — and read which periodic checks are due. The marker is rewritten only when its content would change; `rules/workbench-tracking.md` `## The setup marker is written on change, not on every run` says why that matters.

```bash
M=./fusion-workbench/.fusion-setup
