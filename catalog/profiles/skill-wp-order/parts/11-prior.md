"$FUSION_PLUGIN_ROOT/bin/fusion-work-order" <the entry's arguments>; echo "exit=$?"
```

Pass the entry's arguments unchanged, each `{name, value}` rendered into the helper's argv as its declaration names it: `--format <value>` when the `--format` argument is given, and nothing when it is not. Do not check or correct them: the helper is the only validator of what an argument means. Exit 0 is the only case that continues, whatever `verdict=` says. For every other, say one plain sentence and stop:

- **exit 2**: no fusion workbench above here. Start the setup entry.
- **exit 3**: the bundle's runtime tree is broken (compiled hooks or codec bundle missing, or an internal error), so nothing could be asked. Report it as a defect of the installed bundle; there is no update command and no session restart on this host. Never report this as "no work packages".
- **exit 4**: the workbench was not read; quote the stderr line. A `legacy` workbench is migrated by the migrate entry. Never report this as "no work packages".
- **exit 1 with an argument given**: the user's argument is not one the helper takes. Quote its stderr usage line.
- **exit 1 with no argument**: a usage fault in this body. Report it as a fusion defect, never as the user's fault.
