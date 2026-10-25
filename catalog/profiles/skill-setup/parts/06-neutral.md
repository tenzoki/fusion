
## CRITICAL — Setup is the ONLY place a workbench is created

Setup is the single point where a fusion workbench is bootstrapped. The workbench lands at `./fusion-workbench/` relative to the directory `pwd` reports when this workflow runs. After setup completes, every subsequent fusion agent and hook locates the workbench by walking *upward* from its working directory until it finds the marker file `fusion-workbench/.fusion-setup` (written in Step 0 below). Without that marker, agents halt and hooks no-op — fusion does NOT bootstrap a workbench in any directory other than the one setup ran in.

This makes setup deliberately strict: run it once, at the project root you want fusion to govern. Run in a subfolder, it produces two independent fusion projects — one at the subfolder and one at the parent, if that had setup before. Walk up to the intended root first.

**Never** prepend `cd <something>` to the commands below. Run them as written, so the workbench lands at `./fusion-workbench/` relative to the directory the user invoked setup from.

## Step 0 — Confirm and create workspace

```bash
pwd
```

Note the path: the workbench is created here.

### Superseded-format check (CRITICAL — refuse, do not migrate)

