**What the loop adds to the copy is the stamp**, the third input the `assets` selector of `/fusion:check` needs (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). `./fusion-workbench/.asset-provenance` holds one line per asset in the shape `shasum -a 256` prints: the checksum, two spaces, the asset's path relative to the workbench. Only a file this run actually copied is stamped here; a file that was already present is deliberately left unstamped.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, report it and do not block Setup.
