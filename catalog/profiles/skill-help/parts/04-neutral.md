
**Read the source files this workflow points at; do not paste them whole.** Synthesize a focused answer in your own voice and cite file paths so the user can read the originals if they want.

If a question goes beyond what the docs cover, **say so** — do not invent.

**A path into a file the module ships carries the `$FUSION_SRC` root.** Every topic below sends you to a shipped doc, README or rule file; nothing the module ships exists at a consuming project's root, so a bare `docs/…` or `rules/…` path resolves to nothing there. Resolve the root once, before reading the first one:

```bash
