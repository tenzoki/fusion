
Like `config` and `permissions`, the write lands at the project root: `./.gitattributes` in the directory `pwd` reports, outside `fusion-workbench/` and never in a subfolder. **This selector asks the user nothing**, which is what keeps `permissions` the only one that asks on a normal run.
