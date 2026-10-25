## Why this skill does not call `bin/fusion-paths`

Every other skill resolves its write targets through `bin/fusion-paths <own-name>`, and a store-directory literal is otherwise forbidden in a skill body; this skill's carve-out is recorded with the setup entry's in `rules/fusion-workbench-conventions.md` `## Path Resolution`. It names every layout literally because its subject is the transition between them, which is exactly what the resolver's answers do not describe. All three reasons are authored in `rules/workbench-path-resolution.md` `### The one consumer that names the layout literally`.

The workbench anchor still comes from a helper — `bin/fusion-workbench-root`, the same primitive `fusion-paths` itself delegates to. Only the store paths below are literal.
