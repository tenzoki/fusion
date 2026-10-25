"$FUSION_PLUGIN_ROOT/bin/fusion-work-order" <the user's arguments>; echo "exit=$?"
```

Pass the words the user gave after the command unchanged, each as its own argument, or none. Do not check or correct them: the helper is the only validator of what an argument means. Exit 0 is the only case that continues, whatever `verdict=` says. For every other, say one plain sentence and stop:

- **exit 2**: no fusion workbench above here. Run `/fusion:setup`.
- **exit 3**: the plugin itself could not run (compiled hooks or codec bundle missing, or an internal error), so nothing could be asked. Run `fusion --update`, then restart the session. Never report this as "no work packages".
- **exit 4**: the workbench was not read; quote the stderr line. A `legacy` workbench is migrated by `/fusion:migrate`. Never report this as "no work packages".
