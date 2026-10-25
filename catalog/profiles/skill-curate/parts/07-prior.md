"$FUSION_PLUGIN_ROOT/bin/fusion-paths" curate
```

Hold the emitted values (`WORKBENCH`, `OUT_ANALYSIS`) for the whole run. `WORKBENCH` is absolute; every other value is workbench-relative. Never guess a path when the resolver fails — read the exit code, it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above the project root. Halt: the setup entry must run once at the project root. Do NOT bootstrap a workbench from here — setup is the single point of workbench creation.
